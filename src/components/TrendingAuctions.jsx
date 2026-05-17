import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TrendingAuctions.css';

import item1 from '../assets/auction_item_1.png';
import item2 from '../assets/auction_item_2.png';
import item3 from '../assets/auction_item_3.png';

const mockAuctions = [
  {
    id: 1,
    title: 'Patek Philippe Nautilus 5711',
    creator: 'LuxuryTimepieces',
    currentBid: '$124,000',
    timeLeft: '02:14:30',
    image: item1
  },
  {
    id: 2,
    title: 'Porsche 911 GT3 RS Prototype',
    creator: 'ExoticMotors',
    currentBid: '$385,000',
    timeLeft: '05:42:10',
    image: item2
  },
  {
    id: 3,
    title: '1933 Double Eagle Gold Coin',
    creator: 'HeritageVault',
    currentBid: '$89,500',
    timeLeft: '12:05:00',
    image: item3
  }
];

const TrendingAuctions = () => {
  return (
    <section className="trending-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Auctions</h2>
            <p className="section-subtitle">The most active and highly sought-after items right now.</p>
          </div>
          <Link to="/explore" className="view-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="auction-grid">
          {mockAuctions.map((auction) => (
            <Link key={auction.id} to={`/auctions/${auction.id}`} className="auction-card">
              <div 
                className="card-image" 
                style={{ backgroundImage: `url(${auction.image})` }}
              >
                <div className="live-badge">
                  <div className="dot"></div> LIVE
                </div>
              </div>
              <div className="card-content">
                <h3 className="item-title">{auction.title}</h3>
                <p className="item-creator">by @{auction.creator}</p>
                
                <div className="card-footer">
                  <div className="current-bid">
                    <p>Current Bid</p>
                    <h5>{auction.currentBid}</h5>
                  </div>
                  <div className="time-left">
                    <Clock size={16} />
                    {auction.timeLeft}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingAuctions;
