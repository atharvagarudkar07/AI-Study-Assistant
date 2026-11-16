/**
 * StudyCraft AI — Main UI Controller
 * Integrates storage, API communication, DOM rendering, audio synthesis, 
 * interactive quiz grading, and 3D flashcard manipulation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // DOM Elements Cache
  // ==========================================================================
  const elements = {
    // Theme & Navigation
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.querySelector('.theme-icon'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    settingsOverlay: document.getElementById('settingsOverlay'),
    keyStatusIndicator: document.getElementById('keyStatusIndicator'),
    
    // History Drawer
    openHistoryBtn: document.getElementById('openHistoryBtn'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    historyDrawer: document.getElementById('historyDrawer'),
    historyOverlay: document.getElementById('historyOverlay'),
    historyBadge: document.getElementById('historyBadge'),
    historyList: document.getElementById('historyList'),
    historySearchInput: document.getElementById('historySearchInput'),
    historyTotalCount: document.getElementById('historyTotalCount'),
    clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),

    // Input Form & Controls
    studyForm: document.getElementById('studyForm'),
    notesInput: document.getElementById('notesInput'),
    charCounter: document.getElementById('charCounter'),
    charWarning: document.getElementById('charWarning'),
    studyStyleSelect: document.getElementById('studyStyleSelect'),
    quizDifficultySelect: document.getElementById('quizDifficultySelect'),
    numCardsSelect: document.getElementById('numCardsSelect'),
    generateBtn: document.getElementById('generateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    sampleChips: document.querySelectorAll('.sample-chip'),

    // Settings Form
    apiProviderSelect: document.getElementById('apiProviderSelect'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    apiKeyGroup: document.getElementById('apiKeyGroup'),
    modelSelect: document.getElementById('modelSelect'),
    modelSelectGroup: document.getElementById('modelSelectGroup'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    removeApiKeyBtn: document.getElementById('removeApiKeyBtn'),
    toggleKeyVisibilityBtn: document.getElementById('toggleKeyVisibilityBtn'),

    // Loading & Results
    loadingSection: document.getElementById('loadingSection'),
    loadingStatusText: document.getElementById('loadingStatusText'),
    resultsSection: document.getElementById('resultsSection'),
    
    // Tabs
    tabSummary: document.getElementById('tabSummary'),
    tabQuiz: document.getElementById('tabQuiz'),
    tabFlashcards: document.getElementById('tabFlashcards'),
    panelSummary: document.getElementById('panelSummary'),
    panelQuiz: document.getElementById('panelQuiz'),
    panelFlashcards: document.getElementById('panelFlashcards'),
    quizBadge: document.getElementById('quizBadge'),
    cardsBadge: document.getElementById('cardsBadge'),

    // Summary Section
    summaryTopicTitle: document.getElementById('summaryTopicTitle'),
    summaryMetaBadge: document.getElementById('summaryMetaBadge'),
    summaryBody: document.getElementById('summaryBody'),
    copySummaryBtn: document.getElementById('copySummaryBtn'),
    downloadSummaryBtn: document.getElementById('downloadSummaryBtn'),
    ttsPlayBtn: document.getElementById('ttsPlayBtn'),
    ttsIcon: document.getElementById('ttsIcon'),
    ttsText: document.getElementById('ttsText'),
    ttsControls: document.getElementById('ttsControls'),
    ttsPauseBtn: document.getElementById('ttsPauseBtn'),
    ttsStopBtn: document.getElementById('ttsStopBtn'),

    // Quiz Section
    quizContainer: document.getElementById('quizContainer'),
    quizScoreDisplay: document.getElementById('quizScoreDisplay'),
    quizPercentageDisplay: document.getElementById('quizPercentageDisplay'),
    submitQuizBtn: document.getElementById('submitQuizBtn'),
    retakeQuizBtn: document.getElementById('retakeQuizBtn'),

    // Flashcards Section
    activeFlashcard: document.getElementById('activeFlashcard'),
    cardFrontText: document.getElementById('cardFrontText'),
    cardBackText: document.getElementById('cardBackText'),
    prevCardBtn: document.getElementById('prevCardBtn'),
    nextCardBtn: document.getElementById('nextCardBtn'),
    cardCounter: document.getElementById('cardCounter'),
    flipCardBtn: document.getElementById('flipCardBtn'),
    markKnownBtn: document.getElementById('markKnownBtn'),
    markUnknownBtn: document.getElementById('markUnknownBtn'),
    knownCount: document.getElementById('knownCount'),
    learningCount: document.getElementById('learningCount'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================================================
  // Application State
  // ==========================================================================
  let currentStudyData = null;
  let currentSessionId = null;
  let quizUserAnswers = {}; // { questionIndex: selectedOptionIndex }
  let quizGraded = false;
  let currentCardIndex = 0;
  let flashcardMastery = {}; // { cardIndex: 'known' | 'learning' }
  let speechUtterance = null;
  let isSpeechSpeaking = false;

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    // Apply saved theme
    const savedTheme = StorageManager.getTheme();
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Initialize API settings
    const savedKey = StorageManager.getApiKey();
    elements.apiKeyInput.value = savedKey;
    elements.apiProviderSelect.value = StorageManager.getProvider();
    elements.modelSelect.value = StorageManager.getModel();
    updateApiKeyStatusIndicator();
    updateProviderVisibility(elements.apiProviderSelect.value);

    // Update history count badge
    updateHistoryBadge();

    // Event listeners
    attachEventListeners();
  }

  // ==========================================================================
  // Theme Toggle
  // ==========================================================================
  function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    StorageManager.setTheme(newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
  }

  function updateThemeIcon(theme) {
    if (elements.themeIcon) {
      elements.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ==========================================================================
  // API Key Status & Settings Modal
  // ==========================================================================
  function updateApiKeyStatusIndicator() {
    const provider = StorageManager.getProvider();
    const hasKey = !!StorageManager.getApiKey();
    
    if (provider === 'mock') {
      elements.keyStatusIndicator.className = 'status-dot active';
      elements.keyStatusIndicator.title = 'Demo Mock Mode Active (No Key Required)';
    } else if (hasKey) {
      elements.keyStatusIndicator.className = 'status-dot active';
      elements.keyStatusIndicator.title = 'API Key Configured';
    } else {
      elements.keyStatusIndicator.className = 'status-dot warning';
      elements.keyStatusIndicator.title = 'API Key Missing — Click Settings';
    }
  }

  function openSettings() {
    elements.apiKeyInput.value = StorageManager.getApiKey();
    elements.apiProviderSelect.value = StorageManager.getProvider();
    elements.modelSelect.value = StorageManager.getModel();
    updateProviderVisibility(elements.apiProviderSelect.value);
    elements.settingsModal.classList.remove('hidden');
  }

  function closeSettings() {
    elements.settingsModal.classList.add('hidden');
  }

  function saveSettings() {
    const provider = elements.apiProviderSelect.value;
    const key = elements.apiKeyInput.value.trim();
    const model = elements.modelSelect.value;

    StorageManager.setProvider(provider);
    StorageManager.setModel(model);
    StorageManager.setApiKey(key);

    updateApiKeyStatusIndicator();
    closeSettings();
    showToast('Settings saved successfully!', 'success');
  }

  function removeApiKey() {
    StorageManager.removeApiKey();
    elements.apiKeyInput.value = '';
    updateApiKeyStatusIndicator();
    showToast('API Key removed.', 'info');
  }

  function updateProviderVisibility(provider) {
    if (provider === 'mock') {
      elements.apiKeyGroup.style.display = 'none';
      elements.modelSelectGroup.style.display = 'none';
    } else if (provider === 'gemini') {
      elements.apiKeyGroup.style.display = 'block';
      elements.modelSelectGroup.style.display = 'block';
    } else {
      elements.apiKeyGroup.style.display = 'block';
      elements.modelSelectGroup.style.display = 'none';
    }
  }

  // ==========================================================================
  // Textarea Character Counter & Quick Samples
  // ==========================================================================
  function updateCharCount() {
    const length = elements.notesInput.value.length;
    elements.charCounter.textContent = `${length.toLocaleString()} characters`;

    if (length > 4000) {
      elements.charWarning.classList.remove('hidden');
    } else {
      elements.charWarning.classList.add('hidden');
    }
  }

  function loadSampleNote(sampleKey) {
    if (SampleNotes[sampleKey]) {
      elements.notesInput.value = SampleNotes[sampleKey];
      updateCharCount();
      elements.notesInput.focus();
      showToast(`Loaded sample: ${sampleKey}`, 'info');
    }
  }

  // ==========================================================================
  // Form Submission & AI Generation
  // ==========================================================================
  async function handleStudyFormSubmit(e) {
    e.preventDefault();

    const notes = elements.notesInput.value.trim();
    if (!notes) {
      showToast('Please type or paste some notes or a topic!', 'warning');
      elements.notesInput.focus();
      return;
    }

    const provider = StorageManager.getProvider();
    const apiKey = StorageManager.getApiKey();

    if (provider !== 'mock' && !apiKey) {
      showToast('API Key is missing! Opening settings...', 'warning');
      openSettings();
      return;
    }

    // Set UI to loading state
    setGeneratingState(true);

    try {
      const options = {
        provider,
        apiKey,
        style: elements.studyStyleSelect.value,
        difficulty: elements.quizDifficultySelect.value,
        cardCount: elements.numCardsSelect.value,
        model: StorageManager.getModel()
      };

      // Call API
      const result = await ApiManager.generateStudyKit(notes, options);

      // Attach metadata
      result.rawNotes = notes;
      result.style = elements.studyStyleSelect.value;
      result.difficulty = elements.quizDifficultySelect.value;

      // Save to localStorage history
      const savedHistoryItem = StorageManager.saveHistoryItem(result);
      currentSessionId = savedHistoryItem ? savedHistoryItem.id : null;
      updateHistoryBadge();

      // Render the study kit
      renderStudyKit(result);

      showToast('Study Kit generated successfully! 🎉', 'success');

      // Smooth scroll to results
      elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      console.error('Generation failed:', err);
      if (err.code === 'NO_API_KEY') {
        openSettings();
      }
      showToast(err.message || 'An error occurred while generating study material.', 'error');
    } finally {
      setGeneratingState(false);
    }
  }

  function setGeneratingState(isGenerating) {
    elements.generateBtn.disabled = isGenerating;
    const btnText = elements.generateBtn.querySelector('.btn-text');
    const btnSpinner = elements.generateBtn.querySelector('.btn-spinner');

    if (isGenerating) {
      btnText.textContent = 'Generating...';
      btnSpinner.classList.remove('hidden');
      elements.loadingSection.classList.remove('hidden');
      elements.resultsSection.classList.add('hidden');
      // Stop ongoing TTS
      stopSpeech();
    } else {
      btnText.textContent = '🚀 Generate Study Kit';
      btnSpinner.classList.add('hidden');
      elements.loadingSection.classList.add('hidden');
    }
  }

  // ==========================================================================
  // Render Study Kit Components
  // ==========================================================================
  function renderStudyKit(data) {
    currentStudyData = data;
    elements.resultsSection.classList.remove('hidden');

    // 1. Render Summary
    renderSummary(data.summary, data.topic, data.style);

    // 2. Render Quiz
    renderQuiz(data.quiz);

    // 3. Render Flashcards
    renderFlashcards(data.flashcards);

    // Default to summary tab
    switchTab('summary');
  }

  // --- 1. Summary Rendering ---
  function renderSummary(summary, topic, style) {
    elements.summaryTopicTitle.textContent = topic || 'Summary Overview';
    elements.summaryMetaBadge.textContent = `${(style || 'Standard').toUpperCase()} STYLE`;

    let html = '';
    
    // Format overview with paragraph breaks
    if (summary.overview) {
      const paragraphs = summary.overview.split('\n\n');
      paragraphs.forEach(p => {
        if (p.trim()) {
          html += `<p style="margin-bottom: 0.85rem;">${escapeHtml(p.trim())}</p>`;
        }
      });
    }

    // Key Takeaways bullets
    if (Array.isArray(summary.keyTakeaways) && summary.keyTakeaways.length > 0) {
      html += `
        <div class="summary-keypoints">
          <h5>🎯 Core Key Takeaways</h5>
          <ul>
            ${summary.keyTakeaways.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    elements.summaryBody.innerHTML = html;
  }

  function copySummaryToClipboard() {
    if (!currentStudyData || !currentStudyData.summary) return;

    const summaryText = buildPlainSummaryText(currentStudyData);
    navigator.clipboard.writeText(summaryText)
      .then(() => {
        const originalText = elements.copySummaryBtn.innerHTML;
        elements.copySummaryBtn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          elements.copySummaryBtn.innerHTML = originalText;
        }, 2000);
        showToast('Summary copied to clipboard!', 'success');
      })
      .catch(() => {
        showToast('Failed to copy. Please select text manually.', 'error');
      });
  }

  function downloadSummaryTextFile() {
    if (!currentStudyData || !currentStudyData.summary) return;

    const summaryText = buildPlainSummaryText(currentStudyData);
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTopic = (currentStudyData.topic || 'study-summary').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${safeTopic}-notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Summary downloaded as text file!', 'success');
  }

  function buildPlainSummaryText(data) {
    let text = `STUDYCRAFT AI — STUDY SUMMARY\n`;
    text += `Topic: ${data.topic || 'General'}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n`;
    text += `=========================================\n\n`;
    text += `OVERVIEW:\n${data.summary.overview}\n\n`;
    if (data.summary.keyTakeaways && data.summary.keyTakeaways.length > 0) {
      text += `KEY TAKEAWAYS:\n`;
      data.summary.keyTakeaways.forEach((k, idx) => {
        text += `• ${k}\n`;
      });
    }
    return text;
  }

  // --- Text to Speech (TTS) ---
  function toggleSpeech() {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported by your browser.', 'warning');
      return;
    }

    if (isSpeechSpeaking) {
      stopSpeech();
    } else {
      startSpeech();
    }
  }

  function startSpeech() {
    if (!currentStudyData || !currentStudyData.summary) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const plainText = `${currentStudyData.topic}. ${currentStudyData.summary.overview}`;
    speechUtterance = new SpeechSynthesisUtterance(plainText);
    speechUtterance.rate = 1.0;
    speechUtterance.pitch = 1.0;

    speechUtterance.onstart = () => {
      isSpeechSpeaking = true;
      elements.ttsIcon.textContent = '⏹️';
      elements.ttsText.textContent = 'Stop';
      elements.ttsControls.classList.remove('hidden');
    };

    speechUtterance.onend = () => {
      resetSpeechUI();
    };

    speechUtterance.onerror = () => {
      resetSpeechUI();
    };

    window.speechSynthesis.speak(speechUtterance);
  }

  function pauseSpeech() {
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        elements.ttsPauseBtn.textContent = 'Pause';
      } else {
        window.speechSynthesis.pause();
        elements.ttsPauseBtn.textContent = 'Resume';
      }
    }
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    resetSpeechUI();
  }

  function resetSpeechUI() {
    isSpeechSpeaking = false;
    elements.ttsIcon.textContent = '🔊';
    elements.ttsText.textContent = 'Read Aloud';
    elements.ttsControls.classList.add('hidden');
    elements.ttsPauseBtn.textContent = 'Pause';
  }

  // --- 2. Quiz Rendering & Grading ---
  function renderQuiz(questions) {
    quizUserAnswers = {};
    quizGraded = false;

    elements.quizBadge.textContent = `${questions.length} Qs`;
    elements.quizScoreDisplay.textContent = `— / ${questions.length}`;
    elements.quizPercentageDisplay.textContent = '—%';
    elements.retakeQuizBtn.classList.add('hidden');
    elements.submitQuizBtn.classList.remove('hidden');
    elements.submitQuizBtn.disabled = false;

    let html = '';
    const letters = ['A', 'B', 'C', 'D'];

    questions.forEach((q, qIdx) => {
      html += `
        <div class="question-card" data-q-index="${qIdx}">
          <span class="question-num-tag">Question ${qIdx + 1} of ${questions.length}</span>
          <p class="question-text">${escapeHtml(q.question)}</p>
          <div class="options-list">
            ${q.options.map((opt, optIdx) => `
              <div class="option-item" data-q="${qIdx}" data-opt="${optIdx}">
                <span class="option-letter">${letters[optIdx] || optIdx + 1}</span>
                <span class="option-content">${escapeHtml(opt)}</span>
              </div>
            `).join('')}
          </div>
          <div class="explanation-box hidden" id="explanation_${qIdx}">
            💡 <strong>Explanation:</strong> ${escapeHtml(q.explanation || 'Review the summary for full context.')}
          </div>
        </div>
      `;
    });

    elements.quizContainer.innerHTML = html;

    // Attach click events to options
    elements.quizContainer.querySelectorAll('.option-item').forEach(optionEl => {
      optionEl.addEventListener('click', () => {
        if (quizGraded) return; // Cannot modify after submission
        const qIndex = parseInt(optionEl.getAttribute('data-q'), 10);
        const optIndex = parseInt(optionEl.getAttribute('data-opt'), 10);

        // Deselect siblings
        const parentCard = optionEl.closest('.question-card');
        parentCard.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));

        // Select current
        optionEl.classList.add('selected');
        quizUserAnswers[qIndex] = optIndex;
      });
    });
  }

  function submitQuiz() {
    if (!currentStudyData || !currentStudyData.quiz) return;

    const questions = currentStudyData.quiz;
    const answeredCount = Object.keys(quizUserAnswers).length;

    if (answeredCount < questions.length) {
      if (!confirm(`You have answered ${answeredCount} of ${questions.length} questions. Check answers now anyway?`)) {
        return;
      }
    }

    quizGraded = true;
    let correctCount = 0;

    questions.forEach((q, qIdx) => {
      const card = elements.quizContainer.querySelector(`[data-q-index="${qIdx}"]`);
      const options = card.querySelectorAll('.option-item');
      const chosenOptIndex = quizUserAnswers[qIdx];
      const correctOptIndex = q.correctIndex;

      options.forEach((optEl, optIdx) => {
        optEl.classList.add('locked');

        // Highlight correct option in green
        if (optIdx === correctOptIndex) {
          optEl.classList.add('correct');
        }

        // Highlight selected incorrect option in red
        if (chosenOptIndex === optIdx && optIdx !== correctOptIndex) {
          optEl.classList.add('incorrect');
        }
      });

      if (chosenOptIndex === correctOptIndex) {
        correctCount++;
      }

      // Show explanation
      const expBox = document.getElementById(`explanation_${qIdx}`);
      if (expBox) expBox.classList.remove('hidden');
    });

    // Update stats display
    const percentage = Math.round((correctCount / questions.length) * 100);
    elements.quizScoreDisplay.textContent = `${correctCount} / ${questions.length}`;
    elements.quizPercentageDisplay.textContent = `${percentage}%`;

    // Save to quiz stats
    StorageManager.recordQuizScore(currentSessionId, correctCount, questions.length);

    elements.submitQuizBtn.classList.add('hidden');
    elements.retakeQuizBtn.classList.remove('hidden');

    if (percentage >= 80) {
      showToast(`Outstanding! You scored ${correctCount}/${questions.length} (${percentage}%) 🌟`, 'success');
    } else if (percentage >= 60) {
      showToast(`Good job! You scored ${correctCount}/${questions.length} (${percentage}%) 👍`, 'info');
    } else {
      showToast(`Keep practicing! You scored ${correctCount}/${questions.length} (${percentage}%) 📚`, 'warning');
    }
  }

  function retakeQuiz() {
    if (currentStudyData && currentStudyData.quiz) {
      renderQuiz(currentStudyData.quiz);
      elements.quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- 3. Flashcards Rendering & 3D Flip ---
  function renderFlashcards(cards) {
    if (!Array.isArray(cards) || cards.length === 0) return;

    currentCardIndex = 0;
    flashcardMastery = {};
    elements.cardsBadge.textContent = `${cards.length}`;

    updateFlashcardView();
    updateMasteryCounters();
  }

  function updateFlashcardView() {
    const cards = currentStudyData.flashcards;
    const card = cards[currentCardIndex];

    // Reset card rotation without animation transition glitch
    elements.activeFlashcard.classList.remove('flipped');

    elements.cardFrontText.textContent = card.front;
    elements.cardBackText.textContent = card.back;
    elements.cardCounter.textContent = `Card ${currentCardIndex + 1} of ${cards.length}`;

    elements.prevCardBtn.disabled = currentCardIndex === 0;
    elements.nextCardBtn.disabled = currentCardIndex === cards.length - 1;
  }

  function flipActiveCard() {
    elements.activeFlashcard.classList.toggle('flipped');
  }

  function nextFlashcard() {
    if (currentCardIndex < currentStudyData.flashcards.length - 1) {
      currentCardIndex++;
      updateFlashcardView();
    }
  }

  function prevFlashcard() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateFlashcardView();
    }
  }

  function markCurrentCard(status) {
    flashcardMastery[currentCardIndex] = status;
    updateMasteryCounters();

    // Auto-advance to next card if available
    if (currentCardIndex < currentStudyData.flashcards.length - 1) {
      setTimeout(() => {
        nextFlashcard();
      }, 250);
    }
  }

  function updateMasteryCounters() {
    let known = 0;
    let learning = 0;
    const total = currentStudyData?.flashcards?.length || 0;

    Object.values(flashcardMastery).forEach(v => {
      if (v === 'known') known++;
      if (v === 'learning') learning++;
    });

    elements.knownCount.textContent = known;
    elements.learningCount.textContent = learning;
  }

  // ==========================================================================
  // Tabs Navigation
  // ==========================================================================
  function switchTab(tabName) {
    const tabs = [
      { name: 'summary', btn: elements.tabSummary, panel: elements.panelSummary },
      { name: 'quiz', btn: elements.tabQuiz, panel: elements.panelQuiz },
      { name: 'flashcards', btn: elements.tabFlashcards, panel: elements.panelFlashcards }
    ];

    tabs.forEach(t => {
      if (t.name === tabName) {
        t.btn.classList.add('active');
        t.btn.setAttribute('aria-selected', 'true');
        t.panel.classList.remove('hidden');
      } else {
        t.btn.classList.remove('active');
        t.btn.setAttribute('aria-selected', 'false');
        t.panel.classList.add('hidden');
      }
    });
  }

  // ==========================================================================
  // History Drawer
  // ==========================================================================
  function openHistory() {
    renderHistoryList();
    elements.historyDrawer.classList.remove('hidden');
  }

  function closeHistory() {
    elements.historyDrawer.classList.add('hidden');
  }

  function updateHistoryBadge() {
    const history = StorageManager.getHistory();
    elements.historyBadge.textContent = history.length;
    elements.historyTotalCount.textContent = `${history.length} saved sessions`;
  }

  function renderHistoryList(filterQuery = '') {
    const items = filterQuery 
      ? StorageManager.searchHistory(filterQuery) 
      : StorageManager.getHistory();

    if (items.length === 0) {
      elements.historyList.innerHTML = `
        <div class="empty-history-notice">
          ${filterQuery ? 'No matching study sessions found.' : 'No saved study sessions yet.<br>Generate study materials to populate your history!'}
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(item => {
      const dateFormatted = new Date(item.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      html += `
        <div class="history-item-card" data-history-id="${item.id}">
          <div class="history-item-top">
            <span class="history-item-topic">${escapeHtml(item.topic)}</span>
            <span class="history-item-date">${dateFormatted}</span>
          </div>
          <div class="history-item-snippet">${escapeHtml(item.notesSnippet || 'Study session notes...')}</div>
          <div class="history-item-actions">
            <span class="meta-badge">${item.style || 'Standard'}</span>
            <button class="history-delete-btn" data-delete-id="${item.id}" title="Delete this session">🗑️ Delete</button>
          </div>
        </div>
      `;
    });

    elements.historyList.innerHTML = html;

    // Attach click events
    elements.historyList.querySelectorAll('.history-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent trigger if clicking delete button
        if (e.target.closest('.history-delete-btn')) return;

        const id = card.getAttribute('data-history-id');
        restoreHistorySession(id);
      });
    });

    elements.historyList.querySelectorAll('.history-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        StorageManager.deleteHistoryItem(id);
        updateHistoryBadge();
        renderHistoryList(elements.historySearchInput.value);
        showToast('Study session deleted.', 'info');
      });
    });
  }

  function restoreHistorySession(id) {
    const item = StorageManager.getHistoryItemById(id);
    if (!item || !item.data) {
      showToast('Could not load session data.', 'error');
      return;
    }

    currentSessionId = item.id;
    elements.notesInput.value = item.rawNotes || '';
    updateCharCount();

    renderStudyKit(item.data);
    closeHistory();
    showToast(`Restored session: "${item.topic}"`, 'info');
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  function clearAllHistory() {
    if (confirm('Are you sure you want to delete all study history? This cannot be undone.')) {
      StorageManager.clearAllHistory();
      updateHistoryBadge();
      renderHistoryList();
      showToast('All study history deleted.', 'info');
    }
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 200);
    }, 3800);
  }

  // Helper: HTML Escaping
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // Attach Event Listeners
  // ==========================================================================
  function attachEventListeners() {
    // Theme
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Settings Modal
    elements.openSettingsBtn.addEventListener('click', openSettings);
    elements.closeSettingsBtn.addEventListener('click', closeSettings);
    elements.settingsOverlay.addEventListener('click', closeSettings);
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
    elements.removeApiKeyBtn.addEventListener('click', removeApiKey);
    elements.apiProviderSelect.addEventListener('change', (e) => {
      updateProviderVisibility(e.target.value);
    });
    elements.toggleKeyVisibilityBtn.addEventListener('click', () => {
      const type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
      elements.apiKeyInput.type = type;
      elements.toggleKeyVisibilityBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // History Drawer
    elements.openHistoryBtn.addEventListener('click', openHistory);
    elements.closeHistoryBtn.addEventListener('click', closeHistory);
    elements.historyOverlay.addEventListener('click', closeHistory);
    elements.clearAllHistoryBtn.addEventListener('click', clearAllHistory);
    elements.historySearchInput.addEventListener('input', (e) => {
      renderHistoryList(e.target.value);
    });

    // Input Form & Samples
    elements.notesInput.addEventListener('input', updateCharCount);
    elements.studyForm.addEventListener('submit', handleStudyFormSubmit);
    elements.clearBtn.addEventListener('click', () => {
      elements.notesInput.value = '';
      updateCharCount();
      elements.notesInput.focus();
    });

    elements.sampleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const sampleKey = chip.getAttribute('data-sample');
        loadSampleNote(sampleKey);
      });
    });

    // Tabs
    elements.tabSummary.addEventListener('click', () => switchTab('summary'));
    elements.tabQuiz.addEventListener('click', () => switchTab('quiz'));
    elements.tabFlashcards.addEventListener('click', () => switchTab('flashcards'));

    // Summary Actions
    elements.copySummaryBtn.addEventListener('click', copySummaryToClipboard);
    elements.downloadSummaryBtn.addEventListener('click', downloadSummaryTextFile);
    elements.ttsPlayBtn.addEventListener('click', toggleSpeech);
    elements.ttsPauseBtn.addEventListener('click', pauseSpeech);
    elements.ttsStopBtn.addEventListener('click', stopSpeech);

    // Quiz Actions
    elements.submitQuizBtn.addEventListener('click', submitQuiz);
    elements.retakeQuizBtn.addEventListener('click', retakeQuiz);

    // Flashcards Actions
    elements.activeFlashcard.addEventListener('click', flipActiveCard);
    elements.flipCardBtn.addEventListener('click', flipActiveCard);
    elements.nextCardBtn.addEventListener('click', nextFlashcard);
    elements.prevCardBtn.addEventListener('click', prevFlashcard);
    elements.markKnownBtn.addEventListener('click', () => markCurrentCard('known'));
    elements.markUnknownBtn.addEventListener('click', () => markCurrentCard('learning'));

    // Keyboard Shortcuts for Flashcards
    document.addEventListener('keydown', (e) => {
      // Only trigger if Flashcards tab is visible and no input has focus
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') return;

      if (!elements.panelFlashcards.classList.contains('hidden')) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          flipActiveCard();
        } else if (e.key === 'ArrowRight') {
          nextFlashcard();
        } else if (e.key === 'ArrowLeft') {
          prevFlashcard();
        }
      }
    });
  }

  // Launch Application
  init();
});
