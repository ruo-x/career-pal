from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer
from fastapi.middleware.cors import CORSMiddleware

model = "google/gemma-2b-it"

tokenizer = AutoTokenizer.from_pretrained(model)
# Load lightweight chat model
chatbot = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    device_map="auto",   # will use GPU if available, else CPU
)

# System prompt to guide the model's behavior
system_prompt = """
You are a helpful cybersecurity assistant.
- Always answer clearly and concisely.
- Focus only on cybersecurity topics: threats, attacks, vulnerabilities, defenses.
- Never repeat the user’s input.
- Use short explanations with examples when possible.
- If user asks for non-cybersecurity topics, politely decline.
"""

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
    full_prompt = system_prompt + "\nUser: " + req.prompt + "\nAssistant:"
    
    response = chatbot(
        full_prompt,
        max_new_tokens=256,   # maximum length of response (in tokens/words)
        do_sample=True,       # whether to use randomness when generating
        temperature=0.3,      # how "creative" (0.8-1.2) vs. "deterministic" (0.2-0.5) the output is
        top_p=0.9,            # nucleus sampling (limits randomness to top 90% probable words)
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id,
    )
    generated_text = response[0]["generated_text"]
    # Extract only the assistant's reply
    assistant_reply = generated_text.split("Assistant:")[-1].strip()
    return {"response": assistant_reply}

# Run with: uvicorn llm_server:app --host 0.0.0.0 --port 8000