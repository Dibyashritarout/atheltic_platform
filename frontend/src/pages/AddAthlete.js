import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const SPORTS = ['Athletics', 'Basketball', 'Football', 'Cricket', 'Kabaddi', 'Wrestling', 'Boxing', 'Swimming', 'Badminton', 'Volleyball', 'Tennis', 'Hockey'];
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir'];

export default function AddAthlete() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', state: '', city: '', sports: [], isRural: false, bio: '' });
  const [performance, setPerformance] = useState({ jumpHeight: '', jumpLength: '', runningDistance: '', runningTime: '', runningSpeed: '', sport: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePerformanceChange = e => {
    const { name, value } = e.target;
    setPerformance({ ...performance, [name]: value });
  };

  const toggleSport = sport => {
    setForm(f => ({
      ...f,
      sports: f.sports.includes(sport) ? f.sports.filter(s => s !== sport) : [...f.sports, sport]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post('/api/athletes', { ...form, age: form.age ? Number(form.age) : undefined });
      const athleteId = res.data._id;

      // Add performance data if provided
      if (performance.jumpHeight || performance.jumpLength || performance.runningSpeed) {
        const perfPayload = {};
        if (performance.jumpHeight) perfPayload.jumpHeight = Number(performance.jumpHeight);
        if (performance.jumpLength) perfPayload.jumpLength = Number(performance.jumpLength);
        if (performance.runningDistance) perfPayload.runningDistance = Number(performance.runningDistance);
        if (performance.runningTime) perfPayload.runningTime = Number(performance.runningTime);
        if (performance.runningSpeed) perfPayload.runningSpeed = Number(performance.runningSpeed);
        if (performance.sport) perfPayload.sport = performance.sport;
        if (performance.notes) perfPayload.notes = performance.notes;

        await axios.post(`/api/athletes/${athleteId}/performance`, perfPayload);
      }

      navigate(`/athletes/${athleteId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Link to="/athletes" className="back-link">← Back to Athletes</Link>
      <div className="page-header">
        <h1>Add Athlete</h1>
        <p>Create a new athlete profile</p>
      </div>

      <div style={{ maxWidth: '680px' }}>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Basic Info</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Athlete's full name" required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="athlete@example.com" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input name="age" type="number" min="5" max="60" value={form.age} onChange={handleChange} placeholder="e.g. 18" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <select name="state" value={form.state} onChange={handleChange}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>City / Village</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="City or village name" />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isRural" checked={form.isRural} onChange={handleChange} style={{ width: 'auto' }} />
                From a rural area
              </label>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Sports</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SPORTS.map(s => (
                <button key={s} type="button"
                  className={`btn btn-sm ${form.sports.includes(s) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleSport(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Bio</h3>
            <div className="form-group">
              <label>About the Athlete</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Brief description, achievements, goals…" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Initial Performance (Optional)</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(240,237,230,0.6)', marginBottom: '1rem' }}>Add the athlete's first performance record to start tracking progress</p>
            
            <div className="card" style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.5)', marginBottom: '0.75rem' }}>Jump Metrics</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Jump Height (cm)</label>
                  <input name="jumpHeight" type="number" step="0.1" min="0" value={performance.jumpHeight} onChange={handlePerformanceChange} placeholder="e.g. 55" />
                </div>
                <div className="form-group">
                  <label>Jump Length (meters)</label>
                  <input name="jumpLength" type="number" step="0.01" min="0" value={performance.jumpLength} onChange={handlePerformanceChange} placeholder="e.g. 4.8" />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.5)', marginBottom: '0.75rem' }}>Running Metrics</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Distance (meters)</label>
                  <input name="runningDistance" type="number" min="0" value={performance.runningDistance} onChange={handlePerformanceChange} placeholder="e.g. 100" />
                </div>
                <div className="form-group">
                  <label>Time (seconds)</label>
                  <input name="runningTime" type="number" step="0.01" min="0" value={performance.runningTime} onChange={handlePerformanceChange} placeholder="e.g. 11.5" />
                </div>
              </div>
              <div className="form-group">
                <label>Speed (km/h)</label>
                <input name="runningSpeed" type="number" step="0.1" min="0" value={performance.runningSpeed} onChange={handlePerformanceChange} placeholder="e.g. 31.3" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sport</label>
                <select name="sport" value={performance.sport} onChange={handlePerformanceChange}>
                  <option value="">Select sport</option>
                  {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input name="notes" value={performance.notes} onChange={handlePerformanceChange} placeholder="e.g. Morning training session" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Profile'}</button>
            <Link to="/athletes" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
