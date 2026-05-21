import { apiFetch } from './apiClient';
import { normalizeSellerId } from '../utils/catalogPermissions';

const CATALOG_API_BASE = (
  import.meta.env.VITE_CATALOG_API_BASE ||
  import.meta.env.VITE_CATALOG_SERVICE_URL ||
  import.meta.env.VITE_API_GATEWAY_BASE ||
  import.meta.env.VITE_GATEWAY_URL ||
  ''
).replace(/\/$/, '');

const request = (path, options = {}) => apiFetch(`${CATALOG_API_BASE}${path}`, options);

const sellerHeaders = (sellerId) => {
  const normalized = normalizeSellerId(sellerId);
  return normalized
    ? {
        'X-User-Id': normalized,
      }
    : {};
};
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
  listMyListings: (sellerId) =>
    request('/listings/mine', {
      headers: sellerHeaders(sellerId),
    }),
  searchListings: (filters) => request(`/listings/search${buildSearchQuery(filters)}`),
  getListing: (listingId) => request(`/listings/${listingId}`),
  createListing: (payload, sellerId) =>
    request('/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...sellerHeaders(sellerId),
      },
      body: JSON.stringify(payload),
    }),
  updateListing: (listingId, payload, sellerId) =>
    request(`/listings/${listingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...sellerHeaders(sellerId),
      },
      body: JSON.stringify(payload),
    }),
  cancelListing: (listingId, sellerId) =>
    request(`/listings/${listingId}/cancel`, {
      method: 'POST',
      headers: sellerHeaders(sellerId),
    }),
  deleteListing: (listingId, sellerId) =>
    request(`/listings/${listingId}`, {
      method: 'DELETE',
      headers: sellerHeaders(sellerId),
    }),
  getCategoryTree: () => request('/api/categories/tree'),
  getCategories: () => request('/api/categories'),
};
