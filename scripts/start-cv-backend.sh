#!/bin/bash

# Start CV backend server
cd "$(dirname "$0")/../project/cv-backend"

echo "Starting CV Backend Server..."
echo "Port: 8000"
echo "Endpoint: http://localhost:8000/scan"
echo ""
echo "Ensure dependencies are installed first by running:"
echo "  python3 scripts/setup-cv-backend.py"
echo ""

# Try to start the backend with uvicorn
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
