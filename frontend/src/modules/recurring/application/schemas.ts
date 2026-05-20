import { z } from 'zod';

export const recurringTemplateSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    descriptionHtml: z.string(),
    frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Yearly']),
    interval: z.number().int().min(1),
    daysOfWeek: z.array(z.number().int().min(0).max(6)),
    dayOfMonth: z.number().int().min(1).max(31).nullable(),
    monthOfYear: z.number().int().min(1).max(12).nullable(),
    runAtTime: z.string(),
    endTime: z.string().nullable(),
    timezone: z.string(),
    startsOn: z.string().min(1, 'La fecha de inicio es requerida'),
    endsOn: z.string().nullable(),
    stateGroup: z.string(),
    priority: z.string(),
    startDateOffsetDays: z.number().int(),
    targetDateOffsetDays: z.number().int(),
    blockPolicy: z.string(),
    companyIds: z.array(z.string()).min(1, 'Selecciona al menos una empresa'),
    assigneeIds: z.array(z.string()),
    labelIds: z.array(z.string()),
});

export type RecurringTemplateFormValues = z.infer<typeof recurringTemplateSchema>;
