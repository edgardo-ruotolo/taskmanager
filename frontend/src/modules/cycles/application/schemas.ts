import { z } from 'zod';

export const createCycleSchema = z
    .object({
        name: z.string().min(1, 'El nombre es obligatorio').max(255),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    })
    .refine(
        (data) => {
            if (!data.startDate || !data.endDate) return true;
            return new Date(data.endDate) >= new Date(data.startDate);
        },
        {
            message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
            path: ['endDate'],
        },
    );

export type CreateCycleFormData = z.infer<typeof createCycleSchema>;
