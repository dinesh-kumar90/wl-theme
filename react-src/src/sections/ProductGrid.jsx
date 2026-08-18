import { ProductCarousel } from "../components/ProductCarousel.jsx";

export default function ProductGrid({ products, viewAllUrl, viewAllText, cartAddUrl, cardsPerView }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="cs-root">
      <div className="cs-header">
        <span className="cs-header-spacer" aria-hidden="true" />
        {viewAllUrl && (
          <a className="cs-view-all" href={viewAllUrl}>
            {viewAllText || "View all"}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      <ProductCarousel products={products} cartAddUrl={cartAddUrl} cardsPerView={cardsPerView} />
    </div>
  );
}
