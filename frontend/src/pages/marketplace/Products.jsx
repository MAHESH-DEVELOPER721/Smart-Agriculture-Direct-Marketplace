import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../services/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function Products({ onAdd, cart }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getProducts({ signal: controller.signal })
      .then(setProducts)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products],
  );
  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;
      const matchesSearch =
        !term ||
        [product.name, product.category, product.description]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Grown for your farm</p>
          <h1>Farm essentials, direct to you.</h1>
          <p className="muted">
            Browse quality seeds, soil care, and equipment from our marketplace.
          </p>
        </div>
        <div className="heading-mark" aria-hidden="true">✳</div>
      </section>

      <section className="catalog-tools" aria-label="Product filters">
        <label className="search-field">
          <span className="sr-only">Search products</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search farm essentials..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="category-list" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              className={`category-chip${category === item ? " selected" : ""}`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {loading && <p className="state-message">Loading marketplace products...</p>}
      {!loading && error && (
        <div className="state-message error" role="alert">
          <strong>We couldn’t load products.</strong>
          <span>{error}</span>
          <button type="button" className="text-button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}
      {!loading && !error && visibleProducts.length === 0 && (
        <p className="state-message">No products match your search.</p>
      )}

      {!loading && !error && visibleProducts.length > 0 && (
        <section className="product-grid" aria-label="Marketplace products">
          {visibleProducts.map((product) => {
            const inCart =
              cart.find((item) => item.id === product.id)?.quantity ?? 0;
            const outOfStock = product.stock < 1;
            return (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} loading="lazy" />
                  ) : (
                    <span aria-hidden="true">🌱</span>
                  )}
                  <span className="product-category">{product.category}</span>
                </div>
                <div className="product-info">
                  <div className="product-title-row">
                    <h2>{product.name}</h2>
                    <span className="stock-label">
                      {outOfStock ? "Out of stock" : `${product.stock} ${product.unit} left`}
                    </span>
                  </div>
                  <p className="product-description">
                    {product.description || "A quality essential for your farm."}
                  </p>
                  <div className="product-buy-row">
                    <p className="price">
                      {currency.format(product.price)}
                      <span> / {product.unit}</span>
                    </p>
                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => onAdd(product)}
                      disabled={outOfStock || inCart >= product.stock}
                    >
                      {inCart > 0 ? `Add more · ${inCart}` : "Add to cart"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
