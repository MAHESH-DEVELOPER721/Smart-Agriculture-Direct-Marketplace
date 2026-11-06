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