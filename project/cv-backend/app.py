from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from ocr import extract_medicine_name

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanResponse(BaseModel):
    medicine: str
    candidates: List[str]


@app.post("/scan", response_model=ScanResponse)
async def scan(file: UploadFile = File(...)):
    # FIX: validate that the upload is actually an image
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Expected an image file, got: {file.content_type}"
        )

    image_bytes = await file.read()

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # FIX: extract_medicine_name now returns { medicine, candidates }
    # instead of a bare string — frontend consumes both fields
    result = extract_medicine_name(image_bytes)
    return result


@app.get("/")
async def root():
    return {"message": "Backend is alive!"} 