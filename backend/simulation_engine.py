"""
Simulation and Dynamic Replanning Engine for Crop Rotation.
Manages season-by-season execution state, dynamic soil health updates,
drought and pest disruption events, and closed-loop automatic CSP replanning.
"""

from typing import Dict, Any, List, Optional, Set
import copy

from backend.knowledge_base import CROPS
from backend.csp_solver import CropRotationCSP
from backend.heuristic_scorer import HeuristicScorer
from backend.explainability import ExplainabilityEngine


class RotationSimulationSession:
    """
    Stateful manager for multi-season rotation execution and replanning.
    """

    def __init__(
        self,
        land_size_acres: float,
        soil_type: str,
        water_budget_mm: float,
        cost_budget: float,
        seasons_count: int,
        initial_soil_health: float = 65.0
    ):
        self.land_size = max(0.1, float(land_size_acres))
        self.soil_type = soil_type
        self.initial_water_budget = float(water_budget_mm)
        self.water_budget = float(water_budget_mm)
        self.initial_cost_budget = float(cost_budget)
        self.cost_budget = float(cost_budget)
        self.seasons_count = int(seasons_count)
        self.initial_soil_health = float(initial_soil_health)

        # Dynamic state
        self.current_season_idx = 0  # 0-indexed: currently executing season
        self.current_soil_health = float(initial_soil_health)
        self.cumulative_yield_quintals = 0.0
        self.cumulative_revenue = 0.0
        self.cumulative_cost = 0.0
        self.cumulative_profit = 0.0
        self.cumulative_water_used = 0.0

        self.quarantined_families: Set[str] = set()

        # Plan states
        self.original_plan: Optional[Dict[str, Any]] = None
        self.active_plan: Optional[Dict[str, Any]] = None
        self.alternative_plans: List[Dict[str, Any]] = []

        # History and logs
        self.season_history: List[Dict[str, Any]] = []
        self.replanning_logs: List[Dict[str, Any]] = []
        self.soil_health_trajectory: List[float] = [float(initial_soil_health)]

        # Initial plan generation
        self._generate_initial_plan()

    def _generate_initial_plan(self) -> None:
        """Run CSP solver and heuristic scorer to establish the baseline rotation plan."""
        csp = CropRotationCSP(
            land_size_acres=self.land_size,
            soil_type=self.soil_type,
            water_budget_mm=self.water_budget,
            cost_budget=self.cost_budget,
            seasons_count=self.seasons_count,
            quarantined_families=self.quarantined_families
        )
        solutions = csp.solve(max_solutions=150)

        if not solutions:
            raise ValueError(
                f"No valid rotation plan found for {self.soil_type} soil with "
                f"{self.water_budget} mm water and ₹{self.cost_budget:,.0f} budget across {self.seasons_count} seasons."
            )

        scorer = HeuristicScorer(
            land_size_acres=self.land_size,
            water_budget_mm=self.water_budget,
            cost_budget=self.cost_budget,
            initial_soil_health=self.initial_soil_health
        )
        ranked = scorer.score_all(solutions)

        self.active_plan = copy.deepcopy(ranked[0])
        self.original_plan = copy.deepcopy(ranked[0])
        self.alternative_plans = ranked[1:6]  # keep top 5 alternatives

        # Enrich active plan with explanations
        self._enrich_plan_explanations(self.active_plan)

    def _enrich_plan_explanations(self, plan: Dict[str, Any]) -> None:
        """Add agronomic and rejection explanations to each season slot in the plan."""
        sequence = plan["sequence"]
        explanations = []
        for i, crop in enumerate(sequence):
            prev_crop = sequence[i - 1] if i > 0 else None
            rem_water = self.water_budget - sum(c["water_req_mm"] for c in sequence[:i])
            rem_cost = (self.cost_budget - sum(c["cost_per_acre"] * self.land_size for c in sequence[:i])) / self.land_size

            rec_exp = ExplainabilityEngine.explain_season_recommendation(
                current_crop=crop,
                previous_crop=prev_crop,
                season_index=i + 1,
                total_seasons=self.seasons_count,
                soil_type=self.soil_type
            )

            rej_exp = ExplainabilityEngine.explain_rejected_alternatives(
                selected_crop=crop,
                previous_crop=prev_crop,
                remaining_water=rem_water,
                remaining_cost_per_acre=rem_cost,
                soil_type=self.soil_type,
                quarantined_families=self.quarantined_families
            )

            explanations.append({
                "recommendation": rec_exp,
                "rejections": rej_exp
            })

        plan["explanations"] = explanations

    def simulate_season(self, disruption_event: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Advance simulation by one season.
        Optionally injects a disruption event (drought or pest_outbreak) and handles replanning.
        """
        if self.is_completed():
            return {"status": "completed", "message": "Simulation already completed."}

        season_num = self.current_season_idx + 1
        current_crop = self.active_plan["sequence"][self.current_season_idx]

        # Calculate nominal metrics
        water_used = current_crop["water_req_mm"]
        cost = current_crop["cost_per_acre"] * self.land_size
        yield_val = current_crop["yield_per_acre_quintals"] * self.land_size
        market_price = current_crop["market_price_per_quintal"]
        revenue = yield_val * market_price
        soil_delta = current_crop["soil_health_delta"]
        n_delta = current_crop["nitrogen_effect_kg_ha"]

        disruption_report = None
        replan_occurred = False

        # Apply disruption event if present
        if disruption_event:
            event_type = disruption_event.get("type")
            if event_type == "drought":
                # Drought reduces yield of current crop if low drought tolerance,
                # and severely cuts remaining water budget
                deficit_pct = disruption_event.get("deficit_pct", 45)
                yield_loss_pct = 35 if current_crop["drought_tolerance"] in ("Low", "Medium") else 10
                yield_val *= (1.0 - yield_loss_pct / 100.0)
                revenue = yield_val * market_price

                # Cut total water budget available for remaining seasons
                unspent_water = max(0.0, self.water_budget - self.cumulative_water_used - water_used)
                water_reduction = unspent_water * (deficit_pct / 100.0)
                self.water_budget -= water_reduction

                disruption_report = {
                    "type": "drought",
                    "severity": f"{deficit_pct}% rainfall deficit",
                    "yield_impact": f"-{yield_loss_pct}% on current harvest",
                    "water_reduction_mm": round(water_reduction, 1),
                    "message": f"Drought hit in Season {season_num}! Water reserves reduced by {water_reduction:.1f} mm."
                }

            elif event_type == "pest_outbreak":
                # Pest outbreak in current crop's family
                affected_family = current_crop["family"]
                yield_loss_pct = 40
                yield_val *= (1.0 - yield_loss_pct / 100.0)
                revenue = yield_val * market_price
                soil_delta -= 4  # pest burden damages biological health

                # Quarantine this family for remaining seasons
                self.quarantined_families.add(affected_family)
                disruption_event["affected_family"] = affected_family

                disruption_report = {
                    "type": "pest_outbreak",
                    "affected_family": affected_family,
                    "yield_impact": f"-{yield_loss_pct}% yield loss due to {affected_family} pest swarm",
                    "quarantine": f"Quarantined family '{affected_family}' from upcoming seasons",
                    "message": f"Severe pest outbreak attacked {affected_family} in Season {season_num}!"
                }

        # Update dynamic state
        soil_before = self.current_soil_health
        self.current_soil_health = max(10.0, min(100.0, self.current_soil_health + soil_delta))
        self.soil_health_trajectory.append(round(self.current_soil_health, 1))

        profit = revenue - cost
        self.cumulative_water_used += water_used
        self.cumulative_cost += cost
        self.cumulative_yield_quintals += yield_val
        self.cumulative_revenue += revenue
        self.cumulative_profit += profit

        season_record = {
            "season_number": season_num,
            "crop": current_crop,
            "soil_health_before": round(soil_before, 1),
            "soil_health_after": round(self.current_soil_health, 1),
            "soil_delta": soil_delta,
            "nitrogen_delta_kg_ha": n_delta,
            "water_used_mm": water_used,
            "cost": round(cost, 2),
            "yield_quintals": round(yield_val, 2),
            "revenue": round(revenue, 2),
            "profit": round(profit, 2),
            "disruption": disruption_report
        }
        self.season_history.append(season_record)

        self.current_season_idx += 1

        # Check if replanning / disruption logging is needed
        if disruption_event:
            if not self.is_completed():
                replan_result = self._replan_remaining_seasons(disruption_event, season_num)
                replan_occurred = replan_result.get("success", False)
                season_record["replan_details"] = replan_result
            else:
                # Disruption occurred in the final season
                disruption_event["is_final_season"] = True
                replan_explanation = ExplainabilityEngine.explain_replanning_event(
                    event_type=disruption_event.get("type", "unknown"),
                    season_index=season_num,
                    original_crop=current_crop,
                    new_crop=current_crop,
                    context=disruption_event
                )
                log_entry = {
                    "at_season": season_num,
                    "event": disruption_event.get("type"),
                    "old_remaining": [current_crop["name"]],
                    "new_remaining": [current_crop["name"] + " (Final Season Harvested)"],
                    "explanation": replan_explanation
                }
                self.replanning_logs.append(log_entry)
                replan_occurred = True
                season_record["replan_details"] = {"success": True, "log": log_entry}

        return {
            "status": "in_progress" if not self.is_completed() else "completed",
            "season_record": season_record,
            "replan_occurred": replan_occurred,
            "current_state": self.get_current_state()
        }

    def _replan_remaining_seasons(self, disruption_event: Dict[str, Any], season_num: int) -> Dict[str, Any]:
        """
        Re-solve CSP for uncultivated seasons S_{current_season_idx ... N}
        with updated water budget, quarantined families, and current soil health.
        """
        completed_crops = [r["crop"] for r in self.season_history]

        try:
            csp = CropRotationCSP(
                land_size_acres=self.land_size,
                soil_type=self.soil_type,
                water_budget_mm=self.water_budget,
                cost_budget=self.cost_budget,
                seasons_count=self.seasons_count,
                quarantined_families=self.quarantined_families,
                fixed_prefix=completed_crops
            )
            solutions = csp.solve(max_solutions=100)

            if not solutions:
                # If budget is too tight due to drought, relax water budget slightly to allow survival crops
                csp.water_budget += 100
                solutions = csp.solve(max_solutions=50)

            if solutions:
                scorer = HeuristicScorer(
                    land_size_acres=self.land_size,
                    water_budget_mm=self.water_budget,
                    cost_budget=self.cost_budget,
                    initial_soil_health=self.current_soil_health
                )
                ranked = scorer.score_all(solutions)
                new_best = ranked[0]

                # Identify changes between old active plan and new replanned plan
                old_remaining = [c["name"] for c in self.active_plan["sequence"][self.current_season_idx:]]
                new_remaining = [c["name"] for c in new_best["sequence"][self.current_season_idx:]]

                # Generate explainability rationale for replanning
                replan_explanation = ExplainabilityEngine.explain_replanning_event(
                    event_type=disruption_event.get("type", "unknown"),
                    season_index=season_num,
                    original_crop=self.active_plan["sequence"][self.current_season_idx] if self.current_season_idx < len(self.active_plan["sequence"]) else new_best["sequence"][-1],
                    new_crop=new_best["sequence"][self.current_season_idx] if self.current_season_idx < len(new_best["sequence"]) else new_best["sequence"][-1],
                    context=disruption_event
                )

                self.active_plan = new_best
                self._enrich_plan_explanations(self.active_plan)

                log_entry = {
                    "at_season": season_num,
                    "event": disruption_event.get("type"),
                    "old_remaining": old_remaining,
                    "new_remaining": new_remaining,
                    "explanation": replan_explanation
                }
                self.replanning_logs.append(log_entry)

                return {
                    "success": True,
                    "log": log_entry,
                    "new_plan": self.active_plan
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

        return {
            "success": False,
            "error": "No viable alternative found under current constraints."
        }

    def simulate_all_remaining(self, disruptions: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Run all remaining seasons sequentially to completion."""
        results = []
        disruptions_map = {d["season"]: d for d in (disruptions or [])}

        while not self.is_completed():
            season_target = self.current_season_idx + 1
            disruption = disruptions_map.get(season_target)
            step_res = self.simulate_season(disruption_event=disruption)
            results.append(step_res)

        return results

    def is_completed(self) -> bool:
        """Check if all planned seasons have finished."""
        return self.current_season_idx >= self.seasons_count

    def get_current_state(self) -> Dict[str, Any]:
        """Serialize current simulation progress and totals."""
        return {
            "land_size_acres": self.land_size,
            "soil_type": self.soil_type,
            "initial_water_budget": self.initial_water_budget,
            "current_water_budget": round(self.water_budget, 1),
            "initial_cost_budget": self.initial_cost_budget,
            "total_seasons": self.seasons_count,
            "current_season_index": self.current_season_idx,
            "is_completed": self.is_completed(),
            "current_soil_health": round(self.current_soil_health, 1),
            "soil_health_trajectory": self.soil_health_trajectory,
            "cumulative_yield_quintals": round(self.cumulative_yield_quintals, 2),
            "cumulative_revenue": round(self.cumulative_revenue, 2),
            "cumulative_cost": round(self.cumulative_cost, 2),
            "cumulative_profit": round(self.cumulative_profit, 2),
            "cumulative_water_used_mm": round(self.cumulative_water_used, 1),
            "water_remaining_mm": round(max(0.0, self.water_budget - self.cumulative_water_used), 1),
            "budget_remaining": round(max(0.0, self.cost_budget - self.cumulative_cost), 2),
            "quarantined_families": list(self.quarantined_families),
            "active_plan": self.active_plan,
            "original_plan": self.original_plan,
            "history": self.season_history,
            "replanning_logs": self.replanning_logs
        }
