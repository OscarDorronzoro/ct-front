import { describe, it, expect } from 'vitest';

import { eventTitle, eventDetails, formatAge } from './health';

const event = (type, details) => ({ type, details });

describe('eventTitle', () => {
  it('adds the product when there is one', () => {
    expect(eventTitle(event('vaccination', { product: { name: 'Aftosa' } }))).toBe('Vacunación · Aftosa');
    expect(eventTitle(event('weighing', { weightKg: 410 }))).toBe('Pesaje');
  });
});

describe('eventDetails', () => {
  it('describes a vaccination', () => {
    expect(eventDetails(event('vaccination', {
      dose: '2 ml', route: 'subcutaneous', batch: 'A12', nextDoseOn: '2027-04-20',
      meatWithdrawalUntil: null, milkWithdrawalUntil: null,
    }))).toEqual(['2 ml · Subcutánea', 'Lote A12', 'Refuerzo: 20/04/2027']);
  });

  it('describes a treatment of several days, with its withdrawal', () => {
    expect(eventDetails(event('treatment', {
      diagnosis: 'Neumonía', dose: '10 ml', route: 'intramuscular', durationDays: 3,
      meatWithdrawalUntil: '2026-11-13T12:00:00Z', milkWithdrawalUntil: null,
    }))).toEqual(['Neumonía', '10 ml · Intramuscular · 3 días', 'Retiro carne hasta 13/11/2026']);
  });

  it('describes an examination with only some data', () => {
    expect(eventDetails(event('examination', {
      finding: null, temperature: 39.5, bodyCondition: null,
    }))).toEqual(['39,5 °C']);
  });

  it('describes a weighing', () => {
    expect(eventDetails(event('weighing', { weightKg: 412.5 }))).toEqual(['412,5 kg']);
  });
});

describe('formatAge', () => {
  const now = new Date('2026-10-22T12:00:00');

  it.each([
    ['2026-10-12', '10 días'],
    ['2026-02-22', '8 meses'],
    ['2025-10-22', '1 año'],
    ['2023-08-01', '3 años y 2 meses'],
    ['2023-08-25', '3 años y 1 mes'],
  ])('born %s -> %s', (birth, text) => {
    expect(formatAge(`${birth}T12:00:00`, now)).toBe(text);
  });
});
