import React from 'react';
import { Download } from 'lucide-react';
import { normalizePaymentHistory, printInvoicePdf } from '../../utils/phase2';

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

export default function CustomerPortalOrderDetailModal({
  formatCurrency,
  formatDate,
  formatDateTime,
  onClose,
  onOpenPayment,
  onCancelOrder,
  order,
}) {
  if (!order) return null;

  const canPay = !order.isPaid && ['Quotation', 'Payment'].includes(order.status);
  const canCancel = !order.isPaid && ['Quotation', 'Payment'].includes(order.status);
  const payments = normalizePaymentHistory(order);
  const sp = order.shippingProvider || {};
  const shippingHistory = sp.statusHistory || [];
  const showShipping = Boolean(sp.awb) || ['Shipping', 'Completed'].includes(order.status);
  const currentStepIdx = STEP_LABELS.findIndex((s) => s.matches.includes(order.status));
  const qty = order.details?.quantity || order.quantity || 0;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-outline-variant/20 bg-surface-container-lowest/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low transition-all hover:bg-surface-container-high active:scale-95">
              <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
            </button>
            <span className="font-headline text-[15px] font-bold text-on-surface">Detail Pesanan</span>
          </div>
          <button
            type="button"
            onClick={() => printInvoicePdf({ order, payments, formatCurrency, formatDate, formatDateTime })}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-black uppercase tracking-[0.22em] text-on-surface transition-all hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            Invoice PDF
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl p-6 pb-28 space-y-4">
          {/* Order Details Header */}
          <div className="px-1">
            <h2 className="font-black text-on-surface text-[18px]">Order #{order.orderNumber}</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>

          {/* Detail Produk */}
          <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
            {order.items?.length > 0 ? (
              <div className="divide-y divide-outline-variant/20">
                {order.items.map((item, idx) => (
                  <div key={item._id || item.sku || idx} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden shrink-0 border border-outline-variant/30">
                      <img src={item.product?.images?.[0]?.url || ''} alt={item.product?.name || 'Produk'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-on-surface text-[14px] leading-tight line-clamp-2">{item.product?.name || '-'}</h3>
                      <p className="text-[12px] text-on-surface-variant mt-0.5">
                        {item.quantity?.toLocaleString() || 0} pcs × {formatCurrency(item.unitPrice)}
                      </p>
                      {(item.size || item.color || item.material) && (
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {[item.size, item.color, item.material].filter(Boolean).join(' / ')}
                          {item.useValve ? ' • Valve' : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-[13px] font-bold text-on-surface shrink-0">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden shrink-0 border border-outline-variant/30">
                    <img src={order.product?.images?.[0]?.url || order.images?.[0]?.url || ''} alt={order.product?.name || 'Produk'} className="w-full h-full object-cover" />
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
              </>
            )}
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
              <div className="space-y-2">
                <div className="flex gap-3">
                  <span className="w-20 shrink-0 text-[11px] text-on-surface-variant">Penerima</span>
                  <span className="flex-1 text-[13px] font-semibold text-on-surface">{order.shipping.recipient?.name || order.customer?.name || '-'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-20 shrink-0 text-[11px] text-on-surface-variant">No. HP</span>
                  <span className="flex-1 text-[13px] text-on-surface">{order.shipping.recipient?.phone || order.customer?.phone || '-'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-20 shrink-0 text-[11px] text-on-surface-variant">Alamat</span>
                  <span className="flex-1 text-[13px] text-on-surface leading-relaxed">{order.shipping.recipient?.address || order.customer?.address || '-'}</span>
                </div>
                {order.shipping.recipient?.pinPoint && (
                  <a
                    href={order.shipping.recipient.pinPoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 mt-1 rounded-xl bg-primary/10 text-[12px] font-bold text-primary hover:bg-primary/15 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    Lihat Pin Point
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Rincian Pembayaran */}
          <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20">
            <h3 className="font-headline text-[14px] font-bold text-on-surface mb-4">Rincian Pembayaran</h3>
            <div className="space-y-3 mb-4">
              {order.items?.length > 0 ? (
                <>
                  {order.items.map((item, idx) => (
                    <div key={item._id || item.sku || idx} className="flex justify-between items-start gap-3 text-[13px]">
                      <span className="text-on-surface flex-1 min-w-0">
                        {item.product?.name || 'Produk'}
                        <span className="text-on-surface-variant"> ({item.quantity?.toLocaleString() || 0} × {formatCurrency(item.unitPrice)})</span>
                      </span>
                      <span className="font-bold text-on-surface shrink-0">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-[13px] pt-1">
                    <span className="text-on-surface">Subtotal Produk</span>
                    <span className="font-bold text-on-surface">{formatCurrency(order.totalPrice - (order.shipping?.cost || 0))}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-on-surface">Harga Satuan</span>
                    <span className="font-bold text-on-surface">{formatCurrency((order.totalPrice - (order.shipping?.cost || 0)) / qty)}</span>
                  </div>
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
                </>
              )}
              {order.shipping?.cost > 0 && (
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface">Ongkir ({order.shipping.courierCode?.toUpperCase() || 'Reguler'})</span>
                  <span className="font-bold text-on-surface">{formatCurrency(order.shipping.cost)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center">
              <span className="font-black text-[14px]">Total</span>
              <span className="font-black text-primary text-[20px]">{formatCurrency(order.totalPrice)}</span>
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
                  <div key={p.id || idx} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <div>
                      <p className="text-[12px] font-bold text-on-surface">{formatCurrency(p.amount)}</p>
                      <p className="text-[10px] text-muted mt-0.5">{p.method} · {p.paymentDate ? formatDateTime(p.paymentDate) : '-'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">{p.status || 'Success'}</span>
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
        </div>
      </main>

      {(canPay || canCancel) && (
        <div className="border-t border-outline-variant/20 bg-surface-container-lowest/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-6 py-4">
            {canCancel && (
              <button
                type="button"
                onClick={() => onCancelOrder(order._id)}
                className="flex-1 rounded-xl border-2 border-error py-3.5 text-sm font-bold text-error transition hover:bg-error/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Batalkan Pesanan
              </button>
            )}
            {canPay && (
              <button
                type="button"
                onClick={() => onOpenPayment(order._id)}
                className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-on-primary shadow-card transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                Lanjutkan Pembayaran
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
