import { describe, it, expect } from 'vitest';
import {
  COLLAR_PARAM_GROUPS, formatParamValue, paramLines, timeToUtcSeconds, utcSecondsToTime,
} from './collarParams';

// The tests run in the time zone of the field (UTC-3)
describe('collarParams', () => {
  it('turns seconds since 00:00 UTC into the local time and back', () => {
    expect(utcSecondsToTime(39600)).toBe('08:00');
    expect(utcSecondsToTime(0)).toBe('21:00');
    expect(timeToUtcSeconds('08:00')).toBe(39600);
    expect(timeToUtcSeconds('21:00')).toBe(0);
    expect(timeToUtcSeconds('22:30')).toBe(5400);
  });

  it('shows a value according to its kind', () => {
    const params = COLLAR_PARAM_GROUPS.flatMap((group) => group.params);
    const show = (name: string, value: number) => {
      const param = params.find((p) => p.name === name);
      return param && formatParamValue(param, value);
    };

    expect(show('gpsOn', 90)).toBe('90 s');
    expect(show('dayTime', 39600)).toBe('08:00');
    expect(show('buzzer', 0)).toBe('Desactivado');
  });

  it('tells apart the params with the same label by their group, and keeps unknown ones', () => {
    expect(paramLines({ sendPeriod: 120, outsideSendPeriod: 60, somethingNew: 3 })).toEqual([
      { name: 'sendPeriod', label: 'GPS y envío: Período de envío', value: '120 s' },
      { name: 'outsideSendPeriod', label: 'Fuera de la zona: Período de envío', value: '60 s' },
      { name: 'somethingNew', label: 'somethingNew', value: '3' },
    ]);
  });
});
