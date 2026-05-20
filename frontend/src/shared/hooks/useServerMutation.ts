import { useMutation } from '@tanstack/react-query';
import type {
    UseMutationOptions,
    UseMutationResult,
} from '@tanstack/react-query';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';
import {
    applyServerErrors,
    getErrorMessage,
    isValidationError,
} from '@/shared/lib/api-errors';

export interface UseServerMutationOptions<
    TData,
    TVariables,
    TFormValues extends FieldValues = FieldValues,
> extends UseMutationOptions<TData, unknown, TVariables, unknown> {
    /** When provided, validation errors (422/400) are routed to the form. */
    setError?: UseFormSetError<TFormValues>;
    /** Fallback message used when the error has no readable message. */
    fallbackMessage?: string;
}

/**
 * Wraps `useMutation` with consistent error handling:
 *  - 422/400 validation errors are forwarded to the bound RHF form (if any).
 *  - Any other error is surfaced as a toast.
 *  - The caller's `onError` (if any) still runs for rollbacks/cleanup.
 */
export function useServerMutation<
    TData,
    TVariables,
    TFormValues extends FieldValues = FieldValues,
>(
    options: UseServerMutationOptions<TData, TVariables, TFormValues>,
): UseMutationResult<TData, unknown, TVariables, unknown> {
    const { setError, fallbackMessage, onError, ...rest } = options;

    return useMutation<TData, unknown, TVariables, unknown>({
        ...rest,
        onError: (error, variables, onMutateResult, context) => {
            const handledByForm =
                setError !== undefined &&
                isValidationError(error) &&
                applyServerErrors(error, setError);

            if (!handledByForm) {
                const message =
                    getErrorMessage(error) ?? fallbackMessage ?? 'Algo salió mal';
                toast.error(message);
            }

            onError?.(error, variables, onMutateResult, context);
        },
    });
}
