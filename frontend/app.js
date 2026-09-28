/**
 * AI-Based Crop Rotation Planning System - Frontend Logic
 * Manages UI interactions, CSP solver integration, multi-attribute heuristic evaluation,
 * closed-loop simulation state machine, disruption injection, and Chart.js analytics.
 */

// Global Application State
const state = {
  currentPlanData: null,
  activePlanIndex: 0,
  activeSessionId: null,
  simulationState: null,
  cropKnowledgeBase: [],
  families: {},
  presets: {},
  charts: {
    soilHealth: null,
    economics: null,
    resource: null
  }
};

// DOM Content Loaded Handler
document.addEventListener("DOMContentLoaded", async () => {
  try {
    initLucideIcons();
    initTheme();
    initFormListeners();
    initModalListeners();
    await loadKnowledgeBaseAndPresets();
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

  // Season Pill Selector
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

  // Live feasibility feedback on resource budget inputs
  const waterBudgetInput = document.getElementById("waterBudget");
  if (waterBudgetInput) {
    waterBudgetInput.addEventListener("input", updateLiveFeasibilityHints);
  }

  const costBudgetInput = document.getElementById("costBudget");
  if (costBudgetInput) {
    costBudgetInput.addEventListener("input", updateLiveFeasibilityHints);
  }

  const soilTypeSelect = document.getElementById("soilType");
  if (soilTypeSelect) {
    soilTypeSelect.addEventListener("change", updateLiveFeasibilityHints);
  }



  // Form Submission
  const planningForm = document.getElementById("planningForm");
  planningForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await generateCropRotationPlan();
  });

  const emptyGenerateBtn = document.getElementById("emptyGenerateBtn");
  if (emptyGenerateBtn) {
    emptyGenerateBtn.addEventListener("click", () => generateCropRotationPlan());
  }

  // Simulation Lab Buttons
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
    if (e.target === kbModal) {
      kbModal.classList.add("hidden");
    }
  });

  document.getElementById("kbSearchInput").addEventListener("input", filterKnowledgeBase);
  document.getElementById("kbFamilyFilter").addEventListener("change", filterKnowledgeBase);
  document.getElementById("kbSoilFilter").addEventListener("change", filterKnowledgeBase);
}

