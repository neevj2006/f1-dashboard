"use client";

import { along, length, lineSliceAlong } from "@turf/turf";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Highlight = "all" | string;

type LngLat = [number, number];

type CircuitFeature = {
  type: "Feature";
  properties: {
    id: string;
    Location: string;
    Name: string;
    length?: number;
    altitude?: number;
  };
  geometry: {
    type: "LineString";
    coordinates: LngLat[];
  };
};

type CircuitCollection = {
  type: "FeatureCollection";
  features: CircuitFeature[];
};

type CircuitMeta = {
  aliases: string[];
  corners: number;
  drs: Array<[number, number]>;
};

type Point = {
  x: number;
  y: number;
};

type CornerPoint = Point & {
  id: number;
};

type TurnCallout = CornerPoint & {
  labelX: number;
  labelY: number;
};

const WIDTH = 600;
const HEIGHT = 440;
const PADDING = 54;

const DEFAULT_META: CircuitMeta = {
  aliases: [],
  corners: 15,
  drs: [
    [0.06, 0.18],
    [0.44, 0.58],
  ],
};

const CIRCUIT_META: Record<string, CircuitMeta> = {
  bahrain: {
    aliases: ["bahrain", "sakhir"],
    corners: 15,
    drs: [
      [0.03, 0.18],
      [0.33, 0.45],
      [0.76, 0.9],
    ],
  },
  jeddah: {
    aliases: ["jeddah", "corniche"],
    corners: 27,
    drs: [
      [0.05, 0.18],
      [0.41, 0.54],
      [0.75, 0.93],
    ],
  },
  melbourne: {
    aliases: ["albert park", "melbourne"],
    corners: 14,
    drs: [
      [0.03, 0.17],
      [0.28, 0.39],
      [0.55, 0.66],
      [0.78, 0.92],
    ],
  },
  suzuka: {
    aliases: ["suzuka"],
    corners: 18,
    drs: [[0.88, 0.99]],
  },
  shanghai: {
    aliases: ["shanghai"],
    corners: 16,
    drs: [
      [0.28, 0.4],
      [0.69, 0.88],
    ],
  },
  miami: {
    aliases: ["miami"],
    corners: 19,
    drs: [
      [0.06, 0.16],
      [0.39, 0.51],
      [0.72, 0.88],
    ],
  },
  imola: {
    aliases: ["imola", "enzo", "dino"],
    corners: 19,
    drs: [[0.88, 0.99]],
  },
  monaco: {
    aliases: ["monaco", "monte carlo"],
    corners: 19,
    drs: [[0.83, 0.96]],
  },
  barcelona: {
    aliases: ["catalunya", "barcelona"],
    corners: 14,
    drs: [
      [0.12, 0.24],
      [0.82, 0.96],
    ],
  },
  montreal: {
    aliases: ["gilles", "montreal", "villeneuve"],
    corners: 14,
    drs: [
      [0.04, 0.16],
      [0.54, 0.66],
      [0.78, 0.95],
    ],
  },
  spielberg: {
    aliases: ["spielberg", "red bull"],
    corners: 10,
    drs: [
      [0.05, 0.2],
      [0.24, 0.38],
      [0.75, 0.94],
    ],
  },
  silverstone: {
    aliases: ["silverstone"],
    corners: 18,
    drs: [
      [0.18, 0.32],
      [0.66, 0.81],
    ],
  },
  spa: {
    aliases: ["spa", "francorchamps"],
    corners: 19,
    drs: [
      [0.1, 0.27],
      [0.83, 0.97],
    ],
  },
  budapest: {
    aliases: ["hungaroring", "budapest"],
    corners: 14,
    drs: [
      [0.03, 0.16],
      [0.2, 0.31],
    ],
  },
  zandvoort: {
    aliases: ["zandvoort"],
    corners: 14,
    drs: [
      [0.12, 0.28],
      [0.78, 0.96],
    ],
  },
  monza: {
    aliases: ["monza"],
    corners: 11,
    drs: [
      [0.18, 0.31],
      [0.74, 0.95],
    ],
  },
  baku: {
    aliases: ["baku"],
    corners: 20,
    drs: [
      [0.05, 0.2],
      [0.82, 0.98],
    ],
  },
  singapore: {
    aliases: ["singapore", "marina bay"],
    corners: 19,
    drs: [
      [0.07, 0.17],
      [0.27, 0.39],
      [0.55, 0.66],
      [0.77, 0.91],
    ],
  },
  austin: {
    aliases: ["austin", "americas", "cota"],
    corners: 20,
    drs: [
      [0.18, 0.34],
      [0.72, 0.91],
    ],
  },
  "mexico city": {
    aliases: ["mexico", "rodriguez"],
    corners: 17,
    drs: [
      [0.05, 0.18],
      [0.22, 0.35],
      [0.78, 0.95],
    ],
  },
  "sao paulo": {
    aliases: ["interlagos", "sao paulo", "jose carlos pace"],
    corners: 15,
    drs: [
      [0.1, 0.25],
      [0.77, 0.96],
    ],
  },
  "las vegas": {
    aliases: ["vegas"],
    corners: 17,
    drs: [
      [0.26, 0.43],
      [0.66, 0.86],
    ],
  },
  madrid: {
    aliases: ["madrid", "madring"],
    corners: 22,
    drs: [
      [0.15, 0.28],
      [0.64, 0.82],
    ],
  },
  lusail: {
    aliases: ["lusail", "losail", "qatar"],
    corners: 16,
    drs: [[0.78, 0.96]],
  },
  "yas marina": {
    aliases: ["yas marina", "abu dhabi"],
    corners: 16,
    drs: [
      [0.26, 0.41],
      [0.51, 0.67],
    ],
  },
};

