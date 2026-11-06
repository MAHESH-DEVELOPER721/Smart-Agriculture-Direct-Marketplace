import React, { useMemo, useState } from "react";

const initialValues = {
  crop: "Vegetables",
  area: "1",
  waterNeed: "5",
  rainfall: "0",
  efficiency: "80",
};

export default function Irrigation() {
  const [values, setValues] = useState(initialValues);
  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const result = useMemo(() => {
    const area = Math.max(0, Number(values.area) || 0);
    const waterNeed = Math.max(0, Number(values.waterNeed) || 0);
    const rainfall = Math.max(0, Number(values.rainfall) || 0);
    const efficiency = Math.min(100, Math.max(1, Number(values.efficiency) || 1));
    const netDepth = Math.max(0, waterNeed - rainfall);
    const liters = (netDepth * area * 10_000 * 100) / efficiency;

    return { area, waterNeed, rainfall, efficiency, netDepth, liters };
  }, [values.area, values.waterNeed, values.rainfall, values.efficiency]);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setApiResult(null);
    setApiError("");
  }

  async function calculateWithApi(event) {
    event.preventDefault();
    setIsCalculating(true);
    setApiError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/irrigation/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: values.crop,
          area_hectares: Number(values.area),
          water_requirement_mm: Number(values.waterNeed),
          effective_rainfall_mm: Number(values.rainfall),
          efficiency_percent: Number(values.efficiency),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Could not calculate irrigation.");
      }

      setApiResult(await response.json());
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not connect to the API.",
      );
    } finally {
      setIsCalculating(false);
    }
  }

  const displayedLiters = apiResult ? apiResult.estimated_liters : result.liters;
  const displayedNetDepth = apiResult
    ? apiResult.net_water_depth_mm
    : result.netDepth;

  return (
    <main className="irrigation-page">
      <style>{`
        .irrigation-page {
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
        .irrigation-page *, .irrigation-page *::before, .irrigation-page *::after { box-sizing: inherit; }
        .irrigation-container { width: min(100%, 980px); margin: 0 auto; }
        .irrigation-eyebrow { margin: 0 0 8px; color: var(--green); font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
        .irrigation-page h1 { margin: 0; font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -.04em; }
        .irrigation-intro { max-width: 680px; margin: 12px 0 28px; color: var(--muted); line-height: 1.65; }
        .irrigation-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, .82fr); gap: 20px; align-items: start; }
        .irrigation-card { padding: 24px; border: 1px solid #e1e9e1; border-radius: 18px; background: #fff; box-shadow: 0 8px 26px #173a2610; }
        .irrigation-card h2 { margin: 0 0 7px; font-size: 1.2rem; }
        .irrigation-help { margin: 0 0 20px; color: var(--muted); font-size: .92rem; line-height: 1.5; }
        .irrigation-form { display: grid; gap: 16px; }
        .irrigation-field label { display: block; margin-bottom: 7px; font-size: .88rem; font-weight: 700; }
        .irrigation-field input, .irrigation-field select { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #cdd9cf; border-radius: 9px; color: var(--ink); background: #fff; font: inherit; }
        .irrigation-field input:focus, .irrigation-field select:focus { outline: 3px solid #176b4525; border-color: var(--green); }
        .irrigation-field small { display: block; margin-top: 5px; color: var(--muted); font-size: .78rem; line-height: 1.45; }
        .irrigation-result { margin: 20px 0; padding: 20px; border-radius: 14px; color: #fff; background: #176b45; }
        .irrigation-result span { display: block; opacity: .88; font-size: .86rem; }
        .irrigation-result strong { display: block; margin: 5px 0; font-size: clamp(2rem, 7vw, 2.8rem); letter-spacing: -.04em; }
        .irrigation-result p { margin: 0; font-size: .87rem; line-height: 1.5; opacity: .92; }
        .irrigation-summary { display: grid; gap: 0; margin: 0; }
        .irrigation-summary div { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid #edf1ed; }
        .irrigation-summary div:last-child { border-bottom: 0; }
        .irrigation-summary dt { color: var(--muted); font-size: .88rem; }
        .irrigation-summary dd { margin: 0; font-size: .9rem; font-weight: 700; text-align: right; }
        .irrigation-note { margin: 20px 0 0; padding: 13px 15px; border-left: 3px solid #a9c8b3; border-radius: 5px; color: #53645a; background: #f7faf6; font-size: .82rem; line-height: 1.55; }
        @media (max-width: 720px) { .irrigation-page { padding: 28px 15px; } .irrigation-grid { grid-template-columns: 1fr; } .irrigation-card { padding: 20px; } }
      `}</style>

      <div className="irrigation-container">
        <p className="irrigation-eyebrow">Farm tools</p>
        <h1>Irrigation planner</h1>
        <p className="irrigation-intro">
          Estimate a daily irrigation volume from your crop water requirement,
          field size, rainfall, and system efficiency.
        </p>

        <div className="irrigation-grid">
          <section className="irrigation-card" aria-labelledby="irrigation-inputs">
            <h2 id="irrigation-inputs">Field details</h2>
            <p className="irrigation-help">
              Adjust the example values to match your crop and current conditions.
            </p>
            <form className="irrigation-form" onSubmit={calculateWithApi}>
              <div className="irrigation-field">
                <label htmlFor="irrigation-crop">Crop</label>
                <select id="irrigation-crop" name="crop" value={values.crop} onChange={updateValue}>
                  <option>Vegetables</option>
                  <option>Wheat</option>
                  <option>Rice</option>
                  <option>Maize</option>
                  <option>Orchard</option>
                  <option>Other</option>
                </select>
                <small>Crop selection is for reference; it does not change the calculation.</small>
              </div>
              <div className="irrigation-field">
                <label htmlFor="irrigation-area">Irrigated area (hectares)</label>
                <input
                  id="irrigation-area"
                  name="area"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={values.area}
                  onChange={updateValue}
                />
              </div>
              <div className="irrigation-field">
                <label htmlFor="irrigation-need">Daily crop water requirement (mm)</label>
                <input
                  id="irrigation-need"
                  name="waterNeed"
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={values.waterNeed}
                  onChange={updateValue}
                />
                <small>Use an estimate from local agricultural guidance or a crop-water tool.</small>
              </div>
              <div className="irrigation-field">
                <label htmlFor="irrigation-rain">Effective rainfall today (mm)</label>
                <input
                  id="irrigation-rain"
                  name="rainfall"
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={values.rainfall}
                  onChange={updateValue}
                />
              </div>
              <div className="irrigation-field">
                <label htmlFor="irrigation-efficiency">Irrigation system efficiency (%)</label>
                <input
                  id="irrigation-efficiency"
                  name="efficiency"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  required
                  value={values.efficiency}
                  onChange={updateValue}
                />
                <small>For example, enter 80 for an assumed 80% application efficiency.</small>
              </div>
              <button
                type="submit"
                disabled={isCalculating}
                style={{
                  minHeight: 44,
                  border: 0,
                  borderRadius: 9,
                  color: "#fff",
                  background: "#176b45",
                  font: "inherit",
                  fontWeight: 700,
                  cursor: isCalculating ? "wait" : "pointer",
                  opacity: isCalculating ? 0.7 : 1,
                }}
              >
                {isCalculating ? "Calculating..." : "Calculate with API"}
              </button>
              {apiError && <p role="alert">{apiError}</p>}
              {apiResult && <p role="status">Calculated by the backend API.</p>}
            </form>
          </section>

          <section className="irrigation-card" aria-live="polite" aria-labelledby="irrigation-result">
            <h2 id="irrigation-result">Estimated daily irrigation</h2>
            <p className="irrigation-help">For {values.crop.toLowerCase()} on {result.area} ha</p>

            <div className="irrigation-result">
              <span>Approximate water volume</span>
              <strong>{Math.round(displayedLiters).toLocaleString()} L</strong>
              <p>
                {displayedNetDepth === 0
                  ? "Entered rainfall meets or exceeds the entered daily requirement."
                  : `Apply approximately ${displayedNetDepth.toFixed(1)} mm net water, adjusted for system efficiency.`}
              </p>
            </div>

            <dl className="irrigation-summary">
              <div>
                <dt>Crop water requirement</dt>
                <dd>{result.waterNeed.toFixed(1)} mm/day</dd>
              </div>
              <div>
                <dt>Effective rainfall</dt>
                <dd>{result.rainfall.toFixed(1)} mm</dd>
              </div>
              <div>
                <dt>Assumed system efficiency</dt>
                <dd>{result.efficiency}%</dd>
              </div>
              <div>
                <dt>Net water depth to apply</dt>
                <dd>{displayedNetDepth.toFixed(1)} mm</dd>
              </div>
            </dl>

            <p className="irrigation-note">
              Estimate only: 1 mm over 1 hectare equals 10,000 L. The result
              accounts for the entered efficiency and rainfall, but not soil
              type, growth stage, forecast, runoff, or water restrictions. Check
              soil moisture and local agricultural advice before irrigating.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}