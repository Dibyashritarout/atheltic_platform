const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const Athlete = require('../models/Athlete');
const Performance = require('../models/Performance');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { calculateMatchScore } = require('../services/aiEngine');

// GET /api/opportunities
router.get('/', async (req, res) => {
  try {
    const { sport, search, active } = req.query;
    const filter = {};
    if (sport) filter.sport = new RegExp(sport, 'i');
    if (search) filter.title = new RegExp(search, 'i');
    if (active !== 'false') filter.isActive = true;

    const opps = await Opportunity.find(filter).sort({ createdAt: -1 });
    res.json(opps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/opportunities (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const opp = await Opportunity.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(opp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/opportunities/:id
router.get('/:id', async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id).populate('matchedAthletes');
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    res.json(opp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/opportunities/:id (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    res.json(opp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/opportunities/:id (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    res.json({ message: 'Opportunity deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/opportunities/:id/matches — smart matching with compatibility scores
router.get('/:id/matches', async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });

    // Find potentially matching athletes
    const filter = {};
    if (opp.sport && opp.sport.toLowerCase() !== 'any') {
      filter.sports = { $in: [new RegExp(opp.sport, 'i')] };
    }

    const athletes = await Athlete.find(filter).limit(30);
    
    // Calculate match scores for each athlete
    const matchedAthletes = await Promise.all(
      athletes.map(async (athlete) => {
        const performances = await Performance.find({ athlete: athlete._id }).sort({ recordedAt: 1 });
        const matchResult = calculateMatchScore(athlete, performances, opp);
        return {
          athlete: athlete.toObject(),
          matchScore: matchResult.score,
          breakdown: matchResult.breakdown,
          reasoning: matchResult.reasoning,
          compatible: matchResult.compatible,
        };
      })
    );

    // Sort by match score descending
    matchedAthletes.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedAthletes.filter(m => m.compatible));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
