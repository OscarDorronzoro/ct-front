import { z } from 'zod';
import { paramLines } from './collarParams';

const commandFields = {
  id: z.number(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()).nullable(),
  // 'all' or 'collars'
  target: z.string(),
  createdAt: z.string(),
  canceledAt: z.string().nullable(),
};

// In a list: with the count of its deliveries (one per collar)
export const CommandSummarySchema = z.object({
  ...commandFields,
  targets: z.number(),
  pending: z.number(),
  delivered: z.number(),
  succeeded: z.number(),
  failed: z.number(),
  canceled: z.number(),
});

export const CommandTargetSchema = z.object({
  id: z.number(),
  collarId: z.number(),
  collarCode: z.number(),
  status: z.string(),
  result: z.string().nullable(),
  deliveries: z.number(),
  deliveredAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export const CommandSchema = z.object({
  ...commandFields,
  targets: z.array(CommandTargetSchema),
});

export type CommandSummary = z.infer<typeof CommandSummarySchema>;
export type CommandTarget = z.infer<typeof CommandTargetSchema>;
export type Command = z.infer<typeof CommandSchema>;

// What can be requested. permission: what the type needs besides commands:send (backend:
// COMMAND_TYPE_PERMISSIONS). assignCode is not here: only the system creates it.
export const COMMAND_TYPES = [
  { value: 'params', label: 'Cambiar parámetros', permission: 'collars:write' },
  { value: 'resetParams', label: 'Volver a los parámetros de fábrica', permission: 'collars:write' },
  { value: 'diag', label: 'Pedir diagnóstico', permission: 'collars:write' },
  { value: 'reboot', label: 'Reiniciar', permission: 'collars:write' },
  { value: 'zone', label: 'Cargar zona', permission: null },
  { value: 'zoneClear', label: 'Borrar zona', permission: null },
  { value: 'ota', label: 'Actualizar firmware', permission: 'firmware:manage' },
  { value: 'otaCancel', label: 'Cancelar actualización de firmware', permission: 'firmware:manage' },
];

// Places for zones in the collar (backend: ZONE_SLOTS); on screen they count from 1
export const ZONE_SLOTS = [0, 1, 2, 3];

export const zoneSlotLabel = (slot: number) => `Lugar ${slot + 1}`;

export function commandTypeLabel(type: string) {
  if (type === 'assignCode') {
    return 'Asignar código';
  }
  return COMMAND_TYPES.find((t) => t.value === type)?.label ?? type;
}

const RESULTS: Record<string, { label: string; tone: string }> = {
  ok: { label: 'Ejecutado', tone: 'success' },
  duplicate: { label: 'Ya estaba aplicado', tone: 'success' },
  badParams: { label: 'Rechazado por el collar', tone: 'danger' },
  unsupported: { label: 'El collar no lo admite', tone: 'danger' },
  noAnswer: { label: 'El collar no respondió', tone: 'danger' },
  canceled: { label: 'Cancelado', tone: 'neutral' },
};

// How a delivery is doing. canceled: its command was canceled, and the gateway has yet to confirm.
export function targetState(target: Pick<CommandTarget, 'status' | 'result'>, canceled = false) {
  if (target.status === 'done') {
    return RESULTS[target.result ?? ''] ?? { label: target.result ?? 'Terminado', tone: 'neutral' };
  }
  if (canceled) {
    return { label: 'Cancelando', tone: 'warning' };
  }
  return target.status === 'delivered'
    ? { label: 'En el gateway', tone: 'primary' }
    : { label: 'Esperando al collar', tone: 'warning' };
}

// Whether something can still be canceled
export function isCancelable(command: Pick<Command, 'canceledAt' | 'targets'>) {
  return !command.canceledAt && command.targets.some((target) => target.status !== 'done');
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function commandTargetLabel(command: Pick<CommandSummary, 'target' | 'targets'>) {
  return command.target === 'all'
    ? `Todos los collares (${command.targets})`
    : plural(command.targets, 'collar', 'collares');
}

// What the command carries, in a line (null: nothing to say)
export function commandDetail({ type, payload }: Pick<Command, 'type' | 'payload'>) {
  if (type === 'params' && payload) {
    return plural(paramLines(payload.params as Record<string, unknown>).length, 'parámetro', 'parámetros');
  }
  if (type === 'zone' && payload) {
    return zoneSlotLabel(payload.zone as number);
  }
  if (type === 'zoneClear' && payload) {
    return payload.zone === 'all' ? 'Todos los lugares' : zoneSlotLabel(payload.zone as number);
  }
  if (type === 'ota' && payload) {
    return `Versión ${String(payload.version)}`;
  }
  return null;
}

// Badges of a list row: [{ label, tone }], only the states with deliveries
export function commandProgress(command: CommandSummary) {
  const waiting = command.pending + command.delivered;

  return [
    { count: command.succeeded, one: 'ejecutado', many: 'ejecutados', tone: 'success' },
    { count: command.failed, one: 'con error', many: 'con error', tone: 'danger' },
    { count: waiting, one: 'en curso', many: 'en curso', tone: 'warning' },
    { count: command.canceled, one: 'cancelado', many: 'cancelados', tone: 'neutral' },
  ]
    .filter(({ count }) => count > 0)
    .map(({
      count, one, many, tone,
    }) => ({ label: plural(count, one, many), tone }));
}
