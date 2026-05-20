import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Activity, Trophy, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-container container">
        <div className="dashboard-header">
          <h1>Welcome back, User!</h1>
          <p>Here's a quick overview of your auction activities today.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-effect">
            <div className="stat-icon-wrapper bg-blue-light">
              <Activity className="stat-icon text-blue" size={28} />
            </div>
            <div className="stat-info">
              <h3>2</h3>
              <p>Active Bids</p>
            </div>
          </div>
          <div className="stat-card glass-effect">
            <div className="stat-icon-wrapper bg-gold-light">
              <Trophy className="stat-icon text-gold" size={28} />
            </div>
            <div className="stat-info">
              <h3>5</h3>
              <p>Auctions Won</p>
            </div>
          </div>
          <div className="stat-card glass-effect">
            <div className="stat-icon-wrapper bg-red-light">
              <Heart className="stat-icon text-red" size={28} />
            </div>
            <div className="stat-info">
              <h3>12</h3>
              <p>Watchlist Items</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-main">
            <div className="section-title">
              <h2>Your Active Bids</h2>
              <Link to="/auctions" className="view-all">View All <ArrowRight size={16} /></Link>
            </div>
            
            <div className="bid-list">
              <div className="bid-item glass-effect">
                <div className="bid-image placeholder-img"></div>
                <div className="bid-details">
                  <h4>Rolex Submariner Date</h4>
                  <p className="bid-amount">Current Highest Bid: <strong>Rp 150,000,000</strong></p>
                  <p className="status leading">
                    <span className="dot dot-green"></span> You are the highest bidder!
                  </p>
                </div>
                <div className="bid-time">
                  <span className="time-left">Ends in 2h 45m</span>
                  <Link to="/auctions/1" className="btn-ghost small">View Details</Link>
                </div>
              </div>

              <div className="bid-item glass-effect">
                <div className="bid-image placeholder-img-2"></div>
                <div className="bid-details">
                  <h4>Porsche 911 GT3 RS (1:18)</h4>
                  <p className="bid-amount">Current Highest Bid: <strong>Rp 4,500,000</strong></p>
                  <p className="status outbid">
                    <span className="dot dot-red"></span> You have been outbid.
                  </p>
                </div>
                <div className="bid-time bid-actions-col">
                   <span className="time-left">Ends in 5h 10m</span>
                  <button className="btn-primary small">Place Higher Bid</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-sidebar">
             <div className="wallet-summary glass-effect">
                <h3>Wallet Summary</h3>
                <div className="summary-balance">
                  <p>Available Balance</p>
                  <h2>Rp 3,800,000</h2>
                </div>
                <Link to="/wallet" className="btn-primary full-width">Go to Wallet</Link>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
