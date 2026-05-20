import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Clock,
  Gavel,
  Play,
  ShieldCheck,
  Square,
  TrendingUp,
  User,
  Watch,
} from 'lucide-react';
import { auctionApi } from '../api/auctionApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  formatCurrency,
  formatDateTime,
  getCurrentPrice,
  getMinimumBid,
  getStatusLabel,
  getTimeLeft,
} from '../utils/auctionFormatters';
import './AuctionDetail.css';

const AuctionDetail = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [bidderId, setBidderId] = useState('');
  const [maxAutoBid, setMaxAutoBid] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    Promise.all([
      auctionApi.getAuction(auctionId),
      auctionApi.listBids(auctionId),
    ])
      .then(([auctionData, bidData]) => {
        if (!ignore) {
          setAuction(auctionData);
          setBids(Array.isArray(bidData) ? bidData : []);
          setBidAmount(String(getMinimumBid(auctionData)));
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load auction');
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [auctionId]);

  const refreshAfterAction = async (message) => {
    const [auctionData, bidData] = await Promise.all([
      auctionApi.getAuction(auctionId),
      auctionApi.listBids(auctionId),
    ]);

    setAuction(auctionData);
    setBids(Array.isArray(bidData) ? bidData : []);
    setBidAmount(String(getMinimumBid(auctionData)));
    setActionMessage(message);
  };

  const handlePlaceBid = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setActionMessage('');

    try {
      await auctionApi.placeBid(auctionId, {
        bidderName: bidderName.trim(),
        bidderId: bidderId.trim() || null,
        amount: Number(bidAmount),
        maxAutoBid: maxAutoBid ? Number(maxAutoBid) : null,
      });
      setMaxAutoBid('');
      await refreshAfterAction('Bid placed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    setSubmitting(true);
    setError('');
    setActionMessage('');

    try {
      await auctionApi.activateAuction(auctionId);
      await refreshAfterAction('Auction activated.');
    } catch (err) {
      setError(err.message || 'Failed to activate auction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    setSubmitting(true);
    setError('');
    setActionMessage('');

    try {
      await auctionApi.closeAuction(auctionId);
      await refreshAfterAction('Auction closed.');
    } catch (err) {
      setError(err.message || 'Failed to close auction');
    } finally {
      setSubmitting(false);
    }
  };

  const isRunningAuction = auction?.status === 'ACTIVE' || auction?.status === 'EXTENDED';
  const canActivate = auction?.status === 'DRAFT';
  const currentPrice = getCurrentPrice(auction);
  const nextBid = getMinimumBid(auction);

  return (
    <>
      <Navbar />
      <main className="auction-detail-page">
        <section className="container auction-detail-container">
          {loading && <div className="auction-detail-state">Loading auction...</div>}

          {!loading && error && !auction && (
            <div className="auction-detail-state error">
              <h1>Could not load auction</h1>
              <p>{error}</p>
              <Link className="btn-primary" to="/auctions">
                Back to Auctions
              </Link>
            </div>
          )}

          {!loading && auction && (
            <>
              <div className="auction-detail-header">
                <span className={`auction-detail-badge status-${String(auction.status).toLowerCase()}`}>
                  <span className="auction-detail-badge-dot"></span>
                  {getStatusLabel(auction.status)}
                </span>
                <h1>{auction.title}</h1>
                <p>by {auction.sellerId || 'System seller'}</p>
              </div>

              <div className="auction-detail-layout">
                <div className="auction-detail-left">
                  <div className="auction-detail-image-card">
                    <div className="auction-detail-image-placeholder">
                      <Watch size={64} strokeWidth={1.5} />
                      <span>{auction.listingId || 'Auction Item'}</span>
                    </div>
                  </div>

                  <div className="auction-info-card">
                    <div className="auction-card-heading">
                      <ShieldCheck size={20} />
                      <h2>Auction Information</h2>
                    </div>
                    <p className="auction-description">
                      {auction.description || 'No description provided.'}
                    </p>

                    <div className="auction-info-grid">
                      <div>
                        <span>Starting Price</span>
                        <strong>{formatCurrency(auction.startPrice)}</strong>
                      </div>
                      <div>
                        <span>Reserve Price</span>
                        <strong>{auction.reservePrice ? formatCurrency(auction.reservePrice) : '-'}</strong>
                      </div>
                      <div>
                        <span>Minimum Increment</span>
                        <strong>{formatCurrency(auction.minIncrement)}</strong>
                      </div>
                      <div>
                        <span>Ends On</span>
                        <strong>{formatDateTime(auction.endAt)}</strong>
                      </div>
                      <div>
                        <span>Listing ID</span>
                        <strong>{auction.listingId || '-'}</strong>
                      </div>
                      <div>
                        <span>Winner</span>
                        <strong>{auction.winnerBidderName || auction.winnerBidderId || '-'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="auction-bid-panel">
                  <div className="auction-status-row">
                    <span className="auction-status-pill">{getStatusLabel(auction.status)}</span>
                    <span className="auction-time-left">
                      <Clock size={16} />
                      {getTimeLeft(auction.endAt)}
                    </span>
                  </div>

                  <div className="auction-price-block">
                    <p>Current Highest Bid</p>
                    <h2>{formatCurrency(currentPrice)}</h2>
                  </div>

                  <div className="auction-bid-meta">
                    <div>
                      <span>Minimum Increment</span>
                      <strong>{formatCurrency(auction.minIncrement)}</strong>
                    </div>
                    <div>
                      <span>Next Valid Bid</span>
                      <strong>{formatCurrency(nextBid)}</strong>
                    </div>
                  </div>

                  {error && <div className="auction-action-message error">{error}</div>}
                  {actionMessage && <div className="auction-action-message success">{actionMessage}</div>}

                  {isRunningAuction ? (
                    <form onSubmit={handlePlaceBid}>
                      <label className="bid-input-label" htmlFor="bidderName">
                        Bidder Name
                      </label>
                      <div className="bid-input-wrap">
                        <User size={18} />
                        <input
                          id="bidderName"
                          required
                          type="text"
                          value={bidderName}
                          onChange={(event) => setBidderName(event.target.value)}
                          placeholder="Your display name"
                        />
                      </div>

                      <label className="bid-input-label" htmlFor="bidderId">
                        Bidder ID
                      </label>
                      <div className="bid-input-wrap">
                        <span>ID</span>
                        <input
                          id="bidderId"
                          type="text"
                          value={bidderId}
                          onChange={(event) => setBidderId(event.target.value)}
                          placeholder="Optional"
                        />
                      </div>

                      <label className="bid-input-label" htmlFor="bidAmount">
                        Your Bid
                      </label>
                      <div className="bid-input-wrap">
                        <span>Rp</span>
                        <input
                          id="bidAmount"
                          required
                          type="number"
                          min={nextBid}
                          step={auction.minIncrement}
                          value={bidAmount}
                          onChange={(event) => setBidAmount(event.target.value)}
                        />
                      </div>

                      <label className="bid-input-label" htmlFor="maxAutoBid">
                        Max Auto Bid
                      </label>
                      <div className="bid-input-wrap">
                        <span>Rp</span>
                        <input
                          id="maxAutoBid"
                          type="number"
                          min={bidAmount || nextBid}
                          step={auction.minIncrement}
                          value={maxAutoBid}
                          onChange={(event) => setMaxAutoBid(event.target.value)}
                          placeholder="Optional"
                        />
                      </div>

                      <button
                        className="btn-primary auction-place-bid"
                        type="submit"
                        disabled={submitting}
                      >
                        <Gavel size={18} />
                        {submitting ? 'Submitting...' : 'Place Bid'}
                      </button>
                    </form>
                  ) : (
                    <div className="auction-unavailable-note">
                      Bidding is available only when auction status is ACTIVE or EXTENDED.
                    </div>
                  )}

                  {canActivate && (
                    <button
                      className="btn-primary auction-place-bid auction-admin-action"
                      type="button"
                      onClick={handleActivate}
                      disabled={submitting}
                    >
                      <Play size={18} />
                      Activate Auction
                    </button>
                  )}

                  {isRunningAuction && (
                    <button
                      className="btn-outline auction-secondary-action"
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                    >
                      <Square size={16} />
                      Close Auction
                    </button>
                  )}

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
                  {bids.length === 0 && <p className="bid-history-empty">No bids yet.</p>}

                  {bids.map((bid) => (
                    <div className="bid-history-item" key={bid.id}>
                      <div className="bidder-info">
                        <div className="bidder-avatar">
                          <User size={18} />
                        </div>
                        <div>
                          <h3>{bid.bidderName}</h3>
                          <p>{formatDateTime(bid.acceptedAt || bid.createdAt)}</p>
                        </div>
                      </div>
                      <div className="bid-history-amount">
                        <strong>{formatCurrency(bid.amount)}</strong>
                        <span className={`bid-status bid-status-${String(bid.status).toLowerCase()}`}>
                          {getStatusLabel(bid.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AuctionDetail;
