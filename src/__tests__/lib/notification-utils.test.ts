import * as fc from "fast-check";
import { formatBadgeCount, formatRelativeTime } from "../../lib/notification-utils";

// ─── formatBadgeCount ────────────────────────────────────────────────────────

describe("formatBadgeCount", () => {
  // Unit tests — specific examples
  it("returns '0' for count 0", () => {
    expect(formatBadgeCount(0)).toBe("0");
  });

  it("returns '1' for count 1", () => {
    expect(formatBadgeCount(1)).toBe("1");
  });

  it("returns '9' for count 9", () => {
    expect(formatBadgeCount(9)).toBe("9");
  });

  it("returns '9+' for count 10", () => {
    expect(formatBadgeCount(10)).toBe("9+");
  });

  it("returns '9+' for count 100", () => {
    expect(formatBadgeCount(100)).toBe("9+");
  });

  // Feature: teacher-notification-system, Property 3: Badge 1-9 oralig'ida aniq raqam ko'rsatadi
  // Validates: Requirements 3.2, 6.3
  it("displays exact count for integers in [1, 9]", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9 }), (n) => {
        expect(formatBadgeCount(n)).toBe(String(n));
      }),
      { numRuns: 100 }
    );
  });

  // Feature: teacher-notification-system, Property 4: Badge 9 dan katta qiymatda "9+" ko'rsatadi
  // Validates: Requirements 3.3, 6.4
  it("displays '9+' for any integer greater than 9", () => {
    fc.assert(
      fc.property(fc.integer({ min: 10, max: 10_000 }), (n) => {
        expect(formatBadgeCount(n)).toBe("9+");
      }),
      { numRuns: 100 }
    );
  });
});

// ─── formatRelativeTime ───────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  function dateSecondsAgo(seconds: number): Date {
    return new Date(Date.now() - seconds * 1000);
  }

  it("returns 'Hozirgina' for a date less than 1 minute ago", () => {
    expect(formatRelativeTime(dateSecondsAgo(30))).toBe("Hozirgina");
  });

  it("returns '1 daqiqa oldin' for ~1 minute ago", () => {
    expect(formatRelativeTime(dateSecondsAgo(60))).toBe("1 daqiqa oldin");
  });

  it("returns '5 daqiqa oldin' for ~5 minutes ago", () => {
    expect(formatRelativeTime(dateSecondsAgo(5 * 60))).toBe("5 daqiqa oldin");
  });

  it("returns '1 soat oldin' for ~1 hour ago", () => {
    expect(formatRelativeTime(dateSecondsAgo(60 * 60))).toBe("1 soat oldin");
  });

  it("returns '2 soat oldin' for ~2 hours ago", () => {
    expect(formatRelativeTime(dateSecondsAgo(2 * 60 * 60))).toBe("2 soat oldin");
  });

  it("returns '1 kun oldin' for ~1 day ago", () => {
    expect(formatRelativeTime(dateSecondsAgo(24 * 60 * 60))).toBe("1 kun oldin");
  });

  it("returns '3 kun oldin' for ~3 days ago", () => {
    expect(formatRelativeTime(dateSecondsAgo(3 * 24 * 60 * 60))).toBe("3 kun oldin");
  });

  it("days take priority over hours", () => {
    // 25 hours ago should be "1 kun oldin", not "25 soat oldin"
    expect(formatRelativeTime(dateSecondsAgo(25 * 60 * 60))).toBe("1 kun oldin");
  });

  it("hours take priority over minutes", () => {
    // 90 minutes ago should be "1 soat oldin", not "90 daqiqa oldin"
    expect(formatRelativeTime(dateSecondsAgo(90 * 60))).toBe("1 soat oldin");
  });

  // Property: for any number of minutes in [1, 59], result ends with "daqiqa oldin"
  it("always returns 'X daqiqa oldin' for 1–59 minutes ago", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 59 }), (minutes) => {
        const date = dateSecondsAgo(minutes * 60);
        const result = formatRelativeTime(date);
        expect(result).toMatch(/^\d+ daqiqa oldin$/);
        expect(result).toBe(`${minutes} daqiqa oldin`);
      }),
      { numRuns: 59 }
    );
  });

  // Property: for any number of hours in [1, 23], result ends with "soat oldin"
  it("always returns 'X soat oldin' for 1–23 hours ago", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 23 }), (hours) => {
        const date = dateSecondsAgo(hours * 60 * 60);
        const result = formatRelativeTime(date);
        expect(result).toMatch(/^\d+ soat oldin$/);
        expect(result).toBe(`${hours} soat oldin`);
      }),
      { numRuns: 23 }
    );
  });

  // Property: for any number of days >= 1, result ends with "kun oldin"
  it("always returns 'X kun oldin' for 1+ days ago", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 365 }), (days) => {
        const date = dateSecondsAgo(days * 24 * 60 * 60);
        const result = formatRelativeTime(date);
        expect(result).toMatch(/^\d+ kun oldin$/);
        expect(result).toBe(`${days} kun oldin`);
      }),
      { numRuns: 100 }
    );
  });
});
