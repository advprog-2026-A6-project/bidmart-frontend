import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './HeroSection.css';
import heroBg from '../assets/hero_bg_bidmart.png';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div 
        className="hero-bg" 
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">Premier Auction House</div>
          <h1 className="hero-title">
            Discover & Bid on <span>Exclusive</span> Items
          </h1>
          <p className="hero-description">
            Experience the thrill of real-time bidding. From vintage luxury watches to exclusive modern sports cars, find your next prized possession on BidMart.
          </p>
          <div className="hero-buttons">
            <Link to="/explore" className="btn-primary btn-large" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Start Bidding <ArrowRight size={20} />
            </Link>
            <Link to="/sell" className="btn-outline btn-large">
              Sell an Item
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <h4>12K+</h4>
              <p>Active Auctions</p>
            </div>
            <div className="stat-item">
              <h4>$50M+</h4>
              <p>Total Volume</p>
            </div>
            <div className="stat-item">
              <h4>98%</h4>
              <p>Secure Transactions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
