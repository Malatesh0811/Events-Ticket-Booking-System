import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [city, setCity] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/events?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/events');
    }
  };

  const onCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value) {
      navigate(`/shows?city=${encodeURIComponent(value)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand-and-location">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🎫</span>
            <span className="brand-text">TicketBooking</span>
          </Link>
          <div className="location-picker">
            <span className="material-symbols-outlined loc-icon">location_on</span>
            <select aria-label="Select city" value={city} onChange={onCityChange}>
              <option value="">City</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>
        </div>

        <form className="searchbar" onSubmit={onSearchSubmit} role="search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search for Movies, Events, Plays, Sports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search events"
          />
        </form>

        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <Link to="/events" className="nav-link" onClick={() => setIsOpen(false)}>Events</Link>
          <Link to="/shows" className="nav-link" onClick={() => setIsOpen(false)}>Shows</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" className="nav-link" onClick={() => setIsOpen(false)}>My Bookings</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>Admin</Link>
              )}
              <div className="user-menu">
                <span className="user-name">Hi, {user?.full_name || user?.username}</span>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="btn btn-secondary">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

