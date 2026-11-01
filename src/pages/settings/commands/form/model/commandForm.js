import { COLLAR_PARAM_GROUPS, timeToUtcSeconds } from '@/entities/command';

const PARAMS = COLLAR_PARAM_GROUPS.flatMap((group) => group.params);

export const emptyCommandForm = {
  type: '',
  allCollars: false,
  collarIds: [],
  // Values typed by name; an empty one is not changed
  params: {},
  zone: '',
  zoneId: '',
  // '' = the latest
  version: '',
};

// Commands that interrupt the collar or are hard to take back: they ask before sending
const RISKY_TYPES = ['reboot', 'resetParams', 'ota'];

export const needsConfirmation = (form) => form.allCollars || RISKY_TYPES.includes(form.type);

// The params filled in, as the API takes them
export function paramsToApi(values) {
  return Object.fromEntries(PARAMS
    .filter(({ name }) => values[name] !== undefined && values[name] !== '')
    .map(({ name, kind }) => [
      name,
      kind === 'time' ? timeToUtcSeconds(values[name]) : Number(values[name]),
    ]));
}

// Message of what's missing, or null
export function validateCommand(form) {
  if (!form.type) {
    return 'Elija el comando.';
  }
  if (!form.allCollars && form.collarIds.length === 0) {
    return 'Elija al menos un collar.';
  }
  if (form.type === 'params') {
    const params = paramsToApi(form.params);

    if (Object.keys(params).length === 0) {
      return 'Indique al menos un parámetro.';
    }
    if (params.batteryCritical !== undefined && params.batteryLow !== undefined
      && params.batteryCritical >= params.batteryLow) {
      return 'La batería crítica debe ser menor que la batería baja.';
    }
  }
  if ((form.type === 'zone' || form.type === 'zoneClear') && form.zone === '') {
    return 'Elija el lugar de la zona en el collar.';
  }
  if (form.type === 'zone' && form.zoneId === '') {
    return 'Elija la zona.';
  }
  return null;
}

// The body of POST /commands
export function toCommandBody(form) {
  const body = {
    type: form.type,
    target: form.allCollars ? 'all' : { collarIds: form.collarIds },
  };

  switch (form.type) {
    case 'params':
      return { ...body, params: paramsToApi(form.params) };

    case 'zone':
      return { ...body, zone: form.zone, zoneId: form.zoneId };

    case 'zoneClear':
      return { ...body, zone: form.zone };

    case 'ota':
      return form.version ? { ...body, version: form.version } : body;

    default:
      return body;
  }
}
