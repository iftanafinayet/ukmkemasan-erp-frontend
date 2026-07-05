import React from 'react';
import {
  Award,
  BarChart3,
  Clock,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  BellRing,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatCard, EmptyState } from '../shared';
import { getStatusStyles } from '../../StatusBadge';
import { buildDashboardNotifications } from '../../../utils/phase2';
import { toNumber } from '../utils';

function ReportTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-card border border-outline-variant">
      <p className="font-black text-on-surface text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'Revenue' ? formatCurrency(toNumber(entry.value)) : toNumber(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function StatusBadgeCustom({ label, count }) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${getStatusStyles(label)}`}>
      <p className="text-2xl font-black">{count}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage({
  adminStats,
  data,
  formatCurrency,
  isAdmin,
  onViewOrder,
  stats,
  lowStockProducts = [],
}) {
  const chartData = isAdmin && Array.isArray(data) ? data.slice(0, 5).map((item) => ({
    name: item.name?.length > 15 ? `${item.name.slice(0, 15)}...` : (item.name || 'Produk'),
    fullName: item.name || 'Produk',
    Terjual: item.totalSold || 0,
  })) : [];
  const notifications = buildDashboardNotifications({ adminStats, lowStockProducts });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard neumo icon={ShoppingCart} color="info" label="Total Pesanan" value={stats.totalOrders} />
        {isAdmin ? (
          <>
            <StatCard neumo icon={DollarSign} color="success" label="Total Omzet" value={formatCurrency(stats.totalRevenue)} />
            <StatCard neumo icon={Users} color="primary" label="Total Pelanggan" value={stats.totalCustomers} />
            <StatCard neumo icon={Clock} color="warning" label="Sedang Diproduksi" value={stats.activeProduction} />
          </>
        ) : (
          <StatCard neumo icon={Clock} color="primary" label="Status" value="Operational" />
        )}
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-on-surface flex items-center gap-2">
            {isAdmin ? (
              <><Award className="w-5 h-5 text-primary" /> Produk Terlaris</>
            ) : (
              <><Clock className="w-5 h-5 text-primary" /> Pesanan Terbaru</>
            )}
          </h3>
          {isAdmin && data.length > 0 && (
            <p className="text-[10px] font-black text-muted uppercase tracking-widest bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant">
              Top 5 Performers
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {isAdmin ? (
            data.length > 0 ? (
              <>
                <div className="lg:col-span-7 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip content={<ReportTooltip formatCurrency={formatCurrency} />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="Terjual" fill="#4dbace" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#4dbace' : '#94a3b8'} fillOpacity={1 - index * 0.15} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="lg:col-span-5 space-y-3">
                  {data.slice(0, 5).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant hover:border-primary/30 transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-200 ${
                          index === 0 ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-lowest text-muted border border-outline-variant group-hover:bg-primary/5 group-hover:text-primary'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-on-surface text-sm">{item.name}</span>
                      </div>
                      <span className="px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-full text-[10px] font-black text-primary">
                        {toNumber(item.totalSold).toLocaleString()} terjual
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="lg:col-span-12"><EmptyState text="Belum ada data penjualan." /></div>
            )
          ) : (
            <div className="lg:col-span-12 space-y-3">
              {data.length > 0 ? data.map((order) => (
                <div key={order._id} onClick={() => onViewOrder(order._id)} className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant hover:border-primary/30 transition-all duration-200 cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container-lowest rounded-xl border border-outline-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-200">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-on-surface">#{order.orderNumber || order._id.slice(-6)}</span>
                      <p className="text-[10px] text-muted font-bold uppercase">{order.product?.name || 'Custom Order'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-full text-[10px] font-black text-primary uppercase">{order.status}</span>
                </div>
              )) : <EmptyState text="Belum ada aktivitas pesanan." />}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-black text-on-surface">
                <BellRing className="h-5 w-5 text-primary" />
                Notification Center
              </h3>
              <span className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-[10px] font-black uppercase text-on-surface-variant">
                {notifications.length} notifikasi
              </span>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className={`rounded-2xl border p-4 ${n.tone === 'red' ? 'border-error/20 bg-error-container/60' : n.tone === 'emerald' ? 'border-success/20 bg-success-container/60' : 'border-info/20 bg-info-container/60'}`}>
                    <p className="text-sm font-black text-on-surface">{n.title}</p>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">{n.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant py-8 text-center">
                <p className="text-sm font-medium text-muted">Belum ada notifikasi penting.</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-black text-on-surface">
                <AlertTriangle className="h-5 w-5 text-error" />
                Peringatan Stok Rendah
              </h3>
              <span className="rounded-full border border-error/20 bg-error-container px-3 py-1 text-[10px] font-black uppercase text-on-error-container">
                {lowStockProducts.length} Produk
              </span>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {lowStockProducts.slice(0, 6).map((p) => (
                  <div key={p._id} className="flex items-center justify-between rounded-2xl border border-error/20 bg-error-container/50 p-4">
                    <div>
                      <p className="text-sm font-black text-on-surface">{p.name}</p>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-error">{toNumber(p.stockPolos).toLocaleString()} pcs</p>
                      <p className="text-[10px] font-bold uppercase text-error">Sisa Stok</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant py-8 text-center">
                <p className="text-sm font-medium text-muted">Semua stok dalam kondisi aman.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isAdmin && adminStats?.productionStatus && (
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-card">
          <h3 className="font-black text-on-surface mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Pipeline Produksi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'].map((stage) => {
              const item = adminStats.productionStatus?.find((s) => s._id === stage);
              return <StatusBadgeCustom key={stage} label={stage} count={item?.count || 0} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
