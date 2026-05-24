# Euron Mental Health Chatbot

Euron is an AI-powered Mental Health Chatbot built using FastAPI, Groq LLMs, and a lightweight document-based guidance system.  
It provides supportive wellness conversations, crisis detection, and document-assisted stress management guidance.

---

# Features

- AI-powered supportive conversations
- Session-based memory handling
- Crisis keyword detection and safety responses
- Document-based wellness/stress guidance
- FastAPI backend
- Frontend UI support
- Groq LLM integration
- Chat logging system
- CORS enabled for frontend/backend communication

---

# Tech Stack

## Backend
- Python
- FastAPI
- Groq API
- dotenv
- Uvicorn

## AI / NLP
- Groq LLM (`llama-3.1-8b-instant`)

## Frontend
- HTML
- CSS
- JavaScript

---

# Project Structure

```bash
Euron Mental Health Chatbot/
│
├── chatbot-ui/
│   ├── index.html
│   ├── styles.css
│   └── chatbot.js
│
├── data/
│   └── stress_management.txt
│
├── main.py
├── chat_engine.py
├── doc_engine.py
├── crisis.py
├── logger.py
├── models.py
├── requirements.txt
├── .env
└── chat_log.csv
```

---

# Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "Euron Mental Health Chatbot"
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Additional packages used:

```bash
pip install fastapi uvicorn groq python-dotenv
```

---

# Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key
```

Get your Groq API key from:

https://console.groq.com/keys

---

# Running the Application

Run the backend server:

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

# Access the Application

## Backend

```text
http://127.0.0.1:8000
```

## Swagger API Docs

```text
http://127.0.0.1:8000/docs
```

## Frontend UI

```text
http://127.0.0.1:8000/ui/index.html
```

---

# API Endpoints

## Root Endpoint

```http
GET /
```

Redirects to frontend UI.

---

## Chat Endpoint

```http
POST /chat
```

### Request Body

```json
{
  "session_id": "user01",
  "query": "I feel stressed about exams"
}
```

### Response

```json
{
  "response": "Supportive AI response..."
}
```

---

## Document Chat Endpoint

```http
POST /doc-chat
```

### Request Body

```json
{
  "session_id": "user01",
  "query": "How can I manage stress?"
}
```

---

# Crisis Detection

The chatbot automatically detects crisis-related keywords such as:

- suicide
- kill myself
- hopeless
- want to die
- no reason to live

If detected, the chatbot returns emergency support resources instead of normal AI responses.

---

# Logging System

All conversations are stored inside:

```text
chat_log.csv
```

Logged fields:
- timestamp
- session_id
- query
- response
- crisis_flag

---

# AI Models Used

## Groq Model

```text
llama-3.1-8b-instant
```

---

# How It Works

## Standard Chat Flow

1. User sends a query
2. Session memory is loaded
3. Query is sent to Groq LLM
4. AI response is generated
5. Chat is logged
6. Response is returned

---

## Document Chat Flow

1. Text files are loaded from `/data`
2. Context is injected into prompt
3. Groq generates contextual response
4. Response is returned

---

# Safety Features

- Crisis keyword detection
- Emergency helpline responses
- Session memory isolation
- Input logging

---

# Future Improvements

- User authentication
- Database integration
- Voice support
- Emotion analysis
- Multi-language support
- Admin dashboard
- Real-time chat UI
- Deployment on Render/Vercel

---

# Author

Ankit Jangid

---

# License

This project is intended for educational and learning purposes.