import * as z from 'zod';

import { CATEGORY_NAME_VALIDATOR } from '@/lib/validations/category';

export const SupportCategoryDeleteByNameSchema = z.object({
  name: CATEGORY_NAME_VALIDATOR,
});

export const SupportCreateEventCategorySchema = z.object({
  name: CATEGORY_NAME_VALIDATOR,
  color: z
    .string()
    .min(1, 'color is required')
    .max(10)
    .regex(/^#[0-9a-z]{6}$/gi, 'Invalid color format'),
  emoji: z.string().emoji('Invalid emoji').optional(),
});

export const SupportEventsRequestSchema = z
  .object({
    category: CATEGORY_NAME_VALIDATOR,
    fields: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
    description: z.string().max(500).optional(),
  })
  .strict();

export const SupportEventsByCategoryNameSchema = z.object({
  name: CATEGORY_NAME_VALIDATOR,
  page: z.preprocess<z.ZodNumber>(
    (val) => (typeof val === 'string' && val.trim() ? Number(val) : undefined),
    z.number({ invalid_type_error: 'Page must be a number' }),
  ),
  limit: z.preprocess<z.ZodNumber>(
    (val) => (typeof val === 'string' && val.trim() ? Number(val) : undefined),
    z.number({ invalid_type_error: 'Limit must be a number' }).max(50),
  ),
  timeRange: z.enum(['today', 'week', 'month']),
});

export type SupportCategoryDeleteByNameRequest = z.infer<typeof SupportCategoryDeleteByNameSchema>;

export type SupportCreateEventCategoryRequest = z.infer<typeof SupportCreateEventCategorySchema>;

export type SupportEventsRequestRequest = z.infer<typeof SupportEventsRequestSchema>;

export type SupportEventsByCategoryNameRequest = z.infer<typeof SupportEventsByCategoryNameSchema>;
