const mongoose = require('mongoose');

const verificationStepSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Aadhaar Identity Verification"
  fileUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalNotes: { type: String },
  approvedAt: { type: Date },
});

const applicationSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: { type: String, maxlength: 1000 },
  adminNotes: { type: String, maxlength: 500 },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  
  // Verification steps (blue tick verification)
  verificationSteps: [verificationStepSchema],
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ athlete: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
