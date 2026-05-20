import axios from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

type ValidationErrorPayload = {
    errors?: Record<string, string[] | string>;
    Errors?: Record<string, string[] | string>;
};

type MessagePayload = {
    message?: unknown;
    Message?: unknown;
    error?: unknown;
    title?: unknown;
    detail?: unknown;
};

const toCamelCase = (field: string): string => {
    if (!field) return field;
    return field.charAt(0).toLowerCase() + field.slice(1);
};

const extractValidationErrors = (
    error: unknown,
): Record<string, string[]> | null => {
    if (!axios.isAxiosError(error)) return null;
    const status = error.response?.status;
    if (status !== 422 && status !== 400) return null;
    const data = error.response?.data as ValidationErrorPayload | undefined;
    if (!data) return null;
    const raw = data.errors ?? data.Errors;
    if (!raw || typeof raw !== 'object') return null;

    const normalized: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(raw)) {
        const camelKey = toCamelCase(key);
        if (Array.isArray(value)) {
            normalized[camelKey] = value.map((v) => String(v));
        } else if (typeof value === 'string') {
            normalized[camelKey] = [value];
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : null;
};

/**
 * Returns true when the error represents a backend validation error
 * (HTTP 422 or 400 with an `errors`/`Errors` map in the body).
 */
export const isValidationError = (error: unknown): boolean => {
    return extractValidationErrors(error) !== null;
};

/**
 * Applies server-side validation errors to a react-hook-form instance.
 * Returns true if any field error was applied.
 */
export const applyServerErrors = <TFieldValues extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<TFieldValues>,
): boolean => {
    const errors = extractValidationErrors(error);
    if (!errors) return false;

    let applied = false;
    for (const [field, messages] of Object.entries(errors)) {
        const message = messages[0];
        if (!message) continue;
        setError(field as Path<TFieldValues>, { type: 'server', message });
        applied = true;
    }
    return applied;
};

const pickStringCandidate = (
    payload: MessagePayload | string | undefined,
): string | null => {
    if (typeof payload === 'string' && payload.length > 0) return payload;
    if (!payload || typeof payload !== 'object') return null;
    const candidates = [
        payload.message,
        payload.Message,
        payload.error,
        payload.detail,
        payload.title,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.length > 0) {
            return candidate;
        }
    }
    return null;
};

/**
 * Extracts a human-readable error message from an unknown error value.
 * Supports Axios errors with standard ASP.NET / FluentValidation payloads.
 */
export const getErrorMessage = (error: unknown): string | null => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as MessagePayload | string | undefined;
        const fromData = pickStringCandidate(data);
        if (fromData) return fromData;
        if (error.message) return error.message;
    }
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error.length > 0) return error;
    return null;
};
