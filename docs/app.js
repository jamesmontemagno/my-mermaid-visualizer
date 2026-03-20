import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

const defaultSource = `flowchart TD
  A[Idea] --> B[Write Mermaid]
  B --> C[Render Preview]
  C --> D[Export SVG/PNG/JPEG]
  D --> E[Ship to GitHub Pages]
`;

const presets = [
  {
    id: "flowchart",
    title: "Flowchart",
    description: "The classic process diagram with quick styling wins.",
    source: `flowchart LR
  A[Start] --> B{Choice}
  B -->|Yes| C[Build]
  B -->|No| D[Refine]
  C --> E[Export]
  D --> E
`,
  },
  {
    id: "sequence",
    title: "Sequence",
    description: "Communicate a request/response flow clearly.",
    source: `sequenceDiagram
  participant U as User
  participant A as App
  participant M as Mermaid
  U->>A: Paste diagram text
  A->>M: Render diagram
  M-->>A: SVG markup
  A-->>U: Preview + export options
`,
  },
  {
    id: "journey",
    title: "Journey",
    description: "Show an experience path with emphasis on sentiment.",
    source: `journey
  title Diagram journey
  section Draft
    Write text: 5: Me
    Fix syntax: 3: Me
  section Polish
    Style it: 4: Me
    Export it: 5: Me
`,
  },
  {
    id: "gantt",
    title: "Gantt",
    description: "Plan a small roadmap with dates and milestones.",
    source: `gantt
  title Mermaid Visualizer Roadmap
  dateFormat  YYYY-MM-DD
  section Core
  Editor and preview      :done, a1, 2026-03-01, 3d
  Export buttons          :active, a2, after a1, 4d
  section Launch
  GitHub Pages deployment :a3, after a2, 2d
`,
  },
];

const themePresets = [
  {
    id: "electric",
    title: "Electric",
    description: "Bright blue contrast for bold technical diagrams.",
    settings: {
      theme: "base",
      primaryColor: "#2563eb",
      backgroundColor: "#0b1120",
      fontSize: 16,
    },
  },
  {
    id: "midnight",
    title: "Midnight",
    description: "A darker presentation look for demos and screenshots.",
    settings: {
      theme: "dark",
      primaryColor: "#8b5cf6",
      backgroundColor: "#030712",
      fontSize: 17,
    },
  },
  {
    id: "forest",
    title: "Forest",
    description: "Calmer green tones for architecture and flow diagrams.",
    settings: {
      theme: "forest",
      primaryColor: "#10b981",
      backgroundColor: "#071a14",
      fontSize: 16,
    },
  },
  {
    id: "neutral",
    title: "Minimal",
    description: "Low-noise styling that reads cleanly in docs and exports.",
    settings: {
      theme: "neutral",
      primaryColor: "#64748b",
      backgroundColor: "#111827",
      fontSize: 15,
    },
  },
];

const storageKeys = {
  draft: "mermaid-visualizer:draft",
  history: "mermaid-visualizer:history",
  savedDiagrams: "mermaid-visualizer:saved-diagrams",
  settings: "mermaid-visualizer:settings",
};

const state = {
  renderToken: 0,
  source: defaultSource,
  history: [],
  savedDiagrams: [],
  settings: {
    theme: "base",
    primaryColor: "#2563eb",
    backgroundColor: "#0b1120",
    fontSize: 16,
  },
};

