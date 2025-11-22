import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchEvent();
    fetchShows();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchShows = async () => {
    try {
      const response = await api.get(`/shows?event_id=${id}`);
      const filteredShows = response.data.filter(show => {
        const showDate = new Date(show.show_datetime);
        return showDate >= new Date();
      });
      setShows(filteredShows);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!event) {
    return <div className="container">Event not found</div>;
  }

  const filteredShows = selectedDate
    ? shows.filter(show => show.show_date === selectedDate)
    : shows;

  const uniqueDates = [...new Set(shows.map(show => show.show_date))].sort();

  return (
    <div className="event-detail-page">
      <div className="container">
        <div className="event-header">
          {event.image_url && (
            <div className="event-image-large">
              <img
                src={event.image_url}
                alt={event.event_name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/1200x675?text=Event+Poster';
                }}
              />
            </div>
          )}
          <div className="event-header-info">
            <div className="event-category">{event.category_name}</div>
            <h1>{event.event_name}</h1>
            <p className="event-description-full">{event.description}</p>
            <div className="event-details">
              {event.rating && typeof event.rating === 'number' && (
                <div className="detail-item">
                  <strong>Rating:</strong> ⭐ {event.rating.toFixed(1)}
                </div>
              )}
              {event.duration_minutes && (
                <div className="detail-item">
                  <strong>Duration:</strong> {event.duration_minutes} minutes
                </div>
              )}
              {event.language && (
                <div className="detail-item">
                  <strong>Language:</strong> {event.language}
                </div>
              )}
              {event.release_date && (
                <div className="detail-item">
                  <strong>Release Date:</strong> {new Date(event.release_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="reviews-section">
          <h2>Reviews & Ratings</h2>
          
          <ReviewForm eventId={event.event_id} onReviewSubmit={fetchEvent} />
          
          {event.reviews && event.reviews.length > 0 ? (
            <div className="reviews-list">
              {event.reviews.map(review => (
                <ReviewCard 
                  key={review.review_id} 
                  review={review} 
                  onDelete={fetchEvent} 
                />
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          )}
        </section>

        <section className="shows-section">
          <h2>Available Shows</h2>
          
          {uniqueDates.length > 0 && (
            <div className="date-filter">
              <button
                className={selectedDate === '' ? 'date-btn active' : 'date-btn'}
                onClick={() => setSelectedDate('')}
              >
                All Dates
              </button>
              {uniqueDates.map(date => (
                <button
                  key={date}
                  className={selectedDate === date ? 'date-btn active' : 'date-btn'}
                  onClick={() => setSelectedDate(date)}
                >
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>
          )}

          {filteredShows.length === 0 ? (
            <p className="no-shows">No shows available</p>
          ) : (
            <div className="shows-list">
              {filteredShows.map(show => (
                <div key={show.show_id} className="show-card">
                  <div className="show-info">
                    <div className="show-venue">
                      <strong>{show.venue_name}</strong>
                      <span>{show.city}</span>
                    </div>
                    <div className="show-time">
                      <div>{new Date(show.show_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                      <div>{show.show_time}</div>
                    </div>
                    <div className="show-pricing">
                      <div className="price">₹{show.base_price}</div>
                      <div className="availability">
                        {show.available_seats} seats available
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/booking/${show.show_id}`}
                    className="btn btn-primary"
                  >
                    Book Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EventDetail;


