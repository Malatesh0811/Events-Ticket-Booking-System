import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="brand-mark">🎫</div>
          <div>
            <div className="brand-name">TicketBooking</div>
            <div className="brand-tag">Book your next great experience</div>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <div className="group-title">Explore</div>
            <Link to="/events" className="footer-link">Events</Link>
            <Link to="/shows" className="footer-link">Shows</Link>
            <Link to="/" className="footer-link">Home</Link>
          </div>
          <div className="link-group">
            <div className="group-title">Account</div>
            <Link to="/login" className="footer-link">Login</Link>
            <Link to="/register" className="footer-link">Sign Up</Link>
            <Link to="/my-bookings" className="footer-link">My Bookings</Link>
          </div>
          <div className="link-group">
            <div className="group-title">Company</div>
            <a className="footer-link" href="#about">About</a>
            <a className="footer-link" href="#contact">Contact</a>
            <a className="footer-link" href="#help">Help Center</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container-narrow">
          <span>© {year} TicketBooking. All rights reserved.</span>
          <div className="policies">
            <a className="footer-link" href="#privacy">Privacy</a>
            <a className="footer-link" href="#terms">Terms</a>
            <a className="footer-link" href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
