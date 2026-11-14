import React, { useState, useEffect } from 'react';
import { IconStar, IconCheck } from './Icons';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { when } from '../utils/format';

export default function ReviewSection({ parkingId, currentRating = 4.5, totalReviews = 0 }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadReviews = () => {
    api.reviews(parkingId).then(setReviews).catch(() => {});
  };

  useEffect(() => {
    loadReviews();
  }, [parkingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    setMsg('');
    try {
      await api.addReview(parkingId, { rating, comment, vehicleType });
      setComment('');
      setShowAddForm(false);
      setMsg('Review submitted successfully!');
      loadReviews();
    } catch (err) {
      setMsg(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-subtle)', paddingTop: '32px' }}>
      <div className="between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: '#fff' }}>Driver Reviews & Ratings</h2>
          <p className="muted small">Verified feedback from drivers who parked here</p>
        </div>

        {user ? (
          <button
            className="btn sm amber"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Close Form' : 'Write a Review'}
          </button>
        ) : (
          <span className="small muted">Log in to leave a review</span>
        )}
      </div>

      {msg && <p className="ok small" style={{ marginBottom: '16px' }}>{msg}</p>}

      {/* Write Review Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-control)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Share Your Parking Experience</h3>

          {/* Star selector */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
            <span className="small muted">Your Rating:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: star <= rating ? '#fbbf24' : '#475569',
                    padding: '2px',
                  }}
                >
                  <IconStar size={22} filled={star <= rating} />
                </button>
              ))}
            </div>
            <strong className="mono ok" style={{ marginLeft: '6px' }}>{rating}.0</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
            <label>
              Vehicle Used
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                {['CAR', 'BIKE', 'SUV', 'AUTO'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label>
              Comments
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the entrance, shade, and space?"
                required
              />
            </label>
          </div>

          <button className="btn sm" disabled={loading}>
            {loading ? 'Submitting…' : 'Post Review'}
          </button>
        </form>
      )}

      {/* Review List */}
      <div style={{ display: 'grid', gap: '14px' }}>
        {reviews.length === 0 ? (
          <p className="muted small" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: '8px' }}>
            No reviews posted yet. Be the first driver to rate this facility!
          </p>
        ) : (
          reviews.map((r) => (
            <div
              key={r._id}
              style={{
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div className="between" style={{ marginBottom: '6px' }}>
                <div className="row gap-sm">
                  <strong style={{ color: '#fff', fontSize: '14px' }}>{r.userName}</strong>
                  <span className="live-badge" style={{ padding: '1px 6px', fontSize: '10px' }}>
                    <IconCheck size={10} /> Verified Driver
                  </span>
                </div>
                <div className="row gap-sm" style={{ color: '#fbbf24' }}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <IconStar key={i} size={14} filled />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>{r.comment}</p>
              <div className="row between small muted">
                <span>Parked: {r.vehicleType || 'CAR'}</span>
                <span>{when(r.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