// Load Initial Data (Crops, Presets)
async function loadKnowledgeBaseAndPresets() {
  try {
    const [cropsRes, presetsRes] = await Promise.all([
      fetch("/api/crops"),
      fetch("/api/presets")
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

// Render Presets Showcase Cards and Navbar Dropdown
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
    // 1. Populate Navbar Dropdown
    if (navSelect) {
      const opt = document.createElement("option");
      opt.value = preset.id;
      opt.textContent = preset.title;
      navSelect.appendChild(opt);
    }

    // 2. Populate Scenario Showcase Cards Track
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

  // Sync Navbar Select
  const navSelect = document.getElementById("navPresetSelect");
  if (navSelect && navSelect.value !== presetId) {
    navSelect.value = presetId;
  }

  // Highlight active showcase card
  document.querySelectorAll(".scenario-card-item").forEach((card) => {
    const isThis = card.id === `scenarioCard_${presetId}`;
    card.classList.toggle("active", isThis);
    const badge = card.querySelector(".scenario-active-indicator");
    if (badge) badge.classList.toggle("hidden", !isThis);
  });

  // Populate inputs
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

  // Automatically solve for preset
  generateCropRotationPlan();
}

function initDefaultPreset() {
  // Load semi-arid deccan as default on first visit
  loadPreset("semi_arid_deccan");
}


async function generateCropRotationPlan() {
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

    // Render results
    renderResults(data);
    updateCSPDiagnostics(data.search_stats, data.total_solutions_found);

    // Initialize stateful simulation session
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

// Render Results UI
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

// Render Constraint Conflict & Resolution Panel (Replaces Alert)
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

  // Title & Subtitle
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

  // Cost card
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
    const seasonCost = Math.round((diag.cheapest_rate_per_acre || 8800) * (diag.land_size_acres || 1)).toLocaleString();
    costExpl.textContent = `Even the cheapest suitable crop for ${diag.soil_type} soil (${cropName} @ ₹${rate}/acre) costs ₹${seasonCost} per season. Over ${diag.seasons_count} seasons, minimum capital required is ₹${Math.round(diag.cost_min_required).toLocaleString()}.`;
  } else {
    costBadge.className = "c-status-badge badge-sufficient";
    costBadge.textContent = "Sufficient";
    costExpl.textContent = `Capital budget of ₹${Math.round(diag.cost_provided || 0).toLocaleString()} meets the required minimum of ₹${Math.round(diag.cost_min_required || 0).toLocaleString()}.`;
  }

  // Water card
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
    waterExpl.textContent = `Minimum water required for ${diag.seasons_count} seasons of drought-hardy crops is ${diag.water_min_required} mm.`;
  } else {
    waterBadge.className = "c-status-badge badge-sufficient";
    waterBadge.textContent = "Sufficient";
    waterExpl.textContent = `Water budget of ${diag.water_provided} mm is sufficient for ${diag.seasons_count} seasons (minimum needed: ${diag.water_min_required} mm).`;
  }

  // 1-Click Action Buttons
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
  resetPresetBtn.onclick = () => {
    loadPreset("semi_arid_deccan");
  };

  initLucideIcons();
}

// Live feasibility guidance under form inputs
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

  // Filter crops for current soil
  const suitableCrops = (state.cropKnowledgeBase || []).filter(c => c.suitable_soils && c.suitable_soils.includes(soilType));
  const minCostPerAcre = suitableCrops.length > 0 ? Math.min(...suitableCrops.map(c => c.cost_per_acre)) : 8800;
  const minWaterMm = suitableCrops.length > 0 ? Math.min(...suitableCrops.map(c => c.water_req_mm)) : 220;

  const minTotalCost = minCostPerAcre * landSize * seasonsCount;
  const minTotalWater = minWaterMm * seasonsCount;

  // Budget hint & badge
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

  // Water hint & badge
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

// Plan Header Ribbon
function renderPlanHeader(plan) {
  document.getElementById("ribbonScore").textContent = plan.heuristic_score.toFixed(1);
  document.getElementById("ribbonFamiliesCount").textContent = `${plan.unique_families_count} Unique Botanical Families`;

  const cropChain = plan.crop_names.join(" → ");
  document.getElementById("ribbonSubtitle").textContent = `Recommended Sequence: ${cropChain}`;
}

// Candidate Plans Tabs
function renderPlanSwitcher(data) {
  const tabsContainer = document.getElementById("planTabs");
  tabsContainer.innerHTML = "";

  const allPlans = [data.best_plan, ...(data.alternative_plans || [])];

  allPlans.forEach((plan, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `plan-tab-btn ${idx === state.activePlanIndex ? "active" : ""}`;
    const label = idx === 0 ? "Plan A (Optimal)" : `Plan ${String.fromCharCode(65 + idx)}`;
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

// Metric Cards
function renderMetricCards(plan) {
  document.getElementById("metricProfit").textContent = `₹${Math.round(plan.total_profit).toLocaleString()}`;
  document.getElementById("metricRoi").textContent = `ROI: ${plan.roi_percentage.toFixed(1)}% &bull; Rev ₹${Math.round(plan.total_revenue).toLocaleString()}`;

  document.getElementById("metricWater").textContent = `${plan.total_water_mm} mm`;
  document.getElementById("metricWaterRemaining").textContent = `${plan.water_remaining_mm} mm safety reserve`;

  document.getElementById("metricCost").textContent = `₹${Math.round(plan.total_cost).toLocaleString()}`;
  document.getElementById("metricCostRemaining").textContent = `₹${Math.round(plan.cost_remaining).toLocaleString()} unspent`;

  const initialHealth = parseFloat(document.getElementById("initialSoilHealth").value);
  document.getElementById("metricSoilScore").textContent = `${initialHealth} → ${plan.projected_soil_health}`;
  
  const nSign = plan.total_nitrogen_delta_kg_ha >= 0 ? "+" : "";
  document.getElementById("metricNitrogenDelta").textContent = `${nSign}${plan.total_nitrogen_delta_kg_ha} kg/ha Net N Balance`;
}

// Rotation Timeline Cards
function renderRotationTimeline(plan) {
  const container = document.getElementById("rotationTimeline");
  container.innerHTML = "";

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
    const nText = isFixer ? `+${nDelta} kg/ha N (Fixer)` : `${nDelta} kg/ha N (Feeder)`;

    card.innerHTML = `
      <div class="season-card-header">
        <span class="season-num-badge">Season ${idx + 1} (${crop.duration_days} Days)</span>
        <span class="family-tag tag-${crop.family}">${crop.family}</span>
      </div>

      <div class="crop-title-row">
        <div class="crop-name">${crop.name}</div>
        <div class="crop-category">${crop.category}</div>
      </div>

      <div class="season-stats-grid">
        <div class="s-stat">
          <span class="s-stat-lbl">Water Need</span>
          <span class="s-stat-val text-blue">${crop.water_req_mm} mm</span>
        </div>
        <div class="s-stat">
          <span class="s-stat-lbl">Est. Yield</span>
          <span class="s-stat-val">${crop.yield_per_acre_quintals} q/acre</span>
        </div>
        <div class="s-stat">
          <span class="s-stat-lbl">Cost / Acre</span>
          <span class="s-stat-val text-amber">₹${crop.cost_per_acre.toLocaleString()}</span>
        </div>
        <div class="s-stat">
          <span class="s-stat-lbl">Market Rate</span>
          <span class="s-stat-val text-emerald">₹${crop.market_price_per_quintal}/q</span>
        </div>
      </div>

      <div class="n-pill ${nClass}">
        <i data-lucide="${nIcon}"></i> ${nText}
      </div>

      <!-- Explainability Accordion -->
      <button type="button" class="accordion-toggle" onclick="toggleAccordion('exp_${idx}')">
        <span><i data-lucide="info"></i> Agronomic Rationale & Rejections</span>
        <i data-lucide="chevron-down" id="arrow_exp_${idx}"></i>
      </button>

      <div class="accordion-content" id="exp_${idx}">
        <div class="explain-item">
          <h5>Selection Reason</h5>
          <p>${rec.primary_rationale || crop.agronomic_benefit}</p>
        </div>
        <div class="explain-item">
          <h5>Agronomic Synergies</h5>
          <p>${crop.agronomic_benefit}</p>
        </div>
        ${
          rejections.length > 0
            ? `
          <div class="explain-item">
            <h5>Top Rejected Alternatives</h5>
            <ul class="rejections-list">
              ${rejections.slice(0, 3).map(r => `<li><strong>${r.crop_name} (${r.family}):</strong> ${r.reason}</li>`).join("")}
            </ul>
          </div>
          `
            : ""
        }
      </div>
    `;

    container.appendChild(card);
  });
}

// Accordion Toggle
window.toggleAccordion = function (id) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow_${id}`);
  if (!content) return;

  const isOpen = content.classList.contains("open");
  content.classList.toggle("open", !isOpen);
  if (arrow) {
    arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
  }
};

// CSP Diagnostics
function updateCSPDiagnostics(stats, solutionsCount) {
  if (!stats) return;
  document.getElementById("statValidPlans").textContent = solutionsCount;
  document.getElementById("statNodesExplored").textContent = stats.nodes_explored || 0;
  document.getElementById("statFamilyPruned").textContent = stats.pruned_family_conflicts || 0;
  document.getElementById("statWaterPruned").textContent = stats.pruned_water_overruns || 0;
  document.getElementById("statCostPruned").textContent = stats.pruned_cost_overruns || 0;
  document.getElementById("statDomainSize").textContent = `${stats.domain_size || 0} Crops`;
}

// ==========================================
// Simulation & Dynamic Replanning Engine
// ==========================================

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
  const totalSeasons = state.simulationState.total_seasons || 3;
  const currentIdx = state.simulationState.current_season_index || 0;

  for (let i = 0; i < totalSeasons; i++) {
    const node = document.createElement("div");
    const isCompleted = i < currentIdx;
    const isActive = i === currentIdx && !state.simulationState.is_completed;

    node.className = `step-node ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`;
    node.innerHTML = `
      <div class="step-circle">${isCompleted ? "✓" : i + 1}</div>
      <div class="step-label">Season ${i + 1}</div>
    `;
    track.appendChild(node);
  }
}

function updateSimulationUI() {
  const sim = state.simulationState;
  if (!sim) return;
  const badge = document.getElementById("simStatusBadge");

  if (sim.is_completed) {
    badge.innerHTML = `<span class="status-indicator completed"></span> All ${sim.total_seasons} Seasons Completed`;
    document.getElementById("simNextSeasonBtn").disabled = true;
    document.getElementById("simAutoRunBtn").disabled = true;
    document.getElementById("triggerDroughtBtn").disabled = true;
    document.getElementById("triggerPestBtn").disabled = true;
  } else {
    badge.innerHTML = `<span class="status-indicator ready"></span> Active Season ${sim.current_season_index + 1} of ${sim.total_seasons}`;
    document.getElementById("simNextSeasonBtn").disabled = false;
    document.getElementById("simAutoRunBtn").disabled = false;
    document.getElementById("triggerDroughtBtn").disabled = false;
    document.getElementById("triggerPestBtn").disabled = false;
  }

  renderSimulationStepper();
  renderHistoryTable();

  // If replan log exists, show alert banner
  if (sim.replanning_logs && sim.replanning_logs.length > 0) {
    const latestReplan = sim.replanning_logs[sim.replanning_logs.length - 1];
    renderReplanBanner(latestReplan);
  } else {
    document.getElementById("replanAlertBanner").classList.add("hidden");
  }

  // Update active plan in state and re-render cards and charts
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

// Single Season Advance
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
      body: JSON.stringify({
        session_id: state.activeSessionId,
        disruption: disruption
      })
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

// Trigger Disruption
async function triggerDisruption(type) {
  let disruption = null;
  if (type === "drought") {
    disruption = { type: "drought", deficit_pct: 45 };
  } else if (type === "pest_outbreak") {
    disruption = { type: "pest_outbreak" };
  }
  await advanceSimulationStep(disruption);
}

// Auto-run all remaining
async function autoRunSimulation() {
  if (!state.activeSessionId) return;

  try {
    const res = await fetch("/api/simulation/run-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: state.activeSessionId
      })
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

// Reset Simulation
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

// Render Replanning Alert Banner
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

// Render History Ledger Table
function renderHistoryTable() {
  const history = (state.simulationState && state.simulationState.history) || [];
  const container = document.getElementById("historyLogContainer");
  const tbody = document.getElementById("historyTableBody");

  if (history.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  tbody.innerHTML = "";

  history.forEach((rec) => {
    const tr = document.createElement("tr");
    const eventBadge = rec.disruption
      ? `<span class="badge ${rec.disruption.type === 'drought' ? 'badge-danger' : 'badge-warning'}">${rec.disruption.type.toUpperCase()}: ${rec.disruption.yield_impact}</span>`
      : `<span class="text-muted">Nominal</span>`;

    tr.innerHTML = `
      <td><strong>Season ${rec.season_number}</strong></td>
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

// ==========================================
// Chart.js Visual Analytics
// ==========================================

function renderCharts(plan) {
  if (!plan) return;
  if (typeof Chart === "undefined") {
    console.warn("Chart.js library is not yet loaded or blocked.");
    return;
  }
  try {
    renderSoilHealthChart(plan);
  } catch (err) {
    console.error("Soil health chart render error:", err);
  }
  try {
    renderEconomicsChart(plan);
  } catch (err) {
    console.error("Economics chart render error:", err);
  }
  try {
    renderResourceChart(plan);
  } catch (err) {
    console.error("Resource chart render error:", err);
  }
}

function updateChartTheme() {
  if (state.currentPlanData) {
    renderCharts(state.currentPlanData.best_plan);
  }
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

// 1. Soil Health Trajectory Chart
function renderSoilHealthChart(plan) {
  const ctx = document.getElementById("soilHealthChart").getContext("2d");
  const colors = getChartColors();

  // If simulation trajectory exists, use dynamic simulated history
  let dataPoints = [];
  let labels = ["Start"];

  if (state.simulationState && state.simulationState.soil_health_trajectory.length > 1) {
    dataPoints = [...state.simulationState.soil_health_trajectory];
    for (let i = 1; i < dataPoints.length; i++) {
      labels.push(`Season ${i}`);
    }
    // Projected remaining
    const simSeasons = dataPoints.length - 1;
    const totalSeasons = state.simulationState.total_seasons;
    let runningHealth = dataPoints[dataPoints.length - 1];
    for (let j = simSeasons; j < totalSeasons; j++) {
      const c = plan.sequence[j];
      if (c) {
        runningHealth = Math.max(10, Math.min(100, runningHealth + c.soil_health_delta));
        dataPoints.push(runningHealth);
        labels.push(`Season ${j + 1} (Proj)`);
      }
    }
  } else {
    // Nominal projected trajectory
    const initHealth = parseFloat(document.getElementById("initialSoilHealth").value);
    dataPoints = [initHealth];
    let running = initHealth;
    plan.sequence.forEach((c, idx) => {
      running = Math.max(10, Math.min(100, running + c.soil_health_delta));
      dataPoints.push(running);
      labels.push(`Season ${idx + 1}`);
    });
  }

  if (state.charts.soilHealth) {
    state.charts.soilHealth.destroy();
  }

  state.charts.soilHealth = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Soil Health Index (0-100)",
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
          label: "Optimal Soil Quality Baseline",
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
        y: {
          min: 20,
          max: 100,
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        },
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        }
      },
      plugins: {
        legend: {
          labels: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} / 100`
          }
        }
      }
    }
  });
}

// 2. Seasonal Economics Chart
function renderEconomicsChart(plan) {
  const ctx = document.getElementById("economicsChart").getContext("2d");
  const colors = getChartColors();

  const labels = plan.season_breakdown.map((s) => `S${s.season_index}: ${s.crop_name}`);
  const revenues = plan.season_breakdown.map((s) => s.revenue);
  const costs = plan.season_breakdown.map((s) => s.cost);
  const profits = plan.season_breakdown.map((s) => s.profit);

  if (state.charts.economics) {
    state.charts.economics.destroy();
  }

  state.charts.economics = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          type: "bar",
          label: "Gross Revenue (₹)",
          data: revenues,
          backgroundColor: "rgba(16, 185, 129, 0.75)",
          borderRadius: 6
        },
        {
          type: "bar",
          label: "Cultivation Cost (₹)",
          data: costs,
          backgroundColor: "rgba(244, 63, 94, 0.75)",
          borderRadius: 6
        },
        {
          type: "line",
          label: "Net Profit (₹)",
          data: profits,
          borderColor: colors.amber,
          backgroundColor: colors.amber,
          borderWidth: 2.5,
          pointRadius: 4,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            color: colors.text,
            callback: (v) => `₹${(v / 1000).toFixed(0)}k`
          },
          grid: { color: colors.grid }
        },
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        }
      },
      plugins: {
        legend: {
          labels: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ₹${Math.round(ctx.raw).toLocaleString()}`
          }
        }
      }
    }
  });
}

