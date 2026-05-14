import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-logo">
        Athletes<span>Bridge</span>
        <div className="nav-logo-badge">AI</div>
      </Link>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/athletes" className={isActive('/athletes') ? 'active' : ''}>Athletes</Link>
        <Link to="/opportunities" className={isActive('/opportunities') ? 'active' : ''}>Opportunities</Link>
        <Link to="/leaderboard" className={isActive('/leaderboard') ? 'active' : ''}>Leaderboard</Link>
        <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
        <Link to="/feedback" className={isActive('/feedback') ? 'active' : ''}>Feedback</Link>

        {user && <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>}
        {user && user.role !== 'admin' && (
          <Link to="/my-applications" className={isActive('/my-applications') ? 'active' : ''}>My Applications</Link>
        )}
        {user && user.role === 'admin' && (
          <Link to="/admin/applications" className={isActive('/admin/applications') ? 'active' : ''}>
            Admin
          </Link>
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <NotificationCenter />
            <div className="nav-user-pill">
              <div className="nav-user-avatar">{user.name?.charAt(0)}</div>
              <span className="nav-user-name">{user.name}</span>
              {user.role === 'admin' && <span className="nav-admin-badge">Admin</span>}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span className={menuOpen ? 'line1 open' : 'line1'} />
        <span className={menuOpen ? 'line2 open' : 'line2'} />
        <span className={menuOpen ? 'line3 open' : 'line3'} />
      </button>
    </nav>
  );
}
