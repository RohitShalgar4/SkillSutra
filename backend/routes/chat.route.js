import express from 'express';
import { sendMessage, clearHistory } from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

// Send a message to the chatbot
router.post('/message', sendMessage);

// Clear chat history
router.delete('/history', clearHistory);

export default router; 