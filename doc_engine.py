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

def load_documents_context(directory: str = "data") -> str:
    context_parts = []
    if not os.path.exists(directory):
        return ""
    
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath) and filename.endswith(".txt"):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    context_parts.append(f"--- File: {filename} ---\n{content}\n")
            except Exception as e:
                print(f"Error reading file {filename}: {e}")
                
    return "\n".join(context_parts)

def query_documents(user_query: str) -> str:
    context = load_documents_context("data")
    
    system_prompt = (
        "You are Euron, a supportive mental health assistant. "
        "Your task is to answer the user's question using the provided stress management documents context below. "
        "Be empathetic and helpful. Reference specific tips or guidance from the documents if relevant. "
        "If the document context does not contain relevant information, answer using your general knowledge but "
        "mention that this advice is general and not explicitly from our documents.\n\n"
        f"Document Context:\n{context}"
    )
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            temperature=0.5,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error querying documents: {str(e)}"