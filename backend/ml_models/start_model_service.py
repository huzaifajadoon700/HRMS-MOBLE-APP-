#!/usr/bin/env python3
"""
Windows-compatible launcher for the model service
"""

import sys
import os

# Set UTF-8 encoding for Windows
if sys.platform == "win32":
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    
# Change to script directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Import and run the model service
try:
    from model_service import app, recommendation_model
    
    print("Starting Food Recommendation Model Service...")
    
    # Load model
    if recommendation_model.load_model():
        print("Model loaded successfully!")
    else:
        print("Model not loaded - will try on first request")
    
    # Start Flask server
    print("Starting Flask server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
    
except Exception as e:
    print(f"Error starting model service: {e}")
    sys.exit(1)
