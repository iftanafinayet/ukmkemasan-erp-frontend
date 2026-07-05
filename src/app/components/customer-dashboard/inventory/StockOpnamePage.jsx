import React, { useMemo, useState } from 'react';
import { ClipboardCheck, PackageSearch, Save, Search } from 'lucide-react';
import { getStockOpnameVariance } from '../../../utils/phase2';

export default function StockOpnamePage({
  formatDateTime,
  onSubmit,
  savingStockOpname,
  setStockOpnameForm,
  stockOpnameForm,
  stockOpnameRows,
  updateStockOpnameActual,
  warehouses,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return stockOpnameRows;

    return stockOpnameRows.filter((row) => (
      row.productName?.toLowerCase().includes(term)
      || row.sku?.toLowerCase().includes(term)
      || row.category?.toLowerCase().includes(term)
    ));
  }, [searchTerm, stockOpnameRows]);

  const summary = useMemo(() => {
    const rows = Array.isArray(stockOpnameRows) ? stockOpnameRows : [];
    return rows.reduce((accumulator, row) => {
      const variance = getStockOpnameVariance(row.systemStock, row.actualStock);
      if (!variance.matches) {
        accumulator.totalMismatch += 1;
      }

      if (variance.difference > 0) {
        accumulator.totalSurplus += variance.difference;
      }

      if (variance.difference < 0) {
        accumulator.totalDeficit += Math.abs(variance.difference);
      }

      return accumulator;
    }, {
      totalMismatch: 0,
      totalSurplus: 0,
      totalDeficit: 0,
    });
  }, [stockOpnameRows]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest shadow-card">
        <div className="border-b border-outline-variant/30 bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-emerald-50 px-8 py-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-surface-container-lowest/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Stock Opname
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">Cocokkan stok fisik dengan stok sistem dalam satu alur.</h3>
              <p className="mt-2 text-sm font-medium text-on-surface-variant">
                Isi jumlah aktual per produk. Selisih stok akan otomatis diterjemahkan menjadi penyesuaian masuk atau keluar.
              </p>
            </div>

            <form onSubmit={onSubmit} className="grid w-full gap-3 xl:max-w-3xl xl:grid-cols-[1fr_1fr_1.3fr_auto]">
              <select
                required
                value={stockOpnameForm.warehouseId}
                onChange={(event) => setStockOpnameForm((current) => ({ ...current, warehouseId: event.target.value }))}
                className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 py-4 text-sm font-bold text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Pilih gudang</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>{warehouse.name}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari produk atau SKU..."
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest py-4 pl-11 pr-4 text-sm font-medium text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <input
                type="text"
                value={stockOpnameForm.note}
                onChange={(event) => setStockOpnameForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Catatan opname, contoh: Gudang Mei 2026"
                className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 py-4 text-sm font-medium text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <button
                type="submit"
                disabled={savingStockOpname || warehouses.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-card-hover shadow-slate-200 cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingStockOpname ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-outline-variant/30 bg-surface-container-low/60 px-8 py-6 md:grid-cols-3">
          <SummaryCard label="Produk dicek" value={stockOpnameRows.length} helper={`Update ${formatDateTime(new Date().toISOString())}`} tone="slate" />
          <SummaryCard label="Selisih ditemukan" value={summary.totalMismatch} helper="Produk dengan stok fisik berbeda" tone="amber" />
          <SummaryCard label="Defisit / surplus" value={`${summary.totalDeficit.toLocaleString()} / ${summary.totalSurplus.toLocaleString()} pcs`} helper="Keluar / masuk hasil opname" tone="emerald" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-b border-outline-variant/30 bg-surface-container-lowest text-[10px] font-black uppercase tracking-[0.22em] text-muted">
              <tr>
                <th className="px-5 py-4">Produk</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4 text-right">Stok Sistem</th>
                <th className="px-5 py-4 text-right">Stok Aktual</th>
                <th className="px-5 py-4 text-center">Selisih</th>
                <th className="px-5 py-4 text-center">Aksi Sistem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-outline-variant/30 bg-surface-container-low">
                        <PackageSearch className="h-7 w-7 text-muted" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em]">Produk tidak ditemukan</p>
                        <p className="mt-1 text-sm font-medium">Ubah kata kunci pencarian atau muat ulang data inventory.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {filteredRows.map((row) => {
                const variance = getStockOpnameVariance(row.systemStock, row.actualStock);

                return (
                  <tr key={row.productId} className="transition-colors hover:bg-surface-container-low/70">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-on-surface">{row.productName}</p>
                      <p className="mt-1 text-[11px] font-medium text-muted">{row.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-on-surface-variant">{row.category || '-'}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-on-surface">{variance.systemStock.toLocaleString()} pcs</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <input
                          type="number"
                          min="0"
                          value={row.actualStock}
                          onChange={(event) => updateStockOpnameActual(row.productId, event.target.value)}
                          className="w-32 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-right text-sm font-bold text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex min-w-[96px] justify-center rounded-xl px-3 py-1.5 text-xs font-black ${
                        variance.matches
                          ? 'bg-surface-container-high text-on-surface-variant'
                          : variance.difference > 0
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                      }`}>
                        {variance.matches ? 'Sesuai' : `${variance.difference > 0 ? '+' : '-'}${Math.abs(variance.difference).toLocaleString()} pcs`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                        variance.matches
                          ? 'border border-outline-variant bg-surface-container-lowest text-muted'
                          : variance.adjustmentType === 'In'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border border-rose-200 bg-rose-50 text-rose-600'
                      }`}>
                        {variance.matches ? 'Tanpa perubahan' : `${variance.adjustmentType} ${variance.adjustmentQuantity.toLocaleString()}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ helper, label, tone, value }) {
  const tones = {
    slate: 'border-outline-variant/30 bg-surface-container-lowest text-on-surface',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className={`rounded-3xl border p-5 ${tones[tone] || tones.slate}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium opacity-70">{helper}</p>
    </div>
  );
}
