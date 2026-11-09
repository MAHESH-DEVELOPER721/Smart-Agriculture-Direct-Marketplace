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
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addToCart, apiRequest, readCart, readSession } from "../../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const session = readSession();
  const user = session?.user;
  const isFarmerOrAdmin = user?.role === "farmer" || user?.role === "admin";

  const [newProd, setNewProd] = useState({
    name: "",
    category: "vegetables",
    price: "",
    unit: "kg",
    stock: "",
    farm_name: user?.name ? `${user.name}'s Farm` : "Local Green Farm",
    description: "",
    is_featured: false,
  });

  useEffect(() => {
    fetchProducts();
    updateCartBadge();

    function handleCartEvent() {
      updateCartBadge();
    }
    window.addEventListener("agri_cart_updated", handleCartEvent);
    return () => window.removeEventListener("agri_cart_updated", handleCartEvent);
  }, [category]);

  function updateCartBadge() {
    const cart = readCart();
    const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    setCartCount(count);
  }

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      let url = "/marketplace/products";
      const params = [];
      if (category !== "all") params.push(`category=${encodeURIComponent(category)}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await apiRequest(url);
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message || "Failed to load marketplace products.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchProducts();
  }

  function handleAddToCart(p) {
    addToCart(p, 1);
    setToastMessage(`Added "${p.name}" to your basket!`);
    setTimeout(() => setToastMessage(""), 3000);
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    try {
      const created = await apiRequest("/marketplace/products", {
        method: "POST",
        body: {
          ...newProd,
          price: parseFloat(newProd.price),
          stock: parseInt(newProd.stock, 10),
        },
      });
      setProducts((prev) => [created, ...prev]);
      setShowAddModal(false);
      setToastMessage(`Product "${created.name}" published to marketplace!`);
      setTimeout(() => setToastMessage(""), 3000);
      setNewProd({
        name: "",
        category: "vegetables",
        price: "",
        unit: "kg",
        stock: "",
        farm_name: user?.name ? `${user.name}'s Farm` : "Local Green Farm",
        description: "",
        is_featured: false,
      });
    } catch (err) {
      alert(err.message || "Could not publish product.");
    }
  }

  return (
    <main className="page-shell module-page">
      {/* Toast Notification */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      <div className="module-header marketplace-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MODULE: DIRECT MARKETPLACE (MANGA)
          </span>
          <h1>Farm-Direct Marketplace</h1>
          <p>
            Buy directly from certified growers. 100% transparent pricing, zero middleman markups, guaranteed harvest freshness.
          </p>
        </div>

        <div className="header-actions">
          {isFarmerOrAdmin && (
            <button
              type="button"
              className="button button-outline"
              onClick={() => setShowAddModal(true)}
            >
              + List Harvest Produce
            </button>
          )}
          <Link to="/cart" className="button cart-btn">
            🛒 View Cart {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search & Category Filter Bar */}
      <section className="marketplace-controls">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <input
            type="text"
            placeholder="Search fresh vegetables, organic grains, fruits, or farm name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="button button-small">
            Search
          </button>
        </form>

        <div className="category-pills">
          {["all", "vegetables", "grains", "fruits"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill ${category === cat ? "cat-pill-active" : ""}`}
              onClick={() => {
                setCategory(cat);
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
      {/* Products Grid */}
      <section className="products-container">
        {loading ? (
          <div className="loading-card">Fetching freshest farm harvests...</div>
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <article key={prod.id} className="product-card">
                <div className="product-card-head">
                  <span className="product-cat-tag">{prod.category}</span>
                  {prod.is_featured && <span className="featured-tag">★ Featured</span>}
                </div>

                <h3 className="product-title">{prod.name}</h3>

                <div className="farm-info">
                  <span className="farm-icon">🌱</span>
                  <span className="farm-name">{prod.farm || prod.farm_name}</span>
                </div>

                <p className="product-desc">{prod.description || "Farm fresh produce."}</p>

                <div className="product-card-bottom">
                  <div className="price-tag">
                    <span className="price-num">${Number(prod.price).toFixed(2)}</span>
                    <span className="price-unit">/ {prod.unit || "kg"}</span>
                  </div>

                  <div className="stock-info">
                    {prod.stock > 0 ? (
                      <span className="in-stock-label">{prod.stock} in stock</span>
                    ) : (
                      <span className="out-stock-label">Sold out</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="button button-full add-cart-btn"
                  onClick={() => handleAddToCart(prod)}
                  disabled={prod.stock <= 0}
                >
                  {prod.stock > 0 ? "Add to Basket +" : "Out of Stock"}
                </button>
              </article>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="empty-state">
            <p>No agricultural products found matching your search criteria.</p>
          </div>
        )}
      </section>

      {/* Modal: List Produce (For Farmers) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>List New Harvest Produce</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="form-stack">
              <div>
                <label>Produce Name</label>
                <input
                  type="text"
                  placeholder="e.g. Crisp Organic Apples"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-grid-2">
                <div>
                  <label>Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="grains">Grains &amp; Cereals</option>
                    <option value="fruits">Fruits &amp; Berries</option>
                    <option value="pulses">Pulses &amp; Legumes</option>
                  </select>
                </div>
                <div>
                  <label>Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    placeholder="25.0"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-grid-2">
                <div>
                  <label>Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. crate (15kg) or kg"
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Stock Quantity Available</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Farm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Green Valley Agro"
                  value={newProd.farm_name}
                  onChange={(e) => setNewProd({ ...newProd, farm_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label>Description &amp; Harvest Quality</label>
                <textarea
                  rows="3"
                  className="custom-textarea"
                  placeholder="Provide harvest notes, organic certifications, storage tips..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                />
              </div>

              <button type="submit" className="button button-full" style={{ marginTop: "12px" }}>
                Publish Produce to Marketplace →
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

