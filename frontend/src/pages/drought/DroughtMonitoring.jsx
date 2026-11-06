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