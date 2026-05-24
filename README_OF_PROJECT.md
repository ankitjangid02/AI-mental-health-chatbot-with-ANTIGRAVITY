# Euron Mental Health Support Portal - Complete Project Documentation

This documentation provides an in-depth guide to the Euron Mental Health Support Portal, including its system architecture, operational design, and a complete breakdown of every file in the codebase.

---

## 1. Project Overview & Architecture

Euron is an AI-powered wellness portal designed to assist in managing everyday stress and emotional challenges. It operates as a web application utilizing a **FastAPI backend** and a **Vanilla HTML/CSS/JS frontend**.

The application uses the official **Groq SDK** and queries the `llama-3.1-8b-instant` model to provide fast, high-quality, and empathetic responses.

It supports two main functionalities:
1. **Wellness Guidance (Conversational)**: Chat support with session-based memory using direct API completions.
2. **Stress Guide Library (RAG)**: A Document-based Q&A system that reads local guidelines and answers questions based directly on the documents' contents.

---

## 2. Directory Structure

```text
d:\Project\Euron Mental Health Chatbot\
│
├── .env                         # API Credentials and tokens
├── requirements.txt             # Python Package Dependencies
├── CHANGELOG.md                 # Changes and history log
├── readme_og.md                 # Complete project documentation (this file)
│
├── main.py                      # FastAPI Application entry point
├── models.py                    # Request schema definitions
├── chat_engine.py               # Session-based conversational LLM engine
├── doc_engine.py                # Document Q&A (RAG) context search engine
├── crisis.py                    # Crisis keyword screening rules & warning message
├── logger.py                    # CSV-based chat history logging
│
├── data/
│   └── stress_management.txt    # Local stress management resource document
│
└── chatbot-ui/
    ├── index.html               # Main portal page structure
    ├── styles.css               # Portal styling sheet (calming wellness theme)
    └── chatbot.js               # Frontend portal controller script
```

---

## 3. Detailed File-by-File Breakdown

### 📂 Backend Files (Python)

#### 📄 [main.py]
* **Purpose**: The entry point for the FastAPI server.
* **Key Details**:
  - Initializes the `FastAPI` application instance.
  - Adds `CORSMiddleware` configured to allow cross-origin requests (`*`) from frontends run locally via the file protocol.
  - Loads env parameters by calling `load_dotenv()` early.
  - Mounts the `chatbot-ui/` directory at the `/ui` route, and configures a `RedirectResponse` at the root path (`/`) to automatically direct users to `/ui/index.html`.
  - Defines the core POST endpoints:
    - `/chat`: Expects a `ChatRequest` containing a session ID and a query. Checks if the query contains crisis keywords, logs the transaction, and retrieves conversational guidance.
    - `/doc-chat`: Queries the local document knowledge base for contextual guidance.

#### 📄 [models.py]
* **Purpose**: Defines request data structures using Pydantic models.
* **Key Details**:
  - Declares the `ChatRequest` schema containing:
    - `session_id` (string): Identifies a unique user chat session to manage conversational memory.
    - `query` (string): The text question submitted by the user.

#### 📄 [chat_engine.py]
* **Purpose**: Drives conversational guidance with session-based memory.
* **Key Details**:
  - Establishes connection to the Groq API by creating a `Groq` client instance using the loaded `GROQ_API_KEY`.
  - Declares `session_memory_map` (a dictionary) which maps `session_id` strings to arrays of previous message objects.
  - Implements `get_response(session_id, user_query)`:
    - Injects the system prompt to guide the AI's persona (*Euron, an empathetic, supportive, and compassionate chatbot*).
    - Appends user queries to session histories.
    - Slices history arrays to limit history length (retaining the system prompt and up to the last 14 messages) to prevent token window overflow.
    - Initiates completion calls to the `llama-3.1-8b-instant` model and saves the assistant answers back to session memory.

