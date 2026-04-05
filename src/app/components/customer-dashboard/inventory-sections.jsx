import {
  ArrowRightLeft,
  ClipboardList,
  Edit3,
  Eye,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Trash2,
  Warehouse,
} from 'lucide-react';
import { buildItemCategories, getInventoryPagination } from './utils';
import { EmptyState, SearchBar } from './shared';

export function InventoryPage({
  filteredProducts,
  formatCurrency,
  invPage,
  invPerPage,
  isAdmin,
  onDeleteProduct,
  onEditProduct,
  onOpenProductModal,
  onSearchChange,
  onSetInvPage,
  onSetInvPerPage,
  onViewProduct,
  searchTerm,
}) {
  const {
    total,
    totalPages,
    safePage,
    startIdx,
    endIdx,
    paginated,
    pageNumbers,
  } = getInventoryPagination(filteredProducts, invPage, invPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1">
          <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Cari produk, kategori, material..." />
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenProductModal}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Tambah Produk
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gambar</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stok</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">B2C</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">B2B</th>
              {isAdmin && <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((product) => (
              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  {product.images?.length > 0 ? (
                    <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </td>
                <td className="p-5 text-sm text-slate-500 font-bold">{product.sku || '-'}</td>
                <td className="p-5 font-bold text-slate-800">
                  <button type="button" onClick={() => onViewProduct(product._id)} className="hover:text-primary transition-colors text-left">
                    {product.name}
                  </button>
                </td>
                <td className="p-5 text-xs text-slate-500 font-medium">{product.category}</td>
                <td className="p-5 text-xs text-slate-500 font-medium">{product.material || '-'}</td>
                <td className="p-5 text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg font-black text-xs ${product.stockPolos < 500 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                    {product.stockPolos?.toLocaleString()} pcs
                  </span>
                </td>
                <td className="p-5 font-bold text-primary text-right">{formatCurrency(product.priceB2C)}</td>
                <td className="p-5 font-bold text-slate-600 text-right">{formatCurrency(product.priceB2B)}</td>
                {isAdmin && (
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => onViewProduct(product._id)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors" title="Detail">
                        <Eye size={16} />
                      </button>
                      <button type="button" onClick={() => onEditProduct(product)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 transition-colors" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button type="button" onClick={() => onDeleteProduct(product._id)} className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Showing <span className="font-black text-slate-700">{startIdx + 1}</span> - <span className="font-black text-slate-700">{endIdx}</span> of <span className="font-black text-slate-700">{total}</span> entries
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={invPerPage}
                onChange={(event) => {
                  onSetInvPerPage(Number(event.target.value));
                  onSetInvPage(1);
                }}
                className="appearance-none border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {[25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onSetInvPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all text-sm font-bold"
              >
                {'<'}
              </button>

              {pageNumbers.map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
                ) : (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => onSetInvPage(pageNumber)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                      pageNumber === safePage
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              ))}

              <button
                type="button"
                onClick={() => onSetInvPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all text-sm font-bold"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="px-6 py-16">
            <EmptyState text="Tidak ada data packaging ditemukan." />
          </div>
        )}
      </div>
    </div>
  );
}

export function WarehousePage({
  currentWarehouseType,
  deletingWarehouseId,
  onCreateWarehouse,
  onDeleteWarehouse,
  onEditWarehouse,
  warehouses,
}) {
  const filteredWarehouses = warehouses.filter((warehouse) => warehouse.type === currentWarehouseType);
  const activeWarehouses = filteredWarehouses.filter((warehouse) => warehouse.isActive !== false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800">Manajemen Gudang</h3>
          <p className="text-slate-500 text-sm">Kelola lokasi penyimpanan barang {currentWarehouseType === 'Retail' ? 'Retail' : 'Pusat'}.</p>
        </div>
        <button
          type="button"
          onClick={onCreateWarehouse}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30"
        >
          <Plus size={16} />
          Tambah Gudang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Gudang</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{filteredWarehouses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gudang Aktif</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{activeWarehouses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe</p>
          <p className="text-3xl font-black text-primary mt-2">{currentWarehouseType}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <div key={warehouse._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl ${warehouse.isActive !== false ? 'bg-blue-50' : 'bg-slate-100'}`}>
                  <Warehouse className={warehouse.isActive !== false ? 'text-blue-500' : 'text-slate-400'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800">{warehouse.name}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${warehouse.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {warehouse.isActive !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{warehouse.location || 'Lokasi belum diisi'}</p>
                  <p className="text-[10px] text-primary font-black mt-3 uppercase tracking-widest">{warehouse.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onEditWarehouse(warehouse)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 transition-colors" title="Edit gudang">
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteWarehouse(warehouse._id)}
                  disabled={deletingWarehouseId === warehouse._id}
                  className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors disabled:opacity-50"
                  title="Hapus gudang"
                >
                  {deletingWarehouseId === warehouse._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 px-6 py-16">
          <EmptyState text={`Belum ada gudang ${currentWarehouseType.toLowerCase()} terdaftar.`} />
        </div>
      )}
    </div>
  );
}

export function ItemCategoriesPage({ formatCurrency, products }) {
  const categories = buildItemCategories(Array.isArray(products) ? products : []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="text-xl font-black text-slate-800">Kategori Packaging</h3>
        <p className="text-slate-500 text-sm mt-1">Ringkasan kategori dari seluruh master packaging yang ada di inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.name} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</p>
                <h4 className="text-xl font-black text-slate-800 mt-2">{category.name}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Package size={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                <p className="text-2xl font-black text-slate-800 mt-2">{category.totalItems}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok</p>
                <p className="text-2xl font-black text-slate-800 mt-2">{category.totalStock.toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rentang Harga</p>
              <p className="font-black text-primary mt-2">{formatCurrency(category.minPrice)}</p>
              <p className="text-sm text-slate-500 font-medium">sampai {formatCurrency(category.maxPrice)}</p>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && <EmptyState text="Belum ada kategori packaging." />}
    </div>
  );
}

export function InventoryAdjustmentPage({
  adjustmentForm,
  onSubmit,
  products,
  savingAdjustment,
  setAdjustmentForm,
  warehouses,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-hidden">
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
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, productId: event.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800"
                >
                  <option value="">-- Cari Produk --</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>{product.name} (Stok: {product.stockPolos})</option>
                  ))}
                </select>
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
