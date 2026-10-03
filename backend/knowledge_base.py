"""
Crop Knowledge Base for AI-Based Crop Rotation Planning System.
Contains comprehensive agronomic metadata including botanical family,
water requirements, cultivation costs, nitrogen fixing/depleting dynamics,
duration, yield, market prices, soil suitability, pest profiles, and
multi-language localization parameters.
"""

from typing import Dict, List, Any, Optional

SOIL_TYPES = [
    "Loamy",
    "Clayey",
    "Sandy",
    "Black Cotton",
    "Alluvial",
    "Red Sandy Loam"
]

LOCALIZED_SOIL_TYPES = {
    "Loamy": {
        "en": "Loamy Soil",
        "hi": "दोमट मिट्टी (Loamy Soil)",
        "te": "ఎర్ర/మేలిమి నేల (Loamy Soil)",
        "ta": "வண்டல் மண் (Loamy Soil)",
        "mr": "दुभती/मुरूम जमीन (Loamy Soil)",
        "pa": "ਦੋਮਟ ਮਿੱਟੀ (Loamy Soil)",
        "es": "Suelo Franco (Loamy Soil)"
    },
    "Clayey": {
        "en": "Clayey Soil",
        "hi": "चिकनी मिट्टी (Clayey Soil)",
        "te": "जिగురు నేల (Clayey Soil)",
        "ta": "களிமண் (Clayey Soil)",
        "mr": "चोपण/चिकण माती (Clayey Soil)",
        "pa": "ਚਿਕਣੀ ਮਿੱਟੀ (Clayey Soil)",
        "es": "Suelo Arcilloso (Clayey Soil)"
    },
    "Sandy": {
        "en": "Sandy Soil",
        "hi": "बलुई मिट्टी (Sandy Soil)",
        "te": "ఇసుక నేల (Sandy Soil)",
        "ta": "மணல் மண் (Sandy Soil)",
        "mr": "वाळूमिश्रित माती (Sandy Soil)",
        "pa": "ਰੇਤਲੀ ਮਿੱਟੀ (Sandy Soil)",
        "es": "Suelo Arenoso (Sandy Soil)"
    },
    "Black Cotton": {
        "en": "Black Cotton Soil",
        "hi": "काली मिट्टी (Black Cotton Soil)",
        "te": "నల్లరేగడి నేల (Black Cotton Soil)",
        "ta": "கரிசல் மண் (Black Cotton Soil)",
        "mr": "काळी रेगुर माती (Black Cotton Soil)",
        "pa": "ਕਾਲੀ ਮਿੱਟੀ (Black Cotton Soil)",
        "es": "Suelo Negro Algodonero (Black Cotton Soil)"
    },
    "Alluvial": {
        "en": "Alluvial Soil",
        "hi": "जलोढ़ मिट्टी (Alluvial Soil)",
        "te": "ఒండ్రు నేల (Alluvial Soil)",
        "ta": "ஆற்று வண்டல் மண் (Alluvial Soil)",
        "mr": "गाळाची माती (Alluvial Soil)",
        "pa": "ਜਲੋੜ ਮਿੱਟੀ (Alluvial Soil)",
        "es": "Suelo Aluvial (Alluvial Soil)"
    },
    "Red Sandy Loam": {
        "en": "Red Sandy Loam",
        "hi": "लाल बलुई दोमट (Red Sandy Loam)",
        "te": "ఎర్ర ఇసుక రేగడి (Red Sandy Loam)",
        "ta": "செம்மண் வண்டல் (Red Sandy Loam)",
        "mr": "तांबडी मुरमाड माती (Red Sandy Loam)",
        "pa": "ਲਾਲ ਰੇਤਲੀ ਮਿੱਟੀ (Red Sandy Loam)",
        "es": "Franco Arenoso Rojo (Red Sandy Loam)"
    }
}

CROP_FAMILIES = {
    "Fabaceae": "Legumes (Nitrogen fixers, restorative, breaks pest cycles)",
    "Poaceae": "Grasses & Cereals (High biomass, heavy nitrogen feeders)",
    "Solanaceae": "Nightshades (Heavy nutrient extractors, susceptible to root nematodes/blights)",
    "Brassicaceae": "Crucifers (Biofumigant glucosinolates in root exudates suppress soil pathogens)",
    "Malvaceae": "Mallows (Deep taproot system, breaks hardpan, high resource demand)",
    "Asteraceae": "Composites (Deep rooting, moderate water requirements)",
    "Cucurbitaceae": "Gourds & Melons (Quick growing surface cover, shallow rooting)",
    "Alliaceae": "Alliums (Natural pest repellent properties, sulfur users)"
}

