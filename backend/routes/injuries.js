const express = require('express');
const router = express.Router();
const Injury = require('../models/Injury');
const Athlete = require('../models/Athlete');
const Performance = require('../models/Performance');
const auth = require('../middleware/auth');
const { assessInjuryRisk, getPreventionTips, estimateRecovery, getSportInjuryInfo } = require('../services/injuryEngine');

// POST /api/athletes/:id/injuries — log new injury
router.post('/athletes/:id/injuries', auth, async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    const { type, bodyPart, severity, description, dateOccurred, treatmentNotes, sport } = req.body;

    // Generate prevention tips based on body part and sport
    const preventionTips = getPreventionTips(bodyPart, sport || athlete.sports?.[0]);
    
    // Estimate recovery
    const recovery = estimateRecovery(severity, bodyPart);

    const injury = await Injury.create({
      athlete: req.params.id,
      type,
      bodyPart,
      severity,
      description,
      dateOccurred: dateOccurred || Date.now(),
      treatmentNotes,
      sport: sport || athlete.sports?.[0],
      preventionTips,
      expectedRecoveryDays: recovery.maxDays,
    });

    res.status(201).json({ injury, recovery });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/athletes/:id/injuries — get injury history
router.get('/athletes/:id/injuries', async (req, res) => {
  try {
    const injuries = await Injury.find({ athlete: req.params.id }).sort({ dateOccurred: -1 });
    res.json(injuries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/injuries/:id — update injury (status, notes, etc.)
router.put('/injuries/:id', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // If marking as recovered, set actual recovery date
    if (updates.recoveryStatus === 'recovered' && !updates.actualRecoveryDate) {
      updates.actualRecoveryDate = new Date();
    }

    const injury = await Injury.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!injury) return res.status(404).json({ error: 'Injury not found.' });

    res.json(injury);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/athletes/:id/injury-risk — AI risk assessment
router.get('/athletes/:id/injury-risk', async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found.' });

    const [injuries, performances] = await Promise.all([
      Injury.find({ athlete: req.params.id }),
      Performance.find({ athlete: req.params.id }).sort({ recordedAt: 1 }),
    ]);

    const riskAssessment = assessInjuryRisk(injuries, performances, athlete);
    const sportInfo = getSportInjuryInfo(athlete.sports?.[0]);

    res.json({ ...riskAssessment, sportInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/injuries/:id — delete injury record
router.delete('/injuries/:id', auth, async (req, res) => {
  try {
    const injury = await Injury.findByIdAndDelete(req.params.id);
    if (!injury) return res.status(404).json({ error: 'Injury not found.' });
    res.json({ message: 'Injury record deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
