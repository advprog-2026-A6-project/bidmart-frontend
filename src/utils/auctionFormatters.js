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

export const formatDateTime = (value) => {
  if (!value) return '-';
  return dateTimeFormatter.format(new Date(value));
};

export const getCurrentPrice = (auction) =>
  Number(auction?.currentHighestBid ?? auction?.startPrice ?? 0);

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

  const remainingMs = new Date(endAt).getTime() - Date.now();
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
