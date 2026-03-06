import conversationModel from '../models/conversationModel.js';
import messageModel from '../models/messageModel.js';
import { ensureDisclaimer, generateTextWithFallback, getAiApiKey, getEmergencyMessage, isEmergencyText, getAvailableModels, formatAiError } from '../services/aiService.js';
import chatRoomModel from '../models/chatRoomModel.js';
import chatMessageModel from '../models/chatMessageModel.js';
import userModel from '../models/userModel.js';
import { redactForLogs } from '../utils/redactForLogs.js';
import { sanitizeForAiContents } from '../utils/sanitizeForAi.js';

export const listSupportModels = async (req, res) => {
  try {
    const models = getAvailableModels();
    res.json({ success: true, models });
  } catch (error) {
    res.json({ success: false, message: 'Failed to fetch models' });
  }
};

// Language detection helper
const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'rw';

  const kinyarwandaKeywords = [
    'muraho', 'bite', 'murakoze', 'ndabona', 'ndashaka', 'nshobora',
    'ubuzima', 'umuvurwa', 'dokoteri', 'gahunda', 'kwishyura', 'amakuru'
  ];

  const lowerText = text.toLowerCase();
  const kinyarwandaCount = kinyarwandaKeywords.filter(keyword =>
    lowerText.includes(keyword)
  ).length;

  // If more than 2 Kinyarwanda keywords found, assume Kinyarwanda
  return kinyarwandaCount >= 2 ? 'rw' : 'en';
};

// System prompt for Gemini
const getSystemPrompt = (language) => {
  const prompts = {
    en: `You are a healthcare information assistant for E-ivuzeConnect. Use simple, safe, non-diagnostic language. Ask clarifying questions when needed and provide general next steps only. Always include: "This information is educational only and not a diagnosis. For medical advice, consult a licensed professional." If the user describes danger signs (chest pain, severe bleeding, trouble breathing, confusion), respond with an emergency escalation message and advise urgent care. Answer in English.`,
    rw: `Uri umufasha utanga amakuru rusange y'ubuzima kuri E-ivuzeConnect. Koresha amagambo yoroshye kandi yizewe, wirinde gusuzuma indwara. Baza ibibazo bisobanutse igihe bikenewe, utange inama rusange n'intambwe zikurikira. Buri gihe ongeraho: "Aya makuru ni ay'inyigisho gusa kandi si isuzuma. Kugira ngo ubone inama z'ubuvuzi, vugana n'umuganga wemewe." Niba hari ibimenyetso bikomeye (ububabare mu gatuza, kuva amaraso menshi, guhumeka bigoranye, kuyoberwa), sobanura ubutumwa bwo gushaka ubuvuzi bwihuse. Subiza mu Kinyarwanda.`
  };
  return prompts[language] || prompts.en;
};

// Create new conversation
export const createConversation = async (req, res) => {
  try {
    const userId = req.body.userId || null; // Allow anonymous conversations
    const { title, language } = req.body;

    const conversation = new conversationModel({
      userId,
      title: title || 'New Conversation',
      language: language || 'rw'
    });

    await conversation.save();

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        userId: conversation.userId,
        title: conversation.title,
        language: conversation.language,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Create conversation error:', redactForLogs(error));
    res.json({ success: false, message: error.message });
  }
};

