import { z } from 'zod';

export const createCycleSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(255),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export type CreateCycleFormData = z.infer<typeof createCycleSchema>;
