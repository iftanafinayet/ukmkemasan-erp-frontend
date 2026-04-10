import React from 'react';
import { ModalWrapper, InfoBlock } from '../customer-dashboard/shared';

const ORDER_STEPS = ['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'];

export default function CustomerPortalOrderDetailModal({
  formatCurrency,
  formatDate,
  getStatusLabel,
  onClose,
  order,
}) {
  if (!order) return null;

  return (
    <ModalWrapper onClose={onClose} wide>
      <h3 className="text-2xl font-black tracking-tight text-slate-800">Pesanan #{order.orderNumber}</h3>
      <p className="mb-8 text-sm font-medium text-slate-500">{formatDate(order.createdAt)}</p>

      <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Progress Pesanan</p>
        <div className="overflow-x-auto">
          <div className="flex min-w-[640px] items-center justify-between">
            {ORDER_STEPS.map((status, idx, arr) => {
              const currentIdx = arr.indexOf(order.status);
              const isDone = idx <= currentIdx;
              return (
                <React.Fragment key={status}>
                  <div className="text-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${isDone ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <p className="mt-1 max-w-12 text-[8px] font-bold leading-tight text-slate-400">{getStatusLabel(status)}</p>
                  </div>
                  {idx < arr.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${idx < currentIdx ? 'bg-primary' : 'bg-slate-200'}`} />}
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
    </ModalWrapper>
  );
}
