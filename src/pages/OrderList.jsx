import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './Orders.css';

const API_BASE = 'http://localhost:8085/api/order-notification';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputeOrderId, setDisputeOrderId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API_BASE}/orders`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmReceipt = (orderId) => {
    fetch(`${API_BASE}/orders/${orderId}/confirm`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to confirm receipt');
        return res.json();
      })
      .then(() => fetchOrders())
      .catch(err => alert(err.message));
  };

  const handleSubmitDispute = (orderId) => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for the dispute.');
      return;
    }
    fetch(`${API_BASE}/orders/${orderId}/dispute?reason=${encodeURIComponent(disputeReason)}`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit dispute');
        return res.json();
      })
      .then(() => {
        setDisputeOrderId(null);
        setDisputeReason('');
        fetchOrders();
      })
      .catch(err => alert(err.message));
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>My Orders</h1>
          <p>Track and manage your auction winnings</p>
        </div>

        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : error ? (
          <div className="error-state">
            <p>Could not load orders. Make sure backend is running.</p>
            <button className="btn-outline" onClick={fetchOrders}>Try Again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Your auction winnings will appear here once an auction ends.</p>
          </div>
        ) : (
          <div className="order-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>{order.itemName}</h3>
                  <span className={getStatusBadgeClass(order.status)}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Order ID:</span>
                    <span className="value">#{order.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Price:</span>
                    <span className="value price">Rp {order.totalPrice?.toLocaleString('id-ID')}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="detail-row">
                      <span className="label">Tracking No:</span>
                      <span className="value tracking">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.disputeReason && (
                    <div className="detail-row">
                      <span className="label">Dispute:</span>
                      <span className="value">{order.disputeReason}</span>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  {order.status === 'SHIPPED' && (
                    <button className="btn-primary full-width" onClick={() => handleConfirmReceipt(order.id)}>
                      <CheckCircle size={18} /> Confirm Receipt
                    </button>
                  )}
                  {order.status === 'COMPLETED' && disputeOrderId !== order.id && (
                    <button className="btn-outline full-width" onClick={() => setDisputeOrderId(order.id)}>
                      <AlertCircle size={18} /> File Dispute
                    </button>
                  )}
                  {disputeOrderId === order.id && (
                    <div className="dispute-form">
                      <textarea
                        placeholder="Describe your issue..."
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        className="dispute-input"
                      />
                      <div className="dispute-buttons">
                        <button className="btn-primary" onClick={() => handleSubmitDispute(order.id)}>Submit</button>
                        <button className="btn-outline" onClick={() => { setDisputeOrderId(null); setDisputeReason(''); }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
