export function Star() {
  return (
    <svg className="cs-star is-filled" width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.8 4.8 17.7l1-5.9-4.3-4.1 5.9-.8L10 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Rating({ rating, count }) {
  if (!rating) return null;
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="cs-rating">
      <span className="cs-rating-star">
        <Star />
      </span>
      <span className="cs-rating-value">{rounded.toFixed(1)}</span>
      {typeof count === "number" && <span className="cs-rating-count">({count} reviews)</span>}
    </div>
  );
}

export function money(cents, currency) {
  if (cents == null) return "";
  return `${currency || "$"}${(cents / 100).toFixed(2)}`;
}

export function ProductCard({ product, onAdd, addingId }) {
  const {
    id,
    title,
    url,
    image,
    imageAlt,
    price,
    compareAtPrice,
    currency,
    rating,
    reviewCount,
    variantTitle,
    available,
  } = product;

  const isAdding = addingId === id;
  const onSale = compareAtPrice && compareAtPrice > price;

  return (
    <li className="cs-card">
      <a href={url} className="cs-card-media" aria-label={title}>
        {image ? (
          <img src={image} alt={imageAlt || title} loading="lazy" width="300" height="300" />
        ) : (
          <div className="cs-card-media-placeholder" aria-hidden="true" />
        )}
      </a>

      <Rating rating={rating} count={reviewCount} />

      <a href={url} className="cs-card-title">
        {title}
      </a>

      {variantTitle && <p className="cs-card-variant">{variantTitle}</p>}

      <p className="cs-card-price">
        <span className={onSale ? "cs-price-sale" : "cs-price"}>{money(price, currency)}</span>
        {onSale && <span className="cs-price-compare">{money(compareAtPrice, currency)}</span>}
      </p>

      <button
        type="button"
        className="cs-add-btn"
        disabled={!available || isAdding}
        onClick={() => onAdd(product)}
      >
        {isAdding ? "Adding…" : !available ? "Sold out" : "Add to Cart"}
        {!isAdding && available && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </li>
  );
}

/**
 * Shared add-to-cart handler. Both ProductGrid and VendorCollectionSection
 * use the same Ajax Cart API call, same event dispatch — kept in one place
 * so cart behavior can't drift between the two components.
 */
export async function addToCart(product, cartAddUrl, { onStart, onSettle }) {
  if (!product.variantId || !cartAddUrl) return;
  onStart(product.id);
  try {
    const res = await fetch(cartAddUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ items: [{ id: product.variantId, quantity: 1 }] }),
    });
    if (!res.ok) throw new Error("Add to cart failed");
    const data = await res.json();
    document.dispatchEvent(new CustomEvent("cart:updated", { detail: data }));
  } catch (err) {
    console.error(err);
    document.dispatchEvent(new CustomEvent("cart:error", { detail: err }));
  } finally {
    onSettle();
  }
}
