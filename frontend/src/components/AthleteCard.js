import React from 'react';
import { Link } from 'react-router-dom';
import './Cards.css';

export default function AthleteCard({ athlete }) {
  return (
    <Link to={`/athletes/${athlete._id}`} className="athlete-card">
      <div className="ac-header">
        <div className="ac-avatar">
          {athlete.profileImage
            ? <img src={athlete.profileImage} alt={athlete.name} />
            : <span>{athlete.name?.charAt(0).toUpperCase()}</span>
          }
        </div>
        <div className="ac-info">
          <h3>{athlete.name}</h3>
          <p className="ac-loc">📍 {athlete.city || athlete.state || 'Unknown location'}</p>
        </div>
        {athlete.isRural && <span className="badge badge-green">Rural</span>}
      </div>

      {athlete.sports?.length > 0 && (
        <div className="ac-sports">
          {athlete.sports.slice(0, 3).map((s, i) => (
            <span key={i} className="badge badge-muted">{s}</span>
          ))}
        </div>
      )}

      {athlete.bio && (
        <p className="ac-bio">{athlete.bio.slice(0, 100)}{athlete.bio.length > 100 ? '…' : ''}</p>
      )}

      <div className="ac-footer">
        <span className="ac-age">{athlete.age ? `Age ${athlete.age}` : ''}</span>
        <span className="ac-link">View Profile →</span>
      </div>
    </Link>
  );
}
