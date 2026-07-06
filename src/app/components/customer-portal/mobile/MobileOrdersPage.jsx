import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';
import useScrollToTop from '../../../hooks/useScrollToTop';

export default function MobileOrdersPage({
  orders,
  orderFilter,
  setOrderFilter,
  onViewOrder,
  getStatusLabel
}) {
  useScrollToTop();
  const navigate = useNavigate();
  const isLoggedIn = !!storage.getToken();
  const user = storage.getUser();

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

  const displayedOrders = orders.filter(order => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'payment') return ['Quotation', 'Payment'].includes(order.status);
    if (orderFilter === 'production') return ['Production', 'Quality Control', 'Shipping'].includes(order.status);
    if (orderFilter === 'completed') return order.status === 'Completed';
    if (orderFilter === 'cancelled') return order.status === 'Cancelled';
    return true;
  });

  const getFilterCount = (filterId) => {
    return orders.filter(order => {
      if (filterId === 'all') return true;
      if (filterId === 'payment') return ['Quotation', 'Payment'].includes(order.status);
      if (filterId === 'production') return ['Production', 'Quality Control', 'Shipping'].includes(order.status);
      if (filterId === 'completed') return order.status === 'Completed';
      if (filterId === 'cancelled') return order.status === 'Cancelled';
      return true;
    }).length;
  };

  const tabs = [
    { id: 'all', label: 'Semua Pesanan' },
    { id: 'payment', label: 'Payment' },
    { id: 'production', label: 'Production' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Dibatalkan' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '1 Jan 2026';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    if (['Quotation', 'Payment'].includes(status)) return 'text-orange-500 bg-orange-50';
    if (['Production', 'Quality Control'].includes(status)) return 'text-blue-500 bg-blue-50';
    if (status === 'Shipping') return 'text-primary bg-primary/10';
    if (status === 'Completed') return 'text-green-500 bg-green-50';
    if (status === 'Cancelled') return 'text-red-500 bg-red-50';
    return 'text-gray-500 bg-gray-50';
  };

  const getStatusDotColor = (status) => {
    if (['Quotation', 'Payment'].includes(status)) return 'bg-orange-500';
    if (['Production', 'Quality Control'].includes(status)) return 'bg-blue-500';
    if (status === 'Shipping') return 'bg-primary';
    if (status === 'Completed') return 'bg-green-500';
    if (status === 'Cancelled') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="lg:hidden bg-gradient-to-b from-primary/5 to-background h-[100dvh] flex flex-col">
      <main className="flex-1 flex flex-col min-h-0 px-5 pt-6">
        {/* Page Header */}
        <div className="mb-6 shrink-0">
          <h2 className="text-[28px] font-black text-on-surface mb-1">My Orders</h2>
          <p className="text-on-surface-variant text-sm">{orders.length} order total</p>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2 -mx-5 px-5 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOrderFilter(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${orderFilter === tab.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface-container-low text-on-surface-variant'
                }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${orderFilter === tab.id ? 'bg-white/20' : 'bg-on-surface-variant/10'}`}>
                {getFilterCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pb-24">
          {displayedOrders.length > 0 ? displayedOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => onViewOrder(order._id)}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-center mb-2.5">
                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(order.status)}`}></span>
                  {getStatusLabel(order.status)}
                </div>
                <div className="text-primary font-black text-[14px]">
                  {formatCurrency(order.totalPrice)}
                </div>
              </div>

              <div className="mb-2.5">
                {order.items?.length > 0 ? (
                  <>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-0.5 leading-tight line-clamp-1">
                      {order.items[0].product?.name || 'Produk'}
                      {order.items.length > 1 && (
                        <span className="text-primary font-semibold"> +{order.items.length - 1} produk lainnya</span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-[12px]">
                      {order.shipping?.recipient?.name || user?.name || 'UKM Kemasan'}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-0.5 leading-tight line-clamp-1">
                      {order.product?.name || 'Custom Packaging'}
                    </h3>
                    <p className="text-gray-500 text-[12px]">
                      {order.shipping?.recipient?.name || user?.name || 'UKM Kemasan'}
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-gray-50">
                <div className="text-gray-400 text-[11px] font-medium">
                  {formatDate(order.createdAt)}
                </div>
                <div className="text-gray-400 text-[11px] font-semibold flex items-center gap-1">
                  {order.items?.length > 0
                    ? `${order.items.length} Produk`
                    : `${(order.quantity || order.details?.quantity || 1).toLocaleString()} pcs`} • #{order._id.slice(-6).toUpperCase()}
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 bg-white rounded-[24px] border border-gray-100">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">inventory_2</span>
              <p className="text-gray-500 font-medium">Tidak ada pesanan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
