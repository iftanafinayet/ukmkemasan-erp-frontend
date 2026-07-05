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
    showDirectVariants = true,
    getVariantId = defaultGetVariantId,
    getVariantSku = defaultGetVariantSku,
    getVariantStock = defaultGetVariantStock
}) {
    return (
        <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-card sm:p-8">
            <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
                <p className="mt-2 text-sm font-medium text-on-surface-variant">{description}</p>
            </div>

            <div className="space-y-6">
                {showDirectVariants && (
                    <div>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">Varian Langsung</p>
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
                                         aria-pressed={isSelected}
                                         className={`rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                                             isSelected
                                                 ? 'border-primary/30 bg-primary/5'
                                                 : 'border-outline-variant bg-surface-container-lowest hover:border-primary/30'
                                         } ${isOutOfStock ? 'opacity-60' : ''}`}
                                     >
                                        <p className="text-sm font-bold text-on-surface">{variant.size} • {variant.color}</p>
                                        <p className="mt-1 text-[11px] font-semibold text-muted">{getVariantSku(variant)}</p>
                                        <p className={`mt-3 text-xs font-bold ${isOutOfStock ? 'text-error' : 'text-on-surface-variant'}`}>
                                            {isOutOfStock ? 'Stok habis' : `${stock.toLocaleString()} pcs`}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">Ukuran</p>
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
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">Warna</p>
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
        aria-pressed={selected}
        className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${
            selected
                ? 'border-primary/40 bg-primary/5 text-primary'
                : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 hover:text-primary'
        } disabled:cursor-not-allowed disabled:opacity-40`}
    >
        {label}
    </button>
);
