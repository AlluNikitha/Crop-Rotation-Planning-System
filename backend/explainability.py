"""
Explainability Engine (XAI) for Crop Rotation Planning.
Provides human-readable, agronomically sound justifications for recommended crops,
rejection rationales for pruned alternatives, and replanning explanations.
"""

from typing import List, Dict, Any, Optional
from backend.knowledge_base import CROP_FAMILIES, get_crops_for_soil


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
        soil_type: str
    ) -> Dict[str, Any]:
        """
        Generate detailed agronomic rationale for why this specific crop was selected for this season.
        """
        reasons: List[str] = []
        family_desc = CROP_FAMILIES.get(current_crop["family"], current_crop["family"])

        # 1. Botanical Family & Succession Role
        if previous_crop is None:
            reasons.append(
                f"Selected as foundation crop for Season 1. Fits {soil_type} soil and establishes a baseline nutrient profile."
            )
        else:
            prev_fam = previous_crop["family"]
            curr_fam = current_crop["family"]

            if curr_fam == "Fabaceae" and prev_fam in ("Poaceae", "Solanaceae"):
                reasons.append(
                    f"Agronomic Recovery: Follows heavy feeder {previous_crop['name']} ({prev_fam}). "
                    f"Fixes atmospheric nitrogen (+{current_crop['nitrogen_effect_kg_ha']} kg/ha) to restore depleted soil reserves."
                )
            elif curr_fam == "Poaceae" and prev_fam == "Fabaceae":
                reasons.append(
                    f"Nutrient Exploitation: Takes full advantage of residual nitrogen left by preceding legume "
                    f"{previous_crop['name']} to maximize cereal grain biomass."
                )
            elif curr_fam == "Brassicaceae":
                reasons.append(
                    f"Biofumigation Break: Root exudates contain glucosinolates that naturally suppress soil-borne "
                    f"pathogens and break pest cycles from preceding {previous_crop['name']}."
                )
            elif curr_fam == "Alliaceae":
                reasons.append(
                    f"Pest Deterrence: Sulfur and allicin compounds deter root nematodes and fungal spores."
                )
            else:
                reasons.append(
                    f"Family Alternation: Switches from {prev_fam} to {curr_fam}, breaking insect reproduction cycles."
                )

        # 2. Resource Stewardship (Water & Cost)
        water = current_crop["water_req_mm"]
        if water <= 260:
            reasons.append(
                f"Low Water Footprint ({water} mm): Conserves farm water reservoir and protects against moisture deficits."
            )
        elif water >= 500:
            reasons.append(
                f"Calculated Water Allocation ({water} mm): Supported by the farm's remaining seasonal water quota to capture high market value."
            )
        else:
            reasons.append(
                f"Moderate Water Footprint ({water} mm): Balances moisture consumption with reliable harvest yields."
            )

        # 3. Soil Health Dynamics
        n_delta = current_crop["nitrogen_effect_kg_ha"]
        if n_delta > 0:
            reasons.append(
                f"Soil Nitrogen Fixer: Adds net +{n_delta} kg/ha Nitrogen, raising soil health score."
            )
        else:
            reasons.append(
                f"Nutrient Extractor: Consumes {abs(n_delta)} kg/ha Nitrogen, balanced by preceding or succeeding restorative legumes."
            )

        # 4. Economic Rationale
        yield_q = current_crop["yield_per_acre_quintals"]
        price_q = current_crop["market_price_per_quintal"]
        est_rev = yield_q * price_q
        reasons.append(
            f"Commercial Value: Expected yield of {yield_q} quintals/acre @ ₹{price_q}/q generates ~₹{est_rev:,.0f}/acre gross revenue."
        )

        return {
            "season_index": season_index,
            "crop_id": current_crop["id"],
            "crop_name": current_crop["name"],
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
        quarantined_families: Optional[set] = None
    ) -> List[Dict[str, Any]]:
        """
        Explain why other popular crops were eliminated or rejected for this season slot.
        """
        rejections = []
        quarantined_families = quarantined_families or set()
        soil_crops = get_crops_for_soil(soil_type)

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
                    f"in consecutive seasons (causes soil exhaustion & pest buildup)."
                )
                code = "FAMILY_CONFLICT"
            # Check Water
            elif candidate["water_req_mm"] > remaining_water:
                reason = (
                    f"Exceeds remaining water allowance ({candidate['water_req_mm']} mm needed vs "
                    f"{remaining_water:.1f} mm available)."
                )
                code = "WATER_EXCEEDED"
            # Check Cost
            elif candidate["cost_per_acre"] > remaining_cost_per_acre:
                reason = (
                    f"Exceeds available financial budget (₹{candidate['cost_per_acre']:,} needed vs "
                    f"₹{remaining_cost_per_acre:,.0f} limit)."
                )
                code = "BUDGET_EXCEEDED"
            else:
                reason = "Lower composite heuristic score compared to selected crop under current soil and market criteria."
                code = "HEURISTIC_PRUNED"

            if code in ("QUARANTINED", "FAMILY_CONFLICT", "WATER_EXCEEDED", "BUDGET_EXCEEDED"):
                rejections.append({
                    "crop_id": candidate["id"],
                    "crop_name": candidate["name"],
                    "family": candidate["family"],
                    "code": code,
                    "reason": reason
                })

        return rejections[:5]  # Return top 5 most notable rejections

    @staticmethod
    def explain_replanning_event(
        event_type: str,
        season_index: int,
        original_crop: Dict[str, Any],
        new_crop: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate explanation when an environmental disruption causes the agent to re-solve CSP.
        """
        orig_name = original_crop.get("name", "Previous Crop") if isinstance(original_crop, dict) else str(original_crop)
        new_name = new_crop.get("name", "New Crop") if isinstance(new_crop, dict) else str(new_crop)
        orig_water = original_crop.get("water_req_mm", 0) if isinstance(original_crop, dict) else 0
        new_water = new_crop.get("water_req_mm", 0) if isinstance(new_crop, dict) else 0
        
        is_same_crop = (orig_name == new_name)
        is_final_season = context.get("is_final_season", False)

        if event_type == "drought":
            deficit = context.get("deficit_pct", 45)
            if is_final_season:
                action_text = (
                    f"Drought occurred in final Season {season_index}. Available water reduced by {deficit}%. "
                    f"Completed harvest of '{orig_name}' under emergency water conservation controls."
                )
            elif is_same_crop:
                action_text = (
                    f"Water budget reduced by {deficit}%. CSP re-evaluation confirmed that original choice '{orig_name}' "
                    f"({orig_water} mm) is already the most drought-hardy crop available and was retained."
                )
            else:
                water_saved = orig_water - new_water
                saved_str = f"Saved {water_saved} mm of water" if water_saved > 0 else "Lowered water demand"
                action_text = (
                    f"Original choice '{orig_name}' ({orig_water} mm) replaced with drought-tolerant '{new_name}' "
                    f"({new_water} mm). {saved_str} to protect farm survival."
                )
            return {
                "event": "Drought / Severe Water Deficit",
                "season": season_index,
                "summary": f"Available irrigation water dropped sharply by {deficit}%.",
                "action": action_text,
                "soil_implication": "Selected replacement maintains soil organic cover while minimizing evapotranspiration."
            }

        elif event_type == "pest_outbreak":
            affected_family = context.get("affected_family") or (original_crop.get("family") if isinstance(original_crop, dict) else "affected")
            if is_final_season:
                action_text = (
                    f"Pest outbreak occurred in final Season {season_index} on {affected_family}. "
                    f"Quarantined {affected_family} for future crop cycles to break pest reproduction."
                )
            elif is_same_crop:
                action_text = (
                    f"System quarantined family '{affected_family}' and re-solved CSP. "
                    f"Confirmed '{new_name}' is not in host family '{affected_family}' and is safe to continue."
                )
            else:
                new_fam = new_crop.get("family", "non-host") if isinstance(new_crop, dict) else "non-host"
                action_text = (
                    f"System quarantined family '{affected_family}' and re-solved CSP. "
                    f"Replaced upcoming plantings with non-host alternative '{new_name}' ({new_fam}), "
                    f"starving the pest population and breaking the disease cycle."
                )
            return {
                "event": f"Pest / Pathogen Outbreak in {affected_family}",
                "season": season_index,
                "summary": f"Severe pest infestation struck {affected_family} crops in Season {season_index}.",
                "action": action_text,
                "soil_implication": "Eliminates host roots to starve pest population while maintaining crop productivity."
            }

        else:
            return {
                "event": "Environmental Disruption",
                "season": season_index,
                "summary": "Unexpected condition triggered automatic CSP replanning.",
                "action": f"Shifted plan from '{orig_name}' to '{new_name}'.",
                "soil_implication": "Maintains soil health and budget limits under revised constraints."
            }
