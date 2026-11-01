import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import { CommandSchema, CommandSummarySchema } from '../model/command';

const endpoint = '/commands';

const CreatedSchema = z.object({ command: z.object({ id: z.number() }) });

export function getAllCommands() {
  return apiClient(endpoint, { schema: z.array(CommandSummarySchema) });
}

export function getCommand(commandId: number | string) {
  return apiClient(`${endpoint}/${commandId}`, { schema: CommandSchema });
}

// body: { type, target: 'all' | { collarIds }, ...fields of the type }. Returns the new command.
export async function createCommand(body: object) {
  const { command } = await apiClient(endpoint, {
    ...jsonBody('POST', body),
    schema: CreatedSchema,
  });

  return command;
}

export async function cancelCommand(commandId: number | string) {
  await apiClient(`${endpoint}/${commandId}/cancel`, { method: 'POST' });
}
