"""
Flask Application and REST API for AI-Based Crop Rotation Planning System.
Serves interactive frontend and exposes endpoints for CSP solving, heuristic scoring,
agronomic knowledge inspection, and dynamic disruption simulation with replanning.
"""

import os
import sys
import uuid
from typing import Dict

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, jsonify, request, send_from_directory

from backend.knowledge_base import CROPS, SOIL_TYPES, CROP_FAMILIES, PRESET_SCENARIOS
from backend.csp_solver import CropRotationCSP
from backend.heuristic_scorer import HeuristicScorer
from backend.simulation_engine import RotationSimulationSession
from backend.explainability import ExplainabilityEngine

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

# In-memory storage for active simulation sessions
SESSIONS: Dict[str, RotationSimulationSession] = {}


@app.after_request
def add_cache_headers(response):
    """Prevent aggressive browser caching during development."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.route("/")
def index():
    """Serve main frontend single-page application."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    """Serve frontend static assets."""
    return send_from_directory(FRONTEND_DIR, filename)


@app.route("/api/crops", methods=["GET"])
def api_crops():
    """Return all crops and families from the knowledge base."""
    return jsonify({
        "status": "success",
        "crops": list(CROPS.values()),
        "families": CROP_FAMILIES,
        "soil_types": SOIL_TYPES
    })


@app.route("/api/presets", methods=["GET"])
def api_presets():
    """Return preset scenarios for rapid testing."""
    return jsonify({
        "status": "success",
        "presets": PRESET_SCENARIOS
    })


@app.route("/api/plan", methods=["POST"])
def api_plan():
    """
    Generate valid crop rotations using CSP backtracking and rank them using heuristic scoring.
    """
    data = request.get_json() or {}
    try:
        land_size = float(data.get("land_size_acres", 2.0))
        soil_type = str(data.get("soil_type", "Loamy"))
        water_budget = float(data.get("water_budget_mm", 1200))
        cost_budget = float(data.get("cost_budget", 80000))
        seasons_count = int(data.get("seasons_count", 3))
        initial_soil_health = float(data.get("initial_soil_health", 65.0))
        quarantined_families = set(data.get("quarantined_families", []))

        csp = CropRotationCSP(
            land_size_acres=land_size,
            soil_type=soil_type,
            water_budget_mm=water_budget,
            cost_budget=cost_budget,
            seasons_count=seasons_count,
            quarantined_families=quarantined_families
        )
        solutions = csp.solve(max_solutions=150)
        stats = csp.get_search_stats()

        if not solutions:
            # Provide helpful diagnostics if constraints are unsatisfiable
            min_possible_water = min((c["water_req_mm"] for c in csp.domain), default=0) * seasons_count
            min_possible_cost = min((c["cost_per_acre"] * land_size for c in csp.domain), default=0) * seasons_count
            
            cheapest_cost_crop = min(csp.domain, key=lambda c: c["cost_per_acre"], default=None) if csp.domain else None
            cheapest_rate = cheapest_cost_crop["cost_per_acre"] if cheapest_cost_crop else 8800
            cheapest_crop_name = cheapest_cost_crop["name"] if cheapest_cost_crop else "lowest-input crop"

            cheapest_water_crop = min(csp.domain, key=lambda c: c["water_req_mm"], default=None) if csp.domain else None
            cheapest_water_rate = cheapest_water_crop["water_req_mm"] if cheapest_water_crop else 250
            cheapest_water_name = cheapest_water_crop["name"] if cheapest_water_crop else "drought-hardy crop"

            feasible_land = round(cost_budget / (cheapest_rate * seasons_count), 1) if (cheapest_rate * seasons_count) > 0 else 0.5
            feasible_land = max(0.5, min(10.0, feasible_land))

            cost_deficit = max(0.0, min_possible_cost - cost_budget)
            water_deficit = max(0.0, min_possible_water - water_budget)

            return jsonify({
                "status": "no_solution",
                "message": (
                    f"No valid rotation satisfies all constraints for {soil_type} soil over {seasons_count} seasons. "
                    f"Minimum theoretical water needed is ~{min_possible_water} mm (provided: {water_budget} mm) "
                    f"and minimum theoretical cost is ~₹{min_possible_cost:,.0f} (provided: ₹{cost_budget:,.0f})."
                ),
                "stats": stats,
                "diagnostics": {
                    "land_size_acres": land_size,
                    "soil_type": soil_type,
                    "seasons_count": seasons_count,
                    "water_provided": water_budget,
                    "water_min_required": min_possible_water,
                    "water_deficit": water_deficit,
                    "cost_provided": cost_budget,
                    "cost_min_required": min_possible_cost,
                    "cost_deficit": cost_deficit,
                    "cheapest_crop_name": cheapest_crop_name,
                    "cheapest_rate_per_acre": cheapest_rate,
                    "cheapest_water_name": cheapest_water_name,
                    "cheapest_water_rate": cheapest_water_rate
                },
                "suggestions": {
                    "recommended_min_water": min_possible_water if water_deficit > 0 else water_budget,
                    "recommended_min_cost": min_possible_cost if cost_deficit > 0 else cost_budget,
                    "feasible_land_size": feasible_land,
                    "can_shorten_seasons": seasons_count > 2,
                    "shortened_seasons_cost": cheapest_rate * land_size * 2
                }
            }), 200

        scorer = HeuristicScorer(
            land_size_acres=land_size,
            water_budget_mm=water_budget,
            cost_budget=cost_budget,
            initial_soil_health=initial_soil_health
        )
        ranked = scorer.score_all(solutions)

        # Build explanations for top 5 plans
        for plan in ranked[:5]:
            sequence = plan["sequence"]
            explanations = []
            for i, crop in enumerate(sequence):
                prev_crop = sequence[i - 1] if i > 0 else None
                rem_water = water_budget - sum(c["water_req_mm"] for c in sequence[:i])
                rem_cost = (cost_budget - sum(c["cost_per_acre"] * land_size for c in sequence[:i])) / land_size

                rec_exp = ExplainabilityEngine.explain_season_recommendation(
                    current_crop=crop,
                    previous_crop=prev_crop,
                    season_index=i + 1,
                    total_seasons=seasons_count,
                    soil_type=soil_type
                )
                rej_exp = ExplainabilityEngine.explain_rejected_alternatives(
                    selected_crop=crop,
                    previous_crop=prev_crop,
                    remaining_water=rem_water,
                    remaining_cost_per_acre=rem_cost,
                    soil_type=soil_type,
                    quarantined_families=quarantined_families
                )
                explanations.append({
                    "recommendation": rec_exp,
                    "rejections": rej_exp
                })
            plan["explanations"] = explanations

        return jsonify({
            "status": "success",
            "best_plan": ranked[0],
            "alternative_plans": ranked[1:6],
            "total_solutions_found": len(ranked),
            "search_stats": stats
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/simulation/start", methods=["POST"])
def api_sim_start():
    """Initialize a stateful simulation session."""
    data = request.get_json() or {}
    try:
        land_size = float(data.get("land_size_acres", 2.0))
        soil_type = str(data.get("soil_type", "Loamy"))
        water_budget = float(data.get("water_budget_mm", 1200))
        cost_budget = float(data.get("cost_budget", 80000))
        seasons_count = int(data.get("seasons_count", 3))
        initial_soil_health = float(data.get("initial_soil_health", 65.0))

        session_id = str(uuid.uuid4())
        session = RotationSimulationSession(
            land_size_acres=land_size,
            soil_type=soil_type,
            water_budget_mm=water_budget,
            cost_budget=cost_budget,
            seasons_count=seasons_count,
            initial_soil_health=initial_soil_health
        )
        SESSIONS[session_id] = session

        return jsonify({
            "status": "success",
            "session_id": session_id,
            "state": session.get_current_state()
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/simulation/step", methods=["POST"])
def api_sim_step():
    """Simulate next season, optionally injecting drought or pest outbreak disruptions."""
    data = request.get_json() or {}
    session_id = data.get("session_id")
    disruption = data.get("disruption")  # e.g., {"type": "drought", "deficit_pct": 50} or {"type": "pest_outbreak"}

    session = SESSIONS.get(session_id)
    if not session:
        return jsonify({"status": "error", "message": "Session not found. Please initialize simulation first."}), 404

    try:
        result = session.simulate_season(disruption_event=disruption)
        return jsonify({
            "status": "success",
            "result": result
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/simulation/run-all", methods=["POST"])
def api_sim_run_all():
    """Run all remaining seasons sequentially to completion."""
    data = request.get_json() or {}
    session_id = data.get("session_id")
    disruptions = data.get("disruptions", [])

    session = SESSIONS.get(session_id)
    if not session:
        return jsonify({"status": "error", "message": "Session not found."}), 404

    try:
        step_results = session.simulate_all_remaining(disruptions=disruptions)
        return jsonify({
            "status": "success",
            "step_results": step_results,
            "final_state": session.get_current_state()
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Crop Rotation Planning System on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
