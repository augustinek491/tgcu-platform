"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { AlertTriangle, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  buildMapStyle,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  UGANDA_BOUNDS,
  UGANDA_MAX_BOUNDS,
  type MapTheme,
} from "@/lib/map-style";
import { MAP_BODY_CLASS } from "./MapSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./uganda-map.module.css";

/**
 * Real MapLibre GL Uganda map (rubric M12; MAP-BUILD.md). Client-only lazy
 * island — this module is the ONLY importer of maplibre-gl/pmtiles, and it is
 * reached exclusively through `next/dynamic(..., { ssr: false })`, so the
 * ~210KB gz map chunk never enters any route's First-Load JS (AF-11/M15).
 *
 * - Self-hosted PMTiles (z0–13) + self-hosted Noto Sans glyphs; © OpenStreetMap
 *   + Protomaps attribution always visible.
 * - The 8 market pins are real DOM <button>s in a projected overlay: Tab order
 *   = market list order, Enter toggles selection (one shared state lives in
 *   MarketExplorer — AM-30), aria-pressed reflects it.
 * - Theme swap = setStyle(diff) keyed off resolved theme; the WebGL container
 *   carries `data-crossfade-exempt` so the app-level theme crossfade never
 *   snapshots a blank canvas (AM-29).
 * - prefers-reduced-motion: no entrance stagger, zoom jumps (duration 0),
 *   zero paint-transition on style swap (H.2).
 */

let protocolRegistered = false;
function ensureProtocol() {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  protocolRegistered = true;
}

export type MapPin = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  reporting: boolean;
  /** CSS color for the ramp step (ignored when `reporting` is false). */
  fill: string;
  selected: boolean;
  ariaLabel: string;
  /** "UGX 2,180/kg" — null for non-reporting markets. */
  price: string | null;
  delta: { text: string; dir: "up" | "down" } | null;
  /** "as of Jun 2026 · MAAIF / TGCU tracker" or "last reported May 2026". */
  meta: string;
};

export type UgandaMapProps = {
  pins: MapPin[];
  theme: MapTheme;
  regionLabel: string;
  onTogglePin: (id: string) => void;
};

