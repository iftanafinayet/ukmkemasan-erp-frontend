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
    <div className="space-y-6 animate-in fade-in duration-500 border border-slate-100 overflow-hidden">
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ArrowRightLeft className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Penyesuaian Stok</h3>
            <p className="text-slate-400 text-xs font-medium">Tambah atau kurangi stok secara manual.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Plus size={12} />
              Input Transaksi
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Produk</label>
                <select
                  required
                  value={adjustmentForm.productId}
                  onChange={(event) => setAdjustmentForm({
                    ...adjustmentForm,
                    productId: event.target.value,
                    variantId: '',
                  })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800"
                >
                  <option value="">-- Cari Produk --</option>
                  {inventoryProductOptions.map((product) => (
                    <option key={product._id} value={product._id}>{product.optionLabel}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Varian</label>
                <select
                  required={shouldSelectVariant}
                  disabled={!selectedProduct || variants.length === 0}
                  value={adjustmentForm.variantId}
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, variantId: event.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Product ini memiliki {variants.length} varian. Pilih varian yang akan disesuaikan.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gudang Tujuan</label>
                <select
                  required
                  value={adjustmentForm.warehouseId}
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, warehouseId: event.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800"
                >
                  <option value="">-- Pilih Gudang --</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>{warehouse.name}</option>
                  ))}
                </select>
                {warehouses.length === 0 && (
                  <p className="text-[10px] text-amber-500 font-bold mt-1">Belum ada gudang terdaftar. Tambah di menu Warehouse.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Mutasi</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'In' })}
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${adjustmentForm.type === 'In' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                    >
                      MASUK (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'Out' })}
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${adjustmentForm.type === 'Out' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                    >
                      KELUAR (-)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah (Pcs)</label>
                  <input
                    type="number"
                    required
                    value={adjustmentForm.quantity}
                    onChange={(event) => setAdjustmentForm({ ...adjustmentForm, quantity: event.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Penyesuaian</label>
                <input
                  type="text"
                  required
                  value={adjustmentForm.reason}
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, reason: event.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800"
                  placeholder="Misal: Barang Rusak, Hasil Opname..."
                />
              </div>

              <button
                type="submit"
                disabled={savingAdjustment || warehouses.length === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:translate-y-0"
              >
                {savingAdjustment ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Proses Penyesuaian Stok'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Penting</h4>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Adjustment</p>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400">Produk</p>
                  <p className="text-sm font-black text-slate-800">{selectedProduct?.optionLabel || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Varian</p>
                  <p className="text-sm font-black text-slate-800">
                    {selectedVariant?.optionLabel || (variants.length === 1 ? variants[0]?.optionLabel || '-' : variants.length === 0 ? 'Tanpa varian' : 'Belum dipilih')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Stok Saat Ini</p>
                  <p className={`text-2xl font-black ${currentTargetStock < 500 ? 'text-red-500' : 'text-slate-800'}`}>
                    {Number(currentTargetStock || 0).toLocaleString()} pcs
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 border-dashed">
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Setiap transaksi penyesuaian stok akan tercatat secara permanen di <strong>Stock Card</strong>.
                Pastikan data yang diinput sudah sesuai dengan fisik barang di gudang untuk menghindari selisih laporan.
              </p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                <ClipboardList className="text-slate-200 w-10 h-10" />
              </div>
              <p className="font-bold text-slate-400 text-xs uppercase tracking-widest">Histori Real-time</p>
              <p className="text-slate-300 text-[10px] mt-2">Pilih produk untuk melihat mutasi terakhir.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
