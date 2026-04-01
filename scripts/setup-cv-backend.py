#!/usr/bin/env python3
"""
Setup script for CV backend dependencies.
This installs required packages in a user-level environment.
"""

import subprocess
import sys

def install_dependencies():
    """Install Python dependencies for CV backend."""
    requirements = [
        'fastapi',
        'uvicorn',
        'python-multipart',
        'opencv-python-headless',
        'numpy',
        'pillow',
        'easyocr==1.7.1',
        'torch',
        'torchvision',
        'python-bidi==0.4.2'
    ]
    
    print("Installing CV backend dependencies...")
    
    for package in requirements:
        print(f"Installing {package}...")
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'install', '--user', '--quiet', package],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Warning: Failed to install {package}")
            print(f"Error: {result.stderr}")
        else:
            print(f"✓ Installed {package}")
    
    print("\nDependencies installation complete!")
    print("You can now run: python -m uvicorn app:app --host 0.0.0.0 --port 8000")

if __name__ == '__main__':
    install_dependencies()
