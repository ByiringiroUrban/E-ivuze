import { GoogleGenerativeAI } from '@google/generative-ai';


const getApiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

let cachedApiKey = null;
let cachedClient = null;

const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  if (cachedClient && cachedApiKey === apiKey) return cachedClient;
  cachedApiKey = apiKey;
  cachedClient = new GoogleGenerativeAI(apiKey);
  return cachedClient;
};

const textModelCandidates = [
  'gemini-1.5-flash-latest',       // Primary: high daily quota (1500 RPD free tier)
  'models/gemini-1.5-flash-latest',// Fallback with prefix
  'gemini-1.5-pro-latest',         // Fallback: smarter but slower
  'gemini-2.0-flash',              // Reserve: only 20 RPD on free tier
  'models/gemini-2.0-flash'
];

export const getAvailableModels = () => [
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash ✓ (Recommended)', description: 'Best for daily use — high request quota. Ideal for clinical notes and suggestions.' },
  { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Most Intelligent)', description: 'Deeper reasoning and analysis. Use for complex multi-language tasks.' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Low Quota)', description: 'Fastest model but limited to 20 requests/day on free tier.' }
];

const embeddingModelCandidates = ['text-embedding-004'];

const disclaimerByLanguage = {
  en: 'This information is educational only and not a diagnosis. For medical advice, consult a licensed professional.',
  rw: "Aya makuru ni ay'inyigisho gusa kandi si isuzuma. Kugira ngo ubone inama z'ubuvuzi, vugana n'umuganga wemewe."
};

const emergencyPhrases = {
  en: [
    'chest pain',
    'trouble breathing',
    'difficulty breathing',
    'shortness of breath',
    'severe bleeding',
    'heavy bleeding',
    'confusion',
    'unconscious',
    'fainting',
    'seizure',
    'stroke',
    'suicidal',
    'cannot breathe'
  ],
  rw: [
    'ububabare mu gatuza',
    'guhumeka biragoranye',
    'ntabasha guhumeka',
    'amaraso menshi',
    'kuva amaraso menshi',
    'kuyoberwa',
    'gucika intege',
    'guta ubwenge',
    'igicuri'
  ]
};

export const getAiApiKey = () => getApiKey();

export const ensureDisclaimer = (text, language = 'en') => {
  const disclaimer = disclaimerByLanguage[language] || disclaimerByLanguage.en;
  const base = (text || '').trim();
  if (!base) return disclaimer;

  const normalized = base.toLowerCase();
  const alreadyHasDisclaimer =
    normalized.includes('educational only') ||
    normalized.includes('not a diagnosis') ||
    normalized.includes("ay'inyigisho") ||
    normalized.includes('si isuzuma');

  if (alreadyHasDisclaimer) return base;
  return `${base}\n\n${disclaimer}`;
};

export const isEmergencyText = (text, language = 'en') => {
  const t = (text || '').toLowerCase();
  const phrases = emergencyPhrases[language] || emergencyPhrases.en;
  return phrases.some(p => t.includes(p));
};

export const getEmergencyMessage = (language = 'en') => {
  if (language === 'rw') {
    return "Ibimenyetso byawe bisa n'ibishobora kuba bikomeye. Niba ufite ububabare mu gatuza, guhumeka bigoranye, kuva amaraso menshi, kuyoberwa, primarygwa guta ubwenge, shaka ubuvuzi bwihuse nonaha (hamagara serivisi z'ubutabazi primarygwa ujye ku bitaro byihutirwa). Niba ubishaka, nshobora kugufasha kubona uburyo bwo kuvugana n'umuganga.";
  }

  return 'Your symptoms could be serious. If you have chest pain, trouble breathing, severe bleeding, confusion, fainting, or you feel in immediate danger, seek urgent care now (call local emergency services or go to the nearest emergency department). If you want, I can help you contact a clinician.';
};

