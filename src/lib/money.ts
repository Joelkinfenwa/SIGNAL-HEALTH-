/** Format integer cents as AUD. Whole-dollar amounts drop the cents. */
export function formatAUD(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

export const centsToDollars = (cents: number) => Math.round(cents) / 100;
