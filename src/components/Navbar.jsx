import { useEffect, useState } from 'react';
import {
  Bell,
  Gavel,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAnyAuthority, isAuthenticated, logout, profile } = useAuth();
  const isLandingPage = location.pathname === '/';
  const canManageAdmin = hasAnyAuthority(['rbac:manage', 'user:deactivate']);
  const canCreateAuction = hasAnyAuthority(['auction:create']);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <Link to="/" className="navbar-logo">
          <Gavel className="logo-icon" size={28} strokeWidth={2.5} />
          <span>BidMart</span>
        </Link>

        <div className="navbar-search d-none-mobile">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for auctions, listings, or sellers..."
          />
        </div>

        <div className="navbar-actions">
          {isLandingPage ? (
            <>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
                  <Link to="/account" className="btn-primary">Account</Link>
                </>
              ) : (
                <>
                  <Link to="/auth?mode=login" className="btn-ghost">Login</Link>
                  <Link to="/auth?mode=register" className="btn-primary">Register</Link>
                </>
              )}
            </>
          ) : (
            <>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
                  <Link to="/catalog" className="btn-ghost">Catalog</Link>
                  <Link to="/auctions" className="btn-ghost">Auctions</Link>
                  <Link to="/orders" className="btn-ghost">Orders</Link>
                  <Link to="/wallet" className="btn-ghost navbar-inline-icon">
                    <Wallet size={18} /> Wallet
                  </Link>
                  <Link to="/notifications" className="btn-ghost navbar-inline-icon">
                    <Bell size={18} /> Notifications
                  </Link>
                  <Link to="/account" className="btn-ghost navbar-inline-icon">
                    <Settings size={18} /> {profile?.name || 'Account'}
                  </Link>
                  {canManageAdmin ? (
                    <Link to="/admin/auth" className="btn-ghost navbar-inline-icon">
                      <ShieldCheck size={18} /> Admin Auth
                    </Link>
                  ) : null}
                  {canCreateAuction ? (
                    <>
                      <Link to="/catalog/new" className="btn-ghost navbar-inline-icon">
                        <Plus size={18} /> Add Listing
                      </Link>
                      <Link to="/sell" className="btn-primary navbar-inline-icon">
                        <Plus size={18} /> Add Auction
                      </Link>
                    </>
                  ) : null}
                  <button type="button" className="btn-ghost navbar-logout navbar-inline-icon" onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/catalog" className="btn-ghost">Catalog</Link>
                  <Link to="/auctions" className="btn-ghost">Auctions</Link>
                  <Link to="/auth?mode=login" className="btn-ghost">Login</Link>
                  <Link to="/auth?mode=register" className="btn-primary">Register</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
