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
