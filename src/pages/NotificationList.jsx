import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Bell, CheckCircle, Package, AlertCircle, Wallet, Save } from 'lucide-react';
import {
  getNotifications,
  getPreference,
  updatePreference,
} from '../api/orderNotificationApi';
import './Notifications.css';

const DEFAULT_USER_ID = '1';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(() => localStorage.getItem('bidmartUserId') || DEFAULT_USER_ID);
  const [userIdInput, setUserIdInput] = useState(userId);
  const [preference, setPreference] = useState({
    email: '',
    emailEnabled: false,
    pushEnabled: true,
  });

  const loadNotifications = (targetUserId = userId) => {
    setLoading(true);
    setError(null);

    Promise.all([
      getNotifications(targetUserId),
      getPreference(targetUserId).catch(() => null),
    ])
      .then(([notificationData, preferenceData]) => {
        setNotifications(notificationData);
        if (preferenceData) {
          setPreference({
            email: preferenceData.email || '',
            emailEnabled: Boolean(preferenceData.emailEnabled),
            pushEnabled: Boolean(preferenceData.pushEnabled),
          });
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotifications(userId);
  }, [userId]);

  const handleApplyUser = (event) => {
    event.preventDefault();
    const nextUserId = userIdInput.trim();
    if (!nextUserId) return;
    localStorage.setItem('bidmartUserId', nextUserId);
    setUserId(nextUserId);
  };

  const handleSavePreference = () => {
    setSavingPreference(true);
    updatePreference(userId, preference)
      .then(savedPreference => {
        setPreference({
          email: savedPreference.email || '',
          emailEnabled: Boolean(savedPreference.emailEnabled),
          pushEnabled: Boolean(savedPreference.pushEnabled),
        });
      })
      .catch(err => alert(err.message))
      .finally(() => setSavingPreference(false));
  };

  const getIcon = (type) => {
    if (!type) return <Bell className="notif-icon" />;
    if (type.includes('SHIPPED')) return <Package className="notif-icon text-primary" />;
    if (type.includes('WALLET')) return <Wallet className="notif-icon text-wallet" />;
    if (type.includes('WON') || type.includes('COMPLETED') || type.includes('CREATED')) return <CheckCircle className="notif-icon text-success" />;
    if (type.includes('DISPUTE')) return <AlertCircle className="notif-icon text-danger" />;
    return <Bell className="notif-icon" />;
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container">
        <div className="page-header d-flex justify-between align-center notification-page-header">
          <div>
            <h1>Notifications</h1>
            <p>View order and wallet updates from your notification service.</p>
          </div>
          <form className="user-filter" onSubmit={handleApplyUser}>
            <input
              value={userIdInput}
              onChange={(event) => setUserIdInput(event.target.value)}
              placeholder="User ID"
              aria-label="User ID"
            />
            <button type="submit" className="btn-outline">Load</button>
          </form>
        </div>

        <div className="preference-panel">
          <div>
            <h2>Notification Preferences</h2>
            <p>User ID: {userId}</p>
          </div>
          <input
            type="email"
            value={preference.email}
            onChange={(event) => setPreference(current => ({ ...current, email: event.target.value }))}
            placeholder="Email address"
            className="preference-email"
          />
          <label className="preference-toggle">
            <input
              type="checkbox"
              checked={preference.emailEnabled}
              onChange={(event) => setPreference(current => ({ ...current, emailEnabled: event.target.checked }))}
            />
            Email
          </label>
          <label className="preference-toggle">
            <input
              type="checkbox"
              checked={preference.pushEnabled}
              onChange={(event) => setPreference(current => ({ ...current, pushEnabled: event.target.checked }))}
            />
            Push
          </label>
          <button className="btn-primary preference-save" onClick={handleSavePreference} disabled={savingPreference}>
            <Save size={16} /> {savingPreference ? 'Saving...' : 'Save'}
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading notifications...</div>
        ) : error ? (
          <div className="error-state">
            <p>Could not load notifications. Make sure the order-notification backend is running.</p>
            <button className="btn-outline" onClick={() => loadNotifications(userId)}>Try Again</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state text-center">
            <Bell size={48} className="text-muted" style={{ display: 'block', margin: '0 auto 1rem' }} />
            <h3>No notifications yet</h3>
            <p>Order, shipment, dispute, and wallet notifications for this user will appear here.</p>
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
