import React from 'react';
import { Download, Truck } from 'lucide-react';
import { ModalWrapper, InfoBlock } from '../customer-dashboard/shared';
import { normalizePaymentHistory, printInvoicePdf } from '../../utils/phase2';
 
const ORDER_STEPS = ['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'];

const SHIPPING_STATUS_LABELS = {
  NotCreated: 'Sedang diproses untuk pengiriman',
  OrderCreated: 'Order pengiriman dibuat',
  PickupScheduled: 'Menunggu dijemput kurir',
  LabelGenerated: 'Resi terbit',
  PickedUp: 'Dijemput kurir',
  InTransit: 'Dalam perjalanan',
  Delivered: 'Terkirim',
  Cancelled: 'Pengiriman dibatalkan',
  Problem: 'Pengiriman bermasalah',
};

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
 
const getItemRows = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items.map((item) => ({
      name: item.product?.name || item.sku || 'Produk',
      sku: item.sku || '',
      size: item.size || '',
      color: item.color || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      useValve: item.useValve,
      image: item.product?.images?.[0]?.url || null,
    }));
  }
  return [{
    name: order.product?.name || 'Produk Custom',
    sku: order.details?.sku || '',
    size: order.details?.size || '',
    color: order.details?.color || '',
    quantity: order.details?.quantity || 0,
    unitPrice: order.details?.unitPrice || 0,
    useValve: order.details?.useValve,
    image: order.product?.images?.[0]?.url || null,
  }];
};

export default function CustomerPortalOrderDetailModal({
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusLabel,
  onClose,
  onOpenPayment,
  onCancelOrder,
  order,
}) {
  if (!order) return null;
  const canPay = !order.isPaid && ['Quotation', 'Payment'].includes(order.status);
  const canCancel = !order.isPaid && ['Quotation', 'Payment'].includes(order.status);
  const payments = normalizePaymentHistory(order);
  const stepTimestamps = getStepTimestamps(order, payments);
  const itemRows = getItemRows(order);
  const sp = order.shippingProvider || {};
  const shippingHistory = sp.statusHistory || [];
  const showShipping = Boolean(sp.orderNo) || ['Shipping', 'Completed'].includes(order.status);
 
  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-on-surface">Pesanan #{order.orderNumber}</h3>
          <p className="text-sm font-medium text-on-surface-variant">{formatDate(order.createdAt)}</p>
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
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-on-surface transition-all hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Download className="h-4 w-4" />
          Invoice PDF
        </button>
      </div>
 
      <div className="mb-8 rounded-[28px] border border-primary/10 bg-gradient-to-br from-surface-container-low via-cyan-50/40 to-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-on-surface-variant">Progress Pesanan</p>
            {order.orderType === 'Sample' && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">SAMPLE</span>}
          </div>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">Pantau tahapan yang sudah selesai dan proses berikutnya.</p>
          </div>
          <span className="rounded-full border border-primary/15 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-card">
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
                    <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ring-4 ring-white ${isDone ? 'bg-primary text-white shadow-card-hover shadow-primary/20' : isCurrent ? 'border border-slate-300 bg-surface-container-high text-on-surface' : 'border border-slate-300 bg-surface-container-high text-on-surface-variant'}`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <p className={`mt-2 max-w-16 text-[10px] font-bold leading-tight ${isDone ? 'text-on-surface' : 'text-on-surface-variant'}`}>{getStatusLabel(status)}</p>
                    <p className="mt-1 min-h-[14px] text-[10px] font-semibold text-muted">
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
 
      <div className="mb-6 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
        <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant/30">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Item Pesanan</p>
        </div>
        <div className="divide-y divide-slate-50">
          {itemRows.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 px-5 py-4">
              <div className="w-14 h-14 rounded-xl bg-surface-container-high overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <span className="material-symbols-outlined text-xl">image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.size && <>{item.size} • </>}{item.color || ''}
                  {item.useValve ? ' • Valve' : ''}
                </p>
                <p className="text-xs text-muted">{item.quantity.toLocaleString()} pcs @ {formatCurrency(item.unitPrice)}</p>
              </div>
              <p className="text-sm font-extrabold text-primary shrink-0">{formatCurrency(item.quantity * item.unitPrice)}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-primary/10 bg-primary/5 px-5 py-4">
          {order.shipping?.cost != null && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-on-surface-variant">Subtotal Produk</span>
                <span className="font-bold text-on-surface">{formatCurrency((order.totalPrice || 0) - (order.shipping.cost || 0))}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-on-surface-variant">
                  Ongkir{order.shipping.courierCode ? ` (${order.shipping.courierCode} ${order.shipping.courierService || ''})` : ''}
                </span>
                <span className="font-bold text-on-surface">{formatCurrency(order.shipping.cost)}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-primary">Total Pesanan</span>
            <span className="text-lg font-extrabold text-primary">{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <InfoBlock label="Pembayaran" value={order.isPaid ? '✓ Lunas' : '✗ Belum Bayar'} />
        <InfoBlock label="Valve" value={order.details?.useValve || itemRows.some(r => r.useValve) ? 'Ya' : 'Tidak'} />
        <InfoBlock label="Total Kuantitas" value={`${itemRows.reduce((s, r) => s + r.quantity, 0).toLocaleString()} pcs`} />
      </div>

      <div className="mb-8 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Payment History</p>
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
            {payments.length} transaksi
          </span>
        </div>
        {payments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">{payment.paymentNumber}</p>
                    <p className="mt-1 text-xs font-medium text-muted">{payment.paymentDate ? formatDateTime(payment.paymentDate) : '-'}</p>
                  </div>
                  <p className="text-sm font-black text-primary">{formatCurrency(payment.amount)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                  <span>{payment.method}</span>
                  <span>{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-muted">Belum ada pembayaran yang tercatat untuk pesanan ini.</p>
        )}
      </div>
 
      {showShipping && (
        <div className="mb-8 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Pengiriman</p>
          </div>

          {sp.awb ? (
            <div className="mb-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">No. Resi (AWB)</p>
              <p className="text-lg font-black tracking-wide text-primary">{sp.awb}</p>
            </div>
          ) : (
            <p className="mb-2 rounded-2xl bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface-variant">
              {SHIPPING_STATUS_LABELS.NotCreated}
            </p>
          )}

          {shippingHistory.length > 0 && (
            <div className="space-y-2">
              {[...shippingHistory].reverse().map((h, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">{SHIPPING_STATUS_LABELS[h.status] || h.status}</p>
                    {h.description && <p className="text-xs text-on-surface-variant">{h.description}</p>}
                    <p className="text-[11px] font-medium text-muted">{h.timestamp ? formatDateTime(h.timestamp) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {canCancel && (
          <button
            type="button"
            onClick={() => onCancelOrder(order._id)}
            className="rounded-full border-2 border-error px-6 py-3 text-sm font-black text-error transition hover:bg-error/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Batalkan Pesanan
          </button>
        )}
        {canPay && (
          <button
            type="button"
            onClick={() => onOpenPayment(order._id)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Bayar dengan Midtrans
          </button>
        )}
      </div>
    </ModalWrapper>
  );
}
