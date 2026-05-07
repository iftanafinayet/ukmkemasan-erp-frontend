import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';

export default function MobileOrdersPage({
  orders,
  orderFilter,
  setOrderFilter,
  onViewOrder,
  getStatusLabel
}) {
  const navigate = useNavigate();
  const isLoggedIn = !!storage.getToken();

  if (!isLoggedIn) {
    return (
      <div className="lg:hidden bg-[#faf8ff] min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-[#4dbace]/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[#4dbace] text-4xl">lock</span>
        </div>
        <h2 className="text-xl font-bold text-[#131b2e] mb-2 font-headline">Login Diperlukan</h2>
        <p className="text-[#3c4947] text-sm mb-8 leading-relaxed">
          Silakan login terlebih dahulu untuk melihat daftar pesanan dan riwayat transaksi Anda.
        </p>
        <button
          onClick={() => navigate('/login?redirect=/portal')}
          className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#4dbace]/20 active:scale-95 transition-transform"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  const activeOrders = orders.filter(o => ['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping'].includes(o.status));
  const historyOrders = orders.filter(o => o.status === 'Completed');

  const displayedOrders = orderFilter === 'all' ? activeOrders : historyOrders;

  return (
    <div className="lg:hidden bg-[#faf8ff] min-h-screen">
      <main className="px-4 py-6 pb-24">
        {/* Page Header & Tabs */}
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-[#131b2e] mb-4 font-headline">Pesanan Saya</h2>
          <div className="flex space-x-1 bg-[#eaedff] p-1 rounded-xl w-full">
            <button
              onClick={() => setOrderFilter('all')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${orderFilter === 'all'
                  ? 'bg-white text-[#4dbace] shadow-sm'
                  : 'text-[#3c4947]'
                }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setOrderFilter('completed')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${orderFilter === 'completed'
                  ? 'bg-white text-[#4dbace] shadow-sm'
                  : 'text-[#3c4947]'
                }`}
            >
              Riwayat
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <h3 className="text-[12px] text-[#6c7a77] uppercase tracking-wider font-bold">
            {orderFilter === 'all' ? 'Pesanan Sedang Diproses' : 'Riwayat Pesanan'}
          </h3>

          {displayedOrders.length > 0 ? displayedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#bbc9c7]/30"
            >
              <div className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#f2f3ff] flex-shrink-0">
                    <img
                      alt="Produk"
                      src={order.product?.images?.[0]?.url || "https://via.placeholder.com/100"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#131b2e] text-[16px] line-clamp-1 font-headline">{order.product?.name || 'Custom Packaging'}</p>
                    <p className="text-[#3c4947] text-[12px]">ID: #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-[#4dbace] font-bold text-[14px] mt-1">{getStatusLabel(order.status)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#3c4947] text-[10px]">Total</p>
                    <p className="font-bold text-[#4dbace] text-[14px]">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>

                {orderFilter === 'all' && (
                  <div className="bg-[#4dbace]/10 p-3 rounded-lg flex items-start gap-2 border border-[#4dbace]/20 mb-4">
                    <span className="material-symbols-outlined text-[#4dbace] text-[20px]">info</span>
                    <p className="text-[11px] text-[#005750]">
                      {order.status === 'Production'
                        ? 'Pesanan Anda sedang dalam tahap produksi masal.'
                        : 'Menunggu konfirmasi atau tahap selanjutnya.'}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-[#f2f3ff] px-4 py-2 flex justify-between items-center">
                <button
                  onClick={() => onViewOrder(order._id)}
                  className="text-[#4dbace] font-bold text-[12px]"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-[#bbc9c7]">inventory_2</span>
              <p className="text-[#3c4947] mt-2">Tidak ada pesanan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
