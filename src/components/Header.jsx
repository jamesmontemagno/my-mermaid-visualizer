import { useState } from "react";

export default function Header({
  onOpenSettings,
  onOpenHelp,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="hero">
      <div className="hero-copy">
        <div className="hero-brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 256 256" width="28" height="28" fill="none">
              <defs>
                <linearGradient id="hg" x1="80" y1="40" x2="176" y2="216" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#7dd3fc" />
                  <stop offset=".5" stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <line x1="128" y1="214" x2="128" y2="136" stroke="url(#hg)" strokeWidth="24" strokeLinecap="round" />
              <line x1="128" y1="136" x2="128" y2="48" stroke="url(#hg)" strokeWidth="24" strokeLinecap="round" />
              <path d="M128 136 C110 104 82 88 60 56" stroke="url(#hg)" strokeWidth="24" strokeLinecap="round" />
              <path d="M128 136 C146 104 174 88 196 56" stroke="url(#hg)" strokeWidth="24" strokeLinecap="round" />
              <circle cx="58" cy="54" r="16" fill="#fbbf24" />
              <circle cx="128" cy="46" r="16" fill="#f8fafc" />
              <circle cx="198" cy="54" r="16" fill="#fbbf24" />
            </svg>
          </div>
          <div>
            <p className="eyebrow">Mermaid Studio</p>
            <h1>Design Mermaid diagrams live.</h1>
          </div>
        </div>

        <p className="lede hero-lede">
          Local-first Mermaid editing with instant preview, saved history,
          presets, theme controls, and export-ready diagrams.
        </p>

        <div className="hero-meta" aria-label="Product highlights">
          <span className="meta-pill">Live errors</span>
          <span className="meta-pill">Local history</span>
          <span className="meta-pill">Theme controls</span>
          <span className="meta-pill">SVG / PNG / JPEG</span>
        </div>
      </div>

      <div className="hero-actions">
        <button
          className="button secondary compact-button mobile-menu-toggle"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>

        <div className={`hero-action-buttons${menuOpen ? " menu-open" : ""}`}>
          <button
            className="button secondary compact-button"
            type="button"
            onClick={() => { onOpenHelp(); setMenuOpen(false); }}
          >
            ? Help
          </button>
          <button
            className="button secondary compact-button"
            type="button"
            onClick={() => { onOpenSettings(); setMenuOpen(false); }}
          >
            ⚙ Settings
          </button>
        </div>
      </div>
    </header>
  );
}
