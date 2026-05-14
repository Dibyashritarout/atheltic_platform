const mongoose = require('mongoose');

const athleteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  age: { type: Number, min: 5, max: 60 },
  state: { type: String, trim: true },
  city: { type: String, trim: true },
  sports: [{ type: String }],
  isRural: { type: Boolean, default: false },
  bio: { type: String, maxlength: 1000 },
  profileImage: { type: String },
  achievements: [{
    title: { type: String, required: true },
    type: { type: String, enum: ['auto', 'verified'], default: 'auto' },
    icon: { type: String },
    dateEarned: { type: Date, default: Date.now }
  }],
  verification: {
    aadhaar: { type: Boolean, default: false },
    ruralAddress: { type: Boolean, default: false },
    sportsCert: { type: Boolean, default: false },
    videoReview: { type: Boolean, default: false },
    coachEndorsement: { type: Boolean, default: false },
    status: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Athlete', athleteSchema);
