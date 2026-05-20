import { apiFetch } from './apiClient';

const AUCTION_API_BASE = import.meta.env.VITE_AUCTION_API_BASE || '/api/auctions';

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
