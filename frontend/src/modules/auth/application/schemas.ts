import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    username: z.string().min(3).max(50),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z
    .object({
        newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
        confirmPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Requerido'),
        newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
        confirmPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

export const updateProfileSchema = z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    displayName: z.string().max(150).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
