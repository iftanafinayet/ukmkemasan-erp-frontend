import { ImagePlus, Loader2, X } from 'lucide-react';
import { FormInput, ModalWrapper } from './shared';

export function ProductModal({
  editingProduct,
  existingImages,
  imageFiles,
  isOpen,
  newProduct,
  onAddImages,
  onClose,
  onRemoveExistingImage,
  onRemoveNewImage,
  onSubmit,
  productCategories,
  setNewProduct,
}) {
  if (!isOpen) return null;

  const totalImages = existingImages.length + imageFiles.length;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingProduct ? 'Edit Produk' : 'Tambah Katalog'}</h3>
        <p className="text-slate-500 text-sm font-medium">{editingProduct ? 'Perbarui data produk.' : 'Input stok kemasan polos baru ke gudang.'}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput label="SKU" value={newProduct.sku} onChange={(value) => setNewProduct({ ...newProduct, sku: value })} placeholder="SPR-001..." />
          <FormInput label="Nama Produk" value={newProduct.name} onChange={(value) => setNewProduct({ ...newProduct, name: value })} required placeholder="Standing Pouch 500g..." />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
            <select
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
              value={newProduct.category}
              onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value })}
            >
              {productCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <FormInput label="Material" value={newProduct.material} onChange={(value) => setNewProduct({ ...newProduct, material: value })} required placeholder="MET/PE" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormInput label="Harga Base (Rp)" type="number" value={newProduct.priceBase} onChange={(value) => setNewProduct({ ...newProduct, priceBase: value })} required placeholder="2000" />
          <FormInput label="Harga B2C (Rp)" type="number" value={newProduct.priceB2C} onChange={(value) => setNewProduct({ ...newProduct, priceB2C: value })} required placeholder="2500" />
          <FormInput label="Harga B2B (Rp)" type="number" value={newProduct.priceB2B} onChange={(value) => setNewProduct({ ...newProduct, priceB2B: value })} required placeholder="2000" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormInput label="Stok Polos" type="number" value={newProduct.stockPolos} onChange={(value) => setNewProduct({ ...newProduct, stockPolos: value })} required placeholder="1000" />
          <FormInput label="Deskripsi" value={newProduct.description} onChange={(value) => setNewProduct({ ...newProduct, description: value })} placeholder="Opsional..." />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gambar Produk (Maks. 5)</label>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((image) => (
                <div key={image.publicId} className="relative group">
                  <img src={image.url} alt={image.alt} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200" />
                  <button
                    type="button"
                    onClick={() => onRemoveExistingImage(image.publicId)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imageFiles.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imageFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative group">
                  <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30" />
                  <button
                    type="button"
                    onClick={() => onRemoveNewImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalImages < 5 && (
            <label className="flex items-center justify-center gap-3 px-6 py-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-primary/40 transition-all group">
              <ImagePlus className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-sm font-bold text-slate-500 group-hover:text-primary transition-colors">
                {totalImages > 0 ? 'Tambah Gambar' : 'Pilih Gambar'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  onAddImages(Array.from(event.target.files || []));
                  event.target.value = '';
                }}
              />
            </label>
          )}

          <p className="text-[10px] text-slate-400 ml-1">Format: JPEG, PNG, WebP. Otomatis dikonversi ke AVIF.</p>
        </div>

        <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4">
          {editingProduct ? 'Update Produk' : 'Simpan ke Sistem'}
        </button>
      </form>
    </ModalWrapper>
  );
}

export function WarehouseModal({
  editingWarehouse,
  isOpen,
  onClose,
  onSubmit,
  savingWarehouse,
  setWarehouseForm,
  warehouseForm,
}) {
  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang'}</h3>
        <p className="text-slate-500 text-sm font-medium">{editingWarehouse ? 'Perbarui informasi gudang.' : 'Tambahkan lokasi gudang baru ke sistem.'}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <FormInput
          label="Nama Gudang"
          value={warehouseForm.name}
          onChange={(value) => setWarehouseForm({ ...warehouseForm, name: value })}
          required
          placeholder="Gudang Utama Bekasi"
        />
        <FormInput
          label="Lokasi"
          value={warehouseForm.location}
          onChange={(value) => setWarehouseForm({ ...warehouseForm, location: value })}
          placeholder="Jl. Industri No. 12, Bekasi"
        />
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Gudang</label>
          <select
            value={warehouseForm.type}
            onChange={(event) => setWarehouseForm({ ...warehouseForm, type: event.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
          >
            <option value="Main">Main</option>
            <option value="Retail">Retail</option>
          </select>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-slate-800 text-sm">Status Gudang</p>
            <p className="text-xs text-slate-500">Gudang nonaktif tetap tersimpan tapi tidak dipakai untuk operasional.</p>
          </div>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <span className={`text-xs font-black uppercase tracking-widest ${warehouseForm.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
              {warehouseForm.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
            <input
              type="checkbox"
              checked={warehouseForm.isActive}
              onChange={(event) => setWarehouseForm({ ...warehouseForm, isActive: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={savingWarehouse}
          className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:translate-y-0"
        >
          {savingWarehouse ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingWarehouse ? 'Update Gudang' : 'Simpan Gudang')}
        </button>
      </form>
    </ModalWrapper>
  );
}
