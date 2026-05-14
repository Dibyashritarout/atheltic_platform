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
    aadhaar: { 
      status: { type: String, enum: ['approved', 'rejected', 'pending', 'none'], default: 'none' },
      fileUrl: { type: String }
    },
    ruralAddress: { 
      status: { type: String, enum: ['approved', 'rejected', 'pending', 'none'], default: 'none' },
      fileUrl: { type: String }
    },
    sportsCert: { 
      status: { type: String, enum: ['approved', 'rejected', 'pending', 'none'], default: 'none' },
      fileUrl: { type: String }
    },
    videoReview: { 
      status: { type: String, enum: ['approved', 'rejected', 'pending', 'none'], default: 'none' },
      fileUrl: { type: String }
    },
    coachEndorsement: { 
      status: { type: String, enum: ['approved', 'rejected', 'pending', 'none'], default: 'none' },
      fileUrl: { type: String }
    },
    status: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Athlete', athleteSchema);
