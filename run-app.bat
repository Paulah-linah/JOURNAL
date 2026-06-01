@echo off
setlocal

cd /d "%~dp0"

echo Starting Our Date Journal...

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Check your Node.js installation and network connection.
    pause
    exit /b 1
  )
)

echo.
echo Launching the dev server on http://localhost:3000
echo Leave this window open while the app is running.
echo.

call npm run dev