// Request a human handoff: creates/opens a support chat room and posts an AI transcript
export const handoffConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const { note } = req.body || {};

    if (!userId) {
      return res.json({ success: false, message: 'Not Authorized Login Again' });
    }

    const conversation = await conversationModel.findById(id);
    if (!conversation) {
      return res.json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.userId && conversation.userId.toString() !== userId?.toString()) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    // Attach anonymous conversation to the authenticated user on first handoff
    if (!conversation.userId) {
      conversation.userId = userId;
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    const messages = await messageModel
      .find({ conversationId: id })
      .sort({ createdAt: 1 })
      .limit(50);

    const adminId = 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'team@E-ivuze.com';

    const patient = await userModel.findById(userId).select('name email');
    const patientName = patient?.name || '';
    const patientEmail = patient?.email || '';

    let room = await chatRoomModel.findOne({
      members: {
        $all: [
          { $elemMatch: { role: 'patient', userId } },
          { $elemMatch: { role: 'admin', userId: adminId } }
        ]
      }
    });

    const memberKey = (role, uid) => `${role}:${uid}`;

    if (!room) {
      room = await chatRoomModel.create({
        members: [
          {
            role: 'patient',
            userId,
            name: patientName,
            email: patientEmail,
            support: false,
            verified: false
          },
          {
            role: 'admin',
            userId: adminId,
            name: 'E-ivuzeSupport',
            email: adminEmail,
            support: true,
            verified: true
          }
        ],
        lastMessage: '',
        updatedAt: new Date(),
        memberStates: [
          { key: memberKey('patient', userId), lastReadAt: null },
          { key: memberKey('admin', adminId), lastReadAt: null }
        ]
      });
    }

    const transcript = messages
      .map(m => {
        const who = m.sender === 'user' ? 'User' : (m.sender === 'assistant' ? 'Assistant' : 'System');
        return `${who}: ${m.text}`;
      })
      .join('\n');

    let handoffText = `AI Assistant handoff request\nConversationId: ${conversation._id}\nTitle: ${conversation.title || ''}\nLanguage: ${conversation.language || ''}`;
    if (note && String(note).trim()) {
      handoffText += `\n\nPatient note:\n${String(note).trim()}`;
    }
    handoffText += `\n\nTranscript:\n${transcript}`;

    // Hard cap to prevent oversized chat messages
    if (handoffText.length > 12000) {
      handoffText = handoffText.substring(0, 12000) + '\n\n[Transcript truncated]';
    }

    const handoffMsg = await chatMessageModel.create({
      roomId: room._id,
      sender: { role: 'patient', userId },
      text: handoffText,
      createdAt: new Date()
    });

    room.lastMessage = 'AI handoff request submitted';
    room.updatedAt = new Date();
    await room.save();

    res.json({
      success: true,
      message: 'Handoff request submitted',
      roomId: room._id,
      chatMessage: handoffMsg
    });
  } catch (error) {
    console.error('Handoff conversation error:', redactForLogs(error));
    res.json({ success: false, message: error.message || 'Failed to request handoff' });
  }
};

// Get conversation with messages
export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || null;

    const conversation = await conversationModel.findById(id);
    if (!conversation) {
      return res.json({ success: false, message: 'Conversation not found' });
    }

    // Check if user has access (if conversation has userId, user must match)
    if (conversation.userId && conversation.userId.toString() !== userId?.toString()) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    const messages = await messageModel
      .find({ conversationId: id })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        userId: conversation.userId,
        title: conversation.title,
        language: conversation.language,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      },
      messages: messages.map(msg => ({
        _id: msg._id,
        sender: msg.sender,
        text: msg.text,
        language: msg.language,
        createdAt: msg.createdAt
      }))
    });
  } catch (error) {
    console.error('Get conversation error:', redactForLogs(error));
    res.json({ success: false, message: error.message });
  }
};

