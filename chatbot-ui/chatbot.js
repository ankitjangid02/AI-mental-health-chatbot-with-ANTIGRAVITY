// Configuration
const API_BASE_URL = window.location.protocol === 'file:' ? 'http://127.0.0.1:8000' : window.location.origin;

// App State
let currentMode = 'standard'; // 'standard' or 'doc'
let sessionId = '';

// DOM Elements
const queryForm = document.getElementById('query-form');
const queryInput = document.getElementById('query-input');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const resultBody = document.getElementById('result-body');
const resetResultBtn = document.getElementById('reset-result-btn');

// Status Indicator
const statusDot = document.querySelector('.status-dot');
const statusText = document.getElementById('status-text');

// Tabs & Section Headers
const standardTab = document.getElementById('mode-standard-btn');
const docTab = document.getElementById('mode-doc-btn');
const queryTitle = document.getElementById('query-title');
const queryDesc = document.getElementById('query-desc');

// Initialize Web Portal
document.addEventListener('DOMContentLoaded', () => {
    generateSessionId();
    checkBackendHealth();
    setupEventListeners();
});

// Generate Session ID
function generateSessionId() {
    let savedId = localStorage.getItem('euron_session_id');
    if (!savedId) {
        savedId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem('euron_session_id', savedId);
    }
    sessionId = savedId;
}

// Bind Event Handlers
function setupEventListeners() {
    // Mode navigation tabs
    standardTab.addEventListener('click', () => setMode('standard'));
    docTab.addEventListener('click', () => setMode('doc'));

    // Clear input query
    clearBtn.addEventListener('click', () => {
        queryInput.value = '';
        queryInput.focus();
    });

    // Query submission
    queryForm.addEventListener('submit', handleQuerySubmit);

    // Reset results panel
    resetResultBtn.addEventListener('click', resetResultPanel);

    // Topic quick select tags click listener
    document.querySelectorAll('.mood-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            queryInput.value = tag.getAttribute('data-query');
            queryInput.focus();
        });
    });
}

// Check Backend Alive
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            setOnlineStatus(true);
        } else {
            setOnlineStatus(false);
        }
    } catch (e) {
        setOnlineStatus(false);
    }
}

function setOnlineStatus(online) {
    if (online) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'Connected';
    } else {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'Server Offline';
    }
}

// Toggle Tabs
function setMode(mode) {
    if (currentMode === mode) return;
    currentMode = mode;

    if (mode === 'standard') {
        standardTab.classList.add('active');
        docTab.classList.remove('active');
        queryTitle.textContent = 'What would you like assistance with today?';
        queryDesc.textContent = 'Describe your feelings or ask Euron for suggestions and mindful routines.';
        queryInput.placeholder = 'e.g. I am feeling overwhelmed with work, what should I do?';
    } else {
        docTab.classList.add('active');
        standardTab.classList.remove('active');
        queryTitle.textContent = 'Stress Guide Library (RAG Search)';
        queryDesc.textContent = 'Ask questions search based on local guidelines for sleep, physical exercise and stress management.';
        queryInput.placeholder = 'e.g. Give me some tips on managing exam stress, or sleep habits...';
    }
}

// Submit Form
async function handleQuerySubmit(e) {
    e.preventDefault();
    const queryText = queryInput.value.trim();
    if (!queryText) return;

    // Show spinner & disable button
    loadingSpinner.style.display = 'flex';
    submitBtn.disabled = true;

    // Reset output status text
    resultBody.className = 'panel-content';
    resultBody.innerHTML = '<p class="placeholder">Euron is drafting guidance, please stand by...</p>';

    try {
        const endpoint = currentMode === 'standard' ? '/chat' : '/doc-chat';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: sessionId,
                query: queryText
            })
        });

        loadingSpinner.style.display = 'none';
        submitBtn.disabled = false;

        if (!response.ok) {
            throw new Error(`Server returned error ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.response;

        // Check if response contains crisis warning
        const isCrisis = responseText.includes('helpline') || responseText.includes('9152987821');

        if (isCrisis) {
            resultBody.classList.add('crisis-alert');
        }

        resultBody.innerHTML = parseMarkdown(responseText);
        setOnlineStatus(true);
    } catch (err) {
        loadingSpinner.style.display = 'none';
        submitBtn.disabled = false;
        resultBody.innerHTML = `<p class="placeholder" style="color: var(--color-danger);">⚠️ Error contacting server: Failed to contact the backend service. Check if your API is active. (${err.message})</p>`;
        setOnlineStatus(false);
    }
}

// Convert basic Markdown formatting
function parseMarkdown(text) {
    let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Bold formatting: **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points listing
    const lines = escaped.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            let result = '';
            if (!inList) {
                result += '<ul>';
                inList = true;
            }
            result += `<li>${content}</li>`;
            return result;
        } else {
            let result = '';
            if (inList) {
                result += '</ul>';
                inList = false;
            }
            result += line;
            return result;
        }
    });

    if (inList) {
        processedLines.push('</ul>');
    }

    return processedLines.join('\n').replace(/\n/g, '<br>');
}

// Reset results box
function resetResultPanel() {
    resultBody.className = 'panel-content';
    resultBody.innerHTML = '<p class="placeholder">Select a topic or type your query above, then submit to receive guidance.</p>';
}
