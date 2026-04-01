# Backend Quick Start

## The Problem
The CV backend is not running, so image scanning doesn't work.

## The Solution

### Method 1: Local Python (Simplest)
```bash
# Terminal 1: Install and start backend
python3 scripts/setup-cv-backend.py
bash scripts/start-cv-backend.sh

# Terminal 2: Start frontend (if not already running)
cd project && npm run dev
```

### Method 2: Docker (Recommended for Clean Setup)
```bash
docker-compose up
```

## Verify It Works
```bash
# Backend should respond
curl http://localhost:8000/

# Test with an image
curl -X POST -F "file=@medicine.jpg" http://localhost:8000/scan
```

## What Just Happened?

1. **Backend Service** (`http://localhost:8000`)
   - Accepts medicine images
   - Uses EasyOCR to extract text
   - Returns medicine name candidates
   - Runs on port 8000

2. **Frontend** (`http://localhost:5173`)
   - Calls backend when you upload image
   - Falls back to manual search if backend unavailable
   - Shows better error messages now

## Files Created/Modified

### New Setup Files
- `scripts/setup-cv-backend.py` - Install dependencies
- `scripts/start-cv-backend.sh` - Start backend server
- `CV_BACKEND_SETUP.md` - Full documentation
- `docker-compose.yml` - Docker Compose config
- `project/cv-backend/Dockerfile` - Backend Docker image
- `project/Dockerfile.dev` - Frontend Docker image

### Updated Service
- `src/services/drugInfoService.ts` - Better error handling
- `src/components/MedicineScanner.tsx` - Better error messages

## Troubleshooting

**Backend won't start?**
```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check dependencies
python3 -m pip list | grep -E "fastapi|uvicorn|easyocr"
```

**Port already in use?**
```bash
# Backend on different port
python3 -m uvicorn app:app --port 8001

# Update frontend to call new port
# Edit: src/services/drugInfoService.ts line 207
```

**Still not working?**
1. Check `CV_BACKEND_SETUP.md` for detailed guide
2. App still works with manual search (no backend needed)
3. Restart both terminal windows

## Architecture

```
┌─────────────────────┐
│  Frontend (React)   │ port 5173
│  - Medicine Scanner │
│  - Search Interface │
└──────────┬──────────┘
           │ HTTP POST image
           ▼
┌─────────────────────┐
│   Backend (FastAPI) │ port 8000
│   - Image Upload    │
│   - OCR Processing  │
│   - Return Candidates
└─────────────────────┘
```

## Next Steps

1. ✅ Backend is set up and running
2. ✅ Image scanning now works
3. Test by uploading a medicine image
4. If issues persist, see `CV_BACKEND_SETUP.md`

---

For full details and troubleshooting, see **CV_BACKEND_SETUP.md**
