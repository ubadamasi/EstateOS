/**
 * Format kobo (integer) as Naira display string.
 * ₦1 = 100 kobo. Never use float arithmetic for money.
 *
 * Examples:
 *   formatNaira(2500000)  → "₦25,000"
 *   formatNaira(150)      → "₦1.50"
 */
export function formatNaira(kobo: number): string {
  const naira = Math.floor(Math.abs(kobo) / 100);
  const koboRemainder = Math.abs(kobo) % 100;
  const sign = kobo < 0 ? "-" : "";

  if (koboRemainder === 0) {
    return `${sign}₦${naira.toLocaleString("en-NG")}`;
  }
  return `${sign}₦${naira.toLocaleString("en-NG")}.${String(koboRemainder).padStart(2, "0")}`;
}

/**
 * Convert naira input string to kobo integer.
 * "25000" → 2500000
 * "25,000" → 2500000
 */
export function nairaToKobo(nairaString: string): number {
  const cleaned = nairaString.replace(/[,₦\s]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) throw new Error(`Invalid naira value: "${nairaString}"`);
  return Math.round(parsed * 100);
}

/** 20000000 kobo = ₦200,000 — the double-confirm threshold */
export const DOUBLE_CONFIRM_THRESHOLD_KOBO = 20_000_000;
