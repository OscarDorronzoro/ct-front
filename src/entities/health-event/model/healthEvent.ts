import { z } from 'zod';

const ProductRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
});

const UserRefSchema = z.object({
  id: z.number(),
  username: z.string(),
});

const text = z.string().nullable().optional();
const number = z.number().nullable().optional();

// Data of the event's type (see the backend detail tables): only the fields of its type come
export const EventDetailsSchema = z.object({
  product: ProductRefSchema.optional(),
  dose: text,
  batch: text,
  route: text,
  // YYYY-MM-DD
  nextDoseOn: text,
  diagnosis: text,
  durationDays: number,
  finding: text,
  // °C
  temperature: number,
  bodyCondition: number,
  weightKg: number,
  method: text,
  meatWithdrawalUntil: text,
  milkWithdrawalUntil: text,
});

// Event of the clinical history. Voided ones stay, with who voided them and why.
export const HealthEventSchema = z.object({
  id: z.number(),
  cowId: z.number(),
  type: z.string(),
  occurredAt: z.string(),
  notes: z.string().nullable(),
  recordedBy: UserRefSchema.nullable(),
  createdAt: z.string(),
  voided: z.object({
    at: z.string(),
    by: UserRefSchema.nullable(),
    reason: z.string().nullable(),
  }).nullable(),
  details: EventDetailsSchema,
});

export type HealthEvent = z.infer<typeof HealthEventSchema>;

// What the history means today (computed by the backend)
export const HealthSummarySchema = z.object({
  withdrawal: z.object({
    meatUntil: z.string().nullable(),
    milkUntil: z.string().nullable(),
  }),
  lastWeight: z.object({ kg: z.number(), at: z.string() }).nullable(),
  nextDoses: z.array(z.object({
    product: ProductRefSchema,
    // YYYY-MM-DD
    dueOn: z.string(),
    overdue: z.boolean(),
    eventId: z.number(),
  })),
});

export type CowHealthSummary = z.infer<typeof HealthSummarySchema>;

// Clinical history of a cow: events most recent first
export const CowHealthSchema = z.object({
  summary: HealthSummarySchema,
  events: z.array(HealthEventSchema),
});

export type CowHealth = z.infer<typeof CowHealthSchema>;

// { type, occurredAt, notes, ...fields of the type } (see the backend createEventBody)
export type HealthEventInput = Record<string, unknown> & { type: string; occurredAt: string };