// 3. Resource Burn-down Chart (Water & Budget Utilization)
function renderResourceChart(plan) {
  const ctx = document.getElementById("resourceChart").getContext("2d");
  const colors = getChartColors();

  const totalWaterBudget = parseFloat(document.getElementById("waterBudget").value);
  const totalCostBudget = parseFloat(document.getElementById("costBudget").value);

  const waterPct = Math.min(100, (plan.total_water_mm / totalWaterBudget) * 100);
  const costPct = Math.min(100, (plan.total_cost / totalCostBudget) * 100);

  if (state.charts.resource) {
    state.charts.resource.destroy();
  }

  state.charts.resource = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Water Budget Utilization", "Cost Budget Utilization"],
      datasets: [
        {
          label: "Used Resource (%)",
          data: [waterPct, costPct],
          backgroundColor: [
            waterPct > 90 ? "rgba(244, 63, 94, 0.85)" : "rgba(59, 130, 246, 0.85)",
            costPct > 90 ? "rgba(244, 63, 94, 0.85)" : "rgba(245, 158, 11, 0.85)"
          ],
          borderRadius: 8,
          barThickness: 28
        },
        {
          label: "Remaining Safety Buffer (%)",
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
        x: {
          stacked: true,
          min: 0,
          max: 100,
          ticks: {
            color: colors.text,
            callback: (v) => `${v}%`
          },
          grid: { color: colors.grid }
        },
        y: {
          stacked: true,
          ticks: { color: colors.text, font: { weight: 600 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          labels: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`
          }
        }
      }
    }
  });
}

// ==========================================
// Knowledge Base Modal Explorer
// ==========================================

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
