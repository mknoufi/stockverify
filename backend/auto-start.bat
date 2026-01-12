@echo off
REM Windows batch file for auto-starting backend and ngrok

echo 🚀 Starting Stock Verify Backend and Ngrok...
echo.

cd /d "%~dp0"

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  ngrok not found in PATH
    echo    Please install ngrok and add it to PATH
    echo    Or install via: npm install -g ngrok
    pause
    exit /b 1
)

REM Load environment variables from .env.production if exists
if exist .env.production (
    echo 📋 Loading environment from .env.production
    for /f "tokens=1,2 delims==" %%a in (.env.production) do (
        if not "%%a"=="" if not "%%a"=="#" set "%%a=%%b"
    )
)

REM Create directories
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist reports mkdir reports

REM Kill existing processes on ports 3000 and 4040
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4040"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

REM Start backend server
echo 🚀 Starting backend server on port %PORT%...
start /b bun run start > logs\backend.log 2>&1

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start ngrok
echo 📡 Starting ngrok tunnel...
start /b ngrok http %PORT% > logs\ngrok.log 2>&1

REM Wait for ngrok to start
echo ⏳ Waiting for ngrok to start...
timeout /t 5 /nobreak >nul

REM Get ngrok URL (requires curl or PowerShell)
echo 📝 Getting ngrok URL...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:4040/api/tunnels' -ErrorAction Stop; $url = $response.tunnels[0].public_url; Set-Content -Path '.ngrok.url' -Value $url; Write-Host '✅ Ngrok URL:' $url } catch { Write-Host '⚠️  Could not get ngrok URL automatically. Check http://localhost:4040' }"

REM Update app.json with ngrok URL
if exist ..\app.json (
    echo 📝 Updating app.json...
    powershell -Command "try { $json = Get-Content ..\app.json | ConvertFrom-Json; if (-not $json.expo) { $json | Add-Member -Type NoteProperty -Name 'expo' -Value @{} }; if (-not $json.expo.extra) { $json.expo | Add-Member -Type NoteProperty -Name 'extra' -Value @{} }; $url = Get-Content .ngrok.url -ErrorAction SilentlyContinue; if ($url) { $json.expo.extra.apiUrl = $url; $json | ConvertTo-Json -Depth 10 | Set-Content ..\app.json; Write-Host '✅ app.json updated' } } catch { Write-Host '⚠️  Could not update app.json' }"
)

echo.
echo ✅ All services started!
echo.
echo 📊 Services:
echo   • Backend:  http://localhost:%PORT%
echo   • Ngrok Dashboard: http://localhost:4040
echo.
echo 📁 Logs:
echo   • Backend:  logs\backend.log
echo   • Ngrok:    logs\ngrok.log
echo.
echo Press any key to view logs or close this window...
pause >nul
