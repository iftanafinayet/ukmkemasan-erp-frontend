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
      <div className="lg:hidden bg-background min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">lock</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2 font-headline">Login Diperlukan</h2>
        <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
          Silakan login terlebih dahulu untuk melihat daftar pesanan dan riwayat transaksi Anda.
        </p>
        <button
          onClick={() => navigate('/login?redirect=/portal')}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm shadow-card-hover shadow-primary/20 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
    <div className="lg:hidden bg-background min-h-screen">
      <main className="px-4 py-6 pb-24">
        {/* Page Header & Tabs */}
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-on-surface mb-4 font-headline">Pesanan Saya</h2>
          <div className="flex space-x-1 bg-surface-container-low p-1 rounded-xl w-full">
            <button
              onClick={() => setOrderFilter('all')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer ${orderFilter === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-card'
                  : 'text-on-surface-variant'
                }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setOrderFilter('completed')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer ${orderFilter === 'completed'
                  ? 'bg-surface-container-lowest text-primary shadow-card'
                  : 'text-on-surface-variant'
                }`}
            >
              Riwayat
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <h3 className="text-[12px] text-muted uppercase tracking-wider font-bold">
            {orderFilter === 'all' ? 'Pesanan Sedang Diproses' : 'Riwayat Pesanan'}
          </h3>

          {displayedOrders.length > 0 ? displayedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden border border-outline-variant/30"
            >
              <div className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                    <img
                      alt="Produk"
                      src={order.product?.images?.[0]?.url || "https://via.placeholder.com/100"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-[16px] line-clamp-1 font-headline">{order.product?.name || 'Custom Packaging'}</p>
                    <p className="text-on-surface-variant text-[12px]">ID: #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-primary font-bold text-[14px] mt-1">{getStatusLabel(order.status)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-on-surface-variant text-[10px]">Total</p>
                    <p className="font-bold text-primary text-[14px]">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>

                {orderFilter === 'all' && (
                  <div className="bg-primary/10 p-3 rounded-lg flex items-start gap-2 border border-primary/20 mb-4">
                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    <p className="text-[11px] text-on-primary-container">
                      {order.status === 'Production'
                        ? 'Pesanan Anda sedang dalam tahap produksi masal.'
                        : 'Menunggu konfirmasi atau tahap selanjutnya.'}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-surface-container-low px-4 py-2 flex justify-between items-center">
                <button
                  onClick={() => onViewOrder(order._id)}
                  className="text-primary font-bold text-[12px] cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-outline-variant">inventory_2</span>
              <p className="text-on-surface-variant mt-2">Tidak ada pesanan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
