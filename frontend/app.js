/**
 * AI-Based Crop Rotation Planning System - Frontend Logic v3.0
 * Manages UI interactions, CSP solver integration, multi-attribute heuristic evaluation,
 * closed-loop simulation state machine, disruption injection, Chart.js analytics,
 * multi-language i18n engine (EN, HI, TE, TA, MR, PA, ES), and AI Copilot chat.
 */

// =============================================
// Global Application State
// =============================================
const state = {
  currentPlanData: null,
  activePlanIndex: 0,
  activeSessionId: null,
  simulationState: null,
  cropKnowledgeBase: [],
  families: {},
  presets: {},
  currentLang: "en",
  charts: {
    soilHealth: null,
    economics: null,
    resource: null
  }
};

// =============================================
// i18n Translation Map
// =============================================
const I18N = {
  en: {
    navSubtitle: "Crop Rotation Planning Agent &bull; CSP Closed-Loop Decision System",
    lblBenchmark: "Benchmark Scenario:",
    lblKnowledgeBase: "Crop Knowledge Base",
    lblCopilot: "AI Copilot",
    lblFarmInputs: "Farm &amp; Environmental Inputs",
    lblFarmInputsDesc: "Define plot parameters and shared resource ceilings",
    lblPlotParams: "Plot Parameters",
    lblLandSize: "Land Size",
    lblSoilType: "Soil Type",
    lblResourceCeilings: "Resource Ceilings",
    lblWater: "Water (mm)",
    lblBudget: "Budget (₹)",
    lblHorizon: "Horizon &amp; Soil State",
    lblNumSeasons: "Number of Seasons",
    lblSoilHealth: "Initial Soil Health",
    lblDepleted: "Depleted (20)",
    lblModerate: "Moderate (55)",
    lblOptimal: "Optimal (95)",
    lblGeneratePlan: "Generate Optimal Rotation Plan",
    lblCSPDiag: "CSP Search Engine Diagnostics",
    lblCSPDiagDesc: "Backtracking &amp; forward checking analytics",
    lblValidPlans: "Valid Plans Found",
    lblNodesExplored: "Search Nodes Explored",
    lblFamilyPruned: "Family Conflicts Pruned",
    lblWaterPruned: "Water Overruns Pruned",
    lblCostPruned: "Cost Overruns Pruned",
    lblCropPool: "Candidate Crop Pool",
    lblSolvingCSP: "Solving Constraint Satisfaction Problem...",
    lblSolvingDesc: "Pruning violating sequences &amp; evaluating multi-attribute heuristic scores",
    lblReadyToplan: "Ready to Plan Your Sustainable Crop Rotation",
    lblReadyDesc: "Set your farm constraints on the left or select a pre-configured agricultural scenario above.",
    lblRunFirst: "Run First Optimization",
    lblConstraintConflict: "Constraint Conflict Detected",
    lblCapitalBudget: "Capital Budget Deficit",
    lblProvidedBudget: "Provided Budget:",
    lblIrrigationWater: "Irrigation Water Budget",
    lblProvidedWater: "Provided Water:",
    lblRecommendedFixes: "Recommended Automated Fixes (1-Click):",
    lblAutoAdjustBudget: "Auto-Adjust Budget to",
    lblAutoAdjustBudgetDesc: "Set budget to viable minimum for current land &amp; seasons",
    lblDownscaleLand: "Downscale Land to",
    lblDownscaleLandDesc: "Keep current budget, scale down plot size",
    lblReduceSeasons: "Reduce to 2 Seasons",
    lblReduceSeasonsDesc: "Shorten horizon to reduce total cultivation cost",
    lblLoadBenchmark: "Load Balanced Benchmark Preset",
    lblLoadBenchmarkDesc: "Reset to tested baseline parameters",
    lblCSPCompliant: "CSP Compliant",
    lblHeuristicUtility: "Heuristic Utility:",
    lblOptimalStrategy: "Optimal Crop Rotation Strategy",
    lblCandidatePlans: "Candidate Plans:",
    lblNetProfit: "Estimated Net Profit",
    lblWaterConsumption: "Water Consumption",
    lblCultivationCost: "Total Cultivation Cost",
    lblSoilHealthImpact: "Soil Health Impact",
    lblMultiSeasonTitle: "Multi-Season Rotation Sequence",
    lblMultiSeasonDesc: "Agronomic chronology designed to break disease vectors, restore soil nitrogen, and maximize farm income",
    lblLegumeLegend: "Legume (N-Fixer)",
    lblCerealLegend: "Cereal / Grass (Feeder)",
    lblBiofumLegend: "Biofumigant / Other",
    lblSimLabTitle: "Closed-Loop Simulation &amp; Replanning Lab",
    lblSimLabDesc: "Simulate season progression, inject disruptions, and observe automatic CSP replanning",
    lblSimReady: "Simulation Ready (Season 1 of 3)",
    lblSimNextSeason: "Simulate Next Season",
    lblAutoRunFull: "Auto-Run Full Cycle",
    lblInjectDisruption: "Inject Disruption:",
    lblDrought: "Mid-Season Drought",
    lblPestOutbreak: "Pest Outbreak",
    lblReset: "Reset",
    lblReplanTriggered: "Closed-Loop Replanning Triggered",
    lblSeasonalLedger: "Seasonal Execution Ledger",
    thSeason: "Season", thCropPlanted: "Crop Planted", thSoilHealth: "Soil Health",
    thWaterUsed: "Water Used", thCultivationCost: "Cultivation Cost",
    thHarvestRevenue: "Harvest Revenue", thNetProfit: "Net Profit", thDisruptions: "Disruptions",
    lblVisualAnalytics: "Visual Analytics &amp; Agronomic Trends",
    lblAnalyticsDesc: "Tracking dynamic soil preservation, economic performance, and resource burn-down across seasons",
    lblSoilChart: "Soil Health &amp; Nitrogen Trajectory",
    lblSoilChartBadge: "Dynamic Index (0-100)",
    lblEconomicsChart: "Seasonal Revenue, Cost &amp; Profit",
    lblEconomicsChartBadge: "Financials (₹)",
    lblResourceChart: "Resource Utilization vs. Farm Budgets",
    lblResourceChartBadge: "Water &amp; Capital Ceilings",
    lblExploreScenarios: "Explore Regional Scenarios",
    lblScenarioHint: "Select a real-world agro-climatic profile to immediately solve the CSP and simulate multi-season dynamics:",
    lblKBTitle: "Crop Knowledge Base Explorer",
    lblKBDesc: "Agronomic database of 22 regional crops with multi-dimensional constraint parameters",
    lblCopilotTitle: "AI Agronomist Copilot",
    lblCopilotStatus: "Powered by AgriPlan Knowledge Engine",
    lblCopilotLang: "Responding in:",
    currentLangLabel: "EN",
    copilotLangDisplay: "English",
    copilotWelcomeMsg: "👋 Hello! I'm your <strong>AI Agronomist Copilot</strong>.<br><br>Ask me about your crop rotation plan — why a specific crop was selected, drought management strategies, pest control, soil health restoration, or financial optimization.",
    lblFooter: "AI-Based Crop Rotation Planning System &bull; Semester AI Project",
    lblFooterTech: "CSP Backtracking &bull; Heuristic Search &bull; Replanning Under Uncertainty &bull; Multi-Language Support",
    quickChips: ["Why chickpea?", "Drought tips", "Pest control", "Plan summary"],
    quickChipMsgs: ["Why was chickpea selected?", "How to manage drought?", "How to control pests?", "What is my rotation plan summary?"],
    copilotPlaceholder: "Ask your agronomist...",
    lblSeasonN: "Season",
    lblDays: "Days",
    lblWaterNeed: "Water Need",
    lblEstYield: "Est. Yield",
    lblCostPerAcre: "Cost / Acre",
    lblMarketRate: "Market Rate",
    lblRationale: "Agronomic Rationale &amp; Rejections",
    lblSelectionReason: "Selection Reason",
    lblAgronomicSynergies: "Agronomic Synergies",
    lblRejectedAlt: "Top Rejected Alternatives",
    lblNominal: "Nominal",
    planLabelOptimal: "Plan A (Optimal)",
    planLabelAlt: "Plan",
    lblSafetyReserve: "safety reserve",
    lblUnspent: "unspent",
    lblNetNBalance: "kg/ha Net N Balance",
    lblCompleted: "All Seasons Completed",
    lblActiveSeason: "Active Season",
    lblOf: "of",
    lblSeasonProj: "Proj",
    lblOptimSoilBaseline: "Optimal Soil Quality Baseline",
    lblSoilHealthIdx: "Soil Health Index (0-100)",
    lblGrossRevenue: "Gross Revenue (₹)",
    lblCultivationCostChart: "Cultivation Cost (₹)",
    lblNetProfitChart: "Net Profit (₹)",
    lblWaterUtilLabel: "Water Budget Utilization",
    lblCostUtilLabel: "Cost Budget Utilization",
    lblUsedResource: "Used Resource (%)",
    lblSafetyBuffer: "Remaining Safety Buffer (%)"
  },
  hi: {
    navSubtitle: "फसल चक्र नियोजन प्रणाली &bull; CSP क्लोज्ड-लूप निर्णय तंत्र",
    lblBenchmark: "बेंचमार्क परिदृश्य:",
    lblKnowledgeBase: "फसल ज्ञान भंडार",
    lblCopilot: "AI सहायक",
    lblFarmInputs: "खेत एवं पर्यावरण इनपुट",
    lblFarmInputsDesc: "भूखंड मापदंड और साझा संसाधन सीमाएं निर्धारित करें",
    lblPlotParams: "भूखंड मापदंड",
    lblLandSize: "भूमि क्षेत्र",
    lblSoilType: "मिट्टी का प्रकार",
    lblResourceCeilings: "संसाधन सीमाएं",
    lblWater: "पानी (मिमी)",
    lblBudget: "बजट (₹)",
    lblHorizon: "क्षितिज एवं मृदा स्थिति",
    lblNumSeasons: "मौसमों की संख्या",
    lblSoilHealth: "प्रारंभिक मृदा स्वास्थ्य",
    lblDepleted: "क्षीण (20)",
    lblModerate: "मध्यम (55)",
    lblOptimal: "उत्तम (95)",
    lblGeneratePlan: "इष्टतम फसल चक्र योजना तैयार करें",
    lblCSPDiag: "CSP खोज इंजन निदान",
    lblCSPDiagDesc: "बैकट्रैकिंग एवं फॉरवर्ड चेकिंग विश्लेषण",
    lblValidPlans: "मान्य योजनाएं",
    lblNodesExplored: "खोजे गए नोड",
    lblFamilyPruned: "परिवार संघर्ष छंटाई",
    lblWaterPruned: "जल अतिक्रमण छंटाई",
    lblCostPruned: "लागत अतिक्रमण छंटाई",
    lblCropPool: "फसल उम्मीदवार पूल",
    lblSolvingCSP: "बाधा संतुष्टि समस्या हल हो रही है...",
    lblSolvingDesc: "उल्लंघनकारी अनुक्रमों की छंटाई और बहु-गुण अनुमानी स्कोर का मूल्यांकन",
    lblReadyToplan: "टिकाऊ फसल चक्र योजना बनाने के लिए तैयार",
    lblReadyDesc: "बाईं ओर खेत की बाधाएं निर्धारित करें या ऊपर दिए गए पूर्व-कॉन्फ़िगर परिदृश्य का चयन करें।",
    lblRunFirst: "पहला अनुकूलन चलाएं",
    lblConstraintConflict: "बाधा संघर्ष पाया गया",
    lblCapitalBudget: "पूंजी बजट घाटा",
    lblProvidedBudget: "उपलब्ध बजट:",
    lblIrrigationWater: "सिंचाई जल बजट",
    lblProvidedWater: "उपलब्ध पानी:",
    lblRecommendedFixes: "अनुशंसित स्वचालित सुधार (1-क्लिक):",
    lblAutoAdjustBudget: "बजट स्वतः समायोजित करें",
    lblAutoAdjustBudgetDesc: "वर्तमान भूमि और मौसमों के लिए न्यूनतम बजट निर्धारित करें",
    lblDownscaleLand: "भूमि क्षेत्र घटाएं",
    lblDownscaleLandDesc: "वर्तमान बजट रखें, भूखंड का आकार कम करें",
    lblReduceSeasons: "2 मौसमों तक कम करें",
    lblReduceSeasonsDesc: "कुल खेती लागत कम करने के लिए क्षितिज छोटा करें",
    lblLoadBenchmark: "संतुलित बेंचमार्क प्रीसेट लोड करें",
    lblLoadBenchmarkDesc: "परीक्षण किए गए आधार मापदंडों पर रीसेट करें",
    lblCSPCompliant: "CSP अनुपालित",
    lblHeuristicUtility: "अनुमानी उपयोगिता:",
    lblOptimalStrategy: "इष्टतम फसल चक्र रणनीति",
    lblCandidatePlans: "उम्मीदवार योजनाएं:",
    lblNetProfit: "अनुमानित शुद्ध लाभ",
    lblWaterConsumption: "जल खपत",
    lblCultivationCost: "कुल खेती लागत",
    lblSoilHealthImpact: "मृदा स्वास्थ्य प्रभाव",
    lblMultiSeasonTitle: "बहु-मौसम फसल चक्र अनुक्रम",
    lblMultiSeasonDesc: "रोग वाहकों को तोड़ने, मृदा नाइट्रोजन बहाल करने और खेत की आय अधिकतम करने के लिए कृषि-विज्ञान कालक्रम",
    lblLegumeLegend: "दलहन (N-स्थिरीकरण)",
    lblCerealLegend: "अनाज / घास (पोषक खींचने वाला)",
    lblBiofumLegend: "जैव-धूपन / अन्य",
    lblSimLabTitle: "क्लोज्ड-लूप सिमुलेशन एवं पुनर्नियोजन प्रयोगशाला",
    lblSimLabDesc: "मौसम की प्रगति अनुकरण करें, व्यवधान डालें और स्वचालित CSP पुनर्नियोजन देखें",
    lblSimReady: "सिमुलेशन तैयार (मौसम 1 में से 3)",
    lblSimNextSeason: "अगला मौसम अनुकरण करें",
    lblAutoRunFull: "पूर्ण चक्र स्वतः चलाएं",
    lblInjectDisruption: "व्यवधान डालें:",
    lblDrought: "मध्य-मौसम सूखा",
    lblPestOutbreak: "कीट प्रकोप",
    lblReset: "रीसेट",
    lblReplanTriggered: "क्लोज्ड-लूप पुनर्नियोजन शुरू हुआ",
    lblSeasonalLedger: "मौसमी निष्पादन खाता",
    thSeason: "मौसम", thCropPlanted: "बोई गई फसल", thSoilHealth: "मृदा स्वास्थ्य",
    thWaterUsed: "पानी इस्तेमाल", thCultivationCost: "खेती लागत",
    thHarvestRevenue: "फसल राजस्व", thNetProfit: "शुद्ध लाभ", thDisruptions: "व्यवधान",
    lblVisualAnalytics: "दृश्य विश्लेषण एवं कृषि प्रवृत्तियां",
    lblAnalyticsDesc: "मौसमों में गतिशील मृदा संरक्षण, आर्थिक प्रदर्शन और संसाधन उपयोग ट्रैकिंग",
    lblSoilChart: "मृदा स्वास्थ्य एवं नाइट्रोजन प्रक्षेपवक्र",
    lblSoilChartBadge: "गतिशील सूचकांक (0-100)",
    lblEconomicsChart: "मौसमी राजस्व, लागत एवं लाभ",
    lblEconomicsChartBadge: "वित्तीय (₹)",
    lblResourceChart: "संसाधन उपयोग बनाम खेत बजट",
    lblResourceChartBadge: "पानी और पूंजी सीमाएं",
    lblExploreScenarios: "क्षेत्रीय परिदृश्य देखें",
    lblScenarioHint: "CSP तुरंत हल करने और बहु-मौसम गतिशीलता अनुकरण करने के लिए वास्तविक कृषि-जलवायु प्रोफ़ाइल चुनें:",
    lblKBTitle: "फसल ज्ञान भंडार एक्सप्लोरर",
    lblKBDesc: "बहु-आयामी बाधा मापदंडों के साथ 22 क्षेत्रीय फसलों का कृषि-विज्ञान डेटाबेस",
    lblCopilotTitle: "AI कृषि विशेषज्ञ सहायक",
    lblCopilotStatus: "AgriPlan ज्ञान इंजन द्वारा संचालित",
    lblCopilotLang: "उत्तर भाषा:",
    currentLangLabel: "HI",
    copilotLangDisplay: "हिन्दी",
    copilotWelcomeMsg: "👋 नमस्ते! मैं आपका <strong>AI कृषि विशेषज्ञ सहायक</strong> हूं।<br><br>फसल चक्र योजना के बारे में पूछें — किसी फसल की चयन वजह, सूखा प्रबंधन, कीट नियंत्रण, मृदा स्वास्थ्य बहाली, या वित्तीय अनुकूलन।",
    lblFooter: "AI-आधारित फसल चक्र नियोजन प्रणाली &bull; सेमेस्टर AI परियोजना",
    lblFooterTech: "CSP बैकट्रैकिंग &bull; अनुमानी खोज &bull; अनिश्चितता में पुनर्नियोजन &bull; बहुभाषी समर्थन",
    quickChips: ["चना क्यों?", "सूखा सुझाव", "कीट नियंत्रण", "योजना सारांश"],
    quickChipMsgs: ["चना क्यों चुना गया?", "सूखे का प्रबंधन कैसे करें?", "कीटों को कैसे नियंत्रित करें?", "मेरी फसल योजना का सारांश क्या है?"],
    copilotPlaceholder: "अपने कृषि विशेषज्ञ से पूछें...",
    lblSeasonN: "मौसम", lblDays: "दिन", lblWaterNeed: "जल आवश्यकता",
    lblEstYield: "अनुमानित उपज", lblCostPerAcre: "लागत/एकड़", lblMarketRate: "बाजार भाव",
    lblRationale: "कृषि तर्क एवं अस्वीकृतियां", lblSelectionReason: "चयन कारण",
    lblAgronomicSynergies: "कृषि तालमेल", lblRejectedAlt: "शीर्ष अस्वीकृत विकल्प",
    lblNominal: "सामान्य", planLabelOptimal: "योजना A (इष्टतम)", planLabelAlt: "योजना",
    lblSafetyReserve: "सुरक्षा भंडार", lblUnspent: "बचत", lblNetNBalance: "किग्रा/हेक्टेयर नेट N",
    lblCompleted: "सभी मौसम पूर्ण", lblActiveSeason: "सक्रिय मौसम", lblOf: "में से",
    lblSeasonProj: "प्रक्षेपित",
    lblOptimSoilBaseline: "इष्टतम मृदा गुणवत्ता आधार रेखा",
    lblSoilHealthIdx: "मृदा स्वास्थ्य सूचकांक (0-100)",
    lblGrossRevenue: "सकल राजस्व (₹)", lblCultivationCostChart: "खेती लागत (₹)", lblNetProfitChart: "शुद्ध लाभ (₹)",
    lblWaterUtilLabel: "जल बजट उपयोग", lblCostUtilLabel: "लागत बजट उपयोग",
    lblUsedResource: "उपयोग संसाधन (%)", lblSafetyBuffer: "शेष सुरक्षा बफर (%)"
  },
  te: {
    navSubtitle: "పంట మార్పిడి ప్రణాళిక వ్యవస్థ &bull; CSP క్లోజ్డ్-లూప్ నిర్ణయ వ్యవస్థ",
    lblBenchmark: "బెంచ్‌మార్క్ పరిస్థితి:",
    lblKnowledgeBase: "పంట జ్ఞాన బేస్",
    lblCopilot: "AI సహాయకుడు",
    lblFarmInputs: "వ్యవసాయ మరియు పర్యావరణ ఇన్‌పుట్‌లు",
    lblFarmInputsDesc: "భూఖండ పారామీటర్లు మరియు వనరుల పరిమితులు నిర్ణయించండి",
    lblPlotParams: "భూఖండ పారామీటర్లు",
    lblLandSize: "భూమి పరిమాణం",
    lblSoilType: "నేల రకం",
    lblResourceCeilings: "వనరుల పరిమితులు",
    lblWater: "నీరు (మిమీ)",
    lblBudget: "బడ్జెట్ (₹)",
    lblHorizon: "హోరిజాన్ మరియు నేల స్థితి",
    lblNumSeasons: "సీజన్ల సంఖ్య",
    lblSoilHealth: "ప్రారంభ నేల ఆరోగ్యం",
    lblDepleted: "అవక్షీణించిన (20)", lblModerate: "మధ్యస్థ (55)", lblOptimal: "సర్వోత్తమ (95)",
    lblGeneratePlan: "అనుకూల పంట మార్పిడి ప్రణాళికను రూపొందించండి",
    lblCSPDiag: "CSP శోధన ఇంజిన్ నిదానాలు",
    lblCSPDiagDesc: "బ్యాక్‌ట్రాకింగ్ మరియు ఫార్వర్డ్ చెకింగ్ విశ్లేషణ",
    lblValidPlans: "చెల్లుబాటయ్యే ప్రణాళికలు", lblNodesExplored: "అన్వేషించిన నోడ్‌లు",
    lblFamilyPruned: "కుటుంబ వైరుధ్యాలు", lblWaterPruned: "నీటి అతిక్రమణలు",
    lblCostPruned: "ఖర్చు అతిక్రమణలు", lblCropPool: "పంట అభ్యర్థి పూల్",
    lblSolvingCSP: "CSP సమస్యను పరిష్కరిస్తున్నాం...",
    lblSolvingDesc: "ఉల్లంఘించే క్రమాలను తొలగించి బహు-లక్షణ అంచనా స్కోర్‌లను మూల్యాంకనం చేస్తున్నాం",
    lblReadyToplan: "మీ సుస్థిర పంట మార్పిడిని ప్లాన్ చేయడానికి సిద్ధం",
    lblReadyDesc: "ఎడమ వైపు మీ పరిమితులను సెట్ చేయండి లేదా పై నుండి ముందే కాన్ఫిగర్ చేసిన సన్నివేశాన్ని ఎంచుకోండి.",
    lblRunFirst: "మొదటి ఆప్టిమైజేషన్ చేయండి",
    lblConstraintConflict: "పరిమితి వైరుధ్యం గుర్తించబడింది",
    lblCapitalBudget: "పెట్టుబడి బడ్జెట్ లోటు",
    lblProvidedBudget: "అందించిన బడ్జెట్:",
    lblIrrigationWater: "నీటిపారుదల నీటి బడ్జెట్",
    lblProvidedWater: "అందించిన నీరు:",
    lblRecommendedFixes: "సిఫార్సు చేయబడిన సంస్కరణలు (1-క్లిక్):",
    lblAutoAdjustBudget: "బడ్జెట్ స్వయంచాలకంగా సర్దుబాటు చేయండి",
    lblAutoAdjustBudgetDesc: "ప్రస్తుత భూమి మరియు సీజన్‌లకు కనీస బడ్జెట్ సెట్ చేయండి",
    lblDownscaleLand: "భూమిని తగ్గించండి",
    lblDownscaleLandDesc: "ప్రస్తుత బడ్జెట్ ఉంచి భూఖండ పరిమాణాన్ని తగ్గించండి",
    lblReduceSeasons: "2 సీజన్‌లకు తగ్గించండి",
    lblReduceSeasonsDesc: "మొత్తం సేద్యం ఖర్చు తగ్గించడానికి హోరిజాన్ తగ్గించండి",
    lblLoadBenchmark: "బ్యాలెన్స్‌డ్ బెంచ్‌మార్క్ ప్రీసెట్ లోడ్ చేయండి",
    lblLoadBenchmarkDesc: "పరీక్షించిన బేస్‌లైన్ పారామీటర్‌లకు రీసెట్ చేయండి",
    lblCSPCompliant: "CSP అనుగుణ్యం", lblHeuristicUtility: "హ్యూరిస్టిక్ యూటిలిటీ:",
    lblOptimalStrategy: "అనుకూల పంట మార్పిడి వ్యూహం", lblCandidatePlans: "అభ్యర్థి ప్రణాళికలు:",
    lblNetProfit: "అంచనా నికర లాభం", lblWaterConsumption: "నీటి వినియోగం",
    lblCultivationCost: "మొత్తం సేద్యం ఖర్చు", lblSoilHealthImpact: "నేల ఆరోగ్య ప్రభావం",
    lblMultiSeasonTitle: "బహు-సీజన్ పంట మార్పిడి క్రమం",
    lblMultiSeasonDesc: "వ్యాధి వాహకాలను తొలగించి నేల నత్రజనిని పునరుద్ధరించి వ్యవసాయ ఆదాయాన్ని పెంచడానికి రూపొందించబడిన శాస్త్రీయ క్రమం",
    lblLegumeLegend: "పప్పుధాన్యం (N-స్థిరీకరణ)", lblCerealLegend: "ధాన్యం / గడ్డి",
    lblBiofumLegend: "జైవ ధూమీకరణ / ఇతర",
    lblSimLabTitle: "క్లోజ్డ్-లూప్ సిమ్యులేషన్ మరియు పునర్ప్రణాళిక ప్రయోగశాల",
    lblSimLabDesc: "సీజన్ పురోగతిని అనుకరించి అవాంతరాలు ఇంజెక్ట్ చేసి స్వయంచాలక CSP పునర్ప్రణాళికను చూడండి",
    lblSimReady: "సిమ్యులేషన్ సిద్ధం (సీజన్ 1 లో 3)",
    lblSimNextSeason: "తదుపరి సీజన్ అనుకరించండి",
    lblAutoRunFull: "పూర్తి చక్రం స్వయంచాలకంగా చేయండి",
    lblInjectDisruption: "అవాంతరం ఇంజెక్ట్ చేయండి:",
    lblDrought: "మధ్య-సీజన్ కరువు", lblPestOutbreak: "పురుగుల ప్రాదుర్భావం", lblReset: "రీసెట్",
    lblReplanTriggered: "క్లోజ్డ్-లూప్ పునర్ప్రణాళిక ప్రారంభమైంది",
    lblSeasonalLedger: "సీజనల్ అమలు నమోదు",
    thSeason: "సీజన్", thCropPlanted: "నాటిన పంట", thSoilHealth: "నేల ఆరోగ్యం",
    thWaterUsed: "నీరు వాడిన", thCultivationCost: "సేద్యం ఖర్చు",
    thHarvestRevenue: "పంట ఆదాయం", thNetProfit: "నికర లాభం", thDisruptions: "అవాంతరాలు",
    lblVisualAnalytics: "దృశ్య విశ్లేషణ మరియు వ్యవసాయ ధోరణులు",
    lblAnalyticsDesc: "సీజన్‌లలో నేల పరిరక్షణ, ఆర్థిక పనితీరు మరియు వనరుల వినియోగాన్ని ట్రాక్ చేయడం",
    lblSoilChart: "నేల ఆరోగ్య మరియు నత్రజని మార్గం",
    lblSoilChartBadge: "గతిశీల సూచిక (0-100)",
    lblEconomicsChart: "సీజనల్ ఆదాయం, ఖర్చు మరియు లాభం",
    lblEconomicsChartBadge: "ఆర్థిక (₹)",
    lblResourceChart: "వనరుల వినియోగం vs వ్యవసాయ బడ్జెట్‌లు",
    lblResourceChartBadge: "నీరు మరియు పెట్టుబడి పరిమితులు",
    lblExploreScenarios: "ప్రాంతీయ సన్నివేశాలు అన్వేషించండి",
    lblScenarioHint: "CSP వెంటనే పరిష్కరించడానికి నిజ-ప్రపంచ వ్యవసాయ-వాతావరణ ప్రొఫైల్ ఎంచుకోండి:",
    lblKBTitle: "పంట జ్ఞాన బేస్ ఎక్స్‌ప్లోరర్",
    lblKBDesc: "22 ప్రాంతీయ పంటల బహు-పరిమితి పారామీటర్‌లతో వ్యవసాయ శాస్త్ర డేటాబేస్",
    lblCopilotTitle: "AI వ్యవసాయ నిపుణుడు సహాయకుడు",
    lblCopilotStatus: "AgriPlan నాలెడ్జ్ ఇంజిన్ ద్వారా నడపబడుతోంది",
    lblCopilotLang: "సమాధానం భాష:",
    currentLangLabel: "TE",
    copilotLangDisplay: "తెలుగు",
    copilotWelcomeMsg: "👋 నమస్కారం! నేను మీ <strong>AI వ్యవసాయ నిపుణుడు సహాయకుడిని</strong>.<br><br>పంట మార్పిడి ప్రణాళికపై ప్రశ్నలు అడగండి.",
    lblFooter: "AI-ఆధారిత పంట మార్పిడి ప్రణాళిక వ్యవస్థ &bull; సెమిస్టర్ AI ప్రాజెక్ట్",
    lblFooterTech: "CSP బ్యాక్‌ట్రాకింగ్ &bull; హ్యూరిస్టిక్ శోధన &bull; అనిశ్చితి కింద పునర్ప్రణాళిక &bull; బహుభాషా మద్దతు",
    quickChips: ["శనగలు ఎందుకు?", "కరువు చిట్కాలు", "పురుగు నివారణ", "ప్రణాళిక సారాంశం"],
    quickChipMsgs: ["శనగలు ఎందుకు ఎంచుకోబడ్డాయి?", "కరువును ఎలా నిర్వహించాలి?", "పురుగులను ఎలా నియంత్రించాలి?", "నా పంట ప్రణాళిక సారాంశం ఏమిటి?"],
    copilotPlaceholder: "మీ వ్యవసాయ నిపుణుడిని అడగండి...",
    lblSeasonN: "సీజన్", lblDays: "రోజులు", lblWaterNeed: "నీటి అవసరం",
    lblEstYield: "అంచనా దిగుబడి", lblCostPerAcre: "ఖర్చు/ఎకరా", lblMarketRate: "మార్కెట్ ధర",
    lblRationale: "వ్యవసాయ తర్కం మరియు తిరస్కరణలు", lblSelectionReason: "ఎంపిక కారణం",
    lblAgronomicSynergies: "వ్యవసాయ సమన్వయాలు", lblRejectedAlt: "తిరస్కరించిన ప్రత్యామ్నాయాలు",
    lblNominal: "సాధారణ", planLabelOptimal: "ప్రణాళిక A (అనుకూల)", planLabelAlt: "ప్రణాళిక",
    lblSafetyReserve: "భద్రత నిల్వ", lblUnspent: "వ్యయం కాని", lblNetNBalance: "కిలోలు/హెక్టార్ నేట్ N",
    lblCompleted: "అన్ని సీజన్లు పూర్తయ్యాయి", lblActiveSeason: "చురుకైన సీజన్", lblOf: "లో",
    lblSeasonProj: "అంచనా",
    lblOptimSoilBaseline: "సర్వోత్తమ నేల నాణ్యత ప్రాతిపదిక",
    lblSoilHealthIdx: "నేల ఆరోగ్య సూచిక (0-100)",
    lblGrossRevenue: "స్థూల ఆదాయం (₹)", lblCultivationCostChart: "సేద్యం ఖర్చు (₹)", lblNetProfitChart: "నికర లాభం (₹)",
    lblWaterUtilLabel: "నీటి బడ్జెట్ వినియోగం", lblCostUtilLabel: "ఖర్చు బడ్జెట్ వినియోగం",
    lblUsedResource: "వినియోగించిన వనరు (%)", lblSafetyBuffer: "మిగిలిన భద్రత బఫర్ (%)"
  },
  ta: {
    navSubtitle: "பயிர் சுழற்சி திட்டமிடல் முகவர் &bull; CSP மூடிய-சுழல் முடிவு அமைப்பு",
    lblBenchmark: "வரையறை சூழ்நிலை:",
    lblKnowledgeBase: "பயிர் அறிவுத் தளம்",
    lblCopilot: "AI உதவியாளர்",
    lblFarmInputs: "விவசாய மற்றும் சுற்றுச்சூழல் உள்ளீடுகள்",
    lblFarmInputsDesc: "நிலத்துண்டு அளவுருக்கள் மற்றும் வளக் கட்டுப்பாடுகளை வரையறுக்கவும்",
    lblPlotParams: "நிலத்துண்டு அளவுருக்கள்",
    lblLandSize: "நில அளவு",
    lblSoilType: "மண் வகை",
    lblResourceCeilings: "வளக் கட்டுப்பாடுகள்",
    lblWater: "நீர் (மிமீ)",
    lblBudget: "பட்ஜெட் (₹)",
    lblHorizon: "தொடர்ச்சி மற்றும் மண் நிலை",
    lblNumSeasons: "பருவங்களின் எண்ணிக்கை",
    lblSoilHealth: "ஆரம்ப மண் ஆரோக்கியம்",
    lblDepleted: "குறைந்த (20)", lblModerate: "மிதமான (55)", lblOptimal: "சிறந்த (95)",
    lblGeneratePlan: "சிறந்த பயிர் சுழற்சி திட்டத்தை உருவாக்கவும்",
    lblCSPDiag: "CSP தேடல் இயந்திர நோயறிதல்",
    lblCSPDiagDesc: "பின்தடம் மற்றும் முன்னோக்கி சரிபார்ப்பு பகுப்பாய்வு",
    lblValidPlans: "செல்லுபடியான திட்டங்கள்", lblNodesExplored: "ஆய்வு செய்த முனைகள்",
    lblFamilyPruned: "குடும்ப மோதல்கள்", lblWaterPruned: "நீர் மீறல்கள்",
    lblCostPruned: "செலவு மீறல்கள்", lblCropPool: "பயிர் வேட்பாளர் குழு",
    lblSolvingCSP: "CSP சிக்கலை தீர்க்கிறோம்...",
    lblSolvingDesc: "மீறும் வரிசைகளை கத்தரித்து பல-பண்பு ஹியூரிஸ்டிக் மதிப்பெண்களை மதிப்பிடுகிறோம்",
    lblReadyToplan: "உங்கள் நிலையான பயிர் சுழற்சியை திட்டமிட தயார்",
    lblReadyDesc: "இடதுபுறம் உங்கள் கட்டுப்பாடுகளை அமைக்கவும் அல்லது மேலே உள்ள முன்-உள்ளமைக்கப்பட்ட சூழ்நிலையைத் தேர்ந்தெடுக்கவும்.",
    lblRunFirst: "முதல் மேம்படுத்தலை இயக்கவும்",
    lblConstraintConflict: "கட்டுப்பாடு மோதல் கண்டறியப்பட்டது",
    lblCapitalBudget: "முதலீட்டு பட்ஜெட் பற்றாக்குறை",
    lblProvidedBudget: "வழங்கப்பட்ட பட்ஜெட்:",
    lblIrrigationWater: "நீர்ப்பாசன நீர் பட்ஜெட்",
    lblProvidedWater: "வழங்கப்பட்ட நீர்:",
    lblRecommendedFixes: "பரிந்துரைக்கப்பட்ட திருத்தங்கள் (1-கிளிக்):",
    lblAutoAdjustBudget: "பட்ஜெட்டை தானாக சரிசெய்யவும்",
    lblAutoAdjustBudgetDesc: "தற்போதைய நிலம் மற்றும் பருவங்களுக்கு குறைந்தபட்ச பட்ஜெட்டை அமைக்கவும்",
    lblDownscaleLand: "நிலத்தை குறைக்கவும்",
    lblDownscaleLandDesc: "தற்போதைய பட்ஜெட்டை வைத்து நிலத்துண்டு அளவை குறைக்கவும்",
    lblReduceSeasons: "2 பருவங்களாக குறைக்கவும்",
    lblReduceSeasonsDesc: "மொத்த சாகுபடி செலவை குறைக்க தொடர்ச்சியை சுருக்கவும்",
    lblLoadBenchmark: "சமச்சீர் வரையறை அமைப்பை ஏற்றவும்",
    lblLoadBenchmarkDesc: "சோதிக்கப்பட்ட அடிப்படை அளவுருக்களுக்கு மீட்டமைக்கவும்",
    lblCSPCompliant: "CSP இணக்கம்", lblHeuristicUtility: "ஹியூரிஸ்டிக் பயன்பாடு:",
    lblOptimalStrategy: "சிறந்த பயிர் சுழற்சி உத்தி", lblCandidatePlans: "வேட்பாளர் திட்டங்கள்:",
    lblNetProfit: "மதிப்பிட்ட நிகர லாபம்", lblWaterConsumption: "நீர் நுகர்வு",
    lblCultivationCost: "மொத்த சாகுபடி செலவு", lblSoilHealthImpact: "மண் ஆரோக்கிய தாக்கம்",
    lblMultiSeasonTitle: "பல-பருவ பயிர் சுழற்சி வரிசை",
    lblMultiSeasonDesc: "நோய் வாகனங்களை உடைக்கவும் மண் நைட்ரஜனை மீட்கவும் விவசாய வருமானத்தை அதிகரிக்கவும் வடிவமைக்கப்பட்ட வேளாண் அறிவியல் காலவரிசை",
    lblLegumeLegend: "பருப்பு வகை (N-நிலைநிறுத்தம்)", lblCerealLegend: "தானியம் / புல்",
    lblBiofumLegend: "இயற்கை கிருமிநாசினி / பிற",
    lblSimLabTitle: "மூடிய-சுழல் சிமுலேஷன் மற்றும் மறுதிட்டமிடல் ஆய்வகம்",
    lblSimLabDesc: "பருவ முன்னேற்றத்தை உருவகப்படுத்தி இடையூறுகளை செலுத்தி தானியங்கி CSP மறுதிட்டமிடலைப் பாருங்கள்",
    lblSimReady: "சிமுலேஷன் தயார் (பருவம் 1 இல் 3)",
    lblSimNextSeason: "அடுத்த பருவத்தை உருவகப்படுத்தவும்",
    lblAutoRunFull: "முழு சுழற்சியை தானாக இயக்கவும்",
    lblInjectDisruption: "இடையூறை செலுத்தவும்:",
    lblDrought: "பருவ மத்தியில் வறட்சி", lblPestOutbreak: "பூச்சி தாக்குதல்", lblReset: "மீட்டமை",
    lblReplanTriggered: "மூடிய-சுழல் மறுதிட்டமிடல் தொடங்கியது",
    lblSeasonalLedger: "பருவ செயல்பாட்டு பதிவேடு",
    thSeason: "பருவம்", thCropPlanted: "விதைக்கப்பட்ட பயிர்", thSoilHealth: "மண் ஆரோக்கியம்",
    thWaterUsed: "பயன்படுத்திய நீர்", thCultivationCost: "சாகுபடி செலவு",
    thHarvestRevenue: "அறுவடை வருமானம்", thNetProfit: "நிகர லாபம்", thDisruptions: "இடையூறுகள்",
    lblVisualAnalytics: "காட்சி பகுப்பாய்வு மற்றும் வேளாண் போக்குகள்",
    lblAnalyticsDesc: "பருவங்கள் முழுவதும் மண் பாதுகாப்பு, பொருளாதார செயல்திறன் மற்றும் வள வினையாக்கத்தை கண்காணிக்கிறோம்",
    lblSoilChart: "மண் ஆரோக்கியம் மற்றும் நைட்ரஜன் பாதை",
    lblSoilChartBadge: "மாறும் குறியீடு (0-100)",
    lblEconomicsChart: "பருவ வருமானம், செலவு மற்றும் லாபம்",
    lblEconomicsChartBadge: "நிதி (₹)",
    lblResourceChart: "வள பயன்பாடு vs விவசாய பட்ஜெட்கள்",
    lblResourceChartBadge: "நீர் மற்றும் முதலீட்டு கட்டுப்பாடுகள்",
    lblExploreScenarios: "பிராந்திய சூழ்நிலைகளை ஆராயுங்கள்",
    lblScenarioHint: "CSP-ஐ உடனடியாக தீர்க்க நிஜ-உலக வேளாண்-காலநிலை சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்:",
    lblKBTitle: "பயிர் அறிவுத்தள ஆய்வாளர்",
    lblKBDesc: "பல-பரிமாண கட்டுப்பாடு அளவுருக்களுடன் 22 பிராந்திய பயிர்களின் வேளாண் தரவுத்தளம்",
    lblCopilotTitle: "AI வேளாண் நிபுணர் உதவியாளர்",
    lblCopilotStatus: "AgriPlan நாலெட்ஜ் இயந்திரத்தால் இயக்கப்படுகிறது",
    lblCopilotLang: "பதில் மொழி:",
    currentLangLabel: "TA",
    copilotLangDisplay: "தமிழ்",
    copilotWelcomeMsg: "👋 வணக்கம்! நான் உங்கள் <strong>AI வேளாண் நிபுணர் உதவியாளர்</strong>.<br><br>பயிர் சுழற்சி திட்டம் பற்றி கேளுங்கள்.",
    lblFooter: "AI-அடிப்படையிலான பயிர் சுழற்சி திட்டமிடல் அமைப்பு &bull; செமஸ்டர் AI திட்டம்",
    lblFooterTech: "CSP பின்தடம் &bull; ஹியூரிஸ்டிக் தேடல் &bull; நிச்சயமற்ற சூழலில் மறுதிட்டமிடல் &bull; பல மொழி ஆதரவு",
    quickChips: ["கொண்டைக்கடலை ஏன்?", "வறட்சி குறிப்புகள்", "பூச்சி கட்டுப்பாடு", "திட்ட சுருக்கம்"],
    quickChipMsgs: ["கொண்டைக்கடலை ஏன் தேர்ந்தெடுக்கப்பட்டது?", "வறட்சியை எவ்வாறு நிர்வகிப்பது?", "பூச்சிகளை எவ்வாறு கட்டுப்படுத்துவது?", "என் பயிர் திட்ட சுருக்கம் என்ன?"],
    copilotPlaceholder: "உங்கள் வேளாண் நிபுணரிடம் கேளுங்கள்...",
    lblSeasonN: "பருவம்", lblDays: "நாட்கள்", lblWaterNeed: "நீர் தேவை",
    lblEstYield: "மதிப்பிட்ட மகசூல்", lblCostPerAcre: "செலவு/ஏக்கர்", lblMarketRate: "சந்தை விலை",
    lblRationale: "வேளாண் தர்க்கம் மற்றும் நிராகரிப்புகள்", lblSelectionReason: "தேர்வு காரணம்",
    lblAgronomicSynergies: "வேளாண் ஒருங்கிணைப்புகள்", lblRejectedAlt: "நிராகரிக்கப்பட்ட மாற்றுகள்",
    lblNominal: "சாதாரண", planLabelOptimal: "திட்டம் A (சிறந்த)", planLabelAlt: "திட்டம்",
    lblSafetyReserve: "பாதுகாப்பு இருப்பு", lblUnspent: "செலவழிக்கப்படாத", lblNetNBalance: "கிலோ/ஹெக்டேர் நேட் N",
    lblCompleted: "அனைத்து பருவங்களும் முடிந்தன", lblActiveSeason: "செயலில் உள்ள பருவம்", lblOf: "இல்",
    lblSeasonProj: "கணிப்பு",
    lblOptimSoilBaseline: "சிறந்த மண் தர அடிப்படை",
    lblSoilHealthIdx: "மண் ஆரோக்கிய குறியீடு (0-100)",
    lblGrossRevenue: "மொத்த வருமானம் (₹)", lblCultivationCostChart: "சாகுபடி செலவு (₹)", lblNetProfitChart: "நிகர லாபம் (₹)",
    lblWaterUtilLabel: "நீர் பட்ஜெட் பயன்பாடு", lblCostUtilLabel: "செலவு பட்ஜெட் பயன்பாடு",
    lblUsedResource: "பயன்படுத்திய வளம் (%)", lblSafetyBuffer: "மீதமுள்ள பாதுகாப்பு இடையகம் (%)"
  },
  mr: {
    navSubtitle: "पीक फेरपालट नियोजन प्रणाली &bull; CSP बंद-लूप निर्णय प्रणाली",
    lblBenchmark: "बेंचमार्क परिस्थिती:",
    lblKnowledgeBase: "पीक ज्ञान भांडार",
    lblCopilot: "AI सहाय्यक",
    lblFarmInputs: "शेत आणि पर्यावरण इनपुट",
    lblFarmInputsDesc: "भूखंड मापदंड आणि सामायिक संसाधन मर्यादा निश्चित करा",
    lblPlotParams: "भूखंड मापदंड",
    lblLandSize: "जमिनीचे क्षेत्र",
    lblSoilType: "मातीचा प्रकार",
    lblResourceCeilings: "संसाधन मर्यादा",
    lblWater: "पाणी (मिमी)",
    lblBudget: "बजेट (₹)",
    lblHorizon: "क्षितिज आणि मृदा स्थिती",
    lblNumSeasons: "हंगामांची संख्या",
    lblSoilHealth: "प्रारंभिक मृदा आरोग्य",
    lblDepleted: "क्षीण (20)", lblModerate: "मध्यम (55)", lblOptimal: "उत्तम (95)",
    lblGeneratePlan: "इष्टतम पीक फेरपालट योजना तयार करा",
    lblCSPDiag: "CSP शोध इंजिन निदान",
    lblCSPDiagDesc: "बॅकट्रॅकिंग आणि फॉरवर्ड चेकिंग विश्लेषण",
    lblValidPlans: "वैध योजना", lblNodesExplored: "शोधलेले नोड",
    lblFamilyPruned: "कुळ संघर्ष", lblWaterPruned: "जल अतिक्रमण",
    lblCostPruned: "खर्च अतिक्रमण", lblCropPool: "पीक उमेदवार पूल",
    lblSolvingCSP: "CSP समस्या सोडवत आहे...",
    lblSolvingDesc: "उल्लंघन करणाऱ्या अनुक्रमांची छाटणी आणि बहु-गुण अनुमानी गुणांचे मूल्यांकन",
    lblReadyToplan: "तुमची शाश्वत पीक फेरपालट नियोजन करण्यासाठी तयार",
    lblReadyDesc: "डाव्या बाजूला शेताच्या मर्यादा सेट करा किंवा वर दिलेले पूर्व-कॉन्फिगर केलेले परिस्थिती निवडा.",
    lblRunFirst: "पहिले ऑप्टिमायझेशन चालवा",
    lblConstraintConflict: "बाधा संघर्ष आढळला",
    lblCapitalBudget: "भांडवल बजेट तूट",
    lblProvidedBudget: "उपलब्ध बजेट:",
    lblIrrigationWater: "सिंचन जल बजेट",
    lblProvidedWater: "उपलब्ध पाणी:",
    lblRecommendedFixes: "शिफारस केलेल्या सुधारणा (1-क्लिक):",
    lblAutoAdjustBudget: "बजेट स्वयंचलितपणे समायोजित करा",
    lblAutoAdjustBudgetDesc: "सध्याच्या जमीन आणि हंगामांसाठी किमान बजेट सेट करा",
    lblDownscaleLand: "जमीन कमी करा",
    lblDownscaleLandDesc: "सध्याचे बजेट ठेवून भूखंडाचा आकार कमी करा",
    lblReduceSeasons: "2 हंगामांपर्यंत कमी करा",
    lblReduceSeasonsDesc: "एकूण शेती खर्च कमी करण्यासाठी क्षितिज कमी करा",
    lblLoadBenchmark: "संतुलित बेंचमार्क प्रीसेट लोड करा",
    lblLoadBenchmarkDesc: "चाचणी केलेल्या आधार मापदंडांवर रीसेट करा",
    lblCSPCompliant: "CSP अनुपालित", lblHeuristicUtility: "अनुमानी उपयोगिता:",
    lblOptimalStrategy: "इष्टतम पीक फेरपालट धोरण", lblCandidatePlans: "उमेदवार योजना:",
    lblNetProfit: "अंदाजे निव्वळ नफा", lblWaterConsumption: "जल वापर",
    lblCultivationCost: "एकूण शेती खर्च", lblSoilHealthImpact: "मृदा आरोग्य परिणाम",
    lblMultiSeasonTitle: "बहु-हंगाम पीक फेरपालट अनुक्रम",
    lblMultiSeasonDesc: "रोग वाहक तोडण्यासाठी मृदा नायट्रोजन पुनर्संचयित करण्यासाठी आणि शेत उत्पन्न वाढवण्यासाठी कृषी-विज्ञान कालक्रम",
    lblLegumeLegend: "कडधान्य (N-स्थिरीकरण)", lblCerealLegend: "तृणधान्य / गवत",
    lblBiofumLegend: "जैव-धूमीकरण / इतर",
    lblSimLabTitle: "बंद-लूप सिम्युलेशन आणि पुन्हा नियोजन प्रयोगशाळा",
    lblSimLabDesc: "हंगामाच्या प्रगतीचे अनुकरण करा व्यत्यय घाला आणि स्वयंचलित CSP पुन्हा नियोजन पहा",
    lblSimReady: "सिम्युलेशन तयार (हंगाम 1 पैकी 3)",
    lblSimNextSeason: "पुढील हंगाम अनुकरण करा",
    lblAutoRunFull: "पूर्ण चक्र स्वयंचलितपणे चालवा",
    lblInjectDisruption: "व्यत्यय घाला:",
    lblDrought: "मध्य-हंगाम दुष्काळ", lblPestOutbreak: "कीड प्रादुर्भाव", lblReset: "रीसेट",
    lblReplanTriggered: "बंद-लूप पुन्हा नियोजन सुरू झाले",
    lblSeasonalLedger: "हंगामी कार्यान्वयन नोंदवही",
    thSeason: "हंगाम", thCropPlanted: "पेरलेले पीक", thSoilHealth: "मृदा आरोग्य",
    thWaterUsed: "वापरलेले पाणी", thCultivationCost: "शेती खर्च",
    thHarvestRevenue: "काढणी उत्पन्न", thNetProfit: "निव्वळ नफा", thDisruptions: "व्यत्यय",
    lblVisualAnalytics: "दृश्य विश्लेषण आणि कृषी प्रवृत्ती",
    lblAnalyticsDesc: "हंगामांमध्ये गतिशील मृदा संरक्षण आर्थिक कामगिरी आणि संसाधन वापर ट्रॅकिंग",
    lblSoilChart: "मृदा आरोग्य आणि नायट्रोजन मार्ग",
    lblSoilChartBadge: "गतिशील निर्देशांक (0-100)",
    lblEconomicsChart: "हंगामी उत्पन्न खर्च आणि नफा",
    lblEconomicsChartBadge: "आर्थिक (₹)",
    lblResourceChart: "संसाधन वापर विरुद्ध शेत बजेट",
    lblResourceChartBadge: "पाणी आणि भांडवल मर्यादा",
    lblExploreScenarios: "प्रादेशिक परिस्थिती एक्सप्लोर करा",
    lblScenarioHint: "CSP त्वरित सोडवण्यासाठी आणि बहु-हंगाम गतिशीलतेचे अनुकरण करण्यासाठी वास्तविक-जगातील कृषी-हवामान प्रोफाइल निवडा:",
    lblKBTitle: "पीक ज्ञान भांडार एक्सप्लोरर",
    lblKBDesc: "बहु-आयामी बाधा मापदंडांसह 22 प्रादेशिक पिकांचा कृषी-विज्ञान डेटाबेस",
    lblCopilotTitle: "AI कृषी तज्ज्ञ सहाय्यक",
    lblCopilotStatus: "AgriPlan नॉलेज इंजिनद्वारे समर्थित",
    lblCopilotLang: "उत्तराची भाषा:",
    currentLangLabel: "MR",
    copilotLangDisplay: "मराठी",
    copilotWelcomeMsg: "👋 नमस्कार! मी तुमचा <strong>AI कृषी तज्ज्ञ सहाय्यक</strong> आहे.<br><br>पीक फेरपालट योजनेबद्दल प्रश्न विचारा.",
    lblFooter: "AI-आधारित पीक फेरपालट नियोजन प्रणाली &bull; सेमेस्टर AI प्रकल्प",
    lblFooterTech: "CSP बॅकट्रॅकिंग &bull; अनुमानी शोध &bull; अनिश्चिततेखाली पुन्हा नियोजन &bull; बहुभाषी समर्थन",
    quickChips: ["हरभरा का?", "दुष्काळ सुझाव", "कीड नियंत्रण", "योजना सारांश"],
    quickChipMsgs: ["हरभरा का निवडला गेला?", "दुष्काळाचे व्यवस्थापन कसे करावे?", "कीटकांना कसे नियंत्रित करावे?", "माझ्या पीक योजनेचा सारांश काय आहे?"],
    copilotPlaceholder: "तुमच्या कृषी तज्ज्ञाला विचारा...",
    lblSeasonN: "हंगाम", lblDays: "दिवस", lblWaterNeed: "पाण्याची गरज",
    lblEstYield: "अंदाजे उत्पादन", lblCostPerAcre: "खर्च/एकर", lblMarketRate: "बाजार भाव",
    lblRationale: "कृषी तर्क आणि नकार", lblSelectionReason: "निवड कारण",
    lblAgronomicSynergies: "कृषी समन्वय", lblRejectedAlt: "नाकारलेले पर्याय",
    lblNominal: "सामान्य", planLabelOptimal: "योजना A (इष्टतम)", planLabelAlt: "योजना",
    lblSafetyReserve: "सुरक्षा साठा", lblUnspent: "न खर्च केलेले", lblNetNBalance: "किलो/हेक्टर निव्वळ N",
    lblCompleted: "सर्व हंगाम पूर्ण", lblActiveSeason: "सक्रिय हंगाम", lblOf: "पैकी",
    lblSeasonProj: "प्रक्षेपित",
    lblOptimSoilBaseline: "इष्टतम मृदा गुणवत्ता आधाररेषा",
    lblSoilHealthIdx: "मृदा आरोग्य निर्देशांक (0-100)",
    lblGrossRevenue: "एकूण उत्पन्न (₹)", lblCultivationCostChart: "शेती खर्च (₹)", lblNetProfitChart: "निव्वळ नफा (₹)",
    lblWaterUtilLabel: "जल बजेट वापर", lblCostUtilLabel: "खर्च बजेट वापर",
    lblUsedResource: "वापरलेले संसाधन (%)", lblSafetyBuffer: "उरलेला सुरक्षा बफर (%)"
  },
  pa: {
    navSubtitle: "ਫਸਲੀ ਚੱਕਰ ਯੋਜਨਾਬੰਦੀ ਪ੍ਰਣਾਲੀ &bull; CSP ਬੰਦ-ਲੂਪ ਫੈਸਲਾ ਪ੍ਰਣਾਲੀ",
    lblBenchmark: "ਬੈਂਚਮਾਰਕ ਸੀਨਾਰੀਓ:",
    lblKnowledgeBase: "ਫਸਲ ਗਿਆਨ ਭੰਡਾਰ",
    lblCopilot: "AI ਸਹਾਇਕ",
    lblFarmInputs: "ਖੇਤ ਅਤੇ ਵਾਤਾਵਰਣ ਇਨਪੁੱਟ",
    lblFarmInputsDesc: "ਭੂਖੰਡ ਮਾਪਦੰਡ ਅਤੇ ਸਾਂਝੇ ਸਰੋਤ ਸੀਮਾਵਾਂ ਨਿਰਧਾਰਿਤ ਕਰੋ",
    lblPlotParams: "ਭੂਖੰਡ ਮਾਪਦੰਡ",
    lblLandSize: "ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ",
    lblSoilType: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ",
    lblResourceCeilings: "ਸਰੋਤ ਸੀਮਾਵਾਂ",
    lblWater: "ਪਾਣੀ (ਮਿਲੀਮੀਟਰ)",
    lblBudget: "ਬਜਟ (₹)",
    lblHorizon: "ਦੂਰੀ ਅਤੇ ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ",
    lblNumSeasons: "ਸੀਜ਼ਨਾਂ ਦੀ ਗਿਣਤੀ",
    lblSoilHealth: "ਸ਼ੁਰੂਆਤੀ ਮਿੱਟੀ ਦੀ ਸਿਹਤ",
    lblDepleted: "ਖਾਲੀ (20)", lblModerate: "ਮੱਧਮ (55)", lblOptimal: "ਸਰਬੋਤਮ (95)",
    lblGeneratePlan: "ਸਰਵੋਤਮ ਫਸਲੀ ਚੱਕਰ ਯੋਜਨਾ ਤਿਆਰ ਕਰੋ",
    lblCSPDiag: "CSP ਖੋਜ ਇੰਜਨ ਨਿਦਾਨ",
    lblCSPDiagDesc: "ਬੈਕਟਰੈਕਿੰਗ ਅਤੇ ਫਾਰਵਰਡ ਚੈਕਿੰਗ ਵਿਸ਼ਲੇਸ਼ਣ",
    lblValidPlans: "ਯੋਗ ਯੋਜਨਾਵਾਂ", lblNodesExplored: "ਖੋਜੇ ਗਏ ਨੋਡ",
    lblFamilyPruned: "ਪਰਿਵਾਰ ਟਕਰਾਅ", lblWaterPruned: "ਪਾਣੀ ਦੀ ਵਧੀਕੀ",
    lblCostPruned: "ਲਾਗਤ ਦੀ ਵਧੀਕੀ", lblCropPool: "ਫਸਲ ਉਮੀਦਵਾਰ ਪੂਲ",
    lblSolvingCSP: "CSP ਸਮੱਸਿਆ ਹੱਲ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    lblSolvingDesc: "ਉਲੰਘਣਾ ਕਰਨ ਵਾਲੇ ਕ੍ਰਮਾਂ ਨੂੰ ਛਾਂਟਣਾ ਅਤੇ ਬਹੁ-ਗੁਣ ਅੰਦਾਜ਼ੇ ਸਕੋਰਾਂ ਦਾ ਮੁਲਾਂਕਣ",
    lblReadyToplan: "ਤੁਹਾਡੀ ਟਿਕਾਊ ਫਸਲੀ ਚੱਕਰ ਯੋਜਨਾ ਲਈ ਤਿਆਰ",
    lblReadyDesc: "ਖੱਬੇ ਪਾਸੇ ਖੇਤ ਦੀਆਂ ਰੁਕਾਵਟਾਂ ਸੈੱਟ ਕਰੋ ਜਾਂ ਉੱਪਰ ਦਿੱਤੇ ਪਹਿਲਾਂ ਕੌਂਫਿਗਰ ਕੀਤੇ ਸੀਨਾਰੀਓ ਦੀ ਚੋਣ ਕਰੋ।",
    lblRunFirst: "ਪਹਿਲੀ ਅਨੁਕੂਲਤਾ ਚਲਾਓ",
    lblConstraintConflict: "ਰੁਕਾਵਟ ਟਕਰਾਅ ਲੱਭਿਆ ਗਿਆ",
    lblCapitalBudget: "ਪੂੰਜੀ ਬਜਟ ਘਾਟਾ",
    lblProvidedBudget: "ਉਪਲਬਧ ਬਜਟ:",
    lblIrrigationWater: "ਸਿੰਚਾਈ ਪਾਣੀ ਬਜਟ",
    lblProvidedWater: "ਉਪਲਬਧ ਪਾਣੀ:",
    lblRecommendedFixes: "ਸਿਫਾਰਸ਼ ਕੀਤੇ ਸੁਧਾਰ (1-ਕਲਿੱਕ):",
    lblAutoAdjustBudget: "ਬਜਟ ਆਟੋਮੈਟਿਕ ਸੁਆਰੋ",
    lblAutoAdjustBudgetDesc: "ਮੌਜੂਦਾ ਜ਼ਮੀਨ ਅਤੇ ਸੀਜ਼ਨਾਂ ਲਈ ਘੱਟੋ-ਘੱਟ ਬਜਟ ਸੈੱਟ ਕਰੋ",
    lblDownscaleLand: "ਜ਼ਮੀਨ ਘਟਾਓ",
    lblDownscaleLandDesc: "ਮੌਜੂਦਾ ਬਜਟ ਰੱਖੋ ਭੂਖੰਡ ਦਾ ਆਕਾਰ ਘਟਾਓ",
    lblReduceSeasons: "2 ਸੀਜ਼ਨਾਂ ਤੱਕ ਘਟਾਓ",
    lblReduceSeasonsDesc: "ਕੁੱਲ ਖੇਤੀਬਾੜੀ ਲਾਗਤ ਘਟਾਉਣ ਲਈ ਦੂਰੀ ਛੋਟੀ ਕਰੋ",
    lblLoadBenchmark: "ਸੰਤੁਲਿਤ ਬੈਂਚਮਾਰਕ ਪ੍ਰੀਸੈੱਟ ਲੋਡ ਕਰੋ",
    lblLoadBenchmarkDesc: "ਜਾਂਚੇ ਗਏ ਬੇਸਲਾਈਨ ਮਾਪਦੰਡਾਂ ਤੇ ਰੀਸੈੱਟ ਕਰੋ",
    lblCSPCompliant: "CSP ਅਨੁਕੂਲ", lblHeuristicUtility: "ਹੇਅੁਰਿਸਟਿਕ ਉਪਯੋਗਿਤਾ:",
    lblOptimalStrategy: "ਸਰਵੋਤਮ ਫਸਲੀ ਚੱਕਰ ਰਣਨੀਤੀ", lblCandidatePlans: "ਉਮੀਦਵਾਰ ਯੋਜਨਾਵਾਂ:",
    lblNetProfit: "ਅਨੁਮਾਨਿਤ ਸ਼ੁੱਧ ਮੁਨਾਫਾ", lblWaterConsumption: "ਪਾਣੀ ਦੀ ਵਰਤੋਂ",
    lblCultivationCost: "ਕੁੱਲ ਖੇਤੀਬਾੜੀ ਲਾਗਤ", lblSoilHealthImpact: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਪ੍ਰਭਾਵ",
    lblMultiSeasonTitle: "ਬਹੁ-ਸੀਜ਼ਨ ਫਸਲੀ ਚੱਕਰ ਕ੍ਰਮ",
    lblMultiSeasonDesc: "ਬਿਮਾਰੀ ਵਾਹਕਾਂ ਨੂੰ ਤੋੜਨ ਮਿੱਟੀ ਨਾਈਟ੍ਰੋਜਨ ਬਹਾਲ ਕਰਨ ਅਤੇ ਖੇਤ ਆਮਦਨ ਵਧਾਉਣ ਲਈ ਖੇਤੀਬਾੜੀ ਵਿਗਿਆਨਕ ਕ੍ਰਮ",
    lblLegumeLegend: "ਦਾਲ (N-ਸਥਿਰਤਾ)", lblCerealLegend: "ਅਨਾਜ / ਘਾਹ",
    lblBiofumLegend: "ਜੈਵਿਕ ਧੂਮੀਕਰਨ / ਹੋਰ",
    lblSimLabTitle: "ਬੰਦ-ਲੂਪ ਸਿਮੂਲੇਸ਼ਨ ਅਤੇ ਮੁੜ-ਯੋਜਨਾਬੰਦੀ ਪ੍ਰਯੋਗਸ਼ਾਲਾ",
    lblSimLabDesc: "ਸੀਜ਼ਨ ਦੀ ਪ੍ਰਗਤੀ ਦੀ ਨਕਲ ਕਰੋ ਵਿਘਨ ਪਾਓ ਅਤੇ ਆਟੋਮੈਟਿਕ CSP ਮੁੜ-ਯੋਜਨਾਬੰਦੀ ਦੇਖੋ",
    lblSimReady: "ਸਿਮੂਲੇਸ਼ਨ ਤਿਆਰ (ਸੀਜ਼ਨ 1 ਵਿੱਚੋਂ 3)",
    lblSimNextSeason: "ਅਗਲਾ ਸੀਜ਼ਨ ਸਿਮੂਲੇਟ ਕਰੋ",
    lblAutoRunFull: "ਪੂਰਾ ਚੱਕਰ ਆਟੋਮੈਟਿਕ ਚਲਾਓ",
    lblInjectDisruption: "ਵਿਘਨ ਪਾਓ:",
    lblDrought: "ਮੱਧ-ਸੀਜ਼ਨ ਸੋਕਾ", lblPestOutbreak: "ਕੀੜੇ ਦਾ ਪ੍ਰਕੋਪ", lblReset: "ਰੀਸੈੱਟ",
    lblReplanTriggered: "ਬੰਦ-ਲੂਪ ਮੁੜ-ਯੋਜਨਾਬੰਦੀ ਸ਼ੁਰੂ ਹੋਈ",
    lblSeasonalLedger: "ਮੌਸਮੀ ਕਾਰਜ ਰਜਿਸਟਰ",
    thSeason: "ਸੀਜ਼ਨ", thCropPlanted: "ਬੀਜੀ ਫਸਲ", thSoilHealth: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ",
    thWaterUsed: "ਵਰਤਿਆ ਪਾਣੀ", thCultivationCost: "ਖੇਤੀ ਲਾਗਤ",
    thHarvestRevenue: "ਫਸਲ ਆਮਦਨ", thNetProfit: "ਸ਼ੁੱਧ ਮੁਨਾਫਾ", thDisruptions: "ਵਿਘਨ",
    lblVisualAnalytics: "ਦ੍ਰਿਸ਼ਟੀਕੋਣ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਖੇਤੀਬਾੜੀ ਰੁਝਾਨ",
    lblAnalyticsDesc: "ਸੀਜ਼ਨਾਂ ਵਿੱਚ ਗਤੀਸ਼ੀਲ ਮਿੱਟੀ ਸੰਭਾਲ ਆਰਥਿਕ ਪ੍ਰਦਰਸ਼ਨ ਅਤੇ ਸਰੋਤ ਵਰਤੋਂ ਟਰੈਕਿੰਗ",
    lblSoilChart: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਅਤੇ ਨਾਈਟ੍ਰੋਜਨ ਮਾਰਗ",
    lblSoilChartBadge: "ਗਤੀਸ਼ੀਲ ਸੂਚਕਾਂਕ (0-100)",
    lblEconomicsChart: "ਮੌਸਮੀ ਆਮਦਨ ਲਾਗਤ ਅਤੇ ਮੁਨਾਫਾ",
    lblEconomicsChartBadge: "ਵਿੱਤੀ (₹)",
    lblResourceChart: "ਸਰੋਤ ਵਰਤੋਂ ਬਨਾਮ ਖੇਤ ਬਜਟ",
    lblResourceChartBadge: "ਪਾਣੀ ਅਤੇ ਪੂੰਜੀ ਸੀਮਾਵਾਂ",
    lblExploreScenarios: "ਖੇਤਰੀ ਸੀਨਾਰੀਓ ਦੀ ਖੋਜ ਕਰੋ",
    lblScenarioHint: "CSP ਤੁਰੰਤ ਹੱਲ ਕਰਨ ਲਈ ਅਸਲ ਦੁਨੀਆ ਦੇ ਖੇਤੀ-ਜਲਵਾਯੂ ਪ੍ਰੋਫਾਈਲ ਦੀ ਚੋਣ ਕਰੋ:",
    lblKBTitle: "ਫਸਲ ਗਿਆਨ ਭੰਡਾਰ ਐਕਸਪਲੋਰਰ",
    lblKBDesc: "ਬਹੁ-ਆਯਾਮੀ ਰੁਕਾਵਟ ਮਾਪਦੰਡਾਂ ਦੇ ਨਾਲ 22 ਖੇਤਰੀ ਫਸਲਾਂ ਦਾ ਖੇਤੀਬਾੜੀ ਵਿਗਿਆਨ ਡੇਟਾਬੇਸ",
    lblCopilotTitle: "AI ਖੇਤੀ ਮਾਹਰ ਸਹਾਇਕ",
    lblCopilotStatus: "AgriPlan ਗਿਆਨ ਇੰਜਨ ਦੁਆਰਾ ਸੰਚਾਲਿਤ",
    lblCopilotLang: "ਜਵਾਬ ਭਾਸ਼ਾ:",
    currentLangLabel: "PA",
    copilotLangDisplay: "ਪੰਜਾਬੀ",
    copilotWelcomeMsg: "👋 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ <strong>AI ਖੇਤੀ ਮਾਹਰ ਸਹਾਇਕ</strong> ਹਾਂ।<br><br>ਫਸਲੀ ਚੱਕਰ ਯੋਜਨਾ ਬਾਰੇ ਪੁੱਛੋ।",
    lblFooter: "AI-ਆਧਾਰਿਤ ਫਸਲੀ ਚੱਕਰ ਯੋਜਨਾਬੰਦੀ ਪ੍ਰਣਾਲੀ &bull; ਸਮੈਸਟਰ AI ਪ੍ਰੋਜੈਕਟ",
    lblFooterTech: "CSP ਬੈਕਟਰੈਕਿੰਗ &bull; ਹੇਅੁਰਿਸਟਿਕ ਖੋਜ &bull; ਅਨਿਸ਼ਚਿਤਤਾ ਵਿੱਚ ਮੁੜ-ਯੋਜਨਾਬੰਦੀ &bull; ਬਹੁਭਾਸ਼ੀ ਸਹਾਇਤਾ",
    quickChips: ["ਛੋਲੇ ਕਿਉਂ?", "ਸੋਕਾ ਸੁਝਾਅ", "ਕੀੜੇ ਕੰਟਰੋਲ", "ਯੋਜਨਾ ਸਾਰਾਂਸ਼"],
    quickChipMsgs: ["ਛੋਲੇ ਕਿਉਂ ਚੁਣੇ ਗਏ?", "ਸੋਕੇ ਦਾ ਪ੍ਰਬੰਧਨ ਕਿਵੇਂ ਕਰਨਾ ਹੈ?", "ਕੀੜਿਆਂ ਨੂੰ ਕਿਵੇਂ ਕੰਟਰੋਲ ਕਰਨਾ ਹੈ?", "ਮੇਰੀ ਫਸਲੀ ਯੋਜਨਾ ਦਾ ਸਾਰਾਂਸ਼ ਕੀ ਹੈ?"],
    copilotPlaceholder: "ਆਪਣੇ ਖੇਤੀ ਮਾਹਰ ਤੋਂ ਪੁੱਛੋ...",
    lblSeasonN: "ਸੀਜ਼ਨ", lblDays: "ਦਿਨ", lblWaterNeed: "ਪਾਣੀ ਦੀ ਲੋੜ",
    lblEstYield: "ਅਨੁਮਾਨਿਤ ਝਾੜ", lblCostPerAcre: "ਲਾਗਤ/ਏਕੜ", lblMarketRate: "ਮੰਡੀ ਭਾਅ",
    lblRationale: "ਖੇਤੀ ਤਰਕ ਅਤੇ ਰੱਦ", lblSelectionReason: "ਚੋਣ ਕਾਰਨ",
    lblAgronomicSynergies: "ਖੇਤੀਬਾੜੀ ਸਮਨਵਯ", lblRejectedAlt: "ਰੱਦ ਕੀਤੇ ਵਿਕਲਪ",
    lblNominal: "ਸਾਧਾਰਨ", planLabelOptimal: "ਯੋਜਨਾ A (ਸਰਵੋਤਮ)", planLabelAlt: "ਯੋਜਨਾ",
    lblSafetyReserve: "ਸੁਰੱਖਿਆ ਭੰਡਾਰ", lblUnspent: "ਖਰਚ ਨਾ ਕੀਤਾ", lblNetNBalance: "ਕਿਲੋ/ਹੈਕਟੇਅਰ ਨੈੱਟ N",
    lblCompleted: "ਸਾਰੇ ਸੀਜ਼ਨ ਪੂਰੇ", lblActiveSeason: "ਸਰਗਰਮ ਸੀਜ਼ਨ", lblOf: "ਵਿੱਚੋਂ",
    lblSeasonProj: "ਅਨੁਮਾਨਿਤ",
    lblOptimSoilBaseline: "ਸਰਵੋਤਮ ਮਿੱਟੀ ਗੁਣਵੱਤਾ ਅਧਾਰਰੇਖਾ",
    lblSoilHealthIdx: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਸੂਚਕਾਂਕ (0-100)",
    lblGrossRevenue: "ਕੁੱਲ ਆਮਦਨ (₹)", lblCultivationCostChart: "ਖੇਤੀ ਲਾਗਤ (₹)", lblNetProfitChart: "ਸ਼ੁੱਧ ਮੁਨਾਫਾ (₹)",
    lblWaterUtilLabel: "ਪਾਣੀ ਬਜਟ ਵਰਤੋਂ", lblCostUtilLabel: "ਲਾਗਤ ਬਜਟ ਵਰਤੋਂ",
    lblUsedResource: "ਵਰਤਿਆ ਸਰੋਤ (%)", lblSafetyBuffer: "ਬਕਾਇਆ ਸੁਰੱਖਿਆ ਬਫਰ (%)"
  },
  es: {
    navSubtitle: "Agente de Rotación de Cultivos &bull; Sistema de Decisión CSP de Bucle Cerrado",
    lblBenchmark: "Escenario de Referencia:",
    lblKnowledgeBase: "Base de Conocimiento de Cultivos",
    lblCopilot: "Copiloto IA",
    lblFarmInputs: "Entradas de Granja y Ambientales",
    lblFarmInputsDesc: "Definir parámetros del terreno y límites de recursos compartidos",
    lblPlotParams: "Parámetros del Terreno",
    lblLandSize: "Tamaño del Terreno",
    lblSoilType: "Tipo de Suelo",
    lblResourceCeilings: "Límites de Recursos",
    lblWater: "Agua (mm)",
    lblBudget: "Presupuesto (₹)",
    lblHorizon: "Horizonte y Estado del Suelo",
    lblNumSeasons: "Número de Temporadas",
    lblSoilHealth: "Salud Inicial del Suelo",
    lblDepleted: "Agotado (20)", lblModerate: "Moderado (55)", lblOptimal: "Óptimo (95)",
    lblGeneratePlan: "Generar Plan de Rotación Óptimo",
    lblCSPDiag: "Diagnóstico del Motor de Búsqueda CSP",
    lblCSPDiagDesc: "Análisis de retroceso y verificación hacia adelante",
    lblValidPlans: "Planes Válidos Encontrados", lblNodesExplored: "Nodos de Búsqueda Explorados",
    lblFamilyPruned: "Conflictos de Familia Podados", lblWaterPruned: "Excesos de Agua Podados",
    lblCostPruned: "Excesos de Costo Podados", lblCropPool: "Grupo de Cultivos Candidatos",
    lblSolvingCSP: "Resolviendo el Problema de Satisfacción de Restricciones...",
    lblSolvingDesc: "Podando secuencias que violan restricciones y evaluando puntuaciones heurísticas",
    lblReadyToplan: "Listo para Planificar su Rotación de Cultivos Sostenible",
    lblReadyDesc: "Configure las restricciones de su granja a la izquierda o seleccione un escenario preconfigurado arriba.",
    lblRunFirst: "Ejecutar Primera Optimización",
    lblConstraintConflict: "Conflicto de Restricciones Detectado",
    lblCapitalBudget: "Déficit de Presupuesto de Capital",
    lblProvidedBudget: "Presupuesto Proporcionado:",
    lblIrrigationWater: "Presupuesto de Agua de Riego",
    lblProvidedWater: "Agua Proporcionada:",
    lblRecommendedFixes: "Correcciones Automáticas Recomendadas (1-Clic):",
    lblAutoAdjustBudget: "Ajustar Presupuesto a",
    lblAutoAdjustBudgetDesc: "Establecer el mínimo viable para tierra y temporadas actuales",
    lblDownscaleLand: "Reducir Terreno a",
    lblDownscaleLandDesc: "Mantener presupuesto actual, reducir tamaño del terreno",
    lblReduceSeasons: "Reducir a 2 Temporadas",
    lblReduceSeasonsDesc: "Acortar horizonte para reducir costos de cultivo totales",
    lblLoadBenchmark: "Cargar Preset de Referencia Equilibrado",
    lblLoadBenchmarkDesc: "Restablecer los parámetros de referencia probados",
    lblCSPCompliant: "Conforme con CSP", lblHeuristicUtility: "Utilidad Heurística:",
    lblOptimalStrategy: "Estrategia Óptima de Rotación de Cultivos", lblCandidatePlans: "Planes Candidatos:",
    lblNetProfit: "Ganancia Neta Estimada", lblWaterConsumption: "Consumo de Agua",
    lblCultivationCost: "Costo Total de Cultivo", lblSoilHealthImpact: "Impacto en Salud del Suelo",
    lblMultiSeasonTitle: "Secuencia de Rotación de Cultivos Multitemporada",
    lblMultiSeasonDesc: "Cronología agronómica diseñada para romper vectores de enfermedades restaurar nitrógeno del suelo y maximizar ingresos agrícolas",
    lblLegumeLegend: "Leguminosa (Fijadora de N)", lblCerealLegend: "Cereal / Gramínea",
    lblBiofumLegend: "Biofumigante / Otro",
    lblSimLabTitle: "Laboratorio de Simulación y Replanificación de Bucle Cerrado",
    lblSimLabDesc: "Simule la progresión de temporadas inyecte perturbaciones y observe la replanificación automática CSP",
    lblSimReady: "Simulación Lista (Temporada 1 de 3)",
    lblSimNextSeason: "Simular Siguiente Temporada",
    lblAutoRunFull: "Ejecutar Ciclo Completo Automáticamente",
    lblInjectDisruption: "Inyectar Perturbación:",
    lblDrought: "Sequía a Mitad de Temporada", lblPestOutbreak: "Brote de Plagas", lblReset: "Restablecer",
    lblReplanTriggered: "Replanificación de Bucle Cerrado Activada",
    lblSeasonalLedger: "Libro de Ejecución Estacional",
    thSeason: "Temporada", thCropPlanted: "Cultivo Plantado", thSoilHealth: "Salud del Suelo",
    thWaterUsed: "Agua Usada", thCultivationCost: "Costo de Cultivo",
    thHarvestRevenue: "Ingresos por Cosecha", thNetProfit: "Ganancia Neta", thDisruptions: "Perturbaciones",
    lblVisualAnalytics: "Análisis Visual y Tendencias Agronómicas",
    lblAnalyticsDesc: "Seguimiento de preservación dinámica del suelo rendimiento económico y agotamiento de recursos entre temporadas",
    lblSoilChart: "Trayectoria de Salud del Suelo y Nitrógeno",
    lblSoilChartBadge: "Índice Dinámico (0-100)",
    lblEconomicsChart: "Ingresos Costos y Ganancias por Temporada",
    lblEconomicsChartBadge: "Finanzas (₹)",
    lblResourceChart: "Utilización de Recursos vs. Presupuestos Agrícolas",
    lblResourceChartBadge: "Agua y Límites de Capital",
    lblExploreScenarios: "Explorar Escenarios Regionales",
    lblScenarioHint: "Seleccione un perfil agro-climático del mundo real para resolver el CSP inmediatamente y simular dinámicas de múltiples temporadas:",
    lblKBTitle: "Explorador de Base de Conocimiento de Cultivos",
    lblKBDesc: "Base de datos agronómica de 22 cultivos regionales con parámetros de restricción multidimensionales",
    lblCopilotTitle: "Copiloto Agrónomo IA",
    lblCopilotStatus: "Impulsado por el Motor de Conocimiento AgriPlan",
    lblCopilotLang: "Respondiendo en:",
    currentLangLabel: "ES",
    copilotLangDisplay: "Español",
    copilotWelcomeMsg: "👋 ¡Hola! Soy tu <strong>Copiloto Agrónomo IA</strong>.<br><br>Pregúntame sobre tu plan de rotación de cultivos.",
    lblFooter: "Sistema de Planificación de Rotación de Cultivos Basado en IA &bull; Proyecto Semestral de IA",
    lblFooterTech: "Retroceso CSP &bull; Búsqueda Heurística &bull; Replanificación bajo Incertidumbre &bull; Soporte Multilingüe",
    quickChips: ["¿Por qué garbanzo?", "Consejos sequía", "Control plagas", "Resumen plan"],
    quickChipMsgs: ["¿Por qué se seleccionó el garbanzo?", "¿Cómo gestionar la sequía?", "¿Cómo controlar las plagas?", "¿Cuál es el resumen de mi plan de cultivo?"],
    copilotPlaceholder: "Pregúntale a tu agrónomo...",
    lblSeasonN: "Temporada", lblDays: "Días", lblWaterNeed: "Necesidad de Agua",
    lblEstYield: "Rendimiento Est.", lblCostPerAcre: "Costo/Acre", lblMarketRate: "Precio de Mercado",
    lblRationale: "Justificación Agronómica y Rechazos", lblSelectionReason: "Razón de Selección",
    lblAgronomicSynergies: "Sinergias Agronómicas", lblRejectedAlt: "Alternativas Rechazadas Top",
    lblNominal: "Nominal", planLabelOptimal: "Plan A (Óptimo)", planLabelAlt: "Plan",
    lblSafetyReserve: "reserva de seguridad", lblUnspent: "sin gastar", lblNetNBalance: "kg/ha Balance Neto N",
    lblCompleted: "Todas las Temporadas Completadas", lblActiveSeason: "Temporada Activa", lblOf: "de",
    lblSeasonProj: "Proy",
    lblOptimSoilBaseline: "Línea Base de Calidad del Suelo Óptima",
    lblSoilHealthIdx: "Índice de Salud del Suelo (0-100)",
    lblGrossRevenue: "Ingresos Brutos (₹)", lblCultivationCostChart: "Costo de Cultivo (₹)", lblNetProfitChart: "Ganancia Neta (₹)",
    lblWaterUtilLabel: "Utilización del Presupuesto de Agua", lblCostUtilLabel: "Utilización del Presupuesto de Costo",
    lblUsedResource: "Recurso Utilizado (%)", lblSafetyBuffer: "Buffer de Seguridad Restante (%)"
  }
};

