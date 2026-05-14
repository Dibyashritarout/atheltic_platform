const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, category, subject, message, rating, user } = req.body;

    if (!name || !email || !subject || !message || !rating) {
      return res.status(400).json({ error: 'Please provide name, email, subject, message, and rating.' });
    }

    const feedback = await Feedback.create({
      name,
      email,
      category,
      subject,
      message,
      rating,
      user: user || null
    });

    res.status(201).json({
      message: 'Feedback submitted successfully! Thank you for your input.',
      feedback
    });
  } catch (err) {
    console.error('Feedback submission error:', err);
    res.status(500).json({ error: 'Server error while submitting feedback.' });
  }
});

// GET /api/feedback (Admin only - for future use)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
