"""
Unit tests for Crop Rotation CSP Solver, Heuristic Scorer, and Replanning Engine.
"""

import unittest
from backend.csp_solver import CropRotationCSP
from backend.heuristic_scorer import HeuristicScorer
from backend.simulation_engine import RotationSimulationSession
from backend.knowledge_base import CROPS, SOIL_TYPES


class TestCropRotationCSP(unittest.TestCase):

    def test_no_consecutive_families(self):
        """Verify that every generated rotation has no two adjacent crops from the same family."""
        csp = CropRotationCSP(
            land_size_acres=2.0,
            soil_type="Loamy",
            water_budget_mm=1600,
            cost_budget=120000,
            seasons_count=4
        )
        solutions = csp.solve(max_solutions=50)
        self.assertGreater(len(solutions), 0, "Should find valid solutions for standard inputs")

        for sol in solutions:
            self.assertEqual(len(sol), 4)
            for i in range(len(sol) - 1):
                fam_curr = sol[i]["family"]
                fam_next = sol[i + 1]["family"]
                self.assertNotEqual(
                    fam_curr, fam_next,
                    f"Consecutive crops cannot share family: {sol[i]['name']} ({fam_curr}) followed by {sol[i+1]['name']} ({fam_next})"
                )

    def test_water_and_cost_constraints(self):
        """Verify that cumulative water and cost never exceed the budget ceilings."""
        land_size = 2.0
        water_limit = 1200
        cost_limit = 90000

        csp = CropRotationCSP(
            land_size_acres=land_size,
            soil_type="Alluvial",
            water_budget_mm=water_limit,
            cost_budget=cost_limit,
            seasons_count=3
        )
        solutions = csp.solve(max_solutions=50)
        self.assertGreater(len(solutions), 0)

        for sol in solutions:
            total_water = sum(c["water_req_mm"] for c in sol)
            total_cost = sum(c["cost_per_acre"] * land_size for c in sol)
            self.assertLessEqual(total_water, water_limit)
            self.assertLessEqual(total_cost, cost_limit)

    def test_soil_suitability_constraint(self):
        """Verify that all crops chosen are suitable for the specified soil type."""
        soil = "Sandy"
        csp = CropRotationCSP(
            land_size_acres=1.5,
            soil_type=soil,
            water_budget_mm=1000,
            cost_budget=70000,
            seasons_count=3
        )
        solutions = csp.solve(max_solutions=30)
        self.assertGreater(len(solutions), 0)

        for sol in solutions:
            for crop in sol:
                self.assertIn(soil, crop["suitable_soils"], f"{crop['name']} not suitable for {soil}")

    def test_heuristic_scoring_and_ranking(self):
        """Verify heuristic scorer ranks rotations and produces positive utility scores."""
        csp = CropRotationCSP(
            land_size_acres=2.0,
            soil_type="Black Cotton",
            water_budget_mm=1100,
            cost_budget=80000,
            seasons_count=3
        )
        solutions = csp.solve(max_solutions=40)
        scorer = HeuristicScorer(
            land_size_acres=2.0,
            water_budget_mm=1100,
            cost_budget=80000,
            initial_soil_health=60.0
        )
        ranked = scorer.score_all(solutions)
        self.assertGreater(len(ranked), 0)
        # Verify sorted descending
        for i in range(len(ranked) - 1):
            self.assertGreaterEqual(ranked[i]["heuristic_score"], ranked[i + 1]["heuristic_score"])

    def test_drought_simulation_and_replanning(self):
        """Verify that a drought event reduces available water and triggers replanning."""
        session = RotationSimulationSession(
            land_size_acres=2.0,
            soil_type="Loamy",
            water_budget_mm=1500,
            cost_budget=120000,
            seasons_count=4,
            initial_soil_health=65.0
        )

        # Season 1: normal
        res1 = session.simulate_season()
        self.assertEqual(res1["status"], "in_progress")

        # Season 2: Drought event
        res2 = session.simulate_season(disruption_event={"type": "drought", "deficit_pct": 50})
        self.assertEqual(res2["replan_occurred"], True)
        self.assertGreater(len(session.replanning_logs), 0)

        # Remaining plan should still obey constraints
        rem_crops = session.active_plan["sequence"][session.current_season_idx:]
        self.assertTrue(len(rem_crops) > 0)

    def test_pest_outbreak_quarantine(self):
        """Verify pest outbreak causes the affected family to be quarantined."""
        session = RotationSimulationSession(
            land_size_acres=2.0,
            soil_type="Alluvial",
            water_budget_mm=1800,
            cost_budget=130000,
            seasons_count=4,
            initial_soil_health=60.0
        )

        # Simulate Season 1 with a pest outbreak
        curr_fam = session.active_plan["sequence"][0]["family"]
        res = session.simulate_season(disruption_event={"type": "pest_outbreak"})

        self.assertIn(curr_fam, session.quarantined_families)
        # Ensure remaining planned crops do not use the quarantined family
        for crop in session.active_plan["sequence"][1:]:
            self.assertNotEqual(crop["family"], curr_fam)


if __name__ == "__main__":
    unittest.main()
