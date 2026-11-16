/**
 * StudyCraft AI — API & AI Integration Module
 * Handles prompt engineering, network requests via fetch(), HTTP error management,
 * and JSON response validation.
 */

const ApiManager = {
  
  /**
   * Constructs the structured system instruction and user prompt.
   * Directs the AI to strictly return a valid JSON object matching our schema.
   */
  buildPrompt(notes, style = 'balanced', difficulty = 'medium', cardCount = 5) {
    const styleDescriptions = {
      balanced: 'Clear, concise, and well-structured with key points highlighted.',
      child: 'Extremely simple terms, fun analogies, and intuitive explanations as if explaining to a 10-year-old.',
      exam: 'High-yield bullet points, core definitions, formulas/dates, and common exam pitfalls.',
      detailed: 'Comprehensive deep dive with architectural context, theoretical nuances, and exhaustive breakdown.'
    };

    const difficultyDescriptions = {
      easy: 'Direct factual recall and foundational definitions.',
      medium: 'Conceptual understanding, application of principles, and scenario-based queries.',
      hard: 'Complex analysis, subtle edge cases, and multi-step deduction.'
    };

    return `
You are an expert academic tutor and study material creator.
Analyze the following notes or topic provided by the student, and generate a comprehensive study kit.

=== INPUT NOTES / TOPIC ===
${notes}
=== END INPUT ===

STUDY REQUIREMENTS:
1. Summary Style: ${styleDescriptions[style] || styleDescriptions.balanced}
2. Quiz Difficulty: ${difficultyDescriptions[difficulty] || difficultyDescriptions.medium}
3. Flashcards: Generate exactly ${cardCount} high-impact flashcards.
4. Quiz Questions: Generate exactly 5 multiple-choice questions. Each question must have 4 options (labeled A, B, C, D) and specify the zero-based index of the correct option (0, 1, 2, or 3), plus a brief pedagogical explanation.

CRITICAL INSTRUCTION:
You MUST reply ONLY with a valid JSON object. Do not include markdown fences, backticks (\`\`\`json), or conversational preamble.
Your JSON must strictly adhere to this exact structure:
{
  "topic": "Concise 3 to 6 word title for this study session",
  "summary": {
    "overview": "A clear 2-3 paragraph summary following the requested style.",
    "keyTakeaways": [
      "Key bullet point 1",
      "Key bullet point 2",
      "Key bullet point 3",
      "Key bullet point 4"
    ]
  },
  "quiz": [
    {
      "question": "Question text here?",
      "options": [
        "First plausible option",
        "Second plausible option",
        "Third plausible option",
        "Fourth plausible option"
      ],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct."
    }
  ],
  "flashcards": [
    {
      "front": "Prompt or Question for Active Recall",
      "back": "Concise, memorable answer or explanation"
    }
  ]
}
`.trim();
  },

  /**
   * Main entry point: Calls the appropriate API based on user settings.
   */
  async generateStudyKit(notes, options = {}) {
    // 1. Validate Input
    if (!notes || !notes.trim()) {
      throw new Error('Please enter some notes or a topic before generating.');
    }

    let provider = options.provider || StorageManager.getProvider();
    let apiKey = (options.apiKey || StorageManager.getApiKey() || '').trim();
    // Sanitize any accidentally pasted surrounding quotes or backticks
    apiKey = apiKey.replace(/^["'`]|["'`]$/g, '').trim();

    const style = options.style || 'balanced';
    const difficulty = options.difficulty || 'medium';
    const cardCount = parseInt(options.cardCount || 5, 10);

    // 2. Check for Mock / Demo Mode
    if (provider === 'mock') {
      return await this.generateMockResponse(notes, style, difficulty, cardCount);
    }

    // 3. Validate API Key Presence
    if (!apiKey) {
      const err = new Error('API key is missing! Please click ⚙️ Settings and enter your free API key.');
      err.code = 'NO_API_KEY';
      throw err;
    }

    // Auto-detect provider if key format does not match current selection
    if (apiKey.startsWith('gsk_') && provider !== 'groq') {
      console.info('Detected Groq API key format (gsk_...). Auto-routing to Groq provider.');
      provider = 'groq';
      StorageManager.setProvider('groq');
    } else if (apiKey.startsWith('AIzaSy') && provider !== 'gemini') {
      console.info('Detected Google Gemini API key format (AIzaSy...). Auto-routing to Gemini provider.');
      provider = 'gemini';
      StorageManager.setProvider('gemini');
    }

    // 4. Verify Network Connection
    if (!navigator.onLine) {
      const err = new Error('You appear to be offline. Please check your internet connection and try again.');
      err.code = 'OFFLINE';
      throw err;
    }

    const prompt = this.buildPrompt(notes, style, difficulty, cardCount);

    // 5. Dispatch to selected provider
    if (provider === 'gemini') {
      return await this.callGeminiApi(prompt, apiKey, options.model || StorageManager.getModel());
    } else if (provider === 'groq') {
      return await this.callGroqApi(prompt, apiKey);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  },

  /**
   * Google Gemini API Integration using POST fetch()
   * Discovers authorized models directly from Google's v1beta endpoint,
   * guaranteeing compatibility with the student's specific Google AI Studio key.
   */
  async callGeminiApi(prompt, rawApiKey, initialModel = 'gemini-2.5-flash') {
    const apiKey = (rawApiKey || '').trim().replace(/^["'`]|["'`]$/g, '').trim();

    // 1. Discover authorized models for this specific API key
    let candidateModels = [];
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();

      if (listRes.ok && listData.models && Array.isArray(listData.models)) {
        // Extract all models supporting generateContent
        const supported = listData.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));

        // Rank models: flash models first (2.5 -> 2.0 -> 1.5 -> pro)
        const priorityOrder = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.5-pro', 'gemini-1.5-pro'];
        const selectedModel = (initialModel || '')
          .replace(/^models\//, '')
          .trim();
        const ranked = [];
        if (supported.includes(selectedModel)) {
          ranked.push(selectedModel);
        }
        
        // Add priority models that exist in the account
        priorityOrder.forEach(p => {
          if (supported.includes(p)) ranked.push(p);
        });

        // Add any remaining supported models
        supported.forEach(s => {
          if (!ranked.includes(s)) ranked.push(s);
        });

        if (ranked.length > 0) {
          candidateModels = ranked;
          console.info('Discovered authorized Gemini models for this key:', candidateModels);
        }
      } else if (listData.error) {
        // Immediate failure if Google explicitly reports key invalidity
        const code = listData.error.code || listRes.status;
        const msg = listData.error.message || 'Unknown error';
        if (code === 400 || code === 401 || code === 403) {
          throw new Error(`Google API Key Error (${code}): ${msg}. Please check your key at https://aistudio.google.com/app/apikey`);
        }
      }
    } catch (discoveryErr) {
      if (discoveryErr.message && discoveryErr.message.includes('Google API Key Error')) {
        throw discoveryErr;
      }
      console.warn('Dynamic model discovery failed, using fallback list:', discoveryErr.message);
    }

    // 2. Fallback candidate list if discovery was empty
    if (candidateModels.length === 0) {
      const cleanInitial = (initialModel || '').replace(/^models\//, '').trim();
      candidateModels = Array.from(new Set([
        cleanInitial,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.5-pro',
        'gemini-1.5-pro'
      ])).filter(Boolean);
    }

    let lastErrorDetail = '';

    // 3. Attempt generation using the best available model on v1beta
    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      // Attempt first with JSON mode, fallback to standard payload if model rejects mimeType
      const payloadsToTry = [
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
        },
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 }
        }
      ];

      for (const payload of payloadsToTry) {
        let response;
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } catch (networkErr) {
          console.error('Fetch network error:', networkErr);
          throw new Error('Network request failed. Please check your internet connection.');
        }

        if (response.ok) {
          const data = await response.json();
          console.log(`Gemini API successfully generated with "${model}":`, data);

          // Save working model for future calls
          if (typeof StorageManager !== 'undefined') {
            StorageManager.setModel(model);
          }

          let rawText = '';
          try {
            rawText = data.candidates[0].content.parts[0].text;
          } catch (e) {
            throw new Error('The AI returned an unexpected response structure. Please try again.');
          }

          return this.parseAndValidateResponse(rawText);
        }

        // Parse error message
        let errorBody = {};
        try {
          errorBody = await response.json();
        } catch (e) {}

        const msg = errorBody.error?.message || response.statusText;
        console.warn(`Gemini (${model}) returned ${response.status}:`, msg);
        lastErrorDetail = msg;

        // If key is invalid (400, 401, 403), stop immediately and inform user
        if (response.status === 401 || response.status === 403 || (response.status === 400 && msg.toLowerCase().includes('key'))) {
          throw new Error(`Authentication Error (${response.status}): ${msg}. Please re-check your API key in Settings.`);
        }

        // Stop immediately when the API quota is exceeded
        if (response.status === 429) {
          throw new Error(
            'Gemini API quota or rate limit exceeded. ' +  
            'Please check your Google AI Studio usage limits.'
            );
        }
        
        // Stop on server errors instead of repeatedly trying models
        if (response.status >= 500) {
          throw new Error(
            `Gemini server error (${response.status}): ${msg}`
          );
        }
        // Stop on other unsuccessful requests
        if (response.status !== 400 && response.status !== 404) {
          throw new Error(
            `Gemini API error (${response.status}): ${msg}`
          );
        }
        
        // If 404 Model Not Found, continue to next candidate
        if (response.status === 404) {
          break; // Break inner payload loop, try next model
        }
      }
    }

    // 4. If all candidate models failed
    throw new Error(`Gemini Generation Failed: ${lastErrorDetail || 'Could not connect to any authorized Gemini model. Please verify your API key in Google AI Studio or switch to Mock Mode in Settings.'}`);
  },

  /**
   * Groq Cloud API Integration (OpenAI-compatible chat completion endpoint)
   */
  async callGroqApi(prompt, apiKey) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an educational study assistant that outputs solely valid JSON matching the requested schema.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    };

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
      });
    } catch (networkErr) {
      console.error('Fetch network error:', networkErr);
      throw new Error('Network request failed. Please check your connection.');
    }

    if (!response.ok) {
      await this.handleHttpStatusErrors(response);
    }

    const data = await response.json();
    console.log('Groq API raw response:', data);

    let rawText = '';
    try {
      rawText = data.choices[0].message.content;
    } catch (e) {
      throw new Error('Groq returned an unexpected response structure.');
    }

    return this.parseAndValidateResponse(rawText);
  },

  /**
   * Granular HTTP Status Error Resolver
   */
  async handleHttpStatusErrors(response) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.error?.message || errorJson.message || JSON.stringify(errorJson);
    } catch (e) {
      errorDetail = response.statusText;
    }

    switch (response.status) {
      case 400:
        throw new Error(`Bad Request (400): ${errorDetail || 'The request payload was rejected by the AI provider.'}`);
      case 401:
      case 403:
        throw new Error(`Authentication Error (${response.status}): Your API key appears to be invalid or unauthorized. Please verify your key in Settings.`);
      case 404:
        throw new Error(`Model Not Found (404): The requested AI model is unavailable. Try choosing gemini-1.5-flash in Settings.`);
      case 429:
        throw new Error(`Rate Limit Exceeded (429): You have sent too many requests in a short period. Please wait a minute before trying again.`);
      case 500:
      case 502:
      case 503:
        throw new Error(`AI Server Error (${response.status}): The AI service is currently overloaded or experiencing downtime. Please retry in a moment.`);
      default:
        throw new Error(`API Error (${response.status}): ${errorDetail || 'An unexpected server error occurred.'}`);
    }
  },

  /**
   * Safely parses and strictly validates the AI's JSON output.
   * Strips any markdown fences (```json ... ```) if present.
   */
  parseAndValidateResponse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('AI returned an empty response.');
    }

    // Clean potential markdown formatting
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (jsonErr) {
      console.error('Failed to parse JSON. Raw reply was:\n', rawText);
      throw new Error('The AI generated an invalid JSON format. Please click Generate again to retry.');
    }

    // Validation Check 1: Summary existence
    if (!parsed.summary) {
      throw new Error('Validation failed: AI response is missing the "summary" section.');
    }
    if (typeof parsed.summary === 'string') {
      parsed.summary = { overview: parsed.summary, keyTakeaways: [] };
    } else if (!parsed.summary.overview) {
      throw new Error('Validation failed: AI summary does not contain an "overview" field.');
    }
    if (!Array.isArray(parsed.summary.keyTakeaways)) {
      parsed.summary.keyTakeaways = [];
    }

    // Validation Check 2: Quiz questions existence & structure
    if (!Array.isArray(parsed.quiz) || parsed.quiz.length === 0) {
      throw new Error('Validation failed: AI response is missing the "quiz" array.');
    }

    parsed.quiz.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(`Validation failed: Quiz question #${idx + 1} is missing valid question text or options.`);
      }
      if (
        !Number.isInteger(q.correctIndex) ||
        q.correctIndex < 0 ||
        q.correctIndex >= q.options.length
      ) {
        throw new Error(
          `Invalid correct answer index for question ${idx + 1}.`
        );
      }    
    });

    // Validation Check 3: Flashcards existence
    if (!Array.isArray(parsed.flashcards) || parsed.flashcards.length === 0) {
      throw new Error('Validation failed: AI response is missing the "flashcards" array.');
    }

    parsed.flashcards.forEach((card, idx) => {
      if (!card.front || !card.back) {
        throw new Error(`Validation failed: Flashcard #${idx + 1} must contain both a "front" and "back".`);
      }
    });

    // Provide default topic if absent
    if (!parsed.topic) {
      parsed.topic = 'Study Session';
    }

    return parsed;
  },

  /**
   * Mock / Demo Mode generator (simulates real AI with 1.2s realistic latency)
   * Perfect for testing UI, demo presentations, and grading without needing an API key!
   */
  async generateMockResponse(notes, style, difficulty, cardCount) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const topicWords = notes.trim().split(/\s+/).slice(0, 4).join(' ');
    const displayTopic = topicWords.length > 25 ? topicWords.slice(0, 25) + '...' : topicWords;

    return {
      topic: displayTopic || 'Topic Study Kit',
      summary: {
        overview: `This study kit synthesizes your notes on "${displayTopic}". It breaks down the core concepts into digestible principles, making complex mechanisms straightforward to understand and retain.\n\nRegularly reviewing these high-yield topics through active recall and spaced repetition will solidify these foundational concepts for long-term retention and exam success.`,
        keyTakeaways: [
          'Core foundational concepts form the basis of the entire theoretical framework.',
          'Understanding input/output mechanisms and dependencies prevents common errors.',
          'Practical application and scenario-testing reinforce theoretical definitions.',
          'Reviewing edge cases distinguishes proficient understanding from rote memorization.'
        ]
      },
      quiz: [
        {
          question: `What is the primary function or central objective discussed in ${displayTopic}?`,
          options: [
            'To coordinate and optimize fundamental processes efficiently',
            'To replace all legacy hardware implementations completely',
            'To bypass authentication and encryption protocols',
            'To act purely as an auxiliary logging framework'
          ],
          correctIndex: 0,
          explanation: 'The primary function is to optimize and coordinate processes according to foundational principles.'
        },
        {
          question: 'Which of the following factors most directly impacts the overall execution efficiency?',
          options: [
            'System resource allocation and input throughput',
            'The color palette of the graphical display',
            'The number of comments in source documentation',
            'The physical dimension of the device casing'
          ],
          correctIndex: 0,
          explanation: 'Resource allocation and input throughput directly dictate processing speed and system responsiveness.'
        },
        {
          question: 'What is a common pitfall or misconception regarding this topic?',
          options: [
            'Assuming default configurations are optimal for all workloads',
            'Reading instructions before system deployment',
            'Allocating sufficient memory headroom',
            'Implementing modular architectural separation'
          ], 
          correctIndex: 0,
          explanation: 'Default settings are general-purpose; critical workloads require tailored tuning.'
        },
        {
          question: 'In standard practice, which step is recommended immediately following data intake?',
          options: [
            'Validation, parsing, and structural verification',
            'Immediate permanent deletion of raw data',
            'Executing unverified commands directly in production',
            'Bypassing error-handling routines'
          ],
          correctIndex: 0,
          explanation: 'Input validation and structural verification ensure that downstream components receive sanitized data.'
        },
        {
          question: 'Why is active recall and testing prioritized in learning this material?',
          options: [
            'It strengthens neural pathways and long-term retention far better than passive reading',
            'It prevents the browser from using too much RAM',
            'It is required by browser security headers',
            'It eliminates the need for any future review'
          ],
          correctIndex: 0,
          explanation: 'Cognitive science demonstrates that active retrieval practice significantly enhances memory consolidation.'
        }
      ],
      flashcards: [
        {
          front: `What is the core definition of "${displayTopic}"?`,
          back: 'The systematic structure or process responsible for orchestrating key functions in this domain.'
        },
        {
          front: 'What are the two most critical components involved?',
          back: 'The input processing mechanism and the execution/evaluation pipeline.'
        },
        {
          front: 'What failure state occurs when resources are bottlenecked?',
          back: 'Performance degradation, increased latency, and potential starvation of dependent tasks.'
        },
        {
          front: 'How is consistency verified across states?',
          back: 'Through rigorous assertions, parity validation, and systematic testing.'
        },
        {
          front: 'What is the recommended best practice for long-term mastery?',
          back: 'Combine conceptual summarization with interactive retrieval practice and spaced repetition.'
        }
      ].slice(0, cardCount)
    };
  }
};
