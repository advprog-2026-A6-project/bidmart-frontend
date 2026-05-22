import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications } from '../api/orderNotificationApi';
import { subscribeToOrderNotificationTopic } from '../api/orderNotificationLive';
import useAuth from '../context/useAuth';
import '../pages/Notifications.css';

const resolveUserId = (profile, session) => {
  const rawUserId = session?.userId ?? profile?.id ?? profile?.userId;
  return rawUserId ? String(rawUserId) : '';
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

const normalizeNotification = (payload) => {
  if (typeof payload === 'string') {
    return {
      id: `live-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      message: payload,
      type: 'LIVE_NOTIFICATION',
      status: 'SENT',
    };
  }

  return payload;
};

const GlobalNotificationToasts = () => {
  const { profile, session, status } = useAuth();
  const userId = resolveUserId(profile, session);
  const knownIdsRef = useRef(new Set());
  const [toasts, setToasts] = useState([]);

  const showToast = (payload) => {
    const notification = normalizeNotification(payload);
    const message = notification?.message;

    if (!message) {
      return;
    }

    const id = `global-toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(current => [
      ...current,
      {
        id,
        message,
        type: notification.type || 'LIVE_NOTIFICATION',
        tone: getToastTone(notification),
      },
    ]);

    window.setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
    }, 5000);
  };

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      knownIdsRef.current = new Set();
      return undefined;
    }

    let cancelled = false;

    getNotifications(userId)
      .then(notifications => {
        if (!cancelled) {
          knownIdsRef.current = new Set(notifications.map(notification => String(notification.id)));
        }
      })
      .catch(() => {});

    const unsubscribe = subscribeToOrderNotificationTopic(
      `/topic/notifications/${userId}`,
      payload => showToast(payload),
      () => {},
    );

    const intervalId = window.setInterval(() => {
      getNotifications(userId)
        .then(notifications => {
          const knownIds = knownIdsRef.current;
          const newNotifications = notifications
            .filter(notification => !knownIds.has(String(notification.id)))
            .slice(0, 3)
            .reverse();

          notifications.forEach(notification => knownIds.add(String(notification.id)));
          newNotifications.forEach(showToast);
        })
        .catch(() => {});
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      unsubscribe();
    };
  }, [status, userId]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="live-toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <div key={toast.id} className={`live-toast live-toast-${toast.tone || 'success'}`}>
          <div className="live-toast-icon">
            <Bell className="notif-icon" />
          </div>
          <p>{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

export default GlobalNotificationToasts;
