import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        api.get('/events?is_active=true'),
        api.get('/events/categories/list')
      ]);
      setEvents(eventsRes.data.slice(0, 6));
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Ticket Booking System</h1>
          <p>Book tickets for Movies, Concerts, Sports, Standup Comedy, and more!</p>
          <Link to="/events" className="btn btn-primary btn-large">Explore Events</Link>
        </div>
      </section>

      <div className="container">
        <section className="categories-section">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link
                key={category.category_id}
                to={`/events?category_id=${category.category_id}`}
                className="category-card"
              >
                <div className="category-icon">
                  {category.category_name === 'Movie' && '🎬'}
                  {category.category_name === 'Concert' && '🎵'}
                  {category.category_name === 'Sports' && '⚽'}
                  {category.category_name === 'Standup Comedy' && '🎭'}
                  {category.category_name === 'Theater' && '🎪'}
                  {category.category_name === 'Workshop' && '📚'}
                  {category.category_name === 'Festival' && '🎉'}
                  {!['Movie', 'Concert', 'Sports', 'Standup Comedy', 'Theater', 'Workshop', 'Festival'].includes(category.category_name) && '🎫'}
                </div>
                <h3>{category.category_name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="featured-events">
          <h2>Featured Events</h2>
          <div className="events-grid">
            {events.map(event => (
              <div key={event.event_id} className="event-card">
                <div className="event-image">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.event_name} />
                  ) : (
                    <div className="event-placeholder">
                      <span className="placeholder-icon">🎫</span>
                    </div>
                  )}
                </div>
                <div className="event-info">
                  <div className="event-category">{event.category_name}</div>
                  <h3>{event.event_name}</h3>
                  <p className="event-description">
                    {event.description?.substring(0, 100)}...
                  </p>
                  <div className="event-meta">
                    {event.rating && typeof event.rating === 'number' && (
                      <span className="rating">⭐ {event.rating.toFixed(1)}</span>
                    )}
                    <span className="bookings">{event.total_bookings || 0} bookings</span>
                  </div>
                  <Link
                    to={`/events/${event.event_id}`}
                    className="btn btn-primary btn-block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/events" className="btn btn-secondary">View All Events</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;


