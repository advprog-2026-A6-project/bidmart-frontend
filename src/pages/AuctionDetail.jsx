import { useState } from 'react';
import {
  Clock,
  Gavel,
  ShieldCheck,
  TrendingUp,
  User,
  Watch
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './AuctionDetail.css';

const mockAuction = {
  id: 1,
  title: 'Patek Philippe Nautilus 5711',
  seller: 'LuxuryTimepieces',
  description:
    'A rare and highly sought-after luxury watch with exceptional craftsmanship and collector value.',
  currentBid: 124000,
  minimumIncrement: 1000,
  timeLeft: '02:14:30',
  status: 'ACTIVE',
  image: null,
  startingPrice: 100000,
  reservePrice: 120000,
  endTime: '2026-05-18T20:00:00',
};

const mockBidHistory = [
  {
    id: 1,
    bidder: 'collector_01',
    amount: 124000,
    time: '2 minutes ago',
    status: 'WINNING',
  },
  {
    id: 2,
    bidder: 'watchhunter',
    amount: 123000,
    time: '8 minutes ago',
    status: 'OUTBID',
  },
  {
    id: 3,
    bidder: 'luxbuyer',
    amount: 121500,
    time: '15 minutes ago',
    status: 'OUTBID',
  },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const AuctionDetail = () => {
  const nextBid = mockAuction.currentBid + mockAuction.minimumIncrement;
  const [bidAmount, setBidAmount] = useState(nextBid);

  return (
    <>
      <Navbar />
      <main className="auction-detail-page">
        <section className="container auction-detail-container">
          <div className="auction-detail-header">
            <span className="auction-detail-badge">
              <span className="auction-detail-badge-dot"></span>
              Live Auction
            </span>
            <h1>{mockAuction.title}</h1>
            <p>by @{mockAuction.seller}</p>
          </div>

          <div className="auction-detail-layout">
            <div className="auction-detail-left">
              <div className="auction-detail-image-card">
                {mockAuction.image ? (
                  <img src={mockAuction.image} alt={mockAuction.title} />
                ) : (
                  <div className="auction-detail-image-placeholder">
                    <Watch size={64} strokeWidth={1.5} />
                    <span>Collector Timepiece</span>
                  </div>
                )}
              </div>

              <div className="auction-info-card">
                <div className="auction-card-heading">
                  <ShieldCheck size={20} />
                  <h2>Auction Information</h2>
                </div>
                <p className="auction-description">{mockAuction.description}</p>

                <div className="auction-info-grid">
                  <div>
                    <span>Starting Price</span>
                    <strong>{currencyFormatter.format(mockAuction.startingPrice)}</strong>
                  </div>
                  <div>
                    <span>Reserve Price</span>
                    <strong>{currencyFormatter.format(mockAuction.reservePrice)}</strong>
                  </div>
                  <div>
                    <span>Minimum Increment</span>
                    <strong>{currencyFormatter.format(mockAuction.minimumIncrement)}</strong>
                  </div>
                  <div>
                    <span>Ends On</span>
                    <strong>{dateFormatter.format(new Date(mockAuction.endTime))}</strong>
                  </div>
                </div>
              </div>
            </div>

            <aside className="auction-bid-panel">
              <div className="auction-status-row">
                <span className="auction-status-pill">{mockAuction.status}</span>
                <span className="auction-time-left">
                  <Clock size={16} />
                  {mockAuction.timeLeft}
                </span>
              </div>

              <div className="auction-price-block">
                <p>Current Highest Bid</p>
                <h2>{currencyFormatter.format(mockAuction.currentBid)}</h2>
              </div>

              <div className="auction-bid-meta">
                <div>
                  <span>Minimum Increment</span>
                  <strong>{currencyFormatter.format(mockAuction.minimumIncrement)}</strong>
                </div>
                <div>
                  <span>Next Valid Bid</span>
                  <strong>{currencyFormatter.format(nextBid)}</strong>
                </div>
              </div>

              <label className="bid-input-label" htmlFor="bidAmount">
                Your Bid
              </label>
              <div className="bid-input-wrap">
                <span>$</span>
                <input
                  id="bidAmount"
                  type="number"
                  min={nextBid}
                  step={mockAuction.minimumIncrement}
                  value={bidAmount}
                  onChange={(event) => setBidAmount(event.target.value)}
                />
              </div>

              <button className="btn-primary auction-place-bid" type="button">
                <Gavel size={18} />
                Place Bid
              </button>
              <button className="btn-outline auction-secondary-action" type="button">
                Watch Auction
              </button>

              <div className="auction-trust-note">
                <ShieldCheck size={18} />
                <span>Verified seller and secure bidding protected by BidMart.</span>
              </div>
            </aside>
          </div>

          <section className="bid-history-card">
            <div className="auction-card-heading">
              <TrendingUp size={20} />
              <h2>Bid History</h2>
            </div>

            <div className="bid-history-list">
              {mockBidHistory.map((bid) => (
                <div className="bid-history-item" key={bid.id}>
                  <div className="bidder-info">
                    <div className="bidder-avatar">
                      <User size={18} />
                    </div>
                    <div>
                      <h3>@{bid.bidder}</h3>
                      <p>{bid.time}</p>
                    </div>
                  </div>
                  <div className="bid-history-amount">
                    <strong>{currencyFormatter.format(bid.amount)}</strong>
                    <span className={`bid-status bid-status-${bid.status.toLowerCase()}`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AuctionDetail;
