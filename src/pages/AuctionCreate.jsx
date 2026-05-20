import { useState } from 'react';
import { CheckCircle2, Gavel, Play, Plus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auctionApi } from '../api/auctionApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './AuctionCreate.css';

const initialForm = {
  title: '',
  description: '',
  listingId: '',
  sellerId: '',
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
  const [form, setForm] = useState({
    ...initialForm,
    listingId: searchParams.get('listingId') || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        listingId: form.listingId.trim() || null,
        sellerId: form.sellerId.trim() || null,
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
            <h1>Add Auction</h1>
            <p>Create a draft in the auction service and optionally start it immediately.</p>
          </div>

          <form className="auction-create-form" onSubmit={handleSubmit}>
            <div className="auction-form-main">
              <div className="auction-form-section">
                <div className="auction-form-heading">
                  <Gavel size={20} />
                  <h2>Auction Details</h2>
                </div>

                <label className="auction-field">
                  <span>Title</span>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="Vintage camera, signed jersey, rare watch"
                  />
                </label>

                <label className="auction-field">
                  <span>Description</span>
                  <textarea
                    rows="5"
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="Condition, provenance, included accessories, and delivery notes"
                  />
                </label>

                <div className="auction-field-grid">
                  <label className="auction-field">
                    <span>Listing ID</span>
                    <input
                      type="text"
                      value={form.listingId}
                      onChange={(event) => updateField('listingId', event.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <label className="auction-field">
                    <span>Seller ID</span>
                    <input
                      type="text"
                      value={form.sellerId}
                      onChange={(event) => updateField('sellerId', event.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                </div>
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

              <button className="btn-primary auction-submit-button" type="submit" disabled={submitting}>
                <Plus size={18} />
                {submitting ? 'Saving...' : 'Create Auction'}
              </button>

              <Link className="btn-outline auction-cancel-button" to="/auctions">
                Cancel
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
