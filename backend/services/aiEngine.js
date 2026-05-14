/**
 * AthletesBridge — AI Performance Prediction Engine
 * 
 * Uses statistical analysis and sport-science benchmarks to:
 * 1. Score athletes (0-100) across multiple metrics
 * 2. Predict future performance via linear regression
 * 3. Classify potential: Emerging → Promising → Elite → Olympic-Track
 * 4. Generate actionable training recommendations
 */

// ── National-level benchmarks (India, ages 16-25) ─────────────────────────────
const BENCHMARKS = {
  jumpHeight:    { novice: 30, average: 50, good: 65, elite: 80, worldClass: 95 }, // cm
  jumpLength:    { novice: 2.5, average: 4.0, good: 5.5, elite: 7.0, worldClass: 8.5 }, // m
  runningSpeed:  { novice: 15, average: 22, good: 28, elite: 33, worldClass: 38 }, // km/h
  runningTime100m: { novice: 16, average: 13, good: 11.5, elite: 10.5, worldClass: 9.8 }, // seconds (lower = better)
};

// ── Metric weights for overall score ──────────────────────────────────────────
const WEIGHTS = {
  jumpHeight: 0.30,
  jumpLength: 0.25,
  runningSpeed: 0.25,
  consistency: 0.10,
  improvement: 0.10,
};