// =============================================
// Apply i18n translations to DOM
// =============================================
function applyLanguage(lang) {
  const t = I18N[lang] || I18N.en;
  state.currentLang = lang;
  localStorage.setItem("agriplan_lang", lang);

  // Simple text IDs
  const textIds = [
    "navSubtitle","lblBenchmark","lblKnowledgeBase","lblCopilot","lblFarmInputs","lblFarmInputsDesc",
    "lblPlotParams","lblLandSize","lblSoilType","lblResourceCeilings","lblWater","lblBudget",
    "lblHorizon","lblNumSeasons","lblSoilHealth","lblDepleted","lblModerate","lblOptimal",
    "lblGeneratePlan","lblCSPDiag","lblCSPDiagDesc","lblValidPlans","lblNodesExplored",
    "lblFamilyPruned","lblWaterPruned","lblCostPruned","lblCropPool","lblSolvingCSP","lblSolvingDesc",
    "lblReadyToplan","lblReadyDesc","lblRunFirst","lblConstraintConflict","lblCapitalBudget",
    "lblProvidedBudget","lblIrrigationWater","lblProvidedWater","lblRecommendedFixes",
    "lblAutoAdjustBudget","lblAutoAdjustBudgetDesc","lblDownscaleLand","lblDownscaleLandDesc",
    "lblReduceSeasons","lblReduceSeasonsDesc","lblLoadBenchmark","lblLoadBenchmarkDesc",
    "lblCSPCompliant","lblHeuristicUtility","lblOptimalStrategy","lblCandidatePlans",
    "lblNetProfit","lblWaterConsumption","lblCultivationCost","lblSoilHealthImpact",
    "lblMultiSeasonTitle","lblMultiSeasonDesc","lblLegumeLegend","lblCerealLegend","lblBiofumLegend",
    "lblSimLabTitle","lblSimLabDesc","lblSimReady","lblSimNextSeason","lblAutoRunFull",
    "lblInjectDisruption","lblDrought","lblPestOutbreak","lblReset","lblReplanTriggered",
    "lblSeasonalLedger","thSeason","thCropPlanted","thSoilHealth","thWaterUsed",
    "thCultivationCost","thHarvestRevenue","thNetProfit","thDisruptions","lblVisualAnalytics",
    "lblAnalyticsDesc","lblSoilChart","lblSoilChartBadge","lblEconomicsChart",
    "lblEconomicsChartBadge","lblResourceChart","lblResourceChartBadge","lblExploreScenarios",
    "lblScenarioHint","lblKBTitle","lblKBDesc","lblCopilotTitle","lblCopilotStatus",
    "lblCopilotLang","currentLangLabel","copilotLangDisplay","lblFooter","lblFooterTech"
  ];
  textIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id] !== undefined) {
      el.innerHTML = t[id];
    }
  });

  // Copilot placeholder
  const copilotInput = document.getElementById("copilotInput");
  if (copilotInput && t.copilotPlaceholder) {
    copilotInput.placeholder = t.copilotPlaceholder;
  }

  // Copilot welcome message
  const welcomeMsg = document.getElementById("copilotWelcomeMsg");
  if (welcomeMsg && t.copilotWelcomeMsg) {
    welcomeMsg.innerHTML = t.copilotWelcomeMsg +
      `<div class="copilot-quick-chips" id="copilotQuickChips">
        ${(t.quickChips || []).map((chip, i) =>
          `<button class="quick-chip" data-msg="${(t.quickChipMsgs||[])[i]||chip}">${chip}</button>`
        ).join("")}
      </div>`;
    initQuickChips();
  }

  // Update lang dropdown active state
  document.querySelectorAll(".lang-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Reload crops & presets in new language (KB)
  fetchCropsAndPresets();
}

