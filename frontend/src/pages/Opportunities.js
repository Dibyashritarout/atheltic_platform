import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OpportunityCard from '../components/OpportunityCard';
import { useAuth } from '../context/AuthContext';

const SPORTS = ['Athletics', 'Basketball', 'Football', 'Cricket', 'Kabaddi', 'Wrestling', 'Boxing', 'Swimming', 'Badminton', 'Volleyball'];

export default function Opportunities() {
  const { user } = useAuth();
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', sport: '' });

  useEffect(() => {
    const fetchOpps = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.sport) params.sport = filters.sport;
        const res = await axios.get('/api/opportunities', { params });
        setOpps(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, [filters]);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Opportunities</h1>
          <p>{opps.length} opportunit{opps.length !== 1 ? 'ies' : 'y'} available</p>
        </div>
        {user && user.role === 'admin' && <Link to="/add-opportunity" className="btn btn-primary">+ Post Opportunity</Link>}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input
          placeholder="Search opportunities…"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          style={{ maxWidth: '240px' }}
        />
        <select value={filters.sport} onChange={e => setFilters({ ...filters, sport: e.target.value })} style={{ maxWidth: '180px' }}>
          <option value="">All Sports</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filters.search || filters.sport) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ search: '', sport: '' })}>Clear</button>
        )}
      </div>

      {loading ? <div className="spinner" /> : opps.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <p>No opportunities found.</p>
          {user && <Link to="/add-opportunity" className="btn btn-primary" style={{ marginTop: '1rem' }}>Post First Opportunity</Link>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {opps.map(o => <OpportunityCard key={o._id} opp={o} />)}
        </div>
      )}
    </div>
  );
}
