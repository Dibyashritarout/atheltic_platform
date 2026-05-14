const Notification = require('../models/Notification');

// Global notification handlers map
let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const createNotification = async (userId, type, title, message, data = {}, actionUrl = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      actionUrl
    });
    
    // Emit real-time notification via Socket.io
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('notification', notification);
    }
    
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

const notifyPerformanceAdded = async (athlete, performance) => {
  await createNotification(
    athlete._id,
    'performance',
    '🎯 Performance Logged!',
    `New performance entry recorded: ${performance.sport || 'Performance'}`,
    { performanceId: performance._id },
    `/athletes/${athlete._id}`
  );
};

const notifyAchievementUnlocked = async (athlete, achievement) => {
  await createNotification(
    athlete._id,
    'achievement',
    `🏆 Achievement Unlocked!`,
    achievement.title,
    { achievement },
    `/athletes/${athlete._id}`
  );
};

const notifyOpportunityMatched = async (athlete, opportunity, score) => {
  if (score >= 85) {
    await createNotification(
      athlete._id,
      'opportunity',
      '🎯 Great Match Found!',
      `New opportunity: ${opportunity.title}`,
      { opportunityId: opportunity._id, score },
      `/opportunities/${opportunity._id}`
    );
  }
};

const notifyVerificationComplete = async (athlete, step) => {
  const steps = {
    aadhaar: 'Aadhaar Verified ✓',
    ruralAddress: 'Address Verified ✓',
    sportsCert: 'Sports Certificate Verified ✓',
    videoReview: 'Video Review Completed ✓',
    coachEndorsement: 'Coach Endorsement Received ✓'
  };
  
  await createNotification(
    athlete._id,
    'verification',
    `✅ Verification Step Complete!`,
    steps[step] || 'Verification step completed',
    { step, athlete: athlete._id },
    `/athletes/${athlete._id}`
  );
};

const notifyInjuryRisk = async (athlete, riskLevel) => {
  if (riskLevel.level === 'high') {
    await createNotification(
      athlete._id,
      'injury',
      '⚠️ Injury Risk Alert',
      `High injury risk detected. Take appropriate recovery measures.`,
      { riskLevel: riskLevel.level },
      `/athletes/${athlete._id}`
    );
  }
};

module.exports = {
  setIO,
  createNotification,
  notifyPerformanceAdded,
  notifyAchievementUnlocked,
  notifyOpportunityMatched,
  notifyVerificationComplete,
  notifyInjuryRisk
};