// =============================================
// DOM Content Loaded Handler
// =============================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    initLucideIcons();
    initTheme();
    initLanguageSwitcher();
    initFormListeners();
    initModalListeners();
    initCopilot();
    const savedLang = localStorage.getItem("agriplan_lang") || "en";
    await loadKnowledgeBaseAndPresets(savedLang);
    applyLanguage(savedLang);
    initDefaultPreset();
  } catch (err) {
    console.error("Critical frontend initialization error:", err);
  }
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// =============================================
// Language Switcher
// =============================================
function initLanguageSwitcher() {
  const langToggleBtn = document.getElementById("langToggleBtn");
  const langDropdown = document.getElementById("langDropdown");

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("open");
    });
  }

  document.addEventListener("click", () => {
    if (langDropdown) langDropdown.classList.remove("open");
  });

  document.querySelectorAll(".lang-option").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const lang = btn.dataset.lang;
      applyLanguage(lang);
      langDropdown.classList.remove("open");
    });
  });
}

// Theme Management
function initTheme() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const savedTheme = localStorage.getItem("agriplan_theme") || "theme-dark";
  document.body.className = savedTheme;

  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("theme-dark");
    const newTheme = isDark ? "theme-light" : "theme-dark";
    document.body.className = newTheme;
    localStorage.setItem("agriplan_theme", newTheme);
    updateChartTheme();
  });
}

