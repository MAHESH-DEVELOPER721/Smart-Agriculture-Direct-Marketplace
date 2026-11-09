import React, { useEffect, useState } from "react";
import { apiRequest, readSession } from "../../services/api";

const emptyOverview = { total_users: 0, farmers: 0, consumers: 0, admins: 0 };

export default function AdminDashboard() {
  const session = readSession();
  const [overview, setOverview] = useState(emptyOverview);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest("/auth/admin/overview", { token: session?.access_token }),
      apiRequest("/auth/admin/users", { token: session?.access_token }),
    ])
      .then(([stats, accountList]) => {
        if (active) {
          setOverview(stats);
          setUsers(accountList);
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session?.access_token]);

  return (
    <main className="admin-page page-shell">
      <div className="admin-heading"><div><span className="eyebrow">AGRIDIRECT CONTROL CENTER</span><h1>Good morning, {session?.user?.name?.split(" ")[0] || "Admin"}</h1><p>Here’s what’s happening across your community.</p></div><span className="admin-badge"><span className="live-dot" /> Admin access</span></div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <section className="stats-grid" aria-label="User overview">
        <article className="stat-card"><span className="stat-icon stat-green">◎</span><span className="stat-label">Total accounts</span><strong>{loading ? "—" : overview.total_users}</strong><small>Registered community members</small></article>
        <article className="stat-card"><span className="stat-icon stat-leaf">⌁</span><span className="stat-label">Farmers</span><strong>{loading ? "—" : overview.farmers}</strong><small>Growing on AgriDirect</small></article>
        <article className="stat-card"><span className="stat-icon stat-blue">◉</span><span className="stat-label">Consumers</span><strong>{loading ? "—" : overview.consumers}</strong><small>Connecting to local food</small></article>
        <article className="stat-card"><span className="stat-icon stat-amber">✳</span><span className="stat-label">Administrators</span><strong>{loading ? "—" : overview.admins}</strong><small>Platform management team</small></article>
      </section>
      <section className="table-panel">
        <div className="table-heading"><div><h2>Community accounts</h2><p>Recently registered members</p></div><span className="table-count">{loading ? "Loading…" : `${users.length} accounts`}</span></div>
        <div className="table-scroll"><table><thead><tr><th>Member</th><th>Email</th><th>Account type</th><th>Joined</th></tr></thead><tbody>
          {users.map((user) => <tr key={user.id}><td><span className="member-cell"><span className="avatar avatar-table">{user.name?.slice(0, 1).toUpperCase()}</span><strong>{user.name}</strong></span></td><td>{user.email}</td><td><span className={`role-pill role-${user.role}`}>{user.role}</span></td><td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td></tr>)}
          {!loading && users.length === 0 && <tr><td className="empty-row" colSpan="4">No accounts to show yet.</td></tr>}
          {loading && <tr><td className="empty-row" colSpan="4">Loading community accounts…</td></tr>}
        </tbody></table></div>
      </section>
      <p className="admin-footnote">Member data is only visible to authorized administrators.</p>
    </main>
  );
}
