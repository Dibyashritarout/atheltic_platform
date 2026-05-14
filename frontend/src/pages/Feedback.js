import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './Feedback.css';

export default function Feedback() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'General Feedback',
    subject: '',
    message: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const categories = ['Bug', 'Feature Request', 'General Feedback', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRating = (val) => {
    setFormData(prev => ({ ...prev, rating: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/feedback', {
        ...formData,
        user: user?.id
      });
      setSuccess(response.data.message);
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        category: 'General Feedback',
        subject: '',
        message: '',
        rating: 5
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <div className="feedback-header">
          <h1>We Value Your <em>Feedback</em></h1>
          <p>Help us improve the platform for athletes across the country. Your insights make a difference.</p>
        </div>

        <div className="feedback-card">
          {success ? (
            <div className="feedback-success">
              <div className="success-icon">✓</div>
              <h2>Thank You!</h2>
              <p>{success}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setSuccess(null)}
              >
                Send More Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                        onClick={() => handleRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tell us more about your experience..."
                ></textarea>
              </div>

              {error && <div className="feedback-error">{error}</div>}

              <button 
                type="submit" 
                className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Feedback →'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
