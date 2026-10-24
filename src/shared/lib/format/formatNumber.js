// Numbers as read in Argentina: 1.234,5
// - digits: decimals at most (or exactly, with fixed: 3,40 V)
// - compact: 1,2 mil from 1.000 (chart axes)
// null / undefined: '—'
export function formatNumber(value, { digits = 2, fixed = false, compact = false } = {}) {
  if (value === null || value === undefined) {
    return '—';
  }

  return value.toLocaleString('es-AR', {
    maximumFractionDigits: digits,
    ...(fixed && { minimumFractionDigits: digits }),
    ...(compact && Math.abs(value) >= 1000 && { notation: 'compact' }),
  });
}
