# Mermaid diagrams and rendering: how it works and what you can style

## Executive Summary

Mermaid turns a text description into an SVG diagram through a small public API: initialize configuration, parse or detect the diagram type, render it to SVG, and optionally bind interaction handlers after insertion into the DOM.[^1][^2] Its rendering model is deliberately split between global/site configuration, per-diagram configuration, and diagram-specific styling directives, so the same library can be used for static docs, interactive apps, and custom-branded diagrams.[^2][^3]

The biggest styling lever is the theme system. Mermaid ships with multiple themes, but `base` is the only one intended for customization, and most visual tuning happens by overriding `themeVariables` such as `primaryColor`, `primaryTextColor`, and `lineColor`.[^4] Beyond themes, individual diagram families expose their own styling hooks: flowcharts support `style`, `classDef`, `class`, `linkStyle`, and curve configuration, while sequence diagrams are styled via CSS classes extracted at render time.[^5][^6]

## Architecture / Rendering Overview

At a high level, Mermaid rendering looks like this:

```text
┌────────────────────┐
│ Mermaid text input │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐     ┌─────────────────────┐
│ Parse / detect type│────▶│ Diagram registry     │
└─────────┬──────────┘     │ (built-in + extras)  │
          │                └─────────┬───────────┘
          ▼                          │
┌────────────────────┐               ▼
│ Render to SVG      │──────────▶┌────────────────────┐
└─────────┬──────────┘           │ Insert into DOM     │
          │                      └─────────┬───────────┘
          ▼                                │
┌────────────────────┐                     ▼
│ Bind interactions  │               ┌───────────────┐
└────────────────────┘               │ Live diagram   │
                                     └───────────────┘
```

The public `mermaid` object exposes `initialize`, `run`, `render`, `parse`, `detectType`, and `registerExternalDiagrams`. `run` scans the DOM for Mermaid nodes and skips ones already marked as processed; `render` is queued so multiple render calls execute serially; and `parse` validates syntax without rendering, returning a diagram type on success.[^1]

## How Rendering Works in Practice

For simple web-page integration, Mermaid expects diagram definitions inside elements such as `<pre class="mermaid">` and a script import. When the page finishes loading, Mermaid finds those elements and replaces them with SVG output.[^7] The docs also call out `mermaid.run()` as the preferred entry point for more complex integrations, because it lets you render specific nodes or selectors and can suppress errors if needed.[^7]

The runtime path is:

1. Configuration is established with `mermaid.initialize(...)`.[^2][^7]
2. Mermaid either auto-runs on page load or is invoked explicitly with `run`/`render`.[^1][^7]
3. The diagram text is parsed and identified by type, then rendered to SVG.[^1][^7]
4. If the diagram uses click handlers, tooltips, or other interactivity, Mermaid returns `bindFunctions`, which must be called after the SVG is inserted into the DOM.[^7]

That split between SVG generation and post-render binding is important: Mermaid does not assume it owns the final DOM insertion step, which makes it usable in frameworks, markdown pipelines, and custom rendering flows.[^7]

## Configuration Model

Mermaid’s config layer merges defaults, site configuration, and diagram directives into a current effective config. The implementation sanitizes directive input to remove secure keys, prototype-pollution attempts, and obvious XSS-like strings before applying them.[^2] It also derives effective `htmlLabels` behavior from global `htmlLabels` or the older `flowchart.htmlLabels` setting, with a warning for the deprecated flowchart-specific path.[^2]

That design gives you three scopes of control:

| Scope | What it controls | Typical mechanism |
|---|---|---|
| Global / site-wide | Default renderer behavior, security, base theme | `mermaid.initialize(...)` |
| Diagram-specific | One diagram’s theme or variables | frontmatter config |
| Diagram syntax | Node/link/class styling in a single diagram | `style`, `classDef`, `linkStyle`, etc. |

The docs also emphasize that `securityLevel` affects whether HTML tags and click behavior are allowed, and that `startOnLoad: false` disables the auto-run behavior so you can call `run` manually.[^7]

## Theming and Visual Variables

The official theme docs list five built-in themes: `default`, `neutral`, `dark`, `forest`, and `base`.[^4] Mermaid says `base` is the only theme intended for customization; the rest are predefined presets.[^4]

The theme engine is variable-driven. The `Theme` class in `theme-base.js` starts with base colors and fonts, then derives many downstream values in `updateColors()`, including border colors, text colors, line colors, and diagram-family-specific variables for flowcharts, sequence diagrams, gantt charts, architecture diagrams, quadrant charts, xy charts, requirement diagrams, git graphs, pie charts, and more.[^3] `getThemeVariables()` simply instantiates the theme and runs that derivation logic with any user overrides applied.[^3]

