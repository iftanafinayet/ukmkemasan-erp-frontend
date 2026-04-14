import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FormInput, ModalWrapper } from '../shared';
import SimplePricingSummary from '../../SimplePricingSummary';
import { buildCatalogGroups } from '../../../utils/catalog';

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
  if (!isOpen) return null;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCatalogKey, setSelectedCatalogKey] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const catalogGroups = useMemo(() => buildCatalogGroups(products), [products]);
  const categories = ['All', ...new Set(catalogGroups.map((catalog) => catalog.category).filter(Boolean))];
  const filteredCatalogs = selectedCategory === 'All'
    ? catalogGroups
    : catalogGroups.filter((catalog) => catalog.category === selectedCategory);
  const selectedCatalog = catalogGroups.find((catalog) => catalog.key === selectedCatalogKey) || null;
  const selectedVariant = selectedCatalog?.variants.find((variant) =>
    variant.size === selectedSize && variant.color === selectedColor
  ) || null;
  const quantity = Math.max(selectedCatalog?.minOrder || 100, Number(orderForm.quantity) || selectedCatalog?.minOrder || 100);
  const basePrice = selectedVariant ? (quantity >= 1000 ? selectedVariant.priceB2B : selectedVariant.priceB2C) : 0;
  const valvePrice = orderForm.useValve ? (selectedCatalog?.addons?.valvePrice || 0) : 0;
  const totalPrice = (basePrice + valvePrice) * quantity;

  useEffect(() => {
    if (!isOpen || catalogGroups.length === 0) return;

    const nextCatalog = catalogGroups[0];
    const nextVariant = nextCatalog?.variants.find((variant) => variant.stock > 0)
      || nextCatalog?.variants[0]
      || null;

    setSelectedCategory(nextCatalog?.category || 'All');
    setSelectedCatalogKey(nextCatalog?.key || '');
    setSelectedSize(nextVariant?.size || '');
    setSelectedColor(nextVariant?.color || '');
    setOrderForm((current) => ({
      ...current,
      productId: nextVariant?.sourceProductId || nextCatalog?.productId || '',
      variantId: nextVariant?.variantId || '',
      quantity: Math.max(nextCatalog?.minOrder || 100, Number(current.quantity) || nextCatalog?.minOrder || 100),
    }));
  }, [catalogGroups, isOpen, setOrderForm]);

  useEffect(() => {
    if (!selectedCatalog) return;

    setOrderForm((current) => ({
      ...current,
      productId: selectedVariant?.sourceProductId || selectedCatalog.productId || '',
      variantId: selectedVariant?.variantId || '',
      quantity: Math.max(selectedCatalog.minOrder || 100, Number(current.quantity) || selectedCatalog.minOrder || 100),
    }));
  }, [selectedCatalog, selectedVariant, setOrderForm]);

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
  };

  const handleSelectCatalog = (catalog) => {
    const nextVariant = catalog.variants.find((variant) => variant.stock > 0)
      || catalog.variants[0]
      || null;

    setSelectedCategory(catalog.category);
    setSelectedCatalogKey(catalog.key);
    setSelectedSize(nextVariant?.size || '');
    setSelectedColor(nextVariant?.color || '');
    setOrderForm((current) => ({
      ...current,
      useValve: false,
      quantity: Math.max(catalog.minOrder || 100, Number(current.quantity) || catalog.minOrder || 100),
    }));
  };

  const handleSelectSize = (size) => {
    if (!selectedCatalog) return;

    const nextVariant = selectedCatalog.variants.find((variant) =>
      variant.size === size
      && variant.color === selectedColor
      && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) =>
      variant.size === size && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) => variant.size === size);

    setSelectedSize(size);
    setSelectedColor(nextVariant?.color || '');
  };

  const handleSelectColor = (color) => {
    if (!selectedCatalog) return;

    const nextVariant = selectedCatalog.variants.find((variant) =>
      variant.color === color
      && variant.size === selectedSize
      && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) =>
      variant.color === color && variant.stock > 0
    ) || selectedCatalog.variants.find((variant) => variant.color === color);

    setSelectedColor(color);
    setSelectedSize(nextVariant?.size || '');
  };

  const isSizeDisabled = (size) => !selectedCatalog?.variants.some((variant) =>
    variant.size === size
    && (!selectedColor || variant.color === selectedColor)
    && variant.stock > 0
  );

  const isColorDisabled = (color) => !selectedCatalog?.variants.some((variant) =>
    variant.color === color
    && (!selectedSize || variant.size === selectedSize)
    && variant.stock > 0
  );

  return (
    <ModalWrapper onClose={onClose} wide>
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
                  selectedCategory === category
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
                selectedCatalogKey === catalog.key
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ukuran</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCatalog.availableSizes.map((size) => (
                    <VariantChip
                      key={size}
                      label={size}
                      selected={selectedSize === size}
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
                      selected={selectedColor === color}
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
            </div>

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
          </div>
        )}

        <button
          type="submit"
          disabled={creatingOrder || !selectedVariant || (selectedVariant?.stock || 0) <= 0}
          className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {creatingOrder ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            'Pesan Sekarang'
          )}
        </button>
      </form>
    </ModalWrapper>
  );
}
