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

export const formatRelativeTime = (dateValue, now = Date.now()) => {
  if (!dateValue) return '-';
  const then = new Date(dateValue).getTime();
  if (Number.isNaN(then)) return '-';
  const diff = now - then;
  if (diff < 0) return 'baru saja';
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'baru saja';
  if (minutes === 1) return '1 mnt lalu';
  if (minutes < 60) return `${minutes} mnt lalu`;
  if (hours === 1) return '1 jam lalu';
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return formatDateTime(dateValue);
};
