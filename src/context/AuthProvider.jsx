import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import {
  AUTH_STORAGE_EVENT,
  clearStoredTokens,
  getAccessToken,
  getStoredTokens,
  setStoredTokens,
} from '../utils/authStorage';
import AuthContext from './authContext';

const MFA_STORAGE_KEY = 'bidmart.pendingMfa';
const isBrowser = typeof window !== 'undefined';

const readPendingChallenge = () => {
  if (!isBrowser) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(MFA_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

const persistPendingChallenge = (challenge) => {
  if (!isBrowser) {
    return;
  }

  if (challenge) {
    window.sessionStorage.setItem(MFA_STORAGE_KEY, JSON.stringify(challenge));
  } else {
    window.sessionStorage.removeItem(MFA_STORAGE_KEY);
  }
};

const normalizeAuthorities = (authorities = []) =>
  authorities
    .map((authority) => {
      if (typeof authority === 'string') {
        return authority;
      }

      if (authority && typeof authority === 'object') {
        return authority.authority || authority.name || '';
      }

      return '';
    })
    .filter(Boolean);

const normalizeProfile = (nextProfile) => {
  if (!nextProfile) {
    return null;
  }

  return {
    ...nextProfile,
    twoFactorEnabled: nextProfile.twoFactorEnabled ?? nextProfile.isTwoFactorEnabled ?? false,
  };
};

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState('loading');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pendingChallenge, setPendingChallenge] = useState(readPendingChallenge);

  const updatePendingChallenge = useCallback((challenge) => {
    setPendingChallenge(challenge);
    persistPendingChallenge(challenge);
  }, []);

  const resetAuthState = useCallback(() => {
    updatePendingChallenge(null);
    setSession(null);
    setProfile(null);
    setStatus('anonymous');
  }, [updatePendingChallenge]);

  const hydrateSession = useCallback(async () => {
    const { accessToken, refreshToken } = getStoredTokens();

    if (!accessToken && !refreshToken) {
      resetAuthState();
      return null;
    }

    try {
      const validation = await authApi.validateSession();
      const nextProfile = normalizeProfile(await authApi.getProfile());
      const nextSession = {
        userId: validation.userId,
        email: validation.email,
        authorities: normalizeAuthorities(validation.authorities),
      };

      setSession(nextSession);
      setProfile(nextProfile);
      setStatus('authenticated');

      return { session: nextSession, profile: nextProfile };
    } catch {
      clearStoredTokens();
      resetAuthState();
      return null;
    }
  }, [resetAuthState]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      hydrateSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hydrateSession]);

  useEffect(() => {
    if (!isBrowser) {
      return undefined;
    }

    const handleStorageChange = () => {
      const { accessToken, refreshToken } = getStoredTokens();

      if (!accessToken && !refreshToken) {
        resetAuthState();
      }
    };

    window.addEventListener(AUTH_STORAGE_EVENT, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_STORAGE_EVENT, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [resetAuthState]);

  const completeAuthentication = useCallback(
    async (response) => {
      setStoredTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      updatePendingChallenge(null);
      return hydrateSession();
    },
    [hydrateSession, updatePendingChallenge],
  );

  const register = useCallback((payload) => authApi.register(payload), []);
  const verifyEmail = useCallback((token) => authApi.verifyEmail(token), []);
  const resendVerification = useCallback((email) => authApi.resendVerification(email), []);

  const login = useCallback(
    async (payload) => {
      const response = await authApi.login(payload);

      if (response?.mfaRequired) {
        const challenge = {
          challengeToken: response.mfaChallengeToken,
          twoFactorMethod: response.twoFactorMethod,
        };

        updatePendingChallenge(challenge);
        return { mfaRequired: true, challenge };
      }

      await completeAuthentication(response);
      return { mfaRequired: false };
    },
    [completeAuthentication, updatePendingChallenge],
  );

  const completeTwoFactor = useCallback(
    async (code) => {
      const challenge = pendingChallenge || readPendingChallenge();

      if (!challenge?.challengeToken) {
        throw new Error('Challenge 2FA tidak ditemukan. Silakan login ulang.');
      }

      const response = await authApi.verifyTwoFactor({
        challengeToken: challenge.challengeToken,
        code,
      });

      await completeAuthentication(response);
    },
    [completeAuthentication, pendingChallenge],
  );

  const logout = useCallback(async () => {
    const accessToken = getAccessToken();

    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch {
      // noop
    } finally {
      clearStoredTokens();
      resetAuthState();
    }
  }, [resetAuthState]);

  const refreshProfile = useCallback(async () => {
    const nextProfile = normalizeProfile(await authApi.getProfile());
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const nextProfile = normalizeProfile(await authApi.updateProfile(payload));
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const generateTotpQr = useCallback(() => authApi.generateTotpQr(), []);

  const enableTotp = useCallback(async (code) => {
    const response = await authApi.enableTotp(code);
    await refreshProfile();
    return response;
  }, [refreshProfile]);

  const enableEmailTwoFactor = useCallback(async () => {
    const nextProfile = normalizeProfile(await authApi.enableEmailTwoFactor());
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const disableTwoFactor = useCallback(async () => {
    const nextProfile = normalizeProfile(await authApi.disableTwoFactor());
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const getActiveSessions = useCallback(() => authApi.getSessions(), []);
  const revokeSession = useCallback((sessionId) => authApi.revokeSession(sessionId), []);

  const hasAuthority = useCallback(
    (authority) => Boolean(session?.authorities?.includes(authority)),
    [session],
  );

  const hasAnyAuthority = useCallback(
    (authorities = []) => authorities.some((authority) => hasAuthority(authority)),
    [hasAuthority],
  );

  const value = useMemo(
    () => ({
      status,
      isAuthenticated: status === 'authenticated',
      session,
      profile,
      pendingChallenge,
      hasAuthority,
      hasAnyAuthority,
      register,
      verifyEmail,
      resendVerification,
      login,
      completeTwoFactor,
      logout,
      refreshProfile,
      updateProfile,
      generateTotpQr,
      enableTotp,
      enableEmailTwoFactor,
      disableTwoFactor,
      getActiveSessions,
      revokeSession,
      hydrateSession,
    }),
    [
      completeTwoFactor,
      disableTwoFactor,
      enableEmailTwoFactor,
      enableTotp,
      generateTotpQr,
      getActiveSessions,
      hasAnyAuthority,
      hasAuthority,
      hydrateSession,
      login,
      logout,
      pendingChallenge,
      profile,
      refreshProfile,
      register,
      resendVerification,
      revokeSession,
      session,
      status,
      updateProfile,
      verifyEmail,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
