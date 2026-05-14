import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Leaderboard.css';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('maxJumpHeight');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/athletes/leaderboard/top');
        setEntries(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const sorted = [...entries].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = [
    { bg: 'rgba(255,215,0,0.06)', border: 'rgba(255,215,0,0.2)', glow: '0 0 30px rgba(255,215,0,0.1)' },
    { bg: 'rgba(192,192,192,0.06)', border: 'rgba(192,192,192,0.2)', glow: '0 0 20px rgba(192,192,192,0.08)' },
    { bg: 'rgba(205,127,50,0.06)', border: 'rgba(205,127,50,0.2)', glow: '0 0 20px rgba(205,127,50,0.08)' },
  ];

  const sortOptions = [
    { value: 'maxJumpHeight', label: 'Jump Height', icon: '⬆️' },
    { value: 'maxJumpLength', label: 'Jump Length', icon: '↗️' },
    { value: 'maxRunningSpeed', label: 'Sprint Speed', icon: '⚡' },
    { value: 'count', label: 'Sessions', icon: '📊' },
  ];

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Leaderboard</h1>
          <p>Top performing athletes ranked by AI analysis</p>
        </div>
        <div className="lb-sort-tabs">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              className={`lb-sort-tab ${sortBy === opt.value ? 'active' : ''}`}
              onClick={() => setSortBy(opt.value)}
            >
              <span>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="spinner" /> : entries.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏆</div>
          <p>No performance data yet. Add athletes and log performances to see the leaderboard.</p>
        </div>
      ) : (
        <>
          {/* Podium — Top 3 */}
          {top3.length >= 3 && (
            <div className="podium">
              {[1, 0, 2].map(i => {
                const entry = top3[i];
                if (!entry) return null;
                return (
                  <Link to={`/athletes/${entry._id}`} key={entry._id} className="podium-card" style={{
                    background: podiumColors[i].bg,
                    borderColor: podiumColors[i].border,
                    boxShadow: podiumColors[i].glow,
                    order: i === 0 ? 2 : i === 1 ? 1 : 3,
                  }}>
                    <div className={`podium-rank podium-rank-${i + 1}`}>{medals[i]}</div>
                    <div className="podium-avatar" style={{ boxShadow: `0 0 20px ${podiumColors[i].border}` }}>
                      {entry.athlete?.name?.charAt(0)}
                    </div>
                    <div className="podium-name">{entry.athlete?.name || 'Unknown'}</div>
                    <div className="podium-loc">{[entry.athlete?.city, entry.athlete?.state].filter(Boolean).join(', ')}</div>
                    {entry.athlete?.isRural && <span className="badge badge-green" style={{ marginTop: '0.35rem' }}>Rural</span>}
                    <div className="podium-stat">
                      <div className="podium-stat-val">
                        {sortBy === 'maxJumpHeight' && entry.maxJumpHeight ? `${entry.maxJumpHeight} cm` :
                         sortBy === 'maxJumpLength' && entry.maxJumpLength ? `${entry.maxJumpLength} m` :
                         sortBy === 'maxRunningSpeed' && entry.maxRunningSpeed ? `${entry.maxRunningSpeed} km/h` :
                         sortBy === 'count' ? entry.count : '—'}
                      </div>
                      <div className="podium-stat-label">
                        {sortOptions.find(o => o.value === sortBy)?.label}
                      </div>
                    </div>
                    <div className="podium-bar-wrap">
                      <div className="podium-bar" style={{
                        height: i === 0 ? '100%' : i === 1 ? '80%' : '60%',
                        background: i === 0 ? 'linear-gradient(180deg, rgba(255,215,0,0.3), rgba(255,215,0,0.05))' :
                                   i === 1 ? 'linear-gradient(180deg, rgba(192,192,192,0.3), rgba(192,192,192,0.05))' :
                                   'linear-gradient(180deg, rgba(205,127,50,0.3), rgba(205,127,50,0.05))'
                      }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Table — Rest */}
          <div className="lb-table">
            <div className="lb-header">
              <span>Rank</span>
              <span>Athlete</span>
              <span>Jump Height</span>
              <span>Jump Length</span>
              <span>Speed</span>
              <span>Sessions</span>
            </div>
            {(top3.length < 3 ? sorted : rest).map((entry, i) => {
              const rank = top3.length >= 3 ? i + 4 : i + 1;
              return (
                <Link to={`/athletes/${entry._id}`} key={entry._id} className="lb-row">
                  <span className="lb-rank">#{rank}</span>
                  <span className="lb-athlete">
                    <span className="lb-avatar">{entry.athlete?.name?.charAt(0)}</span>
                    <span className="lb-athlete-info">
                      <strong>{entry.athlete?.name || 'Unknown'}</strong>
                      <small>{[entry.athlete?.city, entry.athlete?.state].filter(Boolean).join(', ')}</small>
                    </span>
                    {entry.athlete?.isRural && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Rural</span>}
                  </span>
                  <span className="lb-stat">{entry.maxJumpHeight ? `${entry.maxJumpHeight} cm` : '—'}</span>
                  <span className="lb-stat">{entry.maxJumpLength ? `${entry.maxJumpLength} m` : '—'}</span>
                  <span className="lb-stat">{entry.maxRunningSpeed ? `${entry.maxRunningSpeed} km/h` : '—'}</span>
                  <span className="lb-stat">{entry.count}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
