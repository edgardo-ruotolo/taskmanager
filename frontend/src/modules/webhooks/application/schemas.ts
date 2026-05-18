import { z } from 'zod';

export const createWebhookSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(200),
    url: z
        .string()
        .min(1, 'La URL es obligatoria')
        .url('La URL no es válida')
        .refine(
            (val) => val.startsWith('http://') || val.startsWith('https://'),
            'La URL debe comenzar con http:// o https://',
        ),
    eventsJson: z.string().optional(),
});

export type CreateWebhookFormData = z.infer<typeof createWebhookSchema>;
