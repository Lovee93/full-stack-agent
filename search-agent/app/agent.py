from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types
from google.adk.tools import google_search
from google.adk.tools.preload_memory_tool import PreloadMemoryTool
from google.adk.agents.callback_context import CallbackContext

MODEL = "gemini-3.6-flash"

# Define the callback that triggers Memory Bank extraction
async def generate_memories_callback(callback_context: CallbackContext):
    # Sends last 4 events - each event may contain user and model messages depending on model's generation.
    await callback_context.add_events_to_memory(events=callback_context.session.events[-5:-1])
    return None

root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction="You are a helpful AI assistant designed to provide accurate and useful information.",
    # Note: preload_memory auto-injects memories into system instructions.
    # For production apps with lower latency and prompt caching, prefer an on-demand `search_memory` tool or custom callback.
    tools=[google_search, PreloadMemoryTool()],
    # Register the callback so it fires after every interaction
    after_agent_callback=[generate_memories_callback]
)

app = App(
    root_agent=root_agent,
    name="app",
)