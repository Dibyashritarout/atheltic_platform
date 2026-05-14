import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './InjuryTracker.css';

const INJURY_TYPES = ['Sprain', 'Strain', 'Fracture', 'Tendinitis', 'Dislocation', 'Contusion', 'Concussion', 'Overuse', 'Cramp', 'Other'];
const BODY_PARTS = ['Knee', 'Ankle', 'Shoulder', 'Hamstring', 'Lower Back', 'Hip', 'Wrist', 'Shin', 'Foot', 'Neck', 'Elbow', 'Groin', 'Finger', 'Head', 'Thigh', 'Calf', 'Other'];
const SEVERITIES = ['minor', 'moderate', 'severe'];

export default function InjuryTracker() {
  const { id } = useParams(); // athlete ID
  const { user } = useAuth();
  const [athlete, setAthlete] = useState(null);
  const [injuries, setInjuries] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: '', bodyPart: '', severity: 'minor', description: '', dateOccurred: new Date().toISOString().split('T')[0], treatmentNotes: '', sport: '',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [athleteRes, injuriesRes, riskRes] = await Promise.all([
        axios.get(`/api/athletes/${id}`),
        axios.get(`/api/athletes/${id}/injuries`),
        axios.get(`/api/athletes/${id}/injury-risk`),
      ]);
      setAthlete(athleteRes.data);
      setInjuries(injuriesRes.data);
      setRiskData(riskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setFormLoading(true);
    try {
      await axios.post(`/api/athletes/${id}/injuries`, form);
      setShowForm(false);
      setForm({ type: '', bodyPart: '', severity: 'minor', description: '', dateOccurred: new Date().toISOString().split('T')[0], treatmentNotes: '', sport: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log injury');
    } finally {
      setFormLoading(false);
    }
  };

  const updateStatus = async (injuryId, recoveryStatus) => {
    setUpdateLoading(injuryId);
    try {
      await axios.put(`/api/injuries/${injuryId}`, { recoveryStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdateLoading(null);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minor': return 'green';
      case 'moderate': return 'amber';
      case 'severe': return 'red';
      default: return 'muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🔴';
      case 'recovering': return '🟡';
      case 'recovered': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) return <div className="spinner" />;
  if (!athlete) return <div className="page"><p>Athlete not found.</p></div>;

  return (
    <div className="page injury-page">
      <Link to={`/athletes/${id}`} className="back-link">← Back to {athlete.name}'s Profile</Link>

      <div className="page-header">
        <h1>Injury Tracker</h1>
        <p>Monitor injuries, recovery progress, and AI risk assessment for <strong>{athlete.name}</strong></p>
      </div>

      {/* Risk Assessment Dashboard */}
      {riskData && (
        <div className="injury-risk-section">
          <div className="risk-dashboard">
            <div className="risk-score-card">
              <div className="risk-gauge-wrap">
                <svg viewBox="0 0 120 120" className="risk-gauge">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={riskData.riskLevel.color} strokeWidth="10"
                    strokeDasharray={`${(riskData.riskScore / 100) * 314} 314`}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="risk-gauge-center">
                  <div className="risk-gauge-num">{riskData.riskScore}</div>
                  <div className="risk-gauge-label">Risk Score</div>
                </div>
              </div>
              <div className="risk-level-badge" style={{ background: `${riskData.riskLevel.color}18`, borderColor: `${riskData.riskLevel.color}35`, color: riskData.riskLevel.color }}>
                {riskData.riskLevel.emoji} {riskData.riskLevel.level} Risk
              </div>
              <p className="risk-desc">{riskData.riskLevel.description}</p>
            </div>

            <div className="risk-details">
              <div className="risk-stats-row">
                <div className="risk-stat">
                  <div className="rs-num">{riskData.totalInjuries}</div>
                  <div className="rs-label">Total Injuries</div>
                </div>
                <div className="risk-stat">
                  <div className="rs-num" style={{ color: '#EF4444' }}>{riskData.activeInjuries}</div>
                  <div className="rs-label">Active</div>
                </div>
                <div className="risk-stat">
                  <div className="rs-num" style={{ color: 'var(--amber)' }}>{riskData.recoveringInjuries}</div>
                  <div className="rs-label">Recovering</div>
                </div>
              </div>

              {riskData.riskFactors.length > 0 && (
                <div className="risk-factors">
                  <h3 className="section-title-sm">Risk Factors</h3>
                  {riskData.riskFactors.map((f, i) => (
                    <div key={i} className={`risk-factor-item rf-${f.severity}`}>
                      <span className="rf-icon">{f.icon}</span>
                      <div>
                        <strong>{f.factor}</strong>
                        <p>{f.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {riskData.sportInfo && (
                <div className="sport-injury-info">
                  <h3 className="section-title-sm">Common Injuries — {athlete.sports?.[0] || 'General'}</h3>
                  <div className="sport-injury-chips">
                    {riskData.sportInfo.common.map((inj, i) => (
                      <span key={i} className="sport-injury-chip">{inj}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Injury Button */}
      {user && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Log New Injury'}
          </button>
        </div>
      )}

      {/* Add Injury Form */}
      {showForm && (
        <div className="injury-form-card card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>
            Log New Injury
          </h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Injury Type *</label>
                <select name="type" value={form.type} onChange={handleFormChange} required>
                  <option value="">Select type</option>
                  {INJURY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Body Part *</label>
                <select name="bodyPart" value={form.bodyPart} onChange={handleFormChange} required>
                  <option value="">Select body part</option>
                  {BODY_PARTS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Severity *</label>
                <select name="severity" value={form.severity} onChange={handleFormChange} required>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date Occurred</label>
                <input name="dateOccurred" type="date" value={form.dateOccurred} onChange={handleFormChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="How did the injury happen?" />
            </div>
            <div className="form-group">
              <label>Treatment Notes</label>
              <textarea name="treatmentNotes" value={form.treatmentNotes} onChange={handleFormChange} rows={2} placeholder="Current treatment, medication, physio..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Logging...' : 'Log Injury'}
            </button>
          </form>
        </div>
      )}

      {/* Injury History */}
      <div className="injury-history-section">
        <h2 className="section-title-sm">Injury History ({injuries.length})</h2>
        {injuries.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏥</div>
            <p>No injuries recorded. That's great! Stay healthy! 💪</p>
          </div>
        ) : (
          <div className="injury-timeline stagger-children">
            {injuries.map(inj => (
              <div key={inj._id} className={`injury-card injury-${inj.recoveryStatus}`}>
                <div className="inj-header">
                  <div className="inj-status-icon">{getStatusIcon(inj.recoveryStatus)}</div>
                  <div className="inj-title-area">
                    <h3>{inj.type} — {inj.bodyPart}</h3>
                    <p className="inj-date">{new Date(inj.dateOccurred).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="inj-badges">
                    <span className={`badge badge-${getSeverityColor(inj.severity)}`}>{inj.severity}</span>
                    <span className={`badge badge-${inj.recoveryStatus === 'recovered' ? 'green' : inj.recoveryStatus === 'recovering' ? 'amber' : 'danger'}`}>
                      {inj.recoveryStatus}
                    </span>
                  </div>
                </div>

                {inj.description && <p className="inj-desc">{inj.description}</p>}

                {inj.expectedRecoveryDays && (
                  <div className="inj-recovery-bar">
                    <span className="irb-label">Expected Recovery: ~{inj.expectedRecoveryDays} days</span>
                    {inj.recoveryStatus === 'recovered' && inj.actualRecoveryDate && (
                      <span className="irb-actual">Recovered on {new Date(inj.actualRecoveryDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {inj.treatmentNotes && (
                  <div className="inj-treatment">
                    <strong>Treatment:</strong> {inj.treatmentNotes}
                  </div>
                )}

                {inj.preventionTips && inj.preventionTips.length > 0 && (
                  <div className="inj-tips">
                    <strong>Prevention Tips:</strong>
                    <ul>
                      {inj.preventionTips.slice(0, 3).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {user && inj.recoveryStatus !== 'recovered' && (
                  <div className="inj-actions">
                    {inj.recoveryStatus === 'active' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(inj._id, 'recovering')} disabled={updateLoading === inj._id}>
                        Mark as Recovering
                      </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(inj._id, 'recovered')} disabled={updateLoading === inj._id}>
                      Mark as Recovered ✅
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
