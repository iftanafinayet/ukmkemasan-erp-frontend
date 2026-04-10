import React from 'react';

const defaultGetVariantId = (variant) => variant?.variantId || variant?._id || '';
const defaultGetVariantSku = (variant) => variant?.sku || '-';
const defaultGetVariantStock = (variant) => Number(variant?.stock || 0);

export default function VariantSelectorSection({
    title = 'Pilih Varian',
    description = 'Pilih kombinasi ukuran dan warna untuk melihat harga serta stok real-time.',
    activeVariantLabel = 'Belum dipilih',
    variants = [],
    selectedVariantId = '',
    sizeOptions = [],
    colorOptions = [],
    selectedSize = '',
    selectedColor = '',
    isSizeDisabled,
    isColorDisabled,
    onSelectVariant,
    onSelectSize,
    onSelectColor,
    getVariantId = defaultGetVariantId,
    getVariantSku = defaultGetVariantSku,
    getVariantStock = defaultGetVariantStock
}) {
    return (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3>
                    <p className="mt-2 text-sm font-medium text-slate-500">{description}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Varian Aktif</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{activeVariantLabel}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Varian Langsung</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {variants.map((variant) => {
                            const variantId = String(getVariantId(variant));
                            const isSelected = String(selectedVariantId) === variantId;
                            const stock = getVariantStock(variant);
                            const isOutOfStock = stock <= 0;

                            return (
                                <button
                                    key={variantId || `${variant.size}-${variant.color}-${getVariantSku(variant)}`}
                                    type="button"
                                    onClick={() => onSelectVariant?.(variant)}
                                    className={`rounded-2xl border p-4 text-left transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                            : 'border-slate-200 bg-white hover:border-primary/30'
                                    } ${isOutOfStock ? 'opacity-60' : ''}`}
                                >
                                    <p className="text-sm font-black text-slate-800">{variant.size} • {variant.color}</p>
                                    <p className="mt-1 text-[11px] font-bold text-slate-400">{getVariantSku(variant)}</p>
                                    <p className={`mt-3 text-xs font-black ${isOutOfStock ? 'text-red-500' : 'text-slate-600'}`}>
                                        {isOutOfStock ? 'Stok habis' : `${stock.toLocaleString()} pcs`}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ukuran</p>
                    <div className="flex flex-wrap gap-3">
                        {sizeOptions.map((size) => (
                            <SelectionChip
                                key={size}
                                label={size}
                                selected={selectedSize === size}
                                disabled={Boolean(isSizeDisabled?.(size))}
                                onClick={() => onSelectSize?.(size)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Warna</p>
                    <div className="flex flex-wrap gap-3">
                        {colorOptions.map((color) => (
                            <SelectionChip
                                key={color}
                                label={color}
                                selected={selectedColor === color}
                                disabled={Boolean(isColorDisabled?.(color))}
                                onClick={() => onSelectColor?.(color)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const SelectionChip = ({ label, selected, disabled, onClick }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`rounded-2xl border-2 px-4 py-3 text-sm font-black transition-all ${
            selected
                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:text-primary'
        } disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none`}
    >
        {label}
    </button>
);
