import React from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CropSelection from "./pages/crop_soil/CropSelection";
import SoilAnalysis from "./pages/crop_soil/SoilAnalysis";
import DroughtMonitoring from "./pages/drought/DroughtMonitoring";
import Irrigation from "./pages/drought/Irrigation";
import Cart from "./pages/marketplace/Cart";
import Orders from "./pages/marketplace/Orders";
import Products from "./pages/marketplace/Products";
import { readSession } from "./services/api";

function Home() {
  const session = readSession();
  return (
    <main>
      <section className="hero page-shell">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> A better way to grow and buy</span>
          <h1>Rooted in good soil.<br /><span>Connected to opportunity.</span></h1>
          <p>One place for farmers and communities to make smarter growing decisions, monitor climate stress, and build direct connections from farm to table.</p>
          <div className="hero-actions">
            <Link className="button" to="/products">Explore Marketplace <span aria-hidden="true"> ↗</span></Link>
            <Link className="button button-outline" to="/soil-analysis">Test Your Soil</Link>
          </div>
          <div className="hero-proof"><span className="proof-icon">✳</span><span>Built for growers. Made for everyone.</span></div>
        </div>
        <div className="hero-art" role="img" aria-label="Illustration of sustainable farmland">
          <div className="sun" />
          <div className="field field-back" />
          <div className="field field-mid" />
          <div className="field field-front" />
          <div className="field-label"><span className="field-label-icon">↗</span><span><strong>Better harvests</strong><small>Start with smarter insights</small></span></div>
          <span className="art-leaf leaf-one">✦</span><span className="art-leaf leaf-two">✦</span>
        </div>
      </section>

      <section id="platform" className="platform-section">
        <div className="page-shell">
          <div className="section-heading">
            <span className="eyebrow">Integrated Smart Agriculture</span>
            <h2>Tools for a thriving farm community</h2>
            <p>Practical technology that supports every step, from healthy soil to a successful direct sale.</p>
          </div>

          <div className="feature-grid">
            <Link to="/soil-analysis" className="feature-card-link">
              <article className="feature-card">
                <span className="feature-icon icon-green">⌁</span>
                <h3>Know your soil</h3>
                <p>Turn soil NPK, pH, and moisture readings into clear, actionable guidance for your land.</p>
                <span className="feature-tag">ROHIT: SOIL ANALYSIS →</span>
              </article>
            </Link>

            <Link to="/crop-selection" className="feature-card-link">
              <article className="feature-card">
                <span className="feature-icon icon-green">🌱</span>
                <h3>Smart crop selection</h3>
                <p>Match suitable crops by seasonal weather, soil compatibility, and crop calendars.</p>
                <span className="feature-tag">ROHIT: CROP SELECTION →</span>
              </article>
            </Link>

            <Link to="/drought-monitoring" className="feature-card-link">
              <article className="feature-card">
                <span className="feature-icon icon-blue">◉</span>
                <h3>Drought risk early warnings</h3>
                <p>Keep an eye on precipitation deficits, evaporative demand, and drought bulletins.</p>
                <span className="feature-tag">SUNDAR: DROUGHT MONITOR →</span>
              </article>
            </Link>

            <Link to="/irrigation" className="feature-card-link">
              <article className="feature-card">
                <span className="feature-icon icon-blue">💧</span>
                <h3>Precision irrigation</h3>
                <p>Calculate customized field watering schedules and prevent evaporation loss.</p>
                <span className="feature-tag">SUNDAR: SMART IRRIGATION →</span>
              </article>
            </Link>

            <Link to="/products" className="feature-card-link">
              <article className="feature-card">
                <span className="feature-icon icon-amber">↗</span>
                <h3>Sell and buy direct</h3>
                <p>Bring farm-fresh vegetables, grains, and fruits directly to local consumers.</p>
                <span className="feature-tag">MANGA: MARKETPLACE →</span>
              </article>
            </Link>

            <Link to="/orders" className="feature-card-link">
              <article className="feature-card">
                <span className="feature-icon icon-amber">📦</span>
                <h3>Track farm orders</h3>
                <p>Real-time order fulfillment tracking from farm harvest to your doorstep.</p>
                <span className="feature-tag">MANGA: ORDERS TRACKING →</span>
              </article>
            </Link>
          </div>
        </div>
      </section>

      <section className="join-banner page-shell">
        <div>
          <span className="eyebrow">Your next season starts here</span>
          <h2>Let’s grow something good.</h2>
          <p>Join farmers and buyers building a more connected, resilient food community.</p>
        </div>
        <Link className="button button-light" to={session ? "/products" : "/register"}>
          {session ? "Explore Fresh Produce" : "Create your account"} <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}

function RequireAdmin({ children }) {
  const session = readSession();
  if (!session?.access_token) return <Navigate to="/login" replace />;
  if (session.user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

        {/* Rohit: Soil & Crops */}
        <Route path="/soil-analysis" element={<SoilAnalysis />} />
        <Route path="/crop-selection" element={<CropSelection />} />
        <Route path="/soil" element={<Navigate to="/soil-analysis" replace />} />
        <Route path="/crops" element={<Navigate to="/crop-selection" replace />} />

        {/* Sundar: Climate & Water */}
        <Route path="/drought-monitoring" element={<DroughtMonitoring />} />
        <Route path="/irrigation" element={<Irrigation />} />
        <Route path="/drought" element={<Navigate to="/drought-monitoring" replace />} />

        {/* Manga: Marketplace & Orders */}
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/marketplace" element={<Navigate to="/products" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