// ── Helper: Linear Regression ─────────────────────────────────────────────────
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const { x, y } of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² correlation
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const { x, y } of points) {
    const pred = slope * x + intercept;
    ssRes += (y - pred) ** 2;
    ssTot += (y - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

// ── Score a single metric against benchmarks (0-100) ──────────────────────────
function scoreMetric(value, benchmark, inverse = false) {
  if (!value || value <= 0) return null;

  let normalized;
  if (inverse) {
    // For time-based metrics (lower is better)
    if (value >= benchmark.novice) normalized = 10;
    else if (value <= benchmark.worldClass) normalized = 100;
    else {
      normalized = 10 + 90 * (benchmark.novice - value) / (benchmark.novice - benchmark.worldClass);
    }
  } else {
    if (value <= benchmark.novice) normalized = Math.max(5, (value / benchmark.novice) * 20);
    else if (value >= benchmark.worldClass) normalized = 100;
    else {
      const ranges = [
        { min: benchmark.novice, max: benchmark.average, scoreMin: 20, scoreMax: 45 },
        { min: benchmark.average, max: benchmark.good, scoreMin: 45, scoreMax: 65 },
        { min: benchmark.good, max: benchmark.elite, scoreMin: 65, scoreMax: 85 },
        { min: benchmark.elite, max: benchmark.worldClass, scoreMin: 85, scoreMax: 100 },
      ];
      for (const r of ranges) {
        if (value <= r.max) {
          normalized = r.scoreMin + (r.scoreMax - r.scoreMin) * (value - r.min) / (r.max - r.min);
          break;
        }
      }
    }
  }

  return Math.round(Math.min(100, Math.max(0, normalized || 0)));
}

// ── Analyze trends for a metric ───────────────────────────────────────────────
function analyzeTrend(performances, metricKey) {
  const points = performances
    .filter(p => p[metricKey] && p[metricKey] > 0)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    .map((p, i) => ({ x: i, y: p[metricKey], date: p.recordedAt }));

  if (points.length < 2) return null;

  const { slope, intercept, r2 } = linearRegression(points);

  // Predict next 3 data points
  const predictions = [];
  for (let i = 1; i <= 3; i++) {
    const futureX = points.length - 1 + i;
    const predicted = Math.max(0, slope * futureX + intercept);
    predictions.push(Number(predicted.toFixed(2)));
  }

  const firstVal = points[0].y;
  const lastVal = points[points.length - 1].y;
  const improvementPct = firstVal > 0 ? ((lastVal - firstVal) / firstVal * 100) : 0;

  return {
    dataPoints: points.length,
    first: firstVal,
    last: lastVal,
    best: Math.max(...points.map(p => p.y)),
    average: Number((points.reduce((s, p) => s + p.y, 0) / points.length).toFixed(2)),
    slope: Number(slope.toFixed(4)),
    r2: Number(r2.toFixed(3)),
    trend: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
    improvementPct: Number(improvementPct.toFixed(1)),
    predictions,
  };
}

// ── Classify athlete potential ────────────────────────────────────────────────
function classifyPotential(overallScore, trends) {
  // Factor in improvement trends
  const improvingMetrics = Object.values(trends).filter(t => t && t.trend === 'improving').length;
  const totalMetrics = Object.values(trends).filter(t => t).length;
  const improvementRatio = totalMetrics > 0 ? improvingMetrics / totalMetrics : 0;

  // Boost score for consistent improvement
  const adjustedScore = overallScore + (improvementRatio * 8);

  if (adjustedScore >= 85) return { level: 'Olympic-Track', emoji: '🏅', color: '#FFD700', description: 'Exceptional potential — national/international level athlete' };
  if (adjustedScore >= 70) return { level: 'Elite', emoji: '⭐', color: '#C0C0C0', description: 'Strong performer — competitive at state/national level' };
  if (adjustedScore >= 50) return { level: 'Promising', emoji: '🔥', color: '#EF9F27', description: 'Good foundation — with focused training can reach elite level' };
  if (adjustedScore >= 30) return { level: 'Emerging', emoji: '🌱', color: '#5DCAA5', description: 'Developing athlete — consistent training will yield results' };
  return { level: 'Beginner', emoji: '🎯', color: '#888780', description: 'Starting out — focus on fundamentals and consistency' };
}

// ── Generate training recommendations ─────────────────────────────────────────
function generateRecommendations(scores, trends, potential) {
  const recs = [];

  // Metric-specific recommendations
  if (scores.jumpHeight !== null && scores.jumpHeight < 50) {
    recs.push({
      category: 'Vertical Jump',
      icon: '⬆️',
      priority: scores.jumpHeight < 30 ? 'high' : 'medium',
      text: 'Focus on plyometric exercises — box jumps, depth jumps, and squat jumps. Include 3 sessions per week with progressive overload.',
    });
  }

  if (scores.jumpLength !== null && scores.jumpLength < 50) {
    recs.push({
      category: 'Standing Long Jump',
      icon: '↗️',
      priority: scores.jumpLength < 30 ? 'high' : 'medium',
      text: 'Practice approach technique and hip flexor power. Incorporate broad jumps and bounding drills into training.',
    });
  }

  if (scores.runningSpeed !== null && scores.runningSpeed < 50) {
    recs.push({
      category: 'Sprint Speed',
      icon: '⚡',
      priority: scores.runningSpeed < 30 ? 'high' : 'medium',
      text: 'Interval training (400m repeats), hill sprints, and resistance running will improve acceleration and top speed.',
    });
  }

  // Trend-based recommendations
  const decliningMetrics = Object.entries(trends).filter(([, t]) => t && t.trend === 'declining');
  if (decliningMetrics.length > 0) {
    recs.push({
      category: 'Performance Recovery',
      icon: '📉',
      priority: 'high',
      text: `Declining trend detected in ${decliningMetrics.map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}. Consider checking for overtraining, inadequate recovery, or nutritional gaps.`,
    });
  }

  // Consistency recommendations
  if (scores.consistency !== null && scores.consistency < 40) {
    recs.push({
      category: 'Training Consistency',
      icon: '📅',
      priority: 'high',
      text: 'Performance data shows irregular training. Establish a structured weekly schedule with at least 4-5 training days for optimal gains.',
    });
  }

  // General level-based advice
  if (potential.level === 'Elite' || potential.level === 'Olympic-Track') {
    recs.push({
      category: 'Competition Exposure',
      icon: '🏟️',
      priority: 'medium',
      text: 'At your level, regular competition exposure is critical. Target district and state-level meets to build competitive experience.',
    });
  }

  if (potential.level === 'Beginner' || potential.level === 'Emerging') {
    recs.push({
      category: 'Foundation Building',
      icon: '🏗️',
      priority: 'high',
      text: 'Focus on general fitness — running endurance, core strength, and flexibility. Build a solid base before specializing.',
    });
  }

  // Always include nutrition
  recs.push({
    category: 'Nutrition & Recovery',
    icon: '🥗',
    priority: 'medium',
    text: 'Ensure adequate protein intake (1.2-1.6g/kg bodyweight), hydration, and 7-9 hours of sleep for optimal recovery and performance gains.',
  });

  return recs.sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1));
}

