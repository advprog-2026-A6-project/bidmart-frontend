export const LISTING_CREATE_AUTHORITY = 'auction:create';

export const canManageListing = (session, listing, options = {}) => {
  const { allowAdmin = true } = options;

  if (!session?.userId || !listing?.sellerId) {
    return false;
  }

  if (String(session.userId) === String(listing.sellerId)) {
    return true;
  }

  if (allowAdmin) {
    return (
      session.authorities?.includes('rbac:manage') ||
      session.authorities?.includes('user:deactivate')
    );
  }

  return false;
};

export const getSellerDisplayName = (listing) =>
  listing?.sellerName || listing?.sellerId || 'Unknown seller';
