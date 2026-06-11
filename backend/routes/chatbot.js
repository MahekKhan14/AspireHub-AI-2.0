const express = require('express');
const { authenticate } = require('../middleware/auth');
const { chatWithBot } = require('../config/gemini');
const ChatHistory = require('../models/ChatHistory');
const { v4: uuidv4 } = require('crypto');

const router = express.Router();

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', authenticate, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }

    const currentSessionId = sessionId || `session_${req.userId}_${Date.now()}`;

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({
      userId: req.userId,
      sessionId: currentSessionId
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.userId,
        sessionId: currentSessionId,
        messages: []
      });
    }

    // Get recent conversation history (last 10 messages for context)
    const recentHistory = chatHistory.messages.slice(-10);

    // Generate AI response
    const aiResponse = await chatWithBot(message.trim(), recentHistory);

    // Save messages to history
    chatHistory.messages.push(
      { role: 'user', content: message.trim() },
      { role: 'model', content: aiResponse }
    );

    // Keep only last 50 messages
    if (chatHistory.messages.length > 50) {
      chatHistory.messages = chatHistory.messages.slice(-50);
    }

    await chatHistory.save();

    res.json({
      response: aiResponse,
      sessionId: currentSessionId,
      messageCount: chatHistory.messages.length
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/chatbot/history/:sessionId - Get chat history for session
router.get('/history/:sessionId', authenticate, async (req, res, next) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      userId: req.userId,
      sessionId: req.params.sessionId
    });

    if (!chatHistory) {
      return res.json({ messages: [], sessionId: req.params.sessionId });
    }

    res.json({
      messages: chatHistory.messages,
      sessionId: req.params.sessionId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/chatbot/sessions - Get all chat sessions
router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const sessions = await ChatHistory.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('sessionId messages updatedAt');

    const sessionList = sessions.map(s => ({
      sessionId: s.sessionId,
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.content?.substring(0, 50) + '...',
      updatedAt: s.updatedAt
    }));

    res.json({ sessions: sessionList });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/chatbot/session/:sessionId - Clear a chat session
router.delete('/session/:sessionId', authenticate, async (req, res, next) => {
  try {
    await ChatHistory.findOneAndDelete({
      userId: req.userId,
      sessionId: req.params.sessionId
    });

    res.json({ message: 'Chat session cleared' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
