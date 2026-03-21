import { useState, useRef, useEffect } from "react";

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
  onExportSvg,
  onExportPng,
  onExportJpeg,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

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

          <div className="export-dropdown" ref={exportRef}>
            <button
              className="button primary compact-button"
              type="button"
              aria-haspopup="true"
              aria-expanded={exportOpen}
              onClick={() => setExportOpen((o) => !o)}
            >
              Export ▾
            </button>
            {exportOpen && (
              <div className="export-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportSvg(); setExportOpen(false); }}
                >
                  SVG
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportPng(); setExportOpen(false); }}
                >
                  PNG
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportJpeg(); setExportOpen(false); }}
                >
                  JPEG
                </button>
              </div>
            )}
          </div>

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
