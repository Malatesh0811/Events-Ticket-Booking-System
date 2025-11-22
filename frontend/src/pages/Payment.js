import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('upi');
  const [cardOffer, setCardOffer] = useState('none');
  const [useCashback, setUseCashback] = useState(false);

  useEffect(() => {
    if (!state || !state?.seatIds || !state?.showId) {
      navigate('/shows');
    }
  }, [state, navigate]);

  const convRate = 0.10;
  const taxRate = 0.18;

  const summary = useMemo(() => {
    const base = Number(state?.amount || 0);
    const offerDiscount = cardOffer === 'bank10' ? Math.min(base * 0.10, 300) : cardOffer === 'issuer5' ? base * 0.05 : 0;
    const cashback = useCashback ? Math.min(100, base * 0.05) : 0; // illustrative
    const conv = Number(((base - offerDiscount) * convRate).toFixed(2));
    const tax = Number((((base - offerDiscount) + conv) * taxRate).toFixed(2));
    const total = Math.max(0, Number((base - offerDiscount + conv + tax - cashback).toFixed(2)));
    return { base, offerDiscount, cashback, conv, tax, total };
  }, [state?.amount, cardOffer, useCashback]);

  const payNow = async () => {
    if (!state?.seatIds?.length || !state?.showId) return;
    setProcessing(true);
    setError('');
    try {
      const create = await api.post('/bookings', {
        show_id: Number(state.showId),
        seat_ids: state.seatIds,
      });
      await api.post(`/bookings/${create.data.booking.booking_id}/confirm`, {
        amount_paid: summary.total,
        payment_method: method,
        offer_applied: cardOffer,
        cashback_used: useCashback,
      });
      navigate('/my-bookings');
    } catch (e) {
      setError(e.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <div>
            <h1>Payment</h1>
            <div className="show-info">
              <span>{state?.eventName}</span>
              <span>{state?.venue}</span>
              <span>{state?.showDate ? new Date(state.showDate).toLocaleDateString() : ''} {state?.showTime || ''}</span>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ background: '#fdecea', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Select payment method</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" name="method" checked={method==='upi'} onChange={() => setMethod('upi')} /> UPI (GPay/PhonePe/Paytm)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" name="method" checked={method==='card'} onChange={() => setMethod('card')} /> Credit/Debit Card
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" name="method" checked={method==='netbank'} onChange={() => setMethod('netbank')} /> NetBanking
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" name="method" checked={method==='wallet'} onChange={() => setMethod('wallet')} /> Wallet
              </label>
            </div>

            <div style={{ height: 16 }} />
            <h3 style={{ marginTop: 0 }}>Offers & Cashback</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <label>Card / Bank Offer</label>
              <select value={cardOffer} onChange={(e) => setCardOffer(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <option value="none">None</option>
                <option value="bank10">Bank XYZ 10% OFF (max ₹300)</option>
                <option value="issuer5">Issuer 5% OFF</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={useCashback} onChange={(e) => setUseCashback(e.target.checked)} /> Apply wallet cashback (up to ₹100)
              </label>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Order Summary</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tickets ({state?.seatIds?.length || 0})</span>
                <strong>₹{summary.base.toFixed(2)}</strong>
              </div>
              {summary.offerDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Offer discount</span>
                  <strong>-₹{summary.offerDiscount.toFixed(2)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Convenience fee (10%)</span>
                <strong>₹{summary.conv.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax (18%)</span>
                <strong>₹{summary.tax.toFixed(2)}</strong>
              </div>
              {summary.cashback > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                  <span>Cashback</span>
                  <strong>-₹{summary.cashback.toFixed(2)}</strong>
                </div>
              )}
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                <span>Payable</span>
                <strong>₹{summary.total.toFixed(2)}</strong>
              </div>
              <button
                className="btn btn-primary"
                disabled={processing || !state?.seatIds?.length}
                onClick={payNow}
                style={{ marginTop: 12 }}
              >
                {processing ? 'Processing…' : `Pay ₹${summary.total.toFixed(2)}`}
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(-1)} disabled={processing}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
