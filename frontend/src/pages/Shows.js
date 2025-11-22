import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Shows.css';

const Shows = () => {
  const [shows, setShows] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchShows();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [venuesRes] = await Promise.all([
        api.get('/shows/venues/list')
      ]);
      setVenues(venuesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchShows = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.date) params.date = filters.date;
      
      const response = await api.get('/shows', { params });
      setShows(response.data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const uniqueCities = [...new Set(venues.map(v => v.city))].sort();

  return (
    <div className="shows-page">
      <div className="container">
        <h1>All Shows</h1>
        
        <div className="filters">
          <div className="form-group">
            <label>City</label>
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {shows.length === 0 ? (
          <div className="no-shows">
            <p>No shows found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="shows-list">
            {shows.map(show => (
              <div key={show.show_id} className="show-card-large">
                <div className="show-event-info">
                  <h3>{show.event_name}</h3>
                  <div className="show-category">{show.category_name}</div>
                </div>
                <div className="show-details-grid">
                  <div className="show-detail-item">
                    <strong>Venue:</strong>
                    <div>{show.venue_name}</div>
                    <div className="venue-location">{show.city}</div>
                  </div>
                  <div className="show-detail-item">
                    <strong>Date & Time:</strong>
                    <div>{new Date(show.show_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    <div className="show-time">{show.show_time}</div>
                  </div>
                  <div className="show-detail-item">
                    <strong>Pricing:</strong>
                    <div className="price">₹{show.base_price}</div>
                    <div className="availability">
                      {show.available_seats} / {show.total_seats} seats
                    </div>
                  </div>
                  <div className="show-detail-item">
                    <strong>Occupancy:</strong>
                    <div className="occupancy">{show.occupancy_percentage}%</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${show.occupancy_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/booking/${show.show_id}`}
                  className="btn btn-primary btn-block"
                >
                  Book Tickets
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shows;




