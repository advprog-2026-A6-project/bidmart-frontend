import { Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Gavel className="logo-icon" size={24} />
              <span>BidMart</span>
            </Link>
            <p className="footer-desc">
              The premier destination for high-end, exclusive auctions. Discover, bid, and win extraordinary items in real-time.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Explore</h4>
            <ul className="footer-links">
              <li><Link to="/auctions">All Auctions</Link></li>
              <li><Link to="/auctions">Luxury Watches</Link></li>
              <li><Link to="/auctions">Exotic Vehicles</Link></li>
              <li><Link to="/auctions">Fine Art</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/how-it-works">How it Works</Link></li>
              <li><Link to="/trust-safety">Trust & Safety</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul className="footer-links">
              <li><Link to="/auth?mode=login">Log In</Link></li>
              <li><Link to="/auth?mode=register">Sign Up</Link></li>
              <li><Link to="/account">Account Settings</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} BidMart, Inc. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
