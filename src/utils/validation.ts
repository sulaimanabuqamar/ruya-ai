/** HH:MM 24-hour format only */
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;
  return TIME_REGEX.test(value.trim());
}

/** Non-empty string that parses to a positive number (>= min) */
export function isValidPositiveNumber(
  value: string,
  min: number = 0
): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;
  const n = Number(value.trim());
  return !isNaN(n) && n >= min;
}

/** Parse to number or NaN */
export function parseNumber(value: string): number {
  const n = Number(typeof value === 'string' ? value.trim() : value);
  return isNaN(n) ? NaN : n;
}
