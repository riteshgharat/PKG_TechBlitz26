/**
 * Parse "HH:mm" time string to { hours, minutes }
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours: hours!, minutes: minutes! };
}

/**
 * Create a Date object for a specific date and time string (HH:mm)
 */
export function createDateTime(dateStr: string, timeStr: string): Date {
  const { hours, minutes } = parseTime(timeStr);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Add minutes to a Date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Format Date to "HH:mm" string
 */
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * Get day of week (0=Sunday, 6=Saturday) from a date string
 */
export function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay();
}

/**
 * Get start and end of a given date (for querying appointments in a day)
 */
export function getDayBounds(dateStr: string): { start: Date; end: Date } {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}