LOCALIZED_FAMILY_NAMES = {
    "Fabaceae": {
        "en": "Fabaceae (Legumes / N-Fixers)",
        "hi": "फेबेसी (दलहन / नाइट्रोजन स्थिरीकरण)",
        "te": "ఫాబేసీ (పప్పుధాన్యాలు / నత్రజని స్థిరీకరణ)",
        "ta": "ஃபேபேசி (பருப்பு வகைகள் / நைட்ரஜன் நிலைநிறுத்தம்)",
        "mr": "फॅबेसी (डाळी / नायट्रोजन स्थिर करणारे)",
        "pa": "ਫੈਬੇਸੀ (ਦਾਲਾਂ / ਨਾਈਟ੍ਰੋਜਨ ਸਥਿਰਤਾ)",
        "es": "Fabaceae (Leguminosas / Fijadoras de N)"
    },
    "Poaceae": {
        "en": "Poaceae (Cereals & Grasses)",
        "hi": "पोएसी (अनाज और घास)",
        "te": "పోయేసీ (ధాన్యాలు & గడ్డి)",
        "ta": "போயேசி (தானியங்கள் & புற்கள்)",
        "mr": "पोएसी (तृणधान्ये आणि गवत)",
        "pa": "ਪੋਏਸੀ (ਅਨਾਜ ਅਤੇ ਘਾਹ)",
        "es": "Poaceae (Cereales y Gramíneas)"
    },
    "Solanaceae": {
        "en": "Solanaceae (Nightshades)",
        "hi": "सोलेनेसी (सब्जियां / आलू-टमाटर)",
        "te": "సొలనేసీ (బంగాళాదుంప, టమాటా వర్గం)",
        "ta": "சொலனேசி (தக்காளி, உருளைக் கிழங்கு)",
        "mr": "सोलेनेसी (बटाटा-टोमॅटो वर्ग)",
        "pa": "ਸੋਲੇਨੇਸੀ (ਟਮਾਟਰ-ਆਲੂ ਪਰਿਵਾਰ)",
        "es": "Solanaceae (Solanáceas)"
    },
    "Brassicaceae": {
        "en": "Brassicaceae (Crucifers / Biofumigants)",
        "hi": "ब्रेसिकेसी (सरसों / जैव-धूपन)",
        "te": "బ్రాసికేసీ (ఆవాలు వర్గం / సహజ కీటక నాశిని)",
        "ta": "பிராசிகேசி (கடுகு / இயற்கை கிருமிநாசினி)",
        "mr": "ब्रासिकेसी (मोहरी / सेंद्रिय कीटकनाशक)",
        "pa": "ਬ੍ਰੈਸਿਕੇਸੀ (ਸਰ੍ਹੋਂ / ਜੈਵਿਕ ਧੂਫ)",
        "es": "Brassicaceae (Crucíferas / Biofumigantes)"
    },
    "Malvaceae": {
        "en": "Malvaceae (Cotton / Mallows)",
        "hi": "मालवेसी (कपास वर्ग)",
        "te": "మాల్వేసీ (పత్తి వర్గం)",
        "ta": "மால்வேசி (பருத்தி குடும்பம்)",
        "mr": "माल्व्हेसी (कापूस वर्ग)",
        "pa": "ਮਾਲਵੇਸੀ (ਕਪਾਹ ਪਰਿਵਾਰ)",
        "es": "Malvaceae (Algodón / Malváceas)"
    },
    "Asteraceae": {
        "en": "Asteraceae (Composites / Sunflower)",
        "hi": "एस्टरेसी (सूरजमुखी वर्ग)",
        "te": "ఆస్టరేసీ (పొద్దుతిరుగుడు వర్గం)",
        "ta": "ஆஸ்டரேசி (சூரியகாந்தி குடும்பம்)",
        "mr": "ॲस्टरेसी (सूर्यफूल वर्ग)",
        "pa": "ਐਸਟਰੇਸੀ (ਸੂਰਜਮੁਖੀ ਪਰਿਵਾਰ)",
        "es": "Asteraceae (Compuestas / Girasol)"
    },
    "Cucurbitaceae": {
        "en": "Cucurbitaceae (Gourds & Melons)",
        "hi": "कुकरबिटेसी (लता फसलें / खीरा-कद्दू)",
        "te": "కుకర్బిటేసీ (పాదు పంటలు / దోస-గుమ్మడి)",
        "ta": "குகர்பிட்டேசி (கொடி காய்கறிகள்)",
        "mr": "कुकुरबिटेसी (वेली पिके / काकडी-भोपळा)",
        "pa": "ਕੁਕਰਬਿਟੇਸੀ (ਕੱਦੂ-ਖੀਰਾ ਪਰਿਵਾਰ)",
        "es": "Cucurbitaceae (Cucurbitáceas / Melones)"
    },
    "Alliaceae": {
        "en": "Alliaceae (Alliums / Onion)",
        "hi": "एलियेसी (प्याज-लहसुन वर्ग)",
        "te": "అల్లియేసీ (ఉల్లి-వెల్లుల్లి వర్గం)",
        "ta": "அல்லியேசி (வெங்காயம்-பூண்டு)",
        "mr": "ॲलिएसी (कांदा-लसूण वर्ग)",
        "pa": "ਐਲੀਏਸੀ (ਗੰਢਾ-ਲਸਣ ਪਰਿਵਾਰ)",
        "es": "Alliaceae (Aliáceas / Cebollas)"
    }
}