Two practical consequences fall out of that implementation:

1. Many theme values are not “set directly”; they are computed from the base palette so diagrams remain readable across light/dark variants.[^3][^4]
2. Mermaid’s theming engine expects hex colors, not named CSS colors, for derived-color calculations.[^4]

The most common override points are `primaryColor`, `primaryTextColor`, `primaryBorderColor`, `lineColor`, and font-related values like `fontFamily` and `fontSize`.[^4]

## Diagram-Specific Styling Options

### Flowcharts

Flowcharts have the richest explicit styling syntax. You can:

* set a style directly on a node with `style id1 fill:#f9f,stroke:#333,...`
* define reusable style groups with `classDef`
* attach one or more classes with `class` or the `:::` shorthand
* style links by link order using `linkStyle`
* change curve style globally for a diagram or on a specific edge using edge IDs and `curve` overrides[^5]

Mermaid’s flowchart docs also note that link styling is positional rather than ID-based unless you assign IDs to edges, because links do not inherently have node-like identifiers.[^5] That is why `linkStyle 3 ...` targets the fourth link, while edge IDs allow more precise styling for later overrides.[^5]

### Sequence diagrams

Sequence diagrams lean more on CSS. The docs say styling is done by defining CSS classes and that Mermaid extracts those classes during rendering from `src/themes/sequence.scss`.[^6] This means the diagram syntax is less about per-element style directives and more about theme/CSS class composition.

### Theme-driven diagram families

Several diagram families pick up their colors and typography from theme variables rather than ad hoc syntax. For example, the theme docs explicitly list flowchart variables such as `nodeBorder`, `clusterBkg`, and `defaultLinkColor`, sequence variables such as `actorBkg`, `actorBorder`, and `signalColor`, and pie-chart variables such as `pie1` through `pie12` plus pie-specific text and stroke settings.[^4]

## Practical Recommendations

If you want broad branding control, start with `theme: 'base'` and override a small set of theme variables instead of trying to override every diagram family individually.[^4] If you need one-off visuals inside a single diagram, use diagram syntax directives such as `style`, `classDef`, or `linkStyle` for flowcharts, and CSS classes for sequence diagrams.[^5][^6]

If you are embedding Mermaid in an application, prefer `startOnLoad: false` plus `await mermaid.run(...)` so you can control when the DOM is ready and which nodes are rendered.[^7] That avoids timing problems such as labels rendering before web fonts have loaded, which the docs specifically call out as a cause of labels being positioned incorrectly.[^7]

## Confidence Assessment

High confidence: Mermaid renders diagrams by parsing text, resolving a diagram type, producing SVG, and then optionally binding interactions afterward.[^1][^7] High confidence: theme customization is centered on `base` and `themeVariables`, and flowchart/sequence styling hooks behave as described in the docs and theme implementation.[^3][^4][^5][^6]

Moderate confidence: the exact set of theme variables and their downstream derivations can evolve between Mermaid releases, because the theme engine contains a large number of diagram-specific variables and calculations.[^3][^4] Where I gave broad ranges for source-file citations, the cited sections are the relevant implementation areas, but the precise line boundaries may shift slightly across commits.[^1][^2][^3]

## Footnotes

[^1]: `packages/mermaid/src/mermaid.ts:1-415` in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid). Public API surface including `run`, `render`, `parse`, `detectType`, `initialize`, `registerExternalDiagrams`, the DOM scan in `runThrowsErrors`, and the queued `render`/`parse` execution model.

[^2]: `packages/mermaid/src/config.ts:1-205` in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid). Configuration merging, directive sanitization, site/current config updates, theme-variable application, and effective `htmlLabels` resolution.

[^3]: `packages/mermaid/src/themes/theme-base.js:8-412` in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid). Base theme variables, derived color calculations in `updateColors()`, and `getThemeVariables()`.

[^4]: `packages/mermaid/src/docs/config/theming.md:1-140` in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid). Built-in themes, `theme: 'base'`, frontmatter customization with `themeVariables`, and the documented theme-variable tables.

[^5]: `packages/mermaid/src/docs/syntax/flowchart.md:1784-1905` in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid). Flowchart styling with `linkStyle`, curve configuration, node `style`, `classDef`, class attachment, and related examples.

[^6]: `packages/mermaid/src/docs/syntax/sequenceDiagram.md:1044-1068` in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid). Sequence-diagram styling via CSS classes extracted from `src/themes/sequence.scss`.

[^7]: `packages/mermaid/src/docs/config/usage.md:1-260` in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid). Page-load integration, `securityLevel`, font-loading caveats, `mermaid.run`, deprecated `init`, `render`, `bindFunctions`, `parse`, `detectType`, and initialization patterns.
