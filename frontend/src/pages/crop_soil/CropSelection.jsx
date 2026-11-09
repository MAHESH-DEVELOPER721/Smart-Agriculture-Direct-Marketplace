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

