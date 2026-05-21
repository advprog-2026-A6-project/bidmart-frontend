import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, MailCheck, ShieldCheck, UserPlus } from 'lucide-react';
import AppShell from '../components/AppShell';
import useAuth from '../context/useAuth';
import './AuthPage.css';

const modeLabels = {
  login: {
    eyebrow: 'Masuk ke akun',
    title: 'Autentikasi BidMart',
    description: 'Masuk dengan email yang sudah terverifikasi untuk melanjutkan aktivitas akun Anda.',
    icon: KeyRound,
  },
  register: {
    eyebrow: 'Buat akun baru',
    title: 'Registrasi pengguna',
    description: 'Buat akun baru sebagai buyer atau seller, lalu verifikasi email untuk mengaktifkannya.',
    icon: UserPlus,
  },
  verify: {
    eyebrow: 'Verifikasi email',
    title: 'Aktifkan akun Anda',
    description: 'Masukkan token verifikasi yang dikirim ke email Anda untuk mengaktifkan akun.',
    icon: MailCheck,
  },
};

const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    completeTwoFactor,
    isAuthenticated,
    login,
    pendingChallenge,
    register,
    resendVerification,
    status,
    verifyEmail,
  } = useAuth();
  const mode = searchParams.get('mode') || 'login';
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const tokenFromQuery = searchParams.get('token') || '';
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    role: 'BUYER',
    password: '',
    confirmPassword: '',
  });
  const [verificationToken, setVerificationToken] = useState(() => tokenFromQuery);
  const [resendEmail, setResendEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  useEffect(() => {
    if (tokenFromQuery && mode !== 'verify') {
      const next = new URLSearchParams(searchParams);
      next.set('mode', 'verify');
      setSearchParams(next);
    }
  }, [mode, searchParams, setSearchParams, tokenFromQuery]);

  useEffect(() => {
    if (status === 'authenticated' && isAuthenticated) {
      navigate(redirectTarget, { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, location, navigate, redirectTarget, status]);

  const challengeLabel = useMemo(() => {
    if (!pendingChallenge?.twoFactorMethod) {
      return '';
    }

    return pendingChallenge.twoFactorMethod === 'EMAIL'
      ? 'Masukkan kode 2FA yang dikirim ke email Anda.'
      : 'Masukkan kode OTP 6 digit dari aplikasi authenticator.';
  }, [pendingChallenge]);

  const setMode = (nextMode) => {
    setErrorMessage('');
    setStatusMessage('');
    const next = new URLSearchParams(searchParams);
    next.set('mode', nextMode);
    setSearchParams(next);
  };

  const activeMode = modeLabels[mode] ? mode : 'login';
  const ActiveIcon = modeLabels[activeMode].icon;

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const result = await login(loginForm);

      if (result.mfaRequired) {
        setStatusMessage(`Faktor kedua diperlukan. Metode aktif: ${result.challenge.twoFactorMethod}.`);
      } else {
        navigate(redirectTarget, { replace: true });
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setSubmitting(false);
      setErrorMessage('Konfirmasi password belum cocok.');
      return;
    }

    try {
      const response = await register({
        name: registerForm.name,
        email: registerForm.email,
        role: registerForm.role,
        password: registerForm.password,
      });
      setStatusMessage(response?.message || 'Registrasi berhasil.');
      setResendEmail(registerForm.email);
      setVerificationToken('');
      setMode('verify');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await verifyEmail(verificationToken.trim());
      setStatusMessage(response?.message || 'Email berhasil diverifikasi.');
      setMode('login');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await resendVerification(resendEmail.trim());
      setStatusMessage(response?.message || 'Email verifikasi berhasil dikirim ulang.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyMfa = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await completeTwoFactor(mfaCode.trim());
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <section className="auth-page">
        <div className="container auth-layout">
          <aside className="auth-hero-panel">
            <div className="auth-hero-card">
              <div className="auth-hero-icon">
                <ActiveIcon size={22} />
              </div>
              <p className="auth-eyebrow">{modeLabels[activeMode].eyebrow}</p>
              <h1>{modeLabels[activeMode].title}</h1>
              <p>{modeLabels[activeMode].description}</p>
              <ul className="auth-feature-list">
                <li>Buat akun dan aktifkan lewat email verifikasi</li>
                <li>Masuk dengan perlindungan 2FA saat dibutuhkan</li>
                <li>Kelola profil, kontak, dan sesi perangkat</li>
                <li>Akses fitur akun dan keamanan dari satu tempat</li>
              </ul>
              <div className="auth-switches">
                <button type="button" className={activeMode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
                  Login
                </button>
                <button type="button" className={activeMode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
                  Register
                </button>
                <button type="button" className={activeMode === 'verify' ? 'active' : ''} onClick={() => setMode('verify')}>
                  Verify Email
                </button>
              </div>
            </div>
          </aside>

          <div className="auth-surface">
            {pendingChallenge ? (
              <form className="auth-card" onSubmit={handleVerifyMfa}>
                <div className="auth-card-heading">
                  <ShieldCheck size={20} />
                  <div>
                    <h2>Selesaikan 2FA</h2>
                    <p>{challengeLabel}</p>
                  </div>
                </div>
                <label className="field-label">
                  <span>Kode OTP</span>
                  <input
                    value={mfaCode}
                    onChange={(event) => setMfaCode(event.target.value)}
                    placeholder="Masukkan 6 digit kode"
                    required
                  />
                </label>
                <button type="submit" className="auth-submit" disabled={submitting}>
                  {submitting ? 'Memverifikasi...' : 'Verifikasi 2FA'}
                </button>
              </form>
            ) : null}

            {statusMessage ? <div className="auth-banner success">{statusMessage}</div> : null}
            {errorMessage ? <div className="auth-banner error">{errorMessage}</div> : null}

            {activeMode === 'login' ? (
              <form className="auth-card" onSubmit={handleLogin}>
                <div className="auth-card-heading">
                  <KeyRound size={20} />
                  <div>
                    <h2>Masuk</h2>
                    <p>Gunakan kredensial yang sudah diverifikasi untuk mendapatkan sesi aktif baru.</p>
                  </div>
                </div>
                <label className="field-label">
                  <span>Email</span>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label className="field-label">
                  <span>Password</span>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Masukkan password"
                    required
                  />
                </label>
                <button type="submit" className="auth-submit" disabled={submitting}>
                  {submitting ? 'Sedang masuk...' : 'Masuk ke Dashboard'}
                </button>
                <p className="auth-muted">
                  Belum punya akun?{' '}
                  <button type="button" className="inline-link" onClick={() => setMode('register')}>
                    Daftar sekarang
                  </button>
                </p>
              </form>
            ) : null}

            {activeMode === 'register' ? (
              <form className="auth-card" onSubmit={handleRegister}>
                <div className="auth-card-heading">
                  <UserPlus size={20} />
                  <div>
                    <h2>Register pengguna baru</h2>
                    <p>Pilih peran awal BUYER atau SELLER, lalu verifikasi email untuk mengaktifkan akun.</p>
                  </div>
                </div>
                <div className="auth-grid">
                  <label className="field-label">
                    <span>Nama</span>
                    <input
                      value={registerForm.name}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Nama tampilan"
                      required
                    />
                  </label>
                  <label className="field-label">
                    <span>Email</span>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                  <label className="field-label">
                    <span>Peran awal</span>
                    <select
                      value={registerForm.role}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}
                    >
                      <option value="BUYER">BUYER</option>
                      <option value="SELLER">SELLER</option>
                    </select>
                  </label>
                  <label className="field-label">
                    <span>Password</span>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                      placeholder="Buat password"
                      required
                    />
                  </label>
                  <label className="field-label">
                    <span>Konfirmasi password</span>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="Ulangi password"
                      required
                    />
                  </label>
                </div>
                <button type="submit" className="auth-submit" disabled={submitting}>
                  {submitting ? 'Mendaftarkan akun...' : 'Buat akun'}
                </button>
              </form>
            ) : null}

            {activeMode === 'verify' ? (
              <div className="auth-stack">
                <form className="auth-card" onSubmit={handleVerifyEmail}>
                  <div className="auth-card-heading">
                  <MailCheck size={20} />
                  <div>
                    <h2>Verifikasi email</h2>
                    <p>Masukkan token verifikasi untuk mengaktifkan akun Anda.</p>
                  </div>
                </div>
                  <label className="field-label">
                    <span>Token verifikasi</span>
                    <input
                      value={verificationToken}
                      onChange={(event) => setVerificationToken(event.target.value)}
                      placeholder="Tempel token verifikasi"
                      required
                    />
                  </label>
                  <button type="submit" className="auth-submit" disabled={submitting}>
                    {submitting ? 'Memverifikasi...' : 'Verifikasi email'}
                  </button>
                </form>

                <form className="auth-card auth-secondary-card" onSubmit={handleResendVerification}>
                  <div className="auth-card-heading">
                    <MailCheck size={20} />
                    <div>
                      <h2>Kirim ulang email verifikasi</h2>
                      <p>Pakai email akun yang sudah diregistrasikan kalau token sebelumnya sudah tidak berlaku.</p>
                    </div>
                  </div>
                  <label className="field-label">
                    <span>Email akun</span>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(event) => setResendEmail(event.target.value)}
                      placeholder="Email yang butuh verifikasi ulang"
                      required
                    />
                  </label>
                  <button type="submit" className="auth-submit secondary" disabled={submitting}>
                    {submitting ? 'Mengirim ulang...' : 'Kirim ulang'}
                  </button>
                </form>
              </div>
            ) : null}

            <div className="auth-hints">
              <p>
                Setelah berhasil masuk, lanjutkan ke halaman <Link to="/account">Akun</Link> untuk mengelola profil,
                keamanan, dan sesi perangkat Anda.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default AuthPage;
