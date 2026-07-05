import React from 'react';
import { normalizePaymentHistory } from '../../../utils/phase2';

const SHIPPING_STATUS_LABELS = {
  NotCreated: 'Sedang diproses',
  OrderCreated: 'Order dibuat',
  PickupScheduled: 'Menunggu kurir',
  LabelGenerated: 'Resi terbit',
  PickedUp: 'Dijemput kurir',
  InTransit: 'Sedang Dikirim',
  Delivered: 'Pesanan Selesai',
  Cancelled: 'Dibatalkan',
  Problem: 'Bermasalah',
};

const STEP_LABELS = [
  { label: 'Pembayaran', matches: ['Quotation', 'Payment'] },
  { label: 'Produksi', matches: ['Production', 'Quality Control'] },
  { label: 'Pengiriman', matches: ['Shipping'] },
  { label: 'Selesai', matches: ['Completed'] },
];

const isCancelled = (status) => ['Cancelled', 'cancelled', 'Dibatalkan'].includes(status);

export default function MobileOrderDetailPage({
  order,
  onBack,
  formatCurrency,
  formatDate,
  getStatusLabel,
  onOpenPayment,
}) {
  if (!order) return null;

  const canPay = !order.isPaid && ['Quotation', 'Payment'].includes(order.status);
  const payments = normalizePaymentHistory(order);
  const sp = order.shippingProvider || {};
  const shippingHistory = sp.statusHistory || [];
  const showShipping = Boolean(sp.awb) || ['Shipping', 'Completed'].includes(order.status);
  const currentStepIdx = STEP_LABELS.findIndex((s) => s.matches.includes(order.status));
  const qty = order.details?.quantity || order.quantity || 0;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in slide-in-from-bottom-full duration-300 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-outline-variant/20 bg-surface-container-lowest/90 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="flex h-14 items-center justify-between px-4">
          <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low transition-colors active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
          </button>
          <span className="font-headline text-[14px] font-bold text-on-surface">Detail Pesanan</span>
          <div className="w-8" />
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 space-y-4">
        {/* Order Details Header */}
        <div className="px-1">
          <h2 className="font-bold text-on-surface text-[16px]">Order Details</h2>
          <p className="text-[12px] text-on-surface-variant mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>

        {/* Detail Produk */}
        <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
          <div className="flex gap-3">
            <div className="w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden shrink-0 border border-outline-variant/30">
              <img
                src={order.product?.images?.[0]?.url || order.images?.[0]?.url || ''}
                alt={order.product?.name || 'Produk'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-on-surface text-[15px] leading-tight line-clamp-2">{order.product?.name || '-'}</h3>
              <p className="text-[13px] text-on-surface-variant mt-0.5">Qty: {qty.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
            <span className="text-[13px] text-on-surface-variant">× {formatCurrency((order.totalPrice - (order.shipping?.cost || 0)) / qty)}</span>
            <span className="text-[13px] font-bold text-on-surface">{formatCurrency(order.totalPrice - (order.shipping?.cost || 0))}</span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
          <h3 className="font-headline text-[14px] font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
            Status Pesanan
          </h3>
          {isCancelled(order.status) ? (
            <div className="text-center py-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-error-container text-error font-bold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Pesanan Dibatalkan
              </span>
            </div>
          ) : (
          <div className="relative flex justify-between items-start mb-2 px-1">
            <div className="absolute top-[14px] left-6 right-6 h-[2px] bg-surface-container-high z-0" />
            {currentStepIdx >= 0 && (
              <div
                className="absolute top-[14px] left-6 h-[2px] bg-primary z-0 transition-all duration-500"
                style={{ width: `calc(${(currentStepIdx / (STEP_LABELS.length - 1)) * 100}% - ${currentStepIdx === STEP_LABELS.length - 1 ? 24 : 12}px)` }}
              />
            )}
            {STEP_LABELS.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isPassed = idx < currentStepIdx;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center w-16">
                  {isPassed ? (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mb-2 shadow-[0_0_0_4px_#fff]">
                      <span className="material-symbols-outlined text-[14px] text-white">check</span>
                    </div>
                  ) : isActive ? (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mb-2 shadow-[0_0_0_4px_#fff]">
                      <div className="w-4 h-4 rounded-full bg-primary border-2 border-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center mb-2 shadow-[0_0_0_4px_#fff] text-[11px] font-bold text-on-surface-variant">
                      {idx + 1}
                    </div>
                  )}
                  <p className={`text-[10px] text-center font-bold leading-tight ${isActive || isPassed ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Alamat Pengiriman */}
        {order.shipping && (
          <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
            <h3 className="font-headline text-[14px] font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
              Alamat Pengiriman
            </h3>
            <div className="pl-6">
              <p className="font-bold text-on-surface text-[14px] mb-0.5">{order.shipping.recipient?.name || order.customer?.name || '-'}</p>
              <p className="text-[12px] text-on-surface-variant mb-2">{order.shipping.recipient?.phone || order.customer?.phone || '-'}</p>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                {order.shipping.address?.fullAddress || order.shipping.address?.address || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Rincian Pembayaran */}
        <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
          <h3 className="font-headline text-[14px] font-bold text-on-surface mb-4">Rincian Pembayaran</h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-on-surface">Subtotal ({qty} items)</span>
              <span className="font-bold text-on-surface">{formatCurrency(order.totalPrice - (order.shipping?.cost || 0))}</span>
            </div>
            {order.details?.useValve && (
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-on-surface">Valve</span>
                <span className="font-bold text-on-surface">Termasuk</span>
              </div>
            )}
            {order.shipping?.cost > 0 && (
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-on-surface">Ongkir ({order.shipping.courierCode?.toUpperCase() || 'Reguler'})</span>
                <span className="font-bold text-on-surface">{formatCurrency(order.shipping.cost)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center">
            <span className="font-headline font-bold text-on-surface text-[14px]">Total</span>
            <span className="font-headline font-bold text-primary text-[20px]">{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        {/* Riwayat Pembayaran */}
        {payments.length > 0 && (
          <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
            <h3 className="font-headline text-[14px] font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
              Riwayat Pembayaran
            </h3>
            <div className="space-y-3">
              {payments.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <div>
                    <p className="text-[12px] font-bold text-on-surface">{formatCurrency(p.amount)}</p>
                    <p className="text-[10px] text-muted mt-0.5">{p.method} · {p.date}</p>
                  </div>
                  <span className="text-[10px] font-bold text-success bg-success-container px-2 py-1 rounded">{p.status || 'Success'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Riwayat Pengiriman */}
        {showShipping && shippingHistory.length > 0 && (
          <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
            <h3 className="font-headline text-[14px] font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">route</span>
              Riwayat Pengiriman
            </h3>
            {sp.awb && (
              <div className="mb-4 bg-primary/5 border border-primary/20 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">No. Resi</p>
                <p className="font-bold text-primary text-[15px]">{sp.awb}</p>
              </div>
            )}
            <div className="space-y-3">
              {[...shippingHistory].reverse().map((h, idx) => (
                <div key={idx} className="flex gap-3 bg-surface-container-low border border-outline-variant/20 p-3 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-on-surface">{SHIPPING_STATUS_LABELS[h.status] || h.status}</p>
                    {h.description && <p className="text-[11px] text-muted mt-0.5 leading-snug">{h.description}</p>}
                    {h.timestamp && <p className="text-[10px] text-on-surface-variant mt-1 font-medium">{formatDateTime(h.timestamp)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {canPay && (
        <div className="fixed bottom-14 left-0 right-0 p-4 bg-surface-container-lowest border-t border-outline-variant/20 backdrop-blur-md">
          <button
            onClick={() => onOpenPayment(order._id)}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-all duration-200 shadow-card cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            Lanjutkan Pembayaran
          </button>
        </div>
      )}
    </div>
  );
}

function formatDateTime(dateValue) {
  if (!dateValue) return '';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(parsed);
}
