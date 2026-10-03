"""
Explainability Engine (XAI) for Crop Rotation Planning.
Provides human-readable, agronomically sound justifications for recommended crops,
rejection rationales for pruned alternatives, and replanning explanations.
Supports multi-language responses (EN, HI, TE, TA, MR, PA, ES).
"""

from typing import List, Dict, Any, Optional
from backend.knowledge_base import CROP_FAMILIES, LOCALIZED_FAMILY_NAMES, get_crop, get_crops_for_soil


class ExplainabilityEngine:
    """
    Generates transparent agronomic explanations for decision-support transparency.
    """

    @staticmethod
    def explain_season_recommendation(
        current_crop: Dict[str, Any],
        previous_crop: Optional[Dict[str, Any]],
        season_index: int,
        total_seasons: int,
        soil_type: str,
        lang: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate detailed agronomic rationale for why this specific crop was selected for this season.
        """
        reasons: List[str] = []
        curr_crop_localized = get_crop(current_crop["id"], lang=lang) or current_crop
        prev_crop_localized = get_crop(previous_crop["id"], lang=lang) if previous_crop else None

        crop_name = curr_crop_localized.get("name", current_crop["name"])
        prev_name = prev_crop_localized.get("name", previous_crop["name"]) if prev_crop_localized else (previous_crop["name"] if previous_crop else "")

        family_key = current_crop["family"]
        fam_loc_dict = LOCALIZED_FAMILY_NAMES.get(family_key, {})
        family_desc = fam_loc_dict.get(lang, CROP_FAMILIES.get(family_key, family_key))

        # 1. Botanical Family & Succession Role
        if previous_crop is None:
            if lang == "hi":
                reasons.append(f"सीजन 1 के लिए आधार फसल के रूप में चुना गया। यह {soil_type} मिट्टी के अनुकूल है।")
            elif lang == "te":
                reasons.append(f"సీజన్ 1 కోసం పునాది పంటగా ఎంపిక చేయబడింది. ఇది {soil_type} నేలకు సరిపోతుంది.")
            elif lang == "ta":
                reasons.append(f"பருவம் 1க்கான அடிப்படைப் பயிராகத் தேர்ந்தெடுக்கப்பட்டது. இது {soil_type} மண்ணிற்கு ஏற்றது.")
            elif lang == "mr":
                reasons.append(f"हंगाम 1 साठी पायाभूत पीक म्हणून निवडले. हे {soil_type} जमिनीसाठी योग्य आहे.")
            elif lang == "pa":
                reasons.append(f"ਸੀਜ਼ਨ 1 ਲਈ ਮੁੱਖ ਫਸਲ ਵਜੋਂ ਚੁਣਿਆ ਗਿਆ। ਇਹ {soil_type} ਮਿੱਟੀ ਲਈ ਢੁਕਵਾਂ ਹੈ।")
            elif lang == "es":
                reasons.append(f"Seleccionado como cultivo base para la Temporada 1. Se adapta al suelo {soil_type}.")
            else:
                reasons.append(f"Selected as foundation crop for Season 1. Fits {soil_type} soil and establishes a baseline nutrient profile.")
        else:
            prev_fam = previous_crop["family"]
            curr_fam = current_crop["family"]

            if curr_fam == "Fabaceae" and prev_fam in ("Poaceae", "Solanaceae"):
                if lang == "hi":
                    reasons.append(f"मृदा सुधार: भारी पोषक तत्व खींचने वाली फसल {prev_name} के बाद। यह नाइट्रोजन (+"
                                   f"{current_crop['nitrogen_effect_kg_ha']} किग्रा/हेक्टेयर) को स्थिर करती है।")
                elif lang == "te":
                    reasons.append(f"నేల పునరుద్ధరణ: ఎక్కువ పోషకాలను తీసుకునే {prev_name} తర్వాత పండించబడుతుంది. నత్రజని (+"
                                   f"{current_crop['nitrogen_effect_kg_ha']} కిలోలు/హెక్టార్) స్థిరీకరిస్తుంది.")
                elif lang == "ta":
                    reasons.append(f"மண் வளம் மீட்பு: அதிக சத்து உறிஞ்சும் {prev_name} பயிரைத் தொடர்ந்து, நைட்ரஜனை (+"
                                   f"{current_crop['nitrogen_effect_kg_ha']} கிலோ/ஹெக்டேர்) நிலைநிறுத்துகிறது.")
                elif lang == "mr":
                    reasons.append(f"मृदा संवर्धन: पोषक तत्वे शोषणाऱ्या {prev_name} नंतर. नायट्रोजन (+"
                                   f"{current_crop['nitrogen_effect_kg_ha']} किलो/हेक्टर) स्थिर करते.")
                elif lang == "pa":
                    reasons.append(f"ਮਿੱਟੀ ਸੁਧਾਰ: ਵਧੇਰੇ ਖੁਰਾਕ ਲੈਣ ਵਾਲੀ {prev_name} ਤੋਂ ਬਾਅਦ। ਨਾਈਟ੍ਰੋਜਨ (+"
                                   f"{current_crop['nitrogen_effect_kg_ha']} ਕਿਲੋ/ਹੈਕਟੇਅਰ) ਸਥਿਰ ਕਰਦੀ ਹੈ।")
                elif lang == "es":
                    reasons.append(f"Recuperación del Suelo: Sigue al cultivo demandante {prev_name}. Fija nitrógeno (+"
                                   f"{current_crop['nitrogen_effect_kg_ha']} kg/ha).")
                else:
                    reasons.append(
                        f"Agronomic Recovery: Follows heavy feeder {prev_name} ({prev_fam}). "
                        f"Fixes atmospheric nitrogen (+{current_crop['nitrogen_effect_kg_ha']} kg/ha) to restore depleted soil reserves."
                    )
            elif curr_fam == "Poaceae" and prev_fam == "Fabaceae":
                if lang == "hi":
                    reasons.append(f"पोषक लाभ: पिछली दलहनी फसल {prev_name} द्वारा छोड़े गए नाइट्रोजन का लाभ उठाता है।")
                elif lang == "te":
                    reasons.append(f"పోషకాల వినియోగం: క్రితం పప్పుధాన్యం {prev_name} అందించిన నత్రజనిని పూర్తి స్థాయిలో వాడుకుంటుంది.")
                elif lang == "ta":
                    reasons.append(f"சத்து பயன்பாடு: முந்தைய பருப்புப் பயிர் {prev_name} வழங்கிய நைட்ரஜனைப் பயன்படுத்தி சிறந்த மகசூல் தருகிறது.")
                elif lang == "mr":
                    reasons.append(f"पोषक फायदा: मागील कडधान्य {prev_name} मुळे मिळालेल्या नायट्रोजनचा पुरेपूर वापर करते.")
                elif lang == "pa":
                    reasons.append(f"ਖੁਰਾਕੀ ਲਾਭ: ਪਿਛਲੀ ਦਾਲ {prev_name} ਦੁਆਰਾ ਛੱਡੀ ਨਾਈਟ੍ਰੋਜਨ ਦਾ ਪੂਰਾ ਲਾਹਾ ਲੈਂਦੀ ਹੈ।")
                elif lang == "es":
                    reasons.append(f"Aprovechamiento de Nutrientes: Aprovecha el nitrógeno residual dejado por la leguminosa previa {prev_name}.")
                else:
                    reasons.append(
                        f"Nutrient Exploitation: Takes full advantage of residual nitrogen left by preceding legume "
                        f"{prev_name} to maximize cereal grain biomass."
                    )
            else:
                if lang == "hi":
                    reasons.append(f"कुल परिवर्तन: {prev_fam} से {curr_fam} में बदलकर कीट चक्र को तोड़ता है।")
                elif lang == "te":
                    reasons.append(f"కుటుంబ మార్పిడి: {prev_fam} నుండి {curr_fam} కి మారడం ద్వారా పురుగుల వ్యాప్తిని నిరోధిస్తుంది.")
                elif lang == "ta":
                    reasons.append(f"குடும்ப மாற்றம்: {prev_fam} இலிருந்து {curr_fam} இற்கு மாற்றி பூச்சி சுழற்சியை உடைக்கிறது.")
                elif lang == "mr":
                    reasons.append(f"कुळ बदल: {prev_fam} कडून {curr_fam} कडे बदल करून कीड चक्र खंडित करते.")
                elif lang == "pa":
                    reasons.append(f"ਪਰਿਵਾਰ ਬਦਲਾਅ: {prev_fam} ਤੋਂ {curr_fam} ਵੱਲ ਬਦਲ ਕੇ ਕੀੜੇ-ਮਕੌੜਿਆਂ ਦਾ ਚੱਕਰ ਤੋੜਦੀ ਹੈ।")
                elif lang == "es":
                    reasons.append(f"Rotación de Familia: Cambia de {prev_fam} a {curr_fam}, rompiendo el ciclo de plagas.")
                else:
                    reasons.append(f"Family Alternation: Switches from {prev_fam} to {curr_fam}, breaking insect reproduction cycles.")

        # 2. Water
        water = current_crop["water_req_mm"]
        if lang == "hi":
            reasons.append(f"जल आवश्यकता: {water} मिमी प्रति सीजन।")
        elif lang == "te":
            reasons.append(f"నీటి అవసరం: {water} మిమీ ఒక సీజన్‌కు.")
        elif lang == "ta":
            reasons.append(f"நீர் தேவை: {water} மிமீ பருவத்திற்கு.")
        elif lang == "mr":
            reasons.append(f"पाण्याची गरज: {water} मिमी प्रति हंगाम.")
        elif lang == "pa":
            reasons.append(f"ਪਾਣੀ ਦੀ ਲੋੜ: {water} ਮਿਲੀਮੀਟਰ ਪ੍ਰਤੀ ਸੀਜ਼ਨ।")
        elif lang == "es":
            reasons.append(f"Demanda de Agua: {water} mm por temporada.")
        else:
            reasons.append(f"Water Footprint ({water} mm): Aligned with moisture constraints.")

        # 3. Soil Health Dynamics
        n_delta = current_crop["nitrogen_effect_kg_ha"]
        if n_delta > 0:
            if lang == "hi":
                reasons.append(f"नाइट्रोजन संवर्धन: +{n_delta} किग्रा/हेक्टेयर नाइट्रोजन जोड़ता है।")
            elif lang == "te":
                reasons.append(f"నత్రజని పెరుగుదల: +{n_delta} కిలోలు/హెక్టార్ నత్రజనిని జోడిస్తుంది.")
            elif lang == "ta":
                reasons.append(f"நைட்ரஜன் சேர்க்கை: +{n_delta} கிலோ/ஹெக்டேர் நைட்ரஜன் வழங்குகிறது.")
            elif lang == "mr":
                reasons.append(f"नायट्रोजन वाढ: +{n_delta} किलो/हेक्टर नायट्रोजन जोडते.")
            elif lang == "pa":
                reasons.append(f"ਨਾਈਟ੍ਰੋਜਨ ਵਾਧਾ: +{n_delta} ਕਿਲੋ/ਹੈਕਟੇਅਰ ਨਾਈਟ੍ਰੋਜਨ ਜੋੜਦੀ ਹੈ।")
            elif lang == "es":
                reasons.append(f"Fijación de Nitrógeno: Agrega +{n_delta} kg/ha de Nitrógeno.")
            else:
                reasons.append(f"Soil Nitrogen Fixer: Adds net +{n_delta} kg/ha Nitrogen, raising soil health score.")

        return {
            "season_index": season_index,
            "crop_id": current_crop["id"],
            "crop_name": crop_name,
            "family": current_crop["family"],
            "family_role": family_desc,
            "primary_rationale": reasons[0],
            "all_reasons": reasons,
            "agronomic_benefit": current_crop.get("agronomic_benefit", "")
        }

    @staticmethod
    def explain_rejected_alternatives(
        selected_crop: Dict[str, Any],
        previous_crop: Optional[Dict[str, Any]],
        remaining_water: float,
        remaining_cost_per_acre: float,
        soil_type: str,
        quarantined_families: Optional[set] = None,
        lang: str = "en"
    ) -> List[Dict[str, Any]]:
        """
        Explain why other popular crops were eliminated or rejected for this season slot.
        """
        rejections = []
        quarantined_families = quarantined_families or set()
        soil_crops = get_crops_for_soil(soil_type, lang=lang)

        for candidate in soil_crops:
            if candidate["id"] == selected_crop["id"]:
                continue

            reason = None
            code = None

            # Check Quarantine
            if candidate["family"] in quarantined_families:
                reason = f"Quarantined due to recent pest/disease outbreak in family {candidate['family']}."
                code = "QUARANTINED"
            # Check Consecutive Family Rule
            elif previous_crop and candidate["family"] == previous_crop["family"]:
                reason = (
                    f"Violates hard CSP constraint: cannot repeat family {candidate['family']} "
                    f"in consecutive seasons."
                )
                code = "FAMILY_CONFLICT"
            # Check Water
            elif candidate["water_req_mm"] > remaining_water:
                reason = f"Exceeds remaining water allowance ({candidate['water_req_mm']} mm needed vs {remaining_water:.1f} mm available)."
                code = "WATER_EXCEEDED"
            # Check Cost
            elif candidate["cost_per_acre"] > remaining_cost_per_acre:
                reason = f"Exceeds available financial budget (₹{candidate['cost_per_acre']:,} vs ₹{remaining_cost_per_acre:,.0f} available)."
                code = "BUDGET_EXCEEDED"
            else:
                reason = "Lower composite heuristic utility score."
                code = "HEURISTIC_PRUNED"

            if code in ("QUARANTINED", "FAMILY_CONFLICT", "WATER_EXCEEDED", "BUDGET_EXCEEDED"):
                rejections.append({
                    "crop_id": candidate["id"],
                    "crop_name": candidate.get("name", candidate["id"]),
                    "family": candidate["family"],
                    "code": code,
                    "reason": reason
                })

        return rejections[:5]

    @staticmethod
    def explain_replanning_event(
        event_type: str,
        season_index: int,
        original_crop: Dict[str, Any],
        new_crop: Dict[str, Any],
        context: Dict[str, Any],
        lang: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate explanation when an environmental disruption causes the agent to re-solve CSP.
        """
        orig_crop_loc = get_crop(original_crop.get("id", ""), lang=lang) if isinstance(original_crop, dict) else None
        new_crop_loc = get_crop(new_crop.get("id", ""), lang=lang) if isinstance(new_crop, dict) else None

        orig_name = orig_crop_loc.get("name") if orig_crop_loc else (original_crop.get("name", "Previous Crop") if isinstance(original_crop, dict) else str(original_crop))
        new_name = new_crop_loc.get("name") if new_crop_loc else (new_crop.get("name", "New Crop") if isinstance(new_crop, dict) else str(new_crop))

        orig_water = original_crop.get("water_req_mm", 0) if isinstance(original_crop, dict) else 0
        new_water = new_crop.get("water_req_mm", 0) if isinstance(new_crop, dict) else 0

        is_same_crop = (orig_name == new_name)
        is_final_season = context.get("is_final_season", False)

        if event_type == "drought":
            deficit = context.get("deficit_pct", 45)
            if is_final_season:
                action_text = f"Drought in final Season {season_index}. Available water reduced by {deficit}%. Completed harvest of '{orig_name}'."
            elif is_same_crop:
                action_text = f"Water budget reduced by {deficit}%. CSP confirmed '{orig_name}' ({orig_water} mm) is already the most drought-hardy crop."
            else:
                water_saved = orig_water - new_water
                saved_str = f"Saved {water_saved} mm" if water_saved > 0 else "Lowered water demand"
                action_text = f"Replaced '{orig_name}' ({orig_water} mm) with drought-hardy '{new_name}' ({new_water} mm). {saved_str}."

            return {
                "event": "Drought / Water Deficit",
                "season": season_index,
                "summary": f"Available irrigation water dropped sharply by {deficit}%.",
                "action": action_text,
                "soil_implication": "Selected replacement maintains soil cover while conserving water."
            }

        elif event_type == "pest_outbreak":
            affected_family = context.get("affected_family") or (original_crop.get("family") if isinstance(original_crop, dict) else "affected")
            if is_final_season:
                action_text = f"Pest outbreak in Season {season_index} on {affected_family}. Quarantined for future cycles."
            elif is_same_crop:
                action_text = f"Quarantined family '{affected_family}' and re-solved CSP. Confirmed '{new_name}' is safe."
            else:
                new_fam = new_crop.get("family", "non-host") if isinstance(new_crop, dict) else "non-host"
                action_text = f"Quarantined family '{affected_family}'. Replaced with non-host alternative '{new_name}' ({new_fam})."

            return {
                "event": f"Pest Outbreak in {affected_family}",
                "season": season_index,
                "summary": f"Severe pest infestation struck {affected_family} in Season {season_index}.",
                "action": action_text,
                "soil_implication": "Starves pest population while maintaining crop productivity."
            }

        else:
            return {
                "event": "Environmental Disruption",
                "season": season_index,
                "summary": "Unexpected condition triggered automatic CSP replanning.",
                "action": f"Shifted plan from '{orig_name}' to '{new_name}'.",
                "soil_implication": "Maintains soil health under revised constraints."
            }
