import mongoose from 'mongoose';
import aiDocumentModel from '../models/aiDocumentModel.js';
import aiChunkModel from '../models/aiChunkModel.js';
import { embedTextWithFallback, ensureDisclaimer, generateTextWithFallback } from '../services/aiService.js';
import { searchPubMed } from '../services/pubMedService.js';
import { redactForLogs } from '../utils/redactForLogs.js';
import { sanitizeForAiText } from '../utils/sanitizeForAi.js';

const normalizeText = (text) => {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const chunkText = (text, { maxChars = 900, overlap = 120, maxChunks = 200 } = {}) => {
  const t = normalizeText(text);
  if (!t) return [];

  const chunks = [];
  let start = 0;
  while (start < t.length && chunks.length < maxChunks) {
    let end = Math.min(t.length, start + maxChars);
    if (end < t.length) {
      const windowText = t.slice(start, end);
      const breakpoints = [
        windowText.lastIndexOf('\n\n'),
        windowText.lastIndexOf('\n'),
        windowText.lastIndexOf('. '),
        windowText.lastIndexOf('! '),
        windowText.lastIndexOf('? '),
        windowText.lastIndexOf('; ')
      ].filter(i => i > 200);

      if (breakpoints.length) {
        const bp = Math.max(...breakpoints);
        end = start + bp + 1;
      }
    }

    const chunk = t.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= t.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
};

const toObjectIdOrNull = (value) => {
  if (!value) return null;
  try {
    return new mongoose.Types.ObjectId(String(value));
  } catch {
    return null;
  }
};

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';
  const lower = text.toLowerCase();
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

  const hits = kinyarwandaKeywords.filter(k => lower.includes(k)).length;
  return hits >= 2 ? 'rw' : 'en';
};

export const ingestDocument = async (req, res) => {
  try {
    const {
      documentId,
      title,
      text,
      source = '',
      url = '',
      language = 'en',
      tags = [],
      visibility = 'public'
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.json({ success: false, message: 'title is required' });
    }

    if (!text || !String(text).trim()) {
      return res.json({ success: false, message: 'text is required' });
    }

    const normalizedLanguage = ['en', 'rw'].includes(language) ? language : 'en';
    const normalizedVisibility = ['public', 'user', 'internal'].includes(visibility) ? visibility : 'public';

    let doc = null;

    if (documentId) {
      doc = await aiDocumentModel.findById(documentId);
      if (!doc) {
        return res.json({ success: false, message: 'Document not found' });
      }
      doc.title = String(title).trim();
      doc.source = String(source || '');
      doc.url = String(url || '');
      doc.language = normalizedLanguage;
      doc.tags = Array.isArray(tags) ? tags : [];
      doc.visibility = normalizedVisibility;
      doc.updatedAt = new Date();
      await doc.save();

      await aiChunkModel.deleteMany({ documentId: doc._id });
    } else {
      doc = await aiDocumentModel.create({
        title: String(title).trim(),
        source: String(source || ''),
        url: String(url || ''),
        language: normalizedLanguage,
        tags: Array.isArray(tags) ? tags : [],
        visibility: normalizedVisibility,
        ownerUserId: null,
        createdBy: { role: 'admin', userId: 'admin' },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const chunks = chunkText(text);
    if (!chunks.length) {
      return res.json({ success: false, message: 'No chunks generated' });
    }

    const chunkDocs = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkTextValue = chunks[i];
      const embed = await embedTextWithFallback({ text: sanitizeForAiText(chunkTextValue) });
      chunkDocs.push({
        documentId: doc._id,
        chunkIndex: i,
        text: chunkTextValue,
        embedding: embed.embedding,
        embeddingModel: embed.model,
        language: normalizedLanguage,
        visibility: normalizedVisibility,
        ownerUserId: null,
        createdAt: new Date()
      });
    }

    await aiChunkModel.insertMany(chunkDocs);

    res.json({
      success: true,
      document: {
        _id: doc._id,
        title: doc.title,
        source: doc.source,
        url: doc.url,
        language: doc.language,
        tags: doc.tags,
        visibility: doc.visibility,
        updatedAt: doc.updatedAt
      },
      chunks: chunkDocs.length
    });
  } catch (error) {
    console.error('Ingest document error:', redactForLogs(error));
    res.json({ success: false, message: error.message || 'Failed to ingest document' });
  }
};

export const semanticSearch = async (req, res) => {
  try {
    const userId = req.body?.userId || null;

    const q = (req.query.q || req.body?.q || '').trim();
    const languageRaw = (req.query.language || req.body?.language || '').trim();
    const topKRaw = req.query.topK || req.body?.topK;
    const includeAnswerRaw = req.query.includeAnswer || req.body?.includeAnswer;
    const includeExternalRaw = req.query.includeExternal || req.body?.includeExternal;
    const externalTopKRaw = req.query.externalTopK || req.body?.externalTopK;

    const topK = Math.max(1, Math.min(10, parseInt(topKRaw || '5')));
    const includeAnswer = String(includeAnswerRaw || '').toLowerCase() === 'true' || includeAnswerRaw === true;
    const includeExternal = String(includeExternalRaw || '').toLowerCase() === 'true' || includeExternalRaw === true;
    const externalTopK = Math.max(1, Math.min(10, parseInt(externalTopKRaw || '5')));

    if (!q) {
      return res.json({ success: false, message: 'q is required' });
    }

    const sanitizedQ = sanitizeForAiText(q);

    const language = ['en', 'rw'].includes(languageRaw)
      ? languageRaw
      : (detectLanguage(q) === 'rw' ? 'rw' : '');

    const ownerObjectId = toObjectIdOrNull(userId);

    const baseFilter = {};

    if (ownerObjectId) {
      baseFilter.$or = [
        { visibility: 'public' },
        { visibility: 'user', ownerUserId: ownerObjectId }
      ];
    } else {
      baseFilter.visibility = 'public';
    }

    const filterWithLanguage = language ? { ...baseFilter, language } : { ...baseFilter };

    let queryEmbedding = null;
    let embeddingError = null;
    try {
      queryEmbedding = await embedTextWithFallback({ text: sanitizedQ });
    } catch (error) {
      embeddingError = error;
      queryEmbedding = null;
    }

    const vectorIndexName = process.env.MONGO_VECTOR_INDEX_NAME || 'aichunk_embedding';

    let usedVectorSearch = false;
    let chunks = [];

    const runRegexFallback = async (filter) => {
      const regex = new RegExp(escapeRegex(sanitizedQ), 'i');
      const fallback = await aiChunkModel
        .find({ ...filter, text: regex })
        .sort({ createdAt: -1 })
        .limit(topK)
        .populate('documentId', 'title source url language tags visibility');

      return fallback.map(c => ({
        _id: c._id,
        documentId: c.documentId?._id || c.documentId,
        chunkIndex: c.chunkIndex,
        text: c.text,
        language: c.language,
        visibility: c.visibility,
        ownerUserId: c.ownerUserId,
        score: null,
        doc: c.documentId && c.documentId.title ? c.documentId : null
      }));
    };

    const runVectorSearch = async (filter) => {
      if (!queryEmbedding?.embedding) {
        throw embeddingError || new Error('Embeddings unavailable');
      }

      const pipeline = [
        {
          $vectorSearch: {
            index: vectorIndexName,
            path: 'embedding',
            queryVector: queryEmbedding.embedding,
            numCandidates: Math.max(50, topK * 20),
            limit: topK,
            filter
          }
        },
        {
          $project: {
            _id: 1,
            documentId: 1,
            chunkIndex: 1,
            text: 1,
            language: 1,
            visibility: 1,
            ownerUserId: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        },
        {
          $lookup: {
            from: 'aidocuments',
            localField: 'documentId',
            foreignField: '_id',
            as: 'doc'
          }
        },
        { $unwind: { path: '$doc', preserveNullAndEmptyArrays: true } }
      ];

      return aiChunkModel.aggregate(pipeline);
    };

    try {
      chunks = await runVectorSearch(filterWithLanguage);
      usedVectorSearch = true;
    } catch (error) {
      usedVectorSearch = false;
      chunks = await runRegexFallback(filterWithLanguage);
    }

    // If we asked for a specific language and got nothing, fallback to all languages
    let effectiveLanguage = language || null;
    if (language && (!chunks || chunks.length === 0)) {
      effectiveLanguage = null;
      if (queryEmbedding?.embedding) {
        try {
          chunks = await runVectorSearch(baseFilter);
          usedVectorSearch = true;
        } catch (error) {
          usedVectorSearch = false;
          chunks = await runRegexFallback(baseFilter);
        }
      } else {
        chunks = await runRegexFallback(baseFilter);
      }
    }

    const results = chunks.map((c, idx) => ({
      rank: idx + 1,
      chunkId: c._id,
      document: c.doc
        ? {
          _id: c.doc._id,
          title: c.doc.title || '',
          source: c.doc.source || '',
          url: c.doc.url || ''
        }
        : { _id: c.documentId, title: '', source: '', url: '' },
      chunkIndex: c.chunkIndex,
      score: c.score,
      text: String(c.text || '').substring(0, 900)
    }));

    let answer = null;
    let answerModel = null;

    let externalResults = [];
    if (includeExternal) {
      try {
        externalResults = await searchPubMed({ q: sanitizedQ, retmax: externalTopK });
      } catch (error) {
        externalResults = [];
        console.error('External search error:', redactForLogs(error));
      }
    }

    if (includeAnswer) {
      const answerLanguage = effectiveLanguage || language || 'en';
      if (!results.length) {
        const systemPrompt =
          'You are a healthcare assistant. Provide general, educational health guidance. ' +
          'Do not claim to diagnose. Provide practical self-care steps, warning signs, and when to seek urgent care. ' +
          'Keep it concise and actionable. ' +
          (answerLanguage === 'rw'
            ? 'Respond in Kinyarwanda.'
            : 'Respond in English.');

        const userPrompt = sanitizeForAiText(`Question: ${q}`, { maxChars: 4000 });

        try {
          const gen = await generateTextWithFallback({
            systemPrompt,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: userPrompt
                  }
                ]
              }
            ]
          });

          answer = ensureDisclaimer(gen.text, answerLanguage);
          answerModel = gen.model;
        } catch (error) {
          answer = ensureDisclaimer(
            answerLanguage === 'rw'
              ? "Ntabwo mbashije kubona amakuru ahagije mu bubiko bwacu bw'ubumenyi kuri iki kibazo. Gerageza kongera gusobanura ikibazo (urugero: aho ububabare buri, igihe bumaze, ibindi bimenyetso) cyangwa vugana n'umuganga."
              : 'I could not find enough information in our knowledge base for this query. Try adding more details (location, duration, other symptoms) or contact a clinician.',
            answerLanguage
          );
          answerModel = null;
        }
      } else {
        const context = results
          .map(r => `[${r.rank}] ${r.document.title || 'Source'}\n${r.text}`)
          .join('\n\n');

        const systemPrompt =
          'You are a healthcare information assistant. Answer using ONLY the provided sources. ' +
          'If the answer is not in the sources, say you do not have enough information. ' +
          'Cite sources using [1], [2], etc. Keep it concise. ' +
          (answerLanguage === 'rw'
            ? 'Respond in Kinyarwanda.'
            : 'Respond in English.');

        const userPrompt = sanitizeForAiText(`Question: ${q}\n\nSources:\n${context}`, { maxChars: 12000 });

        const gen = await generateTextWithFallback({
          systemPrompt,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: userPrompt
                }
              ]
            }
          ]
        });

        answer = ensureDisclaimer(gen.text, answerLanguage);
        answerModel = gen.model;
      }
    }

    res.json({
      success: true,
      query: q,
      usedVectorSearch,
      vectorIndexName: usedVectorSearch ? vectorIndexName : null,
      embeddingModel: queryEmbedding?.model || null,
      language: language || null,
      effectiveLanguage,
      results,
      externalResults,
      answer,
      answerModel
    });
  } catch (error) {
    console.error('Semantic search error:', redactForLogs(error));
    res.json({ success: false, message: error.message || 'Search failed' });
  }
};


