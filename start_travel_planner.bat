@echo off
chcp 65001 >nul
echo ===================================================
echo   ✈️ Elite Travel Planner PRO v1.5
echo   後端安全閘道 & Gemini 2.0 智慧旅行顧問啟動中...
echo ===================================================
echo.
echo [提示] 正在啟動本機安全後端 (http://127.0.0.1:8000)...
start "" http://127.0.0.1:8000
python server.py
pause
