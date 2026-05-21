const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';

const WALLET_API_BASE = `${GATEWAY_URL}/api/wallet`;



const getHeaders = (useIdempotency = false) => {

    const headers = {

        'Content-Type': 'application/json',

    };



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

    getWallet: async () => {

        const res = await fetch(`${WALLET_API_BASE}`, { headers: getHeaders() });

        return parseResponse(res);

    },



    getBankAccount: async () => {

        const res = await fetch(`${WALLET_API_BASE}/bank-account`, { headers: getHeaders() });

        return parseResponse(res);

    },



    getHistory: async () => {

        const res = await fetch(`${WALLET_API_BASE}/history`, { headers: getHeaders() });

        return parseResponse(res);

    },



    initiateTopUp: async (amount) => {

        const res = await fetch(`${WALLET_API_BASE}/topup/initiate?amount=${amount}`, {

            method: 'POST',

            headers: getHeaders(),

        });

        return parseResponse(res);

    },



    confirmTopUp: async (amount, paymentReference) => {

        const res = await fetch(`${WALLET_API_BASE}/topup/confirm?amount=${amount}`, {

            method: 'POST',

            headers: getHeaders(true),

        });

        return parseResponse(res);

    },



    withdraw: async (amount) => {

        const res = await fetch(`${WALLET_API_BASE}/withdraw?amount=${amount}`, {

            method: 'POST',

            headers: getHeaders(true),

        });

        return parseResponse(res);

    }

};