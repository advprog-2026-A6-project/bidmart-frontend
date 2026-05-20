const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE || '';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${CATALOG_API_BASE}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  return parseResponse(response);
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
  searchListings: (filters) => request(`/listings/search${buildSearchQuery(filters)}`),
  getListing: (listingId) => request(`/listings/${listingId}`),
  createListing: (payload) =>
    request('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateListing: (listingId, payload) =>
    request(`/listings/${listingId}`, {
      method: 'PUT',
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
