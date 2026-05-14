const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  jumpHeight: { type: Number, min: 0, comment: 'in cm' },
  jumpLength: { type: Number, min: 0, comment: 'in meters' },
  runningDistance: { type: Number, min: 0, comment: 'in meters' },
  runningTime: { type: Number, min: 0, comment: 'in seconds' },
  runningSpeed: { type: Number, min: 0, comment: 'in km/h' },
  videoUrl: { type: String },
  notes: { type: String, maxlength: 500 },
  sport: { type: String },
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);
