/**
 * Format a Date object to HH:MM string
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse HH:MM string to Date object (today's date with specified time)
 */
export function parseTime(timeString: string): Date | null {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}
