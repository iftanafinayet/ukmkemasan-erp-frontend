import React from 'react';
import { Download } from 'lucide-react';
import { ModalWrapper, InfoBlock } from '../customer-dashboard/shared';
import { normalizePaymentHistory, printInvoicePdf } from '../customer-dashboard/phase2-utils';
 
const ORDER_STEPS = ['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'];

const STEP_DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
});

const STATUS_HISTORY_KEYS = [
  'statusHistory',
  'history',
  'timeline',
  'progressHistory',
  'trackingHistory',
];

const normalizeStatusKey = (value) => String(value || '').trim().toLowerCase();

const resolveHistoryStatus = (entry) => (
  entry?.status
  || entry?.toStatus
  || entry?.nextStatus
  || entry?.stage
  || entry?.step
  || entry?.label
  || entry?.name
  || entry?.title
);

const resolveHistoryDate = (entry) => (
  entry?.date
  || entry?.timestamp
  || entry?.changedAt
  || entry?.createdAt
  || entry?.updatedAt
);

const getStepTimestamps = (order, payments) => {
  const timestamps = new Map();
  const addTimestamp = (status, value) => {
    if (!status || !value) return;
    const key = normalizeStatusKey(status);
    if (!timestamps.has(key)) timestamps.set(key, value);
  };

  addTimestamp('Quotation', order?.quotationDate || order?.createdAt || order?.orderDate);
  addTimestamp('Payment', payments.find((payment) => payment?.paymentDate)?.paymentDate || order?.paidAt || order?.paymentDate);
  addTimestamp('Production', order?.productionDate || order?.productionAt);
  addTimestamp('Quality Control', order?.qualityControlDate || order?.qualityControlAt);
  addTimestamp('Shipping', order?.shippingDate || order?.shippingAt || order?.deliveryDate);
  addTimestamp('Completed', order?.completedAt || order?.deliveredAt || order?.receivedAt);

  STATUS_HISTORY_KEYS.forEach((key) => {
    const history = order?.[key];
    if (!Array.isArray(history)) return;

    history.forEach((entry) => {
      addTimestamp(resolveHistoryStatus(entry), resolveHistoryDate(entry));
    });
  });

  if (order?.status && order?.updatedAt) {
    addTimestamp(order.status, order.updatedAt);
  }

  return timestamps;
};

const formatStepTimestamp = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return STEP_DATE_FORMATTER.format(parsed);
};
 
export default function CustomerPortalOrderDetailModal({
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusLabel,
  onClose,
  onOpenPayment,
  order,
}) {
  if (!order) return null;
  const canPay = !order.isPaid && ['Quotation', 'Payment'].includes(order.status);
  const payments = normalizePaymentHistory(order);
  const stepTimestamps = getStepTimestamps(order, payments);
 
  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-800">Pesanan #{order.orderNumber}</h3>
          <p className="text-sm font-medium text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => printInvoicePdf({
            order,
            payments,
            formatCurrency,
            formatDate,
            formatDateTime,
          })}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-700 transition-all hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Invoice PDF
        </button>
      </div>
 
      <div className="mb-8 rounded-[28px] border border-primary/10 bg-gradient-to-br from-slate-50 via-cyan-50/40 to-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Progress Pesanan</p>
            <p className="mt-2 text-sm font-medium text-slate-500">Pantau tahapan yang sudah selesai dan proses berikutnya.</p>
          </div>
          <span className="rounded-full border border-primary/15 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
            {getStatusLabel(order.status)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-[640px] items-center justify-between lg:min-w-0">
            {ORDER_STEPS.map((status, idx, arr) => {
              const currentIdx = arr.indexOf(order.status);
              const isDone = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const stepDate = isDone ? formatStepTimestamp(stepTimestamps.get(normalizeStatusKey(status))) : null;
              return (
                <React.Fragment key={status}>
                  <div className="text-center">
                    <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ring-4 ring-white ${isDone ? 'bg-primary text-white shadow-lg shadow-primary/20' : isCurrent ? 'border border-slate-300 bg-slate-100 text-slate-700' : 'border border-slate-300 bg-slate-100 text-slate-600'}`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <p className={`mt-2 max-w-16 text-[10px] font-bold leading-tight ${isDone ? 'text-slate-700' : 'text-slate-500'}`}>{getStatusLabel(status)}</p>
                    <p className="mt-1 min-h-[14px] text-[10px] font-semibold text-slate-400">
                      {stepDate || '\u00A0'}
                    </p>
                  </div>
                  {idx < arr.length - 1 && <div className={`mx-2 h-0.5 flex-1 rounded-full ${idx < currentIdx ? 'bg-primary' : 'bg-slate-300'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
 
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <InfoBlock label="Produk" value={order.product?.name} />
          <InfoBlock label="Kategori" value={order.product?.category} />
          <InfoBlock label="Kuantitas" value={`${order.details?.quantity?.toLocaleString()} pcs`} />
        </div>
        <div className="space-y-4">
          <InfoBlock label="Valve" value={order.details?.useValve ? 'Ya' : 'Tidak'} />
          <InfoBlock label="Pembayaran" value={order.isPaid ? '✓ Lunas' : '✗ Belum Bayar'} />
          <InfoBlock label="Total" value={formatCurrency(order.totalPrice)} highlight />
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Payment History</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {payments.length} transaksi
          </span>
        </div>
        {payments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">{payment.paymentNumber}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">{payment.paymentDate ? formatDateTime(payment.paymentDate) : '-'}</p>
                  </div>
                  <p className="text-sm font-black text-primary">{formatCurrency(payment.amount)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span>{payment.method}</span>
                  <span>{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-400">Belum ada pembayaran yang tercatat untuk pesanan ini.</p>
        )}
      </div>
 
      {canPay && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onOpenPayment(order._id)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary/90"
          >
            Bayar dengan Midtrans
          </button>
        </div>
      )}
    </ModalWrapper>
  );
}
