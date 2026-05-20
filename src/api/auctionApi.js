const AUCTION_API_BASE = import.meta.env.VITE_AUCTION_API_BASE || '/api/auctions';

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
      payload?.detail ||
      payload?.reason ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload;
};

const request = async (path = '', options = {}) => {
  const response = await fetch(`${AUCTION_API_BASE}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  return parseResponse(response);
};

export const auctionApi = {
  listAuctions: () => request(),
  getAuction: (auctionId) => request(`/${auctionId}`),
  createAuction: (payload) =>
    request('', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  activateAuction: (auctionId) =>
    request(`/${auctionId}/activate`, {
      method: 'POST',
    }),
  closeAuction: (auctionId) =>
    request(`/${auctionId}/close`, {
      method: 'POST',
    }),
  listBids: (auctionId) => request(`/${auctionId}/bids`),
  placeBid: (auctionId, payload) =>
    request(`/${auctionId}/bids`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