// Form and UI Listeners
function initFormListeners() {
  const landSizeSlider = document.getElementById("landSize");
  const landSizeDisplay = document.getElementById("landSizeDisplay");
  landSizeSlider.addEventListener("input", (e) => {
    landSizeDisplay.textContent = `${parseFloat(e.target.value).toFixed(1)} Acres`;
    updateLiveFeasibilityHints();
  });

  const soilHealthSlider = document.getElementById("initialSoilHealth");
  const soilHealthDisplay = document.getElementById("soilHealthDisplay");
  soilHealthSlider.addEventListener("input", (e) => {
    soilHealthDisplay.textContent = `${e.target.value} / 100`;
  });

  const pillBtns = document.querySelectorAll("#seasonPills .pill-btn");
  const seasonsCountInput = document.getElementById("seasonsCount");
  pillBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pillBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      seasonsCountInput.value = btn.dataset.seasons;
      updateLiveFeasibilityHints();
    });
  });

  const waterBudgetInput = document.getElementById("waterBudget");
  if (waterBudgetInput) waterBudgetInput.addEventListener("input", updateLiveFeasibilityHints);

  const costBudgetInput = document.getElementById("costBudget");
  if (costBudgetInput) costBudgetInput.addEventListener("input", updateLiveFeasibilityHints);

  const soilTypeSelect = document.getElementById("soilType");
  if (soilTypeSelect) soilTypeSelect.addEventListener("change", updateLiveFeasibilityHints);

  const planningForm = document.getElementById("planningForm");
  planningForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await generateCropRotationPlan();
  });

  const emptyGenerateBtn = document.getElementById("emptyGenerateBtn");
  if (emptyGenerateBtn) {
    emptyGenerateBtn.addEventListener("click", () => generateCropRotationPlan());
  }

  document.getElementById("simNextSeasonBtn").addEventListener("click", () => advanceSimulationStep());
  document.getElementById("simAutoRunBtn").addEventListener("click", () => autoRunSimulation());
  document.getElementById("triggerDroughtBtn").addEventListener("click", () => triggerDisruption("drought"));
  document.getElementById("triggerPestBtn").addEventListener("click", () => triggerDisruption("pest_outbreak"));
  document.getElementById("simResetBtn").addEventListener("click", () => resetSimulation());
}

