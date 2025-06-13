import { GoogleGenerativeAI } from '@google/generative-ai';

// Debug log for API key
console.log('Gemini API Key available:', !!process.env.GEMINI_API_KEY);
console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
console.log('API Key first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));

// Function to split text into multiple messages
const splitIntoMessages = (text) => {
    // If text is short, return as single message
    if (text.length < 500) {
        return [text];
    }

    // Split text into paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    // If there are fewer than 2 paragraphs, return as single message
    if (paragraphs.length < 2) {
        return [text];
    }

    // Group paragraphs into messages (max 3 paragraphs per message)
    const messages = [];
    let currentMessage = [];
    let currentLength = 0;

    for (const paragraph of paragraphs) {
        // If adding this paragraph would make the message too long, start a new message
        if (currentLength + paragraph.length > 500) {
            if (currentMessage.length > 0) {
                messages.push(currentMessage.join('\n\n'));
                currentMessage = [];
                currentLength = 0;
            }
        }

        currentMessage.push(paragraph);
        currentLength += paragraph.length;
    }

    // Add the last message if there's anything left
    if (currentMessage.length > 0) {
        messages.push(currentMessage.join('\n\n'));
    }

    return messages;
};

// Function to format long text into bullet points
const formatResponse = (text) => {
    // If text is short (less than 200 characters), return as is
    if (text.length < 200) {
        return text;
    }

    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // If there are fewer than 3 sentences, return as is
    if (sentences.length < 3) {
        return text;
    }

    // Format into bullet points
    return sentences
        .map(sentence => `• ${sentence.trim()}`)
        .join('\n');
};

// Comprehensive system message that defines the chatbot's role and project knowledge
const systemPrompt = `You are a helpful assistant for the SkillSutra platform, an educational platform for course creation and learning. Here's your comprehensive knowledge about the platform:

Platform Overview:
- SkillSutra is an educational platform where instructors can create and manage courses
- Users can browse, enroll in, and learn from various courses
- The platform supports video content, quizzes, and interactive learning materials

Key Features:
1. Course Management:
   - Create and edit courses
   - Upload and manage video content
   - Add course descriptions, requirements, and learning objectives
   - Set course pricing and enrollment options

2. User Features:
   - User registration and authentication
   - Course browsing and search
   - Course enrollment and progress tracking
   - Learning dashboard with enrolled courses
   - Profile management

3. Content Features:
   - Video lectures and tutorials
   - Interactive quizzes and assessments
   - Course materials and resources
   - Progress tracking and certificates

4. Navigation Structure:
   - Home: Browse featured and popular courses
   - Courses: View all available courses with filters
   - My Learning: Access enrolled courses and track progress
   - Profile: Manage user information and settings
   - Instructor Dashboard: For course creators to manage their courses

5. Technical Features:
   - Video streaming and processing
   - File upload and management
   - Progress tracking
   - Payment processing
   - User authentication and authorization

Guidelines for Responses:
1. Be specific about platform features and navigation
2. Provide step-by-step instructions when explaining processes
3. Mention relevant sections or pages when discussing features
4. Include both user and instructor perspectives when relevant
5. Suggest alternative approaches when applicable
6. If unsure about a feature, admit it and suggest contacting support
7. For long explanations, use bullet points or numbered lists
8. Break down complex topics into smaller, digestible parts
9. Use clear headings and subheadings when appropriate
10. Keep responses concise but informative
11. Structure long responses into multiple messages for better readability

Common User Queries to Handle:
- How to create a new course
- How to upload and manage course videos
- How to enroll in a course
- How to track learning progress
- How to manage user profile
- How to navigate the platform
- How to search for courses
- How to manage course content
- How to handle payments and subscriptions
- How to get technical support

Always be polite, concise, and helpful. If you don't know something specific about the platform, admit it and suggest contacting support.`;

class ChatService {
    constructor() {
        this.conversationHistory = new Map();
        try {
            console.log('Initializing Gemini API...');
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is not set in environment variables');
            }
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 1000,
                },
            });
            console.log('Gemini API initialized successfully');
        } catch (error) {
            console.error('Error initializing Gemini API:', {
                message: error.message,
                stack: error.stack,
                errorType: error.constructor.name
            });
            throw error;
        }
    }

    // Initialize or get conversation history for a user
    getConversationHistory(userId) {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        return this.conversationHistory.get(userId);
    }

    // Get welcome message for a user
    async getWelcomeMessage(userName) {
        try {
            const prompt = `${systemPrompt}\n\nGenerate a friendly welcome message for a user named ${userName}. The message should welcome them to SkillSutra and ask how you can help them today. Keep it concise and friendly.`;
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating welcome message:', error);
            return `Hello ${userName}! Welcome to SkillSutra. How can I help you today?`;
        }
    }

    // Process user message and generate response
    async processMessage(userId, message, context = {}) {
        try {
            console.log('Starting message processing...');
            console.log('User ID:', userId);
            console.log('Message:', message);
            
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('Gemini API key is not configured');
            }

            const history = this.getConversationHistory(userId);
            console.log('Conversation history length:', history.length);
            
            // Create a prompt that encourages structured responses
            const prompt = `${systemPrompt}\n\nPrevious conversation:\n${
                history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
            }\n\nUser: ${message}\n\nPlease provide a clear and structured response. For long explanations, use bullet points or numbered lists to make the information more digestible. Break down complex topics into multiple messages if needed.\n\nAssistant:`;

            console.log('Sending request to Gemini...');
            console.log('Prompt length:', prompt.length);

            // Generate content
            const result = await this.model.generateContent(prompt);
            console.log('Raw result:', result);
            
            const response = await result.response;
            console.log('Raw response:', response);
            
            let aiResponse = response.text();
            console.log('Processed response:', aiResponse);

            // Format the response if it's long
            aiResponse = formatResponse(aiResponse);

            // Split the response into multiple messages if needed
            const messages = splitIntoMessages(aiResponse);

            // Update conversation history with all messages
            history.push({ role: 'user', content: message });
            messages.forEach(msg => {
                history.push({ role: 'model', content: msg });
            });

            // Keep conversation history manageable (last 10 messages)
            if (history.length > 10) {
                history.splice(0, history.length - 10);
            }

            // Return all messages
            return {
                messages: messages.map(msg => ({
                    message: msg,
                    timestamp: new Date().toISOString()
                }))
            };
        } catch (error) {
            console.error('Detailed error in processMessage:', {
                message: error.message,
                stack: error.stack,
                userId,
                status: error.response?.status,
                data: error.response?.data,
                errorType: error.constructor.name,
                errorDetails: error
            });

            // Handle specific Gemini errors
            if (error.message.includes('API key')) {
                throw new Error('Invalid API key. Please check your Gemini API key.');
            } else if (error.message.includes('quota')) {
                throw new Error('API quota exceeded. Please try again later.');
            } else if (error.message.includes('safety')) {
                throw new Error('Message blocked due to safety concerns. Please rephrase your message.');
            } else if (error.message.includes('404')) {
                throw new Error('Model not found. Please check the model configuration.');
            } else if (error.message.includes('permission')) {
                throw new Error('API key does not have permission to access the model.');
            }

            throw new Error(`Failed to process message: ${error.message}`);
        }
    }

    // Clear conversation history for a user
    clearHistory(userId) {
        this.conversationHistory.delete(userId);
    }
}

export default new ChatService(); 