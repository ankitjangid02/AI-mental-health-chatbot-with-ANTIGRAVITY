import os
from dotenv import load_dotenv
from groq import Groq

# load .env
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found, please check your .env file")

# Initialize the Groq client
client = Groq(api_key=GROQ_API_KEY)

# Store per-user memory sessions: session_id -> list of message dicts
session_memory_map = {}

SYSTEM_PROMPT = (
    "You are Euron, an empathetic, supportive, and compassionate AI mental health chatbot. "
    "Your goal is to provide a safe, non-judgmental space for users to share their feelings, "
    "discuss stress, anxiety, or emotional challenges, and offer helpful coping strategies. "
    "Keep your answers comforting, clear, and relatively concise (usually 1-3 short paragraphs). "
    "If the user shows signs of severe crisis, encourage them to reach out to professionals. "
    "However, a basic check is already run before your input, so you can focus on being supportive."
)

def get_response(session_id: str, user_query: str) -> str:
    # Initialize session history if it doesn't exist
    if session_id not in session_memory_map:
        session_memory_map[session_id] = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

    # Append the user's query
    session_memory_map[session_id].append({"role": "user", "content": user_query})

    # Limit history to the last 15 messages (plus the system prompt) to prevent token bloat
    history = [session_memory_map[session_id][0]] + session_memory_map[session_id][-14:]

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=history,
            temperature=0.7,
            max_tokens=1024,
        )
        assistant_response = completion.choices[0].message.content
        # Append the assistant response to memory
        session_memory_map[session_id].append({"role": "assistant", "content": assistant_response})
        return assistant_response
    except Exception as e:
        return f"Sorry, I encountered an error communicating with the chat server: {str(e)}"