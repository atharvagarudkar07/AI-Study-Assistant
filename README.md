# ⚡ StudyCraft AI — Smart AI Study Assistant

StudyCraft AI is a responsive web application that transforms lecture notes, article excerpts, or topics into structured study material using an AI model. It automatically synthesizes a concise **Summary**, generates an interactive 5-question **Quiz** with scoring, and constructs active-recall **Flashcards** with smooth 3D flip animations.

---

## 🌟 Feature Checklist

### ✅ Required Core Features
- [x] **Notes Input & Generation**: Flexible text area for raw notes or topics with sample presets.
- [x] **Secure API Settings**: Settings modal where users input their API key. Stored exclusively in the client's `localStorage`—no server storage, no risk of leaking credentials to GitHub.
- [x] **Fetch with async/await**: Uses modern `fetch()` with HTTP `POST`, custom headers, structured request body, and `async/await`.
- [x] **Three Output Sections (Tabs)**:
  - 📋 **Summary**: Clear formatted paragraphs and high-yield key takeaway bullet points.
  - 🧩 **Quiz**: 5 multiple-choice questions with option selection, immediate visual feedback (green for correct, red for incorrect), pedagogical explanations, and score tracking.
  - 🗂️ **Flashcards**: Interactive cards flipping between prompt/question and answer.
- [x] **Active Loading Indicator**: Animated AI pulse ring, shimmer progress bar, and status updates while generation is underway.
- [x] **Double-Click Prevention**: The Generate button is disabled with an inline spinner while a request is in flight.
- [x] **Study History with LocalStorage**: Saves previous study kits with timestamps; click to restore any session. Includes single-item deletion and a "Clear All" option.
- [x] **Summary Export Options**:
  - 📋 Copy to clipboard with animated confirmation feedback.
  - 💾 Download as a `.txt` formatted study sheet.
- [x] **Complete Error Handling**:
  - Missing API key (with direct modal prompt).
  - Empty input detection.
  - Network disconnection / offline detection (`navigator.onLine`).
  - HTTP error status codes (400 Bad Request, 401/403 Invalid API Key, 429 Rate Limit Exceeded, 500/503 AI Server Overload).
  - Malformed AI responses (schema verification ensuring summary, quiz, and flashcards arrays exist).
- [x] **Code Architecture**: Clean modular separation into HTML, CSS, and separate JavaScript files (`storage.js`, `api.js`, `app.js`).
- [x] **Responsive UI**: Optimized for mobile phones, tablets, and desktop displays.

### 🚀 Extra Features Included (Extra-Feature Marks)
1. **Dark / Light Mode Toggle (Compulsory)**: Seamless theme toggle with CSS custom properties; remembers the user's preference in `localStorage`.
2. **Summary Style Selector**: Choose between *Standard (Structured)*, *Explain like I am 10*, *Exam-focused (High-yield)*, or *In-depth & Comprehensive*.
3. **Text-to-Speech (TTS)**: Built-in Speech Synthesis API reads the summary aloud with Play, Pause, and Stop controls.
4. **Interactive 3D Flashcard Flip & Mastery Tracker**: CSS 3D perspective card flip with "Mastered (Got It!)" and "Still Learning" buttons and live mastery counters. Supports keyboard shortcuts (`Space`/`Enter` to flip, `ArrowLeft`/`ArrowRight` to navigate).
5. **Quiz Difficulty Selector**: Choose between *Easy (Foundational)*, *Medium (Application)*, or *Hard (Critical edge cases)*.
6. **Quiz Progress Analytics**: Tracks quiz scores and accuracy over time in `localStorage`.
7. **Live Character Counter & Warning**: Real-time character count with visual alerts for excessively long inputs.
8. **History Search & Filter**: Instant search box in the history drawer to filter past sessions by topic or notes snippet.
9. **Built-in Demo / Mock AI Mode**: Allows anyone to test and grade the complete app offline without entering an API key.

---

## 📁 Project Structure

```
ai-study-assistant/
│
├── index.html            # Semantic HTML5 markup, accessible ARIA roles, modals & tabs
├── css/
│   └── styles.css        # Responsive CSS with Light & Dark theme variables & 3D card flips
├── js/
│   ├── storage.js        # LocalStorage controller: API keys, themes, history & quiz stats
│   ├── api.js            # Prompt engineering, fetch() POST calls, HTTP error & JSON validation
│   └── app.js            # UI controller: DOM event listeners, TTS, tabs, quiz & flashcards
└── README.md             # Project documentation, API setup & Viva preparation guide
```

