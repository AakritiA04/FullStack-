from fastapi import FastAPI, UploadFile, File, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import chromadb
import uuid
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from backend.models import Workflow
from backend.database import Base, engine, get_db



app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


chroma_client = chromadb.PersistentClient(path="./chroma_data")
collection = chroma_client.get_or_create_collection("pdf_chunks")

model = SentenceTransformer("all-MiniLM-L6-v2")


Base.metadata.create_all(bind=engine)

# ----------- ROUTES -----------

# @app.get("/health")
# def health():
#     return {"status": "ok"}

@app.post("/workflows")
def create_workflow(name: str, description: str = "", db: Session = Depends(get_db)):
    workflow = Workflow(name=name, description=description)
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    content = await file.read()
    doc = fitz.open(stream=content, filetype="pdf")

    # extract text
    text = ""
    for page in doc:
        text += page.get_text()

    chunks = [text[i:i+500] for i in range(0, len(text), 500)]

    if not chunks:
        return {"error": "No text found in PDF"}

    embeddings = model.encode(chunks).tolist()

    ids = [str(uuid.uuid4()) for _ in chunks]
    collection.add(documents=chunks, embeddings=embeddings, ids=ids)

    return {
        "filename": file.filename,
        "chunks_stored": len(chunks),
        "sample_chunk": chunks[0]
    }

@app.post("/query")
async def query_collection(question: str = Body(..., embed=True)):
    query_embedding = model.encode([question]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    return {
        "question": question,
        "matches": results["documents"]
    }

@app.get("/workflows")
def get_workflows(db: Session = Depends(get_db)):
    workflows = db.query(Workflow).all()
    return workflows