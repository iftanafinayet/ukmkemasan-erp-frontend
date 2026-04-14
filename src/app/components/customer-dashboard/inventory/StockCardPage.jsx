import React from 'react';
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
  const stockProducts = Array.isArray(products) ? products : [];
  const selectedProduct = stockProducts.find((product) => product._id === stockCardProductId);
  const totalIn = Array.isArray(stockCardRows) ? stockCardRows.reduce((sum, row) => sum + toNumber(row.qtyIn), 0) : 0;
  const totalOut = Array.isArray(stockCardRows) ? stockCardRows.reduce((sum, row) => sum + toNumber(row.qtyOut), 0) : 0;
  const latestMutation = Array.isArray(stockCardRows) && stockCardRows.length > 0 ? (stockCardRows[0]?.date || stockCardRows[stockCardRows.length - 1]?.date) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-cyan-50">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 mb-4">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Stock Card
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Histori mutasi stok yang lebih rapi dan terbaca.</h3>
              <p className="text-sm text-slate-500 font-medium mt-2">
                Pilih produk untuk melihat pergerakan stok masuk, keluar, dan saldo akhirnya secara kronologis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[380px]">
              <div className="relative flex-1">
                <select
                  value={stockCardProductId}
                  onChange={(event) => onSelectProduct(event.target.value)}
                  className="appearance-none w-full px-5 pr-11 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                >
                  <option value="">Pilih produk...</option>
                  {stockProducts.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} {product.sku ? `(${product.sku})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => onRefresh(stockCardProductId)}
                disabled={!stockCardProductId || stockCardLoading}
                className="px-5 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {stockCardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Muat Ulang
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Produk</p>
                <Package className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-lg font-black text-slate-900 leading-tight">{selectedProduct?.name || 'Belum dipilih'}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{selectedProduct?.sku || selectedProduct?.category || 'Pilih produk dari dropdown di atas.'}</p>
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
              <p className="text-3xl font-black text-sky-700">{Array.isArray(stockCardRows) ? stockCardRows.length : 0}</p>
              <p className="text-xs text-sky-700/80 font-bold mt-1">
                {latestMutation ? `Update terakhir ${formatDateTime(latestMutation)}` : 'Belum ada histori mutasi'}
              </p>
            </div>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Total Masuk</p>
                <p className="text-2xl font-black text-emerald-600 mt-2">{totalIn.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">pcs dari seluruh histori</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Total Keluar</p>
                <p className="text-2xl font-black text-rose-600 mt-2">{totalOut.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">pcs dari seluruh histori</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Saldo Akhir Histori</p>
                <p className="text-2xl font-black text-slate-800 mt-2">
                  {Array.isArray(stockCardRows) && stockCardRows.length > 0 
                    ? toNumber(stockCardRows[stockCardRows.length - 1]?.balance || stockCardRows[0]?.balance).toLocaleString()
                    : 0}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">pcs berdasarkan baris terakhir yang tersedia</p>
              </div>
            </div>
          )}

          <div className="rounded-[1.75rem] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.22em] border-b border-slate-100">
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
                <tbody className="divide-y divide-slate-100">
                  {!stockCardProductId && (
                    <tr>
                      <td className="px-6 py-20 text-center italic uppercase text-[10px] font-black tracking-[0.22em] text-slate-300" colSpan={7}>
                        Silakan pilih produk untuk melihat histori mutasi stok.
                      </td>
                    </tr>
                  )}

                  {stockCardProductId && stockCardLoading && (
                    <tr>
                      <td className="px-6 py-16" colSpan={7}>
                        <div className="flex items-center justify-center gap-3 text-slate-400 font-bold text-sm">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Memuat histori stock card...
                        </div>
                      </td>
                    </tr>
                  )}

                  {stockCardProductId && !stockCardLoading && (!Array.isArray(stockCardRows) || stockCardRows.length === 0) && (
                    <tr>
                      <td className="px-6 py-20 text-center" colSpan={7}>
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <ClipboardList className="w-7 h-7 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Belum ada histori</p>
                            <p className="text-sm font-medium text-slate-400 mt-1">Produk ini belum memiliki mutasi stok yang tercatat.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {stockCardProductId && !stockCardLoading && Array.isArray(stockCardRows) && stockCardRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{formatDate(row.date)}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">{formatDateTime(row.date)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.18em]">
                          {row.refType}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700 text-sm">{row.refNo}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-600">{row.note || '-'}</p>
                        {row.warehouseName && <p className="text-[11px] text-slate-400 font-medium mt-1">{row.warehouseName}</p>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex min-w-[86px] justify-center px-3 py-1.5 rounded-xl text-xs font-black ${row.qtyIn > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {row.qtyIn > 0 ? `+${row.qtyIn.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex min-w-[86px] justify-center px-3 py-1.5 rounded-xl text-xs font-black ${row.qtyOut > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                          {row.qtyOut > 0 ? `-${row.qtyOut.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-slate-800 text-sm">{row.balance.toLocaleString()} pcs</td>
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