// Modal Listeners
function initModalListeners() {
  const kbModal = document.getElementById("kbModal");
  const openKbBtn = document.getElementById("openKbBtn");
  const closeKbBtn = document.getElementById("closeKbBtn");

  openKbBtn.addEventListener("click", () => {
    kbModal.classList.remove("hidden");
    renderKnowledgeBaseCards();
  });

  closeKbBtn.addEventListener("click", () => {
    kbModal.classList.add("hidden");
  });

  kbModal.addEventListener("click", (e) => {
    if (e.target === kbModal) kbModal.classList.add("hidden");
  });

  document.getElementById("kbSearchInput").addEventListener("input", filterKnowledgeBase);
  document.getElementById("kbFamilyFilter").addEventListener("change", filterKnowledgeBase);
  document.getElementById("kbSoilFilter").addEventListener("change", filterKnowledgeBase);
}

// =============================================
// Load Crops & Presets (with lang)
// =============================================
async function loadKnowledgeBaseAndPresets(lang = "en") {
  try {
    const [cropsRes, presetsRes] = await Promise.all([
      fetch(`/api/crops?lang=${lang}`),
      fetch(`/api/presets?lang=${lang}`)
    ]);

    const cropsData = await cropsRes.json();
    state.cropKnowledgeBase = cropsData.crops || [];
    state.families = cropsData.families || {};

    const presetsData = await presetsRes.json();
    state.presets = presetsData.presets || {};
    renderPresetChips();
    updateLiveFeasibilityHints();
  } catch (err) {
    console.error("Failed to load initial metadata:", err);
  }
}

