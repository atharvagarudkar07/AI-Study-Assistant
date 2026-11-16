/**
 * StudyCraft AI — Storage Module
 * Manages localStorage persistence for API keys, theme preferences, 
 * session history, and quiz progress tracking.
 */

const StorageKeys = {
  API_KEY: 'studycraft_api_key',
  PROVIDER: 'studycraft_provider',
  MODEL: 'studycraft_model',
  THEME: 'studycraft_theme',
  HISTORY: 'studycraft_history',
  QUIZ_STATS: 'studycraft_quiz_stats'
};

const StorageManager = {
  // --- API Configuration ---
  getApiKey() {
    return localStorage.getItem(StorageKeys.API_KEY) || '';
  },

  setApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem(StorageKeys.API_KEY, key.trim());
    } else {
      localStorage.removeItem(StorageKeys.API_KEY);
    }
  },

  removeApiKey() {
    localStorage.removeItem(StorageKeys.API_KEY);
  },

  getProvider() {
    return localStorage.getItem(StorageKeys.PROVIDER) || 'gemini';
  },

  setProvider(provider) {
    localStorage.setItem(StorageKeys.PROVIDER, provider);
  },

  getModel() {
    return localStorage.getItem(StorageKeys.MODEL) || 'gemini-2.0-flash';
  },

  setModel(model) {
    localStorage.setItem(StorageKeys.MODEL, model);
  },

  // --- Theme Management ---
  getTheme() {
    const saved = localStorage.getItem(StorageKeys.THEME);
    if (saved) return saved;
    // Default to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  },

  setTheme(theme) {
    localStorage.setItem(StorageKeys.THEME, theme);
    document.body.setAttribute('data-theme', theme);
  },

  // --- History Management ---
  getHistory() {
    try {
      const data = localStorage.getItem(StorageKeys.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to parse history from localStorage:', err);
      return [];
    }
  },

  saveHistoryItem(studyData) {
    try {
      const history = this.getHistory();
      const newItem = {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        topic: studyData.topic || 'Study Session',
        style: studyData.style || 'Standard',
        difficulty: studyData.difficulty || 'Medium',
        notesSnippet: studyData.rawNotes ? studyData.rawNotes.slice(0, 160) : '',
        rawNotes: studyData.rawNotes || '',
        data: studyData
      };
      
      // Store newest first, keep max 25 sessions to avoid localStorage quota limits
      const updated = [newItem, ...history.filter(item => item.id !== newItem.id)].slice(0, 25);
      localStorage.setItem(StorageKeys.HISTORY, JSON.stringify(updated));
      return newItem;
    } catch (err) {
      console.error('Failed to save session to history:', err);
      return null;
    }
  },

  getHistoryItemById(id) {
    const history = this.getHistory();
    return history.find(item => item.id === id) || null;
  },

  deleteHistoryItem(id) {
    try {
      const history = this.getHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(StorageKeys.HISTORY, JSON.stringify(filtered));
      return filtered;
    } catch (err) {
      console.error('Failed to delete history item:', err);
      return [];
    }
  },

  clearAllHistory() {
    localStorage.removeItem(StorageKeys.HISTORY);
  },

  searchHistory(query) {
    const history = this.getHistory();
    if (!query || !query.trim()) return history;
    const q = query.toLowerCase().trim();
    return history.filter(item => 
      (item.topic && item.topic.toLowerCase().includes(q)) ||
      (item.notesSnippet && item.notesSnippet.toLowerCase().includes(q))
    );
  },

  // --- Quiz Progress Tracker ---
  recordQuizScore(historyId, score, total) {
    try {
      const stats = this.getQuizStats();
      const entry = {
        historyId,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        date: new Date().toISOString()
      };
      stats.push(entry);
      localStorage.setItem(StorageKeys.QUIZ_STATS, JSON.stringify(stats.slice(-50)));
      return entry;
    } catch (err) {
      console.error('Failed to record quiz stats:', err);
    }
  },

  getQuizStats() {
    try {
      const stats = localStorage.getItem(StorageKeys.QUIZ_STATS);
      return stats ? JSON.parse(stats) : [];
    } catch (err) {
      return [];
    }
  }
};

// Built-in educational quick samples
const SampleNotes = {
  photosynthesis: `Photosynthesis is the biological process used by plants, algae, and cyanobacteria to convert light energy into chemical energy stored in glucose.
It takes place primarily in chloroplasts, which contain chlorophyll pigments that absorb blue and red light while reflecting green.
Equation: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2.
It occurs in two main stages:
1. Light-Dependent Reactions: Take place in thylakoid membranes. Solar photon absorption splits water (photolysis), releasing oxygen gas (O2) as a byproduct, and generates ATP and NADPH.
2. Light-Independent Reactions (Calvin Cycle): Take place in the stroma. Carbon dioxide is fixed by the enzyme RuBisCO, utilizing ATP and NADPH to synthesize high-energy sugars (G3P/glucose).
Factors affecting the rate include light intensity, carbon dioxide concentration, and ambient temperature.`,

  os_memory: `Operating System Memory Management coordinates and handles primary memory (RAM) allocation among running processes.
Key Concepts:
- Virtual Memory: Decouples physical hardware memory from logical process address spaces, giving each process the illusion of continuous memory.
- Paging: Memory allocation scheme where physical memory is divided into fixed-size frames and logical memory is divided into pages of identical size. The Memory Management Unit (MMU) with the Page Table maps virtual pages to physical frames.
- Page Fault: An interrupt generated when an accessed page is not currently present in RAM and must be brought in from secondary disk storage.
- Page Replacement Algorithms: FIFO, Least Recently Used (LRU), and Optimal (OPT).
- Thrashing: A state where the CPU spends more time swapping pages in and out of disk than executing instructions due to excessive page faults.
- Internal vs External Fragmentation: Internal occurs when memory allocated exceeds memory needed inside a partition; external occurs when free memory is broken into chunks too small for incoming processes.`,

  french_rev: `The French Revolution (1789–1799) transformed France from an absolute monarchy into a republic and reshaped modern European politics.
Causes:
- Social Inequality: The Ancien Régime was divided into Three Estates: Clergy (1st), Nobility (2nd), and Commoners (3rd Estate, making up 98% of the population yet bearing the heavy tax burden).
- Economic Crisis: France faced crippling debt from supporting the American Revolution and King Louis XVI's extravagant spending, exacerbated by severe crop failures and bread shortages.
- Enlightenment Ideas: Thinkers like Rousseau, Voltaire, and Montesquieu questioned divine right of kings and advocated for liberty, equality, and popular sovereignty.
Major Events:
- 1789: Convocation of Estates-General, Tennis Court Oath, Storming of the Bastille (July 14), and Declaration of the Rights of Man and of the Citizen.
- 1792: Proclamation of the First Republic and execution of King Louis XVI and Marie Antoinette.
- 1793–1794: Reign of Terror led by Maximilien Robespierre and the Committee of Public Safety.
- 1799: Coup of 18 Brumaire by Napoleon Bonaparte ending the revolution.`
};
