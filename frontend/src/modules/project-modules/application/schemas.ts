import { z } from 'zod';

export const createModuleSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(255),
    description: z.string().optional(),
    status: z.enum(['Backlog', 'InProgress', 'Paused', 'Completed', 'Archived']),
});

export type CreateModuleFormData = z.infer<typeof createModuleSchema>;
