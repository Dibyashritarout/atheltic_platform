import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AIVideoAnalyzer from '../components/AIVideoAnalyzer';

const SPORTS = ['Athletics', 'Basketball', 'Football', 'Cricket', 'Kabaddi', 'Wrestling', 'Boxing', 'Swimming', 'Badminton', 'Volleyball'];

export default function AddPerformance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ jumpHeight: '', jumpLength: '', runningDistance: '', runningTime: '', runningSpeed: '', sport: '', notes: '', videoUrl: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      // Validate that at least one metric is provided
      const metrics = ['jumpHeight', 'jumpLength', 'runningSpeed'];
      const hasMetric = metrics.some(m => form[m]);
      
      if (!hasMetric) {
        setError('Please enter at least one performance metric (Jump Height, Jump Length, or Sprint Speed).');
        setLoading(false);
        return;
      }

      let finalVideoUrl = form.videoUrl || '';
      if (videoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', videoFile);
        const upRes = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        finalVideoUrl = upRes.data.url;
        setUploading(false);
      }

      const payload = {};
      ['jumpHeight', 'jumpLength', 'runningDistance', 'runningTime', 'runningSpeed'].forEach(k => {
        if (form[k]) payload[k] = Number(form[k]);
      });
      if (form.sport) payload.sport = form.sport;
      if (form.notes) payload.notes = form.notes;
      if (finalVideoUrl) payload.videoUrl = finalVideoUrl;

      await axios.post(`/api/athletes/${id}/performance`, payload);
      navigate(`/athletes/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add performance.');
    } finally {
      setLoading(false); setUploading(false);
    }
  };

  return (
    <div className="page">
      <Link to={`/athletes/${id}`} className="back-link">← Back to Profile</Link>
      <div className="page-header">
        <h1>Add Performance</h1>
        <p>Log a new performance entry for this athlete</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Jump Metrics</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Jump Height (cm)</label>
                <input name="jumpHeight" type="number" step="0.1" min="0" value={form.jumpHeight} onChange={handleChange} placeholder="e.g. 75" />
              </div>
              <div className="form-group">
                <label>Jump Length (meters)</label>
                <input name="jumpLength" type="number" step="0.01" min="0" value={form.jumpLength} onChange={handleChange} placeholder="e.g. 5.2" />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Running Metrics</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Distance (meters)</label>
                <input name="runningDistance" type="number" min="0" value={form.runningDistance} onChange={handleChange} placeholder="e.g. 100" />
              </div>
              <div className="form-group">
                <label>Time (seconds)</label>
                <input name="runningTime" type="number" step="0.01" min="0" value={form.runningTime} onChange={handleChange} placeholder="e.g. 11.5" />
              </div>
            </div>
            <div className="form-group">
              <label>Speed (km/h)</label>
              <input name="runningSpeed" type="number" step="0.1" min="0" value={form.runningSpeed} onChange={handleChange} placeholder="e.g. 28.5" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.4)', marginBottom: '1.25rem' }}>Details</h3>
            <div className="form-group">
              <label>Sport</label>
              <select name="sport" value={form.sport} onChange={handleChange}>
                <option value="">Select sport</option>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any additional notes about this performance…" />
            </div>
            <div className="form-group">
              <label>Video Evidence (Upload MP4, max 100MB)</label>
              <input type="file" accept="video/*" onChange={e => {
                setVideoFile(e.target.files[0]);
                if (e.target.files[0]) setForm(prev => ({...prev, videoUrl: ''}));
              }} style={{ padding: '0.5rem 0' }} disabled={form.videoUrl.length > 0} />
            </div>

            <div className="form-group" style={{ textAlign: 'center', margin: '-10px 0 10px 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              — OR —
            </div>

            <div className="form-group">
              <label>Paste an External Video Link (YouTube, Drive, etc.)</label>
              <input name="videoUrl" type="url" value={form.videoUrl} onChange={e => {
                handleChange(e);
                if (e.target.value) setVideoFile(null);
              }} placeholder="https://..." disabled={!!videoFile} />
            </div>
            
            {videoFile && (
              <AIVideoAnalyzer 
                videoFile={videoFile} 
                onAnalysisComplete={(val) => {
                  if(val) setForm(prev => ({...prev, jumpHeight: val}));
                }} 
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {uploading ? 'Uploading video…' : loading ? 'Saving…' : 'Save Performance'}
            </button>
            <Link to={`/athletes/${id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
