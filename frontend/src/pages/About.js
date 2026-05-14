import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './About.css';

export default function About() {
  const techStack = [
    { name: 'React 18', desc: 'Frontend UI Library', icon: '⚛️', color: '#61DAFB' },
    { name: 'Node.js', desc: 'Backend Runtime', icon: '🟢', color: '#68A063' },
    { name: 'Express', desc: 'API Framework', icon: '⚡', color: '#888' },
    { name: 'MongoDB', desc: 'NoSQL Database', icon: '🍃', color: '#4DB33D' },
    { name: 'AI Engine', desc: 'Custom ML Algorithm', icon: '🤖', color: '#EF9F27' },
    { name: 'JWT Auth', desc: 'Secure Authentication', icon: '🔐', color: '#F87171' },
  ];

  const features = [
    { icon: '🏃', title: 'Athlete Profiles', desc: 'Comprehensive profiles with sports, location, bio, and rural indicator for priority matching.' },
    { icon: '📊', title: 'Performance Tracking', desc: 'Log jump heights, distances, sprint speeds with video evidence. Track progress over time.' },
    { icon: '🤖', title: 'AI Performance Engine', desc: 'Custom-built scoring algorithm using linear regression, sport-science benchmarks, and trend analysis.' },
    { icon: '📈', title: 'Predictive Analytics', desc: 'Predicts future performance based on historical data. Classifies athlete potential from Beginner to Olympic-Track.' },
    { icon: '🎯', title: 'Smart Matching', desc: 'Intelligent compatibility scoring between athletes and opportunities based on sport, performance, and background.' },
    { icon: '🏆', title: 'Live Leaderboard', desc: 'Real-time rankings with animated podium, multi-metric sorting, and performance comparison.' },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-hero-content">
          <div className="about-eyebrow">About the Project</div>
          <h1>Bridging Rural Talent<br /><em>With Technology</em></h1>
          <p>
            AthletesBridge is an AI-powered full-stack web platform designed to democratize 
            sports talent discovery in India. By combining data-driven performance analysis 
            with intelligent opportunity matching, we aim to ensure that no talented athlete 
            goes unnoticed due to geographical or financial barriers.
          </p>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="about-section">
        <div className="about-grid-2">
          <div className="about-box">
            <div className="about-box-icon">❌</div>
            <h2>The Problem</h2>
            <p>
              Millions of talented young athletes in rural India lack access to professional 
              coaches, training facilities, and scouting networks. Their performance data 
              goes unrecorded, their potential unrecognized. Geographic isolation creates an 
              invisible barrier between talent and opportunity.
            </p>
          </div>
          <div className="about-box about-box-green">
            <div className="about-box-icon">✅</div>
            <h2>Our Solution</h2>
            <p>
              AthletesBridge provides a digital platform where athletes can log their 
              performance metrics, get AI-powered analysis and scoring, receive training 
              recommendations, and get automatically matched with scholarships and sports 
              programs — all accessible from a basic smartphone.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="about-section about-section-dark">
        <div className="section-label" style={{ textAlign: 'center' }}>Key Features</div>
        <h2 className="about-section-title">What Makes This Different</h2>
        <div className="about-features-grid stagger-children">
          {features.map((f, i) => (
            <div className="about-feature-card" key={i}>
              <div className="afc-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Deep Dive */}
      <section className="about-section">
        <div className="section-label" style={{ textAlign: 'center' }}>Technical Innovation</div>
        <h2 className="about-section-title">AI Performance Engine — How It Works</h2>
        <div className="ai-pipeline">
          {[
            { step: '01', title: 'Data Collection', desc: 'Athletes log performance metrics: vertical jump, standing long jump, sprint times, and speed across multiple sessions.', color: '#1D9E75' },
            { step: '02', title: 'Statistical Scoring', desc: 'Each metric is scored (0-100) against national sport-science benchmarks using a multi-range normalization algorithm.', color: '#EF9F27' },
            { step: '03', title: 'Trend Analysis', desc: 'Linear regression is applied to historical data to calculate improvement slopes, R² confidence, and detect trends.', color: '#9333EA' },
            { step: '04', title: 'Prediction & Classification', desc: 'Future performance is predicted. Athletes are classified into tiers: Beginner → Emerging → Promising → Elite → Olympic-Track.', color: '#3B82F6' },
          ].map((s, i) => (
            <div className="ai-pipeline-step" key={i}>
              <div className="ai-pipeline-num" style={{ color: s.color }}>{s.step}</div>
              <div className="ai-pipeline-line" style={{ background: s.color }} />
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="about-section about-section-dark">
        <div className="section-label" style={{ textAlign: 'center' }}>Technology</div>
        <h2 className="about-section-title">Built With</h2>
        <div className="tech-grid stagger-children">
          {techStack.map((t, i) => (
            <div className="tech-card" key={i} style={{ '--accent': t.color }}>
              <span className="tech-icon">{t.icon}</span>
              <div>
                <div className="tech-name">{t.name}</div>
                <div className="tech-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-section" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
        <h2 className="about-section-title">Ready to Explore?</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/athletes" className="btn btn-primary btn-lg">Browse Athletes</Link>
          <Link to="/leaderboard" className="btn btn-secondary btn-lg">View Leaderboard</Link>
          <Link to="/register" className="btn btn-secondary btn-lg">Get Started</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
