export default function Header({
  onOpenSettings,
  onResetDemo,
  onCopySource,
  onExportSvg,
  onExportPng,
  onExportJpeg,
}) {
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

        <p className="lede">
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
          className="button secondary compact-button"
          type="button"
          onClick={onOpenSettings}
        >
          ⚙ Settings
        </button>
        <button
          className="button secondary compact-button"
          type="button"
          onClick={onResetDemo}
        >
          Reset demo
        </button>
        <button
          className="button secondary compact-button"
          type="button"
          onClick={onCopySource}
        >
          Copy source
        </button>
        <button
          className="button secondary compact-button"
          type="button"
          onClick={onExportSvg}
        >
          SVG
        </button>
        <button
          className="button secondary compact-button"
          type="button"
          onClick={onExportPng}
        >
          PNG
        </button>
        <button
          className="button primary compact-button"
          type="button"
          onClick={onExportJpeg}
        >
          JPEG
        </button>
      </div>
    </header>
  );
}
