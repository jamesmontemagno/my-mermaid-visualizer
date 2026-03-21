export default function FullscreenOverlay({
  svgHtml,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExportSvg,
  onExportPng,
  onClose,
}) {
  return (
    <div className="fullscreen-overlay">
      <div className="fullscreen-toolbar">
        <span className="fullscreen-title">Fullscreen Preview</span>
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
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="fullscreen-canvas">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </div>
    </div>
  );
}
