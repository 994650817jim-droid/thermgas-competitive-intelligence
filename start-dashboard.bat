@echo off
REM ThermGAS Competitive Intelligence Dashboard - local launcher (Windows)
REM Requires Node.js 18+ (free). No paid services, no internet needed after the first install.
cd /d "%~dp0dashboard"
if not exist node_modules (
  echo Installing dependencies - first run only...
  call npm install
)
echo Building the dashboard...
call npm run data
call npm run build
echo Opening http://localhost:4173 ...
call npm run preview -- --open
