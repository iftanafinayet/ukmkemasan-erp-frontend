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
import { buildDashboardNotifications } from '../phase2-utils';
import { toNumber } from '../utils';

function ReportTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
      <p className="font-black text-slate-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'Revenue' ? formatCurrency(toNumber(entry.value)) : toNumber(entry.value).toLocaleString()}
        </p>
      ))}
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ShoppingCart} color="blue" label="Total Pesanan" value={stats.totalOrders} />
        <StatCard icon={Clock} color="amber" label="Sedang Diproduksi" value={stats.activeProduction} border />
        {isAdmin ? (
          <>
            <StatCard icon={DollarSign} color="green" label="Total Omzet" value={formatCurrency(stats.totalRevenue)} border />
            <StatCard icon={Users} color="primary" label="Total Pelanggan" value={stats.totalCustomers} border />
          </>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-primary">
            <p className="text-primary text-[10px] font-black uppercase mb-1">Sistem Aktif</p>
            <h3 className="text-xl font-black text-slate-800">Operational</h3>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            {isAdmin ? (
              <>
                <Award className="w-5 h-5 text-primary" />
                Produk Terlaris
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-primary" />
                Pesanan Terbaru
              </>
            )}
          </h3>
          {isAdmin && data.length > 0 && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Top 5 Performers
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {isAdmin ? (
            data.length > 0 ? (
              <>
                {/* Chart Section */}
                <div className="lg:col-span-7 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <Tooltip
                        content={<ReportTooltip formatCurrency={formatCurrency} />}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar
                        dataKey="Terjual"
                        fill="#4dbace"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#4dbace' : '#94a3b8'}
                            fillOpacity={1 - index * 0.15}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* List Section */}
                <div className="lg:col-span-5 space-y-3">
                  {data.slice(0, 5).map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                          index === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100 group-hover:bg-primary/5 group-hover:text-primary'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      </div>
                      <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-primary">
                        {toNumber(item.totalSold).toLocaleString()} terjual
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="lg:col-span-12">
                <EmptyState text="Belum ada data penjualan." />
              </div>
            )
          ) : (
            <div className="lg:col-span-12 space-y-3">
              {data.length > 0 ? data.map((order) => (
                <div
                  key={order._id}
                  onClick={() => onViewOrder(order._id)}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800">#{order.orderNumber || order._id.slice(-6)}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{order.product?.name || 'Custom Order'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-primary uppercase">{order.status}</span>
                </div>
              )) : <EmptyState text="Belum ada aktivitas pesanan." />}
            </div>
          )}
        </div>
      </div>

       {isAdmin && (
         <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
           <div className="rounded-3xl border border-slate-100 bg-white p-8">
             <div className="mb-6 flex items-center justify-between">
               <h3 className="flex items-center gap-2 font-black text-slate-800">
                 <BellRing className="h-5 w-5 text-primary" />
                 Notification Center
               </h3>
               <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase text-slate-500">
                 {notifications.length} notifikasi
               </span>
             </div>
             {notifications.length > 0 ? (
               <div className="space-y-3">
                 {notifications.map((notification) => (
                   <div
                     key={notification.id}
                     className={`rounded-2xl border p-4 ${
                       notification.tone === 'red'
                         ? 'border-red-100 bg-red-50/60'
                         : notification.tone === 'emerald'
                           ? 'border-emerald-100 bg-emerald-50/60'
                           : 'border-sky-100 bg-sky-50/60'
                     }`}
                   >
                     <p className="text-sm font-black text-slate-800">{notification.title}</p>
                     <p className="mt-1 text-xs font-medium text-slate-500">{notification.description}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                 <p className="text-sm font-medium text-slate-400">Belum ada notifikasi penting.</p>
               </div>
             )}
           </div>

           <div className="rounded-3xl border border-slate-100 bg-white p-8">
             <div className="mb-6 flex items-center justify-between">
               <h3 className="flex items-center gap-2 font-black text-slate-800">
                 <AlertTriangle className="h-5 w-5 text-red-500" />
                 Peringatan Stok Rendah
               </h3>
               <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-black uppercase text-red-600">
                 {lowStockProducts.length} Produk
               </span>
             </div>
             {lowStockProducts.length > 0 ? (
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 {lowStockProducts.slice(0, 6).map((product) => (
                   <div key={product._id} className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/50 p-4">
                     <div>
                       <p className="text-sm font-black text-slate-800">{product.name}</p>
                       <p className="text-[10px] font-bold uppercase text-slate-500">{product.category}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-black text-red-600">{toNumber(product.stockPolos).toLocaleString()} pcs</p>
                       <p className="text-[10px] font-bold uppercase text-red-400">Sisa Stok</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                 <p className="text-sm font-medium text-slate-400">Semua stok dalam kondisi aman.</p>
               </div>
             )}
           </div>
         </div>
       )}

       {isAdmin && adminStats?.productionStatus && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Status Produksi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {adminStats.productionStatus.map((status, index) => (
              <div key={`${status._id}-${index}`} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-2xl font-black text-slate-800">{toNumber(status.count).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{status._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
