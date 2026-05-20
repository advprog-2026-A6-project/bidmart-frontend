import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';

const ProtectedRoute = ({ children, requiredAuthority, requiredAnyAuthority = [] }) => {
  const location = useLocation();
  const { hasAnyAuthority, hasAuthority, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="page-wrapper">
        <main className="page-main">
          <section className="container">
            <div className="empty-panel">
              <h2>Menyiapkan sesi Anda...</h2>
              <p>Kami sedang memverifikasi akses supaya halaman ini tampil dengan benar.</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (status !== 'authenticated') {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (requiredAuthority && !hasAuthority(requiredAuthority)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredAnyAuthority.length > 0 && !hasAnyAuthority(requiredAnyAuthority)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
