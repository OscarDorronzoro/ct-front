export function formatDate(date) {
  const d = new Date(date);

  const pad = (n, z = 2) => String(n).padStart(z, '0');

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.` +
         `${pad(d.getMilliseconds(), 3)}`;
}

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
