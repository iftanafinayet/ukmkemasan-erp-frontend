import React from 'react';
import { EmptyState } from '../customer-dashboard/shared';

const getOrderItems = (order) => {
  if (order.items && order.items.length > 0) return order.items;
  if (order.product) return [order.product];
  return [];
};

const getFirstItemName = (order) => {
  if (order.items && order.items.length > 0) {
    const first = order.items[0];
    return first.product?.name || first.sku || 'Produk';
  }
  return order.product?.name || 'Produk Custom';
};

const getFirstItemImage = (order) => {
  if (order.items && order.items.length > 0) {
    const first = order.items[0];
    return first.product?.images?.[0]?.url || null;
  }
  return order.product?.images?.[0]?.url || null;
};

const getOrderQuantity = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }
  return order.details?.quantity || 0;
};

const getOrderMaterial = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items[0]?.material || '';
  }
  return order.product?.material || '';
};

export default function CustomerPortalOrdersSection({
  orders,
  orderFilter,
  setOrderFilter,
  getStatusLabel,
  formatCurrency,
  onNavigateToCreateOrder,
  onViewOrder,
  onNavigateToPayment,
  onCancelOrder
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block font-label">Track Your Progress</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface font-headline">Pesanan Saya</h1>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-on-secondary-container text-sm font-medium">Total Pesanan:</span>
            <span className="bg-primary text-white px-2 py-0.5 rounded-full text-xs font-bold">{orders.length}</span>
          </div>
          <button
            type="button"
            onClick={onNavigateToCreateOrder}
            className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg text-white text-sm font-bold shadow-md hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">add</span> Buat
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)]">
            <h3 className="font-extrabold text-sm uppercase tracking-widest mb-6 text-on-surface/40 font-headline">Tracker App</h3>
            <div className="space-y-3">
              {[
                { id: 'all', label: 'Semua Pesanan' },
                { id: 'payment', label: 'Payment' },
                { id: 'production', label: 'Production' },
                { id: 'completed', label: 'Completed' }
              ].map(statusBtn => {
                const isActive = statusBtn.id === orderFilter;
                return (
                  <button
                    key={statusBtn.id}
                    onClick={() => setOrderFilter(statusBtn.id)}
                    className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    {statusBtn.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden group hidden lg:block">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2 font-headline">Butuh Bantuan?</h3>
              <p className="text-primary-fixed text-sm mb-4 leading-relaxed font-body">Hubungi admin untuk pertanyaan mengenai produksi.</p>
              <button className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">WhatsApp Admin</button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined !text-9xl">support_agent</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
          {orders
            .filter(order => {
              if (orderFilter === 'all') return true;
              if (orderFilter === 'payment') return ['Quotation', 'Payment'].includes(order.status);
              if (orderFilter === 'production') return ['Production', 'Quality Control', 'Shipping'].includes(order.status);
              if (orderFilter === 'completed') return order.status === 'Completed';
              return true;
            })
            .map((order) => {
            const isCompleted = order.status === 'Completed';
            const isPending = order.status === 'Quotation' || order.status === 'Payment';
            const orderDate = new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const items = getOrderItems(order);
            const itemCount = order.items?.length || 1;
            const firstImage = getFirstItemImage(order);
            const firstName = getFirstItemName(order);
            const totalQty = getOrderQuantity(order);
            const material = getOrderMaterial(order);

            return (
              <article key={order._id} onClick={() => onViewOrder(order._id)} className={`cursor-pointer group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)] transition-opacity ${isCompleted ? 'opacity-80 hover:opacity-100' : ''}`}>
                <div className="bg-surface-container-high px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary tracking-wider">#{order.orderNumber || order._id.slice(-6)}</span>
                    <span className="text-xs text-on-secondary-container bg-surface-container-highest px-3 py-1 rounded-full font-bold">{orderDate}</span>
                    {order.orderType === 'Sample' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Sample</span>}
                    {itemCount > 1 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{itemCount} item</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`material-symbols-outlined text-sm ${isCompleted ? 'text-green-600' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                       {isCompleted ? 'check_circle' : 'schedule'}
                     </span>
                     <span className={`text-sm font-bold ${isCompleted ? 'text-green-600' : 'text-primary'}`}>Status: {getStatusLabel(order.status)}</span>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 cursor-pointer">
                    <div className={`w-24 h-24 rounded-lg bg-surface-container overflow-hidden shrink-0 shadow-sm border border-outline-variant/10 ${isCompleted ? 'grayscale opacity-80' : ''}`}>
                      {firstImage ? (
                        <img src={firstImage} alt={firstName} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-primary/30"><span className="material-symbols-outlined">image</span></div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl md:text-2xl font-bold mb-1 text-on-surface font-headline">
                        {firstName}
                        {itemCount > 1 && <span className="text-base font-medium text-on-secondary-container"> +{itemCount - 1} lainnya</span>}
                      </h2>
                      <p className="text-on-secondary-container text-sm mb-4">{totalQty.toLocaleString()} pcs {material && `• ${material}`}</p>
                      <div className="flex flex-wrap gap-8">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-on-secondary-container mb-1 font-label">Total</p>
                          <p className="text-lg font-extrabold text-on-surface font-headline">{formatCurrency(order.totalPrice)}</p>
                        </div>
                        {order.isPaid && (
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-on-secondary-container mb-1 font-label">Payment</p>
                            <p className="text-sm font-bold text-green-600 flex items-center gap-1 font-body"><span className="material-symbols-outlined text-xs">check</span> Lunas</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end shrink-0 gap-2">
                       {isPending ? (
                         <>
                          <button onClick={(e) => { e.stopPropagation(); onCancelOrder?.(order._id); }} className="px-4 py-2.5 rounded-full border-2 border-error text-error text-xs font-bold hover:bg-error/5 transition-colors">Batalkan</button>
                          <button onClick={(e) => { e.stopPropagation(); onNavigateToPayment(order._id); }} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">Bayar Sekarang</button>
                         </>
                       ) : isCompleted ? (
                          <button onClick={(e) => { e.stopPropagation(); onNavigateToCreateOrder(); }} className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-secondary-container text-sm font-bold hover:bg-surface-container-highest transition-colors">Pesan Lagi</button>
                       ) : (
                          <button onClick={(e) => { e.stopPropagation(); onViewOrder(order._id); }} className="px-6 py-2.5 rounded-full border-2 border-primary text-primary text-sm font-bold hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all">Detail Progress</button>
                       )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {orders.length === 0 && <EmptyState text="Belum ada pesanan." />}
        </div>
      </div>
    </div>
  );
}