const elements = {
  input: document.getElementById("mermaid-input"),
  preview: document.getElementById("preview"),
  status: document.getElementById("render-status"),
  themeSelect: document.getElementById("theme-select"),
  primaryColor: document.getElementById("primary-color"),
  backgroundColor: document.getElementById("background-color"),
  fontSize: document.getElementById("font-size"),
  themePresetGrid: document.getElementById("theme-preset-grid"),
  presetGrid: document.getElementById("preset-grid"),
  historySelect: document.getElementById("history-select"),
  historyMeta: document.getElementById("history-meta"),
  saveHistoryBtn: document.getElementById("save-history-btn"),
  clearHistoryBtn: document.getElementById("clear-history-btn"),
  resetDemoBtn: document.getElementById("reset-demo-btn"),
  diagramNameInput: document.getElementById("diagram-name-input"),
  saveDiagramBtn: document.getElementById("save-diagram-btn"),
  savedDiagramsList: document.getElementById("saved-diagrams-list"),
  copySourceBtn: document.getElementById("copy-source-btn"),
  downloadSvgBtn: document.getElementById("download-svg-btn"),
  downloadPngBtn: document.getElementById("download-png-btn"),
  downloadJpgBtn: document.getElementById("download-jpg-btn"),
};

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeHistoryEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      if (typeof entry === "string" && entry.trim()) {
        return {
          source: entry,
          savedAt: new Date().toISOString(),
        };
      }

      if (
        entry &&
        typeof entry === "object" &&
        typeof entry.source === "string" &&
        entry.source.trim()
      ) {
        return {
          source: entry.source,
          savedAt:
            typeof entry.savedAt === "string" && entry.savedAt.trim()
              ? entry.savedAt
              : new Date().toISOString(),
        };
      }

      return null;
    })
    .filter(Boolean);
}

function firstMeaningfulLine(source) {
  return (
    source
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "Untitled diagram"
  );
}

function normalizeSavedDiagrams(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      if (
        entry &&
        typeof entry === "object" &&
        typeof entry.name === "string" &&
        entry.name.trim() &&
        typeof entry.source === "string" &&
        entry.source.trim()
      ) {
        return {
          id:
            typeof entry.id === "string" && entry.id.trim()
              ? entry.id
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: entry.name.trim(),
          source: entry.source,
          settings: entry.settings && typeof entry.settings === "object" ? entry.settings : null,
          savedAt:
            typeof entry.savedAt === "string" && entry.savedAt.trim()
              ? entry.savedAt
              : new Date().toISOString(),
        };
      }

      return null;
    })
    .filter(Boolean);
}

