"""
Heuristic Scoring Engine for Crop Rotation Sequences.
Implements informed search / utility-based agent evaluation.
Scores valid rotations on economic yield, soil health gain (nitrogen balance),
resource efficiency, and botanical diversity.
"""

from typing import List, Dict, Any


class HeuristicScorer:
    """
    Evaluates and ranks valid CSP rotation sequences using multi-attribute utility theory.
    """

    def __init__(
        self,
        land_size_acres: float,
        water_budget_mm: float,
        cost_budget: float,
        initial_soil_health: float = 65.0,
        weights: Dict[str, float] = None
    ):
        self.land_size = max(0.1, float(land_size_acres))
        self.water_budget = float(water_budget_mm)
        self.cost_budget = float(cost_budget)
        self.initial_soil_health = float(initial_soil_health)

        # Default heuristic weights (sum = 1.0)
        self.weights = weights or {
            "profit": 0.38,
            "soil_health": 0.34,
            "resource_efficiency": 0.16,
            "diversity_synergy": 0.12
        }

    def evaluate_rotation(self, sequence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute comprehensive agronomic and economic metrics for a candidate rotation.
        """
        seasons_count = len(sequence)
        total_water = sum(c["water_req_mm"] for c in sequence)
        total_cost = sum(c["cost_per_acre"] * self.land_size for c in sequence)

        # Economic computations
        season_revenues = []
        season_profits = []
        for c in sequence:
            rev = c["yield_per_acre_quintals"] * c["market_price_per_quintal"] * self.land_size
            cost = c["cost_per_acre"] * self.land_size
            profit = rev - cost
            season_revenues.append(rev)
            season_profits.append(profit)

        total_revenue = sum(season_revenues)
        total_profit = sum(season_profits)
        roi_percentage = (total_profit / total_cost * 100.0) if total_cost > 0 else 0.0

        # Soil health & agronomic computations
        total_nitrogen_delta = sum(c["nitrogen_effect_kg_ha"] for c in sequence)
        total_soil_delta = sum(c["soil_health_delta"] for c in sequence)

        # Synergy bonus: Legume directly preceding or succeeding a heavy feeder
        synergy_bonus = 0
        for i in range(len(sequence) - 1):
            curr_fam = sequence[i]["family"]
            next_fam = sequence[i + 1]["family"]
            # Legume followed by heavy cereal
            if curr_fam == "Fabaceae" and next_fam in ("Poaceae", "Solanaceae"):
                synergy_bonus += 8
            # Heavy feeder followed by legume restorative
            elif curr_fam in ("Poaceae", "Solanaceae") and next_fam == "Fabaceae":
                synergy_bonus += 10
            # Biofumigant mustard before root-nematode prone Solanaceae
            elif curr_fam == "Brassicaceae" and next_fam == "Solanaceae":
                synergy_bonus += 12

        # Family diversity: count unique families
        unique_families = len(set(c["family"] for c in sequence))
        diversity_ratio = unique_families / seasons_count

        # Final predicted soil health clamped between 10 and 100
        projected_soil_health = max(10.0, min(100.0, self.initial_soil_health + total_soil_delta))

        # Water cushion: water remaining as a buffer against droughts
        water_remaining = max(0.0, self.water_budget - total_water)
        water_efficiency = (total_revenue / total_water) if total_water > 0 else 0.0

        return {
            "sequence": sequence,
            "crop_names": [c["name"] for c in sequence],
            "families": [c["family"] for c in sequence],
            "total_water_mm": round(total_water, 1),
            "water_remaining_mm": round(water_remaining, 1),
            "total_cost": round(total_cost, 2),
            "cost_remaining": round(max(0.0, self.cost_budget - total_cost), 2),
            "total_revenue": round(total_revenue, 2),
            "total_profit": round(total_profit, 2),
            "roi_percentage": round(roi_percentage, 1),
            "total_nitrogen_delta_kg_ha": round(total_nitrogen_delta, 1),
            "total_soil_delta": round(total_soil_delta, 1),
            "projected_soil_health": round(projected_soil_health, 1),
            "synergy_bonus": synergy_bonus,
            "unique_families_count": unique_families,
            "diversity_ratio": round(diversity_ratio, 2),
            "water_efficiency": round(water_efficiency, 2),
            "season_breakdown": [
                {
                    "season_index": idx + 1,
                    "crop_id": c["id"],
                    "crop_name": c["name"],
                    "family": c["family"],
                    "water_mm": c["water_req_mm"],
                    "cost": round(c["cost_per_acre"] * self.land_size, 2),
                    "revenue": round(season_revenues[idx], 2),
                    "profit": round(season_profits[idx], 2),
                    "nitrogen_effect_kg_ha": c["nitrogen_effect_kg_ha"],
                    "soil_health_delta": c["soil_health_delta"],
                    "duration_days": c["duration_days"]
                }
                for idx, c in enumerate(sequence)
            ]
        }

    def score_all(self, solutions: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """
        Evaluate all candidate rotations, normalize features across the solution set,
        compute composite heuristic utility score (0-100), and return sorted descending.
        """
        if not solutions:
            return []

        evaluated = [self.evaluate_rotation(s) for s in solutions]

        # Extract min/max for normalization
        profits = [e["total_profit"] for e in evaluated]
        soil_deltas = [e["total_soil_delta"] for e in evaluated]
        rois = [e["roi_percentage"] for e in evaluated]
        water_buffers = [e["water_remaining_mm"] for e in evaluated]

        min_p, max_p = min(profits), max(profits)
        min_s, max_s = min(soil_deltas), max(soil_deltas)
        min_roi, max_roi = min(rois), max(rois)
        min_wb, max_wb = min(water_buffers), max(water_buffers)

        for item in evaluated:
            # 1. Profit subscore (0 to 100)
            norm_profit = ((item["total_profit"] - min_p) / (max_p - min_p) * 100.0) if max_p > min_p else 75.0

            # 2. Soil health subscore (0 to 100)
            norm_soil = ((item["total_soil_delta"] - min_s) / (max_s - min_s) * 100.0) if max_s > min_s else 75.0

            # 3. Efficiency subscore (ROI + water buffer safety)
            norm_roi = ((item["roi_percentage"] - min_roi) / (max_roi - min_roi) * 100.0) if max_roi > min_roi else 70.0
            norm_water = ((item["water_remaining_mm"] - min_wb) / (max_wb - min_wb) * 100.0) if max_wb > min_wb else 70.0
            norm_efficiency = 0.6 * norm_roi + 0.4 * norm_water

            # 4. Diversity and synergy score (0 to 100)
            raw_synergy = (item["diversity_ratio"] * 60.0) + min(40.0, item["synergy_bonus"] * 2.5)
            norm_synergy = min(100.0, raw_synergy)

            # Composite heuristic score
            composite = (
                self.weights["profit"] * norm_profit +
                self.weights["soil_health"] * norm_soil +
                self.weights["resource_efficiency"] * norm_efficiency +
                self.weights["diversity_synergy"] * norm_synergy
            )

            item["subscores"] = {
                "profit_score": round(norm_profit, 1),
                "soil_health_score": round(norm_soil, 1),
                "efficiency_score": round(norm_efficiency, 1),
                "diversity_synergy_score": round(norm_synergy, 1)
            }
            item["heuristic_score"] = round(composite, 1)

        # Sort descending by composite heuristic score
        evaluated.sort(key=lambda x: x["heuristic_score"], reverse=True)
        return evaluated
