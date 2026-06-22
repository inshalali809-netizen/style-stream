/**
 * Shared PKR currency formatting.
 * Prices throughout the app are stored as plain numbers (e.g. 289 = Rs 289).
 * Use these everywhere instead of hardcoding "$" or "Rs" inline.
 */

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
