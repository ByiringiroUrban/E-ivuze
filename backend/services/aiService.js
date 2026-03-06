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
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro'
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

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
      const request = generationConfig ? { contents, generationConfig } : { contents };
      const result = await model.generateContent(request);
      const text = extractTextFromGenerateResult(result);
      if (text) {
        return { text, model: modelName };
      }
      lastError = new Error('Empty response from AI model');
    } catch (error) {
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
