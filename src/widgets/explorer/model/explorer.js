// Pure helpers of the analytics explorer: dates, shaping results for the charts, formats.
// The numbers come computed from the backend; this only arranges and formats them.
import { toDateValue } from '@/shared/lib/date';
import { formatNumber } from '@/shared/lib/format';

const DAY_MS = 24 * 3600 * 1000;

export const RANGE_PRESETS = [
  { id: '7d', label: '7 días', days: 7 },
  { id: '30d', label: '30 días', days: 30 },
  { id: '90d', label: '90 días', days: 90 },
  { id: 'year', label: 'Este año' },
];

// { dateFrom, dateTo } ('YYYY-MM-DD', both included) of a preset, ending today
export function presetDates(id, now = new Date()) {
  const preset = RANGE_PRESETS.find((p) => p.id === id);
  const from = preset?.days
    ? new Date(now.getTime() - (preset.days - 1) * DAY_MS)
    : new Date(now.getFullYear(), 0, 1);

  return { dateFrom: toDateValue(from), dateTo: toDateValue(now) };
}

// Categorical colors, in this fixed order (validated for color blindness, adjacent pairs).
// A color follows its series by position in the sorted list of series, never by rank of value.
export const SERIES_COLORS = [
  '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948',
];
export const MAX_SERIES = SERIES_COLORS.length;

// The result as charts: one per measure. x is the date dimension if there is one, else the first;
// the other dimension (if any) makes the series. tooMany: more series than colors (table only).
export function chartsOf(result, catalogDimensions) {
  const dimensions = result.columns.filter((c) => c.kind === 'dimension');
  const measures = result.columns.filter((c) => c.kind === 'measure');

  if (dimensions.length === 0) {
    return { kind: 'stat', measures: measures.map((m, i) => ({ ...m, value: result.rows[0]?.[i] ?? null })) };
  }

  const kindOf = (id) => catalogDimensions.find((d) => d.id === id)?.kind;
  const xIndex = Math.max(0, dimensions.findIndex((d) => kindOf(d.id) === 'date'));
  const seriesIndex = dimensions.length === 2 ? 1 - xIndex : null;
  const isDate = kindOf(dimensions[xIndex].id) === 'date';

  // x categories in the order of the rows (sorted by the backend), without repeats
  const xKeys = [];
  const xLabels = new Map();
  result.rows.forEach((row) => {
    const { value, label } = row[xIndex];
    if (!xLabels.has(value)) {
      xKeys.push(value);
      xLabels.set(value, label);
    }
  });

  const seriesKeys = [];
  const seriesLabels = new Map();
  if (seriesIndex !== null) {
    result.rows.forEach((row) => {
      const { value, label } = row[seriesIndex];
      if (!seriesLabels.has(value)) {
        seriesLabels.set(value, label);
        seriesKeys.push(value);
      }
    });
    seriesKeys.sort((a, b) => String(seriesLabels.get(a)).localeCompare(String(seriesLabels.get(b)), 'es'));
  }

  const tooMany = seriesKeys.length > MAX_SERIES;
  const keys = seriesIndex === null ? [null] : seriesKeys;

  const charts = measures.map((measure, m) => {
    const column = dimensions.length + m;
    const series = keys.map((key, s) => {
      const byX = new Map();
      result.rows
        .filter((row) => key === null || row[seriesIndex].value === key)
        .forEach((row) => byX.set(row[xIndex].value, row[column]));

      return {
        key: key ?? measure.id,
        label: key === null ? measure.label : seriesLabels.get(key),
        color: SERIES_COLORS[s % MAX_SERIES],
        values: xKeys.map((x) => byX.get(x) ?? null),
      };
    });

    return { measure, series };
  });

  return {
    kind: isDate ? 'line' : 'bar',
    x: { dimension: dimensions[xIndex], keys: xKeys, labels: xKeys.map((k) => xLabels.get(k)) },
    seriesDimension: seriesIndex === null ? null : dimensions[seriesIndex],
    tooMany,
    charts,
  };
}

// Axis from the data: round ticks, zero included when the values are magnitudes far from it
export function niceScale(values, tickCount = 5) {
  const finite = values.filter((v) => v !== null && Number.isFinite(v));
  if (finite.length === 0) {
    return { min: 0, max: 1, ticks: [0, 1] };
  }

  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (min >= 0 && min < max * 0.5) {
    min = 0;
  }
  if (max <= 0 && max > min * 0.5) {
    max = 0;
  }
  if (min === max) {
    min -= Math.abs(min) * 0.1 || 1;
    max += Math.abs(max) * 0.1 || 1;
  }

  const rough = (max - min) / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= rough);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks = [];
  for (let t = niceMin; t <= niceMax + step / 2; t += step) {
    ticks.push(Number(t.toFixed(10)));
  }

  return { min: niceMin, max: niceMax, ticks };
}

export const withUnit = (value, unit) => (unit ? `${formatNumber(value)} ${unit}` : formatNumber(value));

// "2026-10-05" -> "05/10", "2026-10" -> "oct 2026", week -> "sem. 05/10"
export function formatX(label, dimensionId) {
  if (dimensionId === 'month') {
    const [y, m] = label.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  }

  if (dimensionId === 'day' || dimensionId === 'week') {
    const [, m, d] = label.split('-');
    return `${dimensionId === 'week' ? 'sem. ' : ''}${d}/${m}`;
  }

  return label;
}

// CSV of the result, as shown (labels, numbers with dot), for a spreadsheet
export function toCsv(result) {
  const escape = (text) => `"${String(text ?? '').replaceAll('"', '""')}"`;
  const header = result.columns.map((c) => escape(c.unit ? `${c.label} (${c.unit})` : c.label));
  const lines = result.rows.map((row) => row
    .map((cell) => (cell !== null && typeof cell === 'object' ? escape(cell.label) : (cell ?? '')))
    .join(','));

  return [header.join(','), ...lines].join('\n');
}
