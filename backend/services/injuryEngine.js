/**
 * AthletesBridge — Injury Prevention & Risk Analysis Engine
 * 
 * Analyzes training load, injury history, and sport-specific data to:
 * 1. Assess current injury risk level
 * 2. Generate prevention tips
 * 3. Predict recovery timelines
 * 4. Detect overtraining patterns
 */

// ── Common injury data by sport ───────────────────────────────────────────────
const SPORT_INJURIES = {
  athletics: {
    common: ['Hamstring strain', 'Shin splints', 'Ankle sprain', 'Knee tendinitis', 'Stress fracture'],
    bodyParts: ['Hamstring', 'Shin', 'Ankle', 'Knee', 'Foot'],
    riskFactors: ['Sudden speed increase', 'Hard surfaces', 'Poor warm-up', 'Inadequate footwear'],
  },
  basketball: {
    common: ['Ankle sprain', 'ACL tear', 'Finger jam', 'Knee tendinitis', 'Shin splints'],
    bodyParts: ['Ankle', 'Knee', 'Finger', 'Shin', 'Wrist'],
    riskFactors: ['Jumping fatigue', 'Court surface', 'Sudden direction changes', 'Contact injuries'],
  },
  football: {
    common: ['Hamstring strain', 'Groin pull', 'Ankle sprain', 'ACL injury', 'Concussion'],
    bodyParts: ['Hamstring', 'Groin', 'Ankle', 'Knee', 'Head'],
    riskFactors: ['Sudden sprints', 'Hard tackles', 'Wet surfaces', 'Muscular imbalance'],
  },
  cricket: {
    common: ['Shoulder injury', 'Lower back pain', 'Hamstring strain', 'Ankle sprain', 'Finger fracture'],
    bodyParts: ['Shoulder', 'Lower Back', 'Hamstring', 'Ankle', 'Finger'],
    riskFactors: ['Bowling overload', 'Fielding dives', 'Batting stance strain', 'Repetitive motion'],
  },
  kabaddi: {
    common: ['Knee ligament injury', 'Shoulder dislocation', 'Ankle sprain', 'Muscle strain', 'Concussion'],
    bodyParts: ['Knee', 'Shoulder', 'Ankle', 'Thigh', 'Head'],
    riskFactors: ['Contact tackles', 'Rapid direction change', 'Wrestling holds', 'Physical contact'],
  },
  wrestling: {
    common: ['Shoulder dislocation', 'Knee injury', 'Cauliflower ear', 'Neck strain', 'Skin infections'],
    bodyParts: ['Shoulder', 'Knee', 'Ear', 'Neck', 'Skin'],
    riskFactors: ['Submission holds', 'Takedowns', 'Weight cutting', 'Overtraining'],
  },
  boxing: {
    common: ['Hand fracture', 'Shoulder strain', 'Concussion', 'Bruised ribs', 'Wrist sprain'],
    bodyParts: ['Hand', 'Shoulder', 'Head', 'Ribs', 'Wrist'],
    riskFactors: ['Impact trauma', 'Repetitive punching', 'Poor technique', 'Insufficient hand wrapping'],
  },
  swimming: {
    common: ['Shoulder impingement', 'Knee breaststroker', 'Lower back pain', 'Neck strain', 'Ear infection'],
    bodyParts: ['Shoulder', 'Knee', 'Lower Back', 'Neck', 'Ear'],
    riskFactors: ['Overuse', 'Poor technique', 'High yardage', 'Flip turn stress'],
  },
  default: {
    common: ['Muscle strain', 'Ankle sprain', 'Knee tendinitis', 'Stress fracture', 'Lower back pain'],
    bodyParts: ['Ankle', 'Knee', 'Lower Back', 'Shoulder', 'Hamstring'],
    riskFactors: ['Overtraining', 'Poor warm-up', 'Inadequate rest', 'Improper technique'],
  },
};

// ── Recovery timelines (in days) ──────────────────────────────────────────────
const RECOVERY_TIMES = {
  'minor': { min: 3, max: 14 },
  'moderate': { min: 14, max: 42 },
  'severe': { min: 42, max: 180 },
};

const BODY_PART_RECOVERY_FACTOR = {
  'knee': 1.5,
  'shoulder': 1.3,
  'ankle': 1.0,
  'hamstring': 1.1,
  'back': 1.4,
  'lower back': 1.4,
  'wrist': 0.8,
  'finger': 0.7,
  'shin': 1.0,
  'hip': 1.3,
  'neck': 1.2,
  'head': 1.6,
  'foot': 1.1,
};

