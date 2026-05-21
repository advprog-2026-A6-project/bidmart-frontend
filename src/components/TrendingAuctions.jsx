import { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auctionApi } from '../api/auctionApi';
import { catalogApi } from '../api/catalogApi';
import {
  formatCurrency,
  getCurrentPrice,
  getStatusLabel,
  getTimeLeft,
} from '../utils/auctionFormatters';
import {
  getAuctionImageUrl,
  getAuctionSellerName,
  getAuctionTitle,
  hydrateAuctionsWithListings,
} from '../utils/auctionListing';
import './TrendingAuctions.css';

import item1 from '../assets/auction_item_1.png';
import item2 from '../assets/auction_item_2.png';
import item3 from '../assets/auction_item_3.png';

const cardImages = [item1, item2, item3];

const TrendingAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTrendingAuctions = async () => {
      try {
        const data = await auctionApi.listAuctions();
        const hydratedAuctions = await hydrateAuctionsWithListings(data, catalogApi.getListing);
        setAuctions(
          hydratedAuctions
            .filter((auction) => auction.status === 'ACTIVE' || auction.status === 'EXTENDED')
            .slice(0, 3)
        );
      } catch (err) {
        setError(err.message || 'Failed to load auctions');
      } finally {
        setLoading(false);
      }
    };

    loadTrendingAuctions();
  }, []);

  return (
    <section className="trending-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Auctions</h2>
            <p className="section-subtitle">The most active and highly sought-after items right now.</p>
          </div>
          <Link to="/auctions" className="view-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        {loading && <div className="trending-state">Loading auctions...</div>}

        {!loading && error && (
          <div className="trending-state error">
            Auction service is unavailable: {error}
          </div>
        )}

        {!loading && !error && auctions.length === 0 && (
          <div className="trending-state">No active auctions yet.</div>
        )}

        {!loading && !error && auctions.length > 0 && (
          <div className="auction-grid">
            {auctions.map((auction, index) => (
              <Link key={auction.id} to={`/auctions/${auction.id}`} className="auction-card">
                <div
                  className="card-image"
                  style={{
                    backgroundImage: `url(${getAuctionImageUrl(auction) || cardImages[index % cardImages.length]})`,
                  }}
                >
                  <div className="live-badge">
                    <div className="dot"></div> {getStatusLabel(auction.status)}
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="item-title">{getAuctionTitle(auction)}</h3>
                  <p className="item-creator">by {getAuctionSellerName(auction)}</p>

                  <div className="card-footer">
                    <div className="current-bid">
                      <p>Current Bid</p>
                      <h5>{formatCurrency(getCurrentPrice(auction))}</h5>
                    </div>
                    <div className="time-left">
                      <Clock size={16} />
                      {getTimeLeft(auction.endAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingAuctions;
