# 🤖 AI Study Assistant

An AI-powered web application that helps students convert their class notes and study topics into easy-to-understand summaries, interactive quizzes, and flashcards using Artificial Intelligence.

## 📌 Project Overview

The AI Study Assistant is a smart learning tool developed using HTML, CSS, and JavaScript. Students can paste their class notes or enter any topic, and the application uses an AI API to generate useful study materials.

This project combines AI integration with interactive web development to make learning easier, faster, and more effective.

## ✨ Features

- **AI Summary Generator:** Converts lengthy notes into short and understandable summaries.
- **AI Quiz Generator:** Creates 5 multiple-choice questions with options, correct answers, and scores.
- **AI Flashcards:** Generates interactive flashcards with front and back content.
- **Flip Flashcards:** Click on a flashcard to reveal its answer.
- **Study History:** Saves previous generations using browser LocalStorage.
- **Copy to Clipboard:** Copies generated summaries.
- **Download Summary:** Downloads summaries as text files.
- **Loading Indicator:** Displays loading status while AI generates content.
- **Dark / Light Mode:** Switches between dark and light themes.
- **Responsive Design:** Works on desktop, tablets, and mobile devices.
- **API Key Settings:** Allows users to enter and save their own API key.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Webpage structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application functionality |
| AI API | AI-generated study materials |
| Fetch API | Sending HTTP POST requests |
| Async / Await | Handling asynchronous operations |
| LocalStorage | Saving API settings, theme preferences, and history |

## 📂 Project Structure

```text
AI-Study-Assistant/
│
├── index.html
|
├── css/
│   └── styles.css
│
├── js/
│   ├── api.js
│   ├── app.js
│   └── storage.js
│
├── README.md
|
└── .gitignore
 
```

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-Study-Assistant.git
```

### 2. Open the Project Folder

```bash
cd AI-Study-Assistant
```

### 3. Run the Application

Open `index.html` in your web browser.

You can also use the Live Server extension in Visual Studio Code.

## 🔑 API Key Configuration

The application requires an API key from a supported AI provider.

Follow these steps:

1. Visit the official website of your chosen AI provider.
2. Create an account.
3. Generate an API key using the provider's available API access.
4. Open the AI Study Assistant.
5. Navigate to the Settings section.
6. Paste your API key into the API Key field.
7. Save the settings.
8. Enter your study notes or topic and click Generate.

**Important:** Never share your personal API key or upload it to GitHub. The application stores the user's own key locally in the browser using LocalStorage, as required by this project. Browser-side storage is not secure against malicious scripts or browser access, so use an API key with appropriate limits and permissions.

## ⚙️ How It Works

1. The student enters notes or a study topic.
2. JavaScript collects the input and API key.
3. The application sends a POST request to the selected AI provider using the Fetch API.
4. The AI processes the prompt and generates structured JSON.
5. JavaScript parses and validates the response.
6. The application displays the generated summary, quiz, and flashcards.
7. Previous generations are stored in LocalStorage for future access.

## 📱 Application Sections

- **Summary:** Displays AI-generated study notes.
- **Quiz:** Provides multiple-choice questions and calculates scores.
- **Flashcards:** Helps students revise important concepts.
- **History:** Displays previously generated study materials.
- **Settings:** Allows users to configure their API key and preferences.

## 🎯 Learning Objectives

Through this project, the following concepts are implemented:

- HTML structure and forms
- CSS layouts and responsive design
- JavaScript functions and objects
- DOM manipulation and events
- Arrays and JSON handling
- Fetch API and HTTP POST requests
- Async / Await and Promises
- Error handling using Try / Catch
- Browser LocalStorage
- AI API integration

## 🌐 Deployment

The application can be deployed using Vercel.

**Live Demo:** [Add Your Vercel Deployment Link Here]

**GitHub Repository:** [Add Your GitHub Repository Link Here]

## 🔮 Future Enhancements

- Support for uploading PDF study notes.
- Multiple AI provider support.
- More quiz difficulty levels.
- Additional languages.
- Improved progress tracking.
- Personalized study recommendations.

## 👨‍💻 Author

**Name:** Your Full Name  
**Department:** Computer Science and Engineering  
**Section:** B  
**Project:** Web Technology – Continuous Assessment Assignment 5

## 📄 License

This project is developed for educational purposes as part of the Web Technology Continuous Assessment Assignment.

---
