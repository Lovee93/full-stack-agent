import os
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import agentplatform
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv(override=True)

ORIGINS = [
    "http://localhost:3000",                  # For local frontend development (e.g., React/Next.js)
    "http://localhost:5173",                  # Vite dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI Lifespan handler.
    Initializes the Vertex AI Client and Agent Engine ONCE inside Uvicorn's active
    running event loop during server startup. This provides zero per-request setup latency
    while maintaining a persistent connection pool across requests.
    """
    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-east1")
    engine_id = os.environ.get("REASONING_ENGINE_ID")

    if not project:
        raise RuntimeError("GOOGLE_CLOUD_PROJECT environment variable is not set.")
    if not engine_id:
        raise RuntimeError("REASONING_ENGINE_ID environment variable is not set.")

    client = agentplatform.Client(project=project, location=location)
    app.state.client = client
    app.state.engine_id = engine_id
    app.state.remote_agent = client.runtimes.get(name=engine_id)
    yield


class CreateSessionRequest(BaseModel):
    user_id: str

class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: str

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,                    # Blocks unauthorized web domains
    allow_credentials=True,                   # Allows cookies or auth headers if needed
    allow_methods=["POST", "OPTIONS"],         # Restricts HTTP verbs to only what your chat needs
    allow_headers=["Content-Type", "Authorization"], # Explicitly allows these specific headers
)

@app.get("/")
def read_root():
    return {"status": "healthy", "message": "Hello from FastAPI + uv!"}

@app.post("/api/chat/session")
async def create_new_chat_session(request: CreateSessionRequest):
    client = app.state.client
    engine_id = app.state.engine_id
    # This invokes the underlying async method on your agent to create a session
    session_operation = await client.aio.sessions.create(name=engine_id, user_id=request.user_id)
    session = session_operation.response.name
    return {
        "session_id": session.split("/")[-1],
        "user_id": request.user_id
    }

async def get_agent_response_async(
    remote_agent, user_id: str, message: str, session_id: str
) -> str:
    """Helper that collects the ADK stream into a single complete response string."""
    full_response = ""
    async for event in remote_agent.async_stream_query(
        user_id=user_id,
        session_id=session_id,
        message=message,
    ):
        if isinstance(event, dict):
            content = event.get("content") or event.get("response", {}).get("content") or {}
            parts = content.get("parts", []) if isinstance(content, dict) else []
            for part in parts:
                if isinstance(part, dict) and "text" in part:
                    full_response += part["text"]
                elif isinstance(part, str):
                    full_response += part
    return full_response


@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    # Clean non-streaming async call
    response_text = await get_agent_response_async(
        remote_agent=app.state.remote_agent,
        user_id=request.user_id,
        message=request.message,
        session_id=request.session_id,
    )
    
    return {"response": response_text}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)