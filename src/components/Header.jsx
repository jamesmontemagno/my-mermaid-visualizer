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
            MS
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
