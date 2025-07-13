from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from prompt_builder import build_prompt
from openai import OpenAI
import os

app = FastAPI()

# CORS configuration — allow Bolt frontends or use wildcard for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client with API key from environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Request schema
class TemplateRequest(BaseModel):
    category: str
    goal: str
    tone: str
    language: str
    variables: List[str]

@app.post("/generate_template")
def generate_template(request: TemplateRequest):
    try:
        prompt = build_prompt(
            category=request.category,
            goal=request.goal,
            tone=request.tone,
            language=request.language,
            variables=request.variables
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"content": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e), "content": "Error generating template. Please try again."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}