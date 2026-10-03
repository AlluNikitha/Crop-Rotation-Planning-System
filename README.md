# AI-Based Crop Rotation Planning System
> **Closed-Loop Agricultural Decision-Support Agent using Constraint Satisfaction, Heuristic Informed Search & Planning Under Uncertainty**

## Live Demo
Visit the deployed application here:
https://crop-rotation-planning-system.vercel.app/

---

## 1. Why We Chose This Problem
Most AI mini-projects tend to revolve around games, chatbots, or delivery-routing apps, largely because they are visually easy to demo. Agriculture, on the other hand, is a domain almost nobody picks, even though it is one of the richest real-world settings for classical AI: it has hard constraints (soil, water, budget), sequential decisions that affect future outcomes (this season's crop affects next season's soil), and genuine uncertainty (weather, pests).

In most parts of India and the developing world, especially among small and marginal landholders, crop selection is still largely guided by habit, what neighboring farms are growing, or last season's market price, rather than any structured evaluation of soil nutrient levels or water budgets. Continuous cultivation of the same crop family gradually depletes soil nutrients and increases pest pressure. Government agricultural departments do publish rotation advisories, but this knowledge is rarely delivered in a form personalised to a specific plot, water budget, and financial constraint. That gap between generic advice and an individual farmer's actual situation is what this project addresses.

---

## 2. Advantages of This Approach

| Advantage | Explanation |
| :--- | :--- |
| **Soil health preservation** | Enforces nitrogen-fixing / depleting crop alternation automatically, instead of relying on memory or habit. |
| **Resource efficiency** | Plans within actual water and budget limits rather than assuming unlimited resources. |
| **Adapts to disruption** | Re-plans when drought or pest events occur, instead of producing one fixed plan and ignoring reality. |
| **Personalised, not generic** | Recommendation is based on the specific plot's soil type, water budget, and cost limit, not a one-size-fits-all chart. |
| **Explainable output** | Because it is rule + constraint based (not a black-box model), every recommendation can be traced back to an agronomic reason. |
| **Low data requirement** | Does not need massive historical datasets to function, unlike a machine-learning-based yield predictor. |

---

## 3. Step-by-Step Methodology & AI Concepts Used

| Step | What Happens | AI Concept Used |
| :---: | :--- | :--- |
| **1** | Farmer enters land size, soil type, water budget, cost budget, and number of seasons. | **Problem / Environment Definition** |
| **2** | System loads crop knowledge base (family, water need, N-effect, duration, soil fit). | **Knowledge Representation** |
| **3** | All rotations violating hard rules (repeated crop family, water/cost overrun) are eliminated. | **Constraint Satisfaction Problem (CSP)** |
| **4** | Remaining valid rotations are scored on yield, soil-health gain, resource efficiency, and cost. | **Informed / Heuristic Search** |
| **5** | Highest-scoring rotation is selected and the season is simulated. | **Utility-Based Agent Decision** |
| **6** | If a drought/pest event is triggered, remaining seasons are re-solved with updated constraints. | **Planning Under Uncertainty (Replanning)** |
| **7** | Final plan, explainability traces, and soil/yield trend graphs are generated for the farmer. | **Output / Evaluation & Explainable AI (XAI)** |

---

## 4. System Architecture

```
[Start: Farmer Inputs (Land size, soil, water budget, cost, seasons)]
                    │
                    ▼
     [Load Crop Knowledge Base]
                    │
                    ▼
  [Generate Valid Rotations (CSP: Backtracking + Forward Checking)]
                    │
                    ▼
  [Score Valid Rotations (Heuristic Search: Yield + Soil Health - Cost)]
                    │
                    ▼
   [Select Best Rotation Strategy]
                    │
                    ▼
      [Simulate Season Progression]
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
[Disruption? (Drought/Pest)]  [No Disruption]
         │                     │
         ├─► [Yes] Re-solve CSP │
         │   & Replan Remaining │
         │   Seasons            │
         │                      │
         └──────────┬───────────┘
                    ▼
      [More Seasons Remaining?]
         ├──► [Yes] (Loop to Simulate Next Season)
         └──► [No]  Output Final Plan + Soil Health & Yield Graphs
```

---

## 5. Technology Stack
- **Backend**: Python 3, Flask REST API.
- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System with Glassmorphism, Dark/Light theme, Micro-animations), Vanilla JavaScript (ES6+).
- **Visual Analytics**: Chart.js 4.4.
- **Icons**: Lucide Icons.

---

## 6. Running the System Locally

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Run Unit Tests
```bash
python -m unittest discover -s backend/tests -v
```

### Step 3: Start the Web Application
```bash
python backend/app.py
```
Open your browser at:
`http://127.0.0.1:5000`

---

## 7. Interactive Demo Features
1. **1-Click Pre-configured Scenarios**:
   - *Semi-Arid Deccan Plateau*: Rainfed plot with limited water budget, prioritizing drought-tolerant pulses and millets.
   - *Indo-Gangetic Alluvial Plain*: Highly fertile multi-season cereal-legume-mustard rotation.
   - *Commercial Diversified Farm*: High-value horticulture balanced with soil-restoring pulses.
   - *Drought-Stressed Rainfed Plot*: High resilience testing under severe water caps.
2. **Dynamic Replanning Lab**:
   - Advance season-by-season.
   - Trigger **Mid-Season Drought** to cut available water and watch the CSP agent automatically substitute water-heavy cereals with drought-resistant legumes/millets.
   - Trigger **Pest Outbreak** to quarantine the affected botanical family and replace upcoming seasons with non-host crops.
3. **Agronomic Explainability (XAI)**:
   - Expand any season card to see *why* this crop was chosen (e.g., succession nitrogen dynamics, root structure alternation) and *which* crops were pruned and why (family conflicts, budget overruns).
4. **Knowledge Base Explorer**:
   - Inspect all 22 crops, their botanical families, water needs, and agronomic roles.
