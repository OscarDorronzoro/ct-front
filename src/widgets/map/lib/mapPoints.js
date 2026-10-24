// Position styling for the live and history maps

// History: one color per collar. Bright and saturated so they stand out on satellite imagery
// (no greens or browns, which disappear on pasture and soil).
export const COLLAR_PALETTE = [
  '#3b82f6', // blue
  '#f97316', // orange
  '#e879f9', // fuchsia
  '#22d3ee', // cyan
  '#facc15', // yellow
  '#f43f5e', // rose
  '#a78bfa', // violet
  '#f8fafc', // white
  '#fb923c', // light orange
  '#60a5fa', // light blue
];

// Live: color by how long ago the collar transmitted
export const FRESHNESS = {
  recentMinutes: 40,
  staleMinutes: 6 * 60,
  colors: { recent: '#22c55e', late: '#f59e0b', stale: '#9ca3af' },
};

// Consecutive positions further apart than this are joined with a dashed line (unknown path)
const TRACK_GAP_MS = 30 * 60 * 1000;

// Heatmap: a position weighs the time until the next one, up to this cap (collar off, lost messages)
const HEAT_CAP_MS = 30 * 60 * 1000;

const time = (p) => new Date(p.recordedAt).getTime();
const coords = (p) => [p.location.longitude, p.location.latitude];

// Positions grouped by collar, oldest first
export function groupByCollar(points) {
  const groups = new Map();

  points.forEach((p) => {
    if (!groups.has(p.collarId)) {
      groups.set(p.collarId, []);
    }
    groups.get(p.collarId).push(p);
  });

  groups.forEach((list) => list.sort((a, b) => time(a) - time(b)));

  return groups;
}

// Colors by collar order, so collars shown together never share one (while there are enough)
export function collarColors(collarIds) {
  const colors = new Map();

  [...collarIds].sort((a, b) => a - b).forEach((id, i) => {
    colors.set(id, COLLAR_PALETTE[i % COLLAR_PALETTE.length]);
  });

  return colors;
}

// Track lines per collar: continuous stretches, and dashed jumps over gaps
export function tracksGeoJSON(groups, colors) {
  const features = [];

  groups.forEach((list, collarId) => {
    const color = colors.get(collarId);
    let stretch = [];

    const flush = () => {
      if (stretch.length > 1) {
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: stretch },
          properties: { collarId, color, gap: false },
        });
      }
    };

    list.forEach((p, i) => {
      const prev = list[i - 1];

      if (prev && time(p) - time(prev) > TRACK_GAP_MS) {
        flush();
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [coords(prev), coords(p)] },
          properties: { collarId, color, gap: true },
        });
        stretch = [];
      }

      stretch.push(coords(p));
    });

    flush();
  });

  return { type: 'FeatureCollection', features };
}

// 0..1: time the cow spent at each position (until the next one), so the heatmap shows
// where cows stay, not where collars transmitted most often
export function heatWeights(groups) {
  const weights = new Map();

  groups.forEach((list) => {
    list.forEach((p, i) => {
      const next = list[i + 1];
      const prev = list[i - 1];
      const dt = next ? time(next) - time(p) : prev ? time(p) - time(prev) : HEAT_CAP_MS / 2;

      weights.set(p.id, Math.min(dt, HEAT_CAP_MS) / HEAT_CAP_MS);
    });
  });

  return weights;
}
