const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Application = require('./models/Application');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/athletes-platform';

async function testVerificationWorkflow() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the test application
    const appId = '6a05b6b1894edfafb6d632b5';
    const app = await Application.findById(appId);
    
    if (!app) {
      console.log('❌ Application not found');
      process.exit(1);
    }

    console.log('📋 Initial Application State:');
    console.log('─'.repeat(60));
    console.log(`Application ID: ${app._id}`);
    console.log(`Athlete: ${app.athlete}`);
    console.log(`Status: ${app.status}`);
    console.log('\nVerification Steps:');
    app.verificationSteps.forEach((step, idx) => {
      console.log(`  ${idx + 1}. ${step.name}`);
      console.log(`     Status: ${step.status} (${step.fileUrl ? '✓ File uploaded' : '✗ No file'})`);
    });

    // Simulate file upload
    console.log('\n\n📤 Simulating File Upload (Step 1: Aadhaar)...');
    console.log('─'.repeat(60));
    
    const aadhaarStep = app.verificationSteps.find(s => s.name === 'Aadhaar');
    aadhaarStep.fileUrl = '/uploads/1715690400000-123456789.pdf';
    aadhaarStep.uploadedAt = new Date();
    // Status remains 'pending' after upload (awaiting admin review)
    
    await app.save();
    console.log(`✅ File uploaded for "${aadhaarStep.name}"`);
    console.log(`   Status: ${aadhaarStep.status} (awaiting admin review)`);
    console.log(`   File: ${aadhaarStep.fileUrl}`);

    // Simulate admin approval
    console.log('\n\n✔️ Simulating Admin Approval...');
    console.log('─'.repeat(60));
    
    aadhaarStep.status = 'approved';
    aadhaarStep.approvedBy = new mongoose.Types.ObjectId();
    aadhaarStep.approvalNotes = 'Document verified and approved';
    aadhaarStep.approvedAt = new Date();
    
    await app.save();
    console.log(`✅ "${aadhaarStep.name}" approved by admin`);
    console.log(`   Status: ${aadhaarStep.status}`);
    console.log(`   Notes: ${aadhaarStep.approvalNotes}`);

    // Simulate rejection on another step
    console.log('\n\n❌ Simulating Admin Rejection (Step 2)...');
    console.log('─'.repeat(60));
    
    const certStep = app.verificationSteps.find(s => s.name === 'Panchayat Certificate');
    certStep.fileUrl = '/uploads/1715690500000-987654321.pdf';
    certStep.uploadedAt = new Date();
    certStep.status = 'rejected';
    certStep.approvedBy = new mongoose.Types.ObjectId();
    certStep.approvalNotes = 'Document incomplete. Please resubmit with all pages.';
    certStep.approvedAt = new Date();
    
    await app.save();
    console.log(`❌ "${certStep.name}" rejected by admin`);
    console.log(`   Status: ${certStep.status}`);
    console.log(`   Notes: ${certStep.approvalNotes}`);

    // Show final state
    const finalApp = await Application.findById(appId);
    console.log('\n\n📊 Final Application State:');
    console.log('─'.repeat(60));
    console.log('Verification Steps Summary:\n');
    finalApp.verificationSteps.forEach((step, idx) => {
      const icon = step.status === 'approved' ? '✅' : step.status === 'rejected' ? '❌' : '⏳';
      console.log(`  ${icon} ${step.name}`);
      console.log(`     Status: ${step.status}`);
      if (step.fileUrl) console.log(`     File: ${step.fileUrl}`);
      if (step.approvalNotes) console.log(`     Notes: ${step.approvalNotes}`);
      console.log();
    });

    console.log('\n✅ Verification workflow simulation complete!');
    console.log('✅ All data saved to MongoDB\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testVerificationWorkflow();
