import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "farmer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/auth/register", { method: "POST", body: form });
      navigate("/login", { replace: true, state: { message: "Your account is ready. Sign in to continue." } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page page-shell register-page">
      <section className="auth-aside">
        <span className="eyebrow"><span className="live-dot" /> Join the growing community</span>
        <h1>Make your next step in agriculture <span>count.</span></h1>
        <p>Get connected to practical farm tools and a more direct marketplace—built for the people who grow and the people who care.</p>
        <ul className="benefit-list"><li><span>✓</span> Tools for smarter growing decisions</li><li><span>✓</span> A community that values local food</li><li><span>✓</span> Simple, secure account access</li></ul>
      </section>
      <section className="auth-card">
        <span className="form-kicker">GET STARTED FOR FREE</span>
        <h2>Create your account</h2>
        <p className="form-subtitle">Tell us a little about yourself.</p>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" type="text" autoComplete="name" placeholder="e.g. Alex Green" minLength="2" maxLength="100" value={form.name} onChange={update} required />
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required />
          <label htmlFor="role">I’m joining as a</label>
          <select id="role" name="role" value={form.role} onChange={update}><option value="farmer">Farmer / grower</option><option value="consumer">Consumer / buyer</option></select>
          <label htmlFor="password">Create a password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength="8" maxLength="72" value={form.password} onChange={update} required />
          <p className="input-hint">Use at least 8 characters.</p>
          <button className="button button-full" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}<span aria-hidden="true"> →</span></button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <div className="secure-note">⌑ &nbsp; Your information is securely protected</div>
      </section>
    </main>
  );
}
