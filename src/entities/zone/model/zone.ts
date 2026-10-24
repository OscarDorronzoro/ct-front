import { z } from 'zod';

// [lon, lat] (GeoJSON order)
export type LonLat = [number, number];

// The API uses [lat, lon] (like the gateway); the frontend works with GeoJSON [lon, lat]
const toRing = (points: [number, number][]): LonLat[] => points.map(([lat, lon]) => [lon, lat]);
const toPoints = (ring: LonLat[]): [number, number][] => ring.map(([lon, lat]) => [lat, lon]);

// Zone with `ring`: [[lon, lat], ...] without repeating the first vertex
export const ZoneSchema = z.object({
  id: z.number(),
  zoneTypeId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  points: z.array(z.tuple([z.number(), z.number()])),
}).transform(({ points, ...zone }) => ({ ...zone, ring: toRing(points) }));

export type Zone = z.infer<typeof ZoneSchema>;

export const ZoneTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type ZoneType = z.infer<typeof ZoneTypeSchema>;

export interface ZoneInput {
  name?: string;
  zoneTypeId?: number;
  description?: string | null;
  ring?: LonLat[];
}

export function zoneToApi({ ring, ...zone }: ZoneInput) {
  return ring ? { ...zone, points: toPoints(ring) } : zone;
}
