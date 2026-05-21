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
          <p>Kelola akun, keamanan, dan aktivitas sesi Anda dari satu tempat.</p>
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
              <h2>Pengaturan akun</h2>
              <Link to="/account" className="view-all">Buka akun</Link>
            </div>

            <div className="ops-grid">
              <div className="ops-card glass-effect">
                <div className="ops-card-header">
                  <UserRoundCog size={20} />
                  <h3>Profil dan kontak</h3>
                </div>
                <p>Perbarui nama, alamat pengiriman, foto profil, dan metode kontak utama akun Anda.</p>
                <Link to="/account" className="btn-primary small">Kelola profil</Link>
              </div>

              <div className="ops-card glass-effect">
                <div className="ops-card-header">
                  <ShieldCheck size={20} />
                  <h3>Keamanan 2FA</h3>
                </div>
                <p>Aktifkan perlindungan tambahan lewat aplikasi authenticator atau kode verifikasi email.</p>
                <Link to="/account" className="btn-primary small">Atur 2FA</Link>
              </div>

              <div className="ops-card glass-effect">
                <div className="ops-card-header">
                  <MonitorSmartphone size={20} />
                  <h3>Sesi perangkat</h3>
                </div>
                <p>Lihat perangkat yang masih login dan cabut sesi yang sudah tidak Anda gunakan.</p>
                <Link to="/account" className="btn-primary small">Lihat sesi</Link>
              </div>

              {canManageAdmin ? (
                <div className="ops-card glass-effect">
                  <div className="ops-card-header">
                    <KeySquare size={20} />
                    <h3>RBAC runtime admin</h3>
                  </div>
                  <p>Kelola role, permission, dan penonaktifan akun dari panel admin.</p>
                  <Link to="/admin/auth" className="btn-primary small">Buka admin auth</Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="wallet-summary glass-effect auth-summary-card">
              <h3>Ringkasan akun</h3>
              <div className="summary-balance auth-summary-values">
                <p>User ID</p>
                <h2>{profile?.id ?? '-'}</h2>
              </div>
              <div className="auth-summary-meta">
                <p><strong>Email:</strong> {profile?.email || session?.email || '-'}</p>
                <p><strong>Contact:</strong> {profile?.preferredContactMethod || '-'}</p>
                <p><strong>Notifications:</strong> {profile?.emailNotificationsEnabled ? 'Email on' : 'Email off'} / {profile?.pushNotificationsEnabled ? 'Push on' : 'Push off'}</p>
              </div>
              <Link to="/account" className="btn-primary full-width">Buka pengaturan akun</Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
