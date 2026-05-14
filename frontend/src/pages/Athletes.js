import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AthleteCard from '../components/AthleteCard';
import { useAuth } from '../context/AuthContext';

const SPORTS = ['Athletics', 'Basketball', 'Football', 'Cricket', 'Kabaddi', 'Wrestling', 'Boxing', 'Swimming', 'Badminton', 'Volleyball'];

export default function Athletes() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', sport: '', isRural: '' });

  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.sport) params.sport = filters.sport;
      if (filters.isRural) params.isRural = filters.isRural;
      const res = await axios.get('/api/athletes', { params });
      setAthletes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAthletes();
  }, [filters]);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Athletes</h1>
          <p>{athletes.length} athlete{athletes.length !== 1 ? 's' : ''} found</p>
        </div>
        {user && <Link to="/add-athlete" className="btn btn-primary">+ Add Athlete</Link>}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input
          placeholder="Search by name…"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          style={{ maxWidth: '240px' }}
        />
        <select value={filters.sport} onChange={e => setFilters({ ...filters, sport: e.target.value })} style={{ maxWidth: '180px' }}>
          <option value="">All Sports</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.isRural} onChange={e => setFilters({ ...filters, isRural: e.target.value })} style={{ maxWidth: '180px' }}>
          <option value="">All Areas</option>
          <option value="true">Rural Only</option>
        </select>
        {(filters.search || filters.sport || filters.isRural) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ search: '', sport: '', isRural: '' })}>Clear</button>
        )}
      </div>

      {loading ? <div className="spinner" /> : athletes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏃</div>
          <p>No athletes found. Try adjusting your filters.</p>
          {user && <Link to="/add-athlete" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add First Athlete</Link>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {athletes.map(a => <AthleteCard key={a._id} athlete={a} />)}
        </div>
      )}
    </div>
  );
}
