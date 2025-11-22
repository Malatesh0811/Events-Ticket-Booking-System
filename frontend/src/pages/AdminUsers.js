import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '1rem 0' }}>
      <h1>Users</h1>
      {error && (
        <div role="alert" style={{ background: '#fdecea', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>
      )}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Bookings</th>
              <th>Total Spent</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.bookings_count}</td>
                <td>₹{parseFloat(u.total_spent || 0).toFixed(2)}</td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</td>
                <td>
                  <Link className="btn btn-secondary" to={`/admin/users/${u.user_id}`}>View</Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>No users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
