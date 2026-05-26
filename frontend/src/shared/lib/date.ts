/**
 * Date helpers for TaskManager frontend.
 *
 * The backend returns date-only fields (e.g. dueDate, startDate) as
 * "YYYY-MM-DDT00:00:00Z". Using `new Date(str)` in a UTC-negative timezone
 * (e.g. Chile UTC-3) shifts the date one day earlier. These helpers prevent
 * that drift by extracting only the date portion when needed.
 */

/**
 * Parses a date-only value from the backend into a local-midnight Date,
 * avoiding UTC offset day-shift.
 *
 * Accepts:
 *   - "YYYY-MM-DD"
 *   - "YYYY-MM-DDT00:00:00Z" / "YYYY-MM-DDT00:00:00"
 *   - null / undefined / empty string → returns null
 *
 * @example
 *   parseDateOnly("2026-05-31T00:00:00Z") // → Date(2026-05-31 00:00:00 local)
 *   parseDateOnly("2026-05-31")           // → Date(2026-05-31 00:00:00 local)
 *   parseDateOnly(null)                   // → null
 */
export function parseDateOnly(value: string | null | undefined): Date | null {
    if (!value) return null;
    const datePart = value.split('T')[0] ?? value;
    const parts = datePart.split('-');
    const year = Number.parseInt(parts[0] ?? '0', 10);
    const month = Number.parseInt(parts[1] ?? '1', 10);
    const day = Number.parseInt(parts[2] ?? '1', 10);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
    const d = new Date(year, month - 1, day);
    // Extra guard: if the Date constructor produced an invalid date, return null
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

/**
 * Formats a date-only value for display, respecting local-midnight parsing
 * to avoid UTC offset drift.
 *
 * Returns '' when value is null/undefined/invalid — callers can use
 * `formatDateOnly(v) || '—'` for a dash fallback.
 *
 * @param value   ISO string or Date object
 * @param options Intl.DateTimeFormatOptions (default: { day: '2-digit', month: 'short' })
 * @param locale  BCP 47 locale string (default: 'es-ES')
 *
 * @example
 *   formatDateOnly("2026-05-31T00:00:00Z", { day: '2-digit', month: 'short' })
 *   // → "31 may" (in es-ES)
 */
export function formatDateOnly(
    value: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' },
    locale = 'es-ES',
): string {
    if (value === null || value === undefined) return '';
    let date: Date | null;
    if (value instanceof Date) {
        date = Number.isNaN(value.getTime()) ? null : value;
    } else {
        date = parseDateOnly(value);
    }
    if (!date) return '';
    return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Formats a full timestamp (e.g. createdAt, updatedAt) in the user's local
 * timezone. Intended for activity logs and audit trails — NOT for date-only
 * fields like dueDate/startDate.
 *
 * Returns '' when value is null/undefined/invalid.
 *
 * @param value   ISO string or Date object
 * @param options Intl.DateTimeFormatOptions (default: date + time, no seconds)
 * @param locale  BCP 47 locale string (default: 'es-ES')
 *
 * @example
 *   formatDateTime("2026-05-31T14:30:00Z")
 *   // → "31/05/2026, 11:30" (in es-ES, UTC-3)
 */
export function formatDateTime(
    value: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    },
    locale = 'es-ES',
): string {
    if (value === null || value === undefined) return '';
    const date = value instanceof Date ? value : new Date(value as string);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale, options).format(date);
}