export const formatAiError = (error, language = 'en') => {
  const msg = error?.message || String(error);

  const translations = {
    en: {
      quota: "The assistant is taking a short break. Please try again in a moment.",
      timeout: "The connection is a bit slow right now. Please try again.",
      safety: "This content couldn't be processed. Please rephrase and try again.",
      invalid: "Something went wrong with the request. Please try again.",
      default: "The assistant is temporarily unavailable. Please try again shortly."
    },
    rw: {
      quota: "Umufasha aruhutse gato. Ongera ugerageze nyuma y'akanya gato.",
      timeout: "Umuyoboro uratinda gato. Ongera ugerageze.",
      safety: "Ibi ntibishobora gusuzumwa. Ongera wandike mu bundi buryo.",
      invalid: "Habaye ikibazo gito. Ongera ugerageze.",
      default: "Umufasha ntabwo ahari muri uyu mwanya. Ongera ugerageze."
    }
  };

  const t = translations[language] || translations.en;

  // 429 quota errors: never show a scary message — just return a soft retry hint
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return t.quota;
  }
  if (msg.includes('TIMEOUT') || msg.includes('ETIMEDOUT')) return t.timeout;
  if (msg.includes('SAFETY') || msg.includes('blocked')) return t.safety;
  if (msg.includes('400') || msg.includes('Invalid')) return t.invalid;

  return t.default;
};

const extractTextFromGenerateResult = (result) => {
  const response = result?.response;
  if (!response) return '';
  if (typeof response.text === 'function') return response.text();
  if (typeof response.text === 'string') return response.text;
  return '';
};

export const generateTextWithFallback = async ({
  systemPrompt,
  contents,
  generationConfig,
  modelNames = textModelCandidates
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('AI service is not configured. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY.');
  }

  const genAI = getClient();
  if (!genAI) {
    throw new Error('AI service is not configured.');
  }

  let lastError = null;

  // If a specific model is requested, try it first
  const modelsToTry = [...modelNames];
  if (generationConfig?.requestedModel && modelsToTry.includes(generationConfig.requestedModel)) {
    // Move it to the front
    const idx = modelsToTry.indexOf(generationConfig.requestedModel);
    modelsToTry.splice(idx, 1);
    modelsToTry.unshift(generationConfig.requestedModel);
  }

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI SERVICE] Attempting generation with model: ${modelName} using v1beta API...`);

      const model = genAI.getGenerativeModel(
        { model: modelName, systemInstruction: systemPrompt },
        { apiVersion: 'v1beta' }
      );

      const request = generationConfig ? { contents, generationConfig } : { contents };
      const result = await model.generateContent(request);
      const text = extractTextFromGenerateResult(result);

      if (text) {
        console.log(`[AI SERVICE] SUCCESS with model: ${modelName}`);
        return { text, model: modelName };
      }
      console.warn(`[AI SERVICE] Model ${modelName} returned empty response.`);
      lastError = new Error('Empty response from AI model');
    } catch (error) {
      // 429 = rate limit: skip silently to next fallback model
      if (error.status === 429) {
        console.warn(`[AI SERVICE] Rate limit on ${modelName}, switching to next model...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        lastError = error;
        continue;
      }
      console.error(`[AI SERVICE] ERROR with model ${modelName}:`, {
        message: error.message,
        status: error.status,
        name: error.name
      });
      lastError = error;
      continue;
    }
  }



  throw lastError || new Error('Failed to generate AI response');
};

const extractEmbeddingValues = (result) => {
  const values = result?.embedding?.values || result?.embedding;
  if (Array.isArray(values)) return values;
  return null;
};

export const embedTextWithFallback = async ({ text, modelNames = embeddingModelCandidates }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('AI embeddings are not configured. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY.');
  }

  const genAI = getClient();
  if (!genAI) throw new Error('AI embeddings are not configured.');

  let lastError = null;
  const tried = new Set();
  for (const modelName of modelNames) {
    try {
      tried.add(modelName);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      const values = extractEmbeddingValues(result);
      if (values) return { embedding: values, model: modelName };
      lastError = new Error('Empty embedding from embedding model');
    } catch (error) {
      lastError = error;
      continue;
    }
  }



  throw lastError || new Error('Failed to create embeddings');
};

export const embedTexts = async ({ texts, modelNames = embeddingModelCandidates }) => {
  const results = [];
  for (const t of texts) {
    const r = await embedTextWithFallback({ text: t, modelNames });
    results.push(r.embedding);
  }
  return results;
};
