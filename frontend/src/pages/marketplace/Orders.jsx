import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrders } from "../../services/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function loadOrders(value) {
    const normalizedPhone = value.trim();
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      setOrders(await getOrders(normalizedPhone));
    } catch (requestError) {
      setOrders([]);
      setError(requestError.message);
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../../services/api";

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const successMessage = location.state?.successMessage;

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/marketplace/orders");
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message || "Failed to load marketplace orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialPhone = searchParams.get("phone");
    if (initialPhone) {
      setPhone(initialPhone);
      loadOrders(initialPhone);
    }
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedPhone = phone.trim();
    setSearchParams(normalizedPhone ? { phone: normalizedPhone } : {});
    if (normalizedPhone.length >= 5) loadOrders(normalizedPhone);
    else {
      setOrders([]);
      setSearched(false);
      setError("Enter a phone number with at least 5 characters.");
    }
  }

  return (
    <main className="page-shell">
      <section className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Order history</p>
          <h1>Track your orders</h1>
          <p className="muted">Enter the phone number used at checkout to find your orders.</p>
        </div>
      </section>
      <form className="order-search" onSubmit={handleSubmit}>
        <label>
          Phone number
          <input
            autoComplete="tel"
            maxLength="30"
            minLength="5"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="e.g. +91 98765 43210"
            required
            type="tel"
            value={phone}
          />
        </label>
        <button className="button" disabled={loading} type="submit">
          {loading ? "Searching..." : "Find orders"}
        </button>
      </form>

      {error && <p className="form-error order-error" role="alert">{error}</p>}
      {!loading && searched && !error && orders.length === 0 && (
        <p className="state-message">No orders found for this phone number.</p>
      )}
      {!loading && orders.length > 0 && (
        <section className="orders-list" aria-label="Your orders">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-heading">
                <div>
                  <p className="eyebrow">Order #{order.id}</p>
                  <h2>{formatDate(order.created_at)}</h2>
                </div>
                <span className="order-status">{order.status}</span>
              </div>
              <div className="order-lines">
                {order.items.map((item) => (
                  <div className="order-line" key={item.id}>
                    <span>{item.product_name} <small>× {item.quantity}</small></span>
                    <span>{currency.format(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="order-summary">
                <span>Delivering to {order.customer_name}</span>
                <strong>{currency.format(order.total_amount)}</strong>
              </div>
              <p className="muted order-address">{order.address}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
  const filteredOrders = orders.filter((o) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (o.id && String(o.id).toLowerCase().includes(q)) ||
      (o.order_code && o.order_code.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q))
    );
  });

  function getStatusStep(status) {
    const s = String(status).toLowerCase();
    if (s === "fulfilled" || s === "delivered") return 4;
    if (s === "in_transit" || s === "dispatched") return 3;
    if (s === "confirmed" || s === "processing") return 2;
    return 1;
  }

  return (
    <main className="page-shell module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MODULE: DIRECT MARKETPLACE (MANGA)
          </span>
          <h1>Farm Order Tracking &amp; History</h1>
          <p>
            Monitor real-time fulfillment status of produce dispatches straight from rural growers to your doorstep.
          </p>
        </div>

        <Link to="/products" className="button button-outline">
          + Order More Produce
        </Link>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: "24px" }}>
          🎉 {successMessage}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search Bar */}
      <section className="orders-search-bar">
        <input
          type="text"
          placeholder="Filter by Order ID (e.g. ORD-1001) or customer name..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
        <span className="orders-count-badge">
          {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
        </span>
      </section>

      {/* Orders List */}
      <section className="orders-stack">
        {loading ? (
          <div className="loading-card">Loading order dispatch logs...</div>
        ) : (
          filteredOrders.map((ord) => {
            const step = getStatusStep(ord.status);
            const orderId = ord.order_code || ord.id;
            return (
              <article key={orderId} className="card-panel order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id-label">{orderId}</span>
                    <span className="order-date">
                      {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                  <span className={`status-pill status-${ord.status || "confirmed"}`}>
                    {(ord.status || "Confirmed").replace("_", " ")}
                  </span>
                </div>

                {/* Tracking Progress Stepper */}
                <div className="order-stepper">
                  <div className={`step-node ${step >= 1 ? "step-active" : ""}`}>
                    <span className="node-dot">1</span>
                    <span className="node-label">Placed</span>
                  </div>
                  <div className={`step-connector ${step >= 2 ? "conn-active" : ""}`} />
                  <div className={`step-node ${step >= 2 ? "step-active" : ""}`}>
                    <span className="node-dot">2</span>
                    <span className="node-label">Confirmed</span>
                  </div>
                  <div className={`step-connector ${step >= 3 ? "conn-active" : ""}`} />
                  <div className={`step-node ${step >= 3 ? "step-active" : ""}`}>
                    <span className="node-dot">3</span>
                    <span className="node-label">In Transit</span>
                  </div>
                  <div className={`step-connector ${step >= 4 ? "conn-active" : ""}`} />
                  <div className={`step-node ${step >= 4 ? "step-active" : ""}`}>
                    <span className="node-dot">4</span>
                    <span className="node-label">Fulfilled</span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="order-details-grid">
                  <div className="detail-col">
                    <span className="detail-label">Recipient</span>
                    <strong>{ord.customer_name || "Community Customer"}</strong>
                    <small>{ord.customer_email}</small>
                  </div>

                  <div className="detail-col">
                    <span className="detail-label">Delivery Address</span>
                    <strong style={{ fontSize: "13px" }}>
                      {ord.shipping_address || "Standard delivery address"}
                    </strong>
                  </div>

                  <div className="detail-col">
                    <span className="detail-label">Total Amount</span>
                    <strong className="order-total-amount">
                      ${Number(ord.total || ord.total_amount || 0).toFixed(2)}
                    </strong>
                    <small>Direct Farmer Settlement</small>
                  </div>
                </div>

                {/* Items Summary */}
                {ord.items && ord.items.length > 0 && (
                  <div className="order-items-snippet">
                    <span className="snippet-title">Order Items:</span>
                    <div className="snippet-tags">
                      {ord.items.map((it, idx) => (
                        <span key={idx} className="item-snippet-tag">
                          {it.product_name} × {it.quantity} {it.unit || "unit"} (${Number(it.price).toFixed(2)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="empty-state">
            <p>No agricultural orders match your search query.</p>
            <Link to="/products" className="button" style={{ marginTop: "12px" }}>
              Shop Fresh Harvest Produce →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

