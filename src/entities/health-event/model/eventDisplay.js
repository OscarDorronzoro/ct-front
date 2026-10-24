import {
  Syringe, Pill, Stethoscope, Scale, Scissors,
} from 'lucide-react';
import { formatDay } from '@/shared/lib/date';

// How the clinical history is shown. The backend computes the data (withdrawal, boosters...).

export const EVENT_TYPES = [
  { value: 'vaccination', label: 'Vacunación', icon: Syringe },
  { value: 'treatment', label: 'Tratamiento', icon: Pill },
  { value: 'examination', label: 'Revisación', icon: Stethoscope },
  { value: 'weighing', label: 'Pesaje', icon: Scale },
  // Only for males: moves them to the steer categories (backend)
  { value: 'castration', label: 'Castración', icon: Scissors, sex: 'male' },
];

export const CASTRATION_METHODS = [
  { value: 'surgical', label: 'Quirúrgica' },
  { value: 'band', label: 'Gomita (elastrador)' },
  { value: 'burdizzo', label: 'Pinza (Burdizzo)' },
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
    castration: () => [d.method && `Método: ${labelOf(CASTRATION_METHODS, d.method)}`],
  };

  const withdrawal = [
    d.meatWithdrawalUntil && `Retiro carne hasta ${formatDay(d.meatWithdrawalUntil)}`,
    d.milkWithdrawalUntil && `leche hasta ${formatDay(d.milkWithdrawalUntil)}`,
  ].filter(Boolean).join(', ');

  return [...(byType[event.type]?.() ?? []), withdrawal].filter(Boolean);
}
