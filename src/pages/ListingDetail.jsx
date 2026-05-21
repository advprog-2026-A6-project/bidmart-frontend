import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Gavel,
  Image,
  Pencil,
  Shield,
  Tag,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from '../api/catalogApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/useAuth';
import {
  formatCurrency,
  formatDateTime,
  getDisplayPrice,
  getListingStatusLabel,
} from '../utils/catalogFormatters';
import '../styles/catalogPage.css';
import './ListingDetail.css';

const ListingDetail = () => {
  const { hasAnyAuthority } = useAuth();
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const canCreateAuction = hasAnyAuthority(['auction:create']);

  const loadListing = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await catalogApi.getListing(listingId);
      setListing(data);
      setEditForm({
        description: data.description || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadListing();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadListing]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await catalogApi.updateListing(listingId, {
        description: editForm.description.trim(),
        imageUrl: editForm.imageUrl.trim(),
      });
      setMessage('Listing updated successfully.');
      await loadListing();
    } catch (err) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm('Cancel this listing? This cannot be undone if bids exist.');
    if (!confirmed) return;

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await catalogApi.cancelListing(listingId);
      setMessage('Listing cancelled successfully.');
      await loadListing();
    } catch (err) {
      setError(err.message || 'Failed to cancel listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this listing permanently?');
    if (!confirmed) return;

    setSubmitting(true);
    setError('');

    try {
      await catalogApi.deleteListing(listingId);
      navigate('/catalog');
    } catch (err) {
      setError(err.message || 'Failed to delete listing');
      setSubmitting(false);
    }
  };

  const canEdit = listing?.status === 'ACTIVE';
  const canCancel = listing?.status === 'ACTIVE';
  const sellerDisplayName = listing?.sellerName || listing?.sellerId || 'Unknown';
  const categoryDisplayName = listing?.categoryName || listing?.category?.name || 'Uncategorized';

  return (
    <>
      <Navbar />
      <main className="catalog-page">
        <section className="container catalog-container listing-detail-container">
          <Link className="listing-back-link" to="/catalog">
            <ArrowLeft size={18} />
            Back to catalog
          </Link>

          {loading && <div className="catalog-state-card">Loading listing...</div>}

          {!loading && error && !listing && (
            <div className="catalog-state-card error">
              <h2>Could not load listing</h2>
              <p>{error}</p>
              <button className="btn-primary" type="button" onClick={loadListing}>
                Try Again
              </button>
            </div>
          )}

          {!loading && listing && (
            <>
              <div className="listing-detail-header">
                <div>
                  <span className="catalog-eyebrow">Listing Detail</span>
                  <h1>{listing.title}</h1>
                  <p>{listing.description}</p>
                </div>
                <span className={`catalog-status-chip status-${String(listing.status).toLowerCase()}`}>
                  {getListingStatusLabel(listing.status)}
                </span>
              </div>

              {message && <div className="catalog-form-success">{message}</div>}
              {error && <div className="catalog-form-error">{error}</div>}

              <div className="listing-detail-grid">
                <div className="listing-detail-main">
                  <div className="listing-detail-visual">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt={listing.title} />
                    ) : (
                      <div className="catalog-card-placeholder">
                        <Image size={56} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className="listing-info-card">
                    <h2>Listing Information</h2>
                    <div className="listing-info-grid">
                      <div>
                        <span>Current Price</span>
                        <strong>{formatCurrency(getDisplayPrice(listing))}</strong>
                      </div>
                      <div>
                        <span>Starting Price</span>
                        <strong>{formatCurrency(listing.startingPrice)}</strong>
                      </div>
                      <div>
                        <span>Reserve Price</span>
                        <strong>{formatCurrency(listing.reservePrice)}</strong>
                      </div>
                      <div>
                        <span>Category</span>
                        <strong>{categoryDisplayName}</strong>
                      </div>
                      <div>
                        <span>Seller</span>
                        <strong>{sellerDisplayName}</strong>
                      </div>
                      <div>
                        <span>Listing ID</span>
                        <strong className="listing-mono">{listing.id}</strong>
                      </div>
                    </div>

                    <div className="listing-schedule">
                      <p>
                        <Calendar size={16} />
                        Starts {formatDateTime(listing.startTime)}
                      </p>
                      <p>
                        <Calendar size={16} />
                        Ends {formatDateTime(listing.endTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <aside className="listing-detail-sidebar">
                  <div className="listing-side-card">
                    <h2>Seller Actions</h2>
                    <p>Update media and description only while the listing has no bids.</p>

                    <form className="listing-edit-form" onSubmit={handleUpdate}>
                      <label className="listing-field">
                        <span>Description</span>
                        <textarea
                          rows="4"
                          value={editForm.description}
                          disabled={!canEdit || submitting}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className="listing-field">
                        <span>Image URL</span>
                        <input
                          type="url"
                          value={editForm.imageUrl}
                          disabled={!canEdit || submitting}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              imageUrl: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <button
                        className="btn-primary listing-action-button"
                        type="submit"
                        disabled={!canEdit || submitting}
                      >
                        <Pencil size={16} />
                        Save Changes
                      </button>
                    </form>

                    {canCancel && (
                      <button
                        className="btn-outline listing-action-button"
                        type="button"
                        disabled={submitting}
                        onClick={handleCancel}
                      >
                        <XCircle size={16} />
                        Cancel Listing
                      </button>
                    )}

                    <button
                      className="btn-outline listing-action-button danger"
                      type="button"
                      disabled={submitting}
                      onClick={handleDelete}
                    >
                      <Trash2 size={16} />
                      Delete Listing
                    </button>
                  </div>

                  {canCreateAuction ? (
                    <div className="listing-side-card">
                      <h2>Start Auction</h2>
                      <p>Use this listing ID when creating an auction in the auction module.</p>
                      <Link
                        className="btn-primary listing-action-button"
                        to={`/sell?listingId=${listing.id}`}
                      >
                        <Gavel size={16} />
                        Create Auction
                      </Link>
                    </div>
                  ) : null}

                  <div className="listing-side-card listing-side-meta">
                    <p>
                      <Tag size={16} />
                      Status checks use auction bid status API.
                    </p>
                    <p>
                      <Shield size={16} />
                      Reserve {formatCurrency(listing.reservePrice)}
                    </p>
                    <p>
                      <User size={16} />
                      Seller {sellerDisplayName}
                    </p>
                    {listing.sellerBio ? (
                      <p>
                        <User size={16} />
                        {listing.sellerBio}
                      </p>
                    ) : null}
                  </div>
                </aside>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ListingDetail;
