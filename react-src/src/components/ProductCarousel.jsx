import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard, addToCart } from "./ProductCard.jsx";

/**
 * Product carousel with responsive cards-per-view.
 *
 * cardsPerView controls how many cards are visible at each breakpoint —
 * set as CSS custom properties on the root, consumed by collection-showcase.css
 * media queries. Pass whole or fractional numbers (e.g. 1.2 to hint a peek
 * of the next card on mobile, a common pattern for signaling "swipeable").
 *
 * cardsPerView={{ mobile: 1.2, tablet: 2, desktop: 4 }}
 */
export function ProductCarousel({ products, cartAddUrl, onAdded, cardsPerView }) {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const updateProgress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pct = max > 0 ? el.scrollLeft / max : 0;
    setProgress(pct);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateProgress();
    el.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      el.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress, products]);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".cs-card");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const handleAdd = (product) =>
    addToCart(product, cartAddUrl, {
      onStart: setAddingId,
      onSettle: () => {
        setAddingId(null);
        if (typeof onAdded === "function") onAdded(product);
      },
    });

  if (!products || products.length === 0) return null;

  const cssVars = {
    "--cs-cards-mobile": cardsPerView?.mobile ?? 1.2,
    "--cs-cards-tablet": cardsPerView?.tablet ?? 2,
    "--cs-cards-desktop": cardsPerView?.desktop ?? 4,
  };

  return (
    <div className="cs-carousel" style={cssVars}>
      <ul className="cs-track" ref={trackRef}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={handleAdd} addingId={addingId} />
        ))}
      </ul>

      <div className="cs-controls">
        <div className="cs-progress" role="presentation">
          <div
            className="cs-progress-fill"
            style={{ width: `${Math.max(progress * 100, products.length > (cardsPerView?.desktop ?? 4) ? 10 : 0)}%` }}
          />
        </div>
        <div className="cs-arrows">
          <button
            type="button"
            className="cs-arrow"
            aria-label="Previous products"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="cs-arrow"
            aria-label="Next products"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