// List user conversations
export const listConversations = async (req, res) => {
  try {
    const userId = req.body.userId || null;

    if (!userId) {
      return res.json({
        success: true,
        conversations: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId };

    const conversations = await conversationModel
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await conversationModel.countDocuments(query);

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await messageModel
          .findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .select('text createdAt');

        return {
          _id: conv._id,
          title: conv.title,
          language: conv.language,
          lastMessage: lastMessage ? {
            text: lastMessage.text.substring(0, 100),
            createdAt: lastMessage.createdAt
          } : null,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithLastMessage,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List conversations error:', redactForLogs(error));
    res.json({ success: false, message: error.message });
  }
};

// Update conversation (title, language)
export const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || null;
    const { title, language } = req.body;

    const conversation = await conversationModel.findById(id);
    if (!conversation) {
      return res.json({ success: false, message: 'Conversation not found' });
    }

    // Check authorization
    if (conversation.userId && conversation.userId.toString() !== userId?.toString()) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    if (title) conversation.title = title;
    if (language) conversation.language = language;
    conversation.updatedAt = new Date();

    await conversation.save();

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        userId: conversation.userId,
        title: conversation.title,
        language: conversation.language,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Update conversation error:', redactForLogs(error));
    res.json({ success: false, message: error.message });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || null;

    const conversation = await conversationModel.findById(id);
    if (!conversation) {
      return res.json({ success: false, message: 'Conversation not found' });
    }

    // Check authorization
    if (conversation.userId && conversation.userId.toString() !== userId?.toString()) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    // Delete all messages
    await messageModel.deleteMany({ conversationId: id });

    // Delete conversation
    await conversationModel.findByIdAndDelete(id);

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', redactForLogs(error));
    res.json({ success: false, message: error.message });
  }
};

// Send message and get AI response
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, userId, requestedModel } = req.body;

    if (!text || !text.trim()) {
      return res.json({ success: false, message: 'Message text is required' });
    }

    // Get or create conversation
    let conversation;
    if (id && id !== 'new') {
      conversation = await conversationModel.findById(id);
      if (!conversation) {
        return res.json({ success: false, message: 'Conversation not found' });
      }
      // Check authorization
      if (conversation.userId && conversation.userId.toString() !== userId?.toString()) {
        return res.json({ success: false, message: 'Unauthorized' });
      }
    } else {
      // Create new conversation
      const detectedLang = detectLanguage(text);
      conversation = new conversationModel({
        userId: userId || null,
        title: text.substring(0, 50) || 'New Conversation',
        language: detectedLang
      });
      await conversation.save();
    }

    // Detect language from user message
    const detectedLang = detectLanguage(text);
    if (conversation.language !== detectedLang) {
      conversation.language = detectedLang;
      await conversation.save();
    }

    // Get conversation history for context (before saving user message)
    const historyBefore = await messageModel
      .find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10); // Last 10 messages for context

    // Save user message
    const userMessage = new messageModel({
      conversationId: conversation._id,
      sender: 'user',
      text: text.trim(),
      language: detectedLang
    });
    await userMessage.save();

    const apiKey = getAiApiKey();
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'AI service is not configured. Please contact support.'
      });
    }

    const systemPrompt = getSystemPrompt(detectedLang);
    const conversationHistory = historyBefore.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const emergency = isEmergencyText(text, detectedLang);
    let assistantText = '';
    let modelUsed = null;

    if (emergency) {
      assistantText = ensureDisclaimer(getEmergencyMessage(detectedLang), detectedLang);
      modelUsed = 'emergency-rule';
    } else {
      const contents = [...conversationHistory, { role: 'user', parts: [{ text: text.trim() }] }];
      const sanitizedContents = sanitizeForAiContents(contents);
      const result = await generateTextWithFallback({
        systemPrompt,
        contents: sanitizedContents,
        generationConfig: requestedModel ? { requestedModel } : {}
      });
      assistantText = ensureDisclaimer(result.text, detectedLang);
      modelUsed = result.model;
    }

    // Save assistant response
    const assistantMessage = new messageModel({
      conversationId: conversation._id,
      sender: 'assistant',
      text: assistantText,
      language: detectedLang,
      metadata: {
        model: modelUsed,
        emergency
      }
    });
    await assistantMessage.save();

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        title: conversation.title,
        language: conversation.language
      },
      userMessage: {
        _id: userMessage._id,
        sender: userMessage.sender,
        text: userMessage.text,
        language: userMessage.language,
        createdAt: userMessage.createdAt
      },
      assistantMessage: {
        _id: assistantMessage._id,
        sender: assistantMessage.sender,
        text: assistantMessage.text,
        language: assistantMessage.language,
        createdAt: assistantMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Send message error:', redactForLogs(error));
    // Detect language from context or default to RW
    const lang = detectLanguage(req.body.text || '');
    const friendlyMessage = formatAiError(error, lang);

    res.json({
      success: false,
      message: friendlyMessage,
      technicalInfo: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

