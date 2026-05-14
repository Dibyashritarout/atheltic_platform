import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlueTickVerification from '../components/BlueTickVerification';
import './AdminApplications.css';

export default function AdminApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [expandedVerification, setExpandedVerification] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const [appsRes, statsRes] = await Promise.all([
        axios.get('/api/applications', { params }),
        axios.get('/api/applications/stats'),
      ]);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await axios.put(`/api/applications/${id}/review`, { status, adminNotes });
      setReviewingId(null);
      setAdminNotes('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to review application');
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'pending': return { class: 'badge-amber', icon: '⏳' };
      case 'approved': return { class: 'badge-green', icon: '✅' };
      case 'rejected': return { class: 'badge-danger', icon: '❌' };
      default: return { class: 'badge-muted', icon: '❓' };
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page admin-apps-page">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      
      <div className="page-header">
        <h1>Application Management</h1>
        <p>Review and manage athlete applications</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid stagger-children">
        <div className="admin-stat-card admin-stat-total">
          <div className="asc-icon">📋</div>
          <div className="asc-num">{stats.total}</div>
          <div className="asc-label">Total</div>
        </div>
        <div className="admin-stat-card admin-stat-pending" onClick={() => setFilter('pending')}>
          <div className="asc-icon">⏳</div>
          <div className="asc-num">{stats.pending}</div>
          <div className="asc-label">Pending</div>
        </div>
        <div className="admin-stat-card admin-stat-approved" onClick={() => setFilter('approved')}>
          <div className="asc-icon">✅</div>
          <div className="asc-num">{stats.approved}</div>
          <div className="asc-label">Approved</div>
        </div>
        <div className="admin-stat-card admin-stat-rejected" onClick={() => setFilter('rejected')}>
          <div className="asc-icon">❌</div>
          <div className="asc-num">{stats.rejected}</div>
          <div className="asc-label">Rejected</div>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-filter-bar">
        <button className={`admin-filter-btn ${!filter ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
        <button className={`admin-filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`admin-filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Approved</button>
        <button className={`admin-filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Rejected</button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>No applications {filter ? `with status "${filter}"` : 'yet'}.</p>
        </div>
      ) : (
        <div className="admin-apps-list stagger-children">
          {applications.map(app => {
            const statusStyle = getStatusStyles(app.status);
            return (
              <div key={app._id} className="admin-app-card">
                <div className="aac-header">
                  <div className="aac-athlete-info">
                    <div className="aac-avatar">{app.athlete?.name?.charAt(0) || '?'}</div>
                    <div>
                      <h3>{app.athlete?.name || 'Unknown Athlete'}</h3>
                      <p>{app.athlete?.sports?.join(', ')} {app.athlete?.isRural && <span className="badge badge-green" style={{ marginLeft: '6px' }}>Rural</span>}</p>
                      <p className="aac-location">{[app.athlete?.city, app.athlete?.state].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                  <span className={`badge ${statusStyle.class}`}>{statusStyle.icon} {app.status}</span>
                </div>

                <div className="aac-opportunity">
                  <span className="aac-opp-label">Applied for:</span>
                  <Link to={`/opportunities/${app.opportunity?._id}`} className="aac-opp-title">
                    {app.opportunity?.title || 'Unknown Opportunity'}
                  </Link>
                  <span className="aac-opp-org">by {app.opportunity?.organization}</span>
                </div>

                {app.message && (
                  <div className="aac-message">
                    <span className="aac-msg-label">Message:</span>
                    <p>{app.message}</p>
                  </div>
                )}

                <div className="aac-meta">
                  <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  {app.reviewedBy && (
                    <span>Reviewed by {app.reviewedBy.name} on {new Date(app.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>

                {app.adminNotes && (
                  <div className="aac-admin-notes">
                    <strong>Admin Notes:</strong> {app.adminNotes}
                  </div>
                )}

                <div className="aac-verification-section">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setExpandedVerification(expandedVerification === app._id ? null : app._id)}
                  >
                    {expandedVerification === app._id ? '▼' : '▶'} Blue Tick Verification
                  </button>
                  {expandedVerification === app._id && (
                    <div className="aac-verification-content">
                      <BlueTickVerification applicationId={app._id} isAdmin={true} />
                    </div>
                  )}
                </div>

                {app.status === 'pending' && (
                  <div className="aac-actions">
                    {reviewingId === app._id ? (
                      <div className="aac-review-form">
                        <textarea
                          placeholder="Add notes (optional)..."
                          value={adminNotes}
                          onChange={e => setAdminNotes(e.target.value)}
                          rows={2}
                        />
                        <div className="aac-review-btns">
                          <button className="btn btn-primary btn-sm" onClick={() => handleReview(app._id, 'approved')}>
                            ✅ Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReview(app._id, 'rejected')}>
                            ❌ Reject
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setReviewingId(null); setAdminNotes(''); }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => setReviewingId(app._id)}>
                        Review Application
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
