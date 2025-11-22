import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ReviewCard.css';

const ReviewCard = ({ review, onDelete }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const canDelete = user && (user.user_id === review.user_id || user.role === 'admin');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/reviews/${review.review_id}`);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <strong>{review.full_name || review.username}</strong>
          <span className="review-rating">⭐ {review.rating}/5</span>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="delete-review-btn"
            title="Delete review"
          >
            {deleting ? 'Deleting...' : '🗑️'}
          </button>
        )}
      </div>
      {review.review_text && <p>{review.review_text}</p>}
      <div className="review-date">
        {new Date(review.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ReviewCard;



