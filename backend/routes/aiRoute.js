import express from 'express';
import {
  createConversation,
  getConversation,
  listConversations,
  updateConversation,
  deleteConversation,
  sendMessage,
  handoffConversation,
  listSupportModels
} from '../controllers/aiController.js';
import authAiOptional from '../middleware/authAiOptional.js';
import authUser from '../middleware/authUser.js';

const aiRouter = express.Router();

// All routes support optional authentication (userId from authUserOptional middleware if logged in)
// If not logged in, userId will be null and conversations are anonymous

// List available models
aiRouter.get('/models', listSupportModels);

// Create conversation
aiRouter.post('/conversations', authAiOptional, createConversation);

// List conversations (must come before /:id route)
aiRouter.get('/conversations', authAiOptional, listConversations);

// Get conversation with messages
aiRouter.get('/conversations/:id', authAiOptional, getConversation);

// Update conversation
aiRouter.put('/conversations/:id', authAiOptional, updateConversation);

// Delete conversation
aiRouter.delete('/conversations/:id', authAiOptional, deleteConversation);

// Send message and get AI response
aiRouter.post('/conversations/:id/messages', authAiOptional, sendMessage);

// Request human handoff (requires patient authentication)
aiRouter.post('/conversations/:id/handoff', authUser, handoffConversation);

export default aiRouter;
