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

                  <div className="order-meta-right">
                    <span className={`status-badge status-${String(ord.status).toLowerCase()}`}>
                      ● {ord.status}
                    </span>
                    <span className="order-amount">${Number(ord.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Progress Step Bar */}
                <div className="order-progress-stepper">
                  <div className={`step-node ${step >= 1 ? "node-done" : ""}`}>
                    <span className="dot" />
                    <span>Placed</span>
                  </div>
                  <div className={`step-line ${step >= 2 ? "line-done" : ""}`} />
                  <div className={`step-node ${step >= 2 ? "node-done" : ""}`}>
                    <span className="dot" />
                    <span>Harvest Prepped</span>
                  </div>
                  <div className={`step-line ${step >= 3 ? "line-done" : ""}`} />
                  <div className={`step-node ${step >= 3 ? "node-done" : ""}`}>
                    <span className="dot" />
                    <span>Dispatched</span>
                  </div>
                  <div className={`step-line ${step >= 4 ? "line-done" : ""}`} />
                  <div className={`step-node ${step >= 4 ? "node-done" : ""}`}>
                    <span className="dot" />
                    <span>Delivered</span>
                  </div>
                </div>

                <div className="order-details-grid">
                  <div>
                    <label>Recipient &amp; Delivery Destination</label>
                    <p>
                      <strong>{ord.customer_name}</strong>
                      <br />
                      {ord.shipping_address || ord.delivery_address || "Standard Farm Route"}
                      <br />
                      <small className="muted-text">Contact: {ord.customer_phone || "Not recorded"}</small>
                    </p>
                  </div>

                  <div>
                    <label>Payment &amp; Logistics</label>
                    <p>
                      <strong>Payment:</strong> {String(ord.payment_method || "COD").toUpperCase()}
                      <br />
                      <strong>Packaging:</strong> Direct Farm Sealed
                    </p>
                  </div>
                </div>

                {ord.items && ord.items.length > 0 && (
                  <div className="order-items-snippet">
                    <label>Harvest Items in Consignment ({ord.items.length})</label>
                    <div className="items-chip-list">
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
