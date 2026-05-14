const mongoose = require('mongoose');
const Application = require('./models/Application');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/athletes-platform';

async function createTestApplication() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const athleteId = '6a04e3a7ee661b86b0650b73';
    const userId = '6a04d855ee661b86b06507b6';
    const oppId = '69d95e795638e6493b998250';

    const verificationSteps = [
      { name: 'Aadhaar', fileUrl: null, status: 'pending', uploadedAt: null },
      { name: 'Panchayat Certificate', fileUrl: null, status: 'pending', uploadedAt: null },
      { name: 'Sports Certificate', fileUrl: null, status: 'pending', uploadedAt: null },
      { name: 'Performance Video', fileUrl: null, status: 'pending', uploadedAt: null },
      { name: 'Coach Endorsement', fileUrl: null, status: 'pending', uploadedAt: null }
    ];

    const app = new Application({
      athlete: athleteId,
      applicant: userId,
      opportunity: oppId,
      message: 'I would like to apply for this opportunity',
      status: 'pending',
      appliedAt: new Date(),
      verificationSteps
    });

    const saved = await app.save();
    console.log('Created application:', saved._id);
    console.log('Verification steps:', saved.verificationSteps);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createTestApplication();
