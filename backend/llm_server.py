from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

# Load lightweight chat model
chatbot = pipeline(
    "text-generation",
    model="google/gemma-2b-it",
    device_map="auto",   # will use GPU if available, else CPU
)

# FastAPI setup
app = FastAPI()

# CORS setup to allow requests from frontend
origins = [
    "http://localhost:3000",  # React dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
async def chat(req: ChatRequest):
    response = chatbot(
        req.prompt,
        max_new_tokens=200,   # maximum length of response (in tokens/words)
        do_sample=True,       # whether to use randomness when generating
        temperature=0.3,      # how "creative" (0.8-1.2) vs. "deterministic" (0.2-0.5) the output is
        top_p=0.9             # nucleus sampling (limits randomness to top 90% probable words)
    )
    print(response)
    return {"response": response[0]["generated_text"]}

# Run with: uvicorn llm_server:app --host 0.0.0.0 --port 8000