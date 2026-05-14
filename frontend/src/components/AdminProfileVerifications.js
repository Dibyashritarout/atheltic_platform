import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, ExternalLink, User } from 'lucide-react';
import './AdminProfileVerifications.css';

const VERIFICATION_STEPS = [
  { key: 'aadhaar', label: 'Aadhaar Identity' },
  { key: 'ruralAddress', label: 'Rural Address' },
  { key: 'sportsCert', label: 'Sports Certificates' },
  { key: 'videoReview', label: 'Video Review' },
  { key: 'coachEndorsement', label: 'Coach Endorsement' },
];

export default function AdminProfileVerifications({ onAction }) {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/athletes/admin/pending-verifications');
      setAthletes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (athleteId, step, status) => {
    try {
      await axios.put(`/api/athletes/${athleteId}/admin-verify-step`, { step, status });
      fetchPending();
      if (onAction) onAction();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="admin-profile-verifications">
      {athletes.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={40} color="#1D9E75" />
          <p>No pending profile verifications!</p>
        </div>
      ) : (
        <div className="apv-list">
          {athletes.map(athlete => (
            <div key={athlete._id} className="apv-card">
              <div className="apv-header">
                <div className="apv-user-info">
                  <div className="apv-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <h3>{athlete.name}</h3>
                    <p>{athlete.city}, {athlete.state}</p>
                  </div>
                </div>
                <span className={`badge badge-pending`}>Pending Review</span>
              </div>

              <div className="apv-steps">
                {VERIFICATION_STEPS.map(step => {
                  const data = athlete.verification?.[step.key];
                  if (!data || data.status !== 'pending') return null;

                  return (
                    <div key={step.key} className="apv-step-row">
                      <div className="apv-step-info">
                        <span className="apv-step-label">{step.label}</span>
                        {data.fileUrl && (
                          <a href={data.fileUrl} target="_blank" rel="noopener noreferrer" className="apv-view-link">
                            <ExternalLink size={14} /> View File
                          </a>
                        )}
                      </div>
                      <div className="apv-step-actions">
                        <button className="apv-btn apv-approve" onClick={() => handleAction(athlete._id, step.key, 'approved')}>
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button className="apv-btn apv-reject" onClick={() => handleAction(athlete._id, step.key, 'rejected')}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
