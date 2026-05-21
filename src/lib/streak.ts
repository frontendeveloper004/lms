/**
 * Computes the learning streak: the number of consecutive calendar days
 * ending today on which at least one activity (lesson or quiz completion) occurred.
 *
 * @param timestamps - Array of Date objects from CompletedLesson and CompletedQuiz records
 * @returns number of consecutive days (0 if no activity today)
 */
export function computeStreak(timestamps: Date[]): number {
  if (timestamps.length === 0) return 0;

  // Normalize all timestamps to YYYY-MM-DD strings (UTC)
  const days = new Set(timestamps.map((t) => t.toISOString().slice(0, 10)));

  const today = new Date().toISOString().slice(0, 10);
  if (!days.has(today)) return 0;

  let streak = 0;
  const current = new Date();

  while (true) {
    const dateStr = current.toISOString().slice(0, 10);
    if (!days.has(dateStr)) break;
    streak++;
    current.setUTCDate(current.getUTCDate() - 1);
  }

  return streak;
}
