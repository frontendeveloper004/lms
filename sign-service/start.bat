@echo off
echo [sign-service] Installing dependencies...
pip install flask flask-cors numpy

echo.
echo [sign-service] Installing spoken-to-signed (may take a minute)...
pip install spoken-to-signed pose-format

echo.
echo [sign-service] Starting server on http://localhost:5050
python app.py
pause
