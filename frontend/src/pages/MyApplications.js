import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlueTickVerification from '../components/BlueTickVerification';
import './MyApplications.css';

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVerification, setExpandedVerification] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/applications/my');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { class: 'badge-amber', icon: '⏳' };
      case 'approved': return { class: 'badge-green', icon: '✅' };
      case 'rejected': return { class: 'badge-danger', icon: '❌' };
      default: return { class: 'badge-muted', icon: '❓' };
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page my-applications-page">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track your applications and complete verification steps</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>You haven't applied to any opportunities yet.</p>
          <Link to="/opportunities" className="btn btn-primary">Browse Opportunities</Link>
        </div>
      ) : (
        <div className="my-apps-list stagger-children">
          {applications.map(app => {
            const statusStyle = getStatusStyle(app.status);
            return (
              <div key={app._id} className="my-app-card">
                <div className="mac-header">
                  <div className="mac-opportunity">
                    <h3>{app.opportunity?.title || 'Unknown Opportunity'}</h3>
                    <p className="mac-org">by {app.opportunity?.organization}</p>
                  </div>
                  <span className={`badge ${statusStyle.class}`}>
                    {statusStyle.icon} {app.status}
                  </span>
                </div>

                <div className="mac-details">
                  <div className="mac-detail-item">
                    <span className="label">Applied:</span>
                    <span className="value">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  {app.opportunity?.deadline && (
                    <div className="mac-detail-item">
                      <span className="label">Deadline:</span>
                      <span className="value">{new Date(app.opportunity.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {app.opportunity?.sport && (
                    <div className="mac-detail-item">
                      <span className="label">Sport:</span>
                      <span className="value">{app.opportunity.sport}</span>
                    </div>
                  )}
                </div>

                {app.message && (
                  <div className="mac-message">
                    <strong>Your Message:</strong>
                    <p>{app.message}</p>
                  </div>
                )}

                {/* Blue Tick Verification Section */}
                <div className="mac-verification-section">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setExpandedVerification(expandedVerification === app._id ? null : app._id)}
                  >
                    {expandedVerification === app._id ? '▼' : '▶'} Blue Tick Verification
                  </button>
                  {expandedVerification === app._id && (
                    <div className="mac-verification-content">
                      <BlueTickVerification applicationId={app._id} isAdmin={false} />
                    </div>
                  )}
                </div>

                {app.adminNotes && (
                  <div className="mac-admin-notes">
                    <strong>Admin Notes:</strong> {app.adminNotes}
                  </div>
                )}

                <div className="mac-actions">
                  <Link to={`/opportunities/${app.opportunity?._id}`} className="btn btn-secondary btn-sm">
                    View Opportunity
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
