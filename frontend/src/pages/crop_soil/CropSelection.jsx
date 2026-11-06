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