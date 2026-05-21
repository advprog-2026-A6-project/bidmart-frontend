const ACCESS_TOKEN_KEY = 'bidmart.accessToken';
const REFRESH_TOKEN_KEY = 'bidmart.refreshToken';
export const AUTH_STORAGE_EVENT = 'bidmart-auth-storage-changed';

const isBrowser = typeof window !== 'undefined';

const notifyChange = () => {
  if (!isBrowser) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_STORAGE_EVENT));
};

export const getStoredTokens = () => {
  if (!isBrowser) {
    return { accessToken: '', refreshToken: '' };
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY) || '',
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY) || '',
  };
};

export const getAccessToken = () => getStoredTokens().accessToken;

export const getRefreshToken = () => getStoredTokens().refreshToken;

export const setStoredTokens = ({ accessToken = '', refreshToken = '' }) => {
  if (!isBrowser) {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  notifyChange();
};

export const clearStoredTokens = () => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyChange();
};
