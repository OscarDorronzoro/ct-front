import { z } from 'zod';

const nullableNumber = z.number().nullable();

export const PositionSchema = z.object({
  id: z.number(),
  collarId: z.number(),
  cowId: nullableNumber,
  // Smallest zone that contains it
  zoneId: nullableNumber,
  recordedAt: z.string(),
  location: z.object({ latitude: z.number(), longitude: z.number() }),
  // km/h from the previous position
  speed: nullableNumber,
  // Degrees clockwise from north, from the previous position
  heading: nullableNumber,
  accuracy: nullableNumber,
  signalStrength: nullableNumber,
  distanceToPrevious: nullableNumber,
});

export type Position = z.infer<typeof PositionSchema>;

// Distance traveled by a collar in a range
export const DistanceSchema = z.object({
  collarId: z.number(),
  positions: z.number(),
  meters: z.number(),
});

export type Distance = z.infer<typeof DistanceSchema>;

// Everything the map shows for a position: collar, cow, signal, battery and sleep state
export const PositionDetailsSchema = z.object({
  position: PositionSchema,
  collar: z.object({
    id: z.number(),
    code: z.number(),
    description: z.string().nullable(),
    firmwareVersion: z.string().nullable(),
  }).nullable(),
  cow: z.object({
    id: z.number(),
    alias: z.string().nullable(),
    earTag: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }).nullable(),
  signal: z.object({
    rssi: nullableNumber,
    snr: nullableNumber,
    hdop: nullableNumber,
    satellitesCount: nullableNumber,
    messageType: z.string().nullable(),
    integrity: z.string().nullable(),
  }).nullable(),
  battery: z.object({
    voltage: z.number(),
    percent: z.number(),
    // ok | low | critical
    level: z.string(),
    recordedAt: z.string(),
  }).nullable(),
  state: z.object({
    // awake | sleeping
    status: z.string(),
    since: z.string().nullable(),
    sleepMin: nullableNumber.optional(),
    wakeExpectedAt: z.string().nullable().optional(),
  }),
});

export type PositionDetails = z.infer<typeof PositionDetailsSchema>;
