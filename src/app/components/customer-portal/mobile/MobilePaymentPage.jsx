import React from 'react';
import { LoaderCircle, CreditCard, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';

export default function MobilePaymentPage({
  loading,
  creatingToken,
  paymentData,
  onPayNow,
  onRefresh,
  onBack
}) {
  const order = paymentData?.order;
  const invoice = paymentData?.invoice;
  const payments = paymentData?.payments || [];
  const summary = paymentData?.paymentSummary;
  const outstandingAmount = Number(summary?.outstandingAmount || 0);
  const isPaid = Boolean(summary?.isPaid);

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8ff] flex flex-col animate-in slide-in-from-right-full duration-300 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#bbc9c7]/20 bg-white/80 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="flex h-14 items-center justify-between px-4">
          <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[20px] text-[#3c4947]">arrow_back</span>
          </button>
          <span className="font-headline text-[14px] font-bold text-[#131b2e]">Pembayaran</span>
          <button onClick={onRefresh} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors active:scale-95">
            <RefreshCw className={`w-4 h-4 text-[#3c4947] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-28">
        {loading && !paymentData ? (
          <div className="flex h-40 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-[#6c7a77]">
              <LoaderCircle className="h-6 w-6 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Memuat data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Invoice & Status */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#bbc9c7]/20 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6c7a77] mb-1">Invoice</p>
                  <p className="font-bold text-[#131b2e] text-[16px]">{invoice?.invoiceNumber || 'Draft'}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isPaid ? 'Lunas' : invoice?.status || 'Menunggu'}
                </div>
              </div>
              <div className="border-t border-[#bbc9c7]/20 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6c7a77] mb-1">Diterbitkan</p>
                  <p className="text-[12px] font-bold text-[#131b2e]">{formatDate(invoice?.issuedDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6c7a77] mb-1">Jatuh Tempo</p>
                  <p className="text-[12px] font-bold text-[#131b2e]">{formatDate(invoice?.dueDate)}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#bbc9c7]/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6c7a77] mb-1">Total Tagihan</p>
                <p className="text-[14px] font-bold text-[#131b2e]">{formatCurrency(summary?.totalAmount)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#bbc9c7]/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6c7a77] mb-1">Sudah Dibayar</p>
                <p className="text-[14px] font-bold text-emerald-600">{formatCurrency(summary?.paidAmount)}</p>
              </div>
            </div>

            {/* Outstanding Amount (Sisa Tagihan) */}
            <div className="bg-[#4dbace] p-5 rounded-2xl shadow-md mb-4 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">Sisa Tagihan</p>
                <p className="text-2xl font-black">{formatCurrency(outstandingAmount)}</p>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 !text-[80px] text-white/10 select-none">payments</span>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#bbc9c7]/20 mb-4">
              <h3 className="font-headline text-[14px] font-bold text-[#131b2e] mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#6c7a77] font-bold">Produk</span>
                  <span className="font-bold text-[#131b2e]">{order?.product?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#6c7a77] font-bold">Jumlah</span>
                  <span className="font-bold text-[#131b2e]">{order?.details?.quantity?.toLocaleString() || 0} pcs</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#6c7a77] font-bold">Material</span>
                  <span className="font-bold text-[#131b2e]">{order?.details?.material || order?.product?.material || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#6c7a77] font-bold">Valve</span>
                  <span className="font-bold text-[#131b2e]">{order?.details?.useValve ? 'Ya' : 'Tidak'}</span>
                </div>
              </div>
            </div>

            {/* Payment Ledger */}
            {payments.length > 0 && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#bbc9c7]/20 mb-4">
                <h3 className="font-headline text-[14px] font-bold text-[#131b2e] mb-4">Riwayat Pembayaran</h3>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment._id || payment.paymentNumber} className="border-b border-[#bbc9c7]/20 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[12px] font-bold text-[#131b2e]">{payment.paymentNumber}</span>
                        <span className="text-[12px] font-bold text-[#4dbace]">{formatCurrency(payment.amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#6c7a77]">{formatDateTime(payment.paymentDate || payment.createdAt)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6c7a77]">{payment.method || 'Payment'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#bbc9c7]/20 backdrop-blur-md pb-[env(safe-area-inset-bottom,16px)]">
        <button
          type="button"
          onClick={onPayNow}
          disabled={creatingToken || isPaid || outstandingAmount <= 0}
          className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold text-[14px] flex justify-center items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-[#4dbace]/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {creatingToken ? (
            <LoaderCircle className="animate-spin h-5 w-5" />
          ) : (
            <CreditCard className="h-5 w-5" />
          )}
          {isPaid ? 'Pesanan Sudah Lunas' : 'Bayar Sekarang'}
        </button>
      </div>
    </div>
  );
}
