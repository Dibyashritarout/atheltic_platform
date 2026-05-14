const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  organization: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  sport: { type: String, trim: true },
  requirements: { type: String },
  deadline: { type: Date },
  stipend: { type: String },
  applicationLink: { type: String },
  matchedAthletes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Athlete' }],
  isActive: { type: Boolean, default: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
