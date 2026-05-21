import { apiFetch } from './apiClient';

const AUTH_API_BASE = import.meta.env.VITE_AUTH_API_BASE || '';

const postJson = (path, payload, config) =>
  apiFetch(
    `${AUTH_API_BASE}${path}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    config,
  );

const putJson = (path, payload, config) =>
  apiFetch(
    `${AUTH_API_BASE}${path}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    config,
  );

export const authApi = {
  register: (payload) => postJson('/api/auth/register', payload, { auth: false, retry: false }),
  verifyEmail: (token) => postJson('/api/auth/verify-email', { token }, { auth: false, retry: false }),
  resendVerification: (email) => postJson('/api/auth/resend-verification', { email }, { auth: false, retry: false }),
  login: (payload) => postJson('/api/auth/login', payload, { auth: false, retry: false }),
  verifyTwoFactor: (payload) => postJson('/api/auth/verify-2fa', payload, { auth: false, retry: false }),
  logout: (accessToken) =>
    apiFetch(`${AUTH_API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),
  validateSession: () => apiFetch(`${AUTH_API_BASE}/api/auth/validate`),
  getProfile: () => apiFetch(`${AUTH_API_BASE}/api/profile`),
  updateProfile: (payload) => putJson('/api/profile', payload),
  generateTotpQr: () => apiFetch(`${AUTH_API_BASE}/api/profile/2fa/generate`),
  enableTotp: (code) => postJson('/api/profile/2fa/enable/totp', { code }),
  enableEmailTwoFactor: () => postJson('/api/profile/2fa/enable/email', {}),
  disableTwoFactor: () => postJson('/api/profile/2fa/disable', {}),
  getSessions: () => apiFetch(`${AUTH_API_BASE}/api/profile/sessions`),
  revokeSession: (sessionId) =>
    apiFetch(`${AUTH_API_BASE}/api/profile/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
  createPermission: (name) => postJson('/api/admin/rbac/permissions', { name }),
  createRole: (name, permissions) => postJson('/api/admin/rbac/roles', { name, permissions }),
  assignPermissionToRole: (roleName, permissionName) =>
    postJson(`/api/admin/rbac/roles/${encodeURIComponent(roleName)}/permissions/${encodeURIComponent(permissionName)}`, {}),
  revokePermissionFromRole: (roleName, permissionName) =>
    apiFetch(
      `${AUTH_API_BASE}/api/admin/rbac/roles/${encodeURIComponent(roleName)}/permissions/${encodeURIComponent(permissionName)}`,
      { method: 'DELETE' },
    ),
  assignRoleToUser: (userId, roleName) =>
    postJson(`/api/admin/rbac/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleName)}`, {}),
  revokeRoleFromUser: (userId, roleName) =>
    apiFetch(
      `${AUTH_API_BASE}/api/admin/rbac/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleName)}`,
      { method: 'DELETE' },
    ),
  deactivateUser: (userId, reason) =>
    postJson(`/api/admin/users/${encodeURIComponent(userId)}/deactivate`, { reason }),
};
