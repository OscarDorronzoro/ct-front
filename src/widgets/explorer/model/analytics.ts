import { z } from 'zod';

// Measure and dimension ids come from the backend catalog (analytics/explorer.catalog)
export const DatasetSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  measures: z.array(z.object({
    id: z.string(),
    label: z.string(),
    unit: z.string().nullable().optional(),
  })),
  dimensions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    // date | category
    kind: z.string(),
  })),
});

export type Dataset = z.infer<typeof DatasetSchema>;

// A value of a dimension: `value` filters, `label` is shown (numbers for ids, years...)
export const DimensionValueSchema = z.object({
  value: z.union([z.string(), z.number()]),
  label: z.union([z.string(), z.number()]),
});

export type DimensionValue = z.infer<typeof DimensionValueSchema>;

// Rows: one cell per column, a dimension value or a measure (null: no data)
export const QueryResultSchema = z.object({
  columns: z.array(z.object({
    id: z.string(),
    label: z.string(),
    kind: z.enum(['dimension', 'measure']),
    unit: z.string().nullable().optional(),
  })),
  rows: z.array(z.array(z.union([DimensionValueSchema, z.number(), z.null()]))),
  truncated: z.boolean(),
});

export type QueryResult = z.infer<typeof QueryResultSchema>;

export interface Query {
  dataset: string;
  measures: string[];
  dimensions: string[];
  filters: { dimension: string; values: (string | number)[] }[];
  // YYYY-MM-DD, both included
  dateFrom: string;
  dateTo: string;
}
