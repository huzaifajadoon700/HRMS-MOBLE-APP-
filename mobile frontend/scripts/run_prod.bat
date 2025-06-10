@echo off
echo Starting Flutter app with production environment...

REM Set production environment variables
REM TODO: Replace these with your actual production values
set STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_STRIPE_KEY
set API_BASE_URL=https://api.yourdomain.com
set SOCKET_URL=https://api.yourdomain.com
set PRODUCTION=true
set ENABLE_LOGGING=false

REM Run Flutter app with environment variables
flutter run --release --dart-define=STRIPE_PUBLISHABLE_KEY=%STRIPE_PUBLISHABLE_KEY% --dart-define=API_BASE_URL=%API_BASE_URL% --dart-define=SOCKET_URL=%SOCKET_URL% --dart-define=PRODUCTION=%PRODUCTION% --dart-define=ENABLE_LOGGING=%ENABLE_LOGGING%

pause
