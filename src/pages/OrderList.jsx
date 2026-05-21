import { useCallback, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, AlertCircle, Clock, Package, Pencil } from 'lucide-react';
import {
  confirmReceipt,
  getOrders,
  getOrdersByUser,
  markOrderPacked,
  submitDispute,
  updateTrackingNumber,
} from '../api/orderNotificationApi';
import useAuth from '../context/useAuth';
import './Orders.css';

const resolveUserId = (profile, session) => {
  const rawUserId = session?.userId ?? profile?.id ?? profile?.userId ?? localStorage.getItem('bidmartUserId');
  return rawUserId ? String(rawUserId) : '';
};

const OrderList = () => {
  const { profile, session } = useAuth();
  const userId = resolveUserId(profile, session);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputeOrderId, setDisputeOrderId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    const orderRequest = userId ? getOrdersByUser(userId) : getOrders();

    orderRequest
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    Promise.resolve().then(fetchOrders);
  }, [fetchOrders]);

  const handleMarkPacked = (orderId) => {
    markOrderPacked(orderId)
      .then(() => fetchOrders())
      .catch(err => alert(err.message));
  };

  const handleConfirmReceipt = (orderId) => {
    confirmReceipt(orderId)
      .then(() => fetchOrders())
      .catch(err => alert(err.message));
  };

  const handleSubmitDispute = (orderId) => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for the dispute.');
      return;
    }

    submitDispute(orderId, disputeReason)
      .then(() => {
        setDisputeOrderId(null);
        setDisputeReason('');
        fetchOrders();
      })
      .catch(err => alert(err.message));
  };

  const handleUpdateTracking = (orderId) => {
    if (!trackingNumber.trim()) {
      alert('Please provide a tracking number.');
      return;
    }

    updateTrackingNumber(orderId, trackingNumber)
      .then(() => {
        setTrackingOrderId(null);
        setTrackingNumber('');
        fetchOrders();
      })
      .catch(err => alert(err.message));
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${(status || 'unknown').toLowerCase()}`;
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>My Orders</h1>
          <p>Track and manage auction orders from the order-notification service.</p>
        </div>

        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : error ? (
          <div className="error-state">
            <p>Could not load orders. Make sure the order-notification backend is running.</p>
            <button className="btn-outline" onClick={fetchOrders}>Try Again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Auction winnings will appear here after Auction publishes a winner event.</p>
          </div>
        ) : (
          <div className="order-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>{order.itemName || 'Auction item'}</h3>
                    <p>ORDER ID: #{order.id}</p>
                  </div>
                  <span className={getStatusBadgeClass(order.status)}>
                    {(order.status || 'UNKNOWN').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="order-meta">
                  <div>
                    <span>Auction ID</span>
                    <strong>{order.auctionId || '-'}</strong>
                  </div>
                  <div>
                    <span>Buyer ID</span>
                    <strong>{order.userId || '-'}</strong>
                  </div>
                </div>

                <div className="price-panel">
                  <span>Total Harga</span>
                  <strong>Rp {Number(order.totalPrice || 0).toLocaleString('id-ID')}</strong>
                </div>

                <div className="tracking-panel">
                  {order.trackingNumber ? (
                    <>
                      <CheckCircle size={32} className="tracking-success-icon" />
                      <h4>{order.status === 'COMPLETED' ? 'Transaksi Selesai' : 'Resi Tersimpan'}</h4>
                      <p>Resi: {order.trackingNumber}</p>
                    </>
                  ) : (
                    <>
                      <span className="tracking-label">Nomor Resi</span>
                      <strong>Belum Diinput</strong>
                    </>
                  )}

                  {(order.status === 'PAID' || order.status === 'AUTOMATIC_CREATED') && (
                    <button className="btn-outline tracking-button" onClick={() => handleMarkPacked(order.id)}>
                      <Package size={18} /> Mark as Packed
                    </button>
                  )}

                  {(order.status === 'PAID' || order.status === 'PACKED' || order.status === 'AUTOMATIC_CREATED')
                    && trackingOrderId !== order.id && (
                    <button className="btn-primary tracking-button" onClick={() => setTrackingOrderId(order.id)}>
                      <Pencil size={18} /> Input Resi
                    </button>
                  )}

                  {trackingOrderId === order.id && (
                    <div className="inline-form">
                      <input
                        placeholder="Tracking number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="tracking-input"
                      />
                      <div className="dispute-buttons">
                        <button className="btn-primary" onClick={() => handleUpdateTracking(order.id)}>Save</button>
                        <button className="btn-outline" onClick={() => { setTrackingOrderId(null); setTrackingNumber(''); }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {order.status === 'SHIPPED' && (
                    <button className="btn-primary tracking-button" onClick={() => handleConfirmReceipt(order.id)}>
                      <CheckCircle size={18} /> Confirm Receipt
                    </button>
                  )}
                </div>

                <div className="order-actions">
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

                <div className={`dispute-slot ${order.disputeReason ? 'has-dispute' : ''}`}>
                  {order.disputeReason && (
                    <div className="dispute-summary">
                      <span>Dispute</span>
                      <p>{order.disputeReason}</p>
                    </div>
                  )}
                </div>

                <div className="created-at">
                  <Clock size={14} /> Dibuat pada: {formatDate(order.createdAt)}
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