function formatSavedAt(savedAt) {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return "Saved locally";
  }

  return `Saved ${date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function loadState() {
  const savedDraft = localStorage.getItem(storageKeys.draft);
  const savedHistory = safeJsonParse(localStorage.getItem(storageKeys.history) ?? "[]", []);
  const savedDiagrams = safeJsonParse(
    localStorage.getItem(storageKeys.savedDiagrams) ?? "[]",
    [],
  );
  const savedSettings = safeJsonParse(
    localStorage.getItem(storageKeys.settings) ?? "{}",
    {},
  );

  if (typeof savedDraft === "string" && savedDraft.trim()) {
    state.source = savedDraft;
  }

  state.history = normalizeHistoryEntries(savedHistory);
  state.savedDiagrams = normalizeSavedDiagrams(savedDiagrams);

  state.settings = {
    ...state.settings,
    ...savedSettings,
  };
}

function saveDraft() {
  localStorage.setItem(storageKeys.draft, state.source);
  localStorage.setItem(storageKeys.history, JSON.stringify(state.history.slice(0, 10)));
  localStorage.setItem(
    storageKeys.savedDiagrams,
    JSON.stringify(state.savedDiagrams.slice(0, 25)),
  );
  localStorage.setItem(storageKeys.settings, JSON.stringify(state.settings));
}

function updateThemeControls() {
  elements.themeSelect.value = state.settings.theme;
  elements.primaryColor.value = state.settings.primaryColor;
  elements.backgroundColor.value = state.settings.backgroundColor;
  elements.fontSize.value = String(state.settings.fontSize);
  document.documentElement.style.setProperty("--bg", state.settings.backgroundColor);
}

function renderPresetCards() {
  elements.presetGrid.replaceChildren(
    ...presets.map((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-card";
      button.innerHTML = `<strong>${preset.title}</strong><span>${preset.description}</span>`;
      button.addEventListener("click", () => {
        setSource(preset.source, true);
      });
      return button;
    }),
  );
}

function renderThemePresetCards() {
  elements.themePresetGrid.replaceChildren(
    ...themePresets.map((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-preset-button";
      button.innerHTML = `<strong>${preset.title}</strong><span>${preset.description}</span>`;
      button.addEventListener("click", () => {
        state.settings = {
          ...state.settings,
          ...preset.settings,
        };
        updateThemeControls();
        saveDraft();
        scheduleRender();
        setStatus(`Applied the ${preset.title} theme preset.`, "success");
      });
      return button;
    }),
  );
}

function renderHistorySelect() {
  const options = [
    new Option(
      state.history.length ? `Recent diagrams (${state.history.length})` : "No saved history yet",
      "",
    ),
    ...state.history.map((entry, index) => {
      const label = firstMeaningfulLine(entry.source).slice(0, 50) || `Diagram ${index + 1}`;
      return new Option(label, String(index));
    }),
  ];

  elements.historySelect.replaceChildren(...options);
  elements.historyMeta.textContent = state.history.length
    ? `Stored locally in this browser. Keeping the latest ${state.history.length} diagrams.`
    : "History is empty until you render or save a diagram.";
}

function addToHistory(source) {
  const nextEntry = {
    source,
    savedAt: new Date().toISOString(),
  };
  const next = [nextEntry, ...state.history.filter((entry) => entry.source !== source)];
  state.history = next.slice(0, 10);
  renderHistorySelect();
}

function renderSavedDiagrams() {
  if (!state.savedDiagrams.length) {
    elements.savedDiagramsList.innerHTML =
      '<p class="empty-library">No named diagrams yet. Save one with a custom name to build your personal diagram library.</p>';
    return;
  }

  const cards = state.savedDiagrams.map((diagram) => {
    const article = document.createElement("article");
    article.className = "saved-diagram-card";

    const head = document.createElement("div");
    head.className = "saved-diagram-head";

    const headingBlock = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = diagram.name;
    const timestamp = document.createElement("span");
    timestamp.textContent = formatSavedAt(diagram.savedAt);
    headingBlock.append(title, timestamp);

    const actions = document.createElement("div");
    actions.className = "saved-diagram-actions";

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "button secondary compact-button";
    loadButton.textContent = "Load";
    loadButton.addEventListener("click", () => {
      if (diagram.settings && typeof diagram.settings === "object") {
        state.settings = {
          ...state.settings,
          ...diagram.settings,
        };
        updateThemeControls();
      }

      elements.diagramNameInput.value = diagram.name;
      setSource(diagram.source, false);
      setStatus(`Loaded "${diagram.name}".`, "success");
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button secondary compact-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      state.savedDiagrams = state.savedDiagrams.filter((entry) => entry.id !== diagram.id);
      saveDraft();
      renderSavedDiagrams();
      setStatus(`Deleted "${diagram.name}".`, "success");
    });

    actions.append(loadButton, deleteButton);
    head.append(headingBlock, actions);

    const summary = document.createElement("p");
    summary.className = "saved-diagram-source";
    summary.textContent = firstMeaningfulLine(diagram.source);

    article.append(head, summary);
    return article;
  });

  elements.savedDiagramsList.replaceChildren(...cards);
}

function setStatus(message, kind = "idle") {
  elements.status.textContent = message;
  elements.status.className = `status ${kind === "idle" ? "" : kind}`.trim();
}

function textColorFor(hex) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((segment) => segment + segment)
          .join("")
      : normalized;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#0f172a" : "#f8fafc";
}

function adjustColor(hex, amount) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((segment) => segment + segment)
          .join("")
      : normalized;

  const channels = [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ].map((channel) => Math.max(0, Math.min(255, Math.round(channel + amount))));

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function buildThemeVariables() {
  const primary = state.settings.primaryColor;
  const primaryTextColor = textColorFor(primary);
  return {
    primaryColor: primary,
    primaryTextColor,
    primaryBorderColor: adjustColor(primary, -40),
    secondaryColor: adjustColor(primary, 64),
    tertiaryColor: adjustColor(primary, 92),
    lineColor: adjustColor(primary, -64),
    mainBkg: "#0f172a",
    clusterBkg: "#0b1223",
    nodeBorder: adjustColor(primary, -54),
    fontSize: `${state.settings.fontSize}px`,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  };
}

function normalizeSource(source) {
  return source.replace(/\r\n/g, "\n").trimEnd() + "\n";
}

function setSource(source, fromPreset = false) {
  state.source = normalizeSource(source);
  elements.input.value = state.source;
  if (fromPreset) {
    addToHistory(state.source);
    saveDraft();
  }
  scheduleRender();
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem(storageKeys.history);
  renderHistorySelect();
  setStatus("Local history cleared.", "success");
}

function saveNamedDiagram() {
  const source = normalizeSource(elements.input.value);
  if (!source.trim()) {
    setStatus("Add Mermaid source before saving a named diagram.", "error");
    return;
  }

  const requestedName = elements.diagramNameInput.value.trim();
  const name = requestedName || firstMeaningfulLine(source).slice(0, 60);
  const existing = state.savedDiagrams.find(
    (entry) => entry.name.toLowerCase() === name.toLowerCase(),
  );

  const nextDiagram = {
    id: existing?.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    source,
    settings: { ...state.settings },
    savedAt: new Date().toISOString(),
  };

  state.savedDiagrams = [
    nextDiagram,
    ...state.savedDiagrams.filter((entry) => entry.id !== nextDiagram.id),
  ].slice(0, 25);

  elements.diagramNameInput.value = nextDiagram.name;
  addToHistory(source);
  saveDraft();
  renderSavedDiagrams();
  setStatus(
    existing
      ? `Updated the saved diagram "${nextDiagram.name}".`
      : `Saved "${nextDiagram.name}" to your diagram library.`,
    "success",
  );
}

function serializeSvg(svgElement) {
  const clone = svgElement.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  return new XMLSerializer().serializeToString(clone);
}

function readSvgDimensions(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) {
    throw new Error("Rendered SVG could not be parsed.");
  }

  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const [x, y, width, height] = viewBox.split(/\s+/).map(Number);
    if ([x, y, width, height].every(Number.isFinite)) {
      return { width, height };
    }
  }

  const width = Number.parseFloat(svg.getAttribute("width") ?? "");
  const height = Number.parseFloat(svg.getAttribute("height") ?? "");
  if (Number.isFinite(width) && Number.isFinite(height)) {
    return { width, height };
  }

  return { width: 1200, height: 800 };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportSvg() {
  const svg = elements.preview.querySelector("svg");
  if (!svg) {
    throw new Error("Render a diagram before exporting SVG.");
  }
  const blob = new Blob([serializeSvg(svg)], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, "mermaid-diagram.svg");
}

async function exportRaster(format) {
  const svg = elements.preview.querySelector("svg");
  if (!svg) {
    throw new Error(`Render a diagram before exporting ${format.toUpperCase()}.`);
  }

  const svgMarkup = serializeSvg(svg);
  const { width, height } = readSvgDimensions(svgMarkup);
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not supported in this browser.");
  }

  const image = new Image();
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  await new Promise((resolve, reject) => {
    image.onload = () => {
      context.scale(scale, scale);
      if (format === "jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      resolve();
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to convert the diagram to an image."));
    };
    image.src = url;
  });

  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const filename = format === "jpeg" ? "mermaid-diagram.jpg" : "mermaid-diagram.png";

  const exported = await new Promise((resolve) => {
    canvas.toBlob((value) => resolve(value), mimeType, format === "jpeg" ? 0.94 : undefined);
  });

  if (!exported) {
    throw new Error(`Unable to export ${format.toUpperCase()} from the current diagram.`);
  }

  downloadBlob(exported, filename);
}

async function copySource() {
  await navigator.clipboard.writeText(state.source);
  setStatus("Diagram source copied to clipboard.", "success");
  window.setTimeout(() => {
    setStatus("Ready");
  }, 1800);
}

async function renderDiagram() {
  const token = ++state.renderToken;
  const source = normalizeSource(elements.input.value);
  state.source = source;
  saveDraft();

  if (!source.trim()) {
    elements.preview.innerHTML = `<div class="empty-state">Paste Mermaid code to render a diagram.</div>`;
    setStatus("Waiting for diagram source.");
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: state.settings.theme,
    themeVariables: buildThemeVariables(),
  });

  try {
    const id = `diagram-${Date.now()}-${token}`;
    const { svg, bindFunctions } = await mermaid.render(id, source);
    if (token !== state.renderToken) {
      return;
    }

    elements.preview.innerHTML = svg;
    bindFunctions?.(elements.preview);
    addToHistory(source);
    saveDraft();
    setStatus("Rendered successfully.", "success");
  } catch (error) {
    if (token !== state.renderToken) {
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    elements.preview.innerHTML = `<div class="error-card"><strong>Mermaid error</strong><pre>${escapeHtml(message)}</pre></div>`;
    setStatus("Rendering failed. Fix the syntax and try again.", "error");
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let renderTimer;
function scheduleRender() {
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(() => {
    renderDiagram();
  }, 150);
}

function wireEvents() {
  elements.input.addEventListener("input", () => {
    scheduleRender();
  });

  elements.themeSelect.addEventListener("change", () => {
    state.settings.theme = elements.themeSelect.value;
    saveDraft();
    scheduleRender();
  });

  elements.primaryColor.addEventListener("input", () => {
    state.settings.primaryColor = elements.primaryColor.value;
    saveDraft();
    scheduleRender();
  });

  elements.backgroundColor.addEventListener("input", () => {
    state.settings.backgroundColor = elements.backgroundColor.value;
    updateThemeControls();
    saveDraft();
    scheduleRender();
  });

  elements.fontSize.addEventListener("input", () => {
    state.settings.fontSize = Number(elements.fontSize.value);
    saveDraft();
    scheduleRender();
  });

  elements.historySelect.addEventListener("change", () => {
    if (elements.historySelect.value === "") {
      return;
    }

    const index = Number(elements.historySelect.value);
    if (Number.isInteger(index) && index >= 0 && state.history[index]) {
      setSource(state.history[index].source, false);
    }
    elements.historySelect.value = "";
  });

  elements.saveHistoryBtn.addEventListener("click", () => {
    addToHistory(normalizeSource(elements.input.value));
    saveDraft();
    setStatus("Saved snapshot to local history.", "success");
  });

  elements.clearHistoryBtn.addEventListener("click", () => {
    clearHistory();
  });

  elements.resetDemoBtn.addEventListener("click", () => {
    setSource(defaultSource, true);
    setStatus("Reset to the default Mermaid demo.", "success");
  });

  elements.saveDiagramBtn.addEventListener("click", () => {
    saveNamedDiagram();
  });

  elements.diagramNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveNamedDiagram();
    }
  });

  elements.copySourceBtn.addEventListener("click", () => {
    void copySource().catch((error) =>
      setStatus(error instanceof Error ? error.message : String(error), "error"),
    );
  });

  elements.downloadSvgBtn.addEventListener("click", () => {
    void exportSvg().catch((error) => setStatus(error instanceof Error ? error.message : String(error), "error"));
  });

  elements.downloadPngBtn.addEventListener("click", () => {
    void exportRaster("png").catch((error) => setStatus(error instanceof Error ? error.message : String(error), "error"));
  });

  elements.downloadJpgBtn.addEventListener("click", () => {
    void exportRaster("jpeg").catch((error) => setStatus(error instanceof Error ? error.message : String(error), "error"));
  });
}

function initialize() {
  loadState();
  renderPresetCards();
  renderThemePresetCards();
  renderHistorySelect();
  renderSavedDiagrams();
  updateThemeControls();
  wireEvents();
  elements.input.value = state.source;

  if (!state.history.length) {
    addToHistory(state.source);
  }

  setStatus("Ready");
  void renderDiagram();
}

initialize();
