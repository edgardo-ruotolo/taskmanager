import { z } from 'zod';

export const createIssueSchema = z.object({
    title: z.string().min(1, 'El título es requerido').max(500),
    description: z.string().optional(),
    priority: z.union([
        z.literal(0),
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
    ]),
    stateId: z.string().min(1, 'El estado es requerido'),
    assigneeId: z.string().optional(),
    dueDate: z.string().optional(),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;
