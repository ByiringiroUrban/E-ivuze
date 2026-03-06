import express from 'express';
import { getSuggestion } from '../controllers/aiSuggestionController.js';
import authAiOptional from '../middleware/authAiOptional.js';

const router = express.Router();

// Get AI suggestion for form fields (descriptions, notes, etc.)
router.post('/suggest', authAiOptional, getSuggestion);

export default router;
