import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock, Package, Plus, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalogApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/useAuth';
import {
  flattenCategoryTree,
  formatCurrency,
  formatDateTime,
  getDisplayPrice,
  getListingStatusLabel,
} from '../utils/catalogFormatters';
import '../styles/catalogPage.css';
import './ListingList.css';

const initialFilters = {
  keyword: '',
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  endBefore: '',
};

const ListingList = () => {
  const { hasAnyAuthority } = useAuth();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canCreateAuction = hasAnyAuthority(['auction:create']);

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categories),
    [categories],
  );

  const hasActiveFilters = (activeFilters) =>
    Boolean(
      activeFilters.keyword?.trim() ||
        activeFilters.categoryId ||
        activeFilters.minPrice ||
        activeFilters.maxPrice ||
        activeFilters.endBefore,
    );

  const loadCategories = useCallback(async () => {
    try {
      const tree = await catalogApi.getCategoryTree();
      setCategories(Array.isArray(tree) ? tree : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadListings = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const data = hasActiveFilters(activeFilters)
        ? await catalogApi.searchListings(activeFilters)
        : await catalogApi.listListings();

      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCategories();
      loadListings(initialFilters);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCategories, loadListings]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadListings(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadListings(initialFilters);
  };

  return (
    <>
      <Navbar />
      <main className="catalog-page">
        <section className="container catalog-container">
          <div className="catalog-header">
            <div>
              <span className="catalog-eyebrow">Catalog Marketplace</span>
              <h1>Browse Listings</h1>
              <p>Explore auction listings by category, price range, keyword, and end time.</p>
            </div>

            <div className="catalog-header-actions">
              <button className="btn-outline" type="button" onClick={() => loadListings(filters)}>
                <RefreshCw size={18} />
                Refresh
              </button>
              {canCreateAuction ? (
                <Link className="btn-primary" to="/catalog/new">
                  <Plus size={18} />
                  Create Listing
                </Link>
              ) : null}
            </div>
          </div>

          <form className="catalog-toolbar" onSubmit={handleSearch}>
            <div className="catalog-search-field">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search title or description"
                value={filters.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
              />
            </div>

            <div className="catalog-filter-grid">
              <label>
                Category
                <select
                  value={filters.categoryId}
                  onChange={(event) => updateFilter('categoryId', event.target.value)}
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {`${'— '.repeat(category.depth)}${category.label}`}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Min reserve price
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(event) => updateFilter('minPrice', event.target.value)}
                />
              </label>

              <label>
                Max reserve price
                <input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilter('maxPrice', event.target.value)}
                />
              </label>

              <label>
                Ends before
                <input
                  type="datetime-local"
                  value={filters.endBefore}
                  onChange={(event) => updateFilter('endBefore', event.target.value)}
                />
              </label>
            </div>

            <div className="listing-filter-actions">
              <button className="btn-primary" type="submit">
                Apply Filters
              </button>
              <button className="btn-outline" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>

          {loading && <div className="catalog-state-card">Loading listings...</div>}

          {!loading && error && (
            <div className="catalog-state-card error">
              <h2>Could not load listings</h2>
              <p>{error}</p>
              <button className="btn-primary" type="button" onClick={() => loadListings(filters)}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="catalog-state-card">
              <Package size={34} />
              <h2>No listings found</h2>
              <p>Create a listing or adjust your search filters.</p>
              {canCreateAuction ? (
                <Link className="btn-primary" to="/catalog/new">
                  <Plus size={18} />
                  Create Listing
                </Link>
              ) : null}
            </div>
          )}

          {!loading && !error && listings.length > 0 && (
            <div className="catalog-list-grid">
              {listings.map((listing) => (
                <Link className="catalog-card" key={listing.id} to={`/catalog/${listing.id}`}>
                  <div className="catalog-card-visual">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt={listing.title} loading="lazy" />
                    ) : (
                      <div className="catalog-card-placeholder">
                        <Package size={48} strokeWidth={1.7} />
                      </div>
                    )}
                    <span
                      className={`catalog-status-chip status-${String(listing.status).toLowerCase()}`}
                    >
                      {getListingStatusLabel(listing.status)}
                    </span>
                  </div>

                  <div className="catalog-card-body">
                    <div>
                      <h2>{listing.title}</h2>
                      <p>{listing.description || 'No description provided.'}</p>
                    </div>

                    <div className="catalog-card-meta">
                      <div>
                        <span>Current Price</span>
                        <strong>{formatCurrency(getDisplayPrice(listing))}</strong>
                      </div>
                      <div>
                        <span>Category</span>
                        <strong>{listing.categoryName || 'Uncategorized'}</strong>
                      </div>
                    </div>

                    <div className="catalog-card-footer">
                      <span>
                        <Clock size={16} />
                        {listing.endTime ? formatDateTime(listing.endTime) : 'No end time'}
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

export default ListingList;
