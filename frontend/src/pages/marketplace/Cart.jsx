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
        </div>
      )}
    </main>
  );
}