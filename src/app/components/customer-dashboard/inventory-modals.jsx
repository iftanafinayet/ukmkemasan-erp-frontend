import { ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { FormInput, ModalWrapper } from './shared';

const createVariantDraft = () => ({
  _id: '',
  sku: '',
  size: '',
  color: '',
  priceB2C: '',
  priceB2B: '',
  stock: '',
});

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
  const variants = Array.isArray(newProduct.variants) && newProduct.variants.length > 0
    ? newProduct.variants
    : [createVariantDraft()];

  const totalStock = variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
  const lowestB2C = variants.reduce((min, variant) => {
    const value = Number(variant.priceB2C);
    if (!Number.isFinite(value)) return min;
    return min === null || value < min ? value : min;
  }, null);
  const lowestB2B = variants.reduce((min, variant) => {
    const value = Number(variant.priceB2B);
    if (!Number.isFinite(value)) return min;
    return min === null || value < min ? value : min;
  }, null);

  const updateVariant = (index, field, value) => {
    const nextVariants = variants.map((variant, variantIndex) =>
      variantIndex === index ? { ...variant, [field]: value } : variant
    );

    setNewProduct({ ...newProduct, variants: nextVariants });
  };

  const addVariant = () => {
    setNewProduct({ ...newProduct, variants: [...variants, createVariantDraft()] });
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      setNewProduct({ ...newProduct, variants: [createVariantDraft()] });
      return;
    }

    setNewProduct({
      ...newProduct,
      variants: variants.filter((_, variantIndex) => variantIndex !== index),
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="mb-8">
        <h3 className="text-2xl font-black tracking-tight text-slate-800">{editingProduct ? 'Edit Produk' : 'Tambah Katalog'}</h3>
        <p className="text-sm font-medium text-slate-500">
          {editingProduct ? 'Perbarui katalog dan setiap varian produk.' : 'Buat keluarga katalog beserta varian ukuran, warna, harga, dan stoknya.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput
            label="Nama Produk"
            value={newProduct.name}
            onChange={(value) => setNewProduct({ ...newProduct, name: value })}
            required
            placeholder="Flat Bottom"
          />
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</label>
            <select
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={newProduct.category}
              onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value })}
            >
              {productCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <FormInput
            label="Material"
            value={newProduct.material}
            onChange={(value) => setNewProduct({ ...newProduct, material: value })}
            required
            placeholder="PET / ALU / LLDPE"
          />
          <FormInput
            label="Min. Order"
            type="number"
            value={newProduct.minOrder}
            onChange={(value) => setNewProduct({ ...newProduct, minOrder: value })}
            required
            placeholder="100"
          />
          <FormInput
            label="Valve / pcs (Rp)"
            type="number"
            value={newProduct.valvePrice}
            onChange={(value) => setNewProduct({ ...newProduct, valvePrice: value })}
            placeholder="600"
          />
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Deskripsi</label>
          <textarea
            rows={3}
            value={newProduct.description}
            onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })}
            placeholder="Contoh: Flat Bottom dengan pilihan ukuran 250 gr, 500 gr, dan 1000 gr."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-medium text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-800">Daftar Varian</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Kelola SKU, ukuran, warna, harga B2C/B2B, dan stok per kombinasi.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryCard label="Varian" value={`${variants.length}`} />
              <SummaryCard label="Total Stok" value={`${totalStock.toLocaleString()} pcs`} />
              <SummaryCard label="Mulai B2C" value={formatCurrency(lowestB2C)} />
              <SummaryCard label="Mulai B2B" value={formatCurrency(lowestB2B)} />
            </div>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={variant._id || `${variant.sku}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary">Varian {index + 1}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Gunakan kombinasi ukuran dan warna yang unik.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-100"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormInput
                    label="SKU"
                    value={variant.sku}
                    onChange={(value) => updateVariant(index, 'sku', value)}
                    required
                    placeholder="FBT-250-BLK"
                  />
                  <FormInput
                    label="Ukuran"
                    value={variant.size}
                    onChange={(value) => updateVariant(index, 'size', value)}
                    required
                    placeholder="250 gr"
                  />
                  <FormInput
                    label="Warna"
                    value={variant.color}
                    onChange={(value) => updateVariant(index, 'color', value)}
                    required
                    placeholder="Black"
                  />
                  <FormInput
                    label="Harga B2C (Rp)"
                    type="number"
                    value={variant.priceB2C}
                    onChange={(value) => updateVariant(index, 'priceB2C', value)}
                    required
                    placeholder="2800"
                  />
                  <FormInput
                    label="Harga B2B (Rp)"
                    type="number"
                    value={variant.priceB2B}
                    onChange={(value) => updateVariant(index, 'priceB2B', value)}
                    required
                    placeholder="2400"
                  />
                  <FormInput
                    label="Stok"
                    type="number"
                    value={variant.stock}
                    onChange={(value) => updateVariant(index, 'stock', value)}
                    required
                    placeholder="500"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="flex w-full items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-4 text-sm font-black uppercase tracking-widest text-primary transition-all hover:border-primary hover:bg-primary/10"
            >
              <Plus size={18} /> Tambah Varian
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Gambar Produk (Maks. 5)</label>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((image) => (
                <div key={image.publicId} className="group relative">
                  <img src={image.url} alt={image.alt} className="h-20 w-20 rounded-2xl border-2 border-slate-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveExistingImage(image.publicId)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
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
                <div key={`${file.name}-${index}`} className="group relative">
                  <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="h-20 w-20 rounded-2xl border-2 border-primary/30 object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveNewImage(index)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalImages < 5 && (
            <label className="group flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-5 transition-all hover:border-primary/40 hover:bg-slate-100">
              <ImagePlus className="h-6 w-6 text-slate-400 transition-colors group-hover:text-primary" />
              <span className="text-sm font-bold text-slate-500 transition-colors group-hover:text-primary">
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

          <p className="ml-1 text-[10px] text-slate-400">Format: JPEG, PNG, WebP. Otomatis dikonversi ke AVIF.</p>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-3xl bg-primary py-5 font-black text-white shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:bg-primary/90 active:scale-95"
        >
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

const SummaryCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
  </div>
);
