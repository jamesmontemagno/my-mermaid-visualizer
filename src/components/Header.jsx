import { useState } from "react";

export default function Header({
  onOpenSettings,
  onResetDemo,
  onCopySource,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="hero">
      <div className="hero-copy">
        <div className="hero-brand">
          <div className="brand-mark" aria-hidden="true">
            M
          </div>
          <div>
            <p className="eyebrow">Mermaid Visualizer</p>
            <h1>Render Mermaid fast.</h1>
          </div>
        </div>

        <p className="lede hero-lede">
          Compact, ad-free Mermaid editing with live preview, local history,
          presets, and polished image exports.
        </p>

        <div className="hero-meta" aria-label="Product highlights">
          <span className="meta-pill">Live errors</span>
          <span className="meta-pill">Local history</span>
          <span className="meta-pill">SVG / PNG / JPEG</span>
          <span className="meta-pill">GitHub Pages</span>
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
            onClick={() => { onOpenSettings(); setMenuOpen(false); }}
          >
            ⚙ Settings
          </button>
          <button
            className="button secondary compact-button"
            type="button"
            onClick={() => { onResetDemo(); setMenuOpen(false); }}
          >
            Reset demo
          </button>
          <button
            className="button secondary compact-button"
            type="button"
            onClick={() => { onCopySource(); setMenuOpen(false); }}
          >
            Copy source
          </button>
        </div>
      </div>
    </header>
  );
}
