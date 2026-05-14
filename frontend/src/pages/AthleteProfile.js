import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Trophy, Activity, ShieldCheck, ActivitySquare, Home, Upload, CheckCircle2 } from 'lucide-react';
import AIMatchTab from '../components/AIMatchTab';
import PerformanceChart from '../components/PerformanceChart';
import './AthleteProfile.css';

export default function AthleteProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [athlete, setAthlete] = useState(null);
  const [performances, setPerformances] = useState([]);
  const [injuryRisk, setInjuryRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai-match');
  const [activeChartTab, setActiveChartTab] = useState('jumpHeight');

  const fetchAthleteData = async () => {
    try {
      const [aRes, pRes, riskRes] = await Promise.all([
        axios.get(`/api/athletes/${id}`),
        axios.get(`/api/athletes/${id}/performance`),
        axios.get(`/api/athletes/${id}/injury-risk`).catch(() => ({ data: null }))
      ]);
      setAthlete(aRes.data);
      setPerformances(pRes.data);
      setInjuryRisk(riskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAthleteData();
  }, [id]);

  const requestVerificationStep = async (step, fileUrl) => {
    if (!user) return;
    try {
      const res = await axios.put(`/api/athletes/${id}/verify-step`, { step, fileUrl });
      setAthlete({ ...athlete, verification: res.data });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to submit verification request');
    }
  };

  const [uploadingStep, setUploadingStep] = useState(null);

  const handleVerificationAction = (stepKey) => {
    const stepData = athlete.verification?.[stepKey];
    if (stepData?.status === 'approved') {
      // Already verified
      return;
    }
    // Trigger file input
    const fileInput = document.getElementById(`file-upload-${stepKey}`);
    if (fileInput) fileInput.click();
  };

  const onFileSelected = async (e, stepKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingStep(stepKey);
    // Simulate upload delay (In a real app, you'd upload the file to /api/upload first)
    setTimeout(async () => {
      try {
        await requestVerificationStep(stepKey, 'https://example.com/uploaded-file.pdf');
      } finally {
        setUploadingStep(null);
        e.target.value = '';
      }
    }, 1500);
  };

  if (loading) return <div className="spinner" style={{ margin: '3rem auto' }} />;
  if (!athlete) return <div className="page"><p>Athlete not found.</p></div>;

  const isVerified = athlete.verification?.status === 'verified';

  const chartMetrics = [
    { key: 'jumpHeight', label: 'Jump Height', unit: 'cm', color: '#1D9E75' },
    { key: 'jumpLength', label: 'Jump Length', unit: 'm', color: '#EF9F27' },
    { key: 'runningSpeed', label: 'Sprint Speed', unit: 'km/h', color: '#9333EA' },
  ];

  return (
    <div className="page" style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>

      {/* Top Tab Navigation */}
      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'ai-match' ? 'active' : ''}`} onClick={() => setActiveTab('ai-match')}>
          <Sparkles size={16} /> AI Match Score
        </button>
        <button className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
          <Trophy size={16} /> Achievements
        </button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <Activity size={16} /> Analytics
        </button>
        <button className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
          <ShieldCheck size={16} /> Verification
        </button>
        <button className={`tab-btn ${activeTab === 'injury' ? 'active' : ''}`} onClick={() => setActiveTab('injury')}>
          <ActivitySquare size={16} /> Injury Prediction
        </button>
      </div>

      <div className="tab-divider">
        <div className="tab-indicator" data-active={activeTab}></div>
      </div>

      {/* Header Section */}
      <div className="profile-header">
        <div className="ph-avatar">
          {athlete.profileImage ? <img src={athlete.profileImage} alt={athlete.name} /> : <span>{athlete.name.charAt(0)}</span>}
        </div>
        <div className="ph-info">
          <div className="ph-name-row">
            <h1>{athlete.name}</h1>
            {isVerified && (
              <span className="badge-verified">
                <ShieldCheck size={14} /> Verified
              </span>
            )}
          </div>
          <div className="ph-sub-row">
            <span className="ph-meta">
              {athlete.sports?.[0] || 'Athlete'} • {[athlete.city, athlete.state].filter(Boolean).join(', ') || 'India'}
            </span>
            {athlete.isRural && (
              <span className="badge-rural">
                <Home size={12} /> Rural
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
        <Link to={`/athletes/${id}/add-performance`} className="btn btn-primary">
          <Upload size={16} /> Add Performance
        </Link>
      </div>

      {/* Tab Content */}
      <div className="profile-content">

        {/* TAB: AI Match Score */}
        {activeTab === 'ai-match' && <AIMatchTab athleteId={id} />}

        {/* TAB: Achievements */}
        {activeTab === 'achievements' && (
          <div className="tab-panel">
            <div className="section-title">ACHIEVEMENTS & BADGES</div>
            {!athlete.achievements || athlete.achievements.length === 0 ? (
              <p className="text-muted">No achievements unlocked yet. Add performances to unlock badges!</p>
            ) : (
              <div className="achievements-grid">
                {athlete.achievements.map((ach, idx) => (
                  <div key={idx} className="achievement-card">
                    <div className="ach-icon">{ach.icon || '🏆'}</div>
                    <div className="ach-info">
                      <h4>{ach.title}</h4>
                      <p>Unlocked {new Date(ach.dateEarned).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Analytics */}
        {activeTab === 'analytics' && (
          <div className="tab-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>PERFORMANCE TRENDS</div>
              <div className="chart-tabs">
                {chartMetrics.map(m => (
                  <button
                    key={m.key}
                    className={`chart-tab ${activeChartTab === m.key ? 'active' : ''}`}
                    onClick={() => setActiveChartTab(m.key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="chart-container-card">
              {performances.length >= 2 ? (
                chartMetrics.map(m => (
                  activeChartTab === m.key && (
                    <PerformanceChart
                      key={m.key}
                      performances={performances}
                      metric={m.key}
                      label={m.label}
                      unit={m.unit}
                      color={m.color}
                    />
                  )
                ))
              ) : (
                <div className="empty-state">
                  <Activity size={32} />
                  <p>{performances.length === 0 ? 'No performance data logged yet. Add your first performance!' : 'Log at least 2 performances to see analytics graphs.'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Verification */}
        {activeTab === 'verification' && (
          <div className="tab-panel">
            <div className="section-title">5-STEP VERIFICATION</div>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Complete all 5 steps to earn the verified Blue Tick. This builds trust with organizations.
            </p>

            <div className="verification-list">
              {[
                { key: 'aadhaar', label: 'Aadhaar Identity Verification', icon: 'id-card' },
                { key: 'ruralAddress', label: 'Panchayat / Rural Address Proof', icon: 'home' },
                { key: 'sportsCert', label: 'Sports Certificates Upload', icon: 'file-text' },
                { key: 'videoReview', label: 'Performance Video Review', icon: 'video' },
                { key: 'coachEndorsement', label: 'Coach / Federation Endorsement', icon: 'user-check' },
              ].map(step => {
                const stepData = athlete.verification?.[step.key] || { status: 'none' };
                const isApproved = stepData.status === 'approved';
                const isPending = stepData.status === 'pending';
                const isRejected = stepData.status === 'rejected';
                const isUploading = uploadingStep === step.key;

                let statusMsg = 'Not started.';
                if (isUploading) statusMsg = 'Uploading document...';
                else if (isPending) statusMsg = 'Pending admin review...';
                else if (isApproved) statusMsg = 'Verified and approved.';
                else if (isRejected) statusMsg = 'Rejected. Please re-upload.';

                return (
                  <div 
                    key={step.key} 
                    className={`verify-step-card ${isApproved ? 'done' : ''} ${isPending ? 'pending' : ''} ${isRejected ? 'rejected' : ''}`} 
                    onClick={() => !isUploading && handleVerificationAction(step.key)}
                  >
                    <input
                      type="file"
                      id={`file-upload-${step.key}`}
                      style={{ display: 'none' }}
                      onChange={(e) => onFileSelected(e, step.key)}
                      accept="image/*,.pdf"
                    />
                    <div className="vs-icon">
                      {isApproved ? <CheckCircle2 size={24} color="#1D9E75" /> : isPending ? <div className="vs-circle vs-pending">⏳</div> : <div className="vs-circle"></div>}
                    </div>
                    <div className="vs-info">
                      <h4>{step.label}</h4>
                      <p>{statusMsg}</p>
                    </div>
                    {!isApproved && !isPending && (
                      <button className="vs-upload-btn" disabled={isUploading}>
                        {isUploading ? 'Uploading...' : <><Upload size={14} /> Upload</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: Injury Prediction */}
        {activeTab === 'injury' && (
          <div className="tab-panel">
            <div className="section-title">AI INJURY RISK ANALYSIS</div>

            {!injuryRisk || !injuryRisk.riskLevel ? (
              <p className="text-muted">Not enough data to predict injury risk. Log more sessions.</p>
            ) : (
              <div className="injury-dashboard">
                <div className="risk-banner" data-level={injuryRisk.riskLevel.level}>
                  <div className="rb-icon">{injuryRisk.riskLevel.emoji}</div>
                  <div className="rb-text">
                    <h3>{injuryRisk.riskLevel.level} Injury Risk</h3>
                    <p>Based on your recent performance patterns and session frequency.</p>
                  </div>
                </div>

                {injuryRisk.warnings && injuryRisk.warnings.length > 0 && (
                  <div className="risk-warnings">
                    <h4>Identified Risks:</h4>
                    <ul>
                      {injuryRisk.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {injuryRisk.warnings.length === 0 && (
                  <div className="risk-safe">
                    <p>Your training patterns look safe. Keep maintaining a good balance of training and recovery!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
