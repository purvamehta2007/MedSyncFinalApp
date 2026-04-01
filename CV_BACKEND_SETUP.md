# CV Backend Setup Guide

The MedSync application includes a Computer Vision (CV) backend for scanning medicine images and extracting medicine names using OCR. Here's how to set it up.

## Quick Start

### 1. Install Dependencies

The CV backend requires several Python packages including OpenCV, EasyOCR, PyTorch, and FastAPI.

**Option A: Using the setup script (Recommended)**
```bash
python3 scripts/setup-cv-backend.py
```

**Option B: Manual installation**
```bash
pip install --user -r project/cv-backend/requirements.txt
```

### 2. Start the Backend Server

```bash
bash scripts/start-cv-backend.sh
```

Or manually:
```bash
cd project/cv-backend
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

### 3. Verify the Backend is Running

```bash
curl http://localhost:8000/
```

Expected response:
```json
{"message": "Backend is alive!"}
```

## Backend API

### POST /scan
Scans a medicine image and returns extracted medicine name and candidates.

**Request:**
- Method: `POST`
- URL: `http://localhost:8000/scan`
- Body: Form data with `file` field containing image

**Response:**
```json
{
  "medicine": "Paracetamol",
  "candidates": ["Paracetamol", "Acetaminophen", "500mg"]
}
```

**Example:**
```bash
curl -X POST -F "file=@medicine.jpg" http://localhost:8000/scan
```

## Architecture

### app.py (FastAPI Server)
- Handles HTTP requests
- Validates file uploads
- Routes to OCR processing

### ocr.py (Vision Processing)
- Uses EasyOCR to extract text from images
- Preprocesses images (grayscale, denoising, adaptive threshold)
- Scores candidates based on:
  - Known drug database matches
  - Text confidence levels
  - Word length and content
- Returns ranked list of candidates

### requirements.txt
Lists all Python dependencies needed for the CV backend.

## Troubleshooting

### Backend Won't Start
- **Error: "No module named uvicorn"**
  - Run setup script: `python3 scripts/setup-cv-backend.py`

- **Error: "Permission denied" during installation**
  - Use `--user` flag: `pip install --user -r requirements.txt`

- **Error: "CUDA/torch not available"**
  - The backend will fall back to CPU mode (slower but functional)
  - Ensure torch and torchvision are installed

### Image Scanning Not Working in App
- Check that backend server is running: `curl http://localhost:8000/`
- Ensure frontend is configured to call correct backend URL (default: `http://127.0.0.1:8000`)
- Check browser console for error messages
- Use manual search as fallback if backend unavailable

## Performance Notes

- First OCR inference takes 5-10 seconds (model loading)
- Subsequent requests take 1-2 seconds
- Requires ~2GB RAM for PyTorch models
- Works on both CPU and GPU (slower on CPU)

## Development

### Adding New Drug Names to Recognition
Edit `KNOWN_DRUGS` in `project/cv-backend/ocr.py`:
```python
KNOWN_DRUGS = {
    "paracetamol", "acetaminophen",
    "ibuprofen",
    "aspirin",
    # Add new drugs here...
}
```

### Testing the Backend Directly
```bash
python3 -c "
from ocr import extract_medicine_name
with open('medicine.jpg', 'rb') as f:
    result = extract_medicine_name(f.read())
    print(result)
"
```

## File Structure
```
project/cv-backend/
├── app.py              # FastAPI server
├── ocr.py              # OCR processing
└── requirements.txt    # Dependencies

scripts/
├── setup-cv-backend.py # Dependency installer
└── start-cv-backend.sh # Server startup script
```

## CORS Configuration

The backend allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

To add more origins, edit `app.py`:
```python
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-production-domain.com",  # Add here
]
```

## Production Deployment

For production deployment:
1. Use a proper Python environment (venv, Docker)
2. Run with a production ASGI server (Gunicorn + Uvicorn)
3. Add authentication/rate limiting
4. Use HTTPS with proper CORS configuration
5. Consider load balancing for multiple instances

Example production command:
```bash
gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
