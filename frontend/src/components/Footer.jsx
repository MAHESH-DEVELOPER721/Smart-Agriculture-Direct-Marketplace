import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-content">
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark">AG</span>
          <span>Agri<span className="brand-accent">Direct</span></span>
        </Link>
        <p>Growing a fairer, smarter food system—together.</p>
        <span className="footer-copy">© {new Date().getFullYear()} AgriDirect</span>
      </div>
    </footer>
  );
}
