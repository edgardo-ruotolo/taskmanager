import { z } from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(1).max(255),
    identifier: z
        .string()
        .min(1)
        .max(10)
        .regex(/^[A-Z0-9]+$/, 'Solo mayúsculas y números'),
    description: z.string().optional(),
});

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
