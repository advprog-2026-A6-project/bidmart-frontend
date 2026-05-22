import { useCallback, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Bell, CheckCircle, Package, AlertCircle, Wallet, Save, Gavel } from 'lucide-react';
import {
  getNotifications,
  getPreference,
  updatePreference,
} from '../api/orderNotificationApi';
import { subscribeToOrderNotificationTopic } from '../api/orderNotificationLive';
import useAuth from '../context/useAuth';
import './Notifications.css';

const resolveUserId = (profile, session) => {
  const rawUserId = session?.userId ?? profile?.id ?? profile?.userId;
  return rawUserId ? String(rawUserId) : '';
};

const resolveLoadErrorMessage = (error) => {
  if (error?.status === 401) {
    return 'Sesi login tidak valid atau sudah habis. Silakan login ulang lalu buka Notifications lagi.';
  }

  if (error?.status === 403) {
    return 'User ID ini tidak cocok dengan akun yang sedang login. Gunakan User ID akun Anda sendiri.';
  }

  return error?.message || 'Could not load notifications. Make sure the order-notification backend is running.';
};

const getToastTone = (notification = {}) => {
  const status = String(notification.status || '').toLowerCase();
  const message = String(notification.message || '').toLowerCase();
  const type = String(notification.type || '').toLowerCase();

  if (
    status.includes('fail') ||
    message.includes('gagal') ||
    message.includes('failed') ||
    message.includes('error') ||
    type.includes('error')
  ) {
    return 'error';
  }

  return 'success';
};

const showNotificationToast = (setLiveToasts, notification = {}) => {
  const message = typeof notification === 'string' ? notification : notification.message;
  if (!message) {
    return;
  }

  const toastId = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  setLiveToasts(current => [
    ...current,
    {
      id: toastId,
      message,
      type: notification?.type || 'LIVE_NOTIFICATION',
      tone: getToastTone(typeof notification === 'string' ? { message: notification } : notification),
    },
  ]);

  window.setTimeout(() => {
    setLiveToasts(current => current.filter(toast => toast.id !== toastId));
  }, 5000);
};

