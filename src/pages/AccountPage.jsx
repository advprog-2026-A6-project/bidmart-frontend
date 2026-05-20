import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  KeySquare,
  MonitorSmartphone,
  RefreshCw,
  Shield,
  UserCircle2,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import useAuth from '../context/useAuth';
import './AccountPage.css';

const initialForm = {
  name: '',
  phoneNumber: '',
  address: '',
  bio: '',
  profilePictureUrl: '',
  preferredContactMethod: 'EMAIL',
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: false,
};

const formatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const AccountPage = () => {
  const {
    disableTwoFactor,
    enableEmailTwoFactor,
    enableTotp,
    generateTotpQr,
    getActiveSessions,
    hasAnyAuthority,
    profile,
    refreshProfile,
    revokeSession,
    session,
    updateProfile,
  } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canManageRbac = hasAnyAuthority(['rbac:manage', 'user:deactivate']);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const [nextProfile, nextSessions] = await Promise.all([
          refreshProfile(),
          getActiveSessions(),
        ]);

        setForm({
          name: nextProfile?.name || '',
          phoneNumber: nextProfile?.phoneNumber || '',
          address: nextProfile?.address || '',
          bio: nextProfile?.bio || '',
          profilePictureUrl: nextProfile?.profilePictureUrl || '',
          preferredContactMethod: nextProfile?.preferredContactMethod || 'EMAIL',
          emailNotificationsEnabled: Boolean(nextProfile?.emailNotificationsEnabled),
          pushNotificationsEnabled: Boolean(nextProfile?.pushNotificationsEnabled),
        });
        setSessions(nextSessions || []);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [getActiveSessions, refreshProfile]);

  const permissions = useMemo(() => session?.authorities || [], [session?.authorities]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const nextProfile = await updateProfile(form);
      setForm({
        name: nextProfile?.name || '',
        phoneNumber: nextProfile?.phoneNumber || '',
        address: nextProfile?.address || '',
        bio: nextProfile?.bio || '',
        profilePictureUrl: nextProfile?.profilePictureUrl || '',
        preferredContactMethod: nextProfile?.preferredContactMethod || 'EMAIL',
        emailNotificationsEnabled: Boolean(nextProfile?.emailNotificationsEnabled),
        pushNotificationsEnabled: Boolean(nextProfile?.pushNotificationsEnabled),
      });
      setStatusMessage('Profil berhasil diperbarui.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGenerateQr = async () => {
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await generateTotpQr();
      setQrCodeUri(response?.qrCodeUri || '');
      setStatusMessage('QR Code baru berhasil dibuat. Lanjutkan dengan OTP dari authenticator Anda.');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleEnableTotp = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await enableTotp(totpCode.trim());
      setStatusMessage(response?.message || '2FA TOTP berhasil diaktifkan.');
      setTotpCode('');
      setQrCodeUri('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleEnableEmail = async () => {
    setErrorMessage('');
    setStatusMessage('');

    try {
      await enableEmailTwoFactor();
      setStatusMessage('2FA email berhasil diaktifkan.');
      setQrCodeUri('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDisableTwoFactor = async () => {
    setErrorMessage('');
    setStatusMessage('');

    try {
      await disableTwoFactor();
      setStatusMessage('2FA berhasil dinonaktifkan.');
      setQrCodeUri('');
      setTotpCode('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const refreshSessions = async () => {
    setSessionLoading(true);
    setErrorMessage('');

    try {
      const nextSessions = await getActiveSessions();
      setSessions(nextSessions || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    setSessionLoading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await revokeSession(sessionId);
      setStatusMessage(response?.message || 'Sesi berhasil dicabut.');
      await refreshSessions();
    } catch (error) {
      setErrorMessage(error.message);
      setSessionLoading(false);
    }
  };

  return (
    <AppShell>
      <section className="container account-page">
        <header className="page-header">
          <div>
            <h1>Account Settings</h1>
            <p>Semua fitur backend Auth sekarang dipetakan ke halaman ini: profil, 2FA, daftar sesi, dan ringkasan permission.</p>
          </div>
          {canManageRbac ? (
            <Link to="/admin/auth" className="account-admin-link">
              Buka Admin Auth
            </Link>
          ) : null}
        </header>

        {statusMessage ? <div className="status-banner success">{statusMessage}</div> : null}
        {errorMessage ? <div className="status-banner error">{errorMessage}</div> : null}

        {loading ? (
          <div className="empty-panel">
            <h2>Memuat profil...</h2>
            <p>Kami sedang mengambil data akun, method 2FA, dan daftar sesi aktif Anda.</p>
          </div>
        ) : (
          <div className="account-grid">
            <div className="account-main-column">
              <section className="surface-card">
                <div className="section-heading">
                  <div className="section-icon"><UserCircle2 size={18} /></div>
                  <div>
                    <h2>Profil pengguna</h2>
                    <p>Update nama tampilan, alamat pengiriman, preferensi kontak, dan notifikasi.</p>
                  </div>
                </div>
                <form className="profile-form" onSubmit={handleProfileSubmit}>
                  <div className="profile-grid">
                    <label className="field-label">
                      <span>Nama</span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        required
                      />
                    </label>
                    <label className="field-label">
                      <span>Nomor telepon</span>
                      <input
                        value={form.phoneNumber}
                        onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                        placeholder="+62..."
                      />
                    </label>
                    <label className="field-label field-span-2">
                      <span>Alamat pengiriman</span>
                      <textarea
                        value={form.address}
                        onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                        placeholder="Alamat lengkap pengiriman"
                      />
                    </label>
                    <label className="field-label field-span-2">
                      <span>Bio</span>
                      <textarea
                        value={form.bio}
                        onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                        placeholder="Ringkasan singkat profil Anda"
                      />
                    </label>
                    <label className="field-label field-span-2">
                      <span>URL foto profil</span>
                      <input
                        value={form.profilePictureUrl}
                        onChange={(event) => setForm((current) => ({ ...current, profilePictureUrl: event.target.value }))}
                        placeholder="https://..."
                      />
                    </label>
                    <label className="field-label">
                      <span>Metode kontak utama</span>
                      <select
                        value={form.preferredContactMethod}
                        onChange={(event) => setForm((current) => ({ ...current, preferredContactMethod: event.target.value }))}
                      >
                        <option value="EMAIL">Email</option>
                        <option value="PHONE">Phone</option>
                      </select>
                    </label>
                    <label className="toggle-field">
                      <input
                        type="checkbox"
                        checked={form.emailNotificationsEnabled}
                        onChange={(event) => setForm((current) => ({ ...current, emailNotificationsEnabled: event.target.checked }))}
                      />
                      <span>Aktifkan notifikasi email</span>
                    </label>
                    <label className="toggle-field">
                      <input
                        type="checkbox"
                        checked={form.pushNotificationsEnabled}
                        onChange={(event) => setForm((current) => ({ ...current, pushNotificationsEnabled: event.target.checked }))}
                      />
                      <span>Aktifkan push notification</span>
                    </label>
                  </div>
                  <button type="submit" className="primary-action" disabled={savingProfile}>
                    {savingProfile ? 'Menyimpan perubahan...' : 'Simpan profil'}
                  </button>
                </form>
              </section>

              <section className="surface-card">
                <div className="section-heading">
                  <div className="section-icon"><Shield size={18} /></div>
                  <div>
                    <h2>Multi-factor authentication</h2>
                    <p>Aktifkan TOTP atau kode email, lalu kelola metode yang saat ini dipakai akun Anda.</p>
                  </div>
                </div>
                <div className="security-overview">
                  <div className="security-chip">
                    <span>Email verified</span>
                    <strong>{profile?.emailVerified ? 'Ya' : 'Belum'}</strong>
                  </div>
                  <div className="security-chip">
                    <span>2FA aktif</span>
                    <strong>{profile?.twoFactorEnabled ? 'Ya' : 'Tidak'}</strong>
                  </div>
                  <div className="security-chip">
                    <span>Metode</span>
                    <strong>{profile?.twoFactorMethod || 'NONE'}</strong>
                  </div>
                </div>
                <div className="security-actions">
                  <button type="button" className="secondary-action" onClick={handleGenerateQr}>
                    Generate TOTP QR
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={handleEnableEmail}
                    disabled={!profile?.emailVerified}
                  >
                    Aktifkan 2FA Email
                  </button>
                  <button type="button" className="danger-action" onClick={handleDisableTwoFactor}>
                    Nonaktifkan 2FA
                  </button>
                </div>
                {qrCodeUri ? (
                  <div className="totp-setup-panel">
                    <div className="totp-qr">
                      <img src={qrCodeUri} alt="QR code TOTP BidMart" />
                    </div>
                    <form className="totp-form" onSubmit={handleEnableTotp}>
                      <label className="field-label">
                        <span>Kode OTP dari authenticator</span>
                        <input
                          value={totpCode}
                          onChange={(event) => setTotpCode(event.target.value)}
                          placeholder="Masukkan 6 digit OTP"
                          required
                        />
                      </label>
                      <button type="submit" className="primary-action">
                        Aktifkan TOTP
                      </button>
                    </form>
                  </div>
                ) : null}
              </section>

              <section className="surface-card">
                <div className="section-heading">
                  <div className="section-icon"><MonitorSmartphone size={18} /></div>
                  <div>
                    <h2>Sesi aktif</h2>
                    <p>Daftar sesi device yang masih aktif serta revoke manual per sesi.</p>
                  </div>
                </div>
                <div className="section-toolbar">
                  <button type="button" className="secondary-action icon-action" onClick={refreshSessions} disabled={sessionLoading}>
                    <RefreshCw size={16} className={sessionLoading ? 'spin' : ''} />
                    Refresh daftar sesi
                  </button>
                </div>
                {sessions.length === 0 ? (
                  <div className="empty-inline">
                    <p>Belum ada sesi aktif lain selain sesi yang sedang digunakan.</p>
                  </div>
                ) : (
                  <div className="session-list">
                    {sessions.map((activeSession) => (
                      <article key={activeSession.id} className="session-item">
                        <div>
                          <h3>{activeSession.deviceId || 'Unknown Device'}</h3>
                          <p>Session token id: {activeSession.sessionTokenId}</p>
                          <p>Dibuat: {formatter.format(new Date(activeSession.createdAt))}</p>
                          <p>Berakhir: {formatter.format(new Date(activeSession.expiresAt))}</p>
                        </div>
                        <button
                          type="button"
                          className="danger-link"
                          onClick={() => handleRevokeSession(activeSession.id)}
                          disabled={sessionLoading}
                        >
                          Revoke sesi
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="account-side-column">
              <section className="surface-card sticky-card">
                <div className="section-heading">
                  <div className="section-icon"><CheckCircle2 size={18} /></div>
                  <div>
                    <h2>Ringkasan akun</h2>
                    <p>Snapshot sesi yang saat ini tervalidasi oleh backend Auth.</p>
                  </div>
                </div>
                <dl className="summary-list">
                  <div>
                    <dt>User ID</dt>
                    <dd>{profile?.id ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{profile?.email ?? session?.email ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Nama</dt>
                    <dd>{profile?.name || '-'}</dd>
                  </div>
                  <div>
                    <dt>Contact method</dt>
                    <dd>{profile?.preferredContactMethod || '-'}</dd>
                  </div>
                </dl>
              </section>

              <section className="surface-card">
                <div className="section-heading">
                  <div className="section-icon"><KeySquare size={18} /></div>
                  <div>
                    <h2>Permission saat ini</h2>
                    <p>Authority yang dikirim backend lewat pipeline verifikasi token dan permission.</p>
                  </div>
                </div>
                <div className="permission-chip-list">
                  {permissions.length > 0 ? permissions.map((permission) => (
                    <span key={permission} className="permission-chip">{permission}</span>
                  )) : <p className="empty-inline">Belum ada authority yang terbaca.</p>}
                </div>
              </section>
            </aside>
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default AccountPage;
