import React, { useState, useEffect } from 'react';
import { Download, Clock } from 'lucide-react';
import { InfoBlock, ModalWrapper } from '../shared';
import { normalizePaymentHistory, printInvoicePdf } from '../../../utils/phase2';
import api from '../../../utils/api';

export default function OrderDetailModal({
  formatCurrency,
  formatDate,
  formatDateTime,
  isAdmin,
  isOpen,
  onClose,
  onTogglePaid,
  onUpdateOrderStatus,
  orderStatuses,
  selectedOrder,
  updatingStatus,
}) {
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !selectedOrder?._id) return;
    setLogsLoading(true);
    api.get(`/orders/${selectedOrder._id}/logs`)
      .then((res) => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, [isOpen, selectedOrder?._id]);

  if (!isOpen || !selectedOrder) return null;

  const payments = normalizePaymentHistory(selectedOrder);

  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-800">Detail Order #{selectedOrder.orderNumber}</h3>
          <p className="text-sm font-medium text-slate-500">{formatDate(selectedOrder.createdAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => printInvoicePdf({
            order: selectedOrder,
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
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Status Produksi</p>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-black text-primary">{selectedOrder.status}</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Pembayaran</p>
          <span className={`rounded-full px-4 py-2 text-sm font-black ${selectedOrder.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {selectedOrder.isPaid ? 'Lunas' : 'Belum Bayar'}
          </span>
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
                {payment.note && <p className="mt-3 text-xs font-medium text-slate-500">{payment.note}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-400">Belum ada riwayat pembayaran pada order ini.</p>
        )}
      </div>

      <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Activity Log</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {logs.length} events
          </span>
        </div>
        {logsLoading ? (
          <p className="text-sm font-medium text-slate-400">Loading...</p>
        ) : logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="mt-0.5 w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {log.action}
                    {log.oldValue && log.newValue && (
                      <span className="text-xs font-medium text-slate-500">
                        {' '}{log.oldValue} → {log.newValue}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {log.changedBy?.name || 'System'} &middot; {formatDateTime(log.createdAt)}
                  </p>
                  {log.note && <p className="text-xs text-slate-500 mt-1">{log.note}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-400">Belum ada aktivitas tercatat.</p>
        )}
      </div>

      {isAdmin && (
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi Admin</p>
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-600">Ubah Status Produksi</label>
            <div className="flex flex-wrap gap-2">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateOrderStatus(selectedOrder._id, status)}
                  disabled={updatingStatus || selectedOrder.status === status}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${selectedOrder.status === status ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTogglePaid(selectedOrder._id, !selectedOrder.isPaid)}
            className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all ${selectedOrder.isPaid ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-500 text-white shadow-lg hover:bg-green-600'}`}
          >
            {selectedOrder.isPaid ? 'Tandai Belum Bayar' : 'Tandai Sudah Bayar'}
          </button>
        </div>
      )}
    </ModalWrapper>
  );
}
