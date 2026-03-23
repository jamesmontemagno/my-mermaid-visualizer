import { useState, useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";
import { defaultSource, presets } from "./data/presets.js";
import { themePresets, defaultSettings } from "./data/themes.js";
import { buildThemeVariables } from "./utils/color.js";
import {
  exportSvg,
  exportRaster,
  exportLibraryJson,
} from "./utils/svg.js";
import {
  loadState,
  saveDraft,
  clearHistoryStorage,
  firstMeaningfulLine,
  normalizeSource,
  normalizeSavedDiagrams,
} from "./utils/storage.js";
import Header from "./components/Header.jsx";
import EditorPanel from "./components/EditorPanel.jsx";
import PreviewPanel from "./components/PreviewPanel.jsx";
import SavedDiagrams from "./components/SavedDiagrams.jsx";
import SettingsDrawer from "./components/SettingsDrawer.jsx";
import HelpModal from "./components/HelpModal.jsx";
import FullscreenOverlay from "./components/FullscreenOverlay.jsx";
import ToastContainer from "./components/ToastContainer.jsx";

const _cached = { value: null };
function getInitialState() {
  if (!_cached.value) _cached.value = loadState(defaultSettings);
  return _cached.value;
}

export default function App() {
  const [source, setSourceState] = useState(
    () => getInitialState().source || defaultSource,
  );
  const [history, setHistory] = useState(() => getInitialState().history);
  const [savedDiagrams, setSavedDiagrams] = useState(
    () => getInitialState().savedDiagrams,
  );
  const [settings, setSettings] = useState(() => getInitialState().settings);
  const [uiTheme, setUiTheme] = useState(() => getInitialState().settings.uiTheme || "dark");
  const [diagramName, setDiagramName] = useState("");
  const [statusMsg, setStatusMsg] = useState("Ready");
  const [statusKind, setStatusKind] = useState("idle");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fsZoomLevel, setFsZoomLevel] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [svgHtml, setSvgHtml] = useState("");

  const previewRef = useRef(null);
  const renderTokenRef = useRef(0);
  const renderTimerRef = useRef(null);

  const showToast = useCallback((message, kind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const setStatus = useCallback((message, kind = "idle") => {
    setStatusMsg(message);
    setStatusKind(kind);
  }, []);

  const handleToggleUITheme = useCallback(() => {
    const newTheme = uiTheme === "dark" ? "light" : "dark";
    setUiTheme(newTheme);
    setSettings((prev) => ({ ...prev, uiTheme: newTheme }));
  }, [uiTheme]);

  // Persist state on changes
  const persistState = useCallback(
    (src, hist, saved, sett) => {
      saveDraft(src, hist, saved, sett);
    },
    [],
  );

  // Apply background color CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bg",
      settings.backgroundColor,
    );
  }, [settings.backgroundColor]);

  // Apply UI theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", uiTheme);
  }, [uiTheme]);

  // Render mermaid diagram
  const renderDiagram = useCallback(
    async (src) => {
      const token = ++renderTokenRef.current;
      const normalized = normalizeSource(src);

      if (!normalized.trim()) {
        setSvgHtml("");
        setStatus("Waiting for diagram source.");
        return;
      }

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        htmlLabels: false,
        flowchart: { htmlLabels: false },
        theme: settings.theme,
        themeVariables: buildThemeVariables(settings),
      });

      try {
        const id = `diagram-${Date.now()}-${token}`;
        const { svg } = await mermaid.render(id, normalized);
        if (token !== renderTokenRef.current) return;
        setSvgHtml(svg);
        setStatus("Rendered successfully.", "success");

        // Add to history
        setHistory((prev) => {
          const entry = { source: normalized, savedAt: new Date().toISOString() };
          const next = [entry, ...prev.filter((e) => e.source !== normalized)].slice(0, 10);
          return next;
        });
      } catch (error) {
        if (token !== renderTokenRef.current) return;
        const message = error instanceof Error ? error.message : String(error);
        setSvgHtml(
          `<div class="error-card"><strong>Mermaid error</strong><pre>${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></div>`,
        );
        setStatus("Rendering failed. Fix the syntax and try again.", "error");
      }
    },
    [settings, setStatus],
  );

  // Schedule render on source or settings change
  useEffect(() => {
    window.clearTimeout(renderTimerRef.current);
    renderTimerRef.current = window.setTimeout(() => {
      renderDiagram(source);
    }, 150);
    return () => window.clearTimeout(renderTimerRef.current);
  }, [source, renderDiagram]);

  // Persist on state changes
  useEffect(() => {
    persistState(source, history, savedDiagrams, settings);
  }, [source, history, savedDiagrams, settings, persistState]);


  const handleSourceChange = useCallback((newSource) => {
    setSourceState(normalizeSource(newSource));
  }, []);

  const handleSetSource = useCallback(
    (newSource, fromPreset = false) => {
      const normalized = normalizeSource(newSource);
      setSourceState(normalized);
      if (fromPreset) {
        setHistory((prev) => {
          const entry = { source: normalized, savedAt: new Date().toISOString() };
          return [entry, ...prev.filter((e) => e.source !== normalized)].slice(0, 10);
        });
      }
    },
    [],
  );

  const handleSaveNamedDiagram = useCallback(() => {
    const normalized = normalizeSource(source);
    if (!normalized.trim()) {
      setStatus("Add Mermaid source before saving a named diagram.", "error");
      showToast("Add Mermaid source before saving.", "error");
      return;
    }

    const name =
      diagramName.trim() || firstMeaningfulLine(normalized).slice(0, 60);

    setSavedDiagrams((prev) => {
      const existing = prev.find(
        (e) => e.name.toLowerCase() === name.toLowerCase(),
      );
      const nextDiagram = {
        id:
          existing?.id ??
          `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name,
        source: normalized,
        settings: { ...settings },
        savedAt: new Date().toISOString(),
      };
      const next = [
        nextDiagram,
        ...prev.filter((e) => e.id !== nextDiagram.id),
      ].slice(0, 25);

      const statusMessage = existing
        ? `Updated the saved diagram "${nextDiagram.name}".`
        : `Saved "${nextDiagram.name}" to your diagram library.`;
      setStatus(statusMessage, "success");
      showToast(statusMessage, "success");
      setDiagramName(nextDiagram.name);
      return next;
    });

    setHistory((prev) => {
      const entry = { source: normalized, savedAt: new Date().toISOString() };
      return [entry, ...prev.filter((e) => e.source !== normalized)].slice(0, 10);
    });
  }, [source, diagramName, settings, setStatus, showToast]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryStorage();
    setStatus("Local history cleared.", "success");
  }, [setStatus]);

  const handleLoadDiagram = useCallback(
    (diagram) => {
      if (diagram.settings && typeof diagram.settings === "object") {
        setSettings((prev) => ({ ...prev, ...diagram.settings }));
      }
      setDiagramName(diagram.name);
      setSourceState(normalizeSource(diagram.source));
      showToast(`Loaded "${diagram.name}".`, "success");
      setStatus(`Loaded "${diagram.name}".`, "success");
    },
    [showToast, setStatus],
  );

  const handleDeleteDiagram = useCallback(
    (diagram) => {
      setSavedDiagrams((prev) => prev.filter((e) => e.id !== diagram.id));
      showToast(`Deleted "${diagram.name}".`, "success");
      setStatus(`Deleted "${diagram.name}".`, "success");
    },
    [showToast, setStatus],
  );

  const handleCopySource = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      showToast("Diagram source copied to clipboard.", "success");
      setStatus("Diagram source copied to clipboard.", "success");
      window.setTimeout(() => setStatus("Ready"), 1800);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus(msg, "error");
    }
  }, [source, showToast, setStatus]);

  const handleExportSvg = useCallback(async () => {
    try {
      await exportSvg(previewRef.current);
      showToast("SVG exported successfully.", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus(msg, "error");
      showToast(msg, "error");
    }
  }, [showToast, setStatus]);

  const handleExportPng = useCallback(async () => {
    try {
      await exportRaster(previewRef.current, "png");
      showToast("PNG exported successfully.", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus(msg, "error");
      showToast(msg, "error");
    }
  }, [showToast, setStatus]);

  const handleExportJpeg = useCallback(async () => {
    try {
      await exportRaster(previewRef.current, "jpeg");
      showToast("JPEG exported successfully.", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus(msg, "error");
      showToast(msg, "error");
    }
  }, [showToast, setStatus]);

  const handleExportLibrary = useCallback(() => {
    try {
      const count = exportLibraryJson(savedDiagrams);
      showToast(`Exported ${count} diagram(s).`, "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      showToast(msg, "error");
    }
  }, [savedDiagrams, showToast]);

  const handleImportLibrary = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        let parsed;
        try {
          parsed = JSON.parse(reader.result);
        } catch {
          showToast("Invalid library file. Expected a JSON array.", "error");
          return;
        }
        if (!Array.isArray(parsed)) {
          showToast("Invalid library file. Expected a JSON array.", "error");
          return;
        }
        const normalized = normalizeSavedDiagrams(parsed);
        if (!normalized.length) {
          showToast("No valid diagrams found in the file.", "error");
          return;
        }

        setSavedDiagrams((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          let imported = 0;
          const next = [...prev];
          for (const diagram of normalized) {
            if (!existingIds.has(diagram.id)) {
              next.push(diagram);
              existingIds.add(diagram.id);
              imported++;
            }
          }
          showToast(`Imported ${imported} new diagram(s).`, "success");
          return next.slice(0, 25);
        });
      };
      reader.readAsText(file);
    },
    [showToast],
  );

  const handleResetDemo = useCallback(() => {
    handleSetSource(defaultSource, true);
    showToast("Reset to the default Mermaid demo.", "success");
    setStatus("Reset to the default Mermaid demo.", "success");
  }, [handleSetSource, showToast, setStatus]);

  const handleApplyThemePreset = useCallback(
    (preset) => {
      setSettings((prev) => ({ ...prev, ...preset.settings }));
      showToast(`Applied the ${preset.title} theme preset.`, "success");
      setStatus(`Applied the ${preset.title} theme preset.`, "success");
    },
    [showToast, setStatus],
  );

  const handleSettingsChange = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleHistorySelect = useCallback(
    (index) => {
      if (history[index]) {
        handleSetSource(history[index].source, false);
      }
    },
    [history, handleSetSource],
  );

  const handleSaveHistory = useCallback(() => {
    const normalized = normalizeSource(source);
    setHistory((prev) => {
      const entry = { source: normalized, savedAt: new Date().toISOString() };
      return [entry, ...prev.filter((e) => e.source !== normalized)].slice(0, 10);
    });
    showToast("Saved snapshot to local history.", "success");
    setStatus("Saved snapshot to local history.", "success");
  }, [source, showToast, setStatus]);

  const handleOpenFullscreen = useCallback(() => {
    if (!svgHtml || svgHtml.includes("error-card")) {
      showToast("Render a diagram first to use fullscreen.", "error");
      return;
    }
    setFsZoomLevel(1);
    setFullscreenOpen(true);
  }, [svgHtml, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (fullscreenOpen) {
          setFullscreenOpen(false);
          return;
        }
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
      }
      if (event.key === "?" && !event.ctrlKey && !event.metaKey && event.target.tagName !== "TEXTAREA" && event.target.tagName !== "INPUT") {
        setHelpOpen((prev) => !prev);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "s" && !event.shiftKey) {
        event.preventDefault();
        handleSaveNamedDiagram();
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "S") {
        event.preventDefault();
        handleExportSvg();
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "P") {
        event.preventDefault();
        handleExportPng();
      }
      if (event.key === "F11" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setFullscreenOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    fullscreenOpen,
    settingsOpen,
    helpOpen,
    handleSaveNamedDiagram,
    handleExportSvg,
    handleExportPng,
  ]);

  // Lock body scroll when overlays are open
  useEffect(() => {
    document.body.style.overflow =
      settingsOpen || fullscreenOpen || helpOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [settingsOpen, fullscreenOpen, helpOpen]);

  return (
    <div className="app-shell">
      <Header
        currentUITheme={uiTheme}
        onToggleUITheme={handleToggleUITheme}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <main className="workspace">
        <EditorPanel
          source={source}
          onSourceChange={handleSourceChange}
          diagramName={diagramName}
          onDiagramNameChange={setDiagramName}
          onSaveNamedDiagram={handleSaveNamedDiagram}
          history={history}
          onHistorySelect={handleHistorySelect}
          onSaveHistory={handleSaveHistory}
          onClearHistory={handleClearHistory}
          presets={presets}
          onSelectPreset={(preset) => handleSetSource(preset.source, true)}
          onResetDemo={handleResetDemo}
          onCopySource={handleCopySource}
        />

        <PreviewPanel
          svgHtml={svgHtml}
          previewRef={previewRef}
          statusMsg={statusMsg}
          statusKind={statusKind}
          zoomLevel={zoomLevel}
          onZoomIn={() => setZoomLevel((z) => Math.min(5, z + 0.25))}
          onZoomOut={() => setZoomLevel((z) => Math.max(0.25, z - 0.25))}
          onZoomReset={() => setZoomLevel(1)}
          onFullscreen={handleOpenFullscreen}
          onExportSvg={handleExportSvg}
          onExportPng={handleExportPng}
          onExportJpeg={handleExportJpeg}
        />
      </main>

      <SavedDiagrams
        diagrams={savedDiagrams}
        onLoad={handleLoadDiagram}
        onDelete={handleDeleteDiagram}
        onExportLibrary={handleExportLibrary}
        onImportLibrary={handleImportLibrary}
      />

      {settingsOpen && (
        <>
          <div
            className="settings-backdrop"
            onClick={() => setSettingsOpen(false)}
          />
          <SettingsDrawer
            settings={settings}
            themePresets={themePresets}
            onClose={() => setSettingsOpen(false)}
            onApplyPreset={handleApplyThemePreset}
            onSettingsChange={handleSettingsChange}
          />
        </>
      )}

      {helpOpen && (
        <>
          <div
            className="settings-backdrop"
            onClick={() => setHelpOpen(false)}
          />
          <HelpModal onClose={() => setHelpOpen(false)} />
        </>
      )}

      {fullscreenOpen && (
        <FullscreenOverlay
          svgHtml={svgHtml}
          zoomLevel={fsZoomLevel}
          onZoomIn={() => setFsZoomLevel((z) => Math.min(5, z + 0.25))}
          onZoomOut={() => setFsZoomLevel((z) => Math.max(0.25, z - 0.25))}
          onZoomReset={() => setFsZoomLevel(1)}
          onExportSvg={handleExportSvg}
          onExportPng={handleExportPng}
          onClose={() => setFullscreenOpen(false)}
        />
      )}

      <ToastContainer toasts={toasts} />

      <footer className="site-footer">
        <p>
          Mermaid Studio is open source on{" "}
          <a
            href="https://github.com/jamesmontemagno/my-mermaid-visualizer"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>{" "}
          and built leveraging{" "}
          <a
            href="https://github.com/features/copilot"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Copilot
          </a>
          ,{" "}
          <a
            href="https://github.com/features/copilot/cli"
            target="_blank"
            rel="noreferrer"
          >
            Copilot CLI
          </a>
          , and{" "}
          <a
            href="https://code.visualstudio.com/"
            target="_blank"
            rel="noreferrer"
          >
            Visual Studio Code
          </a>
          . Visit <a href="https://mermaidstudio.app" target="_blank" rel="noreferrer">mermaidstudio.app</a>.
        </p>
        <p className="shortcuts-hint">
          Keyboard shortcuts: <kbd>Ctrl</kbd>+<kbd>S</kbd> Save &middot;{" "}
          <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> SVG &middot;{" "}
          <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> PNG &middot;{" "}
          <kbd>F11</kbd> Fullscreen &middot; <kbd>?</kbd> Help &middot;{" "}
          <kbd>Esc</kbd> Close overlay
        </p>
      </footer>
    </div>
  );
}
