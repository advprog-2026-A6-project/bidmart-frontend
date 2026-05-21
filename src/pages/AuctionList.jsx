import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock, Gavel, Plus, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auctionApi } from '../api/auctionApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/useAuth';
import {
  formatCurrency,
  getCurrentPrice,
  getStatusLabel,
  getTimeLeft,
} from '../utils/auctionFormatters';
import './AuctionList.css';

const statusOptions = ['ALL', 'ACTIVE', 'DRAFT', 'EXTENDED', 'WON', 'UNSOLD', 'CLOSED'];

const AuctionList = () => {
  const { hasAnyAuthority } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const canCreateAuction = hasAnyAuthority(['auction:create']);

  const loadAuctions = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await auctionApi.listAuctions();
      setAuctions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    auctionApi
      .listAuctions()
      .then((data) => {
        if (!ignore) {
          setAuctions(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load auctions');
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
  }, []);

  const filteredAuctions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return auctions.filter((auction) => {
      const matchesStatus = statusFilter === 'ALL' || auction.status === statusFilter;
      const searchableText = [
        auction.title,
        auction.description,
        auction.sellerId,
        auction.listingId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [auctions, query, statusFilter]);

  return (
    <>
      <Navbar />
      <main className="auction-list-page">
        <section className="container auction-list-container">
          <div className="auction-list-header">
            <div>
              <span className="auction-list-eyebrow">Auction Marketplace</span>
              <h1>All Auctions</h1>
              <p>Browse live, draft, and completed auctions from the auction service.</p>
            </div>

            <div className="auction-list-actions">
              <button className="btn-outline auction-refresh-button" type="button" onClick={loadAuctions}>
                <RefreshCw size={18} />
                Refresh
              </button>
              {canCreateAuction ? (
                <Link className="btn-primary auction-create-link" to="/sell">
                  <Plus size={18} />
                  Add Auction
                </Link>
              ) : null}
            </div>
          </div>

          <div className="auction-toolbar">
            <div className="auction-search-field">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search auctions, sellers, or listings"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="auction-status-tabs" aria-label="Filter auctions by status">
              {statusOptions.map((status) => (
                <button
                  className={statusFilter === status ? 'active' : ''}
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="auction-state-card">Loading auctions...</div>}

          {!loading && error && (
            <div className="auction-state-card error">
              <h2>Could not load auctions</h2>
              <p>{error}</p>
              <button className="btn-primary" type="button" onClick={loadAuctions}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filteredAuctions.length === 0 && (
            <div className="auction-state-card">
              <Gavel size={34} />
              <h2>No auctions found</h2>
              <p>Create a new auction or adjust the filters.</p>
              {canCreateAuction ? (
                <Link className="btn-primary auction-create-link" to="/sell">
                  <Plus size={18} />
                  Add Auction
                </Link>
              ) : null}
            </div>
          )}

          {!loading && !error && filteredAuctions.length > 0 && (
            <div className="auction-list-grid">
              {filteredAuctions.map((auction) => (
                <Link className="auction-list-card" key={auction.id} to={`/auctions/${auction.id}`}>
                  <div className="auction-card-visual">
                    <Gavel size={48} strokeWidth={1.7} />
                    <span className={`auction-status-chip status-${String(auction.status).toLowerCase()}`}>
                      {getStatusLabel(auction.status)}
                    </span>
                  </div>

                  <div className="auction-list-card-body">
                    <div>
                      <h2>{auction.title}</h2>
                      <p>{auction.description || 'No description provided.'}</p>
                    </div>

                    <div className="auction-list-meta">
                      <div>
                        <span>Current Price</span>
                        <strong>{formatCurrency(getCurrentPrice(auction))}</strong>
                      </div>
                      <div>
                        <span>Seller</span>
                        <strong>{auction.sellerId || 'System seller'}</strong>
                      </div>
                    </div>

                    <div className="auction-list-footer">
                      <span>
                        <Clock size={16} />
                        {getTimeLeft(auction.endAt)}
                      </span>
                      <span>
                        Details <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AuctionList;