// ── Prevention Tips Database ──────────────────────────────────────────────────
const PREVENTION_TIPS = {
  knee: [
    'Strengthen quadriceps and hamstrings with balanced exercises',
    'Use proper footwear with adequate cushioning and support',
    'Practice single-leg balance exercises to improve stability',
    'Avoid sudden increases in running mileage (follow 10% rule)',
    'Include hip strengthening exercises — weak hips stress the knees',
  ],
  ankle: [
    'Perform balance board exercises 3-4 times per week',
    'Tape or brace ankles during high-risk activities',
    'Strengthen calf muscles with heel raises (3 sets of 15)',
    'Practice proprioception exercises on uneven surfaces',
    'Wear sport-specific footwear with ankle support',
  ],
  shoulder: [
    'Include rotator cuff strengthening (internal/external rotation)',
    'Avoid overhead movements when fatigued',
    'Practice scapular stabilization exercises',
    'Maintain shoulder flexibility with daily stretching',
    'Gradually increase throwing/bowling volume over weeks',
  ],
  hamstring: [
    'Nordic hamstring curls are proven to reduce strain risk by 51%',
    'Dynamic stretching before training, static stretching after',
    'Ensure adequate warm-up (10-15 min) before sprinting',
    'Strengthen glutes — weak glutes overload hamstrings',
    'Include eccentric hamstring exercises in routine',
  ],
  back: [
    'Strengthen core muscles with planks and bird-dogs',
    'Maintain proper posture during training and daily activities',
    'Include hip mobility exercises to reduce back stress',
    'Avoid heavy lifting with rounded spine',
    'Practice McGill Big 3: curl-up, side plank, bird-dog',
  ],
  general: [
    'Always warm up 10-15 minutes before training',
    'Cool down and stretch after every session',
    'Follow the 10% rule — increase training load by max 10% per week',
    'Get 7-9 hours of quality sleep for recovery',
    'Stay hydrated — drink water before, during, and after exercise',
    'Include 1-2 rest days per week',
    'Ensure adequate protein intake (1.2-1.6g per kg bodyweight)',
    'Listen to your body — pain is a warning signal',
    'Cross-train to avoid overuse of specific muscle groups',
    'Get regular sports physical examinations',
  ],
};

