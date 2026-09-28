"""
Constraint Satisfaction Problem (CSP) Solver for Crop Rotation Planning.
Uses recursive backtracking search with forward checking and constraint propagation.
Eliminates rotations with repeated crop families, water overruns, cost overruns,
or soil incompatibility.
"""

from typing import List, Dict, Any, Optional, Set
from backend.knowledge_base import CROPS, get_crops_for_soil


class CropRotationCSP:
    """
    CSP formulation for multi-season crop rotation:
    - Variables: S_1, S_2, ..., S_N (Season slots)
    - Domains: Available crops suitable for the plot's soil type
    - Constraints:
        1. No consecutive crops from the same botanical family.
        2. Cumulative water usage across all seasons <= Total water budget.
        3. Cumulative cultivation cost * land_size <= Total cost budget.
        4. All selected crops must be agronomically suitable for the farmer's soil type.
        5. Exclude quarantined families (e.g., following a pest outbreak).
    """

    def __init__(
        self,
        land_size_acres: float,
        soil_type: str,
        water_budget_mm: float,
        cost_budget: float,
        seasons_count: int,
        quarantined_families: Optional[Set[str]] = None,
        fixed_prefix: Optional[List[Dict[str, Any]]] = None
    ):
        self.land_size = max(0.1, float(land_size_acres))
        self.soil_type = soil_type
        self.water_budget = float(water_budget_mm)
        self.cost_budget = float(cost_budget)
        self.seasons_count = int(seasons_count)
        self.quarantined_families = quarantined_families or set()
        self.fixed_prefix = fixed_prefix or []

        # Initial domain filtering based on soil suitability and quarantine
        all_soil_crops = get_crops_for_soil(self.soil_type)
        self.domain = [
            c for c in all_soil_crops
            if c["family"] not in self.quarantined_families
        ]

        # Statistics for explainability and diagnostics
        self.nodes_explored = 0
        self.pruned_family_conflicts = 0
        self.pruned_water_overruns = 0
        self.pruned_cost_overruns = 0

    def solve(self, max_solutions: int = 150) -> List[List[Dict[str, Any]]]:
        """
        Execute CSP backtracking search to find all valid rotation sequences
        up to max_solutions.
        """
        solutions: List[List[Dict[str, Any]]] = []
        self.nodes_explored = 0
        self.pruned_family_conflicts = 0
        self.pruned_water_overruns = 0
        self.pruned_cost_overruns = 0

        # Calculate budget consumed by any already fixed prefix (e.g. during replanning)
        prefix_water = sum(c["water_req_mm"] for c in self.fixed_prefix)
        prefix_cost = sum(c["cost_per_acre"] * self.land_size for c in self.fixed_prefix)

        current_assignment = list(self.fixed_prefix)

        self._backtrack(
            current_assignment=current_assignment,
            current_water=prefix_water,
            current_cost=prefix_cost,
            solutions=solutions,
            max_solutions=max_solutions
        )

        return solutions

    def _backtrack(
        self,
        current_assignment: List[Dict[str, Any]],
        current_water: float,
        current_cost: float,
        solutions: List[List[Dict[str, Any]]],
        max_solutions: int
    ) -> None:
        """Recursive backtracking with forward checking."""
        if len(solutions) >= max_solutions:
            return

        # Base case: All seasons successfully assigned
        if len(current_assignment) == self.seasons_count:
            # Complete rotation satisfies all constraints
            solutions.append(list(current_assignment))
            return

        self.nodes_explored += 1
        previous_crop = current_assignment[-1] if current_assignment else None

        for candidate in self.domain:
            # 1. Constraint: No consecutive identical families
            if previous_crop and candidate["family"] == previous_crop["family"]:
                self.pruned_family_conflicts += 1
                continue

            # 2. Constraint: Cumulative water budget
            new_water = current_water + candidate["water_req_mm"]
            if new_water > self.water_budget:
                self.pruned_water_overruns += 1
                continue

            # 3. Constraint: Cumulative cost budget
            candidate_total_cost = candidate["cost_per_acre"] * self.land_size
            new_cost = current_cost + candidate_total_cost
            if new_cost > self.cost_budget:
                self.pruned_cost_overruns += 1
                continue

            # Forward check: Is it possible to complete the remaining seasons
            # within remaining water and cost limits?
            seasons_left = self.seasons_count - (len(current_assignment) + 1)
            if seasons_left > 0:
                min_water_crop = min(c["water_req_mm"] for c in self.domain)
                min_cost_crop = min(c["cost_per_acre"] * self.land_size for c in self.domain)
                if (new_water + (seasons_left * min_water_crop)) > self.water_budget:
                    self.pruned_water_overruns += 1
                    continue
                if (new_cost + (seasons_left * min_cost_crop)) > self.cost_budget:
                    self.pruned_cost_overruns += 1
                    continue

            # Assign candidate crop
            current_assignment.append(candidate)

            # Recurse
            self._backtrack(
                current_assignment=current_assignment,
                current_water=new_water,
                current_cost=new_cost,
                solutions=solutions,
                max_solutions=max_solutions
            )

            # Backtrack (unassign)
            current_assignment.pop()

    def get_search_stats(self) -> Dict[str, Any]:
        """Return diagnostic metrics of the CSP search process."""
        return {
            "nodes_explored": self.nodes_explored,
            "pruned_family_conflicts": self.pruned_family_conflicts,
            "pruned_water_overruns": self.pruned_water_overruns,
            "pruned_cost_overruns": self.pruned_cost_overruns,
            "domain_size": len(self.domain)
        }