CROPS: Dict[str, Dict[str, Any]] = {
    "chickpea": {
        "id": "chickpea",
        "name": "Chickpea (Bengal Gram)",
        "family": "Fabaceae",
        "category": "Pulse / Legume",
        "water_req_mm": 250,
        "cost_per_acre": 11000,
        "yield_per_acre_quintals": 8.5,
        "market_price_per_quintal": 5440,
        "nitrogen_effect_kg_ha": 38,
        "soil_health_delta": 14,
        "duration_days": 110,
        "season_affinity": ["Rabi", "Winter"],
        "suitable_soils": ["Loamy", "Clayey", "Black Cotton", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Pod Borer"],
        "agronomic_benefit": "Enriches soil with atmospheric nitrogen; excellent preceding crop for wheat/maize.",
        "names": {
            "en": "Chickpea (Bengal Gram)",
            "hi": "चना (Chickpea / Bengal Gram)",
            "te": "శనగలు (Chickpea / Senagalu)",
            "ta": "கொண்டைக்கடலை (Chickpea)",
            "mr": "हरभरा (Chickpea / Harbhara)",
            "pa": "ਛੋਲੇ (Chickpea / Chana)",
            "es": "Garbanzo (Chickpea)"
        }
    },
    "pigeon_pea": {
        "id": "pigeon_pea",
        "name": "Pigeon Pea (Arhar / Tur)",
        "family": "Fabaceae",
        "category": "Pulse / Legume",
        "water_req_mm": 380,
        "cost_per_acre": 12500,
        "yield_per_acre_quintals": 7.5,
        "market_price_per_quintal": 7000,
        "nitrogen_effect_kg_ha": 42,
        "soil_health_delta": 16,
        "duration_days": 150,
        "season_affinity": ["Kharif", "Rainy"],
        "suitable_soils": ["Loamy", "Black Cotton", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Pod Borer", "Wilt"],
        "agronomic_benefit": "Deep root system loosens subsoil and fixes abundant nitrogen.",
        "names": {
            "en": "Pigeon Pea (Arhar / Tur)",
            "hi": "अरहर / तूर (Pigeon Pea)",
            "te": "కందులు (Pigeon Pea / Kandulu)",
            "ta": "துவரம் பருப்பு (Pigeon Pea)",
            "mr": "तूर (Pigeon Pea / Tur)",
            "pa": "ਅਰਹਰ (Pigeon Pea)",
            "es": "Guandul / Arveja (Pigeon Pea)"
        }
    },
    "green_gram": {
        "id": "green_gram",
        "name": "Green Gram (Moong)",
        "family": "Fabaceae",
        "category": "Pulse / Legume",
        "water_req_mm": 210,
        "cost_per_acre": 8500,
        "yield_per_acre_quintals": 5.5,
        "market_price_per_quintal": 8550,
        "nitrogen_effect_kg_ha": 30,
        "soil_health_delta": 12,
        "duration_days": 70,
        "season_affinity": ["Zaid", "Summer", "Kharif"],
        "suitable_soils": ["Loamy", "Sandy", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Yellow Mosaic Virus"],
        "agronomic_benefit": "Fast 70-day catch crop that quickly restores depleted soil organic carbon and nitrogen.",
        "names": {
            "en": "Green Gram (Moong)",
            "hi": "मूंग (Green Gram / Moong)",
            "te": "పెసలు (Green Gram / Pesalu)",
            "ta": "பாசிப்பயறு (Green Gram)",
            "mr": "मूग (Green Gram / Moong)",
            "pa": "ਮੂੰਗੀ (Green Gram)",
            "es": "Judía Mungo (Green Gram)"
        }
    },
    "black_gram": {
        "id": "black_gram",
        "name": "Black Gram (Urad)",
        "family": "Fabaceae",
        "category": "Pulse / Legume",
        "water_req_mm": 230,
        "cost_per_acre": 8800,
        "yield_per_acre_quintals": 5.2,
        "market_price_per_quintal": 6950,
        "nitrogen_effect_kg_ha": 32,
        "soil_health_delta": 12,
        "duration_days": 80,
        "season_affinity": ["Kharif", "Rabi"],
        "suitable_soils": ["Loamy", "Clayey", "Black Cotton", "Alluvial"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Whitefly", "Leaf Crinkle"],
        "agronomic_benefit": "Dense canopy smothers weeds, conserves moisture, and fixes nitrogen.",
        "names": {
            "en": "Black Gram (Urad)",
            "hi": "उड़द (Black Gram / Urad)",
            "te": "మినుములు (Black Gram / Minumulu)",
            "ta": "உளுந்து (Black Gram)",
            "mr": "उडीद (Black Gram / Udid)",
            "pa": "ਮਾਂਹ (Black Gram / Urad)",
            "es": "Lenteja Negra / Urad (Black Gram)"
        }
    },
    "soybean": {
        "id": "soybean",
        "name": "Soybean",
        "family": "Fabaceae",
        "category": "Oilseed / Legume",
        "water_req_mm": 420,
        "cost_per_acre": 13500,
        "yield_per_acre_quintals": 9.5,
        "market_price_per_quintal": 4890,
        "nitrogen_effect_kg_ha": 36,
        "soil_health_delta": 13,
        "duration_days": 105,
        "season_affinity": ["Kharif", "Rainy"],
        "suitable_soils": ["Loamy", "Clayey", "Black Cotton", "Alluvial"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Stem Fly", "Girdle Beetle"],
        "agronomic_benefit": "High protein oilseed with substantial nodulation, replenishing soil nitrogen reserve.",
        "names": {
            "en": "Soybean",
            "hi": "सोयाबीन (Soybean)",
            "te": "సోయాచిక్కుడు (Soybean)",
            "ta": "சோயாபீன்ஸ் (Soybean)",
            "mr": "सोयाबीन (Soybean)",
            "pa": "ਸੋਇਆਬੀਨ (Soybean)",
            "es": "Soja / Soya (Soybean)"
        }
    },
    "groundnut": {
        "id": "groundnut",
        "name": "Groundnut (Peanut)",
        "family": "Fabaceae",
        "category": "Oilseed / Legume",
        "water_req_mm": 460,
        "cost_per_acre": 16000,
        "yield_per_acre_quintals": 11.0,
        "market_price_per_quintal": 6370,
        "nitrogen_effect_kg_ha": 26,
        "soil_health_delta": 10,
        "duration_days": 115,
        "season_affinity": ["Kharif", "Rabi"],
        "suitable_soils": ["Sandy", "Loamy", "Red Sandy Loam", "Alluvial"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Tikka Disease", "Leaf Miner"],
        "agronomic_benefit": "Aerates soil during peg development and contributes residual nitrogen.",
        "names": {
            "en": "Groundnut (Peanut)",
            "hi": "मूंगफली (Groundnut / Peanut)",
            "te": "వేరుశనగ (Groundnut / Verusenaga)",
            "ta": "நிலக்கடலை (Groundnut)",
            "mr": "भुईमूग (Groundnut / Bhuimug)",
            "pa": "ਮੂੰਗਫਲੀ (Groundnut)",
            "es": "Maní / Cacahuate (Groundnut)"
        }
    },
    "lentil": {
        "id": "lentil",
        "name": "Lentil (Masoor)",
        "family": "Fabaceae",
        "category": "Pulse / Legume",
        "water_req_mm": 220,
        "cost_per_acre": 9500,
        "yield_per_acre_quintals": 6.5,
        "market_price_per_quintal": 6420,
        "nitrogen_effect_kg_ha": 30,
        "soil_health_delta": 11,
        "duration_days": 105,
        "season_affinity": ["Rabi", "Winter"],
        "suitable_soils": ["Loamy", "Clayey", "Alluvial", "Black Cotton"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Rust", "Aphids"],
        "agronomic_benefit": "Low input cost, excellent cold resilience, and improves soil structure.",
        "names": {
            "en": "Lentil (Masoor)",
            "hi": "मसूर (Lentil / Masoor)",
            "te": "మసూర్ పప్పు (Lentil)",
            "ta": "மைசூர் பருப்பு (Lentil)",
            "mr": "मसूर (Lentil / Masoor)",
            "pa": "ਮਸਰਾਂ (Lentil)",
            "es": "Lenteja (Lentil)"
        }
    },
    "wheat": {
        "id": "wheat",
        "name": "Wheat",
        "family": "Poaceae",
        "category": "Cereal",
        "water_req_mm": 400,
        "cost_per_acre": 14000,
        "yield_per_acre_quintals": 18.0,
        "market_price_per_quintal": 2275,
        "nitrogen_effect_kg_ha": -40,
        "soil_health_delta": -8,
        "duration_days": 125,
        "season_affinity": ["Rabi", "Winter"],
        "suitable_soils": ["Loamy", "Clayey", "Alluvial", "Black Cotton"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Rust", "Karnal Bunt", "Termites"],
        "agronomic_benefit": "Staple cereal with guaranteed market demand; requires preceding legume for maximum yield.",
        "names": {
            "en": "Wheat",
            "hi": "गेहूं (Wheat / Gehun)",
            "te": "గోధుమలు (Wheat / Godhumalu)",
            "ta": "கோதுமை (Wheat)",
            "mr": "गहू (Wheat / Gahu)",
            "pa": "ਕਣਕ (Wheat / Kanak)",
            "es": "Trigo (Wheat)"
        }
    },
    "rice": {
        "id": "rice",
        "name": "Paddy (Rice)",
        "family": "Poaceae",
        "category": "Cereal",
        "water_req_mm": 1050,
        "cost_per_acre": 19500,
        "yield_per_acre_quintals": 22.0,
        "market_price_per_quintal": 2300,
        "nitrogen_effect_kg_ha": -52,
        "soil_health_delta": -12,
        "duration_days": 130,
        "season_affinity": ["Kharif", "Rainy"],
        "suitable_soils": ["Clayey", "Loamy", "Alluvial", "Black Cotton"],
        "drought_tolerance": "Low",
        "pest_susceptibility": ["Stem Borer", "Brown Planthopper", "Blast"],
        "agronomic_benefit": "High gross revenue in water-abundant zones; leaves stubble needing microbial decomposition.",
        "names": {
            "en": "Paddy (Rice)",
            "hi": "धान / चावल (Paddy / Rice)",
            "te": "వరి / బియ్యం (Paddy / Rice)",
            "ta": "நெல்லு / அரிசி (Paddy / Rice)",
            "mr": "भात / तांदूळ (Paddy / Rice)",
            "pa": "ਝੋਨਾ / ਚਾਵਲ (Paddy / Rice)",
            "es": "Arroz (Paddy / Rice)"
        }
    },
    "maize": {
        "id": "maize",
        "name": "Maize (Corn)",
        "family": "Poaceae",
        "category": "Cereal",
        "water_req_mm": 480,
        "cost_per_acre": 13000,
        "yield_per_acre_quintals": 24.0,
        "market_price_per_quintal": 2090,
        "nitrogen_effect_kg_ha": -45,
        "soil_health_delta": -9,
        "duration_days": 105,
        "season_affinity": ["Kharif", "Rabi", "Spring"],
        "suitable_soils": ["Loamy", "Sandy", "Alluvial", "Red Sandy Loam", "Black Cotton"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Fall Armyworm", "Stem Borer"],
        "agronomic_benefit": "High biomass producer and versatile feeder; responsive to balanced soil nutrients.",
        "names": {
            "en": "Maize (Corn)",
            "hi": "मक्का (Maize / Corn)",
            "te": "మొక్కజొన్న (Maize / Mokkajonna)",
            "ta": "மக்காச்சோளம் (Maize)",
            "mr": "मका (Maize / Maka)",
            "pa": "ਮੱਕੀ (Maize / Makki)",
            "es": "Maíz (Corn)"
        }
    },
    "pearl_millet": {
        "id": "pearl_millet",
        "name": "Pearl Millet (Bajra)",
        "family": "Poaceae",
        "category": "Nutri-Cereal / Millet",
        "water_req_mm": 240,
        "cost_per_acre": 8200,
        "yield_per_acre_quintals": 12.0,
        "market_price_per_quintal": 2500,
        "nitrogen_effect_kg_ha": -24,
        "soil_health_delta": -4,
        "duration_days": 85,
        "season_affinity": ["Kharif", "Rainy"],
        "suitable_soils": ["Sandy", "Red Sandy Loam", "Loamy", "Alluvial"],
        "drought_tolerance": "Very High",
        "pest_susceptibility": ["Downy Mildew", "Ergot"],
        "agronomic_benefit": "Extraordinarily climate-resilient; thrives under severe water stress and poor soils.",
        "names": {
            "en": "Pearl Millet (Bajra)",
            "hi": "बाजरा (Pearl Millet / Bajra)",
            "te": "సజ్జలు (Pearl Millet / Sajjalu)",
            "ta": "கம்பு (Pearl Millet)",
            "mr": "बाजरी (Pearl Millet / Bajri)",
            "pa": "ਬਾਜਰਾ (Pearl Millet)",
            "es": "Mijo Perla (Pearl Millet)"
        }
    },
    "sorghum": {
        "id": "sorghum",
        "name": "Sorghum (Jowar)",
        "family": "Poaceae",
        "category": "Nutri-Cereal / Millet",
        "water_req_mm": 300,
        "cost_per_acre": 8800,
        "yield_per_acre_quintals": 13.0,
        "market_price_per_quintal": 3180,
        "nitrogen_effect_kg_ha": -28,
        "soil_health_delta": -5,
        "duration_days": 100,
        "season_affinity": ["Kharif", "Rabi"],
        "suitable_soils": ["Clayey", "Black Cotton", "Loamy", "Alluvial"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Shoot Fly", "Grain Mold"],
        "agronomic_benefit": "Deep fibrous root system extracts residual nutrients and resists dry spells.",
        "names": {
            "en": "Sorghum (Jowar)",
            "hi": "ज्वार (Sorghum / Jowar)",
            "te": "జొన్నలు (Sorghum / Jonnalu)",
            "ta": "சோளம் (Sorghum)",
            "mr": "ज्वारी (Sorghum / Jwari)",
            "pa": "ਜਵਾਰ (Sorghum)",
            "es": "Sorgo (Sorghum)"
        }
    },
    "barley": {
        "id": "barley",
        "name": "Barley (Jau)",
        "family": "Poaceae",
        "category": "Cereal",
        "water_req_mm": 290,
        "cost_per_acre": 9500,
        "yield_per_acre_quintals": 14.0,
        "market_price_per_quintal": 1850,
        "nitrogen_effect_kg_ha": -30,
        "soil_health_delta": -6,
        "duration_days": 115,
        "season_affinity": ["Rabi", "Winter"],
        "suitable_soils": ["Sandy", "Loamy", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Aphids", "Covered Smut"],
        "agronomic_benefit": "Highly tolerant to salinity and semi-arid conditions; low input cost.",
        "names": {
            "en": "Barley (Jau)",
            "hi": "जौ (Barley / Jau)",
            "te": "బార్లీ (Barley)",
            "ta": "வாற்கோதுமை (Barley)",
            "mr": "जव (Barley / Jau)",
            "pa": "ਜੌਂ (Barley)",
            "es": "Cebada (Barley)"
        }
    },
    "tomato": {
        "id": "tomato",
        "name": "Tomato",
        "family": "Solanaceae",
        "category": "Vegetable / Cash Crop",
        "water_req_mm": 520,
        "cost_per_acre": 26000,
        "yield_per_acre_quintals": 110.0,
        "market_price_per_quintal": 1200,
        "nitrogen_effect_kg_ha": -48,
        "soil_health_delta": -10,
        "duration_days": 120,
        "season_affinity": ["Kharif", "Rabi", "Spring"],
        "suitable_soils": ["Loamy", "Sandy", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "Low",
        "pest_susceptibility": ["Early Blight", "Fruit Borer", "Root Knot Nematode"],
        "agronomic_benefit": "Very high gross economic returns; sensitive to continuous Solanaceae cropping.",
        "names": {
            "en": "Tomato",
            "hi": "टमाटर (Tomato)",
            "te": "టమాటా (Tomato)",
            "ta": "தக்காளி (Tomato)",
            "mr": "टोमॅटो (Tomato)",
            "pa": "ਟਮਾਟਰ (Tomato)",
            "es": "Tomate (Tomato)"
        }
    },
    "potato": {
        "id": "potato",
        "name": "Potato",
        "family": "Solanaceae",
        "category": "Vegetable / Tuber",
        "water_req_mm": 450,
        "cost_per_acre": 28000,
        "yield_per_acre_quintals": 95.0,
        "market_price_per_quintal": 1150,
        "nitrogen_effect_kg_ha": -50,
        "soil_health_delta": -11,
        "duration_days": 95,
        "season_affinity": ["Rabi", "Winter"],
        "suitable_soils": ["Sandy", "Loamy", "Alluvial"],
        "drought_tolerance": "Low",
        "pest_susceptibility": ["Late Blight", "Tuber Moth"],
        "agronomic_benefit": "High carbohydrate yield; requires loose friable soil, leaves good residual tilth.",
        "names": {
            "en": "Potato",
            "hi": "आलू (Potato)",
            "te": "బంగాళాదుంప (Potato)",
            "ta": "உருளைக்கிழங்கு (Potato)",
            "mr": "बटाटा (Potato)",
            "pa": "ਆਲੂ (Potato)",
            "es": "Patata / Papa (Potato)"
        }
    },
    "brinjal": {
        "id": "brinjal",
        "name": "Brinjal (Eggplant)",
        "family": "Solanaceae",
        "category": "Vegetable",
        "water_req_mm": 470,
        "cost_per_acre": 20000,
        "yield_per_acre_quintals": 80.0,
        "market_price_per_quintal": 1300,
        "nitrogen_effect_kg_ha": -42,
        "soil_health_delta": -9,
        "duration_days": 130,
        "season_affinity": ["Kharif", "Rabi"],
        "suitable_soils": ["Loamy", "Clayey", "Black Cotton", "Alluvial"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Shoot and Fruit Borer", "Bacterial Wilt"],
        "agronomic_benefit": "Long harvesting window with steady cash flow for farm households.",
        "names": {
            "en": "Brinjal (Eggplant)",
            "hi": "बैंगन (Brinjal / Eggplant)",
            "te": "వంకాయ (Brinjal / Vankaya)",
            "ta": "கத்தரிக்காய் (Brinjal)",
            "mr": "वांगे (Brinjal / Vange)",
            "pa": "ਬੈਂਗਣ (Brinjal)",
            "es": "Berenjena (Eggplant)"
        }
    },
    "mustard": {
        "id": "mustard",
        "name": "Mustard (Sarson / Rapeseed)",
        "family": "Brassicaceae",
        "category": "Oilseed",
        "water_req_mm": 270,
        "cost_per_acre": 10500,
        "yield_per_acre_quintals": 7.8,
        "market_price_per_quintal": 5650,
        "nitrogen_effect_kg_ha": -26,
        "soil_health_delta": 4,
        "duration_days": 110,
        "season_affinity": ["Rabi", "Winter"],
        "suitable_soils": ["Loamy", "Alluvial", "Sandy", "Clayey"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Aphids", "White Rust"],
        "agronomic_benefit": "Produces glucosinolate root exudates acting as biofumigants, suppressing soil pests.",
        "names": {
            "en": "Mustard (Sarson)",
            "hi": "सरसों (Mustard / Sarson)",
            "te": "ఆవాలు (Mustard / Aavalu)",
            "ta": "கடுகு (Mustard)",
            "mr": "मोहरी (Mustard / Mohari)",
            "pa": "ਸਰ੍ਹੋਂ (Mustard / Sarson)",
            "es": "Mostaza (Mustard)"
        }
    },
    "cabbage": {
        "id": "cabbage",
        "name": "Cabbage",
        "family": "Brassicaceae",
        "category": "Vegetable",
        "water_req_mm": 370,
        "cost_per_acre": 17500,
        "yield_per_acre_quintals": 85.0,
        "market_price_per_quintal": 850,
        "nitrogen_effect_kg_ha": -32,
        "soil_health_delta": 2,
        "duration_days": 85,
        "season_affinity": ["Rabi", "Winter"],
        "suitable_soils": ["Loamy", "Clayey", "Alluvial"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Diamondback Moth"],
        "agronomic_benefit": "Excellent rotational crop that breaks cereal disease cycles and improves soil structure.",
        "names": {
            "en": "Cabbage",
            "hi": "पत्तागोभी (Cabbage)",
            "te": "క్యాబేజీ (Cabbage)",
            "ta": "முட்டைக்கோஸ் (Cabbage)",
            "mr": "कोबी (Cabbage)",
            "pa": "ਬੰਦ ਗੋਭੀ (Cabbage)",
            "es": "Repollo / Col (Cabbage)"
        }
    },
    "cotton": {
        "id": "cotton",
        "name": "Cotton",
        "family": "Malvaceae",
        "category": "Cash / Fibre Crop",
        "water_req_mm": 650,
        "cost_per_acre": 22000,
        "yield_per_acre_quintals": 8.5,
        "market_price_per_quintal": 7120,
        "nitrogen_effect_kg_ha": -44,
        "soil_health_delta": -8,
        "duration_days": 160,
        "season_affinity": ["Kharif", "Rainy"],
        "suitable_soils": ["Black Cotton", "Clayey", "Loamy", "Alluvial"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Pink Bollworm", "Whitefly"],
        "agronomic_benefit": "Deep taproot breaks hardpans; high commercial value but demands soil resting after harvest.",
        "names": {
            "en": "Cotton",
            "hi": "कपास / सूती (Cotton / Kapas)",
            "te": "పత్తి (Cotton / Patti)",
            "ta": "பருத்தி (Cotton)",
            "mr": "कापूस (Cotton / Kapus)",
            "pa": "ਕਪਾਹ (Cotton / Kapah)",
            "es": "Algodón (Cotton)"
        }
    },
    "sunflower": {
        "id": "sunflower",
        "name": "Sunflower",
        "family": "Asteraceae",
        "category": "Oilseed",
        "water_req_mm": 350,
        "cost_per_acre": 11500,
        "yield_per_acre_quintals": 7.0,
        "market_price_per_quintal": 6760,
        "nitrogen_effect_kg_ha": -28,
        "soil_health_delta": -3,
        "duration_days": 95,
        "season_affinity": ["Kharif", "Rabi", "Zaid"],
        "suitable_soils": ["Loamy", "Black Cotton", "Clayey", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "High",
        "pest_susceptibility": ["Head Borer", "Alternaria"],
        "agronomic_benefit": "Efficient subsoil moisture scavenger with wide adaptability across seasons.",
        "names": {
            "en": "Sunflower",
            "hi": "सूरजमुखी (Sunflower)",
            "te": "పొద్దుతిరుగుడు (Sunflower / Poddutirugudu)",
            "ta": "சூரியகாந்தி (Sunflower)",
            "mr": "सूर्यफूल (Sunflower)",
            "pa": "ਸੂਰਜਮੁਖੀ (Sunflower)",
            "es": "Girasol (Sunflower)"
        }
    },
    "cucumber": {
        "id": "cucumber",
        "name": "Cucumber",
        "family": "Cucurbitaceae",
        "category": "Vegetable",
        "water_req_mm": 310,
        "cost_per_acre": 13000,
        "yield_per_acre_quintals": 48.0,
        "market_price_per_quintal": 1400,
        "nitrogen_effect_kg_ha": -20,
        "soil_health_delta": 3,
        "duration_days": 65,
        "season_affinity": ["Zaid", "Summer", "Kharif"],
        "suitable_soils": ["Sandy", "Loamy", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Fruit Fly", "Downy Mildew"],
        "agronomic_benefit": "Rapid growth cycle, acts as summer green cover, minimizes evaporation losses.",
        "names": {
            "en": "Cucumber",
            "hi": "खीरा (Cucumber / Kheera)",
            "te": "దోసకాయ (Cucumber / Dosakaya)",
            "ta": "வெள்ளரிக்காய் (Cucumber)",
            "mr": "काकडी (Cucumber / Kakdi)",
            "pa": "ਖੀਰਾ (Cucumber)",
            "es": "Pepino (Cucumber)"
        }
    },
    "onion": {
        "id": "onion",
        "name": "Onion",
        "family": "Alliaceae",
        "category": "Vegetable / Bulb",
        "water_req_mm": 410,
        "cost_per_acre": 23000,
        "yield_per_acre_quintals": 72.0,
        "market_price_per_quintal": 1600,
        "nitrogen_effect_kg_ha": -22,
        "soil_health_delta": 4,
        "duration_days": 120,
        "season_affinity": ["Rabi", "Kharif"],
        "suitable_soils": ["Loamy", "Alluvial", "Red Sandy Loam"],
        "drought_tolerance": "Medium",
        "pest_susceptibility": ["Thrips", "Purple Blotch"],
        "agronomic_benefit": "Sulfur compounds deter recurring soil nematode pests and fungal spores.",
        "names": {
            "en": "Onion",
            "hi": "प्याज (Onion / Pyaz)",
            "te": "ఉల్లిపాయ (Onion / Ullipaya)",
            "ta": "வெங்காயம் (Onion)",
            "mr": "कांदा (Onion / Kanda)",
            "pa": "ਗੰਢਾ (Onion / Pyaz)",
            "es": "Cebolla (Onion)"
        }
    }
}

PRESET_SCENARIOS = {
    "semi_arid_deccan": {
        "id": "semi_arid_deccan",
        "title": "Semi-Arid Deccan Plateau",
        "description": "Rainfed smallholder facing low water availability and limited budget. Needs drought-resilient legumes and millets.",
        "land_size_acres": 2.0,
        "soil_type": "Black Cotton",
        "water_budget_mm": 900,
        "cost_budget": 70000,
        "seasons_count": 3,
        "initial_soil_health": 55,
        "titles": {
            "en": "Semi-Arid Deccan Plateau",
            "hi": "शुष्क दक्कन का पठार (Semi-Arid Deccan)",
            "te": "అర్ధ-శుష్క డెక్కన్ పీఠభూమి",
            "ta": "அரை வறண்ட தக்காண பீடபூமி",
            "mr": "निम-शुष्क दख्खनचे पठार",
            "pa": "ਅਰਧ-ਸ਼ੁਸ਼ਕ ਦੱਖਣੀ ਪਠਾਰ",
            "es": "Meseta Semiárida del Decán"
        }
    },
    "indo_gangetic": {
        "id": "indo_gangetic",
        "title": "Indo-Gangetic Alluvial Plain",
        "description": "Productive alluvial soils seeking to break repetitive cereal monoculture with legumes and biofumigant mustard.",
        "land_size_acres": 3.0,
        "soil_type": "Alluvial",
        "water_budget_mm": 2000,
        "cost_budget": 160000,
        "seasons_count": 4,
        "initial_soil_health": 65,
        "titles": {
            "en": "Indo-Gangetic Alluvial Plain",
            "hi": "सिंधु-गंगा का मैदानी क्षेत्र (Indo-Gangetic Plain)",
            "te": "సింధు-గంగా ఒండ్రు మైదానం",
            "ta": "சிந்து-கங்கை ஆற்று சமவெளி",
            "mr": "सिंधू-गंगा सुपीक मैदान",
            "pa": "ਇੰਡੋ-ਗੰਗਾ ਦਾ ਜਲੋੜੀ ਮੈਦਾਨ",
            "es": "Llanura Aluvial Indo-Gangética"
        }
    },
    "commercial_horticulture": {
        "id": "commercial_horticulture",
        "title": "Commercial Diversified Farm",
        "description": "Adequate capital and irrigation, aiming to maximize profit while sustaining soil health via pulse-cereal-vegetable rotation.",
        "land_size_acres": 2.0,
        "soil_type": "Loamy",
        "water_budget_mm": 1500,
        "cost_budget": 120000,
        "seasons_count": 3,
        "initial_soil_health": 70,
        "titles": {
            "en": "Commercial Diversified Farm",
            "hi": "व्यावसायिक बहु-फसली कृषि (Commercial Farm)",
            "te": "వాణిజ్య వైవిధ్యభరిత వ్యవసాయం",
            "ta": "வணிக ரீதியிலான பலபயிர் பண்ணை",
            "mr": "व्यावसायिक विविध पीक शेती",
            "pa": "ਵਪਾਰਕ ਵਿਭਿੰਨ ਖੇਤੀ",
            "es": "Granja Diversificada Comercial"
        }
    },
    "drought_stressed_sandy": {
        "id": "drought_stressed_sandy",
        "title": "Drought-Stressed Rainfed Plot",
        "description": "Coarse sandy soil with strict water limits and vulnerable soil organic carbon. Requires high-resilience planning.",
        "land_size_acres": 1.5,
        "soil_type": "Sandy",
        "water_budget_mm": 800,
        "cost_budget": 50000,
        "seasons_count": 3,
        "initial_soil_health": 48,
        "titles": {
            "en": "Drought-Stressed Rainfed Plot",
            "hi": "सूखाग्रस्त बारानी खेत (Drought Rainfed Plot)",
            "te": "వర్షాధార కరువు ప్రాంతం",
            "ta": "வறட்சி நிலவும் மானாவாரி நிலம்",
            "mr": "दुष्काळग्रस्त कोरडवाहू शेत",
            "pa": "ਸੂਖਾ ਪ੍ਰਭਾਵਿਤ ਬਾਰਾਨੀ ਖੇਤ",
            "es": "Parcela de Secano con Estrés Hídrico"
        }
    }
}


def get_crop(crop_id: str, lang: str = "en") -> Dict[str, Any]:
    """Retrieve crop by ID with localized attributes."""
    crop = CROPS.get(crop_id)
    if not crop:
        return None
    c = dict(crop)
    if "names" in c and lang in c["names"]:
        c["name"] = c["names"][lang]
    return c


def get_crops_for_soil(soil_type: str, lang: str = "en") -> List[Dict[str, Any]]:
    """Return all crops suitable for a given soil type with optional localization."""
    return [get_crop(c["id"], lang=lang) for c in CROPS.values() if soil_type in c["suitable_soils"]]


def get_all_crops(lang: str = "en") -> List[Dict[str, Any]]:
    """Return all crops localized."""
    return [get_crop(cid, lang=lang) for cid in CROPS.keys()]


def get_all_presets(lang: str = "en") -> Dict[str, Any]:
    """Return preset scenarios with localized titles."""
    res = {}
    for pid, preset in PRESET_SCENARIOS.items():
        p = dict(preset)
        if "titles" in p and lang in p["titles"]:
            p["title"] = p["titles"][lang]
        res[pid] = p
    return res