// ── Assess Injury Risk ────────────────────────────────────────────────────────
function assessInjuryRisk(injuries, performances, athlete) {
  const riskFactors = [];
  let riskScore = 0; // 0-100

  // 1. Injury History Analysis
  const totalInjuries = injuries.length;
  const recentInjuries = injuries.filter(inj => {
    const daysSince = (Date.now() - new Date(inj.dateOccurred)) / (1000 * 60 * 60 * 24);
    return daysSince <= 90;
  });
  const activeInjuries = injuries.filter(inj => inj.recoveryStatus === 'active');
  const recoveringInjuries = injuries.filter(inj => inj.recoveryStatus === 'recovering');

  if (activeInjuries.length > 0) {
    riskScore += 30;
    riskFactors.push({
      factor: 'Active Injuries',
      icon: '🚨',
      severity: 'high',
      detail: `${activeInjuries.length} active injur${activeInjuries.length > 1 ? 'ies' : 'y'} — training should be modified or paused`,
    });
  }

  if (recoveringInjuries.length > 0) {
    riskScore += 15;
    riskFactors.push({
      factor: 'Recovering',
      icon: '⚠️',
      severity: 'medium',
      detail: `${recoveringInjuries.length} injur${recoveringInjuries.length > 1 ? 'ies' : 'y'} in recovery — gradual return recommended`,
    });
  }

  if (recentInjuries.length >= 3) {
    riskScore += 20;
    riskFactors.push({
      factor: 'Frequent Injuries',
      icon: '📉',
      severity: 'high',
      detail: `${recentInjuries.length} injuries in last 90 days — indicates possible overtraining or biomechanical issues`,
    });
  } else if (recentInjuries.length >= 1) {
    riskScore += 8;
    riskFactors.push({
      factor: 'Recent Injury',
      icon: '💡',
      severity: 'low',
      detail: `${recentInjuries.length} injur${recentInjuries.length > 1 ? 'ies' : 'y'} in last 90 days`,
    });
  }

  // Check for recurring body part injuries
  const bodyPartCounts = {};
  injuries.forEach(inj => {
    const bp = (inj.bodyPart || '').toLowerCase();
    bodyPartCounts[bp] = (bodyPartCounts[bp] || 0) + 1;
  });
  
  const recurringParts = Object.entries(bodyPartCounts).filter(([, count]) => count >= 2);
  if (recurringParts.length > 0) {
    riskScore += 15;
    riskFactors.push({
      factor: 'Recurring Injuries',
      icon: '🔄',
      severity: 'high',
      detail: `Repeated injuries to: ${recurringParts.map(([part, count]) => `${part} (${count}x)`).join(', ')}`,
    });
  }

  // 2. Training Load Analysis
  if (performances && performances.length >= 3) {
    const sorted = [...performances].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    const recent = sorted.slice(-5);
    const older = sorted.slice(-10, -5);

    if (older.length > 0) {
      // Check for sudden training load spike
      const recentAvgSpeed = recent.reduce((s, p) => s + (p.runningSpeed || 0), 0) / recent.length;
      const olderAvgSpeed = older.reduce((s, p) => s + (p.runningSpeed || 0), 0) / older.length;
      
      if (olderAvgSpeed > 0 && recentAvgSpeed > olderAvgSpeed * 1.3) {
        riskScore += 12;
        riskFactors.push({
          factor: 'Training Spike',
          icon: '📈',
          severity: 'medium',
          detail: 'Rapid increase in training intensity detected — risk of overuse injury',
        });
      }
    }

    // Check training frequency
    const daysBetween = [];
    for (let i = 1; i < sorted.length; i++) {
      const gap = (new Date(sorted[i].recordedAt) - new Date(sorted[i - 1].recordedAt)) / (1000 * 60 * 60 * 24);
      daysBetween.push(gap);
    }
    const avgGap = daysBetween.reduce((s, g) => s + g, 0) / daysBetween.length;

    if (avgGap < 2) {
      riskScore += 10;
      riskFactors.push({
        factor: 'High Frequency',
        icon: '⏰',
        severity: 'medium',
        detail: 'Training very frequently with little rest — recovery days are essential',
      });
    }
  }

  // 3. Age Factor
  if (athlete?.age) {
    if (athlete.age < 14) {
      riskScore += 5;
      riskFactors.push({
        factor: 'Young Athlete',
        icon: '👶',
        severity: 'low',
        detail: 'Young athletes have growing bones — avoid excessive impact training',
      });
    } else if (athlete.age > 30) {
      riskScore += 5;
      riskFactors.push({
        factor: 'Age Consideration',
        icon: '📋',
        severity: 'low',
        detail: 'Extended recovery may be needed — focus on mobility and flexibility',
      });
    }
  }

  // Clamp risk score
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine risk level
  let riskLevel;
  if (riskScore >= 70) riskLevel = { level: 'High', color: '#EF4444', emoji: '🔴', description: 'Significant injury risk — reduce training intensity and consult a sports physician' };
  else if (riskScore >= 40) riskLevel = { level: 'Moderate', color: '#EF9F27', emoji: '🟡', description: 'Moderate risk — follow prevention protocols and ensure adequate recovery' };
  else if (riskScore >= 15) riskLevel = { level: 'Low', color: '#1D9E75', emoji: '🟢', description: 'Low risk — maintain current prevention practices' };
  else riskLevel = { level: 'Minimal', color: '#5DCAA5', emoji: '✅', description: 'Minimal risk — great job maintaining your health!' };

  return {
    riskScore,
    riskLevel,
    riskFactors,
    totalInjuries,
    activeInjuries: activeInjuries.length,
    recoveringInjuries: recoveringInjuries.length,
    analyzedAt: new Date().toISOString(),
  };
}

// ── Get Prevention Tips ───────────────────────────────────────────────────────
function getPreventionTips(bodyPart, sport) {
  const tips = [...(PREVENTION_TIPS.general || [])];
  
  const normalizedPart = (bodyPart || '').toLowerCase();
  for (const [key, partTips] of Object.entries(PREVENTION_TIPS)) {
    if (normalizedPart.includes(key)) {
      tips.unshift(...partTips);
      break;
    }
  }

  return tips.slice(0, 6);
}

// ── Estimate Recovery ─────────────────────────────────────────────────────────
function estimateRecovery(severity, bodyPart) {
  const base = RECOVERY_TIMES[severity] || RECOVERY_TIMES.moderate;
  const normalizedPart = (bodyPart || '').toLowerCase();
  
  let factor = 1.0;
  for (const [key, f] of Object.entries(BODY_PART_RECOVERY_FACTOR)) {
    if (normalizedPart.includes(key)) {
      factor = f;
      break;
    }
  }

  return {
    minDays: Math.round(base.min * factor),
    maxDays: Math.round(base.max * factor),
    factor,
  };
}

// ── Get Sport-Specific Injury Info ────────────────────────────────────────────
function getSportInjuryInfo(sport) {
  const normalized = (sport || '').toLowerCase();
  return SPORT_INJURIES[normalized] || SPORT_INJURIES.default;
}

module.exports = { assessInjuryRisk, getPreventionTips, estimateRecovery, getSportInjuryInfo };
