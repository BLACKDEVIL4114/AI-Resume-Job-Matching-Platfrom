@echo off
title JobApplyAI Pro Backend
echo ====================================================
echo    JobApplyAI Advanced NLP Backend - v2.0
echo ====================================================

echo [1/4] Creating essential directories...
if not exist outputs mkdir outputs
if not exist data mkdir data

echo.
echo [2/4] Installing Python requirements...
pip install -r requirements.txt

echo.
echo [3/4] Downloading spaCy NLP model...
python -m spacy download en_core_web_sm

echo.
echo [4/4] Starting FastAPI backend server...
echo Server running at http://localhost:8000
uvicorn main:app --reload --port 8000 --host 0.0.0.0

pause
