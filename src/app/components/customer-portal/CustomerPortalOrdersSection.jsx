import React from 'react';
import { EmptyState } from '../customer-dashboard/shared';

const getFirstItemName = (order) => {
  if (order.items && order.items.length > 0) {
    const first = order.items[0];
    return first.product?.name || first.sku || 'Produk';
  }
  return order.product?.name || 'Produk Custom';
};

const getFirstItemImage = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items[0].product?.images?.[0]?.url || null;
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

const getStatusChip = (status) => {
  if (['Quotation', 'Payment'].includes(status)) return 'bg-amber-100 text-amber-700';
  if (['Production', 'Quality Control'].includes(status)) return 'bg-blue-100 text-blue-700';
  if (status === 'Shipping') return 'bg-primary/10 text-primary';
  if (status === 'Completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Cancelled') return 'bg-red-100 text-red-600';
  return 'bg-surface-container-high text-on-surface-variant';
};

const getStatusDot = (status) => {
  if (['Quotation', 'Payment'].includes(status)) return 'bg-amber-500';
  if (['Production', 'Quality Control'].includes(status)) return 'bg-blue-500';
  if (status === 'Shipping') return 'bg-primary';
  if (status === 'Completed') return 'bg-emerald-500';
  if (status === 'Cancelled') return 'bg-red-500';
  return 'bg-gray-400';
};

const FILTERS = [
  { id: 'all', label: 'Semua Pesanan' },
  { id: 'payment', label: 'Payment' },
  { id: 'production', label: 'Production' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

export default function CustomerPortalOrdersSection({
  orders,
  orderFilter,
  setOrderFilter,
  getStatusLabel,
  formatCurrency,
  onNavigateToCreateOrder,
  onViewOrder,
  onNavigateToPayment,
  onCancelOrder,
}) {
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'payment') return ['Quotation', 'Payment'].includes(order.status);
    if (orderFilter === 'production') return ['Production', 'Quality Control', 'Shipping'].includes(order.status);
    if (orderFilter === 'completed') return order.status === 'Completed';
    if (orderFilter === 'cancelled') return order.status === 'Cancelled';
    return true;
  });

  const countFor = (id) => orders.filter((order) => {
    if (id === 'all') return true;
    if (id === 'payment') return ['Quotation', 'Payment'].includes(order.status);
    if (id === 'production') return ['Production', 'Quality Control', 'Shipping'].includes(order.status);
    if (id === 'completed') return order.status === 'Completed';
    if (id === 'cancelled') return order.status === 'Cancelled';
    return true;
  }).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-primary font-bold text-[11px] uppercase tracking-[0.2em] mb-1 block">Track Your Progress</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface font-headline">Pesanan Saya</h1>
        </div>
        <button
          type="button"
          onClick={onNavigateToCreateOrder}
          className="flex items-center justify-center gap-2 bg-primary px-5 py-3 rounded-xl text-on-primary text-sm font-bold shadow-card-hover shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Buat Pesanan
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 overflow-hidden">
            <h3 className="px-5 pt-5 pb-2 text-[10px] font-black uppercase tracking-widest text-muted">Filter Status</h3>
            <div className="flex flex-col p-2">
              {FILTERS.map((f) => {
                const isActive = f.id === orderFilter;
                return (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isActive ? 'bg-primary text-white shadow-card shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {f.label}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {countFor(f.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 p-5 hidden lg:block">
            <h3 className="font-headline text-[15px] font-bold text-on-surface mb-1">Butuh Bantuan?</h3>
            <p className="text-[13px] text-on-surface-variant mb-4 leading-relaxed">Hubungi admin untuk pertanyaan mengenai produksi pesanan Anda.</p>
            <a
              href="https://wa.me/6281226733221"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/15 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              WhatsApp Admin
            </a>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-8 space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'Completed';
            const isPending = ['Quotation', 'Payment'].includes(order.status);
            const orderDate = new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const itemCount = order.items?.length || 1;
            const firstImage = getFirstItemImage(order);
            const firstName = getFirstItemName(order);
            const totalQty = getOrderQuantity(order);
            const material = getOrderMaterial(order);

            return (
              <article
                key={order._id}
                onClick={() => onViewOrder(order._id)}
                className="cursor-pointer bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/20 p-3.5 transition-all hover:shadow-card-hover active:scale-[0.99]"
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${getStatusChip(order.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                    {getStatusLabel(order.status)}
                  </div>
                  <span className="text-primary font-black text-[14px]">{formatCurrency(order.totalPrice)}</span>
                </div>

                {/* Body */}
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-surface-container-low overflow-hidden shrink-0 border border-outline-variant/20">
                    {firstImage ? (
                      <img src={firstImage} alt={firstName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted"><span className="material-symbols-outlined text-[20px]">image</span></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[14px] font-bold text-on-surface font-headline leading-tight line-clamp-1">
                      {firstName}
                      {itemCount > 1 && <span className="text-primary font-semibold"> +{itemCount - 1} lainnya</span>}
                    </h2>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{totalQty.toLocaleString()} pcs {material && `• ${material}`}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted">
                      <span>#{order.orderNumber || order._id.slice(-6)}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span>{orderDate}</span>
                      {order.orderType === 'Sample' && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">Sample</span>}
                      {order.isPaid && <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5"><span className="material-symbols-outlined text-[11px]">check</span>Lunas</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-3">
                  {isPending ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); onCancelOrder?.(order._id); }} className="px-3.5 py-1.5 rounded-full border border-error text-error text-[11px] font-bold hover:bg-error/5 transition-colors">Batalkan</button>
                      <button onClick={(e) => { e.stopPropagation(); onNavigateToPayment(order._id); }} className="px-4 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-colors">Bayar Sekarang</button>
                    </>
                  ) : isCompleted ? (
                    <button onClick={(e) => { e.stopPropagation(); onNavigateToCreateOrder(); }} className="px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold hover:bg-surface-container-highest transition-colors">Pesan Lagi</button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); onViewOrder(order._id); }} className="px-4 py-1.5 rounded-full border border-primary text-primary text-[11px] font-bold hover:bg-primary/5 transition-colors">Detail Progress</button>
                  )}
                </div>
              </article>
            );
          })}
          {filteredOrders.length === 0 && <EmptyState text="Belum ada pesanan." />}
        </div>
      </div>
    </div>
  );
}
