import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Athletes<span>Bridge</span></Link>
            <p>Connecting rural athletes with sports opportunities and scholarships through AI-powered performance analysis.</p>
            <div className="footer-social">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-btn">𝕏</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-btn">📷</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-btn">in</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="social-btn">⌨</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/athletes">Browse Athletes</Link>
            <Link to="/opportunities">Opportunities</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/about">About Us</Link>
            <Link to="/feedback">Feedback</Link>

          </div>

          {/* For Athletes */}
          <div className="footer-col">
            <h4>For Athletes</h4>
            <Link to="/register">Register Free</Link>
            <Link to="/add-athlete">Create Profile</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/leaderboard">Rankings</Link>
          </div>

          {/* For Organizations */}
          <div className="footer-col">
            <h4>For Organizations</h4>
            <Link to="/add-opportunity">Post Opportunity</Link>
            <Link to="/opportunities">Active Programs</Link>
            <Link to="/register">Partner With Us</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>© {new Date().getFullYear()} AthletesBridge. Capstone Project — Built with ❤️ for rural athletes.</p>
          </div>
          <div className="footer-bottom-right">
            <span className="footer-tech-badge">React</span>
            <span className="footer-tech-badge">Node.js</span>
            <span className="footer-tech-badge">MongoDB</span>
            <span className="footer-tech-badge">AI Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
