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