import { useState, useEffect } from 'react';
import { Gavel, Search, Bell, Package, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            placeholder="Search for luxury watches, cars, art..." 
          />
        </div>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isLandingPage ? (
            <>
              <Link to="/dashboard" className="btn-ghost">Login</Link>
              <Link to="/dashboard" className="btn-primary">Register</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
              <Link to="/catalog" className="btn-ghost">Catalog</Link>
              <Link to="/auctions" className="btn-ghost">Auctions</Link>
              <Link to="/orders" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Package size={18} /> Orders
              </Link>
              <Link to="/notifications" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Bell size={18} /> Notifications
              </Link>
              <Link to="/wallet" className="btn-ghost">Wallet</Link>
              <Link to="/catalog/new" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={18} /> Add Listing
              </Link>
              <Link to="/sell" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={18} /> Add Auction
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
