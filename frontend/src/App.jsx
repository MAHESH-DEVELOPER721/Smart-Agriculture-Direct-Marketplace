import { useState } from "react";
import CropSelection from "./pages/crop_soil/CropSelection";
import SoilAnalysis from "./pages/crop_soil/SoilAnalysis";

const pages = [
  { id: "soil", label: "Soil analysis" },
  { id: "crops", label: "Crop selection" },
];

export default function App() {
  const [activePage, setActivePage] = useState("soil");

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Fieldwise</span>
        </div>
        <span className="header-caption">Smart agriculture tools</span>
      </header>

      <section className="hero">
        <p className="eyebrow">Grow with better information</p>
        <h1>Make your next field decision with confidence.</h1>
        <p>Explore a clear soil summary and starting-point crop suggestions for your farm.</p>
      </section>

      <nav className="page-tabs" aria-label="Agriculture tools">
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            className={activePage === page.id ? "tab-button active" : "tab-button"}
            aria-current={activePage === page.id ? "page" : undefined}
            onClick={() => setActivePage(page.id)}
          >
            {page.label}
          </button>
        ))}
      </nav>

      {activePage === "soil" ? <SoilAnalysis /> : <CropSelection />}

      <footer className="site-footer">
        <span>Fieldwise · Tools for informed growing</span>
        <span>Always confirm decisions with local agricultural experts.</span>
      </footer>
    </main>
  );
}
