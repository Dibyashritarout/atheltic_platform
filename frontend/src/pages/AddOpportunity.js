import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SPORTS = ['Athletics', 'Basketball', 'Football', 'Cricket', 'Kabaddi', 'Wrestling', 'Boxing', 'Swimming', 'Badminton', 'Volleyball', 'Tennis', 'Hockey', 'Any'];

export default function AddOpportunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', organization: '', location: '', sport: '', requirements: '', deadline: '', stipend: '', applicationLink: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin guard
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/opportunities');
    }
  }, [user, navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('/api/opportunities', form);
      navigate('/opportunities');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post opportunity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Link to="/opportunities" className="back-link">← Back to Opportunities</Link>
      <div className="page-header">
        <h1>Post Opportunity</h1>
        <p>Create a new scholarship or sports opportunity</p>
      </div>

      <div style={{ maxWidth: '680px' }}>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Opportunity Details</h3>
            <div className="form-group">
              <label>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. SAI National Sports Scholarship" required />
            </div>
            <div className="form-group">
              <label>Organization *</label>
              <input name="organization" value={form.organization} onChange={handleChange} placeholder="Name of the org / institution" required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Full description of the opportunity…" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Sport</label>
                <select name="sport" value={form.sport} onChange={handleChange}>
                  <option value="">Select sport</option>
                  {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. New Delhi, India" />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Application Info</h3>
            <div className="form-group">
              <label>Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} placeholder="Age limit, performance criteria, eligibility…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Deadline</label>
                <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Stipend / Benefit</label>
                <input name="stipend" value={form.stipend} onChange={handleChange} placeholder="e.g. ₹25,000/month or Full Tuition" />
              </div>
            </div>
            <div className="form-group">
              <label>Application Link</label>
              <input name="applicationLink" type="url" value={form.applicationLink} onChange={handleChange} placeholder="https://apply.example.com" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Posting…' : 'Post Opportunity'}</button>
            <Link to="/opportunities" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
