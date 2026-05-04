import { helper } from '@ember/component/helper';

/**
 * Format a number as a localized money string with no currency symbol.
 *
 * Usage: {{format-money 12345.67}} → "12,345.67"
 */
export default helper(function formatMoney([value]) {
  if (value === null || value === undefined || value === '') return '0.00';
  const n = Number(value);
  if (Number.isNaN(n)) return '0.00';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});
