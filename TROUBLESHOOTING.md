# MedSync Backend Troubleshooting Guide

## Quick Diagnosis

### Is the backend running?
```bash
curl http://localhost:8000/
```

**Expected response:**
```json
{"message": "Backend is alive!"}
```

**If no response:**
- Backend is not running → Follow "Starting the Backend"
- Connection refused → Check port 8000 is open
- Timeout → Backend crashed or hung → Restart it

---

## Common Issues & Solutions

### Issue 1: "No module named 'uvicorn'" / "No module named 'fastapi'"

**Symptom:**
```
/usr/local/bin/python: No module named uvicorn
```

**Cause:** Python dependencies not installed

**Solution:**
```bash
# Option A: Use setup script
python3 scripts/setup-cv-backend.py

# Option B: Manual install
pip install --user -r project/cv-backend/requirements.txt

# Verify
python3 -c "import uvicorn, fastapi; print('OK')"
```

---

### Issue 2: Backend crashes immediately

**Symptom:**
```
Exception in callback BaseAsyncIOEventLoop...
Process finished with exit code 1
```

**Cause:** Usually a module import error

**Solution:**
```bash
# Run with verbose output
cd project/cv-backend
python3 -m uvicorn app:app --log-level debug

# Check for import errors
python3 -c "from app import app; print('OK')"
python3 -c "from ocr import extract_medicine_name; print('OK')"
```

---

### Issue 3: Port 8000 already in use

**Symptom:**
```
OSError: [Errno 98] Address already in use
```

**Cause:** Another process using port 8000

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000
# or
netstat -tlnp | grep 8000

# Kill it (if safe)
kill -9 <PID>

# Or use different port
cd project/cv-backend
python3 -m uvicorn app:app --port 8001

# Update frontend in src/services/drugInfoService.ts:
# Change line: "http://127.0.0.1:8000/scan"
# To: "http://127.0.0.1:8001/scan"
```

---

### Issue 4: Image upload not recognized by backend

**Symptom:**
App says "CV Backend not running" even though it's running

**Cause:** 
- CORS not configured properly
- Frontend calling wrong URL
- Browser security policy

**Solution:**
```bash
# 1. Verify backend is responding to scan
curl -X POST -F "file=@test.jpg" http://localhost:8000/scan

# 2. Check CORS headers
curl -H "Origin: http://localhost:5173" http://localhost:8000 -v

# 3. Verify frontend URL matches backend
# In src/services/drugInfoService.ts
# Line 207 should have: "http://127.0.0.1:8000/scan"

# 4. Try from different port
# If frontend is on 5174, add to cv-backend/app.py:
# allow_origins=["http://localhost:5173", "http://localhost:5174"]
```

---

### Issue 5: Image processing very slow

**Symptom:**
- First image scan takes 10+ seconds
- App seems frozen

**Cause:** EasyOCR model loading (first time only)

**Solution:**
```bash
# This is NORMAL - first scan loads ~1GB PyTorch models
# Subsequent scans take 1-2 seconds

# To speed up:
# 1. Run GPU version (if you have CUDA)
#    - Requires nvidia-cuda-toolkit and nvidia drivers
#    - Update requirements.txt to use GPU torch

# 2. Pre-load models on startup
#    - Edit cv-backend/app.py startup code
#    - Call extract_medicine_name with blank image to warm up
```

---

### Issue 6: EasyOCR model download fails

**Symptom:**
```
Error downloading model...
URLError: [Errno -2] Name or service not known
```

**Cause:** No internet connection or download issues

**Solution:**
```bash
# Try downloading models separately
python3 -c "
import easyocr
reader = easyocr.Reader(['en'], gpu=False)
print('Models loaded successfully')
"

# If it fails, try manual download:
# https://github.com/JaidedAI/EasyOCR/wiki/FAQ

# Workaround: App will still work with manual search
# Image scanning will just be unavailable temporarily
```

---

### Issue 7: Torch/PyTorch won't install

**Symptom:**
```
ERROR: Could not find a version that satisfies the requirement torch
```

**Cause:**
- Trying to install on unsupported platform
- Virtual environment issues

**Solution:**
```bash
# Check Python version (need 3.8+)
python3 --version

# Use --user to install in user directory
pip install --user torch torchvision

# Or use pre-built wheels
# Visit: https://pytorch.org/get-started/locally/
# And follow platform-specific instructions

# Alternative: Use Docker
docker-compose up  # Handles all dependencies
```

---

### Issue 8: CORS errors in browser console

**Symptom:**
```
Access to XMLHttpRequest at 'http://localhost:8000/scan' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Cause:** Frontend port not in CORS whitelist