const NotificationList = () => {
  const { profile, session, status } = useAuth();
  const authenticatedUserId = resolveUserId(profile, session);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);
  const [error, setError] = useState(null);
  const [liveToasts, setLiveToasts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(() => localStorage.getItem('bidmartUserId') || '');
  const userId = selectedUserId || authenticatedUserId;
  const [userIdInput, setUserIdInput] = useState(() => localStorage.getItem('bidmartUserId') || '');
  const [preference, setPreference] = useState({
    email: '',
    emailEnabled: false,
    pushEnabled: true,
  });

  const loadNotifications = useCallback((targetUserId = userId, { notifyNew = false } = {}) => {
    if (!targetUserId) {
      if (status === 'loading') {
        return;
      }

      setLoading(false);
      setError('Silakan login terlebih dahulu untuk melihat notifikasi.');
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      getNotifications(targetUserId),
      getPreference(targetUserId).catch(() => null),
    ])
      .then(([notificationData, preferenceData]) => {
        setNotifications(current => {
          if (notifyNew && current.length > 0) {
            const knownIds = new Set(current.map(notification => String(notification.id)));
            notificationData
              .filter(notification => !knownIds.has(String(notification.id)))
              .slice(0, 3)
              .reverse()
              .forEach(notification => showNotificationToast(setLiveToasts, notification));
          }

          return notificationData;
        });
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
        setError(resolveLoadErrorMessage(err));
        setLoading(false);
      });
  }, [status, userId]);

  useEffect(() => {
    Promise.resolve().then(() => loadNotifications(userId));
  }, [loadNotifications, userId]);

  useEffect(() => {
    if (!userId) return undefined;

    return subscribeToOrderNotificationTopic(`/topic/notifications/${userId}`, (payload) => {
      const message = typeof payload === 'string' ? payload : payload?.message;
      if (!message) {
        loadNotifications(userId);
        return;
      }

      showNotificationToast(setLiveToasts, typeof payload === 'string' ? { message: payload } : payload);

      setNotifications(current => [
        {
          id: `live-${Date.now()}`,
          message,
          type: payload?.type || 'LIVE_NOTIFICATION',
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...current,
      ]);

      window.setTimeout(() => {
        loadNotifications(userId);
      }, 600);
    }, () => {});
  }, [loadNotifications, userId]);

  useEffect(() => {
    if (!userId) return undefined;

    const intervalId = window.setInterval(() => {
      loadNotifications(userId, { notifyNew: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications, userId]);

  const handleApplyUser = (event) => {
    event.preventDefault();
    const nextUserId = userIdInput.trim() || authenticatedUserId;
    if (!nextUserId) return;
    localStorage.setItem('bidmartUserId', nextUserId);
    setSelectedUserId(nextUserId);
    setUserIdInput(nextUserId);
  };

  const handleUseMyUserId = () => {
    if (!authenticatedUserId) return;
    localStorage.setItem('bidmartUserId', authenticatedUserId);
    setSelectedUserId(authenticatedUserId);
    setUserIdInput(authenticatedUserId);
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
        const toastId = `toast-${Date.now()}`;
        setLiveToasts(current => [
          ...current,
          {
            id: toastId,
            message: 'Preferensi notifikasi berhasil disimpan.',
            type: 'PREFERENCE_SAVED',
            tone: 'success',
          },
        ]);
        window.setTimeout(() => {
          setLiveToasts(current => current.filter(toast => toast.id !== toastId));
        }, 5000);
      })
      .catch(err => {
        const toastId = `toast-${Date.now()}`;
        setLiveToasts(current => [
          ...current,
          {
            id: toastId,
            message: err.message || 'Preferensi notifikasi gagal disimpan.',
            type: 'PREFERENCE_FAILED',
            tone: 'error',
          },
        ]);
        window.setTimeout(() => {
          setLiveToasts(current => current.filter(toast => toast.id !== toastId));
        }, 5000);
      })
      .finally(() => setSavingPreference(false));
  };

  const getIcon = (type) => {
    if (!type) return <Bell className="notif-icon" />;
    if (type.includes('BID') || type.includes('OUTBID')) return <Gavel className="notif-icon text-primary" />;
    if (type.includes('PACKED')) return <Package className="notif-icon text-primary" />;
    if (type.includes('SHIPPED')) return <Package className="notif-icon text-primary" />;
    if (type.includes('WALLET')) return <Wallet className="notif-icon text-wallet" />;
    if (type.includes('WON') || type.includes('COMPLETED') || type.includes('CREATED')) return <CheckCircle className="notif-icon text-success" />;
    if (type.includes('DISPUTE')) return <AlertCircle className="notif-icon text-danger" />;
    return <Bell className="notif-icon" />;
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="live-toast-stack" aria-live="polite" aria-atomic="false">
        {liveToasts.map(toast => (
          <div key={toast.id} className={`live-toast live-toast-${toast.tone || 'success'}`}>
            <div className="live-toast-icon">
              {getIcon(toast.type)}
            </div>
            <p>{toast.message}</p>
          </div>
        ))}
      </div>
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
            {authenticatedUserId && userIdInput !== authenticatedUserId && (
              <button type="button" className="btn-outline" onClick={handleUseMyUserId}>
                My ID
              </button>
            )}
            <button type="submit" className="btn-outline">Load</button>
          </form>
        </div>

        <div className="preference-panel">
          <div>
            <h2>Notification Preferences</h2>
            <p>User ID: {userId}</p>
            {authenticatedUserId && userId !== authenticatedUserId && (
              <p className="preference-warning">Login ID: {authenticatedUserId}</p>
            )}
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
            <p>{error}</p>
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
