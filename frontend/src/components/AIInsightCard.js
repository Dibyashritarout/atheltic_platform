import React, { useState, useEffect, useRef } from 'react';
import { RadarChart } from './PerformanceChart';
import './AIInsightCard.css';

/**
 * Animated Score Gauge — circular SVG gauge with animated fill
 */
function ScoreGauge({ score, size = 140, label = 'AI Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let frame;
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * ease));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const getColor = (s) => {
    if (s >= 85) return '#FFD700';
    if (s >= 70) return '#C0C0C0';
    if (s >= 50) return '#EF9F27';
    if (s >= 30) return '#5DCAA5';
    return '#888780';
  };

  const color = getColor(score);
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="score-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.1s ease' }}
        />
      </svg>
      <div className="gauge-inner">
        <div className="gauge-score" style={{ color }}>{animatedScore}</div>
        <div className="gauge-label">{label}</div>
      </div>
    </div>
  );
}

/**
 * Animated Counter
 */
function AnimatedNum({ value, suffix = '', duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Number((value * ease).toFixed(1)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <>{display}{suffix}</>;
}

/**
 * AI Insight Card — displays full AI analysis
 */
export default function AIInsightCard({ analysis, athleteName }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysis) return null;

  if (analysis.error && analysis.overallScore === 0) {
    return (
      <div className="ai-card ai-card-empty">
        <div className="ai-empty-icon">🤖</div>
        <h3>AI Analysis Unavailable</h3>
        <p>{analysis.error}</p>
      </div>
    );
  }

  const { overallScore, scores, trends, potential, recommendations, bestPerformances, totalSessions } = analysis;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'recommendations', label: 'Training', icon: '🎯' },
  ];

  return (
    <div className="ai-card">
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-badge">
            <span className="ai-badge-dot" />
            AI-Powered Analysis
          </div>
          <h3>Performance Intelligence</h3>
          <p>Analysis for <strong>{athleteName}</strong> · {totalSessions} training sessions</p>
        </div>
        <ScoreGauge score={overallScore} />
      </div>

      {/* Potential Classification */}
      <div className="ai-potential" style={{ borderColor: potential.color + '30' }}>
        <span className="ai-potential-emoji">{potential.emoji}</span>
        <div>
          <div className="ai-potential-level" style={{ color: potential.color }}>{potential.level}</div>
          <div className="ai-potential-desc">{potential.description}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`ai-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="ai-tab-content">
        {activeTab === 'overview' && (
          <div className="ai-overview">
            {/* Metric Scores */}
            <div className="ai-metrics-grid">
              {scores.jumpHeight !== null && (
                <div className="ai-metric-card">
                  <div className="ai-metric-icon">⬆️</div>
                  <div className="ai-metric-info">
                    <div className="ai-metric-name">Vertical Jump</div>
                    <div className="ai-metric-best">{bestPerformances?.jumpHeight || '—'} cm</div>
                  </div>
                  <div className="ai-metric-bar-wrap">
                    <div className="ai-metric-bar" style={{ width: `${scores.jumpHeight}%`, background: `linear-gradient(90deg, #1D9E75, #5DCAA5)` }} />
                  </div>
                  <div className="ai-metric-score">{scores.jumpHeight}/100</div>
                </div>
              )}
              {scores.jumpLength !== null && (
                <div className="ai-metric-card">
                  <div className="ai-metric-icon">↗️</div>
                  <div className="ai-metric-info">
                    <div className="ai-metric-name">Long Jump</div>
                    <div className="ai-metric-best">{bestPerformances?.jumpLength || '—'} m</div>
                  </div>
                  <div className="ai-metric-bar-wrap">
                    <div className="ai-metric-bar" style={{ width: `${scores.jumpLength}%`, background: `linear-gradient(90deg, #EF9F27, #F5C264)` }} />
                  </div>
                  <div className="ai-metric-score">{scores.jumpLength}/100</div>
                </div>
              )}
              {scores.runningSpeed !== null && (
                <div className="ai-metric-card">
                  <div className="ai-metric-icon">⚡</div>
                  <div className="ai-metric-info">
                    <div className="ai-metric-name">Sprint Speed</div>
                    <div className="ai-metric-best">{bestPerformances?.runningSpeed || '—'} km/h</div>
                  </div>
                  <div className="ai-metric-bar-wrap">
                    <div className="ai-metric-bar" style={{ width: `${scores.runningSpeed}%`, background: `linear-gradient(90deg, #9333EA, #C084FC)` }} />
                  </div>
                  <div className="ai-metric-score">{scores.runningSpeed}/100</div>
                </div>
              )}
              {scores.consistency !== null && (
                <div className="ai-metric-card">
                  <div className="ai-metric-icon">📅</div>
                  <div className="ai-metric-info">
                    <div className="ai-metric-name">Consistency</div>
                    <div className="ai-metric-best">{totalSessions} sessions</div>
                  </div>
                  <div className="ai-metric-bar-wrap">
                    <div className="ai-metric-bar" style={{ width: `${scores.consistency}%`, background: `linear-gradient(90deg, #3B82F6, #60A5FA)` }} />
                  </div>
                  <div className="ai-metric-score">{scores.consistency}/100</div>
                </div>
              )}
            </div>

            {/* Radar Chart */}
            {scores && (
              <div className="ai-radar-section">
                <div className="section-title-sm">Performance Profile</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <RadarChart scores={{
                    'Jump Height': scores.jumpHeight || 0,
                    'Jump Length': scores.jumpLength || 0,
                    'Sprint Speed': scores.runningSpeed || 0,
                    'Consistency': scores.consistency || 0,
                    'Improvement': scores.improvement || 0,
                  }} size={220} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="ai-trends">
            {Object.entries(trends).map(([key, trend]) => {
              if (!trend) return null;
              const trendIcons = { improving: '📈', declining: '📉', stable: '➡️' };
              const trendColors = { improving: '#5DCAA5', declining: '#f87171', stable: '#EF9F27' };
              return (
                <div key={key} className="ai-trend-card">
                  <div className="ai-trend-header">
                    <span className="ai-trend-icon">{trendIcons[trend.trend]}</span>
                    <span className="ai-trend-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    <span className="ai-trend-badge" style={{ color: trendColors[trend.trend], borderColor: trendColors[trend.trend] + '40' }}>
                      {trend.trend}
                    </span>
                  </div>
                  <div className="ai-trend-stats">
                    <div><span>First:</span> <strong>{trend.first}</strong></div>
                    <div><span>Latest:</span> <strong>{trend.last}</strong></div>
                    <div><span>Best:</span> <strong>{trend.best}</strong></div>
                    <div><span>Avg:</span> <strong>{trend.average}</strong></div>
                  </div>
                  <div className="ai-trend-improvement" style={{ color: trendColors[trend.trend] }}>
                    {trend.improvementPct > 0 ? '+' : ''}{trend.improvementPct}% change over {trend.dataPoints} sessions
                  </div>
                  {trend.predictions && trend.predictions.length > 0 && (
                    <div className="ai-trend-predictions">
                      <span className="ai-trend-pred-label">🔮 Predicted next values:</span>
                      <div className="ai-trend-pred-vals">
                        {trend.predictions.map((p, i) => (
                          <span key={i} className="ai-pred-chip">Session +{i + 1}: <strong>{p}</strong></span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="ai-trend-confidence">
                    <span>Model confidence (R²):</span>
                    <div className="ai-confidence-bar-wrap">
                      <div className="ai-confidence-bar" style={{ width: `${trend.r2 * 100}%` }} />
                    </div>
                    <span>{(trend.r2 * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
            {Object.values(trends).every(t => !t) && (
              <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '2rem' }}>
                Not enough data points for trend analysis. Log more performances.
              </p>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="ai-recommendations">
            {recommendations.map((rec, i) => (
              <div key={i} className={`ai-rec-card priority-${rec.priority}`}>
                <div className="ai-rec-header">
                  <span className="ai-rec-icon">{rec.icon}</span>
                  <div>
                    <div className="ai-rec-category">{rec.category}</div>
                    <span className={`ai-rec-priority badge badge-${rec.priority === 'high' ? 'amber' : 'muted'}`}>
                      {rec.priority} priority
                    </span>
                  </div>
                </div>
                <p className="ai-rec-text">{rec.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
