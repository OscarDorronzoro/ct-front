// Configuration of the collar (backend: collarParams.constants), as the screens show it.
// kind: number, or time (a time of day, sent as seconds since 00:00 UTC and shown in local time),
// or toggle (0/1).
export interface CollarParam {
  name: string;
  label: string;
  kind: 'number' | 'time' | 'toggle';
  unit?: string;
  min: number;
  max: number;
  factory: number;
}

const number = (name: string, label: string, unit: string, min: number, max: number, factory: number): CollarParam => ({
  name, label, kind: 'number', unit, min, max, factory,
});

const time = (name: string, label: string, factory: number): CollarParam => ({
  name, label, kind: 'time', min: 0, max: 86399, factory,
});

export const COLLAR_PARAM_GROUPS: { title: string; params: CollarParam[] }[] = [
  {
    title: 'Horarios',
    params: [
      time('dayTime', 'Inicio del día', 39600),
      time('nightTime', 'Inicio de la noche', 0),
      number('nightMaxSleep', 'Sueño máximo de noche', 'min', 5, 127, 60),
    ],
  },
  {
    title: 'GPS y envío',
    params: [
      number('gpsOn', 'GPS encendido', 's', 10, 3600, 60),
      number('gpsOff', 'GPS apagado', 's', 10, 86400, 60),
      number('sendPeriod', 'Período de envío', 's', 30, 86400, 120),
      number('txHold', 'Retención de envío', 's', 60, 86400, 360),
      number('minDistance', 'Distancia mínima', 'm', 0, 10000, 20),
      number('diagPeriod', 'Período de diagnóstico', 'min', 10, 10080, 360),
    ],
  },
  {
    title: 'Vallado virtual',
    params: [
      {
        name: 'buzzer', label: 'Sonido', kind: 'toggle', min: 0, max: 1, factory: 1,
      },
      number('buzzerMaxSec', 'Duración máxima del sonido', 's', 0, 600, 60),
      number('zoneExitMargin', 'Margen de salida', 'm', 0, 200, 10),
      number('zoneExitFixes', 'Posiciones para confirmar la salida', 'posiciones', 1, 60, 5),
      number('zoneWatchMax', 'Vigilancia máxima de la zona', 's', 30, 1800, 180),
    ],
  },
  {
    title: 'Fuera de la zona',
    params: [
      number('outsideSendPeriod', 'Período de envío', 's', 10, 3600, 60),
      number('outsideGpsMin', 'GPS mínimo', 'min', 0, 240, 10),
      time('outsideDayTime', 'Inicio del día', 32400),
      time('outsideNightTime', 'Inicio de la noche', 7200),
    ],
  },
  {
    title: 'Batería',
    params: [
      number('batteryLow', 'Batería baja', 'mV', 3000, 4200, 3550),
      number('batteryCritical', 'Batería crítica', 'mV', 2900, 4000, 3450),
    ],
  },
];

const PARAMS = COLLAR_PARAM_GROUPS.flatMap((group) => (
  group.params.map((param) => ({ ...param, group: group.title }))
));

const pad = (value: number) => String(value).padStart(2, '0');

// Seconds since 00:00 UTC -> 'HH:MM' of the browser
export function utcSecondsToTime(seconds: number) {
  const date = new Date();
  date.setUTCHours(0, 0, seconds, 0);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// 'HH:MM' of the browser -> seconds since 00:00 UTC
export function timeToUtcSeconds(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getUTCHours() * 3600 + date.getUTCMinutes() * 60;
}

// Value of a param as read on screen: 21:00, 60 s, Activado
export function formatParamValue(param: CollarParam, value: number) {
  if (param.kind === 'time') {
    return utcSecondsToTime(value);
  }
  if (param.kind === 'toggle') {
    return value ? 'Activado' : 'Desactivado';
  }
  return `${value} ${param.unit}`;
}

// The params of a command as lines to read: [{ label, value }]. Unknown names (a newer backend)
// are shown as they come.
export function paramLines(params: Record<string, unknown>) {
  return Object.entries(params).map(([name, value]) => {
    const param = PARAMS.find((p) => p.name === name);

    return param
      ? { name, label: `${param.group}: ${param.label}`, value: formatParamValue(param, Number(value)) }
      : { name, label: name, value: String(value) };
  });
}
