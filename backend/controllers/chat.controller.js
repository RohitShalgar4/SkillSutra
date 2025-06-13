import chatService from '../services/chatService.js';

export const getWelcomeMessage = async (req, res) => {
    try {
        const userName = req.user?.name || 'there';
        const welcomeMessage = await chatService.getWelcomeMessage(userName);
        res.json({ message: welcomeMessage });
    } catch (error) {
        console.error('Error in getWelcomeMessage:', error);
        res.status(500).json({ error: 'Failed to generate welcome message' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id; // Assuming you have user authentication middleware

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set in environment variables');
            return res.status(500).json({ error: 'Chat service is not properly configured' });
        }

        console.log('Processing message for user:', userId);
        const response = await chatService.processMessage(userId, message);
        console.log('Response generated successfully');
        
        // If the response contains multiple messages, send them as an array
        if (response.messages && response.messages.length > 0) {
            res.json({ messages: response.messages });
        } else {
            res.json({ message: response.message });
        }
    } catch (error) {
        console.error('Detailed error in sendMessage:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?._id
        });
        res.status(500).json({ 
            error: 'Failed to process message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const clearHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        chatService.clearHistory(userId);
        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        console.error('Error in clearHistory:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
}; 