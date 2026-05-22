export const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return currencyFormatter.format(amount);
};

const TIMEZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/;

export const parseBackendDateTime = (value) => {
  if (!value) return null;

  const text = String(value);
  return new Date(TIMEZONE_PATTERN.test(text) ? text : `${text}Z`);
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return dateTimeFormatter.format(parseBackendDateTime(value));
};

export const getCurrentPrice = (auction) => {
  const listing = auction?.listing || auction?.item || auction?.catalogListing || auction?.listingDetail;

  return Number(
    auction?.currentHighestBid ??
      auction?.startPrice ??
      listing?.currentPrice ??
      listing?.startingPrice ??
      0,
  );
};

export const getMinimumBid = (auction) => {
  const currentPrice = getCurrentPrice(auction);
  const increment = Number(auction?.minIncrement || 0);

  if (!auction?.currentHighestBid) {
    return currentPrice;
  }

  return currentPrice + increment;
};

export const getTimeLeft = (endAt) => {
  if (!endAt) return 'Not started';

  const remainingMs = parseBackendDateTime(endAt).getTime() - Date.now();
  if (remainingMs <= 0) return 'Ended';

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};

export const getStatusLabel = (status) => (status || 'UNKNOWN').replaceAll('_', ' ');
