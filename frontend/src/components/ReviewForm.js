import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ReviewForm.css';

const ReviewForm = ({ eventId, onReviewSubmit }) => {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="review-login-prompt">
        <p>Please <a href="/login">login</a> to write a review</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/reviews', {
        event_id: eventId,
        rating: rating,
        review_text: reviewText
      });
      
      setSuccess(true);
      setReviewText('');
      setRating(0);
      
      // Refresh event data to show new review
      if (onReviewSubmit) {
        setTimeout(() => {
          onReviewSubmit();
          setSuccess(false);
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="rating-input">
          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ⭐
              </button>
            ))}
            {rating > 0 && <span className="rating-value">{rating}/5</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="review-text">Your Review (Optional):</label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows="4"
            maxLength="500"
          />
          <span className="char-count">{reviewText.length}/500</span>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">Review submitted successfully!</div>}

        <button type="submit" className="btn btn-primary" disabled={submitting || rating === 0}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;



