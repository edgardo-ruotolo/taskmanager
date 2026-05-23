import { z } from 'zod';

export const createLabelSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(100),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color HEX inválido'),
    description: z
        .string()
        .max(500, 'Máximo 500 caracteres')
        .optional()
        .or(z.literal('')),
});

export type CreateLabelFormData = z.infer<typeof createLabelSchema>;
