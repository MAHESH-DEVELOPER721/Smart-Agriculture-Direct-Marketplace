import { useState } from "react";
import { analyzeSoil } from "../../services/api";

const initialForm = {
  nitrogen: "50",
  phosphorus: "40",
  potassium: "40",
  ph: "6.5",
  soil_type: "loam",
  location: "",
};

const fields = [
  { name: "nitrogen", label: "Nitrogen (N)", min: 0, max: 300, step: 0.1 },
  { name: "phosphorus", label: "Phosphorus (P)", min: 0, max: 300, step: 0.1 },
  { name: "potassium", label: "Potassium (K)", min: 0, max: 500, step: 0.1 },
  { name: "ph", label: "Soil pH", min: 0, max: 14, step: 0.1 },
];

export default function SoilAnalysis() {
  const [form, setForm] = useState(initialForm);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setAnalysis(null);
    setIsLoading(true);
    try {
      setAnalysis(await analyzeSoil({
        ...form,
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        ph: Number(form.ph),
        location: form.location.trim() || null,
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

const PRESETS = {
  optimal: {
    location: "North Valley - Field 4",
    moisture_pct: 62,
    ph: 6.5,
    nitrogen: 55,
    phosphorus: 42,
    potassium: 60,
  },
  acidic_dry: {
    location: "East Hilltop Plot",
    moisture_pct: 32,
    ph: 5.2,
    nitrogen: 28,
    phosphorus: 20,
    potassium: 35,
  },
  alkaline_wet: {
    location: "South Delta Basin",
    moisture_pct: 82,
    ph: 8.1,
    nitrogen: 65,
    phosphorus: 50,
    potassium: 75,
  },
};

export default function SoilAnalysis() {
  const [form, setForm] = useState(PRESETS.optimal);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/soil/analysis?location=north-field")
      .then((data) => setResult(data))
      .catch(() => {});

    apiRequest("/soil/reports")
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {});
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "location" ? value : parseFloat(value) || 0,
    }));
  }

  function applyPreset(type) {
    if (PRESETS[type]) {
      setForm(PRESETS[type]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/soil/analysis", {
        method: "POST",
        body: form,
      });
      setResult(data);
      setHistory((prev) => [data, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err.message || "Failed to process soil analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-card" aria-labelledby="soil-analysis-title">
      <div className="section-heading">
        <p className="eyebrow">Understand your soil test</p>
        <h2 id="soil-analysis-title">Soil analysis</h2>
        <p>Enter lab readings to view a simple pH category and nutrient summary.</p>
      </div>

      <form className="data-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          {fields.map((field) => (
            <label className="field" key={field.name}>
              <span>{field.label}</span>
              <input
                type="number"
                name={field.name}
                value={form[field.name]}
                min={field.min}
                max={field.max}
                step={field.step}
                required
                onChange={updateField}
              />
            </label>
          ))}
          <label className="field">
            <span>Soil type</span>
            <select name="soil_type" value={form.soil_type} onChange={updateField}>
              <option value="loam">Loam</option>
              <option value="clay">Clay</option>
              <option value="black">Black soil</option>
              <option value="sandy">Sandy</option>
              <option value="silt">Silt</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="field">
            <span>Location <small>(optional)</small></span>
            <input
              type="text"
              name="location"
              value={form.location}
              maxLength={255}
              placeholder="Village or region"
              onChange={updateField}
            />
          </label>
        </div>
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing…" : "Analyze soil"}
        </button>
      </form>

      {error && <p className="notice error-notice" role="alert">{error}</p>}
      {analysis && (
        <div className="result-panel" aria-live="polite">
          <h3>Soil summary</h3>
          <dl className="summary-list">
            <div><dt>pH category</dt><dd>{analysis.ph_status}</dd></div>
            <div><dt>Nutrient readings</dt><dd>{analysis.nutrient_summary}</dd></div>
            <div><dt>Soil type</dt><dd>{analysis.soil_type}</dd></div>
          </dl>
          <p className="result-note">{analysis.note}</p>
        </div>
      )}
    </section>
  );
}
    <main className="page-shell module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MODULE: SOIL &amp; CROP INTELLIGENCE (ROHIT)
          </span>
          <h1>Precision Soil Health Diagnostic</h1>
          <p>
            Measure soil chemistry and receive calibrated nutrient amendments and irrigation advisories.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="two-col-layout">
        {/* Left Column: Form */}
        <section className="card-panel">
          <div className="panel-header">
            <h3>Enter Soil Test Metrics</h3>
            <div className="preset-buttons">
              <span className="preset-label">Quick sample:</span>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset("optimal")}
              >
                Optimal
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset("acidic_dry")}
              >
                Acidic &amp; Dry
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset("alkaline_wet")}
              >
                Alkaline
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <div>
              <label htmlFor="location">Field / Farm Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleInputChange}
                required
                placeholder="e.g. North Basin Plot B"
              />
            </div>

            <div className="input-grid-2">
              <div>
                <label htmlFor="moisture_pct">Soil Moisture (%)</label>
                <input
                  id="moisture_pct"
                  name="moisture_pct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={form.moisture_pct}
                  onChange={handleInputChange}
                  required
                />
                <span className="input-hint">Ideal range: 45% - 70%</span>
              </div>
              <div>
                <label htmlFor="ph">Soil pH Level</label>
                <input
                  id="ph"
                  name="ph"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={form.ph}
                  onChange={handleInputChange}
                  required
                />
                <span className="input-hint">Neutral / ideal: 6.0 - 7.5</span>
              </div>
            </div>

            <div className="nutrient-inputs">
              <span className="subheading">Primary Macro-Nutrients (NPK)</span>
              <div className="input-grid-3">
                <div>
                  <label htmlFor="nitrogen">Nitrogen (N)</label>
                  <input
                    id="nitrogen"
                    name="nitrogen"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.nitrogen}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="input-hint">Target: 40-70</span>
                </div>
                <div>
                  <label htmlFor="phosphorus">Phosphorus (P)</label>
                  <input
                    id="phosphorus"
                    name="phosphorus"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.phosphorus}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="input-hint">Target: 30-60</span>
                </div>
                <div>
                  <label htmlFor="potassium">Potassium (K)</label>
                  <input
                    id="potassium"
                    name="potassium"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.potassium}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="input-hint">Target: 40-80</span>
                </div>
              </div>
            </div>

            <button type="submit" className="button button-full" disabled={loading}>
              {loading ? "Analyzing Soil..." : "Run Soil Health Diagnostic →"}
            </button>
          </form>
        </section>

        {/* Right Column: Results */}
        <section className="card-panel">
          <div className="panel-header">
            <h3>Diagnostic Report</h3>
            {result && (
              <span className="badge badge-green">
                Location: {result.location || "Field"}
              </span>
            )}
          </div>

          {result ? (
            <div className="diagnostic-display">
              {/* Health Score Summary */}
              <div className="score-box">
                <div className="score-metric">
                  <span className="score-num">{result.health_score ?? 85}</span>
                  <span className="score-max">/100</span>
                </div>
                <div className="score-info">
                  <strong>Soil Health Index</strong>
                  <p>
                    {result.health_score > 80
                      ? "Excellent fertility and moisture balance."
                      : result.health_score > 60
                      ? "Fair condition, requires targeted amendment."
                      : "Critical condition; soil needs soil conditioning."}
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="status-pills-row">
                <div className="metric-pill">
                  <span className="pill-title">pH Reaction</span>
                  <span className={`pill-val ${result.ph < 6 ? "val-amber" : result.ph > 7.5 ? "val-blue" : "val-green"}`}>
                    {result.ph_status || (result.ph < 6 ? "Acidic" : result.ph > 7.5 ? "Alkaline" : "Optimal")} ({result.ph})
                  </span>
                </div>
                <div className="metric-pill">
                  <span className="pill-title">Moisture Status</span>
                  <span className={`pill-val ${result.moisture_pct < 40 ? "val-amber" : result.moisture_pct > 75 ? "val-blue" : "val-green"}`}>
                    {result.moisture_status || (result.moisture_pct < 40 ? "Deficit" : "Optimal")} ({result.moisture_pct}%)
                  </span>
                </div>
                <div className="metric-pill">
                  <span className="pill-title">Nutrients (NPK)</span>
                  <span className="pill-val val-green">
                    {result.nutrient_status || "Balanced"}
                  </span>
                </div>
              </div>

              {/* Meter bars */}
              <div className="meters-stack">
                <div className="meter-row">
                  <div className="meter-label">
                    <span>Moisture Level</span>
                    <strong>{result.moisture_pct}%</strong>
                  </div>
                  <div className="meter-bar">
                    <div
                      className="meter-fill fill-blue"
                      style={{ width: `${Math.min(result.moisture_pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-label">
                    <span>Nitrogen (N)</span>
                    <strong>{result.nitrogen} mg/kg</strong>
                  </div>
                  <div className="meter-bar">
                    <div
                      className="meter-fill fill-green"
                      style={{ width: `${Math.min((result.nitrogen / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-label">
                    <span>Phosphorus (P)</span>
                    <strong>{result.phosphorus} mg/kg</strong>
                  </div>
                  <div className="meter-bar">
                    <div
                      className="meter-fill fill-amber"
                      style={{ width: `${Math.min((result.phosphorus / 80) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-label">
                    <span>Potassium (K)</span>
                    <strong>{result.potassium} mg/kg</strong>
                  </div>
                  <div className="meter-bar">
                    <div
                      className="meter-fill fill-purple"
                      style={{ width: `${Math.min((result.potassium / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Agronomic recommendation */}
              <div className="recommendation-card">
                <span className="rec-icon">✳</span>
                <div>
                  <strong>Expert Agronomy Recommendation</strong>
                  <p>{result.recommendation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Submit your test parameters to inspect soil condition and amendments.</p>
            </div>
          )}
        </section>
      </div>

      {history.length > 0 && (
        <section className="table-panel" style={{ marginTop: "32px" }}>
          <div className="table-heading">
            <div>
              <h2>Recent Soil Field Tests</h2>
              <p>Historical readings logged for your farms</p>
            </div>
            <span className="table-count">{history.length} tests</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Moisture</th>
                  <th>pH</th>
                  <th>N - P - K</th>
                  <th>Recommendation Summary</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td><strong>{item.location}</strong></td>
                    <td>{item.moisture_pct}%</td>
                    <td>{item.ph}</td>
                    <td>{item.nitrogen} / {item.phosphorus} / {item.potassium}</td>
                    <td>
                      <small className="table-note">{item.recommendation}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

