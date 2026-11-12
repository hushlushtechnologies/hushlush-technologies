/**
 * UAE-only phone numbers (+971).
 * Accepts "+971 50 123 4567", "00971501234567", "971501234567" or local "050 123 4567"
 * and returns the normalised "+971501234567"; anything else returns null.
 * Mobile: 5[0,2,4,5,6,8] + 7 digits. Landline: area code 2,3,4,6,7,9 + 7 digits.
 */
export function normalizeUaePhone(input: string): string | null {
  let d = input.replace(/[\s().-]/g, "");
  if (d.startsWith("+971")) d = d.slice(4);
  else if (d.startsWith("00971")) d = d.slice(5);
  else if (d.startsWith("971")) d = d.slice(3);
  else if (d.startsWith("+")) return null; // another country code
  if (d.startsWith("0")) d = d.slice(1);
  return /^(5[024568]\d{7}|[234679]\d{7})$/.test(d) ? `+971${d}` : null;
}

export const UAE_PHONE_ERROR = "Please enter a valid UAE number (+971).";
