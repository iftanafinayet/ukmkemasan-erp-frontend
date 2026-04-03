export const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'QRIS', 'Giro', 'Other'];

export const SALES_ORDER_STATUSES = [
  'Quotation',
  'Payment',
  'Production',
  'Quality Control',
  'Shipping',
  'Completed',
];

export const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getTodayInput = () => new Date().toISOString().slice(0, 10);

export const getFutureDateInput = (days) => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
};

export const getInvoiceOutstanding = (invoice) => {
  return Math.max(toNumber(invoice?.totalAmount) - toNumber(invoice?.paidAmount), 0);
};

export const getInvoiceStatusClasses = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'partially paid':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'overdue':
      return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'draft':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-sky-50 text-sky-600 border-sky-100';
  }
};