async function fetchCropsAndPresets() {
  await loadKnowledgeBaseAndPresets(state.currentLang);
}

// Render Presets
function renderPresetChips() {
  const track = document.getElementById("scenarioCardsTrack");
  const navSelect = document.getElementById("navPresetSelect");

  if (track) track.innerHTML = "";
  if (navSelect) {
    navSelect.innerHTML = "";
    if (!navSelect.dataset.hasListener) {
      navSelect.dataset.hasListener = "true";
      navSelect.addEventListener("change", (e) => {
        loadPreset(e.target.value);
      });
    }
  }

  const iconsMap = {
    semi_arid_deccan: "sun",
    indo_gangetic: "sprout",
    commercial_horticulture: "trending-up",
    drought_stressed_sandy: "droplets"
  };

  Object.values(state.presets).forEach((preset) => {
    if (navSelect) {
      const opt = document.createElement("option");
      opt.value = preset.id;
      opt.textContent = preset.title;
      navSelect.appendChild(opt);
    }

    if (track) {
      const card = document.createElement("div");
      card.className = "scenario-card-item";
      card.id = `scenarioCard_${preset.id}`;
      const iconName = iconsMap[preset.id] || "compass";

      card.innerHTML = `
        <div class="scenario-card-top">
          <div class="scenario-card-title">
            <i data-lucide="${iconName}"></i> ${preset.title}
          </div>
          <span class="scenario-active-indicator hidden" id="activeBadge_${preset.id}">Active</span>
        </div>
        <p class="scenario-card-desc">${preset.description}</p>
      `;

      card.addEventListener("click", () => loadPreset(preset.id));
      track.appendChild(card);
    }
  });

  initLucideIcons();
}

function loadPreset(presetId) {
  const preset = state.presets[presetId];
  if (!preset) return;

  const navSelect = document.getElementById("navPresetSelect");
  if (navSelect && navSelect.value !== presetId) {
    navSelect.value = presetId;
  }

  document.querySelectorAll(".scenario-card-item").forEach((card) => {
    const isThis = card.id === `scenarioCard_${presetId}`;
    card.classList.toggle("active", isThis);
    const badge = card.querySelector(".scenario-active-indicator");
    if (badge) badge.classList.toggle("hidden", !isThis);
  });

  document.getElementById("landSize").value = preset.land_size_acres;
  document.getElementById("landSizeDisplay").textContent = `${preset.land_size_acres.toFixed(1)} Acres`;
  document.getElementById("soilType").value = preset.soil_type;
  document.getElementById("waterBudget").value = preset.water_budget_mm;
  document.getElementById("costBudget").value = preset.cost_budget;
  document.getElementById("initialSoilHealth").value = preset.initial_soil_health;
  document.getElementById("soilHealthDisplay").textContent = `${preset.initial_soil_health} / 100`;
  document.getElementById("seasonsCount").value = preset.seasons_count;
  document.querySelectorAll("#seasonPills .pill-btn").forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.seasons) === preset.seasons_count);
  });

  updateLiveFeasibilityHints();
  generateCropRotationPlan();
}

function initDefaultPreset() {
  loadPreset("semi_arid_deccan");
}


// =============================================
// Plan Generation
// =============================================
async function generateCropRotationPlan() {
  const form = document.getElementById("planningForm");
  const formData = new FormData(form);

  const payload = {
    land_size_acres: parseFloat(formData.get("land_size_acres")),
    soil_type: formData.get("soil_type"),
    water_budget_mm: parseFloat(formData.get("water_budget_mm")),
    cost_budget: parseFloat(formData.get("cost_budget")),
    seasons_count: parseInt(formData.get("seasons_count")),
    initial_soil_health: parseFloat(formData.get("initial_soil_health")),
    lang: state.currentLang
  };

  showLoading(true);

  try {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    showLoading(false);

    if (data.status === "no_solution") {
      renderConflictPanel(data);
      updateCSPDiagnostics(data.stats, 0);
      return;
    }

    if (data.status !== "success") {
      console.error("Plan generation API error:", data.message);
      renderConflictPanel({
        status: "no_solution",
        message: data.message || "Failed to generate valid crop rotation sequence.",
        diagnostics: {},
        suggestions: {}
      });
      return;
    }

    state.currentPlanData = data;
    state.activePlanIndex = 0;
    renderResults(data);
    updateCSPDiagnostics(data.search_stats, data.total_solutions_found);
    await startSimulationSession(payload);

  } catch (err) {
    showLoading(false);
    console.error("Plan generation error:", err);
  }
}

function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}

// =============================================
// Render Results UI
// =============================================
function renderResults(data) {
  document.getElementById("emptyState").classList.add("hidden");
  const conflictState = document.getElementById("conflictState");
  if (conflictState) conflictState.classList.add("hidden");
  document.getElementById("resultsContainer").classList.remove("hidden");

  const bestPlan = data.best_plan;
  renderPlanHeader(bestPlan);
  renderPlanSwitcher(data);
  renderMetricCards(bestPlan);
  renderRotationTimeline(bestPlan);
  renderCharts(bestPlan);
  initLucideIcons();
}

function renderConflictPanel(data) {
  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("resultsContainer").classList.add("hidden");

  const conflictState = document.getElementById("conflictState");
  if (!conflictState) return;
  conflictState.classList.remove("hidden");

  const diag = data.diagnostics || {};
  const sugg = data.suggestions || {};
  const costDeficit = diag.cost_deficit || 0;
  const waterDeficit = diag.water_deficit || 0;

  const conflictTitle = document.getElementById("conflictTitle");
  const conflictSubtitle = document.getElementById("conflictSubtitle");
  if (costDeficit > 0 && waterDeficit > 0) {
    conflictTitle.textContent = "Both Capital Budget & Water Reserves are Deficient";
    conflictSubtitle.textContent = `Cultivating ${diag.land_size_acres} acres over ${diag.seasons_count} seasons requires higher capital and more water than provided.`;
  } else if (costDeficit > 0) {
    conflictTitle.textContent = `Capital Budget Deficit for ${diag.land_size_acres} Acres`;
    conflictSubtitle.textContent = `Provided budget of ₹${Math.round(diag.cost_provided).toLocaleString()} is below the minimum cultivation cost across ${diag.seasons_count} seasons.`;
  } else if (waterDeficit > 0) {
    conflictTitle.textContent = `Irrigation Water Deficit for ${diag.seasons_count} Seasons`;
    conflictSubtitle.textContent = `Provided water of ${diag.water_provided} mm is below the minimum biological water requirements of suitable crops.`;
  } else {
    conflictTitle.textContent = "Agronomic Constraint Infeasibility";
    conflictSubtitle.textContent = data.message || "No rotation sequence satisfies all selected constraints.";
  }

  const costBadge = document.getElementById("conflictCostBadge");
  const costProvided = document.getElementById("conflictCostProvided");
  const costRequired = document.getElementById("conflictCostRequired");
  const costReqLabel = document.getElementById("conflictCostReqLabel");
  const costExpl = document.getElementById("conflictCostExplanation");

  costProvided.textContent = `₹${Math.round(diag.cost_provided || 0).toLocaleString()}`;
  costRequired.textContent = `₹${Math.round(diag.cost_min_required || 0).toLocaleString()}`;
  if (costReqLabel) costReqLabel.textContent = `Min. Required (${diag.land_size_acres || 0} Ac • ${diag.seasons_count || 0} S):`;

  if (costDeficit > 0) {
    costBadge.className = "c-status-badge badge-deficit";
    costBadge.textContent = `Deficit: -₹${Math.round(costDeficit).toLocaleString()}`;
    const cropName = diag.cheapest_crop_name || "lowest-input crop";
    const rate = Math.round(diag.cheapest_rate_per_acre || 8800).toLocaleString();
    costExpl.textContent = `Even the cheapest suitable crop (${cropName} @ ₹${rate}/acre) exceeds your capital budget.`;
  } else {
    costBadge.className = "c-status-badge badge-sufficient";
    costBadge.textContent = "Sufficient";
    costExpl.textContent = `Capital budget of ₹${Math.round(diag.cost_provided || 0).toLocaleString()} meets the required minimum.`;
  }

  const waterBadge = document.getElementById("conflictWaterBadge");
  const waterProvided = document.getElementById("conflictWaterProvided");
  const waterRequired = document.getElementById("conflictWaterRequired");
  const waterReqLabel = document.getElementById("conflictWaterReqLabel");
  const waterExpl = document.getElementById("conflictWaterExplanation");

  waterProvided.textContent = `${diag.water_provided || 0} mm`;
  waterRequired.textContent = `${diag.water_min_required || 0} mm`;
  if (waterReqLabel) waterReqLabel.textContent = `Min. Required (${diag.seasons_count || 0} Seasons):`;

  if (waterDeficit > 0) {
    waterBadge.className = "c-status-badge badge-deficit";
    waterBadge.textContent = `Deficit: -${Math.round(waterDeficit)} mm`;
    waterExpl.textContent = `Minimum water required for ${diag.seasons_count} seasons is ${diag.water_min_required} mm.`;
  } else {
    waterBadge.className = "c-status-badge badge-sufficient";
    waterBadge.textContent = "Sufficient";
    waterExpl.textContent = `Water budget of ${diag.water_provided} mm is sufficient.`;
  }

  const fixBudgetBtn = document.getElementById("conflictFixBudgetBtn");
  const btnBudgetText = document.getElementById("conflictBtnBudgetText");
  if (costDeficit > 0) {
    fixBudgetBtn.classList.remove("hidden");
    const targetBudget = Math.round(sugg.recommended_min_cost || diag.cost_min_required || 100000);
    btnBudgetText.textContent = `₹${targetBudget.toLocaleString()}`;
    fixBudgetBtn.onclick = () => {
      document.getElementById("costBudget").value = targetBudget;
      updateLiveFeasibilityHints();
      generateCropRotationPlan();
    };
  } else {
    fixBudgetBtn.classList.add("hidden");
  }

  const fixLandBtn = document.getElementById("conflictFixLandBtn");
  const btnLandText = document.getElementById("conflictBtnLandText");
  const feasibleLand = sugg.feasible_land_size || 1.0;
  btnLandText.textContent = `${feasibleLand} Acres`;
  fixLandBtn.onclick = () => {
    document.getElementById("landSize").value = feasibleLand;
    document.getElementById("landSizeDisplay").textContent = `${feasibleLand.toFixed(1)} Acres`;
    updateLiveFeasibilityHints();
    generateCropRotationPlan();
  };

  const fixSeasonsBtn = document.getElementById("conflictFixSeasonsBtn");
  const btnSeasonsCostText = document.getElementById("conflictBtnSeasonsCostText");
  if (sugg.can_shorten_seasons) {
    fixSeasonsBtn.classList.remove("hidden");
    btnSeasonsCostText.textContent = `₹${Math.round(sugg.shortened_seasons_cost || 0).toLocaleString()}`;
    fixSeasonsBtn.onclick = () => {
      document.getElementById("seasonsCount").value = 2;
      document.querySelectorAll("#seasonPills .pill-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.seasons === "2");
      });
      updateLiveFeasibilityHints();
      generateCropRotationPlan();
    };
  } else {
    fixSeasonsBtn.classList.add("hidden");
  }

  const resetPresetBtn = document.getElementById("conflictResetPresetBtn");
  resetPresetBtn.onclick = () => { loadPreset("semi_arid_deccan"); };

  initLucideIcons();
}

