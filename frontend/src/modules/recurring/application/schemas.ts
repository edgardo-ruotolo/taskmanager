import { z } from 'zod';

export const recurringTemplateSchema = z
    .object({
        name: z.string().min(1, 'El nombre es requerido'),
        descriptionHtml: z.string(),
        frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']),
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
        issueTypeId: z.string().nullable().optional(),
        projectIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un proyecto'),
        assigneeIds: z.array(z.string()),
        labelIds: z.array(z.string()),
    })
    .superRefine((data, ctx) => {
        if (data.endsOn) {
            const starts = new Date(data.startsOn);
            const ends = new Date(data.endsOn);
            if (!Number.isNaN(starts.getTime()) && !Number.isNaN(ends.getTime()) && ends <= starts) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La fecha de fin debe ser posterior a la fecha de inicio.',
                    path: ['endsOn'],
                });
            }
        }

        if (data.frequency === 'Weekly' && data.daysOfWeek.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Selecciona al menos un día de la semana.',
                path: ['daysOfWeek'],
            });
        }

        if ((data.frequency === 'Monthly' || data.frequency === 'Quarterly') && data.dayOfMonth === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Debe indicar el día del mes.',
                path: ['dayOfMonth'],
            });
        }

        if (data.frequency === 'Yearly') {
            if (data.dayOfMonth === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Debe indicar el día del mes.',
                    path: ['dayOfMonth'],
                });
            }
            if (data.monthOfYear === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Debe indicar el mes del año.',
                    path: ['monthOfYear'],
                });
            }
        }
    });

export type RecurringTemplateFormValues = z.infer<typeof recurringTemplateSchema>;
