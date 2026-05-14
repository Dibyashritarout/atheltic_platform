const express = require('express');
const router = express.Router();
const Athlete = require('../models/Athlete');
const Performance = require('../models/Performance');
const auth = require('../middleware/auth');
const { analyzeAthlete } = require('../services/aiEngine');
const { notifyPerformanceAdded } = require('../services/notificationService');

// GET /api/athletes — list all
router.get('/', async (req, res) => {
  try {
    const { sport, state, isRural, search } = req.query;
    const filter = {};
    if (sport) filter.sports = { $in: [new RegExp(sport, 'i')] };
    if (state) filter.state = new RegExp(state, 'i');
    if (isRural === 'true') filter.isRural = true;
    if (search) filter.name = new RegExp(search, 'i');

    const athletes = await Athlete.find(filter).sort({ createdAt: -1 });
    res.json(athletes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/athletes/leaderboard/top — must be before /:id
router.get('/leaderboard/top', async (req, res) => {
  try {
    const top = await Performance.aggregate([
      { $group: { _id: '$athlete', maxJumpHeight: { $max: '$jumpHeight' }, maxJumpLength: { $max: '$jumpLength' }, maxRunningSpeed: { $max: '$runningSpeed' }, minRunningTime: { $min: '$runningTime' }, count: { $sum: 1 } } },
      { $sort: { maxJumpHeight: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'athletes', localField: '_id', foreignField: '_id', as: 'athlete' } },
      { $unwind: '$athlete' },
    ]);
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/athletes/stats — platform-wide stats
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalAthletes, ruralAthletes, totalPerformances, sportsCounts] = await Promise.all([
      Athlete.countDocuments(),
      Athlete.countDocuments({ isRural: true }),
      Performance.countDocuments(),
      Athlete.aggregate([
        { $unwind: '$sports' },
        { $group: { _id: '$sports', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const statesCovered = await Athlete.distinct('state');

    res.json({
      totalAthletes,
      ruralAthletes,
      totalPerformances,
      statesCovered: statesCovered.filter(Boolean).length,
      topSports: sportsCounts.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/athletes — create
router.post('/', auth, async (req, res) => {
  try {
    const athlete = await Athlete.create({ ...req.body, user: req.user._id });
    res.status(201).json(athlete);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/athletes/:id
router.get('/:id', async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });
    res.json(athlete);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/athletes/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const athlete = await Athlete.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });
    res.json(athlete);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/athletes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const athlete = await Athlete.findByIdAndDelete(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });
    await Performance.deleteMany({ athlete: req.params.id });
    res.json({ message: 'Athlete deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/athletes/:id/performance
router.post('/:id/performance', auth, async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    const perf = await Performance.create({ ...req.body, athlete: req.params.id });

    // Notify athlete about new performance
    await notifyPerformanceAdded(athlete, perf);

    // Evaluate achievements
    const { evaluateAchievements } = require('../services/aiEngine');
    const allPerformances = await Performance.find({ athlete: req.params.id });
    const newAchievements = evaluateAchievements(athlete, allPerformances);

    if (newAchievements.length > 0) {
      if (!athlete.achievements) athlete.achievements = [];
      athlete.achievements.push(...newAchievements);
      await athlete.save();
    }

    res.status(201).json({ performance: perf, newAchievements });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/athletes/:id/performance
router.get('/:id/performance', async (req, res) => {
  try {
    const perfs = await Performance.find({ athlete: req.params.id }).sort({ recordedAt: -1 });
    res.json(perfs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/athletes/:id/opportunities — get matched opportunities for an athlete
router.get('/:id/opportunities', async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    const performances = await Performance.find({ athlete: req.params.id }).sort({ recordedAt: 1 });
    const Opportunity = require('../models/Opportunity');
    const opportunities = await Opportunity.find({ isActive: true });

    const matchedOpportunities = opportunities.map(opp => {
      // Need calculateMatchScore from aiEngine which we already imported as { analyzeAthlete }
      // Wait, we need to import calculateMatchScore. Let's do it inline to avoid breaking existing imports if it's not exported.
      // But it is exported in aiEngine.js! Let's import it at the top of the file, or require it here.
      const { calculateMatchScore } = require('../services/aiEngine');
      const matchResult = calculateMatchScore(athlete, performances, opp);
      return {
        opportunity: opp,
        matchScore: matchResult.score,
        breakdown: matchResult.breakdown,
        reasoning: matchResult.reasoning,
        compatible: matchResult.compatible
      };
    });

    // Sort by match score descending
    matchedOpportunities.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return all matched, or just compatible? The UI shows "94 match", let's return compatible ones.
    res.json(matchedOpportunities.filter(m => m.compatible));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/athletes/:id/ai-analysis — AI-powered analysis
router.get('/:id/ai-analysis', async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    const performances = await Performance.find({ athlete: req.params.id }).sort({ recordedAt: 1 });
    const analysis = analyzeAthlete(performances, athlete);

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/athletes/:id/injury-risk — AI injury prediction
router.get('/:id/injury-risk', async (req, res) => {
  try {
    const performances = await Performance.find({ athlete: req.params.id }).sort({ recordedAt: 1 });
    const { predictInjuryRisk } = require('../services/aiEngine');
    const riskData = predictInjuryRisk(performances) || { riskLevel: { level: 'Low', emoji: '✅', color: '#1D9E75' }, warnings: [], activeInjuries: 0, totalInjuries: 0 };
    res.json(riskData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/athletes/:id/verify-step — Athlete uploads a document for verification
router.put('/:id/verify-step', auth, async (req, res) => {
  try {
    const { step, fileUrl } = req.body;
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    // For testing/prototype purposes, allow any logged-in user to upload documents
    // In production, we would strictly check athlete.user ownership
    if (!req.user) {
      return res.status(401).json({ error: 'Please login to upload documents.' });
    }

    if (!athlete.verification) athlete.verification = {};
    
    if (['aadhaar', 'ruralAddress', 'sportsCert', 'videoReview', 'coachEndorsement'].includes(step)) {
      // If user uploads, it goes to pending
      athlete.verification[step] = {
        status: 'pending',
        fileUrl: fileUrl || athlete.verification[step]?.fileUrl
      };
      athlete.verification.status = 'pending';
    }

    await athlete.save();
    res.json(athlete.verification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/athletes/:id/admin-verify-step — Admin approves or rejects a step
router.put('/:id/admin-verify-step', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve/reject verification steps.' });
    }

    const { step, status } = req.body;
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    if (['aadhaar', 'ruralAddress', 'sportsCert', 'videoReview', 'coachEndorsement'].includes(step)) {
      if (!athlete.verification[step]) athlete.verification[step] = { status: 'none' };
      athlete.verification[step].status = status; // 'approved' or 'rejected'
    }

    // Update overall status
    const v = athlete.verification;
    const steps = ['aadhaar', 'ruralAddress', 'sportsCert', 'videoReview', 'coachEndorsement'];
    const allApproved = steps.every(s => v[s]?.status === 'approved');
    const anyPending = steps.some(s => v[s]?.status === 'pending');

    if (allApproved) {
      athlete.verification.status = 'verified';
    } else if (anyPending) {
      athlete.verification.status = 'pending';
    } else {
      athlete.verification.status = 'unverified';
    }

    await athlete.save();
    res.json(athlete.verification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/athletes/admin/pending-verifications — Admin lists athletes with pending steps
router.get('/admin/pending-verifications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access this.' });
    }

    const pendingAthletes = await Athlete.find({
      $or: [
        { 'verification.aadhaar.status': 'pending' },
        { 'verification.ruralAddress.status': 'pending' },
        { 'verification.sportsCert.status': 'pending' },
        { 'verification.videoReview.status': 'pending' },
        { 'verification.coachEndorsement.status': 'pending' }
      ]
    });

    res.json(pendingAthletes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