function updateLiveFeasibilityHints() {
  const landSizeEl = document.getElementById("landSize");
  const soilTypeEl = document.getElementById("soilType");
  const costBudgetEl = document.getElementById("costBudget");
  const waterBudgetEl = document.getElementById("waterBudget");
  const seasonsCountEl = document.getElementById("seasonsCount");

  if (!landSizeEl || !soilTypeEl || !costBudgetEl || !waterBudgetEl || !seasonsCountEl) return;

  const landSize = parseFloat(landSizeEl.value) || 2.0;
  const soilType = soilTypeEl.value || "Loamy";
  const costBudget = parseFloat(costBudgetEl.value) || 0;
  const waterBudget = parseFloat(waterBudgetEl.value) || 0;
  const seasonsCount = parseInt(seasonsCountEl.value) || 3;

  const suitableCrops = (state.cropKnowledgeBase || []).filter(c => c.suitable_soils && c.suitable_soils.includes(soilType));
  const minCostPerAcre = suitableCrops.length > 0 ? Math.min(...suitableCrops.map(c => c.cost_per_acre)) : 8800;
  const minWaterMm = suitableCrops.length > 0 ? Math.min(...suitableCrops.map(c => c.water_req_mm)) : 220;

  const minTotalCost = minCostPerAcre * landSize * seasonsCount;
  const minTotalWater = minWaterMm * seasonsCount;

  const budgetHint = document.getElementById("budgetFeasibilityHint");
  const budgetBadge = document.getElementById("budgetFeasibilityBadge");
  if (budgetHint && budgetBadge) {
    if (costBudget < minTotalCost) {
      budgetBadge.className = "live-feasibility-tag active tag-deficit";
      budgetBadge.textContent = "Deficit";
      budgetHint.innerHTML = `<span class="text-danger" style="font-weight:600;">Min needed for ${landSize.toFixed(1)} Ac (${seasonsCount}S): ~₹${Math.round(minTotalCost).toLocaleString()}</span>`;
    } else {
      budgetBadge.className = "live-feasibility-tag active tag-ok";
      budgetBadge.textContent = "Viable";
      budgetHint.textContent = `Min required: ~₹${Math.round(minTotalCost).toLocaleString()}`;
    }
  }

  const waterHint = document.getElementById("waterFeasibilityHint");
  const waterBadge = document.getElementById("waterFeasibilityBadge");
  if (waterHint && waterBadge) {
    if (waterBudget < minTotalWater) {
      waterBadge.className = "live-feasibility-tag active tag-deficit";
      waterBadge.textContent = "Deficit";
      waterHint.innerHTML = `<span class="text-danger" style="font-weight:600;">Min needed for ${seasonsCount}S: ~${minTotalWater} mm</span>`;
    } else {
      waterBadge.className = "live-feasibility-tag active tag-ok";
      waterBadge.textContent = "Viable";
      waterHint.textContent = `Min required: ~${minTotalWater} mm`;
    }
  }
}

function renderPlanHeader(plan) {
  document.getElementById("ribbonScore").textContent = plan.heuristic_score.toFixed(1);
  document.getElementById("ribbonFamiliesCount").textContent = `${plan.unique_families_count} Unique Botanical Families`;
  const cropChain = plan.crop_names.join(" → ");
  document.getElementById("ribbonSubtitle").textContent = `Recommended Sequence: ${cropChain}`;
}

function renderPlanSwitcher(data) {
  const tabsContainer = document.getElementById("planTabs");
  tabsContainer.innerHTML = "";
  const t = I18N[state.currentLang] || I18N.en;
  const allPlans = [data.best_plan, ...(data.alternative_plans || [])];

  allPlans.forEach((plan, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `plan-tab-btn ${idx === state.activePlanIndex ? "active" : ""}`;
    const label = idx === 0 ? t.planLabelOptimal : `${t.planLabelAlt} ${String.fromCharCode(65 + idx)}`;
    btn.innerHTML = `<strong>${label}</strong> &bull; Score ${plan.heuristic_score}`;
    btn.addEventListener("click", () => switchActivePlan(idx, allPlans));
    tabsContainer.appendChild(btn);
  });
}

function switchActivePlan(idx, allPlans) {
  state.activePlanIndex = idx;
  const selectedPlan = allPlans[idx];
  document.querySelectorAll(".plan-tab-btn").forEach((b, i) => {
    b.classList.toggle("active", i === idx);
  });
  renderPlanHeader(selectedPlan);
  renderMetricCards(selectedPlan);
  renderRotationTimeline(selectedPlan);
  renderCharts(selectedPlan);
  initLucideIcons();
}

function renderMetricCards(plan) {
  const t = I18N[state.currentLang] || I18N.en;
  document.getElementById("metricProfit").textContent = `₹${Math.round(plan.total_profit).toLocaleString()}`;
  document.getElementById("metricRoi").textContent = `ROI: ${plan.roi_percentage.toFixed(1)}% • Rev ₹${Math.round(plan.total_revenue).toLocaleString()}`;
  document.getElementById("metricWater").textContent = `${plan.total_water_mm} mm`;
  document.getElementById("metricWaterRemaining").textContent = `${plan.water_remaining_mm} mm ${t.lblSafetyReserve || "safety reserve"}`;
  document.getElementById("metricCost").textContent = `₹${Math.round(plan.total_cost).toLocaleString()}`;
  document.getElementById("metricCostRemaining").textContent = `₹${Math.round(plan.cost_remaining).toLocaleString()} ${t.lblUnspent || "unspent"}`;
  const initialHealth = parseFloat(document.getElementById("initialSoilHealth").value);
  document.getElementById("metricSoilScore").textContent = `${initialHealth} → ${plan.projected_soil_health}`;
  const nSign = plan.total_nitrogen_delta_kg_ha >= 0 ? "+" : "";
  document.getElementById("metricNitrogenDelta").textContent = `${nSign}${plan.total_nitrogen_delta_kg_ha} ${t.lblNetNBalance || "kg/ha Net N Balance"}`;
}

function renderRotationTimeline(plan) {
  const container = document.getElementById("rotationTimeline");
  container.innerHTML = "";
  const t = I18N[state.currentLang] || I18N.en;

  const sequence = plan.sequence;
  const explanations = plan.explanations || [];

  sequence.forEach((crop, idx) => {
    const exp = explanations[idx] || { recommendation: {}, rejections: [] };
    const rec = exp.recommendation || {};
    const rejections = exp.rejections || [];
    const isCurrentSeason = state.simulationState && state.simulationState.current_season_index === idx;

    const card = document.createElement("div");
    card.className = `season-card ${isCurrentSeason ? "current-sim-season" : ""}`;
    card.id = `seasonCard_${idx + 1}`;

    const nDelta = crop.nitrogen_effect_kg_ha;
    const isFixer = nDelta > 0;
    const nClass = isFixer ? "n-fixer" : "n-feeder";
    const nIcon = isFixer ? "plus-circle" : "minus-circle";
    const nText = isFixer ? `+${nDelta} kg/ha N (${t.lblLegumeLegend || "N-Fixer"})` : `${nDelta} kg/ha N (Feeder)`;

    card.innerHTML = `
      <div class="season-card-header">
        <span class="season-num-badge">${t.lblSeasonN || "Season"} ${idx + 1} (${crop.duration_days} ${t.lblDays || "Days"})</span>
        <span class="family-tag tag-${crop.family}">${crop.family}</span>
      </div>

      <div class="crop-title-row">
        <div class="crop-name">${crop.name}</div>
        <div class="crop-category">${crop.category}</div>
      </div>

      <div class="season-stats-grid">
        <div class="s-stat">
          <span class="s-stat-lbl">${t.lblWaterNeed || "Water Need"}</span>
          <span class="s-stat-val text-blue">${crop.water_req_mm} mm</span>
        </div>
        <div class="s-stat">
          <span class="s-stat-lbl">${t.lblEstYield || "Est. Yield"}</span>
          <span class="s-stat-val">${crop.yield_per_acre_quintals} q/acre</span>
        </div>
        <div class="s-stat">
          <span class="s-stat-lbl">${t.lblCostPerAcre || "Cost / Acre"}</span>
          <span class="s-stat-val text-amber">₹${crop.cost_per_acre.toLocaleString()}</span>
        </div>
        <div class="s-stat">
          <span class="s-stat-lbl">${t.lblMarketRate || "Market Rate"}</span>
          <span class="s-stat-val text-emerald">₹${crop.market_price_per_quintal}/q</span>
        </div>
      </div>

      <div class="n-pill ${nClass}">
        <i data-lucide="${nIcon}"></i> ${nText}
      </div>

      <button type="button" class="accordion-toggle" onclick="toggleAccordion('exp_${idx}')">
        <span><i data-lucide="info"></i> ${t.lblRationale || "Agronomic Rationale & Rejections"}</span>
        <i data-lucide="chevron-down" id="arrow_exp_${idx}"></i>
      </button>

      <div class="accordion-content" id="exp_${idx}">
        <div class="explain-item">
          <h5>${t.lblSelectionReason || "Selection Reason"}</h5>
          <p>${rec.primary_rationale || crop.agronomic_benefit}</p>
        </div>
        <div class="explain-item">
          <h5>${t.lblAgronomicSynergies || "Agronomic Synergies"}</h5>
          <p>${crop.agronomic_benefit}</p>
        </div>
        ${rejections.length > 0 ? `
        <div class="explain-item">
          <h5>${t.lblRejectedAlt || "Top Rejected Alternatives"}</h5>
          <ul class="rejections-list">
            ${rejections.slice(0, 3).map(r => `<li><strong>${r.crop_name} (${r.family}):</strong> ${r.reason}</li>`).join("")}
          </ul>
        </div>
        ` : ""}
      </div>
    `;

    container.appendChild(card);
  });
}

window.toggleAccordion = function (id) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow_${id}`);
  if (!content) return;
  const isOpen = content.classList.contains("open");
  content.classList.toggle("open", !isOpen);
  if (arrow) arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
};

function updateCSPDiagnostics(stats, solutionsCount) {
  if (!stats) return;
  document.getElementById("statValidPlans").textContent = solutionsCount;
  document.getElementById("statNodesExplored").textContent = stats.nodes_explored || 0;
  document.getElementById("statFamilyPruned").textContent = stats.pruned_family_conflicts || 0;
  document.getElementById("statWaterPruned").textContent = stats.pruned_water_overruns || 0;
  document.getElementById("statCostPruned").textContent = stats.pruned_cost_overruns || 0;
  document.getElementById("statDomainSize").textContent = `${stats.domain_size || 0} Crops`;
}

// =============================================
// Simulation & Replanning
// =============================================
async function startSimulationSession(formPayload) {
  try {
    const res = await fetch("/api/simulation/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload)
    });
    const data = await res.json();
    if (data.status === "success") {
      state.activeSessionId = data.session_id;
      state.simulationState = data.state;
      renderSimulationStepper();
      updateSimulationUI();
    }
  } catch (err) {
    console.error("Failed to start simulation session:", err);
  }
}

function renderSimulationStepper() {
  const track = document.getElementById("simStepperTrack");
  if (!track) return;
  track.innerHTML = "";
  if (!state.simulationState) return;
  const t = I18N[state.currentLang] || I18N.en;
  const totalSeasons = state.simulationState.total_seasons || 3;
  const currentIdx = state.simulationState.current_season_index || 0;

  for (let i = 0; i < totalSeasons; i++) {
    const node = document.createElement("div");
    const isCompleted = i < currentIdx;
    const isActive = i === currentIdx && !state.simulationState.is_completed;
    node.className = `step-node ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`;
    node.innerHTML = `
      <div class="step-circle">${isCompleted ? "✓" : i + 1}</div>
      <div class="step-label">${t.lblSeasonN || "Season"} ${i + 1}</div>
    `;
    track.appendChild(node);
  }
}

function updateSimulationUI() {
  const sim = state.simulationState;
  if (!sim) return;
  const t = I18N[state.currentLang] || I18N.en;
  const badge = document.getElementById("simStatusBadge");

  if (sim.is_completed) {
    badge.innerHTML = `<span class="status-indicator completed"></span> ${t.lblCompleted || "All Seasons Completed"} (${sim.total_seasons})`;
    document.getElementById("simNextSeasonBtn").disabled = true;
    document.getElementById("simAutoRunBtn").disabled = true;
    document.getElementById("triggerDroughtBtn").disabled = true;
    document.getElementById("triggerPestBtn").disabled = true;
  } else {
    badge.innerHTML = `<span class="status-indicator ready"></span> ${t.lblActiveSeason || "Active Season"} ${sim.current_season_index + 1} ${t.lblOf || "of"} ${sim.total_seasons}`;
    document.getElementById("simNextSeasonBtn").disabled = false;
    document.getElementById("simAutoRunBtn").disabled = false;
    document.getElementById("triggerDroughtBtn").disabled = false;
    document.getElementById("triggerPestBtn").disabled = false;
  }

  renderSimulationStepper();
  renderHistoryTable();

  if (sim.replanning_logs && sim.replanning_logs.length > 0) {
    const latestReplan = sim.replanning_logs[sim.replanning_logs.length - 1];
    renderReplanBanner(latestReplan);
  } else {
    document.getElementById("replanAlertBanner").classList.add("hidden");
  }

  if (sim.active_plan) {
    if (!state.currentPlanData) {
      state.currentPlanData = { best_plan: sim.active_plan };
    } else {
      state.currentPlanData.best_plan = sim.active_plan;
    }
    renderMetricCards(sim.active_plan);
    renderRotationTimeline(sim.active_plan);
    renderCharts(sim.active_plan);
    initLucideIcons();
  }
}

async function advanceSimulationStep(disruption = null) {
  if (!state.activeSessionId) {
    const form = document.getElementById("planningForm");
    const formData = new FormData(form);
    const payload = {
      land_size_acres: parseFloat(formData.get("land_size_acres")),
      soil_type: formData.get("soil_type"),
      water_budget_mm: parseFloat(formData.get("water_budget_mm")),
      cost_budget: parseFloat(formData.get("cost_budget")),
      seasons_count: parseInt(formData.get("seasons_count")),
      initial_soil_health: parseFloat(formData.get("initial_soil_health"))
    };
    await startSimulationSession(payload);
  }

  if (!state.activeSessionId) return;

  try {
    const res = await fetch("/api/simulation/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: state.activeSessionId, disruption: disruption })
    });
    const data = await res.json();
    if (data.status === "success") {
      state.simulationState = data.result.current_state;
      updateSimulationUI();
    } else {
      alert(`Simulation error: ${data.message}`);
    }
  } catch (err) {
    console.error("Step error:", err);
  }
}

async function triggerDisruption(type) {
  let disruption = null;
  if (type === "drought") disruption = { type: "drought", deficit_pct: 45 };
  else if (type === "pest_outbreak") disruption = { type: "pest_outbreak" };
  await advanceSimulationStep(disruption);
}

async function autoRunSimulation() {
  if (!state.activeSessionId) return;
  try {
    const res = await fetch("/api/simulation/run-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: state.activeSessionId })
    });
    const data = await res.json();
    if (data.status === "success") {
      state.simulationState = data.final_state;
      updateSimulationUI();
    }
  } catch (err) {
    console.error("Auto run error:", err);
  }
}

async function resetSimulation() {
  const form = document.getElementById("planningForm");
  const formData = new FormData(form);
  const payload = {
    land_size_acres: parseFloat(formData.get("land_size_acres")),
    soil_type: formData.get("soil_type"),
    water_budget_mm: parseFloat(formData.get("water_budget_mm")),
    cost_budget: parseFloat(formData.get("cost_budget")),
    seasons_count: parseInt(formData.get("seasons_count")),
    initial_soil_health: parseFloat(formData.get("initial_soil_health"))
  };
  await startSimulationSession(payload);
  document.getElementById("historyLogContainer").classList.add("hidden");
  document.getElementById("replanAlertBanner").classList.add("hidden");
}

function renderReplanBanner(replanLog) {
  const banner = document.getElementById("replanAlertBanner");
  if (!banner) return;
  banner.classList.remove("hidden");

  const isDrought = replanLog.event === "drought";
  const title = isDrought ? "Drought Disruption Re-Solving" : "Pest Infestation Quarantine Re-Solving";
  const titleEl = document.getElementById("replanTitle");
  if (titleEl) titleEl.textContent = `${title} (Triggered in Season ${replanLog.at_season})`;

  let actionText = "";
  if (replanLog.explanation && typeof replanLog.explanation === "object") {
    actionText = replanLog.explanation.action || replanLog.explanation.summary || "";
  } else if (typeof replanLog.explanation === "string") {
    actionText = replanLog.explanation;
  }
  if (!actionText) {
    actionText = "CSP solver dynamically re-evaluated remaining uncultivated seasons and adapted the rotation sequence under revised environmental constraints.";
  }

  const descEl = document.getElementById("replanDesc");
  if (descEl) descEl.textContent = actionText;

  const oldStr = (replanLog.old_remaining && replanLog.old_remaining.length > 0) ? replanLog.old_remaining.join(" → ") : "Previous Plan";
  const newStr = (replanLog.new_remaining && replanLog.new_remaining.length > 0) ? replanLog.new_remaining.join(" → ") : "Re-planned Sequence";

  const diffBox = document.getElementById("replanDiffBox");
  if (diffBox) {
    diffBox.innerHTML = `
      <span><strong>Sequence Adaptation:</strong></span>
      <span>Original: <span class="diff-badge-old">${oldStr}</span></span>
      <span>&rarr;</span>
      <span>Re-planned: <span class="diff-badge-new">${newStr}</span></span>
    `;
  }

  banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderHistoryTable() {
  const history = (state.simulationState && state.simulationState.history) || [];
  const container = document.getElementById("historyLogContainer");
  const tbody = document.getElementById("historyTableBody");

  if (history.length === 0) {
    container.classList.add("hidden");
    return;
  }

  const t = I18N[state.currentLang] || I18N.en;
  container.classList.remove("hidden");
  tbody.innerHTML = "";

  history.forEach((rec) => {
    const tr = document.createElement("tr");
    const eventBadge = rec.disruption
      ? `<span class="badge ${rec.disruption.type === 'drought' ? 'badge-danger' : 'badge-warning'}">${rec.disruption.type.toUpperCase()}: ${rec.disruption.yield_impact}</span>`
      : `<span class="text-muted">${t.lblNominal || "Nominal"}</span>`;

    tr.innerHTML = `
      <td><strong>${t.lblSeasonN || "Season"} ${rec.season_number}</strong></td>
      <td><strong>${rec.crop.name}</strong> <small class="text-secondary">(${rec.crop.family})</small></td>
      <td>${rec.soil_health_before} &rarr; <strong>${rec.soil_health_after}</strong></td>
      <td>${rec.water_used_mm} mm</td>
      <td>₹${Math.round(rec.cost).toLocaleString()}</td>
      <td>₹${Math.round(rec.revenue).toLocaleString()}</td>
      <td class="${rec.profit >= 0 ? 'text-emerald' : 'text-danger'}">₹${Math.round(rec.profit).toLocaleString()}</td>
      <td>${eventBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}

