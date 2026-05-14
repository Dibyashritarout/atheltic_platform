const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  type: { type: String, required: true, trim: true }, // Sprain, Fracture, Strain, Tendinitis, etc.
  bodyPart: { type: String, required: true, trim: true }, // Knee, Ankle, Shoulder, etc.
  severity: { type: String, enum: ['minor', 'moderate', 'severe'], default: 'minor' },
  description: { type: String, maxlength: 1000 },
  dateOccurred: { type: Date, default: Date.now },
  recoveryStatus: { type: String, enum: ['active', 'recovering', 'recovered'], default: 'active' },
  expectedRecoveryDays: { type: Number, min: 1 },
  actualRecoveryDate: { type: Date },
  treatmentNotes: { type: String, maxlength: 1000 },
  preventionTips: [{ type: String }],
  sport: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Injury', injurySchema);
