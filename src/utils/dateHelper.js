export function formatDate(date) {
  const d = new Date(date);

  const pad = (n, z = 2) => String(n).padStart(z, '0');

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.` +
         `${pad(d.getMilliseconds(), 3)}`;
}

export function toInputFormat(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toTimeElapsed(date) {
  const d = new Date(date);

  let value = new Date().getTime() - d.getTime();

  value /= 1000 * 60;

  if (value < 1) {
    value = Math.round(value);
    return {
      unit: 'minutos',
      value,
      text: 'Ahora',
    }
  }

  if (value < 60) {
    value = Math.round(value);
    const unit = value === 1 ? 'minuto' : 'minutos';
    return {
      unit,
      value: value,
      text: `Hace ${value} ${unit}`,
    }
  }

  value /= 60;
  if (value < 24) {
    value = value.toFixed(1);
    const unit = value === 1 ? 'hora' : 'horas';
    return {
      unit,
      value: value,
      text: `Hace ${value} ${unit}`,
    }
  }

  value /= 24;
  if (value < 30) {
    value = value.toFixed(2);
    const unit = value === 1 ? 'día' : 'días';
    return {
      unit,
      value: value,
      text: `Hace ${value} ${unit}`,
    }
  }

  value /= 30;
  if (value <  12) {
    value = value.toFixed(2);
    const unit = value === 1 ? 'mes' : 'meses';
    return {
      unit,
      value: value,
      text: `Hace ${value} ${unit}`,
    }
  }

  value /= 12;
  value = value.toFixed(2);
  const unit = value === 1 ? 'año' : 'años';
  return {
    unit,
    value: value,
    text: `Hace ${value} ${unit}`,
  }

}

