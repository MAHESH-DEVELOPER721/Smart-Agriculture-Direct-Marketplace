import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../../services/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function Cart({ cart, onChangeQuantity, onRemove, onClear }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createOrder({
        ...form,
        items: cart.map(({ id, quantity }) => ({
          product_id: id,
          quantity,
        })),
      });
      onClear();
      navigate(`/orders?phone=${encodeURIComponent(form.phone.trim())}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
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
    <main className="page-shell">
      <section className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Your selection</p>
          <h1>Shopping cart</h1>
          <p className="muted">Review your items and enter delivery details.</p>
        </div>
      </section>

      {cart.length === 0 ? (
        <section className="empty-state">
          <span className="empty-icon" aria-hidden="true">🧺</span>
          <h2>Your cart is ready for something good.</h2>
          <p className="muted">Explore farm essentials and add items to your cart.</p>
          <Link className="button" to="/">Browse products</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Cart items">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-icon" aria-hidden="true">🌿</div>
                <div className="cart-item-main">
                  <h2>{item.name}</h2>
                  <p className="muted">{currency.format(item.price)} / {item.unit}</p>
                  <button
                    className="text-button remove-button"
                    type="button"
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                  <button
                    type="button"
                    aria-label={`Decrease ${item.name} quantity`}
                    onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${item.name} quantity`}
                    disabled={item.quantity >= item.stock}
                    onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <strong className="line-total">
                  {currency.format(item.price * item.quantity)}
                </strong>
              </article>
            ))}
            <Link className="text-button continue-link" to="/">← Continue shopping</Link>
          </section>

          <aside className="checkout-card">
            <h2>Delivery details</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Full name
                <input
                  autoComplete="name"
                  maxLength="120"
                  minLength="1"
                  name="customer_name"
                  onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
                  required
                  value={form.customer_name}
                />
              </label>
              <label>
                Phone number
                <input
                  autoComplete="tel"
                  maxLength="30"
                  minLength="5"
                  name="phone"
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  required
                  type="tel"
                  value={form.phone}
                />
              </label>
              <label>
                Delivery address
                <textarea
                  autoComplete="street-address"
                  maxLength="500"
                  minLength="5"
                  name="address"
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  required
                  rows="3"
                  value={form.address}
                />
              </label>
              <div className="checkout-total">
                <span>Order total</span>
                <strong>{currency.format(total)}</strong>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button checkout-button" disabled={loading} type="submit">
                {loading ? "Placing order..." : "Place order"}
              </button>
              <p className="fine-print">Stock is confirmed when your order is placed.</p>
            </form>
          </aside>
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
}

