const STORAGE_KEYS = {
  draft: ["mermaid-studio:draft", "mermaid-visualizer:draft"],
  history: ["mermaid-studio:history", "mermaid-visualizer:history"],
  savedDiagrams: [
    "mermaid-studio:saved-diagrams",
    "mermaid-visualizer:saved-diagrams",
  ],
  settings: ["mermaid-studio:settings", "mermaid-visualizer:settings"],
};

function readStorageValue(keys, fallback = null) {
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value !== null) return value;
  }
  return fallback;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeHistoryEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (typeof entry === "string" && entry.trim()) {
        return { source: entry, savedAt: new Date().toISOString() };
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

export function normalizeSavedDiagrams(entries) {
  if (!Array.isArray(entries)) return [];
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
          settings:
            entry.settings && typeof entry.settings === "object"
              ? entry.settings
              : null,
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

export function loadState(defaultSettings) {
  const savedDraft = readStorageValue(STORAGE_KEYS.draft);
  const savedHistory = safeJsonParse(
    readStorageValue(STORAGE_KEYS.history, "[]"),
    [],
  );
  const savedDiagrams = safeJsonParse(
    readStorageValue(STORAGE_KEYS.savedDiagrams, "[]"),
    [],
  );
  const savedSettings = safeJsonParse(
    readStorageValue(STORAGE_KEYS.settings, "{}"),
    {},
  );

  return {
    source: typeof savedDraft === "string" && savedDraft.trim() ? savedDraft : null,
    history: normalizeHistoryEntries(savedHistory),
    savedDiagrams: normalizeSavedDiagrams(savedDiagrams),
    settings: { ...defaultSettings, ...savedSettings },
  };
}

export function saveDraft(source, history, savedDiagrams, settings) {
  localStorage.setItem(STORAGE_KEYS.draft[0], source);
  localStorage.setItem(
    STORAGE_KEYS.history[0],
    JSON.stringify(history.slice(0, 10)),
  );
  localStorage.setItem(
    STORAGE_KEYS.savedDiagrams[0],
    JSON.stringify(savedDiagrams.slice(0, 25)),
  );
  localStorage.setItem(STORAGE_KEYS.settings[0], JSON.stringify(settings));
}

export function clearHistoryStorage() {
  for (const key of STORAGE_KEYS.history) {
    localStorage.removeItem(key);
  }
}

export function firstMeaningfulLine(source) {
  return (
    source
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "Untitled diagram"
  );
}

export function formatSavedAt(savedAt) {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return "Saved locally";
  return `Saved ${date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function normalizeSource(source) {
  return source.replace(/\r\n/g, "\n").trimEnd() + "\n";
}
