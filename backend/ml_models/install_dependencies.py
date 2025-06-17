#!/usr/bin/env python3
"""
Automatic dependency installer for Food Recommendation System
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def check_and_install_dependencies():
    """Check and install required dependencies"""
    print("🔍 Checking Python dependencies for Food Recommendation System...")
    
    required_packages = [
        "flask==2.3.3",
        "flask-cors==4.0.0", 
        "numpy==1.24.3",
        "pandas==2.0.3",
        "scikit-learn==1.3.0",
        "scikit-surprise==1.1.3"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        package_name = package.split("==")[0]
        try:
            __import__(package_name.replace("-", "_"))
            print(f"✅ {package_name} is installed")
        except ImportError:
            print(f"❌ {package_name} is missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installing {len(missing_packages)} missing packages...")
        for package in missing_packages:
            print(f"🔄 Installing {package}...")
            if install_package(package):
                print(f"✅ {package} installed successfully")
            else:
                print(f"❌ Failed to install {package}")
                return False
    
    print("\n🎉 All dependencies are ready!")
    return True

if __name__ == "__main__":
    success = check_and_install_dependencies()
    if not success:
        print("\n❌ Dependency installation failed!")
        sys.exit(1)
    else:
        print("\n✅ Dependencies ready - starting model service...")
        
        # Import and start the model service
        try:
            from model_service import app
            app.run(host='0.0.0.0', port=5001, debug=False)
        except ImportError as e:
            print(f"❌ Failed to import model service: {e}")
            sys.exit(1)
