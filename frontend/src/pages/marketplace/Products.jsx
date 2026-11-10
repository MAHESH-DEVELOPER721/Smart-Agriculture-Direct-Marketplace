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
                <label>Produce / Crop Name</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Roma Tomatoes"
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
                    <option value="fruits">Fresh Fruits</option>
                    <option value="pulses">Pulses &amp; Legumes</option>
                  </select>
                </div>

                <div>
                  <label>Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="2.50"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-grid-2">
                <div>
                  <label>Unit</label>
                  <select
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                  >
                    <option value="kg">Per Kilogram (kg)</option>
                    <option value="ton">Per Metric Ton</option>
                    <option value="bunch">Per Bunch</option>
                    <option value="crate">Per Crate</option>
                  </select>
                </div>

                <div>
                  <label>Available Stock</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Farm / Cooperative Name</label>
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
