import React from 'react';
import './Cards.css';

export default function OpportunityCard({ opp, onApply }) {
  const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const isExpired = opp.deadline && new Date(opp.deadline) < new Date();

  return (
    <div className="opp-card">
      <div className="opp-header">
        <div>
          <h3>{opp.title}</h3>
          <p className="opp-org">🏢 {opp.organization}</p>
        </div>
        {opp.sport && <span className="badge badge-amber">{opp.sport}</span>}
      </div>

      <p className="opp-desc">{opp.description?.slice(0, 130)}{opp.description?.length > 130 ? '…' : ''}</p>

      <div className="opp-meta">
        {opp.location && <span>📍 {opp.location}</span>}
        {opp.stipend && <span>💰 {opp.stipend}</span>}
        {deadline && <span className={isExpired ? 'expired' : ''}>🗓 {isExpired ? 'Expired: ' : 'Deadline: '}{deadline}</span>}
      </div>

      <div className="opp-footer">
        {opp.applicationLink && !isExpired && (
          <a href={opp.applicationLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            Apply Now →
          </a>
        )}
        {isExpired && <span className="badge badge-muted">Closed</span>}
      </div>
    </div>
  );
}
