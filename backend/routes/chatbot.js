const express = require('express');
const router = express.Router();
const { processMessage, getSuggestions } = require('../services/chatbot');

// POST /api/chatbot/message — process a chat message
router.post('/message', (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const response = processMessage(message);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chatbot/suggestions — get starter suggestions
router.get('/suggestions', (req, res) => {
  try {
    const suggestions = getSuggestions();
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
