import React from 'react';
import {
  ArrowRightLeft,
  ClipboardList,
  Loader2,
  Plus,
} from 'lucide-react';

export default function InventoryAdjustmentPage({
  adjustmentForm,
  inventoryProductOptions,
  onSubmit,
  savingAdjustment,
  setAdjustmentForm,
  warehouses,
}) {
  const selectedProduct = inventoryProductOptions.find((product) => product._id === adjustmentForm.productId) || null;
  const variants = Array.isArray(selectedProduct?.variants) ? selectedProduct.variants : [];
  const shouldSelectVariant = variants.length > 1;
  const selectedVariant = variants.find((variant) => variant._id === adjustmentForm.variantId) || null;
  const currentTargetStock = selectedVariant
    ? selectedVariant.stock || 0
    : selectedProduct?.stockPolos || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 border border-outline-variant/30 overflow-hidden">
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ArrowRightLeft className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface tracking-tight">Penyesuaian Stok</h3>
            <p className="text-muted text-xs font-medium">Tambah atau kurangi stok secara manual.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
              <Plus size={12} />
              Input Transaksi
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Pilih Produk</label>
                <select
                  required
                  value={adjustmentForm.productId}
                  onChange={(event) => setAdjustmentForm({
                    ...adjustmentForm,
                    productId: event.target.value,
                    variantId: '',
                  })}
                  className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                >
                  <option value="">-- Cari Produk --</option>
                  {inventoryProductOptions.map((product) => (
                    <option key={product._id} value={product._id}>{product.optionLabel}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Pilih Varian</label>
                <select
                  required={shouldSelectVariant}
                  disabled={!selectedProduct || variants.length === 0}
                  value={adjustmentForm.variantId}
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, variantId: event.target.value })}
                  className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-muted"
                >
                  {!selectedProduct && <option value="">-- Pilih produk dulu --</option>}
                  {selectedProduct && variants.length === 0 && <option value="">Produk ini belum punya varian</option>}
                  {selectedProduct && variants.length === 1 && (
                    <option value={variants[0]._id}>{variants[0].optionLabel}</option>
                  )}
                  {selectedProduct && variants.length > 1 && (
                    <>
                      <option value="">-- Pilih varian --</option>
                      {variants.map((variant) => (
                        <option key={variant._id} value={variant._id}>{variant.optionLabel}</option>
                      ))}
                    </>
                  )}
                </select>
                {shouldSelectVariant && (
                  <p className="text-[10px] text-on-surface-variant font-bold mt-1">Product ini memiliki {variants.length} varian. Pilih varian yang akan disesuaikan.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Gudang Tujuan</label>
                <select
                  required
                  value={adjustmentForm.warehouseId}
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, warehouseId: event.target.value })}
                  className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                >
                  <option value="">-- Pilih Gudang --</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>{warehouse.name}</option>
                  ))}
                </select>
                {warehouses.length === 0 && (
                  <p className="text-[10px] text-warning font-bold mt-1">Belum ada gudang terdaftar. Tambah di menu Warehouse.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Tipe Mutasi</label>
                  <div className="flex bg-surface-container-high p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'In' })}
                      className={`flex-1 py-3 rounded-xl text-xs font-black cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${adjustmentForm.type === 'In' ? 'bg-surface-container-lowest text-emerald-500 shadow-card' : 'text-muted'}`}
                    >
                      MASUK (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'Out' })}
                      className={`flex-1 py-3 rounded-xl text-xs font-black cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${adjustmentForm.type === 'Out' ? 'bg-surface-container-lowest text-error shadow-card' : 'text-muted'}`}
                    >
                      KELUAR (-)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Jumlah (Pcs)</label>
                  <input
                    type="number"
                    required
                    value={adjustmentForm.quantity}
                    onChange={(event) => setAdjustmentForm({ ...adjustmentForm, quantity: event.target.value })}
                    className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Alasan Penyesuaian</label>
                <input
                  type="text"
                  required
                  value={adjustmentForm.reason}
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, reason: event.target.value })}
                  className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                  placeholder="Misal: Barang Rusak, Hasil Opname..."
                />
              </div>

              <button
                type="submit"
                disabled={savingAdjustment || warehouses.length === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-card-hover shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:scale-95 cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 mt-4 disabled:opacity-50 disabled:translate-y-0"
              >
                {savingAdjustment ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Proses Penyesuaian Stok'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-muted uppercase tracking-widest">Informasi Penting</h4>
            <div className="rounded-3xl border border-outline-variant bg-surface-container-low p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Target Adjustment</p>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-muted">Produk</p>
                  <p className="text-sm font-bold text-on-surface">{selectedProduct?.optionLabel || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted">Varian</p>
                  <p className="text-sm font-bold text-on-surface">
                    {selectedVariant?.optionLabel || (variants.length === 1 ? variants[0]?.optionLabel || '-' : variants.length === 0 ? 'Tanpa varian' : 'Belum dipilih')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted">Stok Saat Ini</p>
                  <p className={`text-2xl font-bold ${currentTargetStock < 500 ? 'text-error' : 'text-on-surface'}`}>
                    {Number(currentTargetStock || 0).toLocaleString()} pcs
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-warning-container p-6 rounded-3xl border border-amber-100 border-dashed">
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Setiap transaksi penyesuaian stok akan tercatat secara permanen di <strong>Stock Card</strong>.
                Pastikan data yang diinput sudah sesuai dengan fisik barang di gudang untuk menghindari selisih laporan.
              </p>
            </div>
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-surface-container-lowest rounded-3xl flex items-center justify-center mb-4 shadow-card">
                <ClipboardList className="text-slate-200 w-10 h-10" />
              </div>
              <p className="font-bold text-muted text-xs uppercase tracking-widest">Histori Real-time</p>
              <p className="text-muted text-[10px] mt-2">Pilih produk untuk melihat mutasi terakhir.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
