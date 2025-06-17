#!/usr/bin/env python3
"""
Windows-compatible launcher for the room recommendation model service
"""

import sys
import os

# Set UTF-8 encoding for Windows
if sys.platform == "win32":
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    
# Change to script directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Import and run the room model service
try:
    from room_model_service import app, room_recommendation_model
    
    print("Starting Room Recommendation Model Service...")
    
    # Load model
    if room_recommendation_model.load_model():
        print("Room model loaded successfully!")
    else:
        print("Room model not loaded - will try on first request")
    
    # Start Flask server
    print("Starting Flask server on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=False, use_reloader=False)
    
except Exception as e:
    print(f"Error starting room service: {e}")
    input("Press Enter to exit...")
