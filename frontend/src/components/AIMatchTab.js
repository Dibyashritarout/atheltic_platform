import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './AIMatchTab.css';

export default function AIMatchTab({ athleteId }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`/api/athletes/${athleteId}/opportunities`);
        setOpportunities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [athleteId]);

  if (loading) return <div className="spinner" style={{ margin: '2rem auto' }} />;
  if (opportunities.length === 0) return <p className="text-muted">No matching opportunities found right now.</p>;

  return (
    <div className="ai-match-container">
      <div className="section-title">OPPORTUNITY MATCH ANALYSIS</div>
      
      <div className="matches-list">
        {opportunities.map((item) => {
          const { opportunity, matchScore, breakdown, reasoning } = item;
          const isExpanded = expandedId === opportunity._id;

          return (
            <div key={opportunity._id} className="match-card-wrapper">
              <div className="match-card" onClick={() => setExpandedId(isExpanded ? null : opportunity._id)}>
                
                {/* Circular Score */}
                <div className="match-score-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path className="circle"
                      strokeDasharray={`${matchScore}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="score-text">
                    <span className="val">{matchScore}</span>
                    <span className="lbl">match</span>
                  </div>
                </div>

                {/* Info */}
                <div className="match-info">
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.organization} • {opportunity.location}</p>
                  <div className="match-tags">
                    {opportunity.sport && <span className="tag">{opportunity.sport}</span>}
                    {opportunity.requirements && <span className="tag">Eligible</span>}
                    {opportunity.stipend && <span className="tag">{opportunity.stipend} Stipend</span>}
                  </div>
                </div>

                {/* Expand Toggle */}
                <div className="expand-toggle">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Breakdown */}
              {isExpanded && breakdown && (
                <div className="match-breakdown-card">
                  <div className="breakdown-header">
                    <h4>Score Breakdown — {opportunity.title.split(' ')[0]} {opportunity.title.split(' ')[1]}</h4>
                    <div className="large-score">{matchScore}</div>
                  </div>
                  
                  <div className="breakdown-bars">
                    <ProgressBar label="Sport match" value={breakdown.sportMatch} />
                    <ProgressBar label="Performance level" value={breakdown.performanceLevel} />
                    <ProgressBar label="Rural preference" value={breakdown.ruralPreference} />
                    <ProgressBar label="Age eligibility" value={breakdown.ageEligibility} />
                    <ProgressBar label="Profile completeness" value={breakdown.profileCompleteness} isWarning={breakdown.profileCompleteness < 100} />
                  </div>

                  <div className="ai-reasoning">
                    <strong>AI Reasoning:</strong> {reasoning}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, isWarning }) {
  const colorClass = isWarning ? 'bar-fill-warning' : 'bar-fill-success';
  return (
    <div className="progress-row">
      <span className="progress-label">{label}</span>
      <div className="progress-track">
        <div className={`progress-fill ${colorClass}`} style={{ width: `${value}%` }}></div>
      </div>
      <span className="progress-value">{value}</span>
    </div>
  );
}
