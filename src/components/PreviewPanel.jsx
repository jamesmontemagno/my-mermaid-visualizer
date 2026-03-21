export default function PreviewPanel({
  svgHtml,
  previewRef,
  statusMsg,
  statusKind,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFullscreen,
}) {
  return (
    <section className="panel preview-panel">
      <div className="panel-header">
        <div>
          <h2>Live preview</h2>
          <p>Rendered SVG appears here, along with any syntax errors.</p>
        </div>
        <div className="preview-toolbar">
          <button
            className="button secondary compact-button zoom-btn"
            type="button"
            title="Zoom in"
            onClick={onZoomIn}
          >
            +
          </button>
          <button
            className="button secondary compact-button zoom-btn"
            type="button"
            title="Reset zoom"
            onClick={onZoomReset}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            className="button secondary compact-button zoom-btn"
            type="button"
            title="Zoom out"
            onClick={onZoomOut}
          >
            −
          </button>
          <button
            className="button secondary compact-button"
            type="button"
            title="Fullscreen preview"
            onClick={onFullscreen}
          >
            ⛶
          </button>
          <div
            className={`status ${statusKind === "idle" ? "" : statusKind}`}
            aria-live="polite"
          >
            {statusMsg}
          </div>
        </div>
      </div>

      <div className="preview-frame">
        <div
          className="preview-canvas"
          ref={previewRef}
          style={{ transform: `scale(${zoomLevel})` }}
          dangerouslySetInnerHTML={{
            __html:
              svgHtml ||
              '<div class="empty-state">Paste Mermaid code to render a diagram.</div>',
          }}
        />
      </div>
    </section>
  );
}
