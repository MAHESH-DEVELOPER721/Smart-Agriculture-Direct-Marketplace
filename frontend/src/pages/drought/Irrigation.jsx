import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function Irrigation() {
  const [schedule, setSchedule] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [calcForm, setCalcForm] = useState({
    crop: "Maize",
    field_area_acres: 2.0,
    soil_type: "loamy",
    temperature_c: 32,
    irrigation_method: "drip",
  });
  const [calcResult, setCalcResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/irrigation/schedule"),
      apiRequest("/irrigation/recommendations"),
    ])
      .then(([schedData, recData]) => {
        setSchedule(schedData);
        setRecommendations(recData.recommendations || []);
      })
      .catch((err) => setError(err.message || "Failed to load irrigation data."))
      .finally(() => setLoading(false));

    // Run initial calculation with default parameters
    runCalculation(calcForm);
  }, []);

  async function runCalculation(params) {
    setCalculating(true);
    try {
      const res = await apiRequest("/irrigation/calculate", {
        method: "POST",
        body: params,
      });
      setCalcResult(res);
    } catch {
      // Graceful fallback
    } finally {
      setCalculating(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setCalcForm((prev) => ({
      ...prev,
      [name]:
        name === "field_area_acres" || name === "temperature_c"
          ? parseFloat(value) || 0
          : value,
    }));
  }

  function handleCalculateSubmit(e) {
    e.preventDefault();
    runCalculation(calcForm);
  }

  return (
    <main className="page-shell module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MODULE: SMART IRRIGATION PLANNING (SUNDAR)
          </span>
          <h1>Precision Irrigation Scheduling &amp; Water Calculator</h1>
          <p>
            Optimize water delivery volume, prevent soil over-saturation, and maximize water-use efficiency through automated agronomic scheduling.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Active Schedule Overview Card */}
      {schedule && (
        <section className="card-panel schedule-banner" style={{ marginBottom: "32px" }}>
          <div className="panel-header">
            <div>
              <span className="badge badge-green">Active Irrigation Plan</span>
              <h3>Current Field Zone: {schedule.zone}</h3>
            </div>
            <span className="system-tag">{schedule.system_type || "Precision Drip"}</span>
          </div>

          <div className="schedule-metrics-row">
            <div className="sched-metric">
              <span className="sched-label">Cycle Frequency</span>
              <strong className="sched-val">Every {schedule.frequency_days} Days</strong>
              <small>Optimal rest interval</small>
            </div>
            <div className="sched-metric">
              <span className="sched-label">Run Duration</span>
              <strong className="sched-val">{schedule.duration_minutes} Mins</strong>
              <small>Per watering event</small>
            </div>
            <div className="sched-metric">
              <span className="sched-label">Water Target</span>
              <strong className="sched-val">{schedule.water_target_mm} mm</strong>
              <small>Depth equivalent</small>
            </div>
            <div className="sched-metric">
              <span className="sched-label">Operating Window</span>
              <strong className="sched-val" style={{ fontSize: "15px" }}>
                {schedule.best_time || "05:30 AM - 08:00 AM"}
              </strong>
              <small>Minimum evaporation window</small>
            </div>
          </div>

          {schedule.adjustment && (
            <div className="schedule-alert-box">
              <span className="alert-bulb">💡</span>
              <p><strong>Dynamic Weather Adjustment:</strong> {schedule.adjustment}</p>
            </div>
          )}
        </section>
      )}

      {/* Two-column layout: Calculator & Results */}
      <div className="two-col-layout" style={{ marginBottom: "36px" }}>
        {/* Left: Input Form */}
        <section className="card-panel">
          <div className="panel-header">
            <h3>Custom Field Water Calculator</h3>
            <p>Compute precise dosage based on your crop and field size</p>
          </div>

          <form onSubmit={handleCalculateSubmit} className="form-stack">
            <div className="input-grid-2">
              <div>
                <label htmlFor="crop-input">Crop Type</label>
                <select
                  id="crop-input"
                  name="crop"
                  value={calcForm.crop}
                  onChange={handleInputChange}
                >
                  <option value="Maize">Maize (Corn)</option>
                  <option value="Tomato">Tomato (Vegetables)</option>
                  <option value="Citrus">Citrus / Oranges</option>
                  <option value="Sorghum">Sorghum (Millet)</option>
                  <option value="Groundnut">Groundnut (Peanut)</option>
                  <option value="Chickpeas">Chickpeas (Pulses)</option>
                </select>
              </div>

              <div>
                <label htmlFor="field-area">Field Area (Acres)</label>
                <input
                  id="field-area"
                  name="field_area_acres"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={calcForm.field_area_acres}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="input-grid-2">
              <div>
                <label htmlFor="soil-type">Soil Type</label>
                <select
                  id="soil-type"
                  name="soil_type"
                  value={calcForm.soil_type}
                  onChange={handleInputChange}
                >
                  <option value="loamy">Loamy (Balanced Drainage)</option>
                  <option value="clay">Clay (High Water Retention)</option>
                  <option value="sandy">Sandy (Fast Draining)</option>
                  <option value="black">Black Soil (High Swelling)</option>
                </select>
              </div>

              <div>
                <label htmlFor="temp-input">Ambient Temperature (°C)</label>
                <input
                  id="temp-input"
                  name="temperature_c"
                  type="number"
                  step="1"
                  min="10"
                  max="50"
                  value={calcForm.temperature_c}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="method-input">Irrigation System</label>
              <select
                id="method-input"
                name="irrigation_method"
                value={calcForm.irrigation_method}
                onChange={handleInputChange}
              >
                <option value="drip">Drip Irrigation (90% Efficiency)</option>
                <option value="sprinkler">Sprinkler System (75% Efficiency)</option>
                <option value="furrow">Furrow / Flood (55% Efficiency)</option>
              </select>
            </div>

            <button type="submit" className="button button-full" disabled={calculating}>
              {calculating ? "Calculating Hydrology..." : "Calculate Water Requirements →"}
            </button>
          </form>
        </section>

        {/* Right: Calculated Dosage */}
        <section className="card-panel">
          <div className="panel-header">
            <h3>Calculated Water Dosage</h3>
            {calcResult && (
              <span className="badge badge-blue">
                Efficiency: {calcResult.efficiency_score_pct}%
              </span>
            )}
          </div>

          {calcResult ? (
            <div className="calc-result-box">
              <div className="result-stat-banner">
                <span className="res-stat-label">Total Water Per Irrigation Cycle</span>
                <strong className="res-stat-num">
                  {calcResult.estimated_water_liters.toLocaleString()} Liters
                </strong>
                <span className="res-stat-sub">
                  For {calcResult.field_area_acres} acres of {calcResult.crop}
                </span>
              </div>

              <div className="result-breakdown-grid">
                <div className="breakdown-card">
                  <span>Frequency</span>
                  <strong>Every {calcResult.recommended_frequency_days} Days</strong>
                </div>
                <div className="breakdown-card">
                  <span>Duration</span>
                  <strong>{calcResult.duration_minutes} Minutes</strong>
                </div>
                <div className="breakdown-card">
                  <span>Daily ET0 Demand</span>
                  <strong>{calcResult.daily_water_need_mm} mm/day</strong>
                </div>
                <div className="breakdown-card">
                  <span>Delivery Method</span>
                  <strong style={{ textTransform: "capitalize" }}>
                    {calcForm.irrigation_method}
                  </strong>
                </div>
              </div>

              {calcResult.weather_alert && (
                <div className="weather-calc-alert">
                  <span>ℹ</span>
                  <p>{calcResult.weather_alert}</p>
                </div>
              )}

              {calcResult.actionable_tips && (
                <div className="calc-tips-list">
                  <span className="subheading">Execution Tips:</span>
                  <ul>
                    {calcResult.actionable_tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Configure parameters on the left to compute customized irrigation doses.</p>
            </div>
          )}
        </section>
      </div>

      {/* Best Practices List */}
      {recommendations.length > 0 && (
        <section className="card-panel">
          <div className="panel-header">
            <div>
              <h3>Water Conservation &amp; System Maintenance Advisories</h3>
              <p>Recommended agronomic standards for modern irrigation systems</p>
            </div>
          </div>
          <ul className="guidelines-list">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="guideline-item">
                <span className="guideline-badge">✓</span>
                <p>{rec}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