// ── MAIN: Full AI Analysis ────────────────────────────────────────────────────
function analyzeAthlete(performances, athlete) {
  if (!performances || performances.length === 0) {
    return {
      error: 'No performance data available for analysis.',
      overallScore: 0,
      potential: classifyPotential(0, {}),
      recommendations: [{
        category: 'Get Started',
        icon: '🚀',
        priority: 'high',
        text: 'Start logging performance data to unlock AI-powered insights and predictions.',
      }],
    };
  }

  // Analyze trends for each metric
  const trends = {
    jumpHeight: analyzeTrend(performances, 'jumpHeight'),
    jumpLength: analyzeTrend(performances, 'jumpLength'),
    runningSpeed: analyzeTrend(performances, 'runningSpeed'),
  };

  // Score best performances
  const bestJumpHeight = Math.max(0, ...performances.map(p => p.jumpHeight || 0));
  const bestJumpLength = Math.max(0, ...performances.map(p => p.jumpLength || 0));
  const bestRunningSpeed = Math.max(0, ...performances.map(p => p.runningSpeed || 0));

  const scores = {
    jumpHeight: scoreMetric(bestJumpHeight, BENCHMARKS.jumpHeight),
    jumpLength: scoreMetric(bestJumpLength, BENCHMARKS.jumpLength),
    runningSpeed: scoreMetric(bestRunningSpeed, BENCHMARKS.runningSpeed),
  };

  // Consistency score (based on frequency of logging)
  const sortedPerfs = [...performances].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  let consistencyScore = 50;
  if (sortedPerfs.length >= 3) {
    const daySpan = (new Date(sortedPerfs[sortedPerfs.length - 1].recordedAt) - new Date(sortedPerfs[0].recordedAt)) / (1000 * 60 * 60 * 24);
    const avgGap = daySpan / (sortedPerfs.length - 1);
    if (avgGap <= 7) consistencyScore = 90;
    else if (avgGap <= 14) consistencyScore = 75;
    else if (avgGap <= 30) consistencyScore = 55;
    else consistencyScore = 30;
  }
  scores.consistency = consistencyScore;

  // Improvement score
  const improvingCount = Object.values(trends).filter(t => t && t.trend === 'improving').length;
  const totalTrends = Object.values(trends).filter(t => t).length;
  scores.improvement = totalTrends > 0 ? Math.round((improvingCount / totalTrends) * 100) : 50;

  // Overall weighted score
  const activeScores = Object.entries(scores).filter(([, v]) => v !== null);
  let overallScore = 0;
  let totalWeight = 0;
  for (const [key, val] of activeScores) {
    const weight = WEIGHTS[key] || 0.1;
    overallScore += val * weight;
    totalWeight += weight;
  }
  overallScore = totalWeight > 0 ? Math.round(overallScore / totalWeight) : 0;

  // Classify
  const potential = classifyPotential(overallScore, trends);

  // Generate recommendations
  const recommendations = generateRecommendations(scores, trends, potential);

  return {
    overallScore,
    scores,
    trends,
    potential,
    recommendations,
    bestPerformances: {
      jumpHeight: bestJumpHeight > 0 ? bestJumpHeight : null,
      jumpLength: bestJumpLength > 0 ? bestJumpLength : null,
      runningSpeed: bestRunningSpeed > 0 ? bestRunningSpeed : null,
    },
    totalSessions: performances.length,
    analyzedAt: new Date().toISOString(),
  };
}

// ── Opportunity Matching Score ─────────────────────────────────────────────────
function calculateMatchScore(athlete, performances, opportunity) {
  let breakdown = {
    sportMatch: 0,
    performanceLevel: 0,
    ruralPreference: 0,
    ageEligibility: 0,
    profileCompleteness: 0
  };

  let reasoningPoints = [];

  // Sport match
  if (opportunity.sport && athlete.sports?.length > 0) {
    const sportMatch = athlete.sports.some(s => s.toLowerCase() === opportunity.sport.toLowerCase());
    if (sportMatch) {
      breakdown.sportMatch = 100;
      reasoningPoints.push(`Matches the required sport (${opportunity.sport}).`);
    } else if (opportunity.sport.toLowerCase() === 'any') {
      breakdown.sportMatch = 80;
      reasoningPoints.push(`Opportunity is open to all sports.`);
    } else {
      breakdown.sportMatch = 0;
      reasoningPoints.push(`Does not match the required sport (${opportunity.sport}).`);
    }
  } else if (!opportunity.sport) {
    breakdown.sportMatch = 100;
    reasoningPoints.push(`No specific sport required.`);
  }

  // Rural priority
  if (athlete.isRural) {
    breakdown.ruralPreference = 100;
    reasoningPoints.push(`Rural background gives a priority boost.`);
  } else {
    breakdown.ruralPreference = 50;
  }

  // Performance level
  if (performances && performances.length > 0) {
    const analysis = analyzeAthlete(performances, athlete);
    breakdown.performanceLevel = analysis.overallScore || 0;
    if (analysis.overallScore > 75) {
      reasoningPoints.push(`Strong performance history (AI Score: ${analysis.overallScore}).`);
    } else if (analysis.overallScore > 40) {
      reasoningPoints.push(`Moderate performance history (AI Score: ${analysis.overallScore}).`);
    }
  } else {
    breakdown.performanceLevel = 20; // baseline for no data
    reasoningPoints.push(`Adding a performance video or metrics could raise this score.`);
  }

  // Age appropriateness
  if (athlete.age) {
    if (athlete.age >= 14 && athlete.age <= 25) {
      breakdown.ageEligibility = 100;
      reasoningPoints.push(`Age ${athlete.age} is within prime development window.`);
    } else if (athlete.age >= 10 && athlete.age <= 30) {
      breakdown.ageEligibility = 70;
      reasoningPoints.push(`Age ${athlete.age} is acceptable but outside optimal bracket.`);
    } else {
      breakdown.ageEligibility = 30;
    }
  } else {
    breakdown.ageEligibility = 50;
  }

  // Profile completeness
  let completenessFields = ['name', 'email', 'phone', 'state', 'city', 'bio', 'profileImage'];
  let filledFields = completenessFields.filter(f => athlete[f]);
  breakdown.profileCompleteness = Math.round((filledFields.length / completenessFields.length) * 100);

  // Overall Score (Weighted)
  const score = Math.round(
    (breakdown.sportMatch * 0.4) +
    (breakdown.performanceLevel * 0.3) +
    (breakdown.ruralPreference * 0.15) +
    (breakdown.ageEligibility * 0.1) +
    (breakdown.profileCompleteness * 0.05)
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown,
    reasoning: reasoningPoints.join(' '),
    compatible: score >= 40,
  };
}

