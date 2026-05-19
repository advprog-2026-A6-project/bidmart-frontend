import React, { useState, useEffect } from 'react';
import { Gavel, Search } from 'lucide-react';
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

        <div className="navbar-actions">
          {isLandingPage ? (
            <>
              <Link to="/dashboard" className="btn-ghost">Login</Link>
              <Link to="/dashboard" className="btn-primary">Register</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
              <Link to="/wallet" className="btn-primary">My Wallet</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
