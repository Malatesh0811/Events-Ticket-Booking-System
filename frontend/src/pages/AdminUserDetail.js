import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, b] = await Promise.all([
          api.get(`/admin/users/${id}`),
          api.get(`/admin/users/${id}/bookings`),
        ]);
        setUser(u.data);
        setBookings(b.data || []);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1 style={{ margin: 0 }}>User Detail</h1>
        <Link className="btn btn-secondary" to="/admin/users">Back</Link>
      </div>
      {error && (
        <div role="alert" style={{ background: '#fdecea', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, margin: '1rem 0' }}>{error}</div>
      )}
      {user && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div><strong>Name:</strong> {user.full_name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Joined:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : ''}</div>
        </div>
      )}

      <h3>Bookings</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>Venue</th>
              <th>Show Date</th>
              <th>Show Time</th>
              <th>Seats</th>
              <th>Count</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Booked At</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.booking_id}>
                <td>{b.booking_id}</td>
                <td>{b.event_name}</td>
                <td>{b.venue_name}</td>
                <td>{b.show_date ? new Date(b.show_date).toLocaleDateString() : ''}</td>
                <td>{b.show_time}</td>
                <td>{b.seat_numbers}</td>
                <td>{b.number_of_seats}</td>
                <td>{b.booking_status}</td>
                <td>{b.payment_status}</td>
                <td>₹{parseFloat(b.total_amount || 0).toFixed(2)}</td>
                <td>{b.booking_date ? new Date(b.booking_date).toLocaleString() : ''}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: 'center' }}>No bookings</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserDetail;
