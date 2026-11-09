import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, readCart, readSession } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const session = readSession();
  const user = session?.user;
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCount();
    function onCartChange() {
      updateCount();
    }
    window.addEventListener("agri_cart_updated", onCartChange);
    return () => window.removeEventListener("agri_cart_updated", onCartChange);
  }, []);

  function updateCount() {
    const cart = readCart();
    const count = cart.reduce((acc, it) => acc + (it.quantity || 1), 0);
    setCartCount(count);
  }

  function signOut() {
    clearSession();
    navigate("/");
  }

  return (
    <header className="site-header">
      <nav className="navbar page-shell" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="AgriDirect home">
          <span className="brand-mark">AG</span>
          <span>
            Agri<span className="brand-accent">Direct</span>
          </span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>

          {/* Rohit: Soil & Crops */}
          <div className="nav-dropdown">
            <span className="dropdown-trigger">Soil &amp; Crops ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/soil-analysis">Soil Health Analysis</NavLink>
              <NavLink to="/crop-selection">Crop Recommendation &amp; Calendar</NavLink>
            </div>
          </div>

          {/* Sundar: Drought & Water */}
          <div className="nav-dropdown">
            <span className="dropdown-trigger">Climate &amp; Water ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/drought-monitoring">Drought Risk Monitor</NavLink>
              <NavLink to="/irrigation">Smart Irrigation Planning</NavLink>
            </div>
          </div>

          {/* Manga: Marketplace */}
          <div className="nav-dropdown">
            <span className="dropdown-trigger">Marketplace ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/products">Fresh Produce Catalog</NavLink>
              <NavLink to="/orders">Order Tracking</NavLink>
            </div>
          </div>

          {/* Cart with live counter */}
          <NavLink to="/cart" className="cart-nav-link" title="Shopping Cart">
            🛒 Basket {cartCount > 0 && <span className="cart-badge-pill">{cartCount}</span>}
          </NavLink>

          {/* Mahesh: Admin Dashboard */}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}

          {/* Mahesh: Auth state */}
          {user ? (
            <div className="nav-user">
              <span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span>
              <span className="nav-user-name">{user.name}</span>
              <button
                type="button"
                className="button button-small button-outline"
                onClick={signOut}
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login">Sign in</NavLink>
              <Link className="button button-small" to="/register">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
