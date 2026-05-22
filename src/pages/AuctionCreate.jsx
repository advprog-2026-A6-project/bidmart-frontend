import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Gavel, Play, Plus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auctionApi } from '../api/auctionApi';
import { catalogApi } from '../api/catalogApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/useAuth';
import { formatCurrency } from '../utils/auctionFormatters';
import { getCurrentUserId } from '../utils/catalogPermissions';
import './AuctionCreate.css';

const initialForm = {
  listingId: '',
  startPrice: '',
  minIncrement: '',
  reservePrice: '',
  durationMinutes: '1440',
  activateNow: true,
};

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  return Number(value);
};

const AuctionCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, session } = useAuth();
  const sellerId = getCurrentUserId(session, profile);
  const [form, setForm] = useState({
    ...initialForm,
    listingId: searchParams.get('listingId') || '',
  });
  const [myListings, setMyListings] = useState([]);
  const [linkedListing, setLinkedListing] = useState(null);
  const [loadingListings, setLoadingListings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const listingOptions = useMemo(
    () =>
      myListings.filter((listing) => {
        const status = String(listing.status || '').toUpperCase();
        return status === 'ACTIVE' || status === '';
      }),
    [myListings],
  );

  useEffect(() => {
    if (!sellerId) {
      setMyListings([]);
      setLoadingListings(false);
      return undefined;
    }

    let ignore = false;
    setLoadingListings(true);

    catalogApi
      .listMyListings(sellerId)
      .then((listings) => {
        if (!ignore) {
          setMyListings(Array.isArray(listings) ? listings : []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load your listings');
          setMyListings([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingListings(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [sellerId]);

  useEffect(() => {
    const listingId = form.listingId;
    if (!listingId) {
      setLinkedListing(null);
      return undefined;
    }

    const fromMine = listingOptions.find((listing) => String(listing.id) === String(listingId));
    if (fromMine) {
      setLinkedListing(fromMine);
      setForm((current) => ({
        ...current,
        startPrice: current.startPrice || String(fromMine.startingPrice || ''),
        reservePrice: current.reservePrice || String(fromMine.reservePrice || ''),
      }));
      return undefined;
    }

    let ignore = false;

    catalogApi
      .getListing(listingId)
      .then((listing) => {
        if (!ignore) {
          setLinkedListing(listing);
          setForm((current) => ({
            ...current,
            startPrice: current.startPrice || String(listing.startingPrice || ''),
            reservePrice: current.reservePrice || String(listing.reservePrice || ''),
          }));
        }
      })
      .catch(() => {
        if (!ignore) {
          setLinkedListing(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [form.listingId, listingOptions]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!form.listingId.trim()) {
        throw new Error('Select one of your catalog listings before creating an auction.');
      }

      if (!linkedListing) {
        throw new Error('Selected listing could not be loaded. Pick another listing or refresh.');
      }

      const payload = {
        listingId: form.listingId.trim(),
        startPrice: Number(form.startPrice),
        minIncrement: Number(form.minIncrement),
        reservePrice: toNumberOrNull(form.reservePrice),
        durationMinutes: Number(form.durationMinutes),
      };

      const createdAuction = await auctionApi.createAuction(payload);
      const finalAuction = form.activateNow
        ? await auctionApi.activateAuction(createdAuction.id)
        : createdAuction;

      navigate(`/auctions/${finalAuction.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create auction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auction-create-page">
        <section className="container auction-create-container">
          <div className="auction-create-header">
            <span className="auction-create-eyebrow">Seller Console</span>
            <h1>Start Auction</h1>
            <p>
              Pick a catalog listing you own, then set auction pricing rules. Title and description come from the listing.
            </p>
          </div>

          <form className="auction-create-form" onSubmit={handleSubmit}>
            <div className="auction-form-main">
              <div className="auction-form-section">
                <div className="auction-form-heading">
                  <Gavel size={20} />
                  <h2>Catalog Listing</h2>
                </div>

                {!sellerId ? (
                  <p className="auction-form-hint">Sign in as a seller to load your listings.</p>
                ) : null}

                <label className="auction-field">
                  <span>Your listing</span>
                  <select
                    required
                    disabled={loadingListings || !sellerId}
                    value={form.listingId}
                    onChange={(event) => updateField('listingId', event.target.value)}
                  >
                    <option value="">
                      {loadingListings ? 'Loading listings...' : 'Select a listing'}
                    </option>
                    {listingOptions.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.title}
                      </option>
                    ))}
                  </select>
                </label>

                {linkedListing ? (
                  <div className="auction-linked-listing auction-linked-listing-inline">
                    <span>Selected</span>
                    <strong>{linkedListing.title}</strong>
                    <small>{linkedListing.description}</small>
                    <small>{formatCurrency(linkedListing.startingPrice)} catalog starting price</small>
                  </div>
                ) : null}

                {!loadingListings && sellerId && listingOptions.length === 0 ? (
                  <p className="auction-form-hint">
                    You have no active listings yet.{' '}
                    <Link to="/catalog/new">Create a listing</Link> first, then return here.
                  </p>
                ) : null}
              </div>

              <div className="auction-form-section">
                <div className="auction-form-heading">
                  <CheckCircle2 size={20} />
                  <h2>Pricing Rules</h2>
                </div>

                <div className="auction-field-grid">
                  <label className="auction-field">
                    <span>Start Price</span>
                    <input
                      required
                      min="1"
                      step="1"
                      type="number"
                      value={form.startPrice}
                      onChange={(event) => updateField('startPrice', event.target.value)}
                    />
                  </label>

                  <label className="auction-field">
                    <span>Minimum Increment</span>
                    <input
                      required
                      min="1"
                      step="1"
                      type="number"
                      value={form.minIncrement}
                      onChange={(event) => updateField('minIncrement', event.target.value)}
                    />
                  </label>

                  <label className="auction-field">
                    <span>Reserve Price</span>
                    <input
                      min="1"
                      step="1"
                      type="number"
                      value={form.reservePrice}
                      onChange={(event) => updateField('reservePrice', event.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <label className="auction-field">
                    <span>Duration Minutes</span>
                    <input
                      required
                      min="1"
                      step="1"
                      type="number"
                      value={form.durationMinutes}
                      onChange={(event) => updateField('durationMinutes', event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <aside className="auction-submit-panel">
              <h2>Publish</h2>
              <p>Backend creates auctions as drafts. Turn on activation to make bidding available now.</p>

              <label className="auction-toggle">
                <input
                  type="checkbox"
                  checked={form.activateNow}
                  onChange={(event) => updateField('activateNow', event.target.checked)}
                />
                <span>
                  <Play size={16} />
                  Activate after create
                </span>
              </label>

              {error && <div className="auction-form-error">{error}</div>}

              <button
                className="btn-primary auction-submit-button"
                type="submit"
                disabled={submitting || !form.listingId || loadingListings}
              >
                <Plus size={18} />
                {submitting ? 'Saving...' : 'Create Auction'}
              </button>

              <Link className="btn-outline auction-cancel-button" to="/catalog">
                Back to catalog
              </Link>
            </aside>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AuctionCreate;
