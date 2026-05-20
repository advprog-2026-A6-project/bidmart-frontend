import { useEffect, useState } from 'react';
import { BadgeCheck, KeySquare, MonitorSmartphone, ShieldCheck, UserRoundCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import useAuth from '../context/useAuth';
import './Dashboard.css';

const Dashboard = () => {
  const { getActiveSessions, hasAnyAuthority, profile, refreshProfile, session } = useAuth();
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);

      try {
        if (!profile) {
          await refreshProfile();
        }

        const sessions = await getActiveSessions();
        setSessionCount((sessions || []).length);
      } catch {
        setSessionCount(0);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [getActiveSessions, profile, refreshProfile]);

  const permissionCount = session?.authorities?.length || 0;
  const canManageAdmin = hasAnyAuthority(['rbac:manage', 'user:deactivate']);

  return (
    <AppShell>
      <div className="dashboard-container container">
        <div className="dashboard-header">
          <h1>Selamat datang, {profile?.name || session?.email || 'BidMart User'}!</h1>
          <p>Dashboard ini sekarang jadi pusat kontrol fitur Auth: validasi akun, 2FA, session management, dan RBAC admin.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-effect">
            <div className="stat-icon-wrapper bg-blue-light">
              <BadgeCheck className="stat-icon text-blue" size={28} />
            </div>
            <div className="stat-info">
              <h3>{profile?.emailVerified ? 'Verified' : 'Pending'}</h3>
              <p>Email Verification</p>
            </div>
          </div>
          <div className="stat-card glass-effect">
            <div className="stat-icon-wrapper bg-gold-light">
              <ShieldCheck className="stat-icon text-gold" size={28} />
            </div>
            <div className="stat-info">
              <h3>{profile?.twoFactorMethod || 'NONE'}</h3>
              <p>2FA Method</p>
            </div>
          </div>
          <div className="stat-card glass-effect">
            <div className="stat-icon-wrapper bg-red-light">
              <MonitorSmartphone className="stat-icon text-red" size={28} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : sessionCount}</h3>
              <p>Active Sessions</p>
            </div>
          </div>
          <div className="stat-card glass-effect">
            <div className="stat-icon-wrapper bg-blue-light">
              <KeySquare className="stat-icon text-blue" size={28} />
            </div>
            <div className="stat-info">
              <h3>{permissionCount}</h3>
              <p>Granted Permissions</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-main">
            <div className="section-title">
              <h2>Auth Operations</h2>
              <Link to="/account" className="view-all">Open Account</Link>
            </div>

            <div className="ops-grid">
              <div className="ops-card glass-effect">
                <div className="ops-card-header">
                  <UserRoundCog size={20} />
                  <h3>Profile & contact preferences</h3>
                </div>
                <p>Kelola nama, alamat pengiriman, foto profil, serta preferensi kontak email atau phone yang diminta modul lain.</p>
                <Link to="/account" className="btn-primary small">Kelola profil</Link>
              </div>

              <div className="ops-card glass-effect">
                <div className="ops-card-header">
                  <ShieldCheck size={20} />
                  <h3>2FA management</h3>
                </div>
                <p>Generate QR TOTP, aktifkan email 2FA, atau matikan faktor kedua dari satu halaman yang sama.</p>
                <Link to="/account" className="btn-primary small">Atur 2FA</Link>
              </div>

              <div className="ops-card glass-effect">
                <div className="ops-card-header">
                  <MonitorSmartphone size={20} />
                  <h3>Session controls</h3>
                </div>
                <p>Lihat daftar sesi aktif, revoke manual per sesi, dan pastikan overflow policy backend sudah berjalan.</p>
                <Link to="/account" className="btn-primary small">Lihat sesi</Link>
              </div>

              {canManageAdmin ? (
                <div className="ops-card glass-effect">
                  <div className="ops-card-header">
                    <KeySquare size={20} />
                    <h3>RBAC runtime admin</h3>
                  </div>
                  <p>Buat role custom, assign permission granular, kelola role user, dan deactivate akun dari admin console.</p>
                  <Link to="/admin/auth" className="btn-primary small">Buka admin auth</Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="wallet-summary glass-effect auth-summary-card">
              <h3>Session Snapshot</h3>
              <div className="summary-balance auth-summary-values">
                <p>User ID</p>
                <h2>{profile?.id ?? '-'}</h2>
              </div>
              <div className="auth-summary-meta">
                <p><strong>Email:</strong> {profile?.email || session?.email || '-'}</p>
                <p><strong>Contact:</strong> {profile?.preferredContactMethod || '-'}</p>
                <p><strong>Notifications:</strong> {profile?.emailNotificationsEnabled ? 'Email on' : 'Email off'} / {profile?.pushNotificationsEnabled ? 'Push on' : 'Push off'}</p>
              </div>
              <Link to="/account" className="btn-primary full-width">Go to Account</Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