export function UgandaMap({ pins, theme, regionLabel, onTogglePin }: UgandaMapProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const pinEls = useRef(new Map<string, HTMLButtonElement>());
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const appliedTheme = useRef(theme);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [skelGone, setSkelGone] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // East→west entrance order (DS §9.6 signature motif) — Tab order stays list order.
  const staggerRank = useMemo(() => {
    const order = [...pins].sort((a, b) => b.lon - a.lon).map((p) => p.id);
    return new Map(order.map((id, i) => [id, i]));
  }, [pins]);

  /** Project every pin to screen space (runs on move/zoom/resize — 8 nodes, cheap). */
  const reposition = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const pin of pinsRef.current) {
      const el = pinEls.current.get(pin.id);
      if (!el) continue;
      const p = map.project([pin.lon, pin.lat]);
      el.style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`;
    }
  }, []);

  // Init (re-runs on retry). Theme changes do NOT remount — see the effect below.
  useEffect(() => {
    const container = canvasHostRef.current;
    if (!container) return;
    ensureProtocol();
    loadedRef.current = false;
    let disposed = false;

    const map = new maplibregl.Map({
      container,
      style: buildMapStyle(themeRef.current, { reducedMotion }),
      bounds: UGANDA_BOUNDS,
      fitBoundsOptions: { padding: 16 },
      maxBounds: UGANDA_MAX_BOUNDS,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      attributionControl: { compact: false },
      cooperativeGestures: true, // page scroll is never hijacked (esp. 375)
      dragRotate: false,
      pitchWithRotate: false,
      renderWorldCopies: false,
    });
    mapRef.current = map;
    appliedTheme.current = themeRef.current;
    map.touchZoomRotate.disableRotation();
    map.getCanvas().setAttribute(
      "aria-label",
      "Interactive map of Uganda — arrow keys pan, plus and minus keys zoom",
    );

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      try {
        map.remove();
      } catch {
        /* already torn down */
      }
      if (mapRef.current === map) mapRef.current = null;
    };

    map.on("load", () => {
      loadedRef.current = true;
      setStatus("ready");
      reposition();
    });
    map.on("move", reposition);
    map.on("resize", reposition);
    map.on("error", () => {
      // Pre-load failure (tiles/style unreachable) → calm error card; the
      // adjacent market table keeps every price (A.11). Post-load single-tile
      // blips are non-fatal and ignored.
      if (loadedRef.current || disposed) return;
      setStatus("error");
      setTimeout(dispose, 0);
    });

    return dispose;
  }, [attempt, reducedMotion, reposition]);

  // AM-29/G: theme swap without remount — setStyle(diff) repaints, markers persist.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || appliedTheme.current === theme) return;
    appliedTheme.current = theme;
    map.setStyle(buildMapStyle(theme, { reducedMotion }), { diff: true });
  }, [theme, reducedMotion]);

  // Keep the streaming skeleton until first render completes, then fade it out.
  useEffect(() => {
    if (status !== "ready") return;
    const t = setTimeout(() => setSkelGone(true), reducedMotion ? 0 : 300);
    return () => clearTimeout(t);
  }, [status, reducedMotion]);

  // Pins can (re)mount after the map exists — make sure they're projected.
  useEffect(() => {
    reposition();
  });

  const zoomBy = (dir: 1 | -1) => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      zoom: map.getZoom() + dir * 0.8,
      duration: reducedMotion ? 0 : 200, // reduced motion = jump, no easing
    });
  };

  const retry = () => {
    setStatus("loading");
    setSkelGone(false);
    setAttempt((a) => a + 1);
  };

  return (
    <div
      role="region"
      aria-label={regionLabel}
      data-crossfade-exempt=""
      className={cn("w-full", MAP_BODY_CLASS, styles.mapShell)}
    >
      <div ref={canvasHostRef} className={styles.canvasHost} />

      {/* Zoom controls — 44px targets, labelled, keyboard-reachable */}
      {status === "ready" && (
        <div className={styles.zoomCtrl}>
          <button type="button" className={styles.zoomBtn} aria-label="Zoom in" onClick={() => zoomBy(1)}>
            <Plus className="size-5" aria-hidden />
          </button>
          <button type="button" className={styles.zoomBtn} aria-label="Zoom out" onClick={() => zoomBy(-1)}>
            <Minus className="size-5" aria-hidden />
          </button>
        </div>
      )}

      {/* Market pins — accessible buttons, Tab order = market list order */}
      {status !== "error" && (
        <div className={styles.pinLayer}>
          {pins.map((pin) => (
            <button
              key={pin.id}
              ref={(el) => {
                if (el) pinEls.current.set(pin.id, el);
                else pinEls.current.delete(pin.id);
              }}
              type="button"
              className={cn(
                styles.pin,
                status === "ready" && styles.pinIn,
                pin.selected && styles.pinSelected,
                !pin.reporting && styles.pinNoData,
              )}
              style={{ "--pin-delay": `${(staggerRank.get(pin.id) ?? 0) * 50}ms` } as CSSProperties}
              aria-label={pin.ariaLabel}
              aria-pressed={pin.selected}
              onClick={() => onTogglePin(pin.id)}
            >
              <span
                className={styles.dot}
                style={pin.reporting ? { background: pin.fill } : undefined}
                aria-hidden
              />
              <span className={cn(styles.tip, pin.lon > 33.4 && styles.tipWest)} aria-hidden>
                <span className={styles.tipTitle}>{pin.name}</span>
                {pin.price ? (
                  <span className={styles.tipPrice}>{pin.price}</span>
                ) : (
                  <span className={styles.tipNoData}>No recent data</span>
                )}
                {pin.delta && (
                  <span
                    className={cn(
                      styles.tipDelta,
                      pin.delta.dir === "up" ? styles.tipDeltaUp : styles.tipDeltaDown,
                    )}
                  >
                    {pin.delta.dir === "up" ? "▲" : "▼"} {pin.delta.text} MoM
                  </span>
                )}
                <span className={styles.tipMeta}>{pin.meta}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Tile-streaming skeleton — same box, fades once the map has rendered */}
      {!skelGone && status !== "error" && (
        <div className={cn(styles.skelWrap, status === "ready" && styles.skelHide)}>
          <Skeleton className="h-full w-full rounded-none" aria-hidden="true" />
        </div>
      )}

      {/* Calm error state (A.11) — the adjacent table keeps every price */}
      {status === "error" && (
        <div className="absolute inset-0 z-[5] grid place-items-center bg-surface-2 p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto size-5 text-[var(--color-warning)]" aria-hidden />
            <p className="mt-2 text-base font-semibold text-fg">Couldn’t load the map</p>
            <p className="mt-1 text-sm text-muted">
              Map tiles didn’t load — every price is still in the market table.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
