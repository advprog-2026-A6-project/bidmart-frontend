import { useEffect, useMemo, useState } from 'react';
import { Image, Package, Plus, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogApi } from '../api/catalogApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/useAuth';
import { flattenCategoryTree, toApiDateTime } from '../utils/catalogFormatters';
import '../styles/catalogPage.css';
import './ListingCreate.css';

const initialForm = {
  title: '',
  description: '',
  startingPrice: '',
  reservePrice: '',
  currentPrice: '',
  imageUrl: '',
  categoryId: '',
  startTime: '',
  endTime: '',
};

const ListingCreate = () => {
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categories),
    [categories],
  );

  useEffect(() => {
    catalogApi
      .getCategoryTree()
      .then((tree) => setCategories(Array.isArray(tree) ? tree : []))
      .catch(() => setCategories([]));
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const sellerId = session?.userId ?? profile?.id ?? profile?.userId;

      if (!sellerId) {
        throw new Error('Seller id tidak ditemukan dari sesi auth. Silakan login ulang.');
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        startingPrice: Number(form.startingPrice),
        reservePrice: Number(form.reservePrice),
        currentPrice: Number(form.currentPrice || form.startingPrice),
        imageUrl: form.imageUrl.trim() || null,
        categoryId: form.categoryId,
        startTime: toApiDateTime(form.startTime),
        endTime: toApiDateTime(form.endTime),
      };

      const createdListing = await catalogApi.createListing(payload, sellerId);
      navigate(`/catalog/${createdListing.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="catalog-page">
        <section className="container catalog-container listing-create-container">
          <div className="catalog-header listing-create-header">
            <div>
              <span className="catalog-eyebrow">Seller Console</span>
              <h1>Create Listing</h1>
              <p>Publish a new auction listing to the catalog service.</p>
            </div>
          </div>

          <form className="listing-create-form" onSubmit={handleSubmit}>
            <div className="listing-form-main">
              <section className="listing-form-section">
                <div className="listing-form-heading">
                  <Package size={20} />
                  <h2>Listing Details</h2>
                </div>

                <label className="listing-field">
                  <span>Title</span>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="iPhone 14 Pro, vintage watch, gaming laptop"
                  />
                </label>

                <label className="listing-field">
                  <span>Description</span>
                  <textarea
                    required
                    rows="5"
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="Condition, accessories, shipping notes"
                  />
                </label>

                <label className="listing-field">
                  <span>Category</span>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(event) => updateField('categoryId', event.target.value)}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {`${'— '.repeat(category.depth)}${category.label}`}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="listing-form-section">
                <div className="listing-form-heading">
                  <Tag size={20} />
                  <h2>Pricing & Schedule</h2>
                </div>

                <div className="listing-field-grid">
                  <label className="listing-field">
                    <span>Starting Price</span>
                    <input
                      required
                      min="1"
                      step="1"
                      type="number"
                      value={form.startingPrice}
                      onChange={(event) => updateField('startingPrice', event.target.value)}
                    />
                  </label>

                  <label className="listing-field">
                    <span>Reserve Price</span>
                    <input
                      required
                      min="1"
                      step="1"
                      type="number"
                      value={form.reservePrice}
                      onChange={(event) => updateField('reservePrice', event.target.value)}
                    />
                  </label>

                  <label className="listing-field">
                    <span>Current Price</span>
                    <input
                      min="1"
                      step="1"
                      type="number"
                      value={form.currentPrice}
                      onChange={(event) => updateField('currentPrice', event.target.value)}
                      placeholder="Defaults to starting price"
                    />
                  </label>
                </div>

                <div className="listing-field-grid">
                  <label className="listing-field">
                    <span>Start Time</span>
                    <input
                      required
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(event) => updateField('startTime', event.target.value)}
                    />
                  </label>

                  <label className="listing-field">
                    <span>End Time</span>
                    <input
                      required
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(event) => updateField('endTime', event.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="listing-form-section">
                <div className="listing-form-heading">
                  <Image size={20} />
                  <h2>Media</h2>
                </div>

                <label className="listing-field">
                  <span>Image URL</span>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) => updateField('imageUrl', event.target.value)}
                    placeholder="https://example.com/item.jpg"
                  />
                </label>
              </section>
            </div>

            <aside className="listing-submit-panel">
              <h2>Publish</h2>
              <p>New listings are saved as active in the catalog service.</p>

              {error && <div className="catalog-form-error">{error}</div>}

              <button className="btn-primary listing-submit-button" type="submit" disabled={submitting}>
                <Plus size={18} />
                {submitting ? 'Saving...' : 'Create Listing'}
              </button>

              <Link className="btn-outline listing-cancel-button" to="/catalog">
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

export default ListingCreate;
