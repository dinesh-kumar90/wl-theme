import { ProductCarousel } from "../components/ProductCarousel.jsx";

/**
 * Expects `data` shaped like:
 * {
 *   vendor: "Redwood Empire",
 *   cartAddUrl: "/cart/add.js",
 *   collection: {
 *     title, url,
 *     image: { src, alt, width, height } | null,
 *     description: "<p>...</p>" | null,
 *     products: [ { id, title, url, image, imageAlt, price,
 *                    compareAtPrice, currency, rating, reviewCount,
 *                    variantId, available }, ... ]
 *   } | null   ← null when no collection matches the vendor
 * }
 *
 * cardsPerView: { mobile, tablet, desktop } — how many product cards are
 * visible at each breakpoint. Passed down from Liquid section settings so
 * merchants can tune it without a rebuild (see collection-showcase.liquid).
 *
 * tokens are applied via CSS custom properties set directly on the
 * <collection-showcase> element's style attribute in Liquid (see
 * collection-showcase-pdp.liquid) — they cascade down to everything
 * rendered here through normal CSS inheritance. This component never
 * reads or passes them; adding a new token later means editing Liquid
 * and collection-showcase.css only, nothing here.
 */
export default function CollectionShowcase({ data, cardsPerView, viewAllText }) {
  // Rule: no matching collection → render nothing at all.
  if (!data || !data.collection) return null;

  const { collection } = data;
  const hasImage = Boolean(collection.image && collection.image.src);
  const hasDescription = Boolean(collection.description && collection.description.trim() !== "");
  const products = collection.products || [];
  // Rule: fewer than 2 products → hide the "more from vendor" grid, but
  // the header (image/title/description) above it still renders.
  const showGrid = products.length >= 2;

  return (
    <div className="vcs-root">
      {/* Rule: missing image → no placeholder, just skip it entirely. */}
      {hasImage && (
        <div className="vcs-media">
          <img
            src={collection.image.src}
            alt={collection.image.alt || collection.title}
            width={collection.image.width}
            height={collection.image.height}
            loading="lazy"
          />
        </div>
      )}

      <div className="vcs-header">
        <div className="vcs-heading-group">
          <h2 className="vcs-title">{collection.title}</h2>
          {/* Rule: missing description → omit the block, no empty gap left behind. */}
          {hasDescription && (
            <div className="vcs-description" dangerouslySetInnerHTML={{ __html: collection.description }} />
          )}
        </div>

        {collection.url && (
          <a className="cs-view-all" href={collection.url}>
            {viewAllText || "View all"}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      {showGrid && (
        <ProductCarousel
          products={products}
          cartAddUrl={data.cartAddUrl}
          cardsPerView={cardsPerView}
        />
      )}
    </div>
  );
}
