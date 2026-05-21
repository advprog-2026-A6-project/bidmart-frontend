export const getEmbeddedListing = (auction) =>
  auction?.listing || auction?.item || auction?.catalogListing || auction?.listingDetail || null;

export const mergeAuctionListing = (auction, listing) => ({
  ...auction,
  listing: listing || getEmbeddedListing(auction),
});

export const getAuctionListingId = (auction) =>
  auction?.listingId ?? getEmbeddedListing(auction)?.id ?? null;

export const getAuctionTitle = (auction) => {
  const listing = getEmbeddedListing(auction);
  return listing?.title || auction?.title || auction?.itemName || 'Auction Item';
};

export const getAuctionDescription = (auction) => {
  const listing = getEmbeddedListing(auction);
  return listing?.description || auction?.description || '';
};

export const getAuctionImageUrl = (auction) => {
  const listing = getEmbeddedListing(auction);
  return listing?.imageUrl || listing?.image || auction?.imageUrl || auction?.image || '';
};

export const getAuctionSellerName = (auction) => {
  const listing = getEmbeddedListing(auction);
  return (
    listing?.sellerName ||
    listing?.seller?.name ||
    listing?.sellerId ||
    auction?.sellerName ||
    auction?.sellerId ||
    'System seller'
  );
};

export const getAuctionCategoryName = (auction) => {
  const listing = getEmbeddedListing(auction);
  return listing?.categoryName || listing?.category?.name || 'Uncategorized';
};

export const hydrateAuctionsWithListings = async (auctions, getListing) => {
  const auctionList = Array.isArray(auctions) ? auctions : [];
  const listingIds = [
    ...new Set(
      auctionList
        .filter((auction) => !getEmbeddedListing(auction))
        .map(getAuctionListingId)
        .filter(Boolean)
        .map(String),
    ),
  ];

  if (listingIds.length === 0) {
    return auctionList.map((auction) => mergeAuctionListing(auction));
  }

  const listingEntries = await Promise.all(
    listingIds.map(async (listingId) => {
      try {
        return [listingId, await getListing(listingId)];
      } catch {
        return [listingId, null];
      }
    }),
  );

  const listingsById = new Map(listingEntries);

  return auctionList.map((auction) =>
    mergeAuctionListing(auction, listingsById.get(String(getAuctionListingId(auction)))),
  );
};
