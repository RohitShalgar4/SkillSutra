import express from 'express';
import { sendMessage, clearHistory, getWelcomeMessage } from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get welcome message
router.get('/welcome', verifyToken, getWelcomeMessage);

// Send message
router.post('/message', verifyToken, sendMessage);

// Clear chat history
router.delete('/history', verifyToken, clearHistory);

export default router; 