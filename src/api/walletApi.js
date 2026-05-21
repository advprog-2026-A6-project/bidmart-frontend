const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';
const WALLET_API_BASE = `${GATEWAY_URL}/api/wallet`;

const getHeaders = (userId, useIdempotency = false) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (userId != null) {
        headers['X-User-Id'] = userId.toString();
    }

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }


    if (useIdempotency) {
        headers['X-Idempotency-Key'] = crypto.randomUUID();
    }

    return headers;
};

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(payload?.message || payload?.error || (typeof payload === 'string' ? payload : 'Transaksi gagal'));
    }
    return payload;
};

export const walletApi = {
    getWallet: async (userId) => {
        const res = await fetch(`${WALLET_API_BASE}`, { headers: getHeaders(userId) });
        return parseResponse(res);
    },

    getBankAccount: async (userId) => {
        const res = await fetch(`${WALLET_API_BASE}/bank-account`, { headers: getHeaders(userId) });
        return parseResponse(res);
    },

    getHistory: async (userId) => {
        const res = await fetch(`${WALLET_API_BASE}/history`, { headers: getHeaders(userId) });
        return parseResponse(res);
    },

    initiateTopUp: async (userId, amount) => {
        const res = await fetch(`${WALLET_API_BASE}/topup/initiate?amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId),
        });
        return parseResponse(res);
    },

    confirmTopUp: async (userId, amount, paymentReference) => {
        const res = await fetch(`${WALLET_API_BASE}/topup/confirm?amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        });
        return parseResponse(res);
    },

    withdraw: async (userId, amount) => {
        const res = await fetch(`${WALLET_API_BASE}/withdraw?amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        });
        return parseResponse(res);
    },

    holdBalance: async (userId, amount) => {
        const res = await fetch(`${WALLET_API_BASE}/hold?userId=${userId}&amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        });
        return parseResponse(res);
    },

    releaseBalance: async (userId, amount) => {
        const res = await fetch(`${WALLET_API_BASE}/release?userId=${userId}&amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(userId, true),
        });
        return parseResponse(res);
    },

    settlePayment: async (buyerId, sellerId, amount) => {
        const res = await fetch(`${WALLET_API_BASE}/settle?buyerId=${buyerId}&sellerId=${sellerId}&amount=${amount}`, {
            method: 'POST',
            headers: getHeaders(buyerId, true),
        });
        return parseResponse(res);
    },
};