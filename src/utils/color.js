export function textColorFor(hex) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((s) => s + s)
          .join("")
      : normalized;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#0f172a" : "#f8fafc";
}

export function adjustColor(hex, amount) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((s) => s + s)
          .join("")
      : normalized;

  const channels = [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ].map((c) => Math.max(0, Math.min(255, Math.round(c + amount))));

  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function buildThemeVariables(settings) {
  const primary = settings.primaryColor;
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
    fontSize: `${settings.fontSize}px`,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  };
}
