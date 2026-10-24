import { z } from 'zod';

// Vaccines, drugs and antiparasitics. Withdrawal: days after the last application during which
// the meat / milk of the animal can't be sold.
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  meatWithdrawalDays: z.number(),
  milkWithdrawalDays: z.number(),
  // Inactive: no longer offered for new events
  active: z.boolean(),
});

export type Product = z.infer<typeof ProductSchema>;

export interface ProductInput {
  name?: string;
  type?: string;
  meatWithdrawalDays?: number;
  milkWithdrawalDays?: number;
  active?: boolean;
}

export const PRODUCT_TYPES = [
  { value: 'vaccine', label: 'Vacuna' },
  { value: 'drug', label: 'Medicamento' },
  { value: 'antiparasitic', label: 'Antiparasitario' },
];

export const productTypeLabel = (type: string) => (
  PRODUCT_TYPES.find((item) => item.value === type)?.label ?? type
);
