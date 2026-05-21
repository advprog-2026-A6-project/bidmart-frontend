import { apiFetch } from './apiClient';

const CATALOG_API_BASE = (
  import.meta.env.VITE_CATALOG_API_BASE ||
  import.meta.env.VITE_CATALOG_SERVICE_URL ||
  ''
).replace(/\/$/, '');

const request = (path, options = {}) => apiFetch(`${CATALOG_API_BASE}${path}`, options);

const buildSearchQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.minPrice !== '' && filters.minPrice != null) {
    params.set('minPrice', String(filters.minPrice));
  }
  if (filters.maxPrice !== '' && filters.maxPrice != null) {
    params.set('maxPrice', String(filters.maxPrice));
  }
  if (filters.keyword?.trim()) params.set('keyword', filters.keyword.trim());
  if (filters.endBefore) params.set('endBefore', filters.endBefore);

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const catalogApi = {
  listListings: () => request('/listings'),
  searchListings: (filters) => request(`/listings/search${buildSearchQuery(filters)}`),
  getListing: (listingId) => request(`/listings/${listingId}`),
  createListing: (payload, sellerId) =>
    request('/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sellerId ? { 'X-User-Id': String(sellerId) } : {}),
      },
      body: JSON.stringify(payload),
    }),
  updateListing: (listingId, payload) =>
    request(`/listings/${listingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
  cancelListing: (listingId) =>
    request(`/listings/${listingId}/cancel`, {
      method: 'POST',
    }),
  deleteListing: (listingId) =>
    request(`/listings/${listingId}`, {
      method: 'DELETE',
    }),
  getCategoryTree: () => request('/api/categories/tree'),
  getCategories: () => request('/api/categories'),
};
