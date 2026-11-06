import { useEffect, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import Cart from "./pages/marketplace/Cart";
import Orders from "./pages/marketplace/Orders";
import Products from "./pages/marketplace/Products";

const CART_STORAGE_KEY = "smart-agri-marketplace-cart";

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) throw new TypeError("Saved cart must be a list.");
    return stored.filter(
      (item) =>
        Number.isInteger(item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        typeof item.name === "string" &&
        Number.isFinite(item.price) &&
        Number.isInteger(item.stock),
    );
  } catch (error) {
    console.error("Could not read the saved marketplace cart.", error);
    return [];
  }
}

function MarketplaceApp() {
  const [cart, setCart] = useState(readCart);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save the marketplace cart.", error);
    }
  }, [cart]);

  function addToCart(product) {
    const existing = cart.find((item) => item.id === product.id);
    if ((existing?.quantity ?? 0) >= product.stock) {
      setNotice(`Only ${product.stock} ${product.unit} of ${product.name} are available.`);
      return;
    }
    setCart((current) => {
      const item = current.find((entry) => entry.id === product.id);
      if (item) {
        return current.map((entry) =>
          entry.id === product.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your cart.`);
  }

  function changeQuantity(productId, quantity) {
    setCart((current) => {
      const item = current.find((entry) => entry.id === productId);
      if (!item) return current;
      if (quantity < 1) return current.filter((entry) => entry.id !== productId);
      if (quantity > item.stock) {
        setNotice(`Only ${item.stock} ${item.unit} of ${item.name} are available.`);
        return current;
      }
      return current.map((entry) =>
        entry.id === productId ? { ...entry, quantity } : entry,
      );
    });
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <BrowserRouter>
      <div className="app">
        <header className="site-header">
          <div className="header-inner">
            <Link className="brand" to="/" aria-label="AgriDirect home">
              <span className="brand-icon" aria-hidden="true">✳</span>
              <span>Agri<span className="brand-accent">Direct</span></span>
            </Link>
            <nav className="main-nav" aria-label="Main navigation">
              <NavLink end to="/">Marketplace</NavLink>
              <NavLink to="/orders">My orders</NavLink>
            </nav>
            <Link className="cart-link" to="/cart" aria-label={`Cart, ${cartCount} items`}>
              <span aria-hidden="true">Cart</span>
              <span className="cart-count">{cartCount}</span>
            </Link>
          </div>
        </header>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Products onAdd={addToCart} cart={cart} />} />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                onChangeQuantity={changeQuantity}
                onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))}
                onClear={() => setCart([])}
              />
            }
          />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<main className="page-shell"><h1>Page not found</h1><Link to="/">Return to marketplace</Link></main>} />
        </Routes>

        <footer className="site-footer">
          <div className="footer-inner">
            <span>AgriDirect</span>
            <span>Better growing starts here.</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return <MarketplaceApp />;
}
