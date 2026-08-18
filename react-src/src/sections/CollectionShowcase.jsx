import { ProductCarousel } from "../components/ProductCarousel.jsx";

/**
 * Expects `data` shaped like:
 * {
 *   vendor: "Redwood Empire",
 *   cartAddUrl: "/cart/add.js",
 *   cartUrl: "/cart.js",
 *   collection: {
 *     title, url,
 *     image: { src, alt, width, height } | null,
 *     description: "<p>...</p>" | null,
 *     products: [ { id, title, url, image, imageAlt, price,
 *                    compareAtPrice, currency, rating, reviewCount,
 *                    variantTitle, variantId, available }, ... ]
 *   } | null   ← null when no collection matches the vendor
 * }
 *
 * cardsPerView: { mobile, tablet, desktop } — how many product cards are
 * visible at each breakpoint. Passed down from Liquid section settings so
 * merchants can tune it without a rebuild (see collection-showcase-pdp.liquid).
 *
 */
export default function CollectionShowcase({ data, cardsPerView, viewAllText }) {
  // Rule: no matching collection → render nothing at all.
  if (!data || !data.collection) return null;

  const { collection, vendor } = data;
  const hasImage = Boolean(collection.image && collection.image.src);
  const hasDescription = Boolean(collection.description && collection.description.trim() !== "");
  const products = collection.products || [];
  // Rule: fewer than 2 products → hide the "more from vendor" grid, but
  // the brand story (image/title/description) above it still renders.
  const showGrid = products.length >= 2;
  const vendorName = vendor || collection.title;

  return (
    <div className="vcs-root">
      <div className="vcs-inner">
        <div className={`vcs-hero ${hasImage ? "vcs-hero--with-media" : "vcs-hero--full"}`}>
          {/* Rule: missing image → no placeholder column; the brand story
              content below takes the full width instead. */}
          {hasImage && (
            <div className="vcs-hero-media">
              <img
                src={collection.image.src}
                alt={collection.image.alt || collection.title}
                width={collection.image.width}
                height={collection.image.height}
                loading="lazy"
              />
            </div>
          )}
          <div className="vcs-hero-content">
            <p className="vcs-eyebrow">The Brand Story</p>
            <h2 className="vcs-hero-heading">{collection.title}</h2>
            {hasDescription && (
              <div className="vcs-hero-description" dangerouslySetInnerHTML={{ __html: collection.description }} />
            )}
          </div>
        </div>

        {showGrid && (
          <div className="vcs-grid-header">
            <h3 className="vcs-grid-heading">More from {vendorName}:</h3>

            {collection.url && (
              <a className="cs-view-all" href={collection.url}>
                {viewAllText || "View all"}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </div>
        )}

        {showGrid && (
          <ProductCarousel
            products={products}
            cartAddUrl={data.cartAddUrl}
            cartUrl={data.cartUrl}
            cardsPerView={cardsPerView}
          />
        )}
      </div>
    </div>
  );
}