export function CircuitImage({
  alt,
  circuitName,
  className,
}: {
  src: string;
  alt: string;
  circuitName?: string;
  className?: string;
}) {
  const [highlight, setHighlight] = useState<Highlight>("all");
  const [selected, setSelected] = useState("Tap a sector, DRS zone, or turn");
  const [collection, setCollection] = useState<CircuitCollection | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/data/f1-circuits.geojson")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: CircuitCollection | null) => {
        if (active) setCollection(data);
      })
      .catch(() => {
        if (active) setCollection(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const name = circuitName ?? alt;
  const meta = useMemo(() => getCircuitMeta(name), [name]);
  const feature = useMemo(
    () => (collection ? findCircuitFeature(collection, name, meta) : null),
    [collection, meta, name],
  );
  const map = useMemo(
    () => (feature ? buildCircuitMap(feature, meta) : null),
    [feature, meta],
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-white/10 bg-zinc-950",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Interactive Circuit
          </div>
          <div className="mt-1 text-sm font-bold text-zinc-200">{name}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            setHighlight("all");
            setSelected("Full circuit view");
          }}
          className={cn(
            "h-9 rounded border border-white/10 px-3 text-xs font-black uppercase text-zinc-300 transition hover:border-white/25 hover:bg-white/10",
            highlight === "all" && "border-[#e10600]/60 bg-[#e10600] text-white",
          )}
        >
          Full Map
        </button>
      </div>

      <div className="grid gap-4 p-3 sm:p-5">
        <div className="rounded border border-white/10 bg-black/25 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Map Layers
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <LayerGroup
              title="Sectors"
              items={map?.sectors.map((sector) => ({
                id: sector.id,
                label: sector.label,
                color: sector.color,
                onSelect: () => {
                  setHighlight(sector.id);
                  setSelected(`${sector.label}: timing split highlighted`);
                },
              }))}
              activeId={highlight}
              emptyCount={3}
            />
            <LayerGroup
              title="DRS Zones"
              items={map?.drsZones.map((zone) => ({
                id: zone.id,
                label: zone.label,
                color: "#38bdf8",
                onSelect: () => {
                  setHighlight(zone.id);
                  setSelected(`${zone.label}: activation zone`);
                },
              }))}
              activeId={highlight}
              emptyCount={meta.drs.length}
            />
          </div>
        </div>

        <div className="relative min-h-72">
        {map ? (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={alt}
            data-circuit-map={feature?.properties.Name}
            className="min-h-64 w-full"
          >
            <defs>
              <filter id="circuit-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={map.trackPath}
              fill="none"
              stroke="rgba(255,255,255,.16)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32"
            />
            <path
              d={map.trackPath}
              fill="none"
              stroke="rgba(255,255,255,.7)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="18"
            />
            <path
              d={map.trackPath}
              fill="none"
              stroke="#0b0b0d"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="10"
            />

            {map.sectors.map((sector) => (
              <g key={sector.id} opacity={isHighlighted(highlight, sector.id) ? 1 : 0.12}>
                <g
                  onClick={() => {
                    setHighlight(sector.id);
                    setSelected(`${sector.label}: timing split highlighted`);
                  }}
                >
                  <path
                    d={sector.d}
                    fill="none"
                    filter="url(#circuit-glow)"
                    stroke={sector.color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="8"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                </g>
                <rect
                  x={sector.labelPoint.x - 42}
                  y={sector.labelPoint.y - 20}
                  width="84"
                  height="34"
                  rx="4"
                  fill="transparent"
                  className="cursor-pointer outline-none"
                  onClick={() => {
                    setHighlight(sector.id);
                    setSelected(`${sector.label}: timing split highlighted`);
                  }}
                />
              </g>
            ))}

            {map.drsZones.map((zone) => (
              <g key={zone.id} opacity={isHighlighted(highlight, zone.id) ? 1 : 0.12}>
                <g
                  onClick={() => {
                    setHighlight(zone.id);
                    setSelected(`${zone.label}: activation zone`);
                  }}
                >
                  <path
                    d={zone.d}
                    fill="none"
                    stroke="#38bdf8"
                    strokeDasharray="12 10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="7"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                </g>
                <rect
                  x={zone.labelPoint.x - 36}
                  y={zone.labelPoint.y - 36}
                  width="72"
                  height="34"
                  rx="4"
                  fill="transparent"
                  className="cursor-pointer outline-none"
                  onClick={() => {
                    setHighlight(zone.id);
                    setSelected(`${zone.label}: activation zone`);
                  }}
                />
              </g>
            ))}

            {map.turnCallouts.map((turn) => (
              <g key={turn.id}>
                <line
                  x1={turn.x}
                  y1={turn.y}
                  x2={turn.labelX}
                  y2={turn.labelY}
                  stroke="rgba(255,255,255,.38)"
                  strokeDasharray="4 5"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
                <circle
                  cx={turn.labelX}
                  cy={turn.labelY}
                  r="12"
                  fill="#ffffff"
                  stroke="#111113"
                  strokeWidth="3"
                />
                <text
                  x={turn.labelX}
                  y={turn.labelY + 4}
                  textAnchor="middle"
                  className="pointer-events-none fill-black text-[11px] font-black"
                >
                  {turn.id}
                </text>
              </g>
            ))}

            <g>
              <line
                x1={map.start.x}
                y1={map.start.y - 22}
                x2={map.start.x}
                y2={map.start.y + 10}
                stroke="#f8fafc"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <g transform={`translate(${map.start.x + 3} ${map.start.y - 22})`}>
                <rect width="28" height="20" rx="2" fill="#f8fafc" />
                <rect x="0" y="0" width="7" height="5" fill="#111113" />
                <rect x="14" y="0" width="7" height="5" fill="#111113" />
                <rect x="7" y="5" width="7" height="5" fill="#111113" />
                <rect x="21" y="5" width="7" height="5" fill="#111113" />
                <rect x="0" y="10" width="7" height="5" fill="#111113" />
                <rect x="14" y="10" width="7" height="5" fill="#111113" />
                <rect x="7" y="15" width="7" height="5" fill="#111113" />
                <rect x="21" y="15" width="7" height="5" fill="#111113" />
              </g>
            </g>
          </svg>
        ) : (
          <div className="relative z-10 grid min-h-64 place-items-center text-sm font-bold uppercase tracking-[0.18em] text-zinc-500">
            Loading circuit map
          </div>
        )}
        </div>
      </div>

      <div className="grid gap-3 border-t border-white/10 bg-black/25 p-4 text-sm text-zinc-300 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="font-bold text-white">{selected}</div>
        <div className="flex flex-wrap gap-2">
          <Pill label={`${meta.corners} turns`} />
          <Pill label={`${meta.drs.length} DRS zones`} />
          <Pill label="3 sectors" />
        </div>
      </div>
    </div>
  );
}

function getCircuitMeta(name: string): CircuitMeta {
  const normalized = normalize(name);
  return (
    Object.values(CIRCUIT_META).find((meta) =>
      meta.aliases.some((alias) => includesPhrase(normalized, normalize(alias))),
    ) ?? DEFAULT_META
  );
}

function findCircuitFeature(
  collection: CircuitCollection,
  name: string,
  meta: CircuitMeta,
) {
  const normalized = normalize(name);
  const aliases = meta.aliases.map(normalize);

  return (
    collection.features.find((feature) => {
      const featureName = normalize(
        `${feature.properties.Name} ${feature.properties.Location}`,
      );
      return (
        includesPhrase(featureName, normalized) ||
        includesPhrase(normalized, featureName) ||
        aliases.some((alias) => includesPhrase(featureName, alias))
      );
    }) ?? null
  );
}

function buildCircuitMap(feature: CircuitFeature, meta: CircuitMeta) {
  const projector = createProjector(feature.geometry.coordinates);
  const trackPath = pathFromCoordinates(feature.geometry.coordinates, projector);
  const totalLength = length(feature, { units: "kilometers" });

  const sectors = [
    buildSlice("sector-1", "Sector 1", "#22c55e", feature, projector, 0, totalLength / 3),
    buildSlice("sector-2", "Sector 2", "#f59e0b", feature, projector, totalLength / 3, (totalLength * 2) / 3),
    buildSlice("sector-3", "Sector 3", "#ef4444", feature, projector, (totalLength * 2) / 3, totalLength),
  ];

  const drsZones = meta.drs.map(([start, end], index) => {
    const zone = buildSlice(
      `drs-${index + 1}`,
      `DRS ${index + 1}`,
      "#38bdf8",
      feature,
      projector,
      totalLength * start,
      totalLength * end,
    );
    return {
      id: zone.id,
      label: zone.label,
      d: zone.d,
      labelPoint: zone.labelPoint,
    };
  });

  return {
    trackPath,
    sectors,
    drsZones,
    turnCallouts: findTurnCallouts(feature.geometry.coordinates, projector, meta.corners),
    start: projector(feature.geometry.coordinates[0]),
  };
}

function buildSlice(
  id: string,
  label: string,
  color: string,
  feature: CircuitFeature,
  projector: (coord: LngLat) => Point,
  startKm: number,
  endKm: number,
) {
  const segment = lineSliceAlong(feature, startKm, endKm, {
    units: "kilometers",
  });
  const midpoint = along(feature, (startKm + endKm) / 2, {
    units: "kilometers",
  }).geometry.coordinates as LngLat;

  return {
    id,
    label,
    color,
    d: pathFromCoordinates(segment.geometry.coordinates as LngLat[], projector),
    labelPoint: projector(midpoint),
  };
}

function createProjector(coords: LngLat[]) {
  const lats = coords.map((coord) => coord[1]);
  const meanLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const scaleLon = Math.cos((meanLat * Math.PI) / 180);
  const flat = coords.map(([lng, lat]) => ({
    x: lng * scaleLon,
    y: lat,
  }));
  const minX = Math.min(...flat.map((point) => point.x));
  const maxX = Math.max(...flat.map((point) => point.x));
  const minY = Math.min(...flat.map((point) => point.y));
  const maxY = Math.max(...flat.map((point) => point.y));
  const scale = Math.min(
    (WIDTH - PADDING * 2) / Math.max(maxX - minX, 0.0001),
    (HEIGHT - PADDING * 2) / Math.max(maxY - minY, 0.0001),
  );
  const offsetX = (WIDTH - (maxX - minX) * scale) / 2;
  const offsetY = (HEIGHT - (maxY - minY) * scale) / 2;

  return ([lng, lat]: LngLat) => ({
    x: offsetX + (lng * scaleLon - minX) * scale,
    y: HEIGHT - (offsetY + (lat - minY) * scale),
  });
}

function pathFromCoordinates(
  coords: LngLat[],
  projector: (coord: LngLat) => Point,
) {
  return coords
    .map((coord, index) => {
      const point = projector(coord);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function findCornerPoints(
  coords: LngLat[],
  projector: (coord: LngLat) => Point,
  count: number,
): CornerPoint[] {
  const projected = coords.map(projector);
  const candidates = projected
    .slice(1, -1)
    .map((point, offset) => {
      const index = offset + 1;
      const prev = projected[index - 1];
      const next = projected[index + 1];
      return {
        index,
        point,
        score: angleDelta(prev, point, next),
      };
    })
    .sort((a, b) => b.score - a.score);
  const minGap = Math.max(2, Math.floor(projected.length / Math.max(count * 2, 1)));
  const picked: typeof candidates = [];

  for (const candidate of candidates) {
    if (picked.every((item) => Math.abs(item.index - candidate.index) >= minGap)) {
      picked.push(candidate);
      if (picked.length === count) break;
    }
  }

  return picked
    .sort((a, b) => a.index - b.index)
    .map((item, index) => ({
      id: index + 1,
      x: item.point.x,
      y: item.point.y,
    }));
}

function findTurnCallouts(
  coords: LngLat[],
  projector: (coord: LngLat) => Point,
  count: number,
): TurnCallout[] {
  const projected = coords.map(projector);
  const turns = findCornerPoints(coords, projector, count);
  const center = {
    x: projected.reduce((sum, point) => sum + point.x, 0) / projected.length,
    y: projected.reduce((sum, point) => sum + point.y, 0) / projected.length,
  };
  const labels = turns.map((turn) => {
    const vector = normalizeVector({
      x: turn.x - center.x,
      y: turn.y - center.y,
    });

    return {
      ...turn,
      labelX: clamp(turn.x + vector.x * 34, 18, WIDTH - 18),
      labelY: clamp(turn.y + vector.y * 34, 18, HEIGHT - 18),
    };
  });

  for (let pass = 0; pass < 22; pass += 1) {
    for (const label of labels) {
      const nearestTrack = nearestPointDistance(label, projected);
      if (nearestTrack < 27) {
        const vector = normalizeVector({
          x: label.labelX - center.x,
          y: label.labelY - center.y,
        });
        label.labelX = clamp(label.labelX + vector.x * (27 - nearestTrack + 2), 18, WIDTH - 18);
        label.labelY = clamp(label.labelY + vector.y * (27 - nearestTrack + 2), 18, HEIGHT - 18);
      }
    }

    for (let i = 0; i < labels.length; i += 1) {
      for (let j = i + 1; j < labels.length; j += 1) {
        const first = labels[i];
        const second = labels[j];
        const dx = second.labelX - first.labelX;
        const dy = second.labelY - first.labelY;
        const distance = Math.hypot(dx, dy) || 1;
        const minimum = 29;
        if (distance < minimum) {
          const push = (minimum - distance) / 2;
          const nx = dx / distance;
          const ny = dy / distance;
          first.labelX = clamp(first.labelX - nx * push, 18, WIDTH - 18);
          first.labelY = clamp(first.labelY - ny * push, 18, HEIGHT - 18);
          second.labelX = clamp(second.labelX + nx * push, 18, WIDTH - 18);
          second.labelY = clamp(second.labelY + ny * push, 18, HEIGHT - 18);
        }
      }
    }
  }

  return labels;
}

function angleDelta(prev: Point, point: Point, next: Point) {
  const a = Math.atan2(point.y - prev.y, point.x - prev.x);
  const b = Math.atan2(next.y - point.y, next.x - point.x);
  const diff = Math.abs(a - b);
  return Math.min(diff, Math.PI * 2 - diff);
}

function normalizeVector(point: Point) {
  const length = Math.hypot(point.x, point.y) || 1;
  return {
    x: point.x / length,
    y: point.y / length,
  };
}

function nearestPointDistance(label: TurnCallout, points: Point[]) {
  return Math.min(
    ...points.map((point) => Math.hypot(label.labelX - point.x, label.labelY - point.y)),
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesPhrase(value: string, phrase: string) {
  return ` ${value} `.includes(` ${phrase} `);
}

function isHighlighted(highlight: Highlight, id: string) {
  return highlight === "all" || highlight === id;
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold uppercase text-zinc-300">
      {label}
    </span>
  );
}

function LayerGroup({
  title,
  items,
  activeId,
  compact = false,
  emptyCount,
}: {
  title: string;
  items?: Array<{
    id: string;
    label: string;
    color: string;
    onSelect: () => void;
  }>;
  activeId?: Highlight;
  compact?: boolean;
  emptyCount: number;
}) {
  const placeholders = Array.from({ length: emptyCount }, (_, index) => index);

  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </div>
      <div className={cn("mt-2", compact ? "flex flex-wrap gap-1.5" : "grid gap-2")}>
        {items
          ? items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onSelect}
                className={cn(
                  "rounded border border-white/10 bg-white/[0.04] text-left font-bold text-zinc-200 transition hover:border-white/25 hover:bg-white/10",
                  activeId === item.id && "border-[#e10600]/70 bg-[#e10600]/20 text-white",
                  compact
                    ? "h-8 min-w-9 px-2 text-center text-xs"
                    : "flex h-9 items-center gap-2 px-3 text-xs uppercase",
                )}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </button>
            ))
          : placeholders.map((item) => (
              <span
                key={item}
                className={cn(
                  "animate-pulse rounded border border-white/10 bg-white/[0.04]",
                  compact ? "h-8 w-9" : "h-9",
                )}
              />
            ))}
      </div>
    </div>
  );
}
