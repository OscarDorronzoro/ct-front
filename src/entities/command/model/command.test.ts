import { describe, it, expect } from 'vitest';
import {
  commandDetail, commandProgress, commandTargetLabel, commandTypeLabel, isCancelable, targetState,
} from './command';

const summary = {
  id: 1,
  type: 'reboot',
  payload: null,
  target: 'collars',
  createdAt: '2026-10-20T12:00:00Z',
  canceledAt: null,
  targets: 6,
  pending: 1,
  delivered: 1,
  succeeded: 2,
  failed: 1,
  canceled: 1,
};

describe('command', () => {
  it('names the types, also the one of the system and one it does not know', () => {
    expect(commandTypeLabel('ota')).toBe('Actualizar firmware');
    expect(commandTypeLabel('assignCode')).toBe('Asignar código');
    expect(commandTypeLabel('new')).toBe('new');
  });

  it('says how a delivery is doing', () => {
    expect(targetState({ status: 'pending', result: null }).label).toBe('Esperando al collar');
    expect(targetState({ status: 'delivered', result: null }).label).toBe('En el gateway');
    expect(targetState({ status: 'delivered', result: null }, true).label).toBe('Cancelando');
    expect(targetState({ status: 'done', result: 'ok' }).tone).toBe('success');
    expect(targetState({ status: 'done', result: 'noAnswer' }).tone).toBe('danger');
  });

  it('can be canceled while a delivery is open and it was not canceled', () => {
    const open = { status: 'delivered' };
    const done = { status: 'done' };

    expect(isCancelable({ canceledAt: null, targets: [done, open] } as never)).toBe(true);
    expect(isCancelable({ canceledAt: null, targets: [done] } as never)).toBe(false);
    expect(isCancelable({ canceledAt: 'x', targets: [open] } as never)).toBe(false);
  });

  it('describes the target', () => {
    expect(commandTargetLabel({ target: 'all', targets: 20 })).toBe('Todos los collares (20)');
    expect(commandTargetLabel({ target: 'collars', targets: 1 })).toBe('1 collar');
    expect(commandTargetLabel({ target: 'collars', targets: 3 })).toBe('3 collares');
  });

  it('describes what each type carries', () => {
    expect(commandDetail({ type: 'params', payload: { params: { gpsOn: 90 } } })).toBe('1 parámetro');
    expect(commandDetail({ type: 'zone', payload: { zone: 0, zoneId: 3 } })).toBe('Lugar 1');
    expect(commandDetail({ type: 'zoneClear', payload: { zone: 'all' } })).toBe('Todos los lugares');
    expect(commandDetail({ type: 'ota', payload: { version: '1.2.0' } })).toBe('Versión 1.2.0');
    expect(commandDetail({ type: 'diag', payload: null })).toBeNull();
  });

  it('sums up the deliveries, without the states that have none', () => {
    expect(commandProgress(summary).map(({ label }) => label)).toEqual([
      '2 ejecutados', '1 con error', '2 en curso', '1 cancelado',
    ]);
    expect(commandProgress({
      ...summary, pending: 0, delivered: 0, failed: 0, canceled: 0, succeeded: 1,
    }).map(({ label }) => label)).toEqual(['1 ejecutado']);
  });
});
