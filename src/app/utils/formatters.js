/**
 * Formats a number as Indonesian Rupiah (IDR).
 * @param {number} amount - The numeric value to format.
 * @returns {string} - Formatted currency string.
 */
export const formatCurrency = (amount) => {
  if (!amount) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a date string or object into a human-readable Indonesian format.
 * @param {string|Date} dateValue - The date value to format.
 * @returns {string} - Formatted date string.
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateValue));
};

/**
 * Formats a date string or object into a human-readable Indonesian date and time format.
 * @param {string|Date} dateValue - The date value to format.
 * @returns {string} - Formatted date and time string.
 */
export const formatDateTime = (dateValue) => {
  if (!dateValue) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
};
