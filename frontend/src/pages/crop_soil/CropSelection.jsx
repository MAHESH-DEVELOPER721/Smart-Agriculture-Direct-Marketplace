import { useState } from "react";
import { recommendCrops } from "../../services/api";

const initialForm = {
  nitrogen: "50",
  phosphorus: "40",
  potassium: "40",
  ph: "6.5",
  rainfall_mm: "700",
  temperature_c: "25",
  soil_type: "loam",
};

const fields = [
  { name: "nitrogen", label: "Nitrogen (N)", min: 0, max: 300, step: 0.1 },
  { name: "phosphorus", label: "Phosphorus (P)", min: 0, max: 300, step: 0.1 },
  { name: "potassium", label: "Potassium (K)", min: 0, max: 500, step: 0.1 },
  { name: "ph", label: "Soil pH", min: 0, max: 14, step: 0.1 },
  { name: "rainfall_mm", label: "Seasonal rainfall (mm)", min: 0, max: 10000, step: 1 },
  { name: "temperature_c", label: "Temperature (°C)", min: -10, max: 60, step: 0.1 },
];

export default function CropSelection() {
  const [form, setForm] = useState(initialForm);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setRecommendations(null);
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        ph: Number(form.ph),
        rainfall_mm: Number(form.rainfall_mm),
        temperature_c: Number(form.temperature_c),
      };
      setRecommendations({
        ...await recommendCrops(payload),
        input: payload,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-card" aria-labelledby="crop-selection-title">
      <div className="section-heading">
        <p className="eyebrow">Plan for your growing conditions</p>
        <h2 id="crop-selection-title">Crop selection</h2>
        <p>Enter your soil and seasonal conditions to see illustrative crop suggestions.</p>
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
        </div>
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Finding suggestions…" : "Get crop suggestions"}
        </button>
      </form>

      {error && <p className="notice error-notice" role="alert">{error}</p>}
      {recommendations && (
        <div className="result-panel" aria-live="polite">
          <h3>Conditions submitted</h3>
          <dl className="summary-list">
            <div><dt>N / P / K</dt><dd>{recommendations.input.nitrogen} / {recommendations.input.phosphorus} / {recommendations.input.potassium}</dd></div>
            <div><dt>Soil pH and type</dt><dd>{recommendations.input.ph} · {recommendations.input.soil_type}</dd></div>
            <div><dt>Rainfall</dt><dd>{recommendations.input.rainfall_mm} mm</dd></div>
            <div><dt>Temperature</dt><dd>{recommendations.input.temperature_c} °C</dd></div>
          </dl>
          <h3>Suggested crops</h3>
          <ul className="suggestion-list">
            {recommendations.recommendations.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.reason}</span>
              </li>
            ))}
          </ul>
          <p className="result-note">{recommendations.note}</p>
        </div>
      )}
    </section>
  );
}
import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function CropSelection() {
  const [region, setRegion] = useState("north-field");
  const [season, setSeason] = useState("all");
  const [soilType, setSoilType] = useState("all");
  const [crops, setCrops] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
    fetchCalendar();
  }, [region, season, soilType]);

  async function fetchRecommendations() {
    setLoading(true);
    setError("");
    try {
      let query = `/crop/recommendations?region=${encodeURIComponent(region)}`;
      if (season !== "all") query += `&season=${encodeURIComponent(season)}`;
      if (soilType !== "all") query += `&soil_type=${encodeURIComponent(soilType)}`;

      const res = await apiRequest(query);
      setCrops(res.recommendations || []);
      if (res.recommendations && res.recommendations.length > 0) {
        setSelectedCrop(res.recommendations[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load crop recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCalendar(cropName) {
    try {
      const query = cropName ? `/crop/calendar?crop=${encodeURIComponent(cropName)}` : "/crop/calendar";
      const calRes = await apiRequest(query);
      setCalendar(calRes);
    } catch {
      // Keep existing calendar on error
    }
  }

  function handleCropClick(c) {
    setSelectedCrop(c);
    fetchCalendar(c.crop);
  }

  return (
    <main className="page-shell module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MODULE: SOIL &amp; CROP INTELLIGENCE (ROHIT)
          </span>
          <h1>Smart Crop Selection &amp; Seasonal Calendar</h1>
          <p>
            AI-assisted crop suitability matching based on regional soil chemistry, climate risks, and seasonal demand.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter Toolbar */}
      <section className="filter-toolbar">
        <div className="filter-group">
          <label htmlFor="region-select">Region / Zone:</label>
          <select
            id="region-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="north-field">North Basin (Temperate / Loamy)</option>
            <option value="east-valley">East Valley (Semi-Arid / High Sun)</option>
            <option value="south-delta">South Delta (High Moisture Alluvial)</option>
            <option value="highland-zone">Highland Zone (Cooler / Well-Drained)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="season-select">Growing Season:</label>
          <select
            id="season-select"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value="all">All Seasons</option>
            <option value="kharif">Kharif (Monsoon / Rainfed)</option>
            <option value="rabi">Rabi (Winter / Irrigated)</option>
            <option value="zaid">Zaid (Summer Crop)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="soil-select">Soil Texture:</label>
          <select
            id="soil-select"
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
          >
            <option value="all">All Soil Types</option>
            <option value="loamy">Loamy Soil</option>
            <option value="clay">Clay Soil</option>
            <option value="sandy">Sandy Loam</option>
            <option value="black">Black Cotton Soil</option>
          </select>
        </div>
      </section>

      {/* Recommended Crops Grid */}
      <section className="crops-section">
        <div className="section-title-row">
          <div>
            <h2>Top Recommended Crops</h2>
            <p>Ranked by regional soil compatibility and agronomic yield forecast</p>
          </div>
          <span className="badge badge-green">{crops.length} Matched Crops</span>
        </div>

        {loading ? (
          <div className="loading-card">Calculating crop suitability indices...</div>
        ) : (
          <div className="crops-grid">
            {crops.map((c) => (
              <article
                key={c.crop}
                className={`crop-card ${selectedCrop?.crop === c.crop ? "crop-card-selected" : ""}`}
                onClick={() => handleCropClick(c)}
              >
                <div className="crop-card-top">
                  <span className="crop-category">{c.category || "Crop"}</span>
                  <span className="match-pill">{c.match}% Match</span>
                </div>

                <h3>{c.crop}</h3>
                <p className="crop-reason">{c.reason}</p>

                <div className="crop-specs">
                  <div className="spec-item">
                    <span className="spec-label">Water Need</span>
                    <strong className="spec-val">{c.water_requirement || "Moderate"}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">pH Range</span>
                    <strong className="spec-val">{c.soil_ph_range || "6.0 - 7.5"}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Cycle Duration</span>
                    <strong className="spec-val">{c.duration_days || 100} Days</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Expected Yield</span>
                    <strong className="spec-val">{c.expected_yield || "3-5 tons/ha"}</strong>
                  </div>
                </div>

                <div className="crop-card-footer">
                  <span className="select-hint">
                    {selectedCrop?.crop === c.crop ? "✓ Viewing Calendar" : "Click to view schedule →"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Crop Calendar & Stage Timeline */}
      {calendar && (
        <section className="card-panel calendar-panel" style={{ marginTop: "36px" }}>
          <div className="panel-header">
            <div>
              <h3>Crop Calendar &amp; Management Plan: {calendar.crop}</h3>
              <p>Critical planting windows, stage timelines, and harvest schedule</p>
            </div>
            <div className="calendar-badges">
              <span className="badge badge-blue">Planting: {calendar.planting_window}</span>
              <span className="badge badge-amber">Harvest: {calendar.harvest_window}</span>
            </div>
          </div>

          {/* Timeline Stages */}
          {calendar.timeline && calendar.timeline.length > 0 && (
            <div className="timeline-container">
              {calendar.timeline.map((st, idx) => (
                <div key={idx} className="timeline-step">
                  <div className="step-marker">
                    <span className="step-num">{idx + 1}</span>
                  </div>
                  <div className="step-content">
                    <span className="step-period">{st.period}</span>
                    <strong className="step-title">{st.stage}</strong>
                    <ul className="step-tasks">
                      {st.key_tasks.map((task, tIdx) => (
                        <li key={tIdx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agronomic Calendar Notes */}
          {calendar.notes && (
            <div className="calendar-notes">
              <span className="subheading">Seasonal Farming Best Practices:</span>
              <ul className="notes-list">
                {calendar.notes.map((note, nIdx) => (
                  <li key={nIdx}>
                    <span className="bullet">✳</span> {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

