import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <h1>My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You don't have any bookings yet.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.booking_id} className="booking-card">
                <div className="booking-header-info">
                  <div>
                    <h3>{booking.event_name}</h3>
                    <div className="booking-category">{booking.category_name}</div>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(booking.booking_status)}`}>
                    {booking.booking_status}
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Venue:</span>
                    <span>{booking.venue_name}, {booking.city}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Show Date & Time:</span>
                    <span>{new Date(booking.show_date).toLocaleDateString()} at {booking.show_time}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Seats:</span>
                    <span>{booking.seat_numbers || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Number of Seats:</span>
                    <span>{booking.number_of_seats}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="booking-amount">₹{parseFloat(booking.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Booking Date:</span>
                    <span>{new Date(booking.booking_date).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`payment-status ${booking.payment_status}`}>
                      {booking.payment_status}
                    </span>
                  </div>
                </div>
                
                {booking.booking_status !== 'cancelled' && booking.booking_status !== 'completed' && (
                  <div className="booking-actions">
                    <button
                      onClick={() => handleCancel(booking.booking_id)}
                      disabled={cancelling === booking.booking_id}
                      className="btn btn-danger"
                    >
                      {cancelling === booking.booking_id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;




