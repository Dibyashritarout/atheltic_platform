import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import './Home.css';

/* ── Animated Counter Hook ─────────────────────────────────────────────────── */
function useCounter(end, duration = 2000, start = 0) {
  const [value, setValue] = useState(start);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(start + (end - start) * ease));
          if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
      }
    }, { threshold: 0.3 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return [value, ref];
}

/* ── Scroll Reveal Hook ────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const [stats, setStats] = useState({ athletes: 0, opportunities: 0, performances: 0, states: 0 });
  const [featuredAthletes, setFeaturedAthletes] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/athletes/stats/overview'),
      axios.get('/api/athletes'),
    ]).then(([statsRes, athletesRes]) => {
      const s = statsRes.data;
      setStats({
        athletes: s.totalAthletes || 0,
        opportunities: 0,
        performances: s.totalPerformances || 0,
        states: s.statesCovered || 0,
      });
      // Pick top 3 rural athletes as featured
      const rural = athletesRes.data.filter(a => a.isRural).slice(0, 3);
      setFeaturedAthletes(rural.length > 0 ? rural : athletesRes.data.slice(0, 3));

      // Fetch opportunities count
      axios.get('/api/opportunities').then(r => setStats(prev => ({ ...prev, opportunities: r.data.length })));
    }).catch(() => {});
  }, []);

  const [countAthletes, refAthletes] = useCounter(stats.athletes);
  const [countOpps, refOpps] = useCounter(stats.opportunities);
  const [countPerfs, refPerfs] = useCounter(stats.performances);
  const [countStates, refStates] = useCounter(stats.states);

  const revealHow = useReveal();
  const revealFeatured = useReveal();
  const revealImpact = useReveal();
  const revealTestimonials = useReveal();
  const revealCta = useReveal();

  return (
    <div className="home">
      {/* ── Animated Background ─────────────────────────────────────────── */}
      <div className="home-bg-effects">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            AI-Powered Sports Platform
          </div>
          <h1>
            Discover Talent<br />
            <em>Beyond Boundaries</em>
          </h1>
          <p>
            An AI-powered platform connecting young athletes from underserved rural areas 
            with scholarships, training programs, and scouts — through intelligent 
            performance analysis and data-driven matching.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free →
            </Link>
            <Link to="/athletes" className="btn btn-secondary btn-lg">
              Explore Athletes
            </Link>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              {['A', 'P', 'R', 'V', 'D'].map((l, i) => (
                <div key={i} className="trust-avatar" style={{ animationDelay: `${i * 0.1}s` }}>{l}</div>
              ))}
            </div>
            <span>{stats.athletes > 0 ? `${stats.athletes}+ athletes` : 'Join'} already on the platform</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="hero-demo-card hdc-1">
              <div className="hdc-header">
                <div className="hdc-avatar">🏃</div>
                <div>
                  <div className="hdc-name">AI Analysis</div>
                  <div className="hdc-sub">Performance Score</div>
                </div>
              </div>
              <div className="hdc-score">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#1D9E75" strokeWidth="6"
                    strokeDasharray={`${213.6 * 0.78} ${213.6}`} strokeLinecap="round"
                    transform="rotate(-90 40 40)" className="hdc-gauge" />
                </svg>
                <span className="hdc-score-num">78</span>
              </div>
              <div className="hdc-badge-row">
                <span className="badge badge-green">Elite</span>
                <span className="badge badge-amber">Athletics</span>
              </div>
            </div>
            <div className="hero-demo-card hdc-2">
              <div className="hdc-mini-chart">
                <svg viewBox="0 0 120 40" className="hdc-sparkline">
                  <polyline points="0,35 20,28 40,30 60,20 80,15 100,12 120,8" fill="none" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round" />
                  <polyline points="0,35 20,28 40,30 60,20 80,15 100,12 120,8 120,40 0,40" fill="url(#sparkGrad)" />
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(239,159,39,0.2)" />
                      <stop offset="100%" stopColor="rgba(239,159,39,0)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="hdc-trend">📈 +18% improvement</div>
              </div>
            </div>
            <div className="hero-demo-card hdc-3">
              <div className="hdc-match">
                <span>🎯</span>
                <div>
                  <div className="hdc-match-title">3 Opportunities Matched</div>
                  <div className="hdc-match-sub">Based on your performance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker">
          {['AI Performance Analysis', 'Smart Scholarship Matching', 'Real-Time Leaderboard', 'Rural Athletes First', 'Video Evidence Upload', 'Trend Predictions', 'Training Recommendations', 'Performance Scoring',
            'AI Performance Analysis', 'Smart Scholarship Matching', 'Real-Time Leaderboard', 'Rural Athletes First', 'Video Evidence Upload', 'Trend Predictions', 'Training Recommendations', 'Performance Scoring']
            .map((t, i) => <React.Fragment key={i}><span className="ticker-item">{t}</span><span className="ticker-sep">✦</span></React.Fragment>)}
        </div>
      </div>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="how-section reveal" ref={revealHow}>
        <div className="section-label">How It Works</div>
        <h2>From Village Field <em>to National Stage</em></h2>
        <div className="steps-grid stagger-children">
          {[
            { num: '01', icon: '👤', title: 'Create Profile', desc: 'Sign up free — add your name, location, sport, and mark yourself as a rural athlete for priority matching.' },
            { num: '02', icon: '📊', title: 'Log Performance', desc: 'Track vertical jump, long jump, sprint times, and speed. Upload video proof of your athletic capabilities.' },
            { num: '03', icon: '🤖', title: 'Get AI Analysis', desc: 'Our AI engine scores your performance (0-100), predicts future trends, and classifies your potential level.' },
            { num: '04', icon: '🎯', title: 'Match & Connect', desc: 'Smart algorithm matches you with scholarships, training programs, and scouts based on your sport and performance.' },
          ].map(s => (
            <div className="step-card" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon-wrap">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="step-line" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Athletes ───────────────────────────────────────────── */}
      {featuredAthletes.length > 0 && (
        <section className="featured-section reveal" ref={revealFeatured}>
          <div className="section-label">Spotlight</div>
          <h2>Featured Athletes</h2>
          <div className="featured-grid stagger-children">
            {featuredAthletes.map(a => (
              <Link to={`/athletes/${a._id}`} className="featured-card" key={a._id}>
                <div className="fc-avatar">
                  {a.profileImage
                    ? <img src={a.profileImage} alt={a.name} />
                    : <span>{a.name?.charAt(0)}</span>}
                </div>
                <h3>{a.name}</h3>
                <p className="fc-location">📍 {[a.city, a.state].filter(Boolean).join(', ')}</p>
                <div className="fc-sports">
                  {a.sports?.slice(0, 2).map((s, i) => (
                    <span key={i} className="badge badge-muted">{s}</span>
                  ))}
                  {a.isRural && <span className="badge badge-green">Rural</span>}
                </div>
                {a.bio && <p className="fc-bio">{a.bio.slice(0, 100)}…</p>}
                <span className="fc-view">View Profile →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Impact Stats ────────────────────────────────────────────────── */}
      <section className="impact-section reveal" ref={revealImpact}>
        <div className="impact-bg" />
        <div className="section-label" style={{ textAlign: 'center' }}>Impact</div>
        <h2 style={{ textAlign: 'center' }}>Platform at a Glance</h2>
        <div className="impact-grid">
          <div className="impact-card" ref={refAthletes}>
            <div className="impact-num">{countAthletes}</div>
            <div className="impact-label">Athletes Registered</div>
            <div className="impact-bar" style={{ background: 'var(--green)' }} />
          </div>
          <div className="impact-card" ref={refOpps}>
            <div className="impact-num" style={{ color: 'var(--amber)' }}>{countOpps}</div>
            <div className="impact-label">Active Opportunities</div>
            <div className="impact-bar" style={{ background: 'var(--amber)' }} />
          </div>
          <div className="impact-card" ref={refPerfs}>
            <div className="impact-num" style={{ color: '#C084FC' }}>{countPerfs}</div>
            <div className="impact-label">Performances Logged</div>
            <div className="impact-bar" style={{ background: '#9333EA' }} />
          </div>
          <div className="impact-card" ref={refStates}>
            <div className="impact-num" style={{ color: '#60A5FA' }}>{countStates}</div>
            <div className="impact-label">States Covered</div>
            <div className="impact-bar" style={{ background: '#3B82F6' }} />
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="testimonials-section reveal" ref={revealTestimonials}>
        <div className="section-label" style={{ textAlign: 'center' }}>Stories</div>
        <h2 style={{ textAlign: 'center' }}>Voices from the Field</h2>
        <div className="testimonials-grid stagger-children">
          {[
            { name: 'Arjun M.', role: 'Sprinter, Rajasthan', quote: 'AthletesBridge helped me get noticed by a national-level coach. The AI analysis showed my improvement trend which convinced them to give me a trial.' },
            { name: 'Priya S.', role: 'Athlete, Madhya Pradesh', quote: 'Coming from a small village, I never thought my athletic talent would be seen. This platform connected me with a scholarship I didn\'t even know existed.' },
            { name: 'Coach Ramesh', role: 'District Coach, Haryana', quote: 'The performance data and AI scoring system helps me identify promising athletes from remote areas. It\'s a game-changer for talent scouting.' },
          ].map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="tc-quote">"</div>
              <p>{t.quote}</p>
              <div className="tc-author">
                <div className="tc-avatar">{t.name.charAt(0)}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="home-cta reveal" ref={revealCta}>
        <div className="cta-box">
          <div className="cta-glow" />
          <h2>Your Talent Deserves<br /><em>to Be Discovered</em></h2>
          <p>Join athletes already breaking barriers on AthletesBridge. Registration is free, always.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Register as Athlete →</Link>
            <Link to="/add-opportunity" className="btn btn-secondary btn-lg">Post an Opportunity</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
