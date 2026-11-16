# ⚡ StudyCraft AI — Smart AI Study Assistant

**Transform your study notes into AI-powered summaries, interactive quizzes, and flashcards.**

StudyCraft AI is an interactive, responsive web application developed as part of a **Web Technology Continuous Assessment Project**. It helps students understand, revise, and retain educational concepts through AI-generated study materials and active learning tools.

🌐 **Live Website:** https://studycraft-ai-study-assistant.vercel.app/

💻 **GitHub Repository:** https://github.com/atharvagarudkar07/AI-Study-Assistant

---

## 📖 Project Overview

StudyCraft AI enables students to enter a topic or paste their study notes and generate a personalized study kit consisting of:

- 📚 Structured AI-generated summaries
- 🧠 Interactive multiple-choice quizzes
- 🃏 Flashcards for active recall
- 🔊 Text-to-speech explanations
- 💾 Saved study sessions
- 🌙 Dark and light themes

The application integrates AI services using JavaScript's Fetch API and provides a responsive user interface built with HTML5 and CSS3.

## ✨ Key Features

### 1. AI-Powered Study Kit Generation

Convert educational notes into structured learning materials using supported AI providers.

- Google Gemini API integration
- Groq API integration
- Demo Mode without an API key
- Customizable summary styles
- Adjustable quiz difficulty
- Selectable flashcard counts

### 2. Smart Study Summaries

Generate summaries containing an overview and key takeaways.

Additional functionality includes:

- Copy summary to clipboard
- Download summary as a `.txt` file
- Listen using browser text-to-speech

### 3. Interactive Quiz System

- Five multiple-choice questions per study kit
- Four answer options per question
- Automatic answer evaluation
- Percentage-based scoring
- Correct-answer highlighting
- Explanations after submission
- Retake quiz functionality

### 4. Interactive Flashcards

- Front-and-back flashcard interface
- 3D card-flipping animation
- Previous and next navigation
- Keyboard navigation
- Known and Learning progress tracking

### 5. Study History

StudyCraft AI uses browser LocalStorage to maintain study history.

Users can:

- Save generated study sessions
- Restore previous sessions
- Search study history
- Delete individual sessions
- Clear saved history

### 6. Personalization

- Dark and light mode
- Summary style selection
- Quiz difficulty selection
- Flashcard count selection
- AI provider configuration

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Responsive design and animations |
| JavaScript | Application functionality |
| Fetch API | AI service communication |
| Google Gemini API | AI study material generation |
| Groq API | Alternative AI provider |
| LocalStorage | Settings and history persistence |
| Web Speech API | Text-to-speech |
| GitHub | Source code management |
| Vercel | Website deployment |

## 📁 Project Structure

```text
AI-Study-Assistant/
│
├── index.html
├── styles.css
├── app.js
├── api.js
├── storage.js
├── README.md
└── .gitignore
```

**File descriptions:**

- `index.html` — Main application structure and interface
- `styles.css` — Styling, themes, layout, and animations
- `app.js` — User interface, event handling, quiz, flashcards, and rendering
- `api.js` — AI provider integration and response validation
- `storage.js` — LocalStorage management and sample notes
- `README.md` — Project documentation
- `.gitignore` — Git exclusion rules

## 🚀 Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/atharvagarudkar07/AI-Study-Assistant-.git
```

### Step 2: Open the Project

Open the project folder using Visual Studio Code.

### Step 3: Run the Website

Use the VS Code Live Server extension or another local development server to open `index.html`.

### Step 4: Configure AI Settings

1. Open the application.
2. Click **Settings**.
3. Select Google Gemini, Groq, or Demo Mode.
4. Enter your API key if using a real AI provider.
5. Save the settings.

### Step 5: Generate a Study Kit

1. Enter a topic or paste study notes.
2. Select a summary style.
3. Choose quiz difficulty.
4. Select the flashcard count.
5. Click **Generate Study Kit**.
6. Review the summary, quiz, and flashcards.

## 🧪 Testing

The following application features were manually tested:

| Feature | Result |
|---|---|
| Website styling | Passed |
| Settings modal | Passed |
| Demo Mode | Passed |
| Sample notes | Passed |
| Study kit generation | Passed |
| Quiz evaluation | Passed |
| Flashcard navigation | Passed |
| Study history | Passed |
| Theme switching | Passed |

A successful study kit generation was also observed on the deployed Vercel website.

## 🔐 API Key and Security Notes

StudyCraft AI currently stores user-provided API keys in browser LocalStorage and sends them directly to the selected AI provider for authentication.

**Important:**

- Never commit API keys to GitHub.
- Avoid entering sensitive keys on shared devices.
- Browser LocalStorage is not secure storage for application secrets.
- Demo Mode is available without an API key.
- A secure backend or serverless proxy is recommended for production use.

## 🌍 Deployment

The application is deployed using Vercel.

**Live Application:**

https://studycraft-ai-study-assistant.vercel.app/

**Source Code:**

https://github.com/atharvagarudkar07/AI-Study-Assistant-

## 🔮 Future Enhancements

Potential improvements include:

- Secure backend API integration
- PDF and document upload support
- Exportable PDF study notes
- Advanced quiz analytics
- Personalized revision recommendations
- Spaced-repetition scheduling
- User accounts and cloud synchronization
- Improved mobile accessibility

## 🎓 Academic Project

**Project Name:** StudyCraft AI — Smart AI Study Assistant

**Subject:** Web Technology

**Category:** AI-Integrated Educational Web Application

**Development:** HTML, CSS, and JavaScript

**Deployment Platform:** Vercel

## 📄 Conclusion

StudyCraft AI demonstrates how modern web technologies and AI services can be combined to create an interactive educational application.

The project applies DOM manipulation, asynchronous JavaScript, API integration, client-side storage, responsive design, and interactive learning techniques to provide a practical study assistance platform.
