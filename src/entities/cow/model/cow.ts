import { z } from 'zod';

export const SexSchema = z.enum(['female', 'male']);

export type Sex = z.infer<typeof SexSchema>;

export const SEX_LABELS: Record<Sex, string> = {
  female: 'Hembra',
  male: 'Macho',
};

const GroupRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

// GET /cows: list, with the current groups
export const CowSchema = z.object({
  id: z.number(),
  alias: z.string().nullable(),
  earTag: z.string().nullable(),
  sex: SexSchema.nullable(),
  breedId: z.number().nullable(),
  categoryId: z.number().nullable(),
  currentCollarId: z.number().nullable(),
  birthDate: z.string().nullable(),
  imageUrl: z.string().nullable(),
  breed: z.object({ id: z.number(), name: z.string() }).nullable(),
  category: z.object({ id: z.number(), name: z.string(), sex: SexSchema }).nullable(),
  groups: z.array(GroupRefSchema),
});

export type Cow = z.infer<typeof CowSchema>;

// Where a category of the history came from
export const CATEGORY_SOURCES = {
  manual: 'manual',
  automatic: 'por edad',
  event: 'por evento',
} as const;

export const CategoryAssignmentSchema = z.object({
  id: z.number(),
  category: z.object({ id: z.number(), name: z.string() }),
  dateFrom: z.string(),
  // null: current
  dateTo: z.string().nullable(),
  source: z.string(),
  eventId: z.number().nullable(),
});

export type CategoryAssignment = z.infer<typeof CategoryAssignmentSchema>;

// GET /cows/:id: card of the cow, with its category history (most recent first) and collar
export const CowDetailSchema = CowSchema.extend({
  categoryHistory: z.array(CategoryAssignmentSchema),
  collar: z.object({ id: z.number(), code: z.number() }).nullable(),
});

export type CowDetail = z.infer<typeof CowDetailSchema>;

export function cowLabel(cow: { id: number; alias?: string | null }) {
  return cow.alias || `Vaca ${cow.id}`;
}

const DAY_MS = 24 * 3600 * 1000;

// "3 años y 2 meses", "8 meses", "15 días"
export function formatAge(birthDate: string | Date, now = new Date()) {
  const birth = new Date(birthDate);
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 1) {
    const days = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / DAY_MS));
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }

  const years = Math.floor(months / 12);
  const rest = months % 12;
  const part = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  if (years === 0) {
    return part(rest, 'mes', 'meses');
  }

  if (rest === 0) {
    return part(years, 'año', 'años');
  }

  return `${part(years, 'año', 'años')} y ${part(rest, 'mes', 'meses')}`;
}
