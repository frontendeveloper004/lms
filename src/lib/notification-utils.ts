/**
 * Formats a notification badge count for display.
 * - Returns the exact number as a string for counts 1–9
 * - Returns "9+" for counts greater than 9
 *
 * Validates: Requirements 3.2, 3.3, 6.3, 6.4
 */
export function formatBadgeCount(count: number): string {
  if (count > 9) {
    return "9+";
  }
  return String(count);
}

/**
 * Formats a Date as a human-readable relative time string in Uzbek.
 * Examples: "5 daqiqa oldin", "2 soat oldin", "3 kun oldin"
 *
 * Validates: Requirements 7.1
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} kun oldin`;
  }

  if (diffHours > 0) {
    return `${diffHours} soat oldin`;
  }

  if (diffMinutes > 0) {
    return `${diffMinutes} daqiqa oldin`;
  }

  return "Hozirgina";
}
