import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";

/**
 * TGCU basemap style builder (MAP-BUILD.md §Dependencies; DS §9.9; 06 H.1).
 *
 * Client-only by usage: imported solely by the `UgandaMap` lazy island, so the
 * maplibre type import above stays type-only and no map code enters any
 * route's First-Load JS. Colors resolve from the LIVE design tokens on
 * `document.documentElement` (globals.css is the single source of truth —
 * NFR-84); map-only shades (water, landcover, roads) are derived literals in
 * the same warm-stone / brand families, one table per theme, documented here
 * because WebGL cannot consume CSS variables.
 *
 * Tiles: self-hosted Protomaps daily build (Basemap 4.14.10, z0–13, MVT) via
 * the pmtiles protocol — verified source-layers: boundaries, buildings, earth,
 * landcover, landuse, places, pois, roads, water. No third-party tile hosts,
 * no tokens (M12 hard requirement). Glyphs are self-hosted Noto Sans PBFs.
 */

export type MapTheme = "light" | "dark";

/** Uganda view bounds (rubric M12): fitBounds target. */
export const UGANDA_BOUNDS: [[number, number], [number, number]] = [
  [29.57, -1.48],
  [35.0, 4.23],
];

/** Pan limits — Uganda bounds padded ~1.5° so the country can't be lost. */
export const UGANDA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [28.07, -2.98],
  [36.5, 5.73],
];

export const MAP_MIN_ZOOM = 5.5;
export const MAP_MAX_ZOOM = 13; // tiles end at z13 (MAP-BUILD asset state)

/** REQUIRED attribution (MAP-BUILD): OSM + Protomaps, quiet but visible. */
export const MAP_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a> · <a href="https://protomaps.com" target="_blank" rel="noopener noreferrer">Protomaps</a>';

/** Map-only derived shades — warm-stone + muted-green families per 06 H.1
 *  (light = FAFAF9 family; dark = stone-950 family, borders #292524). */
const DERIVED = {
  light: {
    earth: "#f6f4f0",
    green: "#e6eedd", // forest / park — brand-300 tinted toward stone
    grass: "#edf0e2",
    farm: "#f2efe4",
    urban: "#efece7",
    barren: "#f3f0e9",
    water: "#c9d9da",
    waterLine: "#b3cbcd",
    roadMinor: "#e8e4df",
    roadMedium: "#e0dbd4",
    roadMajor: "#d7d1c8",
    roadHighway: "#cfc7bc",
    boundary: "#c6c0b8",
  },
  dark: {
    earth: "#161311",
    green: "#171e16",
    grass: "#181f15",
    farm: "#1a1714",
    urban: "#1b1815",
    barren: "#181512",
    water: "#101a1d",
    waterLine: "#1d2b2f",
    roadMinor: "#211e1b",
    roadMedium: "#282420",
    roadMajor: "#302b26",
    roadHighway: "#38322c",
    boundary: "#3e3833",
  },
} as const;

/** Fallbacks mirror globals.css so the style never fails to build. */
const TOKEN_FALLBACKS: Record<MapTheme, Record<string, string>> = {
  light: {
    "--color-bg": "#fafaf9",
    "--color-border": "#e7e5e4",
    "--color-muted": "#57534e",
    "--brand-600": "#2e9e4f",
    "--brand-300": "#86efac",
  },
  dark: {
    "--color-bg": "#0c0a09",
    "--color-border": "#292524",
    "--color-muted": "#a8a29e",
    "--brand-600": "#2e9e4f",
    "--brand-300": "#86efac",
  },
};

/** sRGB mix of two hex colors (t toward `b`) — used to bias the ADM1 line
 *  from --border toward --muted so "subtle" never degrades to invisible
 *  (the MAP-06 1.07:1 lesson). */
