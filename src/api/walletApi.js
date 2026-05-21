import { apiFetch } from './apiClient';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';
const WALLET_API_BASE = `${GATEWAY_URL}/api/wallet`;

const getHeaders = (userId, useIdempotency = false) => {
    const headers = {};

    if (userId != null) {
        headers['X-User-Id'] = userId.toString();
    }

    if (useIdempotency) {
        headers['X-Idempotency-Key'] = crypto.randomUUID();
    }

    return headers;
};

export const walletApi = {
    getWallet: (userId) => 
        apiFetch(`${WALLET_API_BASE}`, { headers: getHeaders(userId) }),

    getBankAccount: (userId) => 
        apiFetch(`${WALLET_API_BASE}/bank-account`, { headers: getHeaders(userId) }),

    getHistory: (userId) => 
        apiFetch(`${WALLET_API_BASE}/history`, { headers: getHeaders(userId) }),

    initiateTopUp: (userId, amount) => 
        apiFetch(`${WALLET_API_BASE}/topup/initiate?amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId),
        }),

    confirmTopUp: (userId, amount, paymentReference) => 
        apiFetch(`${WALLET_API_BASE}/topup/confirm?amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        }),

    withdraw: (userId, amount) => 
        apiFetch(`${WALLET_API_BASE}/withdraw?amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        }),

    holdBalance: (userId, amount) => 
        apiFetch(`${WALLET_API_BASE}/hold?userId=${userId}&amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        }),

    releaseBalance: (userId, amount) => 
        apiFetch(`${WALLET_API_BASE}/release?userId=${userId}&amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        }),

    settlePayment: (buyerId, sellerId, amount) => 
        apiFetch(`${WALLET_API_BASE}/settle?buyerId=${buyerId}&sellerId=${sellerId}&amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(buyerId, true),
        }),
};