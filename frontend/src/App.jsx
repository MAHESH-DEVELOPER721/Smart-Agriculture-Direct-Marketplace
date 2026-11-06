import React, { useState } from "react";

import DroughtMonitoring from "./pages/drought/DroughtMonitoring.jsx";
import Irrigation from "./pages/drought/Irrigation.jsx";

export default function App() {
  const [page, setPage] = useState("drought");

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="/" aria-label="Smart Agriculture home">
          <span className="app-brand-mark" aria-hidden="true">SA</span>
          <span>Smart Agriculture</span>
        </a>
        <nav className="app-nav" aria-label="Main navigation">
          <button
            type="button"
            className={page === "drought" ? "active" : ""}
            aria-current={page === "drought" ? "page" : undefined}
            onClick={() => setPage("drought")}
          >
            Drought monitoring
          </button>
          <button
            type="button"
            className={page === "irrigation" ? "active" : ""}
            aria-current={page === "irrigation" ? "page" : undefined}
            onClick={() => setPage("irrigation")}
          >
            Irrigation planner
          </button>
        </nav>
      </header>

      {page === "drought" ? <DroughtMonitoring /> : <Irrigation />}

      <footer className="app-footer">
        Smart Agriculture &amp; Direct Marketplace
      </footer>
    </div>
  );
}
