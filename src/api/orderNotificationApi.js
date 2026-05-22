import { apiFetch } from './apiClient';

const ORDER_NOTIFICATION_API_BASE =
  import.meta.env.VITE_ORDER_NOTIFICATION_API_BASE || '/api/order-notification';

const request = (path, options = {}, config = {}) =>
  apiFetch(`${ORDER_NOTIFICATION_API_BASE}${path}`, options, config);


export function getOrders() {
  return request('/orders');
}

export function getOrderById(orderId) {
  return request(`/orders/${encodeURIComponent(orderId)}`);
}

export function getOrdersByUser(userId) {
  return request(`/orders/user/${encodeURIComponent(userId)}`);
}

export function markOrderPacked(orderId) {
  return request(`/orders/${orderId}/packed`, {
    method: 'POST',
  });
}

export function updateTrackingNumber(orderId, trackingNumber) {
  const params = new URLSearchParams({ trackingNumber });
  return request(`/orders/${orderId}/tracking?${params.toString()}`, {
    method: 'POST',
  });
}

export function confirmReceipt(orderId) {
  return request(`/orders/${orderId}/confirm`, {
    method: 'POST',
  });
}

export function submitDispute(orderId, reason) {
  const params = new URLSearchParams({ reason });
  return request(`/orders/${orderId}/dispute?${params.toString()}`, {
    method: 'POST',
  });
}

export function getNotifications(userId) {
  return request(`/notifications/${encodeURIComponent(userId)}`, {}, { auth: false, retry: false });
}

export function getPreference(userId) {
  return request(`/preferences/${encodeURIComponent(userId)}`);
}

export function updatePreference(userId, { email, emailEnabled, pushEnabled }) {
  const params = new URLSearchParams({
    email: email || '',
    emailEnabled: String(emailEnabled),
    pushEnabled: String(pushEnabled),
  });

  return request(`/preferences/${encodeURIComponent(userId)}?${params.toString()}`, {
    method: 'POST',
  });
}
