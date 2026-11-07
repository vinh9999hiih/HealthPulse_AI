@echo off
title HealthPulse AI - Web Server
cd /d "%~dp0"
echo =======================================================
echo   Dang khoi dong may chu HealthPulse AI...
echo =======================================================
python -u server.py
pause
