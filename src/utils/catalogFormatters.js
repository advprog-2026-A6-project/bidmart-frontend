import { formatCurrency, formatDateTime } from './auctionFormatters';

export { formatCurrency, formatDateTime };

export const listingStatusLabels = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

export const getListingStatusLabel = (status) =>
  listingStatusLabels[status] || status || 'Unknown';

export const getDisplayPrice = (listing) =>
  Number(listing?.currentPrice ?? listing?.startingPrice ?? 0);

export const flattenCategoryTree = (nodes = [], depth = 0) =>
  nodes.flatMap((node) => [
    {
      id: node.id,
      label: node.fullPath || node.name,
      depth,
    },
    ...flattenCategoryTree(node.children || [], depth + 1),
  ]);

export const toApiDateTime = (value) => {
  if (!value) return null;
  if (value.length === 16) return `${value}:00`;
  return value;
};

export const toDateTimeLocalValue = (value) => {
  if (!value) return '';
  return String(value).slice(0, 16);
};
