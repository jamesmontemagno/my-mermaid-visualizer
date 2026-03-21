import { useRef } from "react";
import { firstMeaningfulLine, formatSavedAt } from "../utils/storage.js";

export default function SavedDiagrams({
  diagrams,
  onLoad,
  onDelete,
  onExportLibrary,
  onImportLibrary,
}) {
  const fileInputRef = useRef(null);

  return (
    <section className="panel controls-panel">
      <div className="panel-header">
        <div>
          <h2>Saved diagrams library</h2>
          <p>
            Keep named diagrams you want to revisit, reload, or clean up later.
          </p>
        </div>
        <div className="library-actions">
          <button
            className="button secondary compact-button"
            type="button"
            title="Export all saved diagrams as JSON"
            onClick={onExportLibrary}
          >
            Export library
          </button>
          <button
            className="button secondary compact-button"
            type="button"
            title="Import diagrams from JSON file"
            onClick={() => fileInputRef.current?.click()}
          >
            Import library
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportLibrary(file);
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>

      <div className="saved-diagrams-list" aria-live="polite">
        {diagrams.length === 0 ? (
          <p className="empty-library">
            No named diagrams yet. Save one with a custom name to build your
            personal diagram library.
          </p>
        ) : (
          diagrams.map((diagram) => (
            <article key={diagram.id} className="saved-diagram-card">
              <div className="saved-diagram-head">
                <div>
                  <strong>{diagram.name}</strong>
                  <span>{formatSavedAt(diagram.savedAt)}</span>
                </div>
                <div className="saved-diagram-actions">
                  <button
                    type="button"
                    className="button secondary compact-button"
                    onClick={() => onLoad(diagram)}
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className="button secondary compact-button"
                    onClick={() => onDelete(diagram)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="saved-diagram-source">
                {firstMeaningfulLine(diagram.source)}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
