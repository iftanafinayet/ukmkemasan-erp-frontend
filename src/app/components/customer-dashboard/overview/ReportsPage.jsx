import React from 'react';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
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
  LineChart,
  Line,
} from 'recharts';
import { REPORT_CHART_COLORS } from '../constants';
import { EmptyState } from '../shared';
import ReportTooltip from './ReportTooltip';
import { buildReportCharts } from '../phase2-utils';
import { toNumber } from '../utils';

export default function ReportsPage({
  data,
  formatCurrency,
  isAdmin,
}) {
  if (!isAdmin) return <EmptyState text="Halaman ini khusus admin." />;

  const categoryStats = data?.categoryStats || [];
  const valveUsage = data?.valveUsage || {};
  const { categoryPerformance, trendData } = buildReportCharts(data);
  const valveData = [
    { name: 'Dengan Valve', value: valveUsage.withValve || 0 },
    { name: 'Tanpa Valve', value: valveUsage.withoutValve || 0 },
  ];
  const valveColors = ['#22c55e', '#94a3b8'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-slate-100 bg-white p-8">
        <h3 className="mb-2 flex items-center gap-2 font-black text-slate-800">
          <TrendingUp className="h-5 w-5 text-primary" />
          Revenue Trends
        </h3>
        <p className="mb-6 text-xs text-slate-400">Pergerakan omzet dan jumlah pesanan dari data dashboard.</p>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={trendData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
              <YAxis yAxisId="left" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<ReportTooltip formatCurrency={formatCurrency} />} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#0ea5b7" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Belum ada data trend revenue." />
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-black text-slate-800">
              <Activity className="h-5 w-5 text-primary" />
              Performa Kategori
            </h3>
            <p className="text-xs text-slate-400">Ringkasan revenue, pesanan, dan average order value per kategori.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Scroll Horizontal
          </span>
        </div>
        {categoryStats.length > 0 ? (
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4">
              {categoryStats.map((category, index) => (
                <div key={`${category._id}-${index}`} className="w-[280px] flex-shrink-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length] }} />
                      <div>
                        <p className="text-sm font-black text-slate-800">{category._id || 'Tanpa Kategori'}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{toNumber(category.totalOrders).toLocaleString()} pesanan</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-primary">{formatCurrency(toNumber(category.revenue))}</p>
                  </div>
                  <div className="mt-4 space-y-2 text-xs font-bold text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Terjual</span>
                      <span className="text-slate-700">{toNumber(category.totalQtySold).toLocaleString()} pcs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AOV</span>
                      <span className="text-slate-700">{formatCurrency(toNumber(category.avgOrderValue))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState text="Belum ada data kategori." />
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8">
        <h3 className="mb-2 flex items-center gap-2 font-black text-slate-800">
          <BarChart3 className="h-5 w-5 text-primary" />
          Revenue per Kategori
        </h3>
        <p className="mb-6 text-xs text-slate-400">Pendapatan dan volume pesanan antar kategori produk.</p>
        {categoryPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<ReportTooltip formatCurrency={formatCurrency} />} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
              <Bar dataKey="Revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={36} />
              <Bar dataKey="Pesanan" fill="#0ea5b7" radius={[8, 8, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Belum ada data revenue." />
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6">
          <h3 className="mb-6 font-black text-slate-800">Penggunaan Valve</h3>
          {(valveUsage.withValve || valveUsage.withoutValve) ? (
            <div className="inline-flex w-full justify-center rounded-[1.75rem] border border-slate-100 bg-slate-50 px-4 py-5">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={valveData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
            </div>
          ) : (
            <EmptyState text="Belum ada data penggunaan valve." />
          )}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8">
          <h3 className="mb-6 flex items-center gap-2 font-black text-slate-800">
            <DollarSign className="h-5 w-5 text-primary" />
            Average Order Value
          </h3>
          <div className="space-y-3">
            {categoryPerformance.map((category, index) => (
              <div key={`${category.fullName}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length] }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{category.fullName}</p>
                  <p className="text-[10px] text-slate-400">{category.Pesanan} pesanan</p>
                </div>
                <p className="whitespace-nowrap text-sm font-black text-primary">{formatCurrency(category.AOV)}</p>
              </div>
            ))}
            {categoryPerformance.length === 0 && <EmptyState text="Belum ada data AOV." />}
          </div>
        </div>
      </div>
    </div>
  );
}
