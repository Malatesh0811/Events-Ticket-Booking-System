import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const searchTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category_id') || '',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  // Keep filters in sync if URL query params change (e.g., from Home category links)
  useEffect(() => {
    const qpCategory = searchParams.get('category_id') || '';
    const qpSearch = searchParams.get('search') || '';
    setSearchInput(qpSearch);
    setFilters((prev) => {
      if (prev.category_id === qpCategory && prev.search === qpSearch) return prev;
      return { ...prev, category_id: qpCategory, search: qpSearch };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const fetchData = async () => {
    try {
      const [categoriesRes] = await Promise.all([
        api.get('/events/categories/list')
      ]);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.search) params.search = filters.search;
      
      const response = await api.get('/events', { params });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, category_id: value });
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('category_id', value);
    } else {
      newParams.delete('category_id');
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the search - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      setFilters({ ...filters, search: value });
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="events-page">
      <div className="container">
        <h1>All Events</h1>
        
        <div className="filters">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search events..."
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category_id"
              value={filters.category_id}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <Link key={event.event_id} to={`/events/${event.event_id}`} className="event-card-link">
                <div className="event-card">
                  <div className="event-image">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.event_name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://placehold.co/800x450?text=Event+Poster';
                        }}
                      />
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
                      {event.description?.substring(0, 120)}...
                    </p>
                    <div className="event-meta">
                      {Number.isFinite(parseFloat(event.rating)) && (
                        <span className="rating">⭐ {parseFloat(event.rating).toFixed(1)}</span>
                      )}
                      <span className="bookings">{event.total_bookings || 0} bookings</span>
                      <span className={event.total_shows > 0 ? 'shows ok' : 'shows none'}>
                        {event.total_shows > 0 ? `${event.total_shows} shows` : 'No shows yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;


