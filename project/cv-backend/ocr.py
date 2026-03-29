import easyocr
import cv2
import numpy as np
import re

# Initialize OCR reader once at module level (expensive to reload)
reader = easyocr.Reader(['en'])

# Known drug names to cross-reference against OCR output.
# Keep in sync with the frontend drugDatabase keys.
KNOWN_DRUGS = {
    "paracetamol", "acetaminophen",
    "ibuprofen",
    "aspirin", "acetylsalicylic",
    "metformin",
    "omeprazole",
    "amlodipine",
    "lisinopril",
    "atorvastatin",
}

def _normalize(text: str) -> str:
    """Lowercase, strip non-alpha characters for loose matching."""
    return re.sub(r"[^a-z]", "", text.lower())


def extract_medicine_name(image_bytes: bytes) -> dict:
    """
    Run OCR on image bytes and return:
      {
        "medicine": <best single guess>,
        "candidates": [<all plausible text strings, ranked>]
      }

    Strategy:
      1. Preprocess image (grayscale + denoise).
      2. Collect ALL OCR results above confidence threshold.
      3. Score each token: known drug name > long alphabetic word > short/numeric.
      4. Return ranked candidates so the frontend can try each against its DB.
    """
    # Decode bytes → OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"medicine": "Unknown", "candidates": []}

    # --- Preprocessing ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Denoise instead of plain blur — preserves edges better for text
    denoised = cv2.fastNlMeansDenoising(gray, h=10)
    # Adaptive threshold helps with uneven lighting on packaging
    thresh = cv2.adaptiveThreshold(
        denoised, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )

    # --- OCR ---
    results = reader.readtext(thresh)

    scored: list[tuple[float, str]] = []

    for (bbox, text, confidence) in results:
        cleaned = text.strip()

        # FIX: was filtering by bounding-box area only — brand logos are often
        # the largest text. Filter by confidence + content instead.
        if confidence < 0.4:
            continue
        if len(cleaned) < 3:
            continue
        if cleaned.isdigit():
            continue

        # Score: prefer known drug names → long words → deprioritize digits/symbols
        normalized = _normalize(cleaned)
        base_score = confidence  # 0.0–1.0

        if normalized in KNOWN_DRUGS:
            # Strong boost: exact known drug match
            base_score += 10.0
        elif any(drug in normalized for drug in KNOWN_DRUGS):
            # Partial match (e.g. "Paracetamol 500mg")
            base_score += 5.0
        elif re.match(r'^[a-zA-Z]{4,}$', cleaned):
            # Pure alphabetic, reasonably long — likely a medicine/ingredient name
            base_score += 1.0
        elif re.search(r'\d', cleaned):
            # Contains digits — probably a dosage string, lower priority
            base_score -= 0.5

        scored.append((base_score, cleaned))

    if not scored:
        return {"medicine": "Unknown", "candidates": []}

    scored.sort(key=lambda x: x[0], reverse=True)
    candidates = [text for _, text in scored]

    # Always return a dict — never a bare string
    return {
        "medicine": candidates[0],
        "candidates": candidates[:5],
    }