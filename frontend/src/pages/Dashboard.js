import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ athletes: 0, opportunities: 0, performances: 0, states: 0, ruralAthletes: 0 });
  const [recentAthletes, setRecentAthletes] = useState([]);
  const [recentOpps, setRecentOpps] = useState([]);
  const [topSports, setTopSports] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [appStats, setAppStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, aRes, oRes] = await Promise.all([
          axios.get('/api/athletes/stats/overview'),
          axios.get('/api/athletes'),
          axios.get('/api/opportunities'),
        ]);
        const s = statsRes.data;
        setStats({
          athletes: s.totalAthletes || 0,
          ruralAthletes: s.ruralAthletes || 0,
          performances: s.totalPerformances || 0,
          states: s.statesCovered || 0,
          opportunities: oRes.data.length,
        });
        setTopSports(s.topSports || []);
        setRecentAthletes(aRes.data.slice(0, 5));
        setRecentOpps(oRes.data.slice(0, 4));

        // Fetch user's applications
        try {
          const myAppsRes = await axios.get('/api/applications/my');
          setMyApplications(myAppsRes.data.slice(0, 5));
        } catch (e) { /* might not have any */ }

        // Fetch application stats for admin
        if (user?.role === 'admin') {
          try {
            const appStatsRes = await axios.get('/api/applications/stats');
            setAppStats(appStatsRes.data);
          } catch (e) { /* ignore */ }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="spinner" />;

  const statCards = [
    { icon: '🏃', num: stats.athletes, label: 'Total Athletes', color: 'green', link: '/athletes' },
    { icon: '🌾', num: stats.ruralAthletes, label: 'Rural Athletes', color: 'amber', link: '/athletes' },
    { icon: '🎯', num: stats.opportunities, label: 'Opportunities', color: 'purple', link: '/opportunities' },
    { icon: '📊', num: stats.performances, label: 'Performances', color: 'blue', link: '/leaderboard' },
    { icon: '🗺️', num: stats.states, label: 'States Covered', color: 'green', link: '/athletes' },
  ];

  const quickActions = [
    { to: '/add-athlete', icon: '👤', label: 'Add Athlete', desc: 'Create a new athlete profile' },
    { to: '/leaderboard', icon: '🏆', label: 'Leaderboard', desc: 'View top performers' },
    { to: '/athletes', icon: '🔍', label: 'Browse Athletes', desc: 'Discover talent' },
  ];

  // Admin-only quick actions
  if (user?.role === 'admin') {
    quickActions.splice(1, 0, { to: '/add-opportunity', icon: '📋', label: 'Post Opportunity', desc: 'Share a sports program' });
    quickActions.push({ to: '/admin/applications', icon: '✅', label: 'Manage Applications', desc: `${appStats?.pending || 0} pending reviews` });
  }

  return (
    <div className="page">
      {/* Welcome Header */}
      <div className="dash-welcome">
        <div className="dash-welcome-left">
          <div className="dash-greeting">
            <span className="dash-wave">👋</span>
            Welcome back,
          </div>
          <h1>{user?.name}</h1>
          <p>Role: <span className="badge badge-green">{user?.role}</span></p>
        </div>
        <div className="dash-welcome-right">
          <div className="dash-date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Admin Application Stats Banner */}
      {user?.role === 'admin' && appStats && appStats.pending > 0 && (
        <Link to="/admin/applications" className="admin-pending-banner">
          <span>⚠️</span>
          <div>
            <strong>{appStats.pending} application{appStats.pending !== 1 ? 's' : ''} pending review</strong>
            <span>Click to review and approve/reject applications</span>
          </div>
          <span className="apb-arrow">→</span>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="dash-stats stagger-children">
        {statCards.map((s, i) => (
          <Link to={s.link} key={i} className={`dash-stat-card dash-stat-${s.color}`}>
            <div className="ds-icon-wrap">
              <span className="ds-icon">{s.icon}</span>
            </div>
            <div className="ds-num">{s.num}</div>
            <div className="ds-label">{s.label}</div>
            <div className="ds-hover-bar" />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dash-section">
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="dash-actions">
          {quickActions.map((a, i) => (
            <Link to={a.to} className="dash-action-btn" key={i}>
              <span className="dab-icon">{a.icon}</span>
              <div>
                <span className="dab-label">{a.label}</span>
                <span className="dab-desc">{a.desc}</span>
              </div>
              <span className="dab-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* My Applications (for non-admin users) */}
      {user?.role !== 'admin' && myApplications.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-section-title">My Applications</h2>
          <div className="my-apps-list">
            {myApplications.map(app => (
              <Link to={`/opportunities/${app.opportunity?._id}`} key={app._id} className="my-app-item">
                <div className="mai-icon">📝</div>
                <div className="mai-info">
                  <strong>{app.opportunity?.title || 'Unknown Opportunity'}</strong>
                  <span>{app.opportunity?.organization} {app.opportunity?.sport && `• ${app.opportunity.sport}`}</span>
                </div>
                <div className={`mai-status mai-${app.status}`}>
                  {app.status === 'pending' && '⏳ Pending'}
                  {app.status === 'approved' && '✅ Approved'}
                  {app.status === 'rejected' && '❌ Rejected'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Two Column */}
      <div className="dash-two-col">
        {/* Recent Athletes */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-section-title">Recent Athletes</h2>
            <Link to="/athletes" className="view-all-link">View all →</Link>
          </div>
          <div className="recent-list">
            {recentAthletes.length === 0 ? (
              <p className="empty-inline">No athletes yet. <Link to="/add-athlete">Add one →</Link></p>
            ) : recentAthletes.map(a => (
              <Link to={`/athletes/${a._id}`} key={a._id} className="recent-item">
                <div className="ri-avatar">{a.name?.charAt(0)}</div>
                <div className="ri-info">
                  <strong>{a.name}</strong>
                  <span>{[a.city, a.state].filter(Boolean).join(', ') || 'Location unknown'}</span>
                </div>
                <div className="ri-right">
                  {a.isRural && <span className="badge badge-green">Rural</span>}
                  {a.sports?.[0] && <span className="badge badge-muted">{a.sports[0]}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-section-title">Recent Opportunities</h2>
            <Link to="/opportunities" className="view-all-link">View all →</Link>
          </div>
          <div className="recent-list">
            {recentOpps.length === 0 ? (
              <p className="empty-inline">No opportunities yet. {user?.role === 'admin' && <Link to="/add-opportunity">Post one →</Link>}</p>
            ) : recentOpps.map(o => (
              <Link to={`/opportunities/${o._id}`} key={o._id} className="recent-item">
                <div className="ri-avatar ri-avatar-amber">🎯</div>
                <div className="ri-info">
                  <strong>{o.title}</strong>
                  <span>{o.organization}</span>
                </div>
                <div className="ri-right">
                  {o.sport && <span className="badge badge-amber">{o.sport}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Sports */}
      {topSports.length > 0 && (
        <div className="dash-section" style={{ marginTop: '1.5rem' }}>
          <h2 className="dash-section-title">Popular Sports</h2>
          <div className="dash-sports-bar">
            {topSports.map((s, i) => {
              const maxCount = topSports[0]?.count || 1;
              return (
                <div className="sport-bar-item" key={i}>
                  <div className="sport-bar-label">{s._id}</div>
                  <div className="sport-bar-track">
                    <div className="sport-bar-fill" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                  </div>
                  <div className="sport-bar-count">{s.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
