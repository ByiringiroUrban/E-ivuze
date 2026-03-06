import { generateTextWithFallback, formatAiError } from '../services/aiService.js';
import { redactForLogs } from '../utils/redactForLogs.js';
import { sanitizeForAiText } from '../utils/sanitizeForAi.js';

const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';

  const kinyarwandaKeywords = [
    'muraho',
    'bite',
    'murakoze',
    'ndagira',
    'ndashaka',
    'ubuzima',
    'ubuvuzi',
    'indwara',
    'imiti',
    'inkingo',
    'umuganga',
    'ibimenyetso',
    'ububabare'
  ];

  const lower = text.toLowerCase();
  const hits = kinyarwandaKeywords.filter(k => lower.includes(k)).length;
  return hits >= 2 ? 'rw' : 'en';
};

export const getSuggestion = async (req, res) => {
  try {
    const { context, fieldType = 'description', language = 'en', requestedModel } = req.body;

    if (!context || String(context).trim().length < 10) {
      return res.json({
        success: false,
        message: 'Please provide more context (at least 10 characters)'
      });
    }

    const detectedLanguage = detectLanguage(String(context || ''));
    const requestedLanguage = ['en', 'rw'].includes(String(language || '').trim())
      ? String(language || '').trim()
      : 'en';
    const targetLanguage = detectedLanguage === 'rw' ? 'rw' : requestedLanguage;

    const systemPrompt = `You are a medical documentation assistant. Based on the provided context, generate a professional, concise ${fieldType} suitable for medical records.

Guidelines:
- Use professional medical terminology
- Be concise but comprehensive
- Focus on clinically relevant information
- Maintain a neutral, objective tone
- Do not include patient-identifying information
- Format appropriately for electronic health records

Respond with only the suggested text, no preamble or explanation.

${targetLanguage === 'rw' ? 'Respond in Kinyarwanda.' : 'Respond in English.'}`;

    const userPrompt = sanitizeForAiText(
      `Context: ${String(context).trim()}

Generate a professional ${fieldType} for this medical record:`,
      { maxChars: 2500 }
    );

    const aiResponse = await generateTextWithFallback({
      systemPrompt,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
        requestedModel: requestedModel || undefined
      }
    });

    if (!aiResponse || !aiResponse.text) {
      return res.json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again.'
      });
    }

    const suggestion = aiResponse.text.trim();

    console.info('AI suggestion generated:', redactForLogs({
      fieldType,
      language: targetLanguage,
      suggestionLength: suggestion.length
    }));

    return res.json({
      success: true,
      suggestion,
      model: aiResponse.model
    });

  } catch (error) {
    console.error('AI suggestion error:', error);

    let friendlyMessage = 'AI service is temporarily unavailable.';
    try {
      const lang = detectLanguage(req?.body?.context || '');
      friendlyMessage = formatAiError(error, lang);
    } catch (langError) {
      console.error('Error during error formatting:', langError);
    }

    return res.status(error.status || 500).json({
      success: false,
      message: friendlyMessage,
      technicalInfo: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
