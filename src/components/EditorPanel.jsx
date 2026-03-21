import { firstMeaningfulLine } from "../utils/storage.js";

export default function EditorPanel({
  source,
  onSourceChange,
  diagramName,
  onDiagramNameChange,
  onSaveNamedDiagram,
  history,
  onHistorySelect,
  onSaveHistory,
  onClearHistory,
  presets,
  onSelectPreset,
}) {
  return (
    <section className="panel editor-panel">
      <div className="panel-header">
        <div>
          <h2>Diagram source</h2>
          <p>Edit Mermaid text and watch the preview update automatically.</p>
        </div>
      </div>

      <div className="management-bar">
        <label className="field management-name-field">
          <span>Current diagram name</span>
          <input
            type="text"
            maxLength={60}
            placeholder="Architecture overview"
            value={diagramName}
            onChange={(e) => onDiagramNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSaveNamedDiagram();
              }
            }}
          />
        </label>

        <div className="management-actions">
          <button
            className="button primary compact-button"
            type="button"
            onClick={onSaveNamedDiagram}
          >
            Save named diagram
          </button>

          <label className="field compact">
            <span>Recent diagrams</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value !== "") {
                  onHistorySelect(Number(e.target.value));
                  e.target.value = "";
                }
              }}
            >
              <option value="">
                {history.length
                  ? `Recent diagrams (${history.length})`
                  : "No saved history yet"}
              </option>
              {history.map((entry, index) => (
                <option key={index} value={index}>
                  {firstMeaningfulLine(entry.source).slice(0, 50) ||
                    `Diagram ${index + 1}`}
                </option>
              ))}
            </select>
          </label>

          <button
            className="button secondary compact-button"
            type="button"
            onClick={onSaveHistory}
          >
            Save snapshot
          </button>
          <button
            className="button secondary compact-button"
            type="button"
            onClick={onClearHistory}
          >
            Clear history
          </button>
        </div>
      </div>

      <p className="history-meta management-meta">
        {history.length
          ? `Stored locally in this browser. Keeping the latest ${history.length} diagrams.`
          : "History is empty until you render or save a diagram."}
      </p>

      <label className="field">
        <span>Mermaid code</span>
        <textarea
          spellCheck={false}
          aria-label="Mermaid diagram source"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
        />
      </label>

      <div className="preset-grid" aria-label="Diagram presets">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="preset-card"
            onClick={() => onSelectPreset(preset)}
          >
            <strong>{preset.title}</strong>
            <span>{preset.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
