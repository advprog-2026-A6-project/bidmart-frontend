export const LISTING_CREATE_AUTHORITY = 'auction:create';

/** Strips duplicate X-User-Id values such as "26,26,26" down to "26". */
export const normalizeSellerId = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const raw = String(value).trim();
  if (!raw.includes(',')) {
    return raw;
  }

  const first = raw.split(',')[0].trim();
  return first || null;
};

export const getCurrentUserId = (session, profile) => {
  const userId = session?.userId ?? profile?.id ?? profile?.userId;
  return normalizeSellerId(userId);
};

export const isListingOwner = (session, profile, listing) => {
  const userId = getCurrentUserId(session, profile);
  const listingSellerId = normalizeSellerId(listing?.sellerId);
  if (!userId || !listingSellerId) {
    return false;
  }
  return userId === listingSellerId;
};

export const canManageListing = (session, profile, listing, options = {}) => {
  const { allowAdmin = true } = options;

  if (isListingOwner(session, profile, listing)) {
    return true;
  }

  if (!allowAdmin || !session) {
    return false;
  }

  return (
    session.authorities?.includes('rbac:manage') ||
    session.authorities?.includes('user:deactivate')
  );
};

export const getSellerDisplayName = (listing) =>
  listing?.sellerName || listing?.sellerId || 'Unknown seller';
