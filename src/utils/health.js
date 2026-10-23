import {
  Syringe, Pill, Stethoscope, Scale,
} from 'lucide-react';

// How the clinical history is shown. The backend computes the data (withdrawal, boosters...).

export const EVENT_TYPES = [
  { value: 'vaccination', label: 'Vacunación', icon: Syringe },
  { value: 'treatment', label: 'Tratamiento', icon: Pill },
  { value: 'examination', label: 'Revisación', icon: Stethoscope },
  { value: 'weighing', label: 'Pesaje', icon: Scale },
];

export const PRODUCT_TYPES = [
  { value: 'vaccine', label: 'Vacuna' },
  { value: 'drug', label: 'Medicamento' },
  { value: 'antiparasitic', label: 'Antiparasitario' },
];

// Products each event type can use (same rule as the backend)
export const PRODUCT_TYPES_BY_EVENT = {
  vaccination: ['vaccine'],
  treatment: ['drug', 'antiparasitic'],
};

export const ROUTES = [
  { value: 'subcutaneous', label: 'Subcutánea' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'intravenous', label: 'Endovenosa' },
  { value: 'oral', label: 'Oral' },
  { value: 'topical', label: 'Tópica (pour-on)' },
  { value: 'intramammary', label: 'Intramamaria' },
  { value: 'intranasal', label: 'Intranasal' },
];

const labelOf = (list, value) => list.find((item) => item.value === value)?.label ?? value;

export const eventTypeInfo = (type) => EVENT_TYPES.find((t) => t.value === type)
  ?? { value: type, label: type, icon: Stethoscope };

export const productTypeLabel = (type) => labelOf(PRODUCT_TYPES, type);

// 22/10/2026
export function formatDay(value) {
  const date = typeof value === 'string' && value.length === 10
    ? new Date(`${value}T12:00:00`)
    : new Date(value);

  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const decimal = (value) => value.toLocaleString('es-AR', { maximumFractionDigits: 2 });

// Title of an event in the history: "Vacunación · Aftosa"
export function eventTitle(event) {
  const { label } = eventTypeInfo(event.type);
  const product = event.details.product?.name;

  return product ? `${label} · ${product}` : label;
}

// Data lines of an event, in the order they are read
export function eventDetails(event) {
  const d = event.details;
  const dot = (...parts) => parts.filter(Boolean).join(' · ');
  const route = d.route && labelOf(ROUTES, d.route);

  const byType = {
    vaccination: () => [
      dot(d.dose, route),
      d.batch && `Lote ${d.batch}`,
      d.nextDoseOn && `Refuerzo: ${formatDay(d.nextDoseOn)}`,
    ],
    treatment: () => [
      d.diagnosis,
      dot(d.dose, route, d.durationDays > 1 && `${d.durationDays} días`),
    ],
    examination: () => [
      d.finding,
      dot(
        d.temperature !== null && `${decimal(d.temperature)} °C`,
        d.bodyCondition !== null && `Condición corporal ${decimal(d.bodyCondition)}`,
      ),
    ],
    weighing: () => [`${decimal(d.weightKg)} kg`],
  };

  const withdrawal = [
    d.meatWithdrawalUntil && `Retiro carne hasta ${formatDay(d.meatWithdrawalUntil)}`,
    d.milkWithdrawalUntil && `leche hasta ${formatDay(d.milkWithdrawalUntil)}`,
  ].filter(Boolean).join(', ');

  return [...(byType[event.type]?.() ?? []), withdrawal].filter(Boolean);
}

// "3 años y 2 meses", "8 meses", "15 días"
export function formatAge(birthDate, now = new Date()) {
  const birth = new Date(birthDate);
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 1) {
    const days = Math.max(0, Math.floor((now - birth) / (24 * 3600 * 1000)));
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }

  const years = Math.floor(months / 12);
  const rest = months % 12;
  const part = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  if (years === 0) {
    return part(rest, 'mes', 'meses');
  }

  if (rest === 0) {
    return part(years, 'año', 'años');
  }

  return `${part(years, 'año', 'años')} y ${part(rest, 'mes', 'meses')}`;
}
