#!/bin/bash
echo "Starting Flutter app with development environment..."

# Set development environment variables
export STRIPE_PUBLISHABLE_KEY="pk_test_51RQDO0QHBrXA72xgYssbECOe9bubZ2bWHA4m0T6EY6AvvmAfCzIDmKUCkRjpwVVIJ4IMaOiQBUawECn5GD8ADHbn00GRVmjExI"
export API_BASE_URL="http://192.168.10.6:8080"
export SOCKET_URL="http://192.168.10.6:8080"
export PRODUCTION="false"
export ENABLE_LOGGING="true"

# Run Flutter app with environment variables
flutter run \
  --dart-define=STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
  --dart-define=API_BASE_URL="$API_BASE_URL" \
  --dart-define=SOCKET_URL="$SOCKET_URL" \
  --dart-define=PRODUCTION="$PRODUCTION" \
  --dart-define=ENABLE_LOGGING="$ENABLE_LOGGING"
