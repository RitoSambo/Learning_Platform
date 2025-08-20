#!/usr/bin/env python3
"""
Student Learning Platform - Startup Script
This script provides an easy way to run the learning platform.
"""

import os
import sys
import subprocess

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Error: Python 3.7 or higher is required!")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import flask
        import werkzeug
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def create_virtual_env():
    """Create virtual environment if it doesn't exist"""
    if not os.path.exists("venv"):
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
        print("✅ Virtual environment created")
        return True
    return False

def activate_virtual_env():
    """Activate virtual environment"""
    if os.name == 'nt':  # Windows
        activate_script = os.path.join("venv", "Scripts", "activate")
    else:  # Unix/Linux/macOS
        activate_script = os.path.join("venv", "bin", "activate")
    
    if os.path.exists(activate_script):
        print("🔧 Activating virtual environment...")
        if os.name == 'nt':
            os.system(f"venv\\Scripts\\activate && python app.py")
        else:
            os.system(f"source venv/bin/activate && python app.py")
        return True
    return False

def main():
    """Main function"""
    print("🚀 Student Learning Platform - Startup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Check if app.py exists
    if not os.path.exists("app.py"):
        print("❌ Error: app.py not found!")
        print("Please make sure you're in the correct directory.")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        print("\n📦 Installing dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    print("\n🌐 Starting the application...")
    print("📱 The application will be available at: http://localhost:5000")
    print("👤 Default teacher account: admin / admin123")
    print("⏹️  Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Run the application
    try:
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
    except Exception as e:
        print(f"❌ Error starting application: {e}")

if __name__ == "__main__":
    main()
