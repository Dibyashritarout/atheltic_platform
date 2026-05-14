import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Athletes from './pages/Athletes';
import AthleteProfile from './pages/AthleteProfile';
import AddAthlete from './pages/AddAthlete';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import AddOpportunity from './pages/AddOpportunity';
import AddPerformance from './pages/AddPerformance';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import AdminApplications from './pages/AdminApplications';
import MyApplications from './pages/MyApplications';
import InjuryTracker from './pages/InjuryTracker';
import Feedback from './pages/Feedback';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/athletes/:id" element={<AthleteProfile />} />
          
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/my-applications" element={<PrivateRoute><MyApplications /></PrivateRoute>} />
          <Route path="/add-athlete" element={<PrivateRoute><AddAthlete /></PrivateRoute>} />
          <Route path="/add-opportunity" element={<AdminRoute><AddOpportunity /></AdminRoute>} />
          <Route path="/athletes/:id/add-performance" element={<PrivateRoute><AddPerformance /></PrivateRoute>} />
          <Route path="/athletes/:id/injuries" element={<InjuryTracker />} />
          <Route path="/feedback" element={<Feedback />} />

          
      
          <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
        </Routes>
      </div>
      <Chatbot />
    </BrowserRouter>
  );
}