function mixHex(a: string, b: string, t: number): string {
  const p = (h: string) => {
    const s = h.replace("#", "");
    const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
    return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
  };
  const [ar, ag, ab] = p(a);
  const [br, bg, bb] = p(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}

const localityText: ExpressionSpecification = [
  "coalesce",
  ["get", "name:en"],
  ["get", "name"],
];

/**
 * Build the full TGCU style for one theme. Reads the live CSS tokens at call
 * time (so a `.dark` <html> yields dark token values automatically); pass
 * `reducedMotion` to zero the paint-transition crossfade on theme swaps.
 */
export function buildMapStyle(theme: MapTheme, opts?: { reducedMotion?: boolean }): StyleSpecification {
  const fallback = TOKEN_FALLBACKS[theme];
  const css = typeof document !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const tok = (name: string) => css?.getPropertyValue(name).trim() || fallback[name];

  const bg = tok("--color-bg");
  const border = tok("--color-border");
  const muted = tok("--color-muted");
  const brand600 = tok("--brand-600");
  const brand300 = tok("--brand-300");
  const d = DERIVED[theme];
  const adm1 = mixHex(border, muted, 0.3);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return {
    version: 8,
    name: `tgcu-${theme}`,
    // Self-hosted glyph PBFs (Noto Sans Regular/Medium/Italic, 256 ranges each).
    glyphs: `${origin}/tiles/fonts/{fontstack}/{range}.pbf`,
    // Theme swap = setStyle(diff) — a short paint crossfade reads as intentional;
    // zeroed under prefers-reduced-motion (H.2 rule).
    transition: { duration: opts?.reducedMotion ? 0 : 250, delay: 0 },
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${origin}/tiles/uganda.pmtiles`,
        attribution: MAP_ATTRIBUTION,
      },
      "uganda-adm1": {
        type: "geojson",
        data: `${origin}/tiles/uganda-adm1.geojson`,
      },
      "uganda-adm0": {
        type: "geojson",
        data: `${origin}/tiles/uganda-adm0.geojson`,
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": bg } },
      {
        id: "earth",
        type: "fill",
        source: "protomaps",
        "source-layer": "earth",
        paint: { "fill-color": d.earth },
      },
      {
        id: "landcover",
        type: "fill",
        source: "protomaps",
        "source-layer": "landcover",
        paint: {
          "fill-color": [
            "match",
            ["get", "kind"],
            "forest",
            d.green,
            "grassland",
            d.grass,
            "farmland",
            d.farm,
            "urban_area",
            d.urban,
            "barren",
            d.barren,
            d.earth,
          ] as ExpressionSpecification,
        },
      },
      {
        id: "landuse-green",
        type: "fill",
        source: "protomaps",
        "source-layer": "landuse",
        minzoom: 8,
        filter: [
          "in",
          ["get", "kind"],
          [
            "literal",
            ["park", "national_park", "protected_area", "nature_reserve", "forest", "wood", "grass", "cemetery", "golf_course"],
          ],
        ] as ExpressionSpecification,
        paint: { "fill-color": d.green, "fill-opacity": 0.7 },
      },
      {
        id: "water",
        type: "fill",
        source: "protomaps",
        "source-layer": "water",
        filter: ["==", ["geometry-type"], "Polygon"] as ExpressionSpecification,
        paint: { "fill-color": d.water },
      },
      {
        id: "waterway",
        type: "line",
        source: "protomaps",
        "source-layer": "water",
        minzoom: 8,
        filter: [
          "all",
          ["==", ["geometry-type"], "LineString"],
          ["in", ["get", "kind"], ["literal", ["river", "stream", "canal"]]],
        ] as ExpressionSpecification,
        paint: {
          "line-color": d.waterLine,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 13, 1.6] as ExpressionSpecification,
        },
      },
      {
        id: "roads-minor",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        minzoom: 11,
        filter: ["==", ["get", "kind"], "minor_road"] as ExpressionSpecification,
        paint: {
          "line-color": d.roadMinor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.4, 13, 1.4] as ExpressionSpecification,
        },
      },
      {
        id: "roads-medium",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        minzoom: 9.5,
        filter: ["==", ["get", "kind"], "medium_road"] as ExpressionSpecification,
        paint: {
          "line-color": d.roadMedium,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 13, 1.8] as ExpressionSpecification,
        },
      },
      {
        id: "roads-major",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        minzoom: 7.5,
        filter: ["==", ["get", "kind"], "major_road"] as ExpressionSpecification,
        paint: {
          "line-color": d.roadMajor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 13, 2.4] as ExpressionSpecification,
        },
      },
      {
        id: "roads-highway",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        minzoom: 6,
        filter: ["==", ["get", "kind"], "highway"] as ExpressionSpecification,
        paint: {
          "line-color": d.roadHighway,
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.7, 13, 3] as ExpressionSpecification,
        },
      },
      {
        // Neighbouring-country borders for context (OSM); Uganda's own outline
        // is drawn stronger from the staged ADM0 GeoJSON below.
        id: "boundaries-context",
        type: "line",
        source: "protomaps",
        "source-layer": "boundaries",
        filter: ["==", ["get", "kind"], "country"] as ExpressionSpecification,
        paint: { "line-color": d.boundary, "line-width": 1, "line-dasharray": [2, 2] },
      },
      {
        // ADM1 lines from the staged simplified GeoJSON (DS §9.9 geographic
        // credibility): --border biased 30% toward --muted = subtle, never invisible.
        id: "adm1-line",
        type: "line",
        source: "uganda-adm1",
        paint: { "line-color": adm1, "line-width": 1 },
      },
      {
        // ADM0 country outline — slightly stronger, brand-toned (brand-600
        // light / brand-300 dark per the H.1 dark-safe ramp direction).
        id: "adm0-line",
        type: "line",
        source: "uganda-adm0",
        paint: {
          "line-color": theme === "dark" ? brand300 : brand600,
          "line-opacity": theme === "dark" ? 0.4 : 0.5,
          "line-width": 1.4,
        },
      },
      {
        id: "label-locality",
        type: "symbol",
        source: "protomaps",
        "source-layer": "places",
        minzoom: 5.5,
        filter: ["==", ["get", "kind"], "locality"] as ExpressionSpecification,
        layout: {
          "text-field": localityText,
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 12, 13, 14] as ExpressionSpecification,
          "text-padding": 4,
          "text-max-width": 8,
          "symbol-sort-key": ["get", "sort_key"] as ExpressionSpecification,
        },
        paint: {
          "text-color": muted,
          "text-halo-color": d.earth,
          "text-halo-width": 1.2,
        },
      },
      {
        id: "label-country",
        type: "symbol",
        source: "protomaps",
        "source-layer": "places",
        maxzoom: 8,
        filter: ["==", ["get", "kind"], "country"] as ExpressionSpecification,
        layout: {
          "text-field": localityText,
          "text-font": ["Noto Sans Medium"],
          "text-size": 12,
          "text-letter-spacing": 0.05,
          "text-max-width": 8,
        },
        paint: {
          "text-color": muted,
          "text-halo-color": d.earth,
          "text-halo-width": 1.2,
        },
      },
    ],
  };
}
