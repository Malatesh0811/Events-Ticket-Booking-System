import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Booking.css';
import stadiumSVG from '../assets/stadium_priced.svg';

const Booking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showLoaded, setShowLoaded] = useState(false);
  const [seatsLoaded, setSeatsLoaded] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [selectedStand, setSelectedStand] = useState(null);
  const [standPickerOpen, setStandPickerOpen] = useState(false);
  const [desiredQty, setDesiredQty] = useState(2);
  const convenienceFeeRate = 0.10; // 10%
  const taxRate = 0.18; // 18%
  const [holdUntil, setHoldUntil] = useState(null);
  const [holdTick, setHoldTick] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // reset loaders on show change
    setShowLoaded(false);
    setSeatsLoaded(false);

    const loadShow = async () => {
      try {
        const response = await api.get(`/shows/${showId}`);
        if (isMounted) setShow(response.data);
      } catch (error) {
        console.error('Error fetching show:', error);
      } finally {
        if (isMounted) setShowLoaded(true);
      }
    };

    const loadSeats = async () => {
      try {
        const response = await api.get(`/shows/${showId}/seats`);
        if (Array.isArray(response.data)) {
          if (isMounted) setSeats(response.data);
        } else {
          console.error('Seats data is not an array:', response.data);
          if (isMounted) setSeats([]);
        }
      } catch (error) {
        console.error('Error fetching seats:', error);
        if (isMounted) setError('Failed to load seats. Please try again.');
        if (isMounted) setSeats([]);
      } finally {
        if (isMounted) setSeatsLoaded(true);
      }
    };

    loadShow();
    loadSeats();

    return () => { isMounted = false; };
  }, [showId, isAuthenticated, navigate]);

  const refreshSeats = async () => {
    try {
      const response = await api.get(`/shows/${showId}/seats`);
      if (Array.isArray(response.data)) {
        setSeats(response.data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (selectedSeats.length > 0 && !holdUntil) {
      setHoldUntil(Date.now() + 5 * 60 * 1000);
    }
    if (selectedSeats.length === 0 && holdUntil) {
      setHoldUntil(null);
    }
  }, [selectedSeats]);

  useEffect(() => {
    if (!holdUntil) return;
    const id = setInterval(() => {
      const now = Date.now();
      if (now >= holdUntil) {
        setSelectedSeats([]);
        setHoldUntil(null);
        setError('Seat hold expired. Selection cleared.');
        refreshSeats();
      } else {
        setHoldTick((t) => t + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [holdUntil]);

  // removed old fetchShow/fetchSeats (handled inline in useEffect)

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.seat_id === seatId);
      return total + (seat ? parseFloat(seat.price) : 0);
    }, 0);
  }, [selectedSeats, seats]);

  const breakdown = useMemo(() => {
    const subtotal = totalAmount;
    const convFee = Number((subtotal * convenienceFeeRate).toFixed(2));
    const tax = Number(((subtotal + convFee) * taxRate).toFixed(2));
    const total = Number((subtotal + convFee + tax).toFixed(2));
    return { subtotal, convFee, tax, total };
  }, [totalAmount, convenienceFeeRate, taxRate]);

  // Auto-pick adjacent seats in the current scope (selected stand rows if chosen, otherwise all rows)
  const findConsecutiveInRow = (rowSeats, n) => {
    // consider only available
    const available = rowSeats.filter(s => s.seat_status !== 'booked');
    // sort numerically
    const sorted = [...available].sort((a, b) => (parseInt(a.seat_number) || 0) - (parseInt(b.seat_number) || 0));
    for (let i = 0; i <= sorted.length - n; i++) {
      let ok = true;
      for (let k = 1; k < n; k++) {
        const prevNum = parseInt(sorted[i + k - 1].seat_number) || 0;
        const currNum = parseInt(sorted[i + k].seat_number) || 0;
        if (currNum !== prevNum + 1) { ok = false; break; }
      }
      if (ok) return sorted.slice(i, i + n);
    }
    return [];
  };

  const autoPickSeats = () => {
    setError('');
    const n = Math.max(1, Math.min(10, parseInt(desiredQty) || 1));
    // Determine rows scope
    const scopeRows = selectedStand && stands.find(s => s.id === selectedStand)
      ? stands.find(s => s.id === selectedStand).rows
      : Object.keys(seatsByRow);
    // Try each row for consecutive seats
    for (const row of scopeRows) {
      const picked = findConsecutiveInRow(seatsByRow[row] || [], n);
      if (picked.length === n) {
        setSelectedSeats(picked.map(s => s.seat_id));
        return;
      }
    }
    setError(`Couldn't find ${n} adjacent seats${selectedStand ? ` in ${selectedStand}` : ''}. Try a different quantity or stand.`);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const response = await api.post('/bookings', {
        show_id: parseInt(showId),
        seat_ids: selectedSeats
      });

      // Auto-confirm booking (simulating payment)
      await api.post(`/bookings/${response.data.booking.booking_id}/confirm`);

      navigate(`/my-bookings`);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (!showLoaded || !seatsLoaded) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!show) {
    return <div className="container">Show not found</div>;
  }

  // Build stands and seat grouping
  const isSportsVenue = show.category_name === 'Sports';
  const isConcert = show.category_name === 'Concert';
  
  let seatsByRow = {};
  let stands = [];
  let seatsByStand = {};
  let standPriceMap = {};
  const allRows = [...new Set(seats.map(s => s.row_number || s['row_number'] || 'A'))].sort();

  {

    if (isSportsVenue) {
      // 8 compass stands fallback
      const compassLabels = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
      const targetStands = 8;
      const chunkSize = Math.max(1, Math.ceil(allRows.length / targetStands));
      for (let i = 0; i < targetStands; i++) {
        const standRows = allRows.slice(i * chunkSize, (i + 1) * chunkSize);
        const standId = compassLabels[i] || `Stand ${i + 1}`;
        const standSeats = seats.filter(seat => {
          const rowNum = seat.row_number || seat['row_number'] || 'A';
          return standRows.includes(rowNum);
        });
        if (standSeats.length > 0) {
          stands.push({ id: standId, rows: standRows });
          seatsByStand[standId] = standSeats;
          const prices = standSeats.map(s => parseFloat(s.price) || 0);
          standPriceMap[standId] = { min: Math.min(...prices), max: Math.max(...prices) };
        }
      }

      if (stands.length < 3 && seats.length > 0) {
        stands = [];
        seatsByStand = {};
        standPriceMap = {};
        const sortedSeats = [...seats].sort((a, b) => {
          const ra = String(a.row_number || a['row_number'] || 'A');
          const rb = String(b.row_number || b['row_number'] || 'A');
          if (ra === rb) return (parseInt(a.seat_number) || 0) - (parseInt(b.seat_number) || 0);
          return ra.localeCompare(rb);
        });
        const groups = compassLabels.map((label) => ({ id: label, items: [] }));
        sortedSeats.forEach((seat, idx) => { groups[idx % groups.length].items.push(seat); });
        groups.forEach((g) => {
          if (g.items.length > 0) {
            stands.push({ id: g.id, rows: [...new Set(g.items.map(s => s.row_number || s['row_number'] || 'A'))] });
            seatsByStand[g.id] = g.items;
            const prices = g.items.map(s => parseFloat(s.price) || 0);
            standPriceMap[g.id] = { min: Math.min(...prices), max: Math.max(...prices) };
          }
        });
      }
    } else if (isConcert) {
      // 3 sections fallback
      const chunkSize = Math.ceil(allRows.length / 3) || 1;
      const labels = ['Front', 'Middle', 'Rear'];
      for (let i = 0; i < allRows.length; i += chunkSize) {
        const idx = Math.floor(i / chunkSize);
        const standRows = allRows.slice(i, i + chunkSize);
        const standId = `${labels[idx] || `Section ${idx + 1}`}`;
        const standSeats = seats.filter(seat => {
          const rowNum = seat.row_number || seat['row_number'] || 'A';
          return standRows.includes(rowNum);
        });
        if (standSeats.length > 0) {
          stands.push({ id: standId, rows: standRows });
          seatsByStand[standId] = standSeats;
          const prices = standSeats.map(s => parseFloat(s.price) || 0);
          standPriceMap[standId] = { min: Math.min(...prices), max: Math.max(...prices) };
        }
      }

      if (stands.length < 3 && seats.length > 0) {
        stands = [];
        seatsByStand = {};
        standPriceMap = {};
        const labelsArr = labels;
        const sortedSeats = [...seats].sort((a, b) => {
          const ra = String(a.row_number || a['row_number'] || 'A');
          const rb = String(b.row_number || b['row_number'] || 'A');
          if (ra === rb) return (parseInt(a.seat_number) || 0) - (parseInt(b.seat_number) || 0);
          return ra.localeCompare(rb);
        });
        const groups = labelsArr.map((label) => ({ id: label, items: [] }));
        sortedSeats.forEach((seat, idx) => { groups[idx % groups.length].items.push(seat); });
        groups.forEach((g) => {
          if (g.items.length > 0) {
            stands.push({ id: g.id, rows: [...new Set(g.items.map(s => s.row_number || s['row_number'] || 'A'))] });
            seatsByStand[g.id] = g.items;
            const prices = g.items.map(s => parseFloat(s.price) || 0);
            standPriceMap[g.id] = { min: Math.min(...prices), max: Math.max(...prices) };
          }
        });
      }
    }
  }

  // Group seats by row: if a stand is selected, only include its rows
  const rowsToUse = selectedStand && stands.find(s => s.id === selectedStand)
    ? stands.find(s => s.id === selectedStand).rows
    : allRows;

  rowsToUse.forEach(rowNum => {
    seatsByRow[rowNum] = seats.filter(seat => {
      const seatRow = seat.row_number || seat['row_number'] || 'A';
      return seatRow === rowNum;
    });
  });

  // Sort rows alphabetically
  const rows = Object.keys(seatsByRow).sort();
  
// Sort seats within each row numerically
rows.forEach(row => {
  seatsByRow[row].sort((a, b) => {
    const numA = parseInt(a.seat_number) || 0;
    const numB = parseInt(b.seat_number) || 0;
    return numA - numB;
  });
});

// Debug log
console.log('Seats count:', seats.length);
console.log('Rows:', rows);
console.log('Seats by row:', seatsByRow);

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <div>
          <h1>{show.event_name}</h1>
          <div className="show-info">
            <span>{show.venue_name}, {show.city}</span>
            <span>{new Date(show.show_date).toLocaleDateString()} at {show.show_time}</span>
          </div>
        </div>
      </div>
    {show.category_name === 'Sports' && (
      <div style={{ margin: '0.75rem 0 1rem' }}>
        <img src={stadiumSVG} alt="Cricket Stadium Seating with Prices" style={{ width: '100%', maxWidth: 900, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
      </div>
    )}
    {/* Top-right fixed Book button */}
    <div className="book-top-right">
      <span className="book-summary-chip" title="Seats selected">
        <span className="dot"></span>
        Seats: {selectedSeats.length}
      </span>
      <span className="book-summary-chip" title="Current total">
        <span className="dot" style={{ background: '#3b82f6' }}></span>
        Total: ₹{totalAmount.toFixed(2)}
      </span>
      <button
        className="btn btn-primary"
        disabled={selectedSeats.length === 0 || booking}
        onClick={() => setConfirmOpen(true)}
        title={selectedSeats.length === 0 ? 'Select seats to book' : 'Proceed to confirmation'}
      >
        {booking ? 'Processing…' : 'Book'}
      </button>
    </div>
    {error && <div role="alert" aria-live="assertive" className="error">{error}</div>}
    <div className="seat-map">
          {rows.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No seats available.</div>
          ) : (
            rows.map(row => (
              <div key={row} className="seat-row">
                <div className="row-label">{row}</div>
                <div className="seats-in-row">
                  {seatsByRow[row].map(seat => (
                    <button
                      key={seat.seat_id}
                      className={`seat ${seat.seat_status === 'booked' ? 'booked' : ''} ${selectedSeats.includes(seat.seat_id) ? 'selected' : ''} ${seat.seat_type}`}
                      onClick={() => seat.seat_status !== 'booked' && toggleSeat(seat.seat_id)}
                      disabled={seat.seat_status === 'booked'}
                      title={`${seat.row_number || ''}${seat.seat_number} - ₹${seat.price || 0}`}
                    >
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Removed bottom Book button; now using top-right fixed action */}

        {confirmOpen && (
          <>
            <div className="stand-modal-backdrop" onClick={() => setConfirmOpen(false)} aria-hidden="true"></div>
            <div className="stand-modal" role="dialog" aria-modal="true" aria-label="Confirm booking">
              <div className="stand-modal-header">
                <span>Confirm booking</span>
                <button className="close-stand-btn" onClick={() => setConfirmOpen(false)}>✕</button>
              </div>
              <div style={{ padding: '1rem', lineHeight: 1.6 }}>
                <div>Seats selected: <strong>{selectedSeats.length}</strong></div>
                <div>Total amount: <strong>₹{totalAmount.toFixed(2)}</strong></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem 1rem' }}>
                <button
                  className="btn btn-primary"
                  disabled={booking || selectedSeats.length === 0}
                  onClick={() => {
                    setConfirmOpen(false);
                    navigate('/payment', {
                      state: {
                        showId,
                        eventName: show.event_name,
                        venue: `${show.venue_name}, ${show.city}`,
                        showDate: show.show_date,
                        showTime: show.show_time,
                        seatIds: selectedSeats,
                        amount: totalAmount,
                      }
                    });
                  }}
                >
                  Confirm
                </button>
                <button className="btn btn-secondary" onClick={() => setConfirmOpen(false)} disabled={booking}>Cancel</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Booking;