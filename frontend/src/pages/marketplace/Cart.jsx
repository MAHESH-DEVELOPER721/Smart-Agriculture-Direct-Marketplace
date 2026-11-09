import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  apiRequest,
  clearCart,
  readCart,
  readSession,
  removeFromCart,
  updateCartQuantity,
} from "../../services/api";

export default function Cart() {
  const navigate = useNavigate();
  const session = readSession();
  const user = session?.user;

  const [cartItems, setCartItems] = useState([]);
  const [shipping, setShipping] = useState({
    customer_name: user?.name || "",
    customer_email: user?.email || "",
    customer_phone: "",
    shipping_address: "",
    payment_method: "cod",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
    function onUpdate() {
      loadCart();
    }
    window.addEventListener("agri_cart_updated", onUpdate);
    return () => window.removeEventListener("agri_cart_updated", onUpdate);
  }, []);

  function loadCart() {
    setCartItems(readCart());
  }

  function handleQuantity(id, delta) {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    updateCartQuantity(id, newQty);
  }

  function handleRemove(id) {
    removeFromCart(id);
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0
  );
  const deliveryFee = subtotal > 50 || subtotal === 0 ? 0 : 5.0;
  const grandTotal = subtotal + deliveryFee;

  async function handleCheckout(e) {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError("Your basket is empty. Add fresh produce before checking out.");
      return;
    }

    setSubmitting(true);
    setError("");

    const orderPayload = {
      customer_name: shipping.customer_name,
      customer_email: shipping.customer_email,
      customer_phone: shipping.customer_phone,
      shipping_address: shipping.shipping_address,
      payment_method: shipping.payment_method,
      items: cartItems.map((item) => ({
        product_id: typeof item.id === "number" ? item.id : null,
        product_name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        unit: item.unit || "kg",
      })),
    };

    try {
      const orderRes = await apiRequest("/marketplace/orders", {
        method: "POST",
        body: orderPayload,
      });
      clearCart();
      navigate("/orders", {
        state: {
          successMessage: `Order ${orderRes.order_code || orderRes.id} placed successfully!`,
        },
      });
    } catch (err) {
      setError(err.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MODULE: DIRECT MARKETPLACE (MANGA)
          </span>
          <h1>Your Produce Basket &amp; Direct Checkout</h1>
          <p>Review selected harvest items, configure delivery address, and support local farming communities.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {cartItems.length === 0 ? (
        <div className="empty-cart-card">
          <span className="empty-cart-icon">🛒</span>
          <h2>Your basket is currently empty</h2>
          <p>Explore freshly harvested vegetables, grains, and organic fruits straight from local growers.</p>
          <Link to="/products" className="button" style={{ marginTop: "16px" }}>
            Browse Marketplace Produce →
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left Column: Items List */}
          <section className="card-panel cart-items-panel">
            <div className="panel-header">
              <h3>Selected Farm Items ({cartItems.length})</h3>
              <button
                type="button"
                className="chip-btn"
                onClick={() => clearCart()}
              >
                Clear All
              </button>
            </div>

            <div className="cart-table-wrapper">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Item &amp; Farm</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cart-item-info">
                          <strong>{item.name}</strong>
                          <small>Farm: {item.farm || "Local Grower"}</small>
                        </div>
                      </td>
                      <td>
                        ${Number(item.price).toFixed(2)} / {item.unit || "kg"}
                      </td>
                      <td>
                        <div className="qty-control">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQuantity(item.id, -1)}
                          >
                            -
                          </button>
                          <span className="qty-num">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <strong>${(Number(item.price) * item.quantity).toFixed(2)}</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          title="Remove item"
                          onClick={() => handleRemove(item.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cart-footer-actions">
              <Link to="/products" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </section>

          {/* Right Column: Checkout Form & Order Summary */}
          <section className="card-panel checkout-summary-panel">
            <div className="panel-header">
              <h3>Order Summary</h3>
            </div>

            <div className="summary-breakdown">
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-line">
                <span>Direct Farm Logistics</span>
                <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {deliveryFee === 0 && (
                <span className="free-shipping-tag">✓ Free delivery unlocked (over $50)</span>
              )}
              <div className="summary-divider" />
              <div className="summary-line total-line">
                <strong>Grand Total</strong>
                <strong className="grand-price">${grandTotal.toFixed(2)}</strong>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="form-stack checkout-form">
              <span className="subheading" style={{ marginTop: "16px" }}>
                Delivery Details
              </span>

              <div>
                <label>Recipient Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={shipping.customer_name}
                  onChange={(e) =>
                    setShipping({ ...shipping, customer_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={shipping.customer_email}
                  onChange={(e) =>
                    setShipping({ ...shipping, customer_email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label>Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={shipping.customer_phone}
                  onChange={(e) =>
                    setShipping({ ...shipping, customer_phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label>Shipping / Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street address, city, postal code"
                  value={shipping.shipping_address}
                  onChange={(e) =>
                    setShipping({ ...shipping, shipping_address: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label>Payment Method</label>
                <select
                  value={shipping.payment_method}
                  onChange={(e) =>
                    setShipping({ ...shipping, payment_method: e.target.value })
                  }
                >
                  <option value="cod">Cash on Delivery (Direct to Farmer)</option>
                  <option value="upi">UPI / Instant Bank Transfer</option>
                  <option value="card">Debit / Credit Card</option>
                </select>
              </div>

              <button
                type="submit"
                className="button button-full order-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Placing Order..." : `Confirm Order ($${grandTotal.toFixed(2)}) →`}
              </button>

              <div className="secure-note" style={{ marginTop: "8px" }}>
                🔒 100% of product proceeds go directly to partner farms.
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

