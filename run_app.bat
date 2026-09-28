@echo off
title AI Crop Rotation Planning Agent
echo ========================================================
echo Starting AI Crop Rotation Planning Agent Server...
echo ========================================================
start http://127.0.0.1:5000
python backend/app.py
pause
