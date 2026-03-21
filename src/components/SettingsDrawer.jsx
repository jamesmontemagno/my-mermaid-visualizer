import { adjustColor } from "../utils/color.js";

export default function SettingsDrawer({
  settings,
  themePresets,
  onClose,
  onApplyPreset,
  onSettingsChange,
}) {
  const isPresetActive = (preset) =>
    settings.theme === preset.settings.theme &&
    settings.primaryColor.toLowerCase() ===
      preset.settings.primaryColor.toLowerCase() &&
    settings.backgroundColor.toLowerCase() ===
      preset.settings.backgroundColor.toLowerCase() &&
    Number(settings.fontSize) === Number(preset.settings.fontSize);

  return (
    <aside
      className="settings-drawer"
      aria-labelledby="settings-title"
    >
      <div className="settings-drawer-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2 id="settings-title">Theme and design</h2>
          <p className="settings-copy">
            Adjust the visual style without scrolling to the bottom.
          </p>
        </div>
        <button
          className="button secondary compact-button"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <section className="control-card">
        <div className="control-card-header">
          <div>
            <h3>Theme presets</h3>
            <p>Start from a visual mood, then fine-tune the details.</p>
          </div>
        </div>

        <div className="theme-preset-grid">
          {themePresets.map((preset) => {
            const accent = preset.settings.primaryColor;
            const background = preset.settings.backgroundColor;
            const accentSoft = adjustColor(accent, 36);
            const accentDeep = adjustColor(accent, -44);

            return (
              <button
                key={preset.id}
                type="button"
                className={`theme-preset-button${isPresetActive(preset) ? " active" : ""}`}
                onClick={() => onApplyPreset(preset)}
              >
                <div className="theme-preview-row" aria-hidden="true">
                  <span
                    className="theme-swatch large"
                    style={{
                      background,
                      borderColor: accentDeep,
                    }}
                  />
                  <span
                    className="theme-swatch"
                    style={{ background: accent }}
                  />
                  <span
                    className="theme-swatch"
                    style={{ background: accentSoft }}
                  />
                  <span
                    className="theme-swatch"
                    style={{ background: accentDeep }}
                  />
                </div>
                <strong>{preset.title}</strong>
                <span>{preset.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <div>
            <h3>Manual style controls</h3>
            <p>Control Mermaid theme mode, color palette, and typography.</p>
          </div>
        </div>

        <div className="controls-grid">
          <label className="field">
            <span>Theme</span>
            <select
              value={settings.theme}
              onChange={(e) => onSettingsChange("theme", e.target.value)}
            >
              <option value="base">Base</option>
              <option value="default">Default</option>
              <option value="neutral">Neutral</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
            </select>
          </label>

          <label className="field">
            <span>Primary color</span>
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) =>
                onSettingsChange("primaryColor", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Background</span>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) =>
                onSettingsChange("backgroundColor", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Font size</span>
            <input
              type="range"
              min={12}
              max={24}
              value={settings.fontSize}
              onChange={(e) =>
                onSettingsChange("fontSize", Number(e.target.value))
              }
            />
          </label>
        </div>
      </section>
    </aside>
  );
}
