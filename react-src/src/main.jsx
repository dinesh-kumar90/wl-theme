import { createRoot } from "react-dom/client";
import "./collection-showcase.css";

/**
 * Shared registry for every React-powered custom element in the theme.
 *
 * Each entry's `loadComponent` is a dynamic import(), so Rollup/Vite splits
 * that component into its own chunk file. A page only downloads the chunk
 * for a custom element that's actually present in its DOM — connectedCallback
 * only fires when the tag shows up, and the import() only runs inside it.
 *
 * React/ReactDOM and any other node_modules code is pulled into a single
 * shared "theme-react-vendor" chunk (see vite.config.js manualChunks), so
 * it's fetched once and cached across every page, never duplicated per
 * component.
 */
function defineElement(tagName, loadComponent, parseProps) {
  class ReactCustomElement extends HTMLElement {
    async connectedCallback() {
      if (this._root) return; // guard against double-mount if reattached

      let Component;
      try {
        const mod = await loadComponent();
        Component = mod.default;
      } catch (err) {
        console.error(`${tagName}: failed to load component`, err);
        return;
      }

      const props = parseProps(this);
      this._root = createRoot(this);
      this._root.render(<Component {...props} />);
    }

    disconnectedCallback() {
      if (this._root) {
        this._root.unmount();
        this._root = null;
      }
    }
  }

  if (!customElements.get(tagName)) {
    customElements.define(tagName, ReactCustomElement);
  }
}

// ---------- shared prop-parsing helpers ----------

function readJson(el, attr) {
  const id = el.getAttribute(attr);
  const node = id ? document.getElementById(id) : null;
  if (!node) return null;
  try {
    return JSON.parse(node.textContent);
  } catch (err) {
    console.error(`Could not parse JSON for #${id}`, err);
    return null;
  }
}

function readCardsPerView(el) {
  return {
    mobile: parseFloat(el.getAttribute("data-cards-mobile")) || 1.2,
    tablet: parseFloat(el.getAttribute("data-cards-tablet")) || 2,
    desktop: parseFloat(el.getAttribute("data-cards-desktop")) || 4,
  };
}

// ---------- component registrations ----------


defineElement(
  "collection-showcase",
  () => import("./sections/CollectionShowcase.jsx"),
  (el) => ({
    data: readJson(el, "data-json-id"),
    cardsPerView: readCardsPerView(el),
    viewAllText: el.getAttribute("data-view-all-text") || "",
  })
);

// Add future sections here, same pattern:
// defineElement("some-new-section", () => import("./sections/SomeNew.jsx"), parseProps);
