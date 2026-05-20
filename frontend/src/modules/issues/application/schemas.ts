import { z } from 'zod';

export const createIssueSchema = z.object({
    title: z.string().min(1, 'El título es requerido').max(500),
    description: z.string().optional(),
    descriptionHtml: z.string().optional(),
    descriptionJson: z.string().optional(),
    priority: z.union([
        z.literal(0),
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
    ]),
    stateId: z.string().min(1, 'El estado es requerido'),
    assigneeId: z.string().optional(),
    assigneeIds: z.array(z.string().uuid()).optional(),
    labelIds: z.array(z.string().uuid()).optional(),
    moduleIds: z.array(z.string().uuid()).optional(),
    cycleId: z.string().uuid().optional(),
    parentId: z.string().uuid().optional(),
    issueTypeId: z.string().uuid().optional(),
    estimatePointId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    isDraft: z.boolean().optional(),
    sortOrder: z.number().min(0).optional(),
}).refine(
    (data) => {
        if (data.startDate && data.dueDate) {
            return new Date(data.startDate) <= new Date(data.dueDate);
        }
        return true;
    },
    { message: 'La fecha de inicio no puede ser posterior a la fecha de vencimiento', path: ['startDate'] }
);

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;

export const updateIssueSchema = z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().optional(),
    descriptionHtml: z.string().optional(),
    descriptionJson: z.string().optional(),
    priority: z.union([
        z.literal(0),
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
    ]).optional(),
    stateId: z.string().optional(),
    assigneeId: z.string().optional(),
    assigneeIds: z.array(z.string().uuid()).optional(),
    labelIds: z.array(z.string().uuid()).optional(),
    moduleIds: z.array(z.string().uuid()).optional(),
    cycleId: z.string().uuid().optional(),
    parentId: z.string().uuid().optional(),
    issueTypeId: z.string().uuid().optional(),
    estimatePointId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    isDraft: z.boolean().optional(),
    sortOrder: z.number().min(0).optional(),
}).refine(
    (data) => {
        if (data.startDate && data.dueDate) {
            return new Date(data.startDate) <= new Date(data.dueDate);
        }
        return true;
    },
    { message: 'La fecha de inicio no puede ser posterior a la fecha de vencimiento', path: ['startDate'] }
);

export type UpdateIssueFormData = z.infer<typeof updateIssueSchema>;
