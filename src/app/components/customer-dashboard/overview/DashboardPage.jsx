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
    <div className={`rounded-xl border p-2.5 text-center ${getStatusStyles(label)}`}>
      <p className="text-lg font-black">{count}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{label}</p>
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
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h3 className="font-black text-on-surface text-sm flex items-center gap-2">
            {isAdmin ? (
              <><Award className="w-4 h-4 text-primary" /> Produk Terlaris</>
            ) : (
              <><Clock className="w-4 h-4 text-primary" /> Pesanan Terbaru</>
            )}
          </h3>
          {isAdmin && data.length > 0 && (
            <p className="text-[9px] font-black text-muted uppercase tracking-widest bg-surface-container-low px-2 py-0.5 rounded-full border border-outline-variant">
              Top 5 Performers
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {isAdmin ? (
            data.length > 0 ? (
              <>
                <div className="lg:col-span-7 h-[220px] sm:h-[260px]">
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
                <div className="lg:col-span-5 space-y-2">
                  {data.slice(0, 5).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex justify-between items-center p-2.5 bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary/30 transition-all duration-200 group">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] transition-all duration-200 ${
                          index === 0 ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-surface-container-lowest text-muted border border-outline-variant group-hover:bg-primary/5 group-hover:text-primary'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-on-surface text-xs truncate max-w-[120px] sm:max-w-none">{item.name}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-surface-container-lowest border border-outline-variant rounded-full text-[9px] font-black text-primary whitespace-nowrap">
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
            <div className="lg:col-span-12 space-y-2">
              {data.length > 0 ? data.map((order) => (
                <div key={order._id} onClick={() => onViewOrder(order._id)} className="flex justify-between items-center p-2.5 bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary/30 transition-all duration-200 cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-lowest rounded-lg border border-outline-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-200">
                      <ShoppingCart size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-on-surface">#{order.orderNumber || order._id.slice(-6)}</span>
                      <p className="text-[9px] text-muted font-bold uppercase">{order.product?.name || 'Custom Order'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-surface-container-lowest border border-outline-variant rounded-full text-[9px] font-black text-primary uppercase">{order.status}</span>
                </div>
              )) : <EmptyState text="Belum ada aktivitas pesanan." />}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-black text-on-surface text-sm">
                <BellRing className="h-4 w-4 text-primary" />
                Notification Center
              </h3>
              <span className="rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 text-[9px] font-black uppercase text-on-surface-variant">
                {notifications.length} notifikasi
              </span>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className={`rounded-xl border p-3 text-sm ${n.tone === 'red' ? 'border-error/20 bg-error-container/60' : n.tone === 'emerald' ? 'border-success/20 bg-success-container/60' : 'border-info/20 bg-info-container/60'}`}>
                    <p className="text-xs font-black text-on-surface">{n.title}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-on-surface-variant">{n.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-outline-variant py-6 text-center">
                <p className="text-xs font-medium text-muted">Belum ada notifikasi penting.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-black text-on-surface text-sm">
                <AlertTriangle className="h-4 w-4 text-error" />
                Peringatan Stok Rendah
              </h3>
              <span className="rounded-full border border-error/20 bg-error-container px-2 py-0.5 text-[9px] font-black uppercase text-on-error-container">
                {lowStockProducts.length} Produk
              </span>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {lowStockProducts.slice(0, 6).map((p) => (
                  <div key={p._id} className="flex items-center justify-between rounded-xl border border-error/20 bg-error-container/50 p-3">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-black text-on-surface truncate">{p.name}</p>
                      <p className="text-[9px] font-bold uppercase text-on-surface-variant">{p.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-error">{toNumber(p.stockPolos).toLocaleString()} pcs</p>
                      <p className="text-[9px] font-bold uppercase text-error">Sisa Stok</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-outline-variant py-6 text-center">
                <p className="text-xs font-medium text-muted">Semua stok dalam kondisi aman.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isAdmin && adminStats?.productionStatus && (
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-card">
          <h3 className="font-black text-on-surface text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Pipeline Produksi
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
