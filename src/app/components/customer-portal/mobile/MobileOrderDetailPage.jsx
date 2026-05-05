import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MobileOrderDetailPage({
  order,
  onBack,
  formatCurrency,
  formatDate,
  getStatusLabel,
  onOpenPayment
}) {
  if (!order) return null;
  const canPay = !order.isPaid && ['Quotation', 'Payment'].includes(order.status);

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8ff] flex flex-col animate-in slide-in-from-bottom-full duration-300 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#bbc9c7]/20 bg-white/80 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="flex h-14 items-center justify-between px-4">
          <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[20px] text-[#3c4947]">arrow_back</span>
          </button>
          <span className="font-headline text-[14px] font-bold text-[#131b2e]">Detail Pesanan</span>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        {/* Order Status & ID */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#bbc9c7]/20 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6c7a77] mb-1">Status Pesanan</p>
              <span className="bg-[#4dbace]/10 text-[#4dbace] font-bold px-3 py-1 text-[12px] rounded-lg">
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6c7a77] mb-1">No. Pesanan</p>
              <p className="font-bold text-[#131b2e] text-[14px]">#{order.orderNumber || order._id?.substring(0, 8)}</p>
            </div>
          </div>
          <div className="border-t border-[#bbc9c7]/20 pt-4 flex justify-between items-center">
            <p className="text-[12px] text-[#3c4947] font-bold">Tanggal Pemesanan</p>
            <p className="text-[12px] font-bold text-[#131b2e]">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Product Variant Details */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#bbc9c7]/20 mb-4">
          <h3 className="font-headline text-[14px] font-bold text-[#131b2e] mb-4">Detail Produk & Varian</h3>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-[#f2f3ff] rounded-xl overflow-hidden flex-shrink-0">
               <img src={order.product?.images?.[0]?.url || "https://via.placeholder.com/100"} alt="Produk" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-headline font-bold text-[#131b2e] text-[14px] leading-tight mb-3">{order.product?.name || 'Custom Packaging'}</p>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div>
                  <p className="text-[10px] text-[#6c7a77] uppercase tracking-wider font-bold mb-0.5">Ukuran</p>
                  <p className="text-[12px] font-bold text-[#131b2e]">{order.details?.size || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6c7a77] uppercase tracking-wider font-bold mb-0.5">Warna</p>
                  <p className="text-[12px] font-bold text-[#131b2e]">{order.details?.color || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6c7a77] uppercase tracking-wider font-bold mb-0.5">Material</p>
                  <p className="text-[12px] font-bold text-[#131b2e]">{order.details?.material || order.product?.material || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6c7a77] uppercase tracking-wider font-bold mb-0.5">Kuantitas</p>
                  <p className="text-[12px] font-bold text-[#131b2e]">{order.details?.quantity || order.quantity || 0} pcs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#bbc9c7]/20 mb-4">
           <h3 className="font-headline text-[14px] font-bold text-[#131b2e] mb-4">Rincian Pembayaran</h3>
           <div className="space-y-3 mb-4">
             <div className="flex justify-between items-center text-[12px]">
               <span className="text-[#3c4947]">Harga Satuan</span>
               <span className="font-bold text-[#3c4947]">{formatCurrency((order.totalPrice || order.totalAmount) / (order.details?.quantity || order.quantity || 1))}</span>
             </div>
             <div className="flex justify-between items-center text-[12px]">
               <span className="text-[#3c4947]">Valve Add-on</span>
               <span className="font-bold text-[#3c4947]">{order.details?.useValve ? 'Ya' : 'Tidak'}</span>
             </div>
             <div className="flex justify-between items-center text-[12px]">
               <span className="text-[#3c4947]">Status Pembayaran</span>
               <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-widest ${order.isPaid ? 'bg-[#006b5f]/10 text-[#006b5f]' : 'bg-orange-100 text-orange-600'}`}>{order.isPaid ? 'Lunas' : 'Belum Bayar'}</span>
             </div>
           </div>
           
           <div className="border-t border-[#bbc9c7]/20 pt-4 flex justify-between items-center">
             <span className="font-headline font-bold text-[#131b2e] text-[14px]">Total Bayar</span>
             <span className="font-headline font-bold text-[#4dbace] text-[18px]">{formatCurrency(order.totalPrice || order.totalAmount)}</span>
           </div>
        </div>
      </main>

      {/* Footer Action */}
       {canPay && (
         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#bbc9c7]/20 backdrop-blur-md">
           <button onClick={() => onOpenPayment(order._id)} className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-[#4dbace]/20">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              Lanjutkan Pembayaran
           </button>
         </div>
       )}
    </div>
  );
}