// =============================================
// Charts
// =============================================
function renderCharts(plan) {
  if (!plan) return;
  if (typeof Chart === "undefined") {
    console.warn("Chart.js library is not yet loaded or blocked.");
    return;
  }
  try { renderSoilHealthChart(plan); } catch (err) { console.error("Soil health chart render error:", err); }
  try { renderEconomicsChart(plan); } catch (err) { console.error("Economics chart render error:", err); }
  try { renderResourceChart(plan); } catch (err) { console.error("Resource chart render error:", err); }
}

function updateChartTheme() {
  if (state.currentPlanData) renderCharts(state.currentPlanData.best_plan);
}

function getChartColors() {
  const isLight = document.body.classList.contains("theme-light");
  return {
    text: isLight ? "#475569" : "#94a3b8",
    grid: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)",
    emerald: "#10b981",
    emeraldAlpha: "rgba(16, 185, 129, 0.2)",
    amber: "#f59e0b",
    blue: "#3b82f6",
    rose: "#f43f5e"
  };
}

function renderSoilHealthChart(plan) {
  const ctx = document.getElementById("soilHealthChart").getContext("2d");
  const colors = getChartColors();
  const t = I18N[state.currentLang] || I18N.en;

  let dataPoints = [];
  let labels = ["Start"];

  if (state.simulationState && state.simulationState.soil_health_trajectory.length > 1) {
    dataPoints = [...state.simulationState.soil_health_trajectory];
    for (let i = 1; i < dataPoints.length; i++) {
      labels.push(`${t.lblSeasonN || "Season"} ${i}`);
    }
    const simSeasons = dataPoints.length - 1;
    const totalSeasons = state.simulationState.total_seasons;
    let runningHealth = dataPoints[dataPoints.length - 1];
    for (let j = simSeasons; j < totalSeasons; j++) {
      const c = plan.sequence[j];
      if (c) {
        runningHealth = Math.max(10, Math.min(100, runningHealth + c.soil_health_delta));
        dataPoints.push(runningHealth);
        labels.push(`${t.lblSeasonN || "Season"} ${j + 1} (${t.lblSeasonProj || "Proj"})`);
      }
    }
  } else {
    const initHealth = parseFloat(document.getElementById("initialSoilHealth").value);
    dataPoints = [initHealth];
    let running = initHealth;
    plan.sequence.forEach((c, idx) => {
      running = Math.max(10, Math.min(100, running + c.soil_health_delta));
      dataPoints.push(running);
      labels.push(`${t.lblSeasonN || "Season"} ${idx + 1}`);
    });
  }

  if (state.charts.soilHealth) state.charts.soilHealth.destroy();

  state.charts.soilHealth = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: t.lblSoilHealthIdx || "Soil Health Index (0-100)",
          data: dataPoints,
          borderColor: colors.emerald,
          backgroundColor: colors.emeraldAlpha,
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: colors.emerald,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: t.lblOptimSoilBaseline || "Optimal Soil Quality Baseline",
          data: labels.map(() => 75),
          borderColor: "rgba(52, 211, 153, 0.4)",
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 20, max: 100, ticks: { color: colors.text }, grid: { color: colors.grid } },
        x: { ticks: { color: colors.text }, grid: { color: colors.grid } }
      },
      plugins: {
        legend: { labels: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} / 100` } }
      }
    }
  });
}

function renderEconomicsChart(plan) {
  const ctx = document.getElementById("economicsChart").getContext("2d");
  const colors = getChartColors();
  const t = I18N[state.currentLang] || I18N.en;

  const labels = plan.season_breakdown.map((s) => `S${s.season_index}: ${s.crop_name}`);
  const revenues = plan.season_breakdown.map((s) => s.revenue);
  const costs = plan.season_breakdown.map((s) => s.cost);
  const profits = plan.season_breakdown.map((s) => s.profit);

  if (state.charts.economics) state.charts.economics.destroy();

  state.charts.economics = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        { type: "bar", label: t.lblGrossRevenue || "Gross Revenue (₹)", data: revenues, backgroundColor: "rgba(16, 185, 129, 0.75)", borderRadius: 6 },
        { type: "bar", label: t.lblCultivationCostChart || "Cultivation Cost (₹)", data: costs, backgroundColor: "rgba(244, 63, 94, 0.75)", borderRadius: 6 },
        { type: "line", label: t.lblNetProfitChart || "Net Profit (₹)", data: profits, borderColor: colors.amber, backgroundColor: colors.amber, borderWidth: 2.5, pointRadius: 4, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { ticks: { color: colors.text, callback: (v) => `₹${(v / 1000).toFixed(0)}k` }, grid: { color: colors.grid } },
        x: { ticks: { color: colors.text }, grid: { color: colors.grid } }
      },
      plugins: {
        legend: { labels: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ₹${Math.round(ctx.raw).toLocaleString()}` } }
      }
    }
  });
}

function renderResourceChart(plan) {
  const ctx = document.getElementById("resourceChart").getContext("2d");
  const colors = getChartColors();
  const t = I18N[state.currentLang] || I18N.en;

  const totalWaterBudget = parseFloat(document.getElementById("waterBudget").value);
  const totalCostBudget = parseFloat(document.getElementById("costBudget").value);
  const waterPct = Math.min(100, (plan.total_water_mm / totalWaterBudget) * 100);
  const costPct = Math.min(100, (plan.total_cost / totalCostBudget) * 100);

  if (state.charts.resource) state.charts.resource.destroy();

  state.charts.resource = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [t.lblWaterUtilLabel || "Water Budget Utilization", t.lblCostUtilLabel || "Cost Budget Utilization"],
      datasets: [
        {
          label: t.lblUsedResource || "Used Resource (%)",
          data: [waterPct, costPct],
          backgroundColor: [
            waterPct > 90 ? "rgba(244, 63, 94, 0.85)" : "rgba(59, 130, 246, 0.85)",
            costPct > 90 ? "rgba(244, 63, 94, 0.85)" : "rgba(245, 158, 11, 0.85)"
          ],
          borderRadius: 8,
          barThickness: 28
        },
        {
          label: t.lblSafetyBuffer || "Remaining Safety Buffer (%)",
          data: [100 - waterPct, 100 - costPct],
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: 8,
          barThickness: 28
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, min: 0, max: 100, ticks: { color: colors.text, callback: (v) => `${v}%` }, grid: { color: colors.grid } },
        y: { stacked: true, ticks: { color: colors.text, font: { weight: 600 } }, grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%` } }
      }
    }
  });
}

// =============================================
// Knowledge Base Modal
// =============================================
function renderKnowledgeBaseCards(filteredCrops = null) {
  const container = document.getElementById("kbCardsGrid");
  container.innerHTML = "";

  const crops = filteredCrops || state.cropKnowledgeBase;
  crops.forEach((c) => {
    const card = document.createElement("div");
    card.className = "kb-crop-card";

    const isFixer = c.nitrogen_effect_kg_ha > 0;
    const nBadge = isFixer
      ? `<span class="n-pill n-fixer">+${c.nitrogen_effect_kg_ha} kg/ha N</span>`
      : `<span class="n-pill n-feeder">${c.nitrogen_effect_kg_ha} kg/ha N</span>`;

    card.innerHTML = `
      <div class="kb-crop-header">
        <div>
          <div class="kb-crop-title">${c.name}</div>
          <div class="kb-crop-family">${c.category} &bull; ${c.duration_days} Days</div>
        </div>
        <span class="family-tag tag-${c.family}">${c.family}</span>
      </div>

      <div class="kb-stats-row">
        <div><small>Water:</small> <strong>${c.water_req_mm} mm</strong></div>
        <div><small>Cost/Acre:</small> <strong>₹${c.cost_per_acre.toLocaleString()}</strong></div>
        <div><small>Yield:</small> <strong>${c.yield_per_acre_quintals} q/acre</strong></div>
        <div><small>Price:</small> <strong>₹${c.market_price_per_quintal}/q</strong></div>
      </div>

      <div style="display: flex; gap: 0.4rem; align-items: center; margin: 0.2rem 0;">
        ${nBadge}
        <span class="badge badge-neutral" style="font-size:0.68rem;">Drought: ${c.drought_tolerance}</span>
      </div>

      <div class="kb-benefit-text">${c.agronomic_benefit}</div>
    `;

    container.appendChild(card);
  });
}

function filterKnowledgeBase() {
  const search = document.getElementById("kbSearchInput").value.toLowerCase();
  const familyFilter = document.getElementById("kbFamilyFilter").value;
  const soilFilter = document.getElementById("kbSoilFilter").value;

  const filtered = state.cropKnowledgeBase.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(search) ||
      crop.category.toLowerCase().includes(search) ||
      crop.agronomic_benefit.toLowerCase().includes(search);

    const matchesFamily = familyFilter === "ALL" || crop.family === familyFilter;
    const matchesSoil = soilFilter === "ALL" || crop.suitable_soils.includes(soilFilter);

    return matchesSearch && matchesFamily && matchesSoil;
  });

  renderKnowledgeBaseCards(filtered);
}

// =============================================
// AI Copilot Chat
// =============================================
function initCopilot() {
  const openBtn = document.getElementById("openCopilotBtn");
  const closeBtn = document.getElementById("closeCopilotBtn");
  const overlay = document.getElementById("copilotOverlay");
  const drawer = document.getElementById("copilotDrawer");
  const sendBtn = document.getElementById("copilotSendBtn");
  const input = document.getElementById("copilotInput");

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      drawer.classList.remove("hidden");
      overlay.classList.remove("hidden");
      drawer.classList.add("open");
      setTimeout(() => input && input.focus(), 300);
      initLucideIcons();
      initQuickChips();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      drawer.classList.remove("open");
      overlay.classList.add("hidden");
      setTimeout(() => drawer.classList.add("hidden"), 320);
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      drawer.classList.remove("open");
      overlay.classList.add("hidden");
      setTimeout(() => drawer.classList.add("hidden"), 320);
    });
  }

  if (sendBtn) sendBtn.addEventListener("click", sendCopilotMessage);

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendCopilotMessage();
      }
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    });
  }
}

function initQuickChips() {
  document.querySelectorAll(".quick-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const msg = chip.dataset.msg;
      if (msg) {
        const input = document.getElementById("copilotInput");
        if (input) input.value = msg;
        sendCopilotMessage();
      }
    });
  });
}

function appendCopilotMessage(text, role = "user") {
  const messages = document.getElementById("copilotMessages");
  if (!messages) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `copilot-msg copilot-msg-${role}`;

  if (role === "bot") {
    msgDiv.innerHTML = `
      <div class="copilot-msg-avatar"><i data-lucide="sprout"></i></div>
      <div class="copilot-msg-bubble">${text}</div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="copilot-msg-bubble copilot-msg-user-bubble">${text}</div>
      <div class="copilot-msg-avatar copilot-user-avatar"><i data-lucide="user"></i></div>
    `;
  }

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
  initLucideIcons();
}

function appendTypingIndicator() {
  const messages = document.getElementById("copilotMessages");
  if (!messages) return null;

  const div = document.createElement("div");
  div.className = "copilot-msg copilot-msg-bot";
  div.id = "copilotTyping";
  div.innerHTML = `
    <div class="copilot-msg-avatar"><i data-lucide="sprout"></i></div>
    <div class="copilot-msg-bubble">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  initLucideIcons();
  return div;
}

async function sendCopilotMessage() {
  const input = document.getElementById("copilotInput");
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  input.value = "";
  input.style.height = "auto";
  appendCopilotMessage(message, "user");

  const typing = appendTypingIndicator();

  // Build context from current plan
  const ctx = {};
  if (state.currentPlanData && state.currentPlanData.best_plan) {
    ctx.sequence = state.currentPlanData.best_plan.sequence || [];
    ctx.soil_type = document.getElementById("soilType")?.value || "Black Cotton";
    ctx.land_size_acres = parseFloat(document.getElementById("landSize")?.value || 2);
    ctx.water_budget_mm = parseFloat(document.getElementById("waterBudget")?.value || 900);
    ctx.cost_budget = parseFloat(document.getElementById("costBudget")?.value || 70000);
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        lang: state.currentLang,
        context: ctx
      })
    });

    const data = await res.json();
    if (typing) typing.remove();

    if (data.status === "success") {
      const formatted = data.response
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
      appendCopilotMessage(formatted, "bot");
    } else {
      appendCopilotMessage("Sorry, I encountered an error. Please try again.", "bot");
    }
  } catch (err) {
    if (typing) typing.remove();
    appendCopilotMessage("Connection error. Please check that the server is running.", "bot");
    console.error("Copilot error:", err);
  }
}
