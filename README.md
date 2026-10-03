# AI Crop Rotation Planning Agent

A Flask-based agricultural planning system that recommends crop sequences using constraint satisfaction, heuristic scoring, and dynamic replanning under uncertainty.

## Live Demo

https://crop-rotation-planning-system.vercel.app/

## Overview

This project helps farmers and agricultural planners choose crop rotations that are economically feasible, agronomically sound, and resilient to real-world disruptions such as drought and pest outbreaks.

Instead of relying on a simple static planting schedule, the system evaluates land size, soil type, water budget, crop cost, and seasonal constraints to generate valid rotation plans. It then ranks the options using a heuristic score based on soil health, resource efficiency, and profitability before simulating dynamic replanning when unexpected events occur.

## Key Features

- Constraint-based crop rotation planning using a CSP solver
- Heuristic ranking of valid crop sequences
- Dynamic replanning for drought and pest disruption events
- Agronomic explainability for each crop recommendation
- Multi-language support for crop and plan explanations
- Interactive frontend with preset scenarios and simulations
- REST APIs for crop data, planning, simulation, and chat-style agronomy advice

## Problem Addressed

Many farmers still choose crops based on tradition, price signals, or neighbor practices rather than structured agronomic evaluation. Repeated cultivation of the same crop family can reduce soil fertility, increase pest pressure, and worsen long-term productivity.

This project addresses that gap by creating a decision-support tool that combines:

- agronomic knowledge
- optimization logic
- explainable recommendations
- seasonal disruption handling

## System Architecture

```text
Farmer Inputs
   ↓
Crop Knowledge Base
   ↓
Constraint Satisfaction Solver
   ↓
Heuristic Scoring Engine
   ↓
Best Rotation Plan
   ↓
Simulation Engine
   ↓
Replanning on Drought / Pest Events
   ↓
Final Recommendations + Explanations
```

## AI and Optimization Techniques

- Constraint Satisfaction Problem (CSP): filters invalid crop sequences
- Forward checking and backtracking: search for feasible rotations
- Heuristic scoring: rank plans by yield potential, soil health, and resource efficiency
- Simulation-based replanning: revise plans when disruptions change conditions
- Explainable AI: show why a crop was selected or rejected

## Tech Stack

- Python
- Flask
- HTML, CSS, JavaScript
- Chart.js
- REST API architecture

## Project Structure

```text
Crop Rotation Planning Agent/
├── backend/
│   ├── app.py
│   ├── csp_solver.py
│   ├── explainability.py
│   ├── heuristic_scorer.py
│   ├── knowledge_base.py
│   ├── simulation_engine.py
│   └── tests/
│       └── test_csp.py
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── app.py
├── requirements.txt
├── Procfile
├── README.md
├── run_app.bat
├── start_server.vbs
└── .gitignore
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/AlluNikitha/Crop-Rotation-Planning-System.git
cd Crop-Rotation-Planning-System
```

### 2. Create a virtual environment

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the app

```bash
python backend/app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Running Tests

```bash
python -m unittest discover -s backend/tests -v
```

## Deployment

This project is deployed on Vercel:

https://crop-rotation-planning-system.vercel.app/

## Example Use Cases

- Selecting crop rotations for a small farm under limited irrigation
- Planning nutrient-restoring legume/cereal sequences
- Modeling crop continuity under pest pressure
- Suggesting resilient alternatives during drought conditions

## Future Enhancements

- Add real weather forecasting integration
- Support farm-level GIS data input
- Improve visualization with yield and nutrient trend graphs
- Add more crop varieties and regional crop calendars
- Integrate ML-based yield estimation with rule-based planning

## License

This project is for academic and demonstration purposes.

## Author

Allu Nikitha
