function collectSvgStyles(svgElement) {
  const styles = [];
  const styleElements = svgElement.querySelectorAll("style");
  for (const el of styleElements) {
    if (el.textContent) {
      styles.push(el.textContent);
    }
  }
  return styles.join("\n");
}

export function serializeSvg(svgElement) {
  const clone = svgElement.cloneNode(true);

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  if (!clone.getAttribute("width") || !clone.getAttribute("height")) {
    const viewBox = clone.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite)) {
        clone.setAttribute("width", String(parts[2]));
        clone.setAttribute("height", String(parts[3]));
      }
    }
  }

  const existingStyles = collectSvgStyles(clone);

  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  `;
  const combinedCSS = fontStyle + "\n" + existingStyles;

  const existingStyleEls = clone.querySelectorAll("style");
  for (const el of existingStyleEls) {
    el.remove();
  }

  const newStyleEl = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "style",
  );
  newStyleEl.textContent = combinedCSS;
  clone.insertBefore(newStyleEl, clone.firstChild);

  const defsEl = clone.querySelector("defs");
  if (!defsEl) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    clone.insertBefore(defs, clone.firstChild);
  }

  return new XMLSerializer().serializeToString(clone);
}

export function readSvgDimensions(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) {
    throw new Error("Rendered SVG could not be parsed.");
  }

  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      return { width: parts[2], height: parts[3] };
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

export async function exportSvg(previewElement) {
  const svg = previewElement.querySelector("svg");
  if (!svg) {
    throw new Error("Render a diagram before exporting SVG.");
  }

  const svgMarkup = serializeSvg(svg);

  const validationParser = new DOMParser();
  const validationDoc = validationParser.parseFromString(
    svgMarkup,
    "image/svg+xml",
  );
  const parseError = validationDoc.querySelector("parsererror");
  if (parseError) {
    throw new Error(
      "SVG serialization produced invalid markup. Please try a different diagram.",
    );
  }

  const blob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });
  downloadBlob(blob, "mermaid-diagram.svg");
}

export async function exportRaster(previewElement, format) {
  const svg = previewElement.querySelector("svg");
  if (!svg) {
    throw new Error(
      `Render a diagram before exporting ${format.toUpperCase()}.`,
    );
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
  const blob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  await new Promise((resolve, reject) => {
    image.onload = () => {
      context.scale(scale, scale);
      if (format === "jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0, width, height);
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
  const filename =
    format === "jpeg" ? "mermaid-diagram.jpg" : "mermaid-diagram.png";

  const exported = await new Promise((resolve) => {
    canvas.toBlob(
      (value) => resolve(value),
      mimeType,
      format === "jpeg" ? 0.94 : undefined,
    );
  });

  if (!exported) {
    throw new Error(
      `Unable to export ${format.toUpperCase()} from the current diagram.`,
    );
  }

  downloadBlob(exported, filename);
}

export function exportLibraryJson(savedDiagrams) {
  if (!savedDiagrams.length) {
    throw new Error("No diagrams in library to export.");
  }

  const data = JSON.stringify(savedDiagrams, null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, "mermaid-library.json");
  return savedDiagrams.length;
}
