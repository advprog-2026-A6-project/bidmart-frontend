import { apiFetch } from './apiClient';

const API_GATEWAY_BASE = (
  import.meta.env.VITE_API_GATEWAY_BASE ||
  import.meta.env.VITE_GATEWAY_URL ||
  ''
).trim().replace(/\/$/, '');
const AUCTION_API_BASE = `${API_GATEWAY_BASE}/api/auctions`;

const request = (path = '', options = {}) => apiFetch(`${AUCTION_API_BASE}${path}`, options);

export const auctionApi = {
  listAuctions: () => request(),
  getAuction: (auctionId) => request(`/${auctionId}`),
  createAuction: (payload) =>
    request('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  getWinner: (auctionId) => request(`/${auctionId}/winner`),
  listBids: (auctionId) => request(`/${auctionId}/bids`),
  placeBid: (auctionId, payload) =>
    request(`/${auctionId}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
  getListingBidStatus: (listingId) =>
    request(`/internal/${encodeURIComponent(listingId)}/bids/status`),
};
