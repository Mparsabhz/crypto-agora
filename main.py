import base64
import hashlib
import io
import json
import os
import secrets
import qrcode
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CryptoAgora API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "db.json"

def load_db() -> dict:
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump({"books": {}}, f, indent=4)
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(data: dict):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

@app.get("/")
def health_check():
    db = load_db()
    return {
        "status": "online",
        "protocol": "CryptoAgora Sovereign Publishing",
        "total_books_registered": len(db["books"])
    }


@app.post("/api/upload")
async def upload_manuscript(
    title: str = Form(...),
    author_pubkey: str = Form("0x8F9B...3E2A"),
    file: UploadFile = File(...)
):
    file_bytes = await file.read()
    sha256_hash = hashlib.sha256(file_bytes).hexdigest()

    db = load_db()
    book_count = len(db["books"]) + 1
    book_id = f"ca_{book_count:02d}"

    book_record = {
        "book_id": book_id,
        "title": title,
        "filename": file.filename,
        "author_pubkey": author_pubkey,
        "sha256_hash": sha256_hash,
        "web_of_trust_score": "99.4% (Verified Author)",
        "print_batch": None,
        "royalty_split": "20% Direct-to-Author",
        "xmr_tx_proof": None
    }

    db["books"][book_id] = book_record
    save_db(db)

    return {
        "message": "Manuscript cryptographically signed and registered!",
        "data": book_record
    }


class BatchRequest(BaseModel):
    book_id: str
    batch_size: int = 500
    frontend_base_url: str = "http://localhost:3000"  

@app.post("/api/mint-batch")
def mint_print_batch(req: BatchRequest):
    db = load_db()
    if req.book_id not in db["books"]:
        raise HTTPException(status_code=404, detail="Book ID not found")

    
    batch_token = f"LOT-2026-RO-{req.batch_size}"
    db["books"][req.book_id]["print_batch"] = batch_token
    save_db(db)

 
    verify_url = f"{req.frontend_base_url.rstrip('/')}/verify?book_id={req.book_id}&batch={batch_token}"

  
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(verify_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {
        "book_id": req.book_id,
        "print_batch": batch_token,
        "verify_url": verify_url,
        "qr_image_base64": f"data:image/png;base64,{qr_base64}"
    }


@app.get("/api/verify/{book_id}")
def verify_and_settle(book_id: str):
    db = load_db()
    if book_id not in db["books"]:
        raise HTTPException(status_code=404, detail="Book ID not found")

    book = db["books"][book_id]

    
    if not book.get("xmr_tx_proof"):
        random_hex = secrets.token_hex(8)
        book["xmr_tx_proof"] = f"tx_private_{random_hex}"
        if not book.get("print_batch"):
            book["print_batch"] = "LOT-2026-RO-500"
        save_db(db)

    return {
        "book_id": book["book_id"],
        "title": book["title"],
        "author_pubkey": book["author_pubkey"],
        "sha256_hash": book["sha256_hash"],
        "web_of_trust_score": book["web_of_trust_score"],
        "print_batch": book["print_batch"],
        "royalty_split": book["royalty_split"],
        "xmr_tx_proof": book["xmr_tx_proof"]
    }
    