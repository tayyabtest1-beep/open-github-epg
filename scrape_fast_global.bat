@echo off
title Fast Global EPG Scraper (Local)
cd /d "%~dp0"

set NODE_OPTIONS=--max-old-space-size=8192

echo ===================================================
echo   Starting Local High-Speed Global EPG Scraper...
echo ===================================================
node scrape_fast_global.js

echo.
echo ===================================================
echo   Finished! Press any key to exit.
echo ===================================================
pause
