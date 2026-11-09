import React, { useMemo, useState } from "react";

const initialReadings = {
  location: "",
  temperature: "30",
  rainfall: "20",
  soilMoisture: "45",
};

function getDroughtStatus({ temperature, rainfall, soilMoisture }) {
  if (soilMoisture <= 20 || (rainfall < 5 && temperature >= 35)) {
    return {
      label: "High drought risk",
      className: "high",
      advice:
        "Check crops and soil promptly. Prioritize water for vulnerable plants and follow local water-use guidance.",
    };
  }

  if (soilMoisture <= 35 || rainfall < 15 || temperature >= 35) {
    return {
      label: "Moderate drought risk",
      className: "moderate",
      advice:
        "Keep monitoring soil moisture and weather. Consider watering early in the day if crops need it.",
    };
  }

  return {
    label: "Low drought risk",
    className: "low",
    advice:
      "Conditions look less dry based on these entries. Continue checking your field and local forecast.",
  };
}

export default function DroughtMonitoring() {
  const [readings, setReadings] = useState(initialReadings);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const numericReadings = {
    temperature: Number(readings.temperature) || 0,
    rainfall: Number(readings.rainfall) || 0,
    soilMoisture: Number(readings.soilMoisture) || 0,
  };
  const status = useMemo(
    () => getDroughtStatus(numericReadings),
    [numericReadings.temperature, numericReadings.rainfall, numericReadings.soilMoisture],
  );

  function updateReading(event) {
    const { name, value } = event.target;
    setReadings((current) => ({ ...current, [name]: value }));
    setSaveMessage("");
    setSaveError("");
  }

  async function saveAssessment(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/drought/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: readings.location.trim() || null,
          temperature_c: numericReadings.temperature,
          rainfall_mm: numericReadings.rainfall,
          soil_moisture_percent: numericReadings.soilMoisture,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Could not save this assessment.");
      }

      const assessment = await response.json();
      setSaveMessage(`Assessment saved (record #${assessment.id}).`);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not connect to the API.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="drought-page">
      <style>{`
        .drought-page {
          --green: #176b45;
          --ink: #1d2b24;
          --muted: #64736a;
          box-sizing: border-box;
          min-height: 100vh;
          padding: 40px 20px;
          color: var(--ink);
          background: #f4f8f3;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .drought-page *, .drought-page *::before, .drought-page *::after { box-sizing: inherit; }
        .drought-container { width: min(100%, 980px); margin: 0 auto; }
        .drought-eyebrow { margin: 0 0 8px; color: var(--green); font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
        .drought-page h1 { margin: 0; font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -.04em; }
        .drought-intro { max-width: 680px; margin: 12px 0 28px; color: var(--muted); line-height: 1.65; }
        .drought-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, .82fr); gap: 20px; align-items: start; }
        .drought-card { padding: 24px; border: 1px solid #e1e9e1; border-radius: 18px; background: #fff; box-shadow: 0 8px 26px #173a2610; }
        .drought-card h2 { margin: 0 0 7px; font-size: 1.2rem; }
        .drought-help { margin: 0 0 20px; color: var(--muted); font-size: .92rem; line-height: 1.5; }
        .drought-form { display: grid; gap: 16px; }
        .drought-field label { display: block; margin-bottom: 7px; font-size: .88rem; font-weight: 700; }
        .drought-field input { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #cdd9cf; border-radius: 9px; color: var(--ink); background: white; font: inherit; }
        .drought-field input:focus { outline: 3px solid #176b4525; border-color: var(--green); }
        .drought-field small { display: block; margin-top: 5px; color: var(--muted); font-size: .78rem; }
        .drought-status { display: inline-flex; align-items: center; gap: 8px; margin: 14px 0 10px; padding: 8px 12px; border-radius: 999px; font-size: .88rem; font-weight: 800; }
        .drought-status::before { width: 9px; height: 9px; border-radius: 50%; background: currentColor; content: ""; }
        .drought-status.low { color: #176b45; background: #e6f4ea; }
        .drought-status.moderate { color: #956000; background: #fff3d4; }
        .drought-status.high { color: #a3312c; background: #fde9e7; }
        .drought-advice { margin: 0; color: var(--muted); line-height: 1.6; }
        .drought-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 22px; }
        .drought-metric { padding: 13px 10px; border-radius: 12px; background: #f4f8f3; }
        .drought-metric strong { display: block; font-size: 1.05rem; }
        .drought-metric span { color: var(--muted); font-size: .76rem; }
        .drought-note { margin: 20px 0 0; padding: 13px 15px; border-left: 3px solid #a9c8b3; border-radius: 5px; color: #53645a; background: #f7faf6; font-size: .82rem; line-height: 1.55; }
        @media (max-width: 720px) { .drought-page { padding: 28px 15px; } .drought-grid { grid-template-columns: 1fr; } .drought-card { padding: 20px; } }
        @media (max-width: 380px) { .drought-metrics { grid-template-columns: 1fr; } }
      `}</style>

      <div className="drought-container">
        <p className="drought-eyebrow">Farm tools</p>
        <h1>Drought monitoring</h1>
        <p className="drought-intro">
          Enter recent field readings for a simple drought-risk screening. The
          assessment updates as you change the values.
        </p>

        <div className="drought-grid">
          <section className="drought-card" aria-labelledby="readings-title">
            <h2 id="readings-title">Field readings</h2>
            <p className="drought-help">
              Use measurements from your field and recent local weather records.
            </p>
            <form className="drought-form" onSubmit={saveAssessment}>
              <div className="drought-field">
                <label htmlFor="drought-location">Farm or field name (optional)</label>
                <input
                  id="drought-location"
                  name="location"
                  type="text"
                  placeholder="e.g. North field"
                  value={readings.location}
                  onChange={updateReading}
                />
              </div>
              <div className="drought-field">
                <label htmlFor="drought-soil">Soil moisture (%)</label>
                <input
                  id="drought-soil"
                  name="soilMoisture"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={readings.soilMoisture}
                  onChange={updateReading}
                />
                <small>Enter a sensor reading or your best measured estimate.</small>
              </div>
              <div className="drought-field">
                <label htmlFor="drought-rainfall">Rainfall in the last 7 days (mm)</label>
                <input
                  id="drought-rainfall"
                  name="rainfall"
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={readings.rainfall}
                  onChange={updateReading}
                />
              </div>
              <div className="drought-field">
                <label htmlFor="drought-temperature">Recent daytime temperature (°C)</label>
                <input
                  id="drought-temperature"
                  name="temperature"
                  type="number"
                  min="-20"
                  max="60"
                  step="0.1"
                  required
                  value={readings.temperature}
                  onChange={updateReading}
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  minHeight: 44,
                  border: 0,
                  borderRadius: 9,
                  color: "#fff",
                  background: "#176b45",
                  font: "inherit",
                  fontWeight: 700,
                  cursor: isSaving ? "wait" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Save assessment"}
              </button>
              {saveMessage && <p role="status">{saveMessage}</p>}
              {saveError && <p role="alert">{saveError}</p>}
            </form>
          </section>

          <section className="drought-card" aria-live="polite" aria-labelledby="assessment-title">
            <h2 id="assessment-title">Current assessment</h2>
            <p className="drought-help">
              {readings.location.trim() || "Your field"} · Based on the values entered
            </p>
            <div className={`drought-status ${status.className}`}>{status.label}</div>
            <p className="drought-advice">{status.advice}</p>
            <div className="drought-metrics">
              <div className="drought-metric">
                <strong>{numericReadings.soilMoisture}%</strong>
                <span>Soil moisture</span>
              </div>
              <div className="drought-metric">
                <strong>{numericReadings.rainfall} mm</strong>
                <span>7-day rainfall</span>
              </div>
              <div className="drought-metric">
                <strong>{numericReadings.temperature}°C</strong>
                <span>Temperature</span>
              </div>
            </div>
            <p className="drought-note">
              This is an indicative screening based only on the values you enter,
              not live sensor or weather data. Risk thresholds vary by crop, soil,
              and region; use local forecasts and agricultural guidance for decisions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function DroughtMonitoring() {
  const [monitor, setMonitor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("North Basin");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDroughtData();
  }, [selectedRegion, severityFilter]);

  async function fetchDroughtData() {
    setLoading(true);
    setError("");
    try {
      const monitorRes = await apiRequest(`/drought/monitor?region=${encodeURIComponent(selectedRegion)}`);
      setMonitor(monitorRes);

      const alertQuery = severityFilter !== "all" ? `/drought/alerts?severity=${severityFilter}` : "/drought/alerts";
      const alertsRes = await apiRequest(alertQuery);
      setAlerts(alertsRes.alerts || []);
    } catch (err) {
      setError(err.message || "Failed to load drought monitoring data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MODULE: DROUGHT &amp; CLIMATE MONITORING (SUNDAR)
          </span>
          <h1>Regional Drought Risk &amp; Climate Early Warning</h1>
          <p>
            Real-time precipitation deficit tracking, evaporative demand indicators, and automated drought mitigation advisories.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Region Selector Bar */}
      <section className="filter-toolbar">
        <div className="filter-group">
          <label htmlFor="region-select">Select Agro-Climatic Zone:</label>
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="North Basin">North Basin (Watch Status)</option>
            <option value="East Valley">East Valley (Semi-Arid)</option>
            <option value="Southern Plains">Southern Plains (Moderate)</option>
            <option value="Western Highlands">Western Highlands (Normal)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="severity-select">Alert Severity Filter:</label>
          <select
            id="severity-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="high">High &amp; Severe Only</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low / Normal</option>
          </select>
        </div>
      </section>

      {/* Monitor Metrics Overview */}
      {monitor && (
        <section className="stats-grid" style={{ marginBottom: "32px" }}>
          <article className="stat-card">
            <span className="stat-icon stat-amber">⚠</span>
            <span className="stat-label">Drought Severity</span>
            <strong style={{ textTransform: "capitalize" }}>{monitor.severity}</strong>
            <small>Status: {monitor.risk_level || "Active Watch"}</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon stat-blue">🌧</span>
            <span className="stat-label">Rainfall (Recorded)</span>
            <strong>{monitor.rainfall_mm} mm</strong>
            <small>Deficit: -{monitor.rainfall_deficit_pct || 32}%</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon stat-green">🌱</span>
            <span className="stat-label">Sub-surface Moisture</span>
            <strong>{monitor.soil_moisture_pct}%</strong>
            <small>Trend: {monitor.trend} condition</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon stat-leaf">🌡</span>
            <span className="stat-label">Ambient Temp &amp; EDDI</span>
            <strong>{monitor.temperature_c || 32}°C</strong>
            <small>Drought Index: {monitor.drought_index || 2.8} (Moderate)</small>
          </article>
        </section>
      )}

      {/* Active Drought Alerts List */}
      <section className="card-panel" style={{ marginBottom: "32px" }}>
        <div className="panel-header">
          <div>
            <h3>Active Regional Drought Warnings &amp; Advisories</h3>
            <p>Monitored agricultural zones with moisture alerts</p>
          </div>
          <span className="badge badge-amber">{alerts.length} Active Bulletins</span>
        </div>

        {loading ? (
          <div className="loading-card">Refreshing meteorological radar...</div>
        ) : (
          <div className="alerts-stack">
            {alerts.map((al) => (
              <div
                key={al.id}
                className={`alert-bulletin ${
                  al.severity === "high" || al.severity === "severe"
                    ? "bulletin-high"
                    : al.severity === "moderate"
                    ? "bulletin-mod"
                    : "bulletin-low"
                }`}
              >
                <div className="bulletin-top">
                  <div className="bulletin-region-title">
                    <span className="region-name">{al.region}</span>
                    <span className={`severity-tag tag-${al.severity}`}>
                      {al.severity} risk
                    </span>
                  </div>
                  {al.soil_moisture_pct !== undefined && (
                    <span className="bulletin-metric">
                      Moisture: <strong>{al.soil_moisture_pct}%</strong> | Rainfall: <strong>{al.rainfall_mm} mm</strong>
                    </span>
                  )}
                </div>
                <p className="bulletin-msg">{al.message}</p>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="empty-state">
                <p>No active alerts recorded for the selected filter.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Drought Mitigation Guidance */}
      <section className="card-panel">
        <div className="panel-header">
          <div>
            <h3>Climate-Smart Drought Mitigation Strategies</h3>
            <p>Proven agronomic practices to preserve yields under water scarcity</p>
          </div>
        </div>

        <div className="strategy-grid">
          <article className="strategy-card">
            <span className="strat-number">01</span>
            <h4>Regulated Deficit Irrigation (RDI)</h4>
            <p>
              Reduce water application during vegetative stages and concentrate available volume during critical flowering and fruit set phases.
            </p>
          </article>

          <article className="strategy-card">
            <span className="strat-number">02</span>
            <h4>Organic Straw &amp; Plastic Mulching</h4>
            <p>
              Covering the topsoil reduces direct surface evaporation by 40-50% while regulating root-zone soil temperature against midday heat.
            </p>
          </article>

          <article className="strategy-card">
            <span className="strat-number">03</span>
            <h4>Night &amp; Dawn Irrigation Scheduling</h4>
            <p>
              Operating pumps between 05:00 AM and 08:00 AM eliminates peak wind drift and solar vapor loss, increasing water usage efficiency to over 90%.
            </p>
          </article>

          <article className="strategy-card">
            <span className="strat-number">04</span>
            <h4>Soil Humic Amendments</h4>
            <p>
              Incorporate mature compost and biochar to expand the soil water-holding capacity, allowing roots to access moisture for 3 additional days.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

