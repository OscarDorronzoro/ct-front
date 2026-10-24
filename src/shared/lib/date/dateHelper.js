// "Ahora", "Hace 5 min", "Hace 3 h", "Hace 9 días", "Hace 2 meses", "Hace 1 año"
export function toTimeElapsed(date) {
  const minutes = (Date.now() - new Date(date).getTime()) / (1000 * 60);

  const steps = [
    [60, 1, 'min', 'min'],
    [60 * 24, 60, 'h', 'h'],
    [60 * 24 * 30, 60 * 24, 'día', 'días'],
    [60 * 24 * 365, 60 * 24 * 30, 'mes', 'meses'],
    [Infinity, 60 * 24 * 365, 'año', 'años'],
  ];

  if (minutes < 1) {
    return { unit: 'min', value: 0, text: 'Ahora' };
  }

  const [, size, singular, plural] = steps.find(([limit]) => minutes < limit);
  const value = Math.floor(minutes / size);
  const unit = value === 1 ? singular : plural;

  return { unit, value, text: `Hace ${value} ${unit}` };
}

export function toDateInput(value) {
  return value ? value.slice(0, 10) : '';
}

// 22/10/2026
export function formatDay(value) {
  const date = typeof value === 'string' && value.length === 10
    ? new Date(`${value}T12:00:00`)
    : new Date(value);

  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// 14:05
export function formatTime(value) {
  return new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

// 22/10/2026 14:05 (with seconds: 14:05:09)
export function formatDateTime(value, { seconds = false } = {}) {
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(seconds && { second: '2-digit' }),
    hourCycle: 'h23',
  });
}