**Solution:**
```python
# In project/cv-backend/app.py
# Update allow_origins list:

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Add if using port 5174
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Issue 9: Medicine not recognized from image

**Symptom:**
- Backend returns empty candidates
- Error: "Could not identify medicine"

**Cause:**
- Blurry or low-quality image
- Medicine not in training data
- Text at unusual angle

**Solution:**
```bash
# 1. Try clearer image - straight angle, good lighting
# 2. Use manual search as fallback
# 3. Add medicine to KNOWN_DRUGS in ocr.py

# Test OCR quality:
python3 -c "
from ocr import extract_medicine_name
with open('medicine.jpg', 'rb') as f:
    result = extract_medicine_name(f.read())
    print('Result:', result)
    print('Candidates:', result.get('candidates', []))
"
```

---

### Issue 10: Container won't start (Docker)

**Symptom:**
```
docker-compose up fails
or
Container exits immediately
```

**Cause:** Usually Docker daemon not running or permission issues

**Solution:**
```bash
# Check Docker is running
docker ps

# If not running:
sudo systemctl start docker  # Linux
# or restart Docker app (macOS/Windows)

# Check permissions
docker run hello-world

# Run with sudo if needed
sudo docker-compose up

# Check logs
docker-compose logs -f cv-backend
```

---

## Verification Steps

### Complete Health Check
```bash
# 1. Check backend is alive
curl -s http://localhost:8000/ | grep -q "alive" && echo "✓ Backend alive" || echo "✗ Backend down"

# 2. Check dependencies
python3 -c "import fastapi, uvicorn, cv2, easyocr; print('✓ All imports OK')"

# 3. Test with sample image
curl -X POST -F "file=@project/cv-backend/test.jpg" http://localhost:8000/scan 2>/dev/null | python3 -m json.tool > /dev/null && echo "✓ API works" || echo "✗ API error"

# 4. Check frontend can reach backend
curl -H "Origin: http://localhost:5173" -v http://localhost:8000/ 2>&1 | grep -i access-control && echo "✓ CORS OK"

# 5. Manual test
python3 -c "
from ocr import extract_medicine_name
print('✓ OCR module loads')
"
```

---

## Getting More Help

### Debug Mode
```bash
# Backend verbose logging
cd project/cv-backend
python3 -m uvicorn app:app --log-level debug

# Check what requests are being made
# Open browser DevTools (F12) -> Network tab
# Try uploading image and watch network requests
```

### Check Logs
```bash
# If using Docker
docker-compose logs -f cv-backend

# If running locally, check terminal output
# Look for error messages before the crash
```

### Test API Directly
```bash
# Test with real image
FILE="path/to/medicine.jpg"
curl -v -X POST -F "file=@$FILE" http://localhost:8000/scan

# Test with curl verbose to see headers
curl -v http://localhost:8000/

# Test from different host
curl http://127.0.0.1:8000/  # vs
curl http://localhost:8000/  # vs
curl http://0.0.0.0:8000/    # vs
curl http://<your-ip>:8000/
```

---

## When to Give Up & Use Manual Search

The app is designed to work without the backend. If you're stuck:

1. Use **Manual Search** feature
2. Type medicine name directly
3. All information is available without images
4. Backend is only for convenience, not required

The medical information database is fully functional for:
- ✓ Searching by name
- ✓ Getting dosage info
- ✓ Viewing side effects
- ✓ Checking interactions
- ✗ Only missing: image scanning

---

## Files to Check

If debugging, examine these in order:

1. **Frontend logs**
   - Browser DevTools Console (F12)
   - Look for "Image scan failed" messages

2. **Backend logs**
   - Terminal where you ran `start-cv-backend.sh`
   - Or `docker-compose logs`

3. **Configuration**
   - `project/cv-backend/app.py` - CORS origins
   - `src/services/drugInfoService.ts` - Backend URL
   - `project/cv-backend/requirements.txt` - Dependencies

4. **System**
   - `ps aux | grep uvicorn` - Is backend running?
   - `lsof -i :8000` - What's on port 8000?
   - `python3 --version` - Correct Python?

---

## Contact & Resources

- **Setup Guide**: See `CV_BACKEND_SETUP.md`
- **Quick Start**: See `BACKEND_QUICK_START.md`
- **Full Summary**: See `BACKEND_FIX_SUMMARY.md`
- **EasyOCR Docs**: https://github.com/JaidedAI/EasyOCR
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

**Still stuck? The app works great with manual search! Try that first while you troubleshoot the backend.**
