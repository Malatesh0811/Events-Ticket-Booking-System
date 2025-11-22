import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [ensureLoading, setEnsureLoading] = useState(false);
  const [ensureResult, setEnsureResult] = useState(null);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [viewsResult, setViewsResult] = useState(null);
  const [triggersLoading, setTriggersLoading] = useState(false);
  const [triggersResult, setTriggersResult] = useState(null);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [seatsResult, setSeatsResult] = useState(null);

  useEffect(() => {
    fetchDashboard();
    fetchLogs();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureTriggers = async () => {
    try {
      setTriggersLoading(true);
      setTriggersResult(null);
      const res = await api.post('/admin/maintenance/ensure-triggers');
      setTriggersResult(res.data);
      await fetchLogs();
    } catch (error) {
      setTriggersResult({ error: error?.response?.data?.error || 'Request failed' });
    } finally {
      setTriggersLoading(false);
    }
  };

  const ensureSeats = async () => {
    try {
      setSeatsLoading(true);
      setSeatsResult(null);
      const res = await api.post('/admin/maintenance/ensure-seats');
      setSeatsResult(res.data);
    } catch (error) {
      setSeatsResult({ error: error?.response?.data?.error || 'Request failed' });
    } finally {
      setSeatsLoading(false);
    }
  };

  const rebuildViews = async () => {
    try {
      setViewsLoading(true);
      setViewsResult(null);
      const res = await api.post('/admin/maintenance/fix-views');
      setViewsResult(res.data);
      await fetchDashboard();
    } catch (error) {
      setViewsResult({ error: error?.response?.data?.error || 'Request failed' });
    } finally {
      setViewsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/logs', { params: { limit: 25 } });
      setLogs(res.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const ensurePostersAndShows = async () => {
    try {
      setEnsureLoading(true);
      setEnsureResult(null);
      const res = await api.post('/admin/maintenance/ensure-posters-and-shows');
      setEnsureResult(res.data);
      await fetchDashboard();
    } catch (error) {
      setEnsureResult({ error: error?.response?.data?.error || 'Request failed' });
    } finally {
      setEnsureLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  // Do not early-return on dashboard error; show controls so admin can fix views

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '1rem 0' }}>
          <button className="btn btn-primary" onClick={ensurePostersAndShows} disabled={ensureLoading}>
            {ensureLoading ? 'Fixing…' : 'Fix Posters & Ensure Shows'}
          </button>
          {ensureResult && !ensureResult.error && (
            <span style={{ color: 'green', fontWeight: 600 }}>
              Updated: posters {ensureResult.postersUpdated ?? 0}, shows {ensureResult.showsCreated ?? 0}
            </span>
          )}
          {ensureResult && ensureResult.error && (
            <span style={{ color: '#c33', fontWeight: 600 }}>
              {ensureResult.error}
            </span>
          )}
          <button className="btn btn-secondary" onClick={rebuildViews} disabled={viewsLoading}>
            {viewsLoading ? 'Rebuilding…' : 'Rebuild Views'}
          </button>
          {viewsResult && !viewsResult.error && (
            <span style={{ color: 'green', fontWeight: 600 }}>
              Views rebuilt
            </span>
          )}
          {viewsResult && viewsResult.error && (
            <span style={{ color: '#c33', fontWeight: 600 }}>
              {viewsResult.error}
            </span>
          )}
          <button className="btn btn-secondary" onClick={ensureTriggers} disabled={triggersLoading}>
            {triggersLoading ? 'Ensuring…' : 'Ensure Triggers'}
          </button>
          {triggersResult && !triggersResult.error && (
            <span style={{ color: 'green', fontWeight: 600 }}>
              Triggers ensured
            </span>
          )}
          {triggersResult && triggersResult.error && (
            <span style={{ color: '#c33', fontWeight: 600 }}>
              {triggersResult.error}
            </span>
          )}
          <button className="btn btn-secondary" onClick={ensureSeats} disabled={seatsLoading}>
            {seatsLoading ? 'Ensuring…' : 'Ensure Seats'}
          </button>
          {seatsResult && !seatsResult.error && (
            <span style={{ color: 'green', fontWeight: 600 }}>
              Seats ensured (added {seatsResult.added ?? 0})
            </span>
          )}
          {seatsResult && seatsResult.error && (
            <span style={{ color: '#c33', fontWeight: 600 }}>
              {seatsResult.error}
            </span>
          )}
        </div>
        {!dashboard && (
          <div className="error" style={{ maxWidth: 800 }}>
            Error loading dashboard. Try "Rebuild Views" and then "Fix Posters & Ensure Shows".
          </div>
        )}

        <div style={{ margin: '0.5rem 0 1rem' }}>
          <a className="btn" href="/admin/users">Users</a>
        </div>

        {dashboard && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{dashboard?.totals?.total_customers || 0}</div>
              <div className="stat-label">Total Customers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <div className="stat-value">{dashboard?.totals?.total_events || 0}</div>
              <div className="stat-label">Total Events</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-value">{dashboard?.totals?.total_bookings || 0}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-value">₹{parseFloat(dashboard?.totals?.total_revenue || 0).toFixed(2)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>
        )}

        <div className="dashboard-sections">
          {dashboard && (<section className="dashboard-section">
            <h2>Daily Revenue (Last 7 Days)</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bookings</th>
                    <th>Customers</th>
                    <th>Tickets Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.dailyRevenue?.map((day, index) => (
                    <tr key={index}>
                      <td>{new Date(day.booking_date).toLocaleDateString()}</td>
                      <td>{day.total_bookings}</td>
                      <td>{day.unique_customers}</td>
                      <td>{day.tickets_sold}</td>
                      <td>₹{parseFloat(day.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>)}

          {dashboard && (<section className="dashboard-section">
            <h2>Category Statistics</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Events</th>
                    <th>Shows</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                    <th>Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.categoryStats?.map((cat, index) => (
                    <tr key={index}>
                      <td>{cat.category_name}</td>
                      <td>{cat.total_events}</td>
                      <td>{cat.total_shows}</td>
                      <td>{cat.total_bookings}</td>
                      <td>₹{parseFloat(cat.total_revenue || 0).toFixed(2)}</td>
                      <td>{Number.isFinite(parseFloat(cat.avg_rating)) ? parseFloat(cat.avg_rating).toFixed(1) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>)}

          {dashboard && (<section className="dashboard-section">
            <h2>Venue Performance</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Venue</th>
                    <th>City</th>
                    <th>Shows</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                    <th>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.venuePerformance?.map((venue, index) => (
                    <tr key={index}>
                      <td>{venue.venue_name}</td>
                      <td>{venue.city}</td>
                      <td>{venue.total_shows}</td>
                      <td>{venue.confirmed_bookings}</td>
                      <td>₹{parseFloat(venue.total_revenue || 0).toFixed(2)}</td>
                      <td>{venue.avg_occupancy_rate ? venue.avg_occupancy_rate + '%' : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>)}

          {dashboard && (<section className="dashboard-section">
            <h2>Popular Events</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.popularEvents?.map((event, index) => (
                    <tr key={index}>
                      <td>{event.event_name}</td>
                      <td>{event.category_name}</td>
                      <td>{Number.isFinite(parseFloat(event.rating)) ? '⭐ ' + parseFloat(event.rating).toFixed(1) : 'N/A'}</td>
                      <td>{event.booking_count}</td>
                      <td>₹{parseFloat(event.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>)}

          <section className="dashboard-section">
            <h2>Recent Booking Activity</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Event</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.log_id}>
                      <td>{new Date(l.timestamp).toLocaleString()}</td>
                      <td>{l.booking_id}</td>
                      <td><Link to={`/admin/users/${l.user_id}`}>{l.user_name}</Link></td>
                      <td>{l.event_name}</td>
                      <td>{l.action}</td>
                      <td>{l.booking_status}</td>
                      <td>{l.payment_status}</td>
                      <td>₹{parseFloat(l.total_amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center' }}>No recent activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;




