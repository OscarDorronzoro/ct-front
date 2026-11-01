import { describe, it, expect } from 'vitest';
import {
  emptyCommandForm, needsConfirmation, paramsToApi, toCommandBody, validateCommand,
} from './commandForm';

const form = (values) => ({ ...emptyCommandForm, collarIds: [4], ...values });

describe('commandForm', () => {
  describe('paramsToApi', () => {
    it('keeps only what was filled in, as numbers and times in seconds UTC', () => {
      expect(paramsToApi({
        gpsOn: '90', gpsOff: '', dayTime: '08:00', buzzer: 0,
      })).toEqual({ gpsOn: 90, dayTime: 39600, buzzer: 0 });
    });
  });

  describe('validateCommand', () => {
    it('asks for the command and the collars', () => {
      expect(validateCommand(emptyCommandForm)).toBe('Elija el comando.');
      expect(validateCommand({ ...emptyCommandForm, type: 'diag' })).toBe('Elija al menos un collar.');
      expect(validateCommand({ ...emptyCommandForm, type: 'diag', allCollars: true })).toBeNull();
    });

    it('asks for a param, and a critical battery below the low one', () => {
      expect(validateCommand(form({ type: 'params' }))).toBe('Indique al menos un parámetro.');
      expect(validateCommand(form({
        type: 'params', params: { batteryLow: '3500', batteryCritical: '3500' },
      }))).toBe('La batería crítica debe ser menor que la batería baja.');
      expect(validateCommand(form({ type: 'params', params: { batteryLow: '3500' } }))).toBeNull();
    });

    it('asks for the place and the zone; the first place is a valid one', () => {
      expect(validateCommand(form({ type: 'zone', zoneId: 7 }))).toMatch(/lugar/);
      expect(validateCommand(form({ type: 'zone', zone: 0 }))).toBe('Elija la zona.');
      expect(validateCommand(form({ type: 'zone', zone: 0, zoneId: 7 }))).toBeNull();
      expect(validateCommand(form({ type: 'zoneClear' }))).toMatch(/lugar/);
      expect(validateCommand(form({ type: 'zoneClear', zone: 'all' }))).toBeNull();
    });
  });

  describe('toCommandBody', () => {
    it('sends the collars, or all of them', () => {
      expect(toCommandBody(form({ type: 'reboot' }))).toEqual({
        type: 'reboot', target: { collarIds: [4] },
      });
      expect(toCommandBody(form({ type: 'reboot', allCollars: true }))).toEqual({
        type: 'reboot', target: 'all',
      });
    });

    it('sends only the fields of the type', () => {
      const typed = form({
        params: { gpsOn: '90' }, zone: 1, zoneId: 7, version: '1.2.0',
      });

      expect(toCommandBody({ ...typed, type: 'params' })).toMatchObject({ params: { gpsOn: 90 } });
      expect(toCommandBody({ ...typed, type: 'zone' })).toMatchObject({ zone: 1, zoneId: 7 });
      expect(toCommandBody({ ...typed, type: 'zoneClear' })).toMatchObject({ zone: 1 });
      expect(toCommandBody({ ...typed, type: 'ota' })).toMatchObject({ version: '1.2.0' });
      expect(toCommandBody({ ...typed, type: 'diag' })).toEqual({
        type: 'diag', target: { collarIds: [4] },
      });
    });

    it('sends no version to update to the latest firmware', () => {
      expect(toCommandBody(form({ type: 'ota' }))).not.toHaveProperty('version');
    });
  });

  describe('needsConfirmation', () => {
    it('asks before reaching every collar or interrupting one', () => {
      expect(needsConfirmation(form({ type: 'diag' }))).toBe(false);
      expect(needsConfirmation(form({ type: 'diag', allCollars: true }))).toBe(true);
      expect(needsConfirmation(form({ type: 'ota' }))).toBe(true);
      expect(needsConfirmation(form({ type: 'reboot' }))).toBe(true);
    });
  });
});