---

## 🔑 How to Get a Free API Key

### Option A: Google Gemini API (Recommended & Free)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click the blue **"Create API Key"** button.
4. Select a project (or choose "Create API key in new project").
5. Copy your API key (starts with `AIzaSy...`).
6. In **StudyCraft AI**, click **⚙️ Settings**, paste your key into the API Key field, and click **Save Settings**.

> **Note on Free Tier Limits:** Google Gemini API offers a free tier (15 requests per minute, 1,500 requests per day) which is more than enough for study and evaluation.

### Option B: Groq Cloud API (Alternative)
1. Sign up for free at [Groq Console](https://console.groq.com/keys).
2. Create an API key (starts with `gsk_...`).
3. In **StudyCraft AI**, open **⚙️ Settings**, switch Provider to **Groq**, paste your key, and click **Save Settings**.

### Option C: Demo / Mock Mode (No Key Needed)
- Open **⚙️ Settings**, choose **Demo / Mock AI Mode**, and click **Save Settings**.
- Generates realistic study kits instantly without requiring internet or API credentials.

---

## 💻 How to Run Locally

Because this project uses vanilla HTML, CSS, and modern JavaScript modules, you can run it using any simple local static server:

### Method 1: Python HTTP Server (Built-in on Mac & Linux)
Open your terminal in this project folder:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

### Method 2: VS Code Live Server Extension
1. Open the project folder in VS Code.
2. Right-click `index.html` and click **"Open with Live Server"**.

### Method 3: Direct Browser Launch
You can also directly double-click `index.html` in Finder / File Explorer to open it in Chrome, Safari, or Edge.

---

## 🌐 How to Deploy (Vercel or Netlify)

### Deploy to Netlify (Drag & Drop — 1 Minute)
1. Log in to [Netlify](https://app.netlify.com/).
2. Drag and drop the `ai-study-assistant` folder into the **Sites** upload area.
3. Your site is live immediately!

### Deploy to Vercel (via GitHub)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of StudyCraft AI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ai-study-assistant.git
   git push -u origin main
   ```
2. Open [Vercel](https://vercel.com/), click **"Add New Project"**, and import your repository.
3. Click **Deploy**.

---

## 🎓 Viva / Demo Preparation Guide

Be ready to explain how your code works in the oral evaluation (viva). Here is a breakdown of the key parts:

### 1. The `fetch()` Call Breakdown (Found in `js/api.js`)
```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```
- **`url`**: The Google Gemini REST API endpoint:  
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`  
  The API key is passed securely via query parameters or Authorization headers.
- **`method: 'POST'`**: We use POST because we are sending data (our prompt instructions and the user's notes) to the server.
- **`headers: { 'Content-Type': 'application/json' }`**: Informs the server that the request body is formatted as a JSON string.
- **`body: JSON.stringify(payload)`**: Serializes our JavaScript object into a JSON string containing the message parts and generation configuration (`responseMimeType: 'application/json'`).
- **`async / await`**: Pauses execution of the asynchronous function until the Promise returned by `fetch()` resolves, without blocking the browser's UI thread.

### 2. Status Code Handling
```javascript
if (!response.ok) {
  // response.ok is false for status codes 400-599
  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid API Key');
  } else if (response.status === 429) {
    throw new Error('Rate limit exceeded');
  }
}
```

### 3. Response Validation & JSON Parsing
```javascript
const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
const parsed = JSON.parse(cleanJson);
if (!parsed.summary || !Array.isArray(parsed.quiz) || !Array.isArray(parsed.flashcards)) {
  throw new Error('Incomplete schema returned by AI');
}
```
We strip any markdown fences in case the AI wraps its output, parse with `JSON.parse()` within a `try / catch` block to avoid application crashes, and check that all required fields (`summary`, `quiz`, `flashcards`) are present.

### 4. API Key Security Guarantee
The API key is stored only inside `localStorage.getItem('studycraft_api_key')`. It is **never** hardcoded into files, never committed to git, and never sent to any third-party server other than the official AI provider endpoint chosen by the user.