#### 📄 [doc_engine.py]
* **Purpose**: Drives Document-based QA (RAG) using local assets.
* **Key Details**:
  - Implements `load_documents_context(directory)`: Loops through all `.txt` documents inside the specified directory (e.g. `data/`), reads their file contents, and aggregates them into a single string.
  - Implements `query_documents(user_query)`:
    - Reads the aggregated text context.
    - Builds a custom system prompt injecting the context guidelines and instructing the model to answer queries based directly on the provided data.
    - Submits requests to Groq's `llama-3.1-8b-instant` model.

#### 📄 [crisis.py]
* **Purpose**: Coordinates crisis safety screenings.
* **Key Details**:
  - Defines `CRISIS_KEYWORDS` (a list of phrases/keywords related to suicide and hopelessness).
  - Defines `SAFETY_MESSAGE` (a formatted string providing emergency helpline resources for India, the USA, and the UK).
  - Exposes `contains_crisis_keywords(text)` which reviews inputs in lowercase and returns a boolean if any crisis phrase matches, allowing immediate redirection.

#### 📄 [logger.py]
* **Purpose**: Manages file-based database logging.
* **Key Details**:
  - Implements `log_chat(session_id, query, response, is_crisis)`:
    - Opens a local file named `chat_log.csv` in append mode.
    - Writes header titles if the file is empty.
    - Records timestamp (ISO format), session token, user input, AI reply, and crisis flag status for auditing.

---

### 📂 Configuration Files

#### 📄 [requirements.txt]
* **Purpose**: Documents the required third-party Python modules.
* **Key Details**:
  - Declares necessary libraries including `fastapi`, `uvicorn`, `requests`, `python-dotenv`, and `groq`.

---

### 📂 Knowledge Base Data

#### 📄 [data/stress_management.txt]
* **Purpose**: Provides contextual data for stress-management queries.
* **Key Details**:
  - A text file containing guidelines on deep breathing, consistent sleep schedules, physical activities, time management systems, balanced nutrition, and when to seek professional counseling.

---

### 📂 Frontend Files (HTML/CSS/JS)

#### 📄 [chatbot-ui/index.html]
* **Purpose**: Establishes the visual structure of the portal interface.
* **Key Details**:
  - Imports Google Fonts (`DM Sans` and `Playfair Display`).
  - Sets up the main application navigation header with a status dot.
  - Implements tab selectors to switch between *Wellness Guidance* and *Stress Guide Library*.
  - Creates a centered query submission card containing a text input field, a "Quick Topics" tags area, and reset/submit buttons.
  - Displays a dedicated loader animation and guidance response container.
  - Includes a bottom-aligned resources grid displaying the AI educational disclaimer and support helplines details.

#### 📄 [chatbot-ui/styles.css]
* **Purpose**: Styles the layout and defines visual assets.
* **Key Details**:
  - Defines global theme CSS variables (calming sage green background, warm linen cards, dark forest green highlights).
  - Uses serif typography for headings to present an editorial, calm, and professional dashboard feel.
  - Adds interactive hover transitions on buttons and selection tags.
  - Stylizes the loading spinner rotation and crisis alert warning backgrounds.
  - Incorporates media queries (`@media`) to adjust alignments on narrower screens.

#### 📄 [chatbot-ui/chatbot.js]
* **Purpose**: Orchestrates frontend behaviors and connects to backend endpoints.
* **Key Details**:
  - Determines the active server port dynamically depending on whether the file is opened directly (`file:///`) or hosted via the FastAPI server.
  - Generates or retrieves unique session IDs inside `localStorage` for continuity.
  - Listens for clicks on Quick Topics buttons to auto-populate user input fields.
  - Controls loading/spinner visibility states.
  - Submits POST requests to `/chat` or `/doc-chat`.
  - Implements `parseMarkdown()` using regular expressions to convert markdown formatting (bolding, lists, line breaks) into HTML tags.
  - Identifies crisis-warning text blocks and adds CSS alert classes.
