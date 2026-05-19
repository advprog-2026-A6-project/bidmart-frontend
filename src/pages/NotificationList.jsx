import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Bell, CheckCircle, Package, AlertCircle } from 'lucide-react';
import './Notifications.css';

const API_BASE = 'http://localhost:8085/api/order-notification';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // TODO: Replace with actual logged-in userId from auth context
  const userId = 'user-uuid-123';

  useEffect(() => {
    fetch(`${API_BASE}/notifications/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
      })
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getIcon = (type) => {
    if (!type) return <Bell className="notif-icon" />;
    if (type.includes('SHIPPED')) return <Package className="notif-icon text-primary" />;
    if (type.includes('WON') || type.includes('COMPLETED')) return <CheckCircle className="notif-icon text-success" />;
    if (type.includes('DISPUTE')) return <AlertCircle className="notif-icon text-danger" />;
    return <Bell className="notif-icon" />;
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container">
        <div className="page-header d-flex justify-between align-center">
          <div>
            <h1>Notifications</h1>
            <p>Stay updated on your auctions and orders</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading notifications...</div>
        ) : error ? (
          <div className="error-state">
            <p>Could not load notifications. Make sure backend is running.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state text-center">
            <Bell size={48} className="text-muted" style={{ display: 'block', margin: '0 auto 1rem' }} />
            <h3>No notifications yet</h3>
            <p>We'll notify you when there's an update on your bids or orders.</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notif => (
              <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                <div className="notif-icon-wrapper">
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <p>{notif.message}</p>
                  <span className="notif-time">
                    {notif.createdAt
                      ? new Date(notif.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
