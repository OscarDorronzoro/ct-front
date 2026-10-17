// Time ranges for the history map.
// range: { preset, from: Date, to: Date, live: boolean, rollingMs?: number }
//   live: `to` follows the current time. rollingMs: `from` moves with it (last N hours).

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// "Today" covers at least this much: right after midnight it starts the previous evening
const TODAY_MIN_SPAN_MS = 6 * HOUR;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const PRESETS = [
  { key: 'today', label: 'Hoy' },
  { key: 'yesterday', label: 'Ayer' },
  { key: 'last6h', label: 'Últimas 6 h', rollingMs: 6 * HOUR },
  { key: 'last24h', label: 'Últimas 24 h', rollingMs: 24 * HOUR },
  { key: 'last7d', label: 'Últimos 7 días', rollingMs: 7 * DAY },
];

const PRESET_LABELS = Object.fromEntries(PRESETS.map((p) => [p.key, p.label]));

export function presetRange(key, now = new Date()) {
  const preset = PRESETS.find((p) => p.key === key);

  if (preset?.rollingMs) {
    return {
      preset: key, from: new Date(now - preset.rollingMs), to: now, live: true, rollingMs: preset.rollingMs,
    };
  }

  if (key === 'yesterday') {
    const today = startOfDay(now);
    return {
      preset: key, from: new Date(today - DAY), to: new Date(today - 1), live: false,
    };
  }

  return {
    preset: 'today',
    from: new Date(Math.min(startOfDay(now), now - TODAY_MIN_SPAN_MS)),
    to: now,
    live: true,
  };
}

export function defaultRange(now = new Date()) {
  return presetRange('today', now);
}

// Current bounds of a live range
export function resolveRange(range, now = new Date()) {
  if (!range.live) {
    return { from: range.from, to: range.to };
  }

  return {
    from: range.rollingMs ? new Date(now - range.rollingMs) : range.from,
    to: now,
  };
}

// A range ending this close to now is treated as "until now"
const LIVE_MARGIN_MS = 60 * 1000;

// Previous/next period of the same length. Reaching now turns it live.
export function shiftRange(range, direction, now = new Date()) {
  const { from, to } = resolveRange(range, now);
  const length = to - from;
  const newTo = new Date(to.getTime() + direction * length);

  if (newTo >= now - LIVE_MARGIN_MS) {
    return {
      preset: 'custom', from: new Date(now - length), to: now, live: true, rollingMs: length,
    };
  }

  return {
    preset: 'custom', from: new Date(from.getTime() + direction * length), to: newTo, live: false,
  };
}

const pad = (n) => String(n).padStart(2, '0');

const timeText = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayText = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

function sameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

// "08:30", or "11/10 08:30" when it isn't today
function pointText(date, now) {
  return sameDay(date, now) ? timeText(date) : `${dayText(date)} ${timeText(date)}`;
}

export function rangeLabel(range) {
  return PRESET_LABELS[range.preset] ?? 'Personalizado';
}

// "00:00 → ahora", "11/10 · 06:00 → 18:00", "09/10 06:00 → 11/10 18:00"
export function rangeSummary(range, now = new Date()) {
  const { from, to } = resolveRange(range, now);

  if (range.live) {
    return `${pointText(from, now)} → ahora`;
  }

  if (sameDay(from, to)) {
    const day = sameDay(from, now) ? '' : `${dayText(from)} · `;
    return `${day}${timeText(from)} → ${timeText(to)}`;
  }

  return `${pointText(from, now)} → ${pointText(to, now)}`;
}

// Custom range from the form. Returns { range } or { error }.
// An end at (or after) the current time means "until now".
export function customRange(from, to, untilNow, now = new Date()) {
  if (!from || (!untilNow && !to)) {
    return { error: 'Completá fecha y hora.' };
  }

  const live = untilNow || to >= now - LIVE_MARGIN_MS;
  const end = live ? now : to;

  if (from >= end) {
    return { error: '"Desde" tiene que ser anterior a "Hasta".' };
  }

  return {
    range: {
      preset: 'custom', from, to: end, live,
    },
  };
}

// Values for <input type="date"> and <input type="time">
export function toDateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toTimeValue(date) {
  return timeText(date);
}

// Combines the inputs; null if incomplete
export function fromInputs(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const date = new Date(`${dateValue}T${timeValue}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