// ── Achievements Evaluation ──────────────────────────────────────────────────
function evaluateAchievements(athlete, performances) {
  const currentAchievements = athlete.achievements?.map(a => a.title) || [];
  const newAchievements = [];

  if (!performances || performances.length === 0) return newAchievements;

  const bestSpeed = Math.max(...performances.map(p => p.runningSpeed || 0));
  const bestJump = Math.max(...performances.map(p => p.jumpHeight || 0));
  
  if (athlete.isRural && !currentAchievements.includes('Rural Hero')) {
    newAchievements.push({ title: 'Rural Hero', type: 'auto', icon: '🌾' });
  }

  if (bestSpeed > 30 && !currentAchievements.includes('Speed Demon')) {
    newAchievements.push({ title: 'Speed Demon', type: 'auto', icon: '⚡' });
  }

  if (bestJump > 60 && !currentAchievements.includes('High Flyer')) {
    newAchievements.push({ title: 'High Flyer', type: 'auto', icon: '🚀' });
  }

  if (performances.length >= 10 && !currentAchievements.includes('Consistent Trainer')) {
    newAchievements.push({ title: 'Consistent Trainer', type: 'auto', icon: '📅' });
  }

  return newAchievements;
}

// ── Injury Prediction ─────────────────────────────────────────────────────────
function predictInjuryRisk(performances) {
  if (!performances || performances.length < 3) return null;

  // Sort performances by date
  const sorted = [...performances].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const recent = sorted.slice(-5); // last 5 sessions
  
  // Check if 5 sessions happened within 7 days
  const latestDate = new Date(recent[recent.length - 1].recordedAt);
  const oldestDate = new Date(recent[0].recordedAt);
  const daysDiff = (latestDate - oldestDate) / (1000 * 60 * 60 * 24);
  
  let riskLevel = { level: 'Low', emoji: '✅', color: '#1D9E75' };
  let warnings = [];
  let activeInjuries = 0;
  let totalInjuries = 0; // These would typically come from an Injury model, but we calculate risk here

  if (recent.length >= 4 && daysDiff <= 7) {
    warnings.push('High training volume: 4+ sessions in a week without sufficient rest.');
    riskLevel = { level: 'Moderate', emoji: '⚠️', color: '#EF9F27' };
  }

  // Check for sudden drop in performance
  if (recent.length >= 3) {
    const lastPerf = recent[recent.length - 1];
    const prevPerf = recent[recent.length - 2];
    
    if (lastPerf.runningSpeed && prevPerf.runningSpeed && lastPerf.runningSpeed < prevPerf.runningSpeed * 0.8) {
      warnings.push('Sudden drop in sprint speed detected (20%+ decrease). Check for hamstring or knee fatigue.');
      riskLevel = { level: 'High', emoji: '🚨', color: '#e11d48' };
    }
  }

  if (warnings.length > 0) {
    return {
      riskLevel,
      warnings,
      activeInjuries: riskLevel.level === 'High' ? 1 : 0,
      totalInjuries: 1
    };
  }
  
  return { riskLevel, warnings: [], activeInjuries: 0, totalInjuries: 0 };
}

module.exports = { analyzeAthlete, calculateMatchScore, scoreMetric, linearRegression, evaluateAchievements, predictInjuryRisk };
