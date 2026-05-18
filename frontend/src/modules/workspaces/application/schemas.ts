import { z } from 'zod';

export const createWorkspaceSchema = z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
    description: z.string().optional(),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;
