import React from 'react';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { REPORT_CHART_COLORS } from '../constants';
import { EmptyState } from '../shared';
import ReportTooltip from './ReportTooltip';

export default function ReportsPage({
  data,
  formatCurrency,
  isAdmin,
}) {
  if (!isAdmin) return <EmptyState text="Halaman ini khusus admin." />;

  const categoryStats = data?.categoryStats || [];
  const valveUsage = data?.valveUsage || {};
  const chartData = categoryStats.map((category) => ({
    name: category._id?.length > 12 ? `${category._id.slice(0, 12)}...` : category._id,
    fullName: category._id,
    Revenue: category.revenue,
    Pesanan: category.totalOrders,
    Terjual: category.totalQtySold,
    avgOrderValue: category.avgOrderValue,
  }));
  const valveData = [
    { name: 'Dengan Valve', value: valveUsage.withValve || 0 },
    { name: 'Tanpa Valve', value: valveUsage.withoutValve || 0 },
  ];
  const valveColors = ['#22c55e', '#94a3b8'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Revenue per Kategori
        </h3>
        <p className="text-xs text-slate-400 mb-6">Pendapatan dari setiap kategori produk kemasan</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<ReportTooltip formatCurrency={formatCurrency} />} />
              <Bar dataKey="Revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Belum ada data revenue." />
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Volume Penjualan
        </h3>
        <p className="text-xs text-slate-400 mb-6">Jumlah unit terjual per kategori</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={80} />
              <Tooltip content={<ReportTooltip formatCurrency={formatCurrency} />} />
              <Bar dataKey="Terjual" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Belum ada data penjualan." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-6">Penggunaan Valve</h3>
          {(valveUsage.withValve || valveUsage.withoutValve) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={valveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {valveData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={valveColors[index]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                <Tooltip formatter={(value) => [`${value} pesanan`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-3xl font-black text-green-600">0</p>
                <p className="text-xs font-bold text-green-500 uppercase mt-2">Dengan Valve</p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-3xl font-black text-slate-600">0</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-2">Tanpa Valve</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Ringkasan Kategori
          </h3>
          <div className="space-y-3">
            {categoryStats.map((category, index) => (
              <div key={`${category._id}-${index}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{category._id}</p>
                  <p className="text-[10px] text-slate-400">{category.totalOrders} pesanan</p>
                </div>
                <p className="font-black text-primary text-sm whitespace-nowrap">{formatCurrency(category.revenue)}</p>
              </div>
            ))}
            {categoryStats.length === 0 && <EmptyState text="Belum ada data." />}
          </div>
        </div>
      </div>
    </div>
  );
}
