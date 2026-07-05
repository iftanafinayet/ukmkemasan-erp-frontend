import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Layers,
  Loader2,
  Package,
  RefreshCw,
} from 'lucide-react';
import { toNumber } from '../utils';
import { filterStockCardRows } from '../../../utils/phase2';

export default function StockCardPage({
  formatDate,
  formatDateTime,
  onRefresh,
  onSelectProduct,
  products,
  stockCardLoading,
  stockCardProductId,
  stockCardRows,
}) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    refType: 'all',
  });
  const stockProducts = Array.isArray(products) ? products : [];
  const selectedProduct = stockProducts.find((product) => product._id === stockCardProductId);
  const filteredRows = useMemo(() => filterStockCardRows(stockCardRows, filters), [filters, stockCardRows]);
  const totalIn = Array.isArray(filteredRows) ? filteredRows.reduce((sum, row) => sum + toNumber(row.qtyIn), 0) : 0;
  const totalOut = Array.isArray(filteredRows) ? filteredRows.reduce((sum, row) => sum + toNumber(row.qtyOut), 0) : 0;
  const latestMutation = Array.isArray(filteredRows) && filteredRows.length > 0 ? (filteredRows[0]?.date || filteredRows[filteredRows.length - 1]?.date) : null;
  const refTypeOptions = Array.from(new Set((Array.isArray(stockCardRows) ? stockCardRows : []).map((row) => row.refType).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/30 shadow-card overflow-hidden">
        <div className="px-8 py-7 border-b border-outline-variant/30 bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-cyan-50">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest/90 border border-outline-variant text-[10px] font-black uppercase tracking-[0.24em] text-on-surface-variant mb-4">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Stock Card
              </div>
              <h3 className="text-2xl font-bold text-on-surface tracking-tight">Histori mutasi stok yang lebih rapi dan terbaca.</h3>
              <p className="text-sm text-on-surface-variant font-medium mt-2">
                Pilih produk untuk melihat pergerakan stok masuk, keluar, dan saldo akhirnya secara kronologis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[380px]">
              <div className="relative flex-1">
                <select
                  value={stockCardProductId}
                  onChange={(event) => onSelectProduct(event.target.value)}
                  className="appearance-none w-full px-5 pr-11 py-4 bg-surface-container-lowest border border-outline-variant rounded-2xl font-bold text-sm text-on-surface outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                >
                  <option value="">Pilih produk...</option>
                  {stockProducts.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} {product.sku ? `(${product.sku})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => onRefresh(stockCardProductId)}
                disabled={!stockCardProductId || stockCardLoading}
                className="px-5 py-4 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.22em] shadow-card-hover shadow-slate-200 disabled:opacity-50 disabled:shadow-none cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              >
                {stockCardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Muat Ulang
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1fr_1.4fr]">
            <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-low p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Produk</p>
                <Package className="w-4 h-4 text-muted" />
              </div>
              <p className="text-lg font-bold text-on-surface leading-tight">{selectedProduct?.name || 'Belum dipilih'}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">{selectedProduct?.sku || selectedProduct?.category || 'Pilih produk dari dropdown di atas.'}</p>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Stok Saat Ini</p>
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-700">{toNumber(selectedProduct?.stockPolos).toLocaleString()}</p>
              <p className="text-xs text-emerald-700/80 font-bold mt-1">pcs tersedia di master produk</p>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-600">Mutasi Tercatat</p>
                <CalendarDays className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-sky-700">{Array.isArray(filteredRows) ? filteredRows.length : 0}</p>
              <p className="text-xs text-sky-700/80 font-bold mt-1">
                {latestMutation ? `Update terakhir ${formatDateTime(latestMutation)}` : 'Belum ada histori mutasi'}
              </p>
            </div>

            <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Filter Histori</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
                  className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
                  className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <div className="relative">
                  <select
                    value={filters.refType}
                    onChange={(event) => setFilters((current) => ({ ...current, refType: event.target.value }))}
                    className="w-full appearance-none rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 pr-10 text-sm font-bold text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="all">Semua referensi</option>
                    {refTypeOptions.map((refType) => (
                      <option key={refType} value={refType}>{refType}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                </div>
              </div>
            </div>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Total Masuk</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">{totalIn.toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">pcs dari seluruh histori</p>
              </div>
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Total Keluar</p>
                <p className="text-2xl font-bold text-rose-600 mt-2">{totalOut.toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">pcs dari seluruh histori</p>
              </div>
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Saldo Akhir Histori</p>
                <p className="text-2xl font-bold text-on-surface mt-2">
                  {Array.isArray(filteredRows) && filteredRows.length > 0
                    ? toNumber(filteredRows[filteredRows.length - 1]?.balance || filteredRows[0]?.balance).toLocaleString()
                    : 0}
                </p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">pcs berdasarkan baris terakhir yang tersedia</p>
              </div>
            </div>
          )}

          <div className="rounded-[1.75rem] border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-surface-container-low text-[10px] font-black text-muted uppercase tracking-[0.22em] border-b border-outline-variant/30">
                  <tr>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4">Ref Tipe</th>
                    <th className="px-5 py-4">Ref No</th>
                    <th className="px-5 py-4">Catatan</th>
                    <th className="px-5 py-4 text-center">Masuk</th>
                    <th className="px-5 py-4 text-center">Keluar</th>
                    <th className="px-5 py-4 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {!stockCardProductId && (
                    <tr>
                      <td className="px-6 py-20 text-center italic uppercase text-[10px] font-black tracking-[0.22em] text-on-surface-variant" colSpan={7}>
                        Silakan pilih produk untuk melihat histori mutasi stok.
                      </td>
                    </tr>
                  )}

                  {stockCardProductId && stockCardLoading && (
                    <tr>
                      <td className="px-6 py-16" colSpan={7}>
                        <div className="flex items-center justify-center gap-3 text-muted font-bold text-sm">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Memuat histori stock card...
                        </div>
                      </td>
                    </tr>
                  )}

                  {stockCardProductId && !stockCardLoading && (!Array.isArray(filteredRows) || filteredRows.length === 0) && (
                    <tr>
                      <td className="px-6 py-20 text-center" colSpan={7}>
                        <div className="flex flex-col items-center gap-3 text-muted">
                          <div className="w-16 h-16 rounded-3xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center">
                            <ClipboardList className="w-7 h-7 text-muted" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-muted">Histori tidak ditemukan</p>
                            <p className="text-sm font-medium text-muted mt-1">Produk ini belum punya histori yang cocok dengan filter aktif.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {stockCardProductId && !stockCardLoading && Array.isArray(filteredRows) && filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-container-low/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-on-surface text-sm">{formatDate(row.date)}</p>
                        <p className="text-[11px] text-muted font-medium mt-1">{formatDateTime(row.date)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase tracking-[0.18em]">
                          {row.refType}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-on-surface text-sm">{row.refNo}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-on-surface-variant">{row.note || '-'}</p>
                        {row.warehouseName && <p className="text-[11px] text-muted font-medium mt-1">{row.warehouseName}</p>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex min-w-[86px] justify-center px-3 py-1.5 rounded-xl text-xs font-black ${row.qtyIn > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-container-high text-muted'}`}>
                          {row.qtyIn > 0 ? `+${row.qtyIn.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex min-w-[86px] justify-center px-3 py-1.5 rounded-xl text-xs font-black ${row.qtyOut > 0 ? 'bg-rose-50 text-rose-600' : 'bg-surface-container-high text-muted'}`}>
                          {row.qtyOut > 0 ? `-${row.qtyOut.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-on-surface text-sm">{row.balance.toLocaleString()} pcs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
