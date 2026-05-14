import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './OpportunityDetail.css';

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  // Application state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [userAthletes, setUserAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [applicationStatus, setApplicationStatus] = useState(null); // null, 'pending', 'approved', 'rejected'
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    const fetchOpp = async () => {
      try {
        const res = await axios.get(`/api/opportunities/${id}`);
        setOpp(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpp();
  }, [id]);

  // Fetch user's athlete profiles and check existing applications
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        // Get all athletes — find user's athletes
        const athleteRes = await axios.get('/api/athletes');
        const myAthletes = athleteRes.data.filter(a => a.user === user.id || a.email === user.email);
        setUserAthletes(myAthletes);

        // Check if already applied (with any athlete)
        if (myAthletes.length > 0) {
          for (const ath of myAthletes) {
            try {
              const checkRes = await axios.get(`/api/applications/check/${id}/${ath._id}`);
              if (checkRes.data.applied) {
                setApplicationStatus(checkRes.data.application.status);
                setSelectedAthleteId(ath._id);
                break;
              }
            } catch (e) { /* ignore */ }
          }
        }
        if (myAthletes.length === 1) setSelectedAthleteId(myAthletes[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, [user, id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await axios.delete(`/api/opportunities/${id}`);
      navigate('/opportunities');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const loadMatches = async () => {
    setMatching(true);
    try {
      const res = await axios.get(`/api/opportunities/${id}/matches`);
      setMatches(res.data);
    } catch (err) {
      console.error('Match failed', err);
    } finally {
      setMatching(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedAthleteId) {
      setApplyError('Please select an athlete profile.');
      return;
    }
    setApplyError('');
    setApplyLoading(true);
    try {
      await axios.post('/api/applications', {
        athleteId: selectedAthleteId,
        opportunityId: id,
        message: applyMessage,
      });
      setApplicationStatus('pending');
      setShowApplyModal(false);
      setApplyMessage('');
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!opp) return <div className="page"><p>Opportunity not found.</p></div>;

  const canApply = user && user.role !== 'admin' && !applicationStatus && opp.isActive && userAthletes.length > 0;

  return (
    <div className="page opp-detail-page">
      <Link to="/opportunities" className="back-link">← Back to Opportunities</Link>

      <div className="opp-layout">
        {/* Main Details */}
        <div className="opp-main">
          <div className="opp-header-card">
            <div className="opp-header-top">
              <span className={`badge badge-${opp.isActive ? 'green' : 'muted'}`}>
                {opp.isActive ? 'Active' : 'Closed'}
              </span>
              <span className="badge badge-amber">{opp.sport}</span>
            </div>
            <h1>{opp.title}</h1>
            <p className="opp-org">By <strong>{opp.organization}</strong></p>
            
            <div className="opp-meta-grid">
              <div className="opp-meta-item">
                <span className="omi-icon">📍</span>
                <div>
                  <span className="omi-label">Location</span>
                  <span className="omi-val">{opp.location || 'Anywhere'}</span>
                </div>
              </div>
              <div className="opp-meta-item">
                <span className="omi-icon">💰</span>
                <div>
                  <span className="omi-label">Stipend/Support</span>
                  <span className="omi-val">{opp.stipend || 'Not specified'}</span>
                </div>
              </div>
              <div className="opp-meta-item">
                <span className="omi-icon">📅</span>
                <div>
                  <span className="omi-label">Deadline</span>
                  <span className="omi-val">{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}</span>
                </div>
              </div>
            </div>

            <div className="opp-actions">
              {/* Apply Button */}
              {canApply && (
                <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
                  📝 Apply Now
                </button>
              )}

              {/* Application Status */}
              {applicationStatus && (
                <div className={`application-status-pill as-${applicationStatus}`}>
                  {applicationStatus === 'pending' && '⏳ Application Pending'}
                  {applicationStatus === 'approved' && '✅ Application Approved'}
                  {applicationStatus === 'rejected' && '❌ Application Rejected'}
                </div>
              )}

              {/* No athlete profile notice */}
              {user && user.role !== 'admin' && userAthletes.length === 0 && (
                <Link to="/add-athlete" className="btn btn-secondary">
                  Create Profile to Apply
                </Link>
              )}

              {opp.applicationLink && (
                <a href={opp.applicationLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Apply Externally →
                </a>
              )}
              {user && (user.role === 'admin' || user._id === opp.postedBy) && (
                <>
                  <button onClick={handleDelete} className="btn btn-danger">Delete</button>
                </>
              )}
            </div>
          </div>

          <div className="opp-desc-card">
            <h2 className="section-title-sm">Description</h2>
            <div className="opp-desc-text">{opp.description}</div>
            
            {opp.requirements && (
              <>
                <h2 className="section-title-sm" style={{ marginTop: '2rem' }}>Requirements</h2>
                <div className="opp-req-text">{opp.requirements}</div>
              </>
            )}
          </div>
        </div>

        {/* AI Matching Sidebar */}
        <div className="opp-sidebar">
          <div className="opp-match-card">
            <div className="omc-header">
              <div className="omc-icon">🤖</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>AI Talent Match</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Find compatible athletes</p>
              </div>
            </div>
            
            {!matches.length && !matching ? (
              <div className="omc-empty">
                <p>Use our AI engine to find athletes on the platform who match these requirements.</p>
                <button className="btn btn-primary btn-sm" onClick={loadMatches} style={{ width: '100%' }}>
                  Run Match Algorithm
                </button>
              </div>
            ) : matching ? (
              <div className="omc-loading">
                <div className="spinner" style={{ width: '30px', height: '30px', margin: '0 auto 1rem', borderWidth: '2px' }} />
                <p>Analyzing athlete performance data...</p>
              </div>
            ) : (
              <div className="omc-results stagger-children">
                <div className="omc-result-header">
                  <span>Found {matches.length} matches</span>
                  <button className="btn btn-secondary btn-sm" onClick={loadMatches}>↻ Refresh</button>
                </div>
                
                {matches.map((m, i) => (
                  <Link to={`/athletes/${m.athlete._id}`} key={m.athlete._id} className="match-item">
                    <div className="mi-top">
                      <div className="mi-avatar">{m.athlete.name.charAt(0)}</div>
                      <div className="mi-info">
                        <strong>{m.athlete.name}</strong>
                        <span>{[m.athlete.city, m.athlete.state].filter(Boolean).join(', ')}</span>
                      </div>
                      <div className="mi-score">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                          <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="circle" strokeDasharray={`${m.matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <text x="18" y="20.35" className="percentage">{Math.round(m.matchScore)}%</text>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mi-factors">
                      {m.factors.map((f, fi) => (
                        <div key={fi} className="mi-factor">
                          <span className="mif-icon">🎯</span>
                          <span className="mif-text"><strong>{f.factor}</strong> (+{f.points}): {f.detail}</span>
                        </div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="apply-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="apply-modal" onClick={e => e.stopPropagation()}>
            <div className="apply-modal-header">
              <h2>Apply to Opportunity</h2>
              <button className="chatbot-close" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <p className="apply-modal-opp">{opp.title} — {opp.organization}</p>
            
            {applyError && <div className="error-msg">{applyError}</div>}
            
            <form onSubmit={handleApply}>
              {userAthletes.length > 1 && (
                <div className="form-group">
                  <label>Select Athlete Profile *</label>
                  <select value={selectedAthleteId} onChange={e => setSelectedAthleteId(e.target.value)} required>
                    <option value="">Choose profile</option>
                    {userAthletes.map(a => (
                      <option key={a._id} value={a._id}>{a.name} — {a.sports?.join(', ')}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Motivation / Cover Message (optional)</label>
                <textarea
                  rows={4}
                  placeholder="Tell them why you're a great fit for this opportunity..."
                  value={applyMessage}
                  onChange={e => setApplyMessage(e.target.value)}
                  maxLength={1000}
                />
              </div>
              <div className="apply-modal-actions">
                <button type="submit" className="btn btn-primary" disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : '📝 Submit Application'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
