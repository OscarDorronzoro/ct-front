import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import {
  ZoneSchema, ZoneTypeSchema, zoneToApi, type ZoneInput,
} from '../model/zone';

const endpoint = '/zones';

export function getAllZones() {
  return apiClient(endpoint, { schema: z.array(ZoneSchema) });
}

export function getZone(zoneId: number | string) {
  return apiClient(`${endpoint}/${zoneId}`, { schema: ZoneSchema });
}

export function getZoneTypes() {
  return apiClient(`${endpoint}/types`, { schema: z.array(ZoneTypeSchema) });
}

export async function createZone(zone: ZoneInput) {
  await apiClient(endpoint, jsonBody('POST', zoneToApi(zone)));
}

export async function updateZone(zoneId: number | string, zone: ZoneInput) {
  await apiClient(`${endpoint}/${zoneId}`, jsonBody('PUT', zoneToApi(zone)));
}

export async function deleteZone(zoneId: number) {
  await apiClient(`${endpoint}/${zoneId}`, { method: 'DELETE' });
}
