import React from 'react';
import { InfoBlock, ModalWrapper } from '../shared';

export default function OrderDetailModal({
  formatCurrency,
  formatDate,
  isAdmin,
  isOpen,
  onClose,
  onTogglePaid,
  onUpdateOrderStatus,
  orderStatuses,
  selectedOrder,
  updatingStatus,
}) {
  if (!isOpen || !selectedOrder) return null;

  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Detail Order #{selectedOrder.orderNumber}</h3>
        <p className="text-slate-500 text-sm font-medium">{formatDate(selectedOrder.createdAt)}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <InfoBlock label="Pelanggan" value={selectedOrder.customer?.name} sub={selectedOrder.customer?.email} />
          <InfoBlock label="Produk" value={selectedOrder.product?.name} sub={selectedOrder.product?.category} />
        </div>
        <div className="space-y-4">
          <InfoBlock label="Kuantitas" value={`${selectedOrder.details?.quantity?.toLocaleString()} pcs`} />
          <InfoBlock label="Total Harga" value={formatCurrency(selectedOrder.totalPrice)} highlight />
          <InfoBlock label="Valve" value={selectedOrder.details?.useValve ? 'Ya' : 'Tidak'} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Produksi</p>
          <span className="px-4 py-2 bg-primary/10 rounded-full text-sm font-black text-primary">{selectedOrder.status}</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pembayaran</p>
          <span className={`px-4 py-2 rounded-full text-sm font-black ${selectedOrder.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {selectedOrder.isPaid ? 'Lunas' : 'Belum Bayar'}
          </span>
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi Admin</p>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-2 block">Ubah Status Produksi</label>
            <div className="flex flex-wrap gap-2">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateOrderStatus(selectedOrder._id, status)}
                  disabled={updatingStatus || selectedOrder.status === status}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOrder.status === status ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTogglePaid(selectedOrder._id, !selectedOrder.isPaid)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${selectedOrder.isPaid ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'}`}
          >
            {selectedOrder.isPaid ? 'Tandai Belum Bayar' : 'Tandai Sudah Bayar'}
          </button>
        </div>
      )}
    </ModalWrapper>
  );
}
