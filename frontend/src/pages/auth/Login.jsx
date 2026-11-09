import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const session = await apiRequest("/auth/login", { method: "POST", body: form });
      saveSession(session);
      navigate(session.user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page page-shell">
      <section className="auth-aside">
        <span className="eyebrow"><span className="live-dot" /> Welcome back</span>
        <h1>Good things grow when we grow <span>together.</span></h1>
        <p>Sign in to pick up where you left off and keep your farm community moving forward.</p>
        <div className="aside-note"><span>✳</span><p>“The future of farming is connected, resilient, and rooted in community.”</p></div>
      </section>
      <section className="auth-card">
        <span className="form-kicker">YOUR AGRIDIRECT ACCOUNT</span>
        <h2>Welcome back</h2>
        <p className="form-subtitle">Enter your details to sign in.</p>
        {location.state?.message && <div className="alert alert-success" role="status">{location.state.message}</div>}
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required />
          <div className="label-row"><label htmlFor="password">Password</label></div>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={update} required />
          <button className="button button-full" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<span aria-hidden="true"> →</span></button>
        </form>
        <p className="auth-switch">New to AgriDirect? <Link to="/register">Create an account</Link></p>
        <div className="secure-note">⌑ &nbsp; Your information is securely protected</div>
      </section>
    </main>
  );
}
