import React, { useMemo, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { FormInput, ModalWrapper } from '../shared';
import SimplePricingSummary from '../../SimplePricingSummary';
import { buildCatalogGroups } from '../../../utils/catalog';
import { buildOrderPreview } from '../../../utils/phase2';

const VariantChip = ({ disabled, label, onClick, selected }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-2xl border-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
      selected
        ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
        : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
    } disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300`}
  >
    {label}
  </button>
);

export default function CreateOrderModal({
  creatingOrder,
  formatCurrency,
  isOpen,
  onClose,
  onSubmit,
  orderForm,
  products,
  setOrderForm,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCatalogKey, setSelectedCatalogKey] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);

  const catalogGroups = useMemo(() => buildCatalogGroups(products), [products]);

  const categories = ['All', ...new Set(catalogGroups.map((catalog) => catalog.category).filter(Boolean))];
  const defaultCatalog = catalogGroups[0] || null;
  const resolvedCatalogKey = catalogGroups.some((catalog) => catalog.key === selectedCatalogKey)
    ? selectedCatalogKey
    : defaultCatalog?.key || '';
  const selectedCatalog = catalogGroups.find((catalog) => catalog.key === resolvedCatalogKey) || null;
  const resolvedCategory = categories.includes(selectedCategory)
    ? selectedCategory
    : selectedCatalog?.category || defaultCatalog?.category || 'All';
  const filteredCatalogs = resolvedCategory === 'All'
    ? catalogGroups
    : catalogGroups.filter((catalog) => catalog.category === resolvedCategory);
  const defaultVariant = selectedCatalog?.variants.find((variant) => variant.stock > 0)
    || selectedCatalog?.variants[0]
    || null;
  const resolvedSize = selectedCatalog?.availableSizes.includes(selectedSize) ? selectedSize : defaultVariant?.size || '';
  const resolvedColor = selectedCatalog?.availableColors.includes(selectedColor) ? selectedColor : defaultVariant?.color || '';
  const selectedVariant = selectedCatalog?.variants.find((variant) =>
    variant.size === resolvedSize && variant.color === resolvedColor
  ) || defaultVariant;
  const quantity = Math.max(selectedCatalog?.minOrder || 100, Number(orderForm.quantity) || selectedCatalog?.minOrder || 100);
  const basePrice = selectedVariant ? (quantity >= 1000 ? selectedVariant.priceB2B : selectedVariant.priceB2C) : 0;
  const valvePrice = orderForm.useValve ? (selectedCatalog?.addons?.valvePrice || 0) : 0;
  const totalPrice = (basePrice + valvePrice) * quantity;
  const preview = buildOrderPreview({
    orderForm,
    selectedCatalog,
    selectedVariant,
    quantity,
    basePrice,
    valvePrice,
  });

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);

    const nextCatalog = (category === 'All'
      ? catalogGroups
      : catalogGroups.filter((catalog) => catalog.category === category))[0] || null;

    if (!nextCatalog) {
      setSelectedCatalogKey('');
      setSelectedSize('');
      setSelectedColor('');
      return;
    }

    const nextVariant = nextCatalog.variants.find((variant) => variant.stock > 0)
      || nextCatalog.variants[0]
      || null;

    setSelectedCatalogKey(nextCatalog.key);
    setSelectedSize(nextVariant?.size || '');
    setSelectedColor(nextVariant?.color || '');
    setIsPreviewEnabled(false);

    setOrderForm((current) => ({
      ...current,
      productId: nextVariant?.sourceProductId || nextCatalog.productId || '',
      variantId: nextVariant?.variantId || '',
      quantity: Math.max(nextCatalog.minOrder || 100, Number(current.quantity) || nextCatalog.minOrder || 100),
    }));
  };

  const handleSelectCatalog = (catalog) => {
    const nextVariant = catalog.variants.find((variant) => variant.stock > 0)
      || catalog.variants[0]
      || null;

    setSelectedCategory(catalog.category);
    setSelectedCatalogKey(catalog.key);
    setSelectedSize(nextVariant?.size || '');
    setSelectedColor(nextVariant?.color || '');
    setIsPreviewEnabled(false);
    setOrderForm((current) => ({
      ...current,
      productId: nextVariant?.sourceProductId || catalog.productId || '',
      variantId: nextVariant?.variantId || '',
      useValve: false,
      quantity: Math.max(catalog.minOrder || 100, Number(current.quantity) || catalog.minOrder || 100),
    }));
  };

  const handleSelectSize = (size) => {
    if (!selectedCatalog) return;

    const nextVariant = selectedCatalog.variants.find((variant) =>
      variant.size === size
      && variant.color === resolvedColor
      && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) =>
      variant.size === size && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) => variant.size === size);

    setSelectedSize(size);
    setSelectedColor(nextVariant?.color || '');
    setIsPreviewEnabled(false);

    setOrderForm((current) => ({
      ...current,
      productId: nextVariant?.sourceProductId || selectedCatalog.productId || '',
      variantId: nextVariant?.variantId || '',
    }));
  };

  const handleSelectColor = (color) => {
    if (!selectedCatalog) return;

    const nextVariant = selectedCatalog.variants.find((variant) =>
      variant.color === color
      && variant.size === resolvedSize
      && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) =>
      variant.color === color && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) => variant.color === color);

    setSelectedColor(color);
    setSelectedSize(nextVariant?.size || '');
    setIsPreviewEnabled(false);

    setOrderForm((current) => ({
      ...current,
      productId: nextVariant?.sourceProductId || selectedCatalog.productId || '',
      variantId: nextVariant?.variantId || '',
    }));
  };

  const isSizeDisabled = (size) => !selectedCatalog?.variants.some((variant) =>
    variant.size === size
    && (!resolvedColor || variant.color === resolvedColor)
    && variant.stock > 0
  );

  const isColorDisabled = (color) => !selectedCatalog?.variants.some((variant) =>
    variant.color === color
    && (!resolvedSize || variant.size === resolvedSize)
    && variant.stock > 0
  );

  const handleClose = () => {
    setSelectedCategory('All');
    setSelectedCatalogKey('');
    setSelectedSize('');
    setSelectedColor('');
    setIsPreviewEnabled(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={handleClose} wide>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Buat Pesanan Baru</h3>
        <p className="text-slate-500 text-sm font-medium">Pilih kategori katalog, lalu tentukan ukuran dan warna varian.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleSelectCategory(category)}
                className={`rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  resolvedCategory === category
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'border border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredCatalogs.map((catalog) => (
            <button
              key={catalog.key}
              type="button"
              onClick={() => handleSelectCatalog(catalog)}
              className={`rounded-3xl border p-5 text-left transition-all ${
                resolvedCatalogKey === catalog.key
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm'
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{catalog.category}</p>
              <h4 className="mt-1 text-base font-black text-slate-900">{catalog.name}</h4>
              <p className="mt-1 text-xs font-medium text-slate-500">{catalog.materialLabel}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-400">{catalog.variants.length} varian</span>
                <span className="text-sm font-black text-primary">{formatCurrency(catalog.priceB2B)}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedCatalog && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ukuran</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCatalog.availableSizes.map((size) => (
                    <VariantChip
                      key={size}
                      label={size}
                      selected={resolvedSize === size}
                      disabled={isSizeDisabled(size)}
                      onClick={() => handleSelectSize(size)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCatalog.availableColors.map((color) => (
                    <VariantChip
                      key={color}
                      label={color}
                      selected={resolvedColor === color}
                      disabled={isColorDisabled(color)}
                      onClick={() => handleSelectColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormInput
                  label="Jumlah (kelipatan min. order)"
                  type="number"
                  value={quantity}
                  onChange={(value) => setOrderForm({ ...orderForm, quantity: Number(value) })}
                  required
                  placeholder="100"
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pakai Valve?</label>
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                    <label className={`flex items-center gap-2 ${selectedCatalog.addons?.valvePrice > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
                      <input
                        type="radio"
                        name="valve"
                        checked={orderForm.useValve}
                        disabled={(selectedCatalog.addons?.valvePrice || 0) <= 0}
                        onChange={() => setOrderForm({ ...orderForm, useValve: true })}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="font-bold text-slate-700">Ya</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="valve" checked={!orderForm.useValve} onChange={() => setOrderForm({ ...orderForm, useValve: false })} className="h-4 w-4 accent-primary" />
                      <span className="font-bold text-slate-700">Tidak</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewEnabled((current) => !current)}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-xs font-black uppercase tracking-[0.22em] transition-all ${
                  isPreviewEnabled
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:text-primary'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                {isPreviewEnabled ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
              </button>
            </div>

            <div className="space-y-4">
              <SimplePricingSummary
                catalog={selectedCatalog}
                variant={selectedVariant}
                quantity={quantity}
                useValve={orderForm.useValve}
                basePrice={basePrice}
                totalPrice={totalPrice}
                priceType={quantity >= 1000 ? 'B2B' : 'B2C'}
                formatCurrency={formatCurrency}
              />

              {isPreviewEnabled && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Order Preview</p>
                  <h4 className="mt-3 text-xl font-black text-slate-900">{preview.productName}</h4>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <PreviewRow label="SKU" value={preview.sku} />
                    <PreviewRow label="Kategori" value={preview.category} />
                    <PreviewRow label="Ukuran" value={preview.size} />
                    <PreviewRow label="Warna" value={preview.color} />
                    <PreviewRow label="Material" value={preview.material} />
                    <PreviewRow label="Valve" value={preview.useValve ? 'Ya' : 'Tidak'} />
                    <PreviewRow label="Qty" value={`${preview.quantity.toLocaleString()} pcs`} />
                    <PreviewRow label="Stok tersisa" value={`${preview.projectedStock.toLocaleString()} pcs`} />
                  </div>
                  <div className="mt-5 rounded-2xl border border-white bg-white p-4">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                      <span>Harga dasar / pcs</span>
                      <span>{formatCurrency(preview.basePrice)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm font-medium text-slate-500">
                      <span>Tambahan valve / pcs</span>
                      <span>{formatCurrency(preview.valvePrice)}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-base font-black text-slate-900">
                      <span>Total estimasi</span>
                      <span>{formatCurrency(preview.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={creatingOrder || !selectedVariant || (selectedVariant?.stock || 0) <= 0 || !isPreviewEnabled || !preview.stockSufficient}
          className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {creatingOrder ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            isPreviewEnabled ? 'Konfirmasi Pesanan' : 'Preview Dulu'
          )}
        </button>
      </form>
    </ModalWrapper>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-800">{value || '-'}</p>
    </div>
  );
}
