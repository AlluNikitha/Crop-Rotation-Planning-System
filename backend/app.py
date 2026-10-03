"""
Flask Application and REST API for AI-Based Crop Rotation Planning System.
Serves interactive frontend and exposes endpoints for CSP solving, heuristic scoring,
agronomic knowledge inspection, dynamic disruption simulation, multi-language localization,
and an AI Agronomist Copilot Agent.
"""

import os
import sys
import uuid
from typing import Dict, Any

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, jsonify, request, send_from_directory

from backend.knowledge_base import (
    CROPS, SOIL_TYPES, CROP_FAMILIES, PRESET_SCENARIOS,
    get_all_crops, get_all_presets, get_crop
)
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
    """Return all crops and families from the knowledge base in requested language."""
    lang = request.args.get("lang", "en")
    return jsonify({
        "status": "success",
        "crops": get_all_crops(lang=lang),
        "families": CROP_FAMILIES,
        "soil_types": SOIL_TYPES
    })


@app.route("/api/presets", methods=["GET"])
def api_presets():
    """Return preset scenarios for rapid testing in requested language."""
    lang = request.args.get("lang", "en")
    return jsonify({
        "status": "success",
        "presets": get_all_presets(lang=lang)
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
        lang = str(data.get("lang", "en"))

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

        # Build explanations for top 5 plans with requested language
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
                    soil_type=soil_type,
                    lang=lang
                )
                rej_exp = ExplainabilityEngine.explain_rejected_alternatives(
                    selected_crop=crop,
                    previous_crop=prev_crop,
                    remaining_water=rem_water,
                    remaining_cost_per_acre=rem_cost,
                    soil_type=soil_type,
                    quarantined_families=quarantined_families,
                    lang=lang
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
    disruption = data.get("disruption")

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


@app.route("/api/chat", methods=["POST"])
def api_chat():
    """
    AI Agronomist Copilot Endpoint.
    Responds to farmer queries about rotation strategy, crop recommendations, pest management,
    soil health restoration, and financial guidance in the requested language.
    """
    data = request.get_json() or {}
    message = str(data.get("message", "")).strip().lower()
    lang = str(data.get("lang", "en"))
    ctx = data.get("context", {})

    if not message:
        return jsonify({"status": "error", "message": "Message is required"}), 400

    soil_type = ctx.get("soil_type", "Black Cotton")
    land_size = ctx.get("land_size_acres", 2.0)
    water_budget = ctx.get("water_budget_mm", 900)
    cost_budget = ctx.get("cost_budget", 70000)
    plan_seq = ctx.get("sequence", [])

    seq_names = [c.get("name", c.get("id", "")) for c in plan_seq if isinstance(c, dict)]
    seq_str = " -> ".join(seq_names) if seq_names else "Chickpea -> Sorghum -> Wheat"

    # Knowledge-driven responses tailored per domain topic & localized per language
    response_text = ""
    suggested_actions = []

    if any(k in message for k in ["why", "chickpea", "legume", "nitrogen", "reason", "क्यों", "ఏలా", "ஏன்", "का"]):
        if lang == "hi":
            response_text = (
                f"🌱 **एग्रीप्लांट AI एग्रोनॉमिस्ट सलाह:**\n\n"
                f"आपकी {soil_type} मिट्टी के लिए **चना/फलीदार फसलें** अनुशंसित हैं क्योंकि वे वायुमंडलीय नाइट्रोजन (+30 से +42 किग्रा/हेक्टेयर) को प्राकृतिक रूप से मिट्टी में स्थिर करती हैं।\n"
                f"यह रासायनिक उर्वरकों की लागत को 25-30% तक कम करता है और अगली अनाज फसल (जैसे गेहूं या मक्का) के लिए मिट्टी को तैयार करता है।"
            )
        elif lang == "te":
            response_text = (
                f"🌱 **అగ్రిప్లాన్ AI వ్యవసాయ నిపుణుడి సలహా:**\n\n"
                f"మీ {soil_type} నేలలో **శనగలు/పప్పుధాన్యాలు** ఎంపిక చేయడానికి కారణం, అవి గాలిలోని నత్రజనిని (నైట్రోజన్) నేలలో స్థిరీకరిస్తాయి (+38 కిలోలు/హెక్టార్).\n"
                f"ఇది ఎరువుల ఖర్చును తగ్గించి తదుపరి పంటకు నేలను సారవంతం చేస్తుంది."
            )
        elif lang == "ta":
            response_text = (
                f"🌱 **அகிரிப்ளான் AI வேளாண் நிபுணர் ஆலோசனை:**\n\n"
                f"உங்கள் {soil_type} மண்ணிற்கு **கொண்டைக்கடலை / பருப்பு வகைகள்** தேர்ந்தெடுக்கப்பட்டுள்ளன. இவை காற்றில் உள்ள நைட்ரஜனை (நைட்ரஜன்) மண்ணில் நிலைநிறுத்துகின்றன (+38 கிலோ/ஹெக்டேர்).\n"
                f"இது உரச் செலவைக் குறைத்து அடுத்த பயிரான கோதுமை/சோளத்திற்கு மண்ணை வளம் பெறச் செய்கிறது."
            )
        elif lang == "mr":
            response_text = (
                f"🌱 **ॲग्रीप्लॅन AI कृषी तज्ज्ञ सल्ला:**\n\n"
                f"तुमच्या {soil_type} जमिनीसाठी **हरभरा/कडधान्ये** निवडण्याचे कारण म्हणजे ते हवेतील नायट्रोजन (+38 किलो/हेक्टर) जमिनीत स्थिर करतात.\n"
                f"यामुळे खतांचा खर्च वाचतो आणि पुढील पिकासाठी जमीन सुपीक होते."
            )
        elif lang == "pa":
            response_text = (
                f"🌱 **ਐਗਰੀਪਲਾਨ AI ਖੇਤੀਬਾੜੀ ਮਾਹਰ ਦੀ ਸਲਾਹ:**\n\n"
                f"ਤੁਹਾਡੀ {soil_type} ਮਿੱਟੀ ਲਈ **ਛੋਲੇ/ਦਾਲਾਂ** ਇਸ ਲਈ ਚੁਣੀਆਂ ਗਈਆਂ ਹਨ ਕਿਉਂਕਿ ਇਹ ਹਵਾ ਵਿਚਲੀ ਨਾਈਟ੍ਰੋਜਨ (+38 ਕਿਲੋ/ਹੈਕਟੇਅਰ) ਮਿੱਟੀ ਵਿਚ ਸਥਿਰ ਕਰਦੀਆਂ ਹਨ।\n"
                f"ਇਹ ਖਾਦਾਂ ਦਾ ਖਰਚਾ ਘਟਾਉਂਦੀ ਹੈ ਅਤੇ ਅਗਲੀ ਫਸਲ ਲਈ ਮਿੱਟੀ ਨੂੰ ਤਿਆਰ ਕਰਦੀ ਹੈ।"
            )
        elif lang == "es":
            response_text = (
                f"🌱 **Consejo del Agrónomo IA de AgriPlan:**\n\n"
                f"Las **leguminosas (Garbanzo)** se recomiendan para su suelo {soil_type} porque fijan nitrógeno atmosférico (+38 kg/ha).\n"
                f"Esto reduce los costos de fertilizantes sintéticos en un 30% y mejora la estructura del suelo para el siguiente cultivo."
            )
        else:
            response_text = (
                f"🌱 **AgriPlan AI Agronomist Rationale:**\n\n"
                f"For your **{soil_type} soil**, **Chickpea / Legumes** are strongly recommended in Season 1 or 2 because they fix +38 kg/ha of biological nitrogen directly into root nodules.\n"
                f"This restores soil organic carbon, breaks fungal disease vectors from previous crops, and reduces synthetic urea costs for subsequent cereal crops by up to 30%."
            )

    elif any(k in message for k in ["drought", "water", "irrigation", "सूखा", "నీరు", "நீர்", "पाणी"]):
        if lang == "hi":
            response_text = (
                f"💧 **सूखा एवं जल प्रबंधन रणनीति:**\n\n"
                f"वर्तमान जल बजट ({water_budget} मिमी) के तहत, कम पानी वाली फसलें जैसे **बाजरा (240 मिमी), चना (250 मिमी), और सरसों (270 मिमी)** का उपयोग करें।\n"
                f"ड्रिप सिंचाई और मल्चिंग से 35% पानी की बचत की जा सकती है।"
            )
        elif lang == "te":
            response_text = (
                f"💧 **కరువు మరియు నీటి యాజమాన్యం:**\n\n"
                f"ప్రస్తుత నీటి పరిమితి ({water_budget} మిమీ) కింద, తక్కువ నీరు అవసరమయ్యే **సజ్జలు (240 మిమీ), శనగలు (250 మిమీ), ఆవాలు (270 మిమీ)** సాగు చేయండి.\n"
                f"బిందు సేద్యం (Drip) ద్వారా 35% నీటిని ఆదా చేయవచ్చు."
            )
        elif lang == "ta":
            response_text = (
                f"💧 **வறட்சி மற்றும் நீர் மேலாண்மை:**\n\n"
                f"உங்கள் தற்போதைய நீர் வரம்பிற்கு ({water_budget} மிமீ), குறைந்த நீர் தேவைப்படும் **கம்பு (240 மிமீ), கொண்டைக்கடலை (250 மிமீ), கடுகு (270 மிமீ)** பயிரிடுங்கள்.\n"
                f"சொட்டு நீர் பாசனம் மூலம் 35% நீர் சேமிக்க முடியும்."
            )
        elif lang == "mr":
            response_text = (
                f"💧 **दुष्काळ आणि पाणी व्यवस्थापन:**\n\n"
                f"सध्याच्या पाणी बजेटनुसार ({water_budget} मिमी), कमी पाण्याची गरज असणारी **बाजरी (240 मिमी), हरभरा (250 मिमी), मोहरी (270 मिमी)** पिके घ्या.\n"
                f"ठिबक सिंचनामुळे 35% पाण्याची बचत होते."
            )
        elif lang == "pa":
            response_text = (
                f"💧 **ਸੂਖਾ ਅਤੇ ਪਾਣੀ ਪ੍ਰਬੰਧਨ:**\n\n"
                f"ਤੁਹਾਡੇ ਪਾਣੀ ਦੇ ਬਜਟ ({water_budget} ਮਿਲੀਮੀਟਰ) ਅਨੁਸਾਰ, ਘੱਟ ਪਾਣੀ ਵਾਲੀਆਂ ਫਸਲਾਂ ਜਿਵੇਂ **ਬਾਜਰਾ (240 ਮਿਲੀਮੀਟਰ), ਛੋਲੇ (250 ਮਿਲੀਮੀਟਰ), ਅਤੇ ਸਰ੍ਹੋਂ (270 ਮਿਲੀਮੀਟਰ)** ਬੀਜੋ।"
            )
        elif lang == "es":
            response_text = (
                f"💧 **Estrategia para Sequía y Manejo de Agua:**\n\n"
                f"Bajo su presupuesto hídrico ({water_budget} mm), priorice cultivos de bajo consumo como **Mijo Perla (240 mm), Garbanzo (250 mm) y Mostaza (270 mm)**.\n"
                f"El riego por goteo reduce las pérdidas por evaporación en un 35%."
            )
        else:
            response_text = (
                f"💧 **Drought & Water Conservation Protocol:**\n\n"
                f"With your current allocated water budget of **{water_budget} mm**, AgriPlan recommends incorporating drought-hardy crops like **Pearl Millet (240 mm)**, **Chickpea (250 mm)**, or **Mustard (270 mm)**.\n"
                f"If a mid-season heatwave occurs, adopt straw mulching to conserve topsoil moisture and reduce evapotranspiration losses by 30-35%."
            )

    elif any(k in message for k in ["pest", "disease", "outbreak", "कीट", "పురుగు", "பூச்சி", "कीड"]):
        if lang == "hi":
            response_text = (
                f"🐛 **कीट एवं रोग नियंत्रण मार्गदर्शिका:**\n\n"
                f"फसल चक्र (Crop Rotation) कीटों के जीवन चक्र को तोड़ने का सबसे प्रभावी तरीका है। लगातार एक ही कुल (जैसे Solanaceae) की फसल न बोएं।\n"
                f"सरसों या सरसों-कुल की फसलें जैव-धूपन (Biofumigation) का काम करती हैं और मिट्टी के रोगजनक कीड़ों को खत्म करती हैं।"
            )
        elif lang == "te":
            response_text = (
                f"🐛 **కీటకాలు మరియు తెగుళ్ల నివారణ:**\n\n"
                f"పంటల మార్పిడి (Crop Rotation) ద్వారా పురుగుల సంతతిని అరికట్టవచ్చు. ఒకే కుటుంబానికి చెందిన పంటలను వరుసగా వేయకండి.\n"
                f"ఆవాలు వంటి పంటలు నేలలోని హానికర కీటకాలను సహజంగా నిర్మూలిస్తాయి."
            )
        elif lang == "ta":
            response_text = (
                f"🐛 **பூச்சி மற்றும் நோய் மேலாண்மை:**\n\n"
                f"பயிர் சுழற்சி முறை பூச்சிகளின் பெருக்கத்தைத் தடுக்கிறது. ஒரே குடும்பப் பயிர்களைத் தொடர்ந்து பயிரிடாதீர்கள்.\n"
                f"கடுகு பயிர் மண்ணில் உள்ள தீங்கு விளைவிக்கும் பூச்சிகளை இயற்கையாக அழிக்கிறது."
            )
        elif lang == "mr":
            response_text = (
                f"🐛 **कीड आणि रोग नियंत्रण मार्गदर्शन:**\n\n"
                f"पीक फेरपालट (Crop Rotation) हा कीड नियंत्रणाचा सर्वोत्तम उपाय आहे. एकाच कुळातील पिके सलग घेऊ नका.\n"
                f"मोहरी पीक जमिनीतील उपद्रवी कीटकांचा नैसर्गिक नाश करते."
            )
        elif lang == "pa":
            response_text = (
                f"🐛 **ਕੀੜੇ-ਮਕੌੜੇ ਅਤੇ ਬੀਮਾਰੀ ਪ੍ਰਬੰਧਨ:**\n\n"
                f"ਫਸਲੀ ਚੱਕਰ ਕੀੜਿਆਂ ਦੇ ਚੱਕਰ ਨੂੰ ਤੋੜਨ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਤਰੀਕਾ ਹੈ। ਇੱਕੋ ਪਰਿਵਾਰ ਦੀਆਂ ਫਸਲਾਂ ਲਗਾਤਾਰ ਨਾ ਬੀਜੋ।"
            )
        elif lang == "es":
            response_text = (
                f"🐛 **Control de Plagas y Fitopatología:**\n\n"
                f"La rotación de cultivos altera el ciclo reproductivo de insectos y nemátodos. Nunca repita la misma familia botánica en temporadas consecutivas.\n"
                f"Los cultivos de Brassicaceae (Mostaza) liberan glucosinolatos que actúan como biofumigantes naturales."
            )
        else:
            response_text = (
                f"🐛 **Integrated Pest & Disease Management (IPM):**\n\n"
                f"The core principle enforced by AgriPlan CSP solver is **botanical family alternation**. Never repeat Solanaceae (Tomato/Potato) or Fabaceae consecutively.\n"
                f"Incorporating **Mustard (Brassicaceae)** releases natural biofumigant glucosinolates into the root zone, suppressing root-knot nematodes and fungal pathogens for subsequent crops."
            )

    else:
        if lang == "hi":
            response_text = (
                f"🌾 **एग्रीप्लांट AI एग्रोनॉमिस्ट योजना सारांश:**\n\n"
                f"आपकी **{land_size} एकड़ {soil_type} मिट्टी** के लिए वर्तमान योजना: **{seq_str}**।\n"
                f"यह योजना जल सीमा ({water_budget} मिमी) और बजट (₹{cost_budget:,.0f}) का पालन करते हुए मिट्टी के स्वास्थ्य और लाभ को अधिकतम करती है।"
            )
        elif lang == "te":
            response_text = (
                f"🌾 **అగ్రిప్లాన్ AI వ్యవసాయ ప్రణాళిక సారాంశం:**\n\n"
                f"మీ **{land_size} ఎకరాల {soil_type} నేల** కోసం ఎంచుకున్న పంటల క్రమం: **{seq_str}**.\n"
                f"ఈ ప్రణాళిక మీ నీటి సరిహద్దు ({water_budget} మిమీ) మరియు బడ్జెట్ (₹{cost_budget:,.0f}) ని పాటిస్తూ లాభాలను గరిష్టం చేస్తుంది."
            )
        elif lang == "ta":
            response_text = (
                f"🌾 **அகிரிப்ளான் AI விவசாயத் திட்ட சுருக்கம்:**\n\n"
                f"உங்கள் **{land_size} ஏக்கர் {soil_type} மண்ணிற்கான** பயிர் சுழற்சி: **{seq_str}**.\n"
                f"இது நீர் வரம்பு ({water_budget} மிமீ) மற்றும் பட்ஜெட்டை (₹{cost_budget:,.0f}) பூர்த்தி செய்து அதிக லாபம் தருகிறது."
            )
        elif lang == "mr":
            response_text = (
                f"🌾 **ॲग्रीप्लॅन AI कृषी योजना सारांश:**\n\n"
                f"तुमच्या **{land_size} एकर {soil_type} जमिनीसाठी** सध्याची योजना: **{seq_str}**.\n"
                f"ही योजना पाण्याचे प्रमाण ({water_budget} मिमी) आणि बजेट (₹{cost_budget:,.0f}) राखून उत्पन्न वाढवते."
            )
        elif lang == "pa":
            response_text = (
                f"🌾 **ਐਗਰੀਪਲਾਨ AI ਯੋਜਨਾ ਸੰਖੇਪ:**\n\n"
                f"ਤੁਹਾਡੇ **{land_size} ਏਕੜ {soil_type} ਖੇਤ** ਲਈ ਮੌਜੂਦਾ ਫਸਲੀ ਚੱਕਰ: **{seq_str}**।\n"
                f"ਇਹ ਯੋਜਨਾ ਪਾਣੀ ਅਤੇ ਬਜਟ ਦੀਆਂ ਸੀਮਾਵਾਂ ਦੇ ਅੰਦਰ ਰਹਿ ਕੇ ਵਧੀਆ ਮੁਨਾਫਾ ਦਿੰਦੀ ਹੈ।"
            )
        elif lang == "es":
            response_text = (
                f"🌾 **Resumen de Estrategia AgriPlan AI:**\n\n"
                f"Para su terreno de **{land_size} acres ({soil_type})**, la rotación activa es: **{seq_str}**.\n"
                f"Esta combinación respeta su presupuesto hídrico ({water_budget} mm) y financiero (₹{cost_budget:,.0f}), maximizando la rentabilidad y la salud del suelo."
            )
        else:
            response_text = (
                f"🌾 **AgriPlan AI Agronomist Synthesis:**\n\n"
                f"For your **{land_size}-acre plot ({soil_type} soil)**, the recommended multi-season strategy is: **{seq_str}**.\n\n"
                f"• **Soil Health**: Alternates nitrogen fixers with nitrogen extractors to maintain net soil organic quality above baseline.\n"
                f"• **Resource Compliance**: Strictly consumes within your water cap ({water_budget} mm) and financial budget (₹{cost_budget:,.0f}).\n"
                f"• **Pest Suppression**: Solves CSP constraints to eliminate host family overlap."
            )

    return jsonify({
        "status": "success",
        "response": response_text,
        "suggested_actions": suggested_actions
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Crop Rotation Planning System on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
