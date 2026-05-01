import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { ENDPOINTS, storage } from '../config/environment';
import { ArrowLeft, Loader2, ShoppingCart, Info, Package, DollarSign, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { buildCatalogGroups } from '../utils/catalog';
import { getCartItems, upsertCartItem } from '../utils/cart';
import VariantSelectorSection from './customer-order/VariantSelectorSection';
import CustomerNavbar from './customer-portal/CustomerNavbar';
import { formatCurrency } from '../utils/formatters';

export default function CreateOrderPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialProductId = searchParams.get('productId') || '';
    const initialCatalogKey = searchParams.get('catalog') || '';

    const user = storage.getUser();

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin');
        }
    }, [user, navigate]);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCatalogKey, setSelectedCatalogKey] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    const [orderForm, setOrderForm] = useState({
        productId: initialProductId,
        variantId: '',
        quantity: 100,
        useValve: false
    });

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const res = await api.get(ENDPOINTS.PRODUCTS);
            setProducts(res.data || []);
        } catch {
            toast.error('Gagal memuat daftar produk.');
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const catalogGroups = useMemo(() => buildCatalogGroups(products), [products]);
    const categories = useMemo(
        () => ['All', ...new Set(catalogGroups.map((catalog) => catalog.category).filter(Boolean))],
        [catalogGroups]
    );
    const filteredCatalogs = useMemo(
        () => (selectedCategory === 'All'
            ? catalogGroups
            : catalogGroups.filter((catalog) => catalog.category === selectedCategory)),
        [catalogGroups, selectedCategory]
    );
    const selectedCatalog = catalogGroups.find((catalog) => catalog.key === selectedCatalogKey) || null;
    const selectedVariant = selectedCatalog?.variants.find((variant) => String(variant.variantId) === String(selectedVariantId))
        || selectedCatalog?.variants.find((variant) => variant.size === selectedSize && variant.color === selectedColor)
        || null;
    const minimumOrder = selectedCatalog?.minOrder || 100;
    const safeQuantity = Math.max(minimumOrder, Number(orderForm.quantity) || minimumOrder);
    const valvePrice = orderForm.useValve && selectedCatalog?.addons?.valvePrice
        ? selectedCatalog.addons.valvePrice
        : 0;
    const basePrice = selectedVariant
        ? (safeQuantity >= 1000 ? selectedVariant.priceB2B : selectedVariant.priceB2C)
        : 0;
    const totalPrice = (basePrice + valvePrice) * safeQuantity;

    useEffect(() => {
        if (catalogGroups.length === 0 || selectedCatalogKey) return;

        let nextCatalog = null;

        if (initialCatalogKey) {
            nextCatalog = catalogGroups.find((catalog) => catalog.key === initialCatalogKey || catalog.slug === initialCatalogKey) || null;
        }

        if (!nextCatalog && initialProductId) {
            nextCatalog = catalogGroups.find((catalog) =>
                catalog.productId === initialProductId
                || catalog.variants.some((variant) => variant.sourceProductId === initialProductId)
            ) || null;
        }

        if (!nextCatalog) {
            nextCatalog = catalogGroups[0];
        }

        const nextVariant = nextCatalog?.variants.find((variant) => variant.stock > 0)
            || nextCatalog?.variants[0]
            || null;

        setSelectedCategory(nextCatalog?.category || 'All');
        setSelectedCatalogKey(nextCatalog?.key || '');
        setSelectedVariantId(nextVariant?.variantId || '');
        setSelectedSize(nextVariant?.size || '');
        setSelectedColor(nextVariant?.color || '');
        setOrderForm((current) => ({
            ...current,
            productId: nextVariant?.sourceProductId || nextCatalog?.productId || '',
            variantId: nextVariant?.variantId || '',
            quantity: Math.max(nextCatalog?.minOrder || 100, Number(current.quantity) || nextCatalog?.minOrder || 100)
        }));
    }, [catalogGroups, initialCatalogKey, initialProductId, selectedCatalogKey]);

    useEffect(() => {
        if (!selectedCatalog) return;

        setOrderForm((current) => ({
            ...current,
            productId: selectedVariant?.sourceProductId || selectedCatalog.productId || '',
            variantId: selectedVariant?.variantId || '',
            quantity: Math.max(selectedCatalog.minOrder || 100, Number(current.quantity) || selectedCatalog.minOrder || 100)
        }));
    }, [selectedCatalog, selectedVariant]);

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
        setSelectedVariantId(nextVariant?.variantId || '');
        setSelectedSize(nextVariant?.size || '');
        setSelectedColor(nextVariant?.color || '');
    };

    const handleSelectCatalog = (catalog) => {
        const nextVariant = catalog.variants.find((variant) => variant.stock > 0)
            || catalog.variants[0]
            || null;

        setSelectedCategory(catalog.category);
        setSelectedCatalogKey(catalog.key);
        setSelectedVariantId(nextVariant?.variantId || '');
        setSelectedSize(nextVariant?.size || '');
        setSelectedColor(nextVariant?.color || '');
        setOrderForm((current) => ({
            ...current,
            useValve: false,
            quantity: Math.max(catalog.minOrder || 100, Number(current.quantity) || catalog.minOrder || 100)
        }));
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
        setSelectedVariantId(nextVariant?.variantId || '');
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
        setSelectedVariantId(nextVariant?.variantId || '');
    };

    const handleSelectVariant = (variant) => {
        setSelectedVariantId(variant?.variantId || '');
        setSelectedSize(variant?.size || '');
        setSelectedColor(variant?.color || '');
        setOrderForm((current) => ({
            ...current,
            productId: variant?.sourceProductId || selectedCatalog?.productId || '',
            variantId: variant?.variantId || '',
        }));
    };

    const handleAddToCart = () => {
        if (!orderForm.productId || !selectedCatalog || !selectedVariant) {
            return toast.error('Silakan pilih katalog dan varian terlebih dahulu.');
        }

        if (safeQuantity % 100 !== 0) {
            return toast.error('Jumlah pesanan harus kelipatan 100 pcs.');
        }

        if (safeQuantity > selectedVariant.stock) {
            return toast.error(`Stok tidak mencukupi. Hanya tersedia ${selectedVariant.stock} pcs untuk varian ini.`);
        }

        const existingCart = getCartItems();
        const existingItem = existingCart.find((item) =>
            item.productId === orderForm.productId
            && item.variantId === selectedVariant.variantId
            && item.useValve === orderForm.useValve
        );
        const nextQuantity = (Number(existingItem?.quantity) || 0) + safeQuantity;

        if (nextQuantity > selectedVariant.stock) {
            return toast.error(`Total item di keranjang (${nextQuantity} pcs) melebihi stok yang tersedia (${selectedVariant.stock} pcs).`);
        }

        upsertCartItem({
            productId: orderForm.productId,
            variantId: selectedVariant.variantId,
            quantity: safeQuantity,
            totalPrice,
            name: selectedCatalog.name,
            sku: selectedVariant.sku,
            selectedColor: selectedVariant.color,
            selectedSize: selectedVariant.size,
            useValve: orderForm.useValve,
            unitPrice: basePrice + valvePrice,
            imageUrl: selectedCatalog.images?.[0]?.url || '',
            productCategory: selectedCatalog.category || '',
        });
        toast.success('Varian produk ditambahkan ke keranjang.');
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();

        if (!orderForm.productId || !selectedCatalog || !selectedVariant) {
            return toast.error('Silakan pilih katalog, ukuran, dan warna terlebih dahulu.');
        }

        if (safeQuantity % 100 !== 0) {
            return toast.error('Jumlah pesanan harus kelipatan 100 pcs.');
        }

        if (safeQuantity > selectedVariant.stock) {
            return toast.error(`Stok tidak mencukupi. Hanya tersedia ${selectedVariant.stock} pcs untuk varian ini.`);
        }

        setCreatingOrder(true);
        try {
            await api.post(ENDPOINTS.ORDERS, {
                productId: orderForm.productId,
                variantId: orderForm.variantId || undefined,
                quantity: safeQuantity,
                useValve: orderForm.useValve
            });
            toast.success('Pesanan berhasil dibuat!');
            setTimeout(() => navigate('/portal'), 500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan.');
        } finally {
            setCreatingOrder(false);
        }
    };


    return (
        <div className="min-h-screen bg-surface-bright font-sans text-on-surface selection:bg-primary/20">
            <CustomerNavbar activeMenu="catalog" onMenuChange={(menu) => navigate('/portal?menu=' + menu)} />

            <main className="pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-10 flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary"
                        >
                            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                            Kembali
                        </button>
                    </div>

                    <div className="mb-10">
                        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tighter text-slate-900 capitalize sm:gap-4 sm:text-4xl">
                            <ShoppingCart className="h-10 w-10 text-primary" />
                            Buat Pesanan Baru
                        </h1>
                        <p className="mt-2 font-medium text-slate-500">Pilih katalog kemasan, lalu tentukan varian ukuran dan warna yang Anda butuhkan.</p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                        <div className="p-6 sm:p-8 lg:p-10">
                            {loadingProducts ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Memuat katalog...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateOrder} className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                            <Layers size={16} /> Pilih Kategori
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category) => (
                                                 <button
                                                     key={category}
                                                     type="button"
                                                     onClick={() => handleSelectCategory(category)}
                                                     data-testid={`category-btn-${category}`}
                                                     className={`rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === category
                                                             ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                             : 'border border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30 hover:text-primary'
                                                         }`}
                                                 >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                            <Package size={16} /> Pilih Katalog
                                        </label>
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {filteredCatalogs.map((catalog) => (
                                                 <button
                                                     key={catalog.key}
                                                     type="button"
                                                     onClick={() => handleSelectCatalog(catalog)}
                                                     data-testid={`catalog-btn-${catalog.key}`}
                                                     className={`rounded-3xl border p-5 text-left transition-all ${selectedCatalogKey === catalog.key
                                                             ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                             : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm'
                                                         }`}
                                                 >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{catalog.category}</p>
                                                            <h3 className="mt-1 text-lg font-black text-slate-900">{catalog.name}</h3>
                                                            <p className="mt-1 text-sm font-medium text-slate-500">{catalog.materialLabel}</p>
                                                        </div>
                                                        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mulai</p>
                                                            <p className="mt-1 text-sm font-black text-primary">{formatCurrency(catalog.priceB2B)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {catalog.availableSizes.slice(0, 5).map((size) => (
                                                            <span key={size} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                                                                {size}
                                                            </span>
                                                        ))}
                                                        {catalog.availableSizes.length > 5 && (
                                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                                                                +{catalog.availableSizes.length - 5} ukuran
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedCatalog && (
                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                                            <div className="space-y-8">
                                                <VariantSelectorSection
                                                    title="Pilih Varian"
                                                    activeVariantLabel={selectedVariant ? `${selectedVariant.size} • ${selectedVariant.color}` : 'Belum dipilih'}
                                                    variants={selectedCatalog.variants}
                                                    selectedVariantId={selectedVariant?.variantId || selectedVariantId}
                                                    sizeOptions={selectedCatalog.availableSizes}
                                                    colorOptions={selectedCatalog.availableColors}
                                                    selectedSize={selectedSize}
                                                    selectedColor={selectedColor}
                                                    isSizeDisabled={isSizeDisabled}
                                                    isColorDisabled={isColorDisabled}
                                                    onSelectVariant={handleSelectVariant}
                                                    onSelectSize={handleSelectSize}
                                                    onSelectColor={handleSelectColor}
                                                    getVariantId={(variant) => variant.variantId}
                                                />

                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    <div className="space-y-3">
                                                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">#</span>
                                                            Kuantitas (pcs)
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                 type="number"
                                                                 required
                                                                 min={minimumOrder}
                                                                 step={minimumOrder}
                                                                 max={selectedVariant?.stock || undefined}
                                                                 data-testid="order-quantity-input"
                                                                 className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-6 pr-16 text-xl font-black text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                 value={safeQuantity}
                                                                onChange={(e) => setOrderForm((current) => ({
                                                                    ...current,
                                                                    quantity: Number(e.target.value) || minimumOrder
                                                                }))}
                                                            />
                                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">pcs</span>
                                                        </div>
                                                        <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                            <Info size={12} /> Minimal order {minimumOrder.toLocaleString()} pcs. Harga B2B aktif mulai 1000 pcs.
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tambahan Valve</label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all ${orderForm.useValve
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                                } ${(selectedCatalog.addons?.valvePrice || 0) <= 0 ? 'cursor-not-allowed opacity-40' : ''}`}>
                                                                <input
                                                                    type="radio"
                                                                    name="valve"
                                                                    checked={orderForm.useValve}
                                                                    disabled={(selectedCatalog.addons?.valvePrice || 0) <= 0}
                                                                    onChange={() => setOrderForm((current) => ({ ...current, useValve: true }))}
                                                                    className="sr-only"
                                                                />
                                                                <span className="font-black">Ya, Pakai</span>
                                                            </label>
                                                            <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all ${!orderForm.useValve
                                                                    ? 'border-primary bg-primary text-white'
                                                                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                                }`}>
                                                                <input
                                                                    type="radio"
                                                                    name="valve"
                                                                    checked={!orderForm.useValve}
                                                                    onChange={() => setOrderForm((current) => ({ ...current, useValve: false }))}
                                                                    className="sr-only"
                                                                />
                                                                <span className="font-black">Tidak</span>
                                                            </label>
                                                        </div>
                                                        {selectedCatalog.addons?.valvePrice > 0 && orderForm.useValve && (
                                                            <p className="flex items-center gap-1 text-[10px] font-bold text-primary">
                                                                + Tambahan biaya {formatCurrency(selectedCatalog.addons.valvePrice)}/pcs
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
                                                <div className="mb-6 flex items-center gap-3">
                                                    <DollarSign className="h-6 w-6 text-white/90" />
                                                    <p className="text-sm font-black uppercase tracking-widest text-white/90">Ringkasan Varian</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <SummaryRow label="Katalog" value={selectedCatalog.name} />
                                                    <SummaryRow label="Ukuran" value={selectedVariant?.size || '-'} />
                                                    <SummaryRow label="Warna" value={selectedVariant?.color || '-'} />
                                                    <SummaryRow
                                                        label="Stok Varian"
                                                        value={`${(selectedVariant?.stock || 0).toLocaleString()} pcs`}
                                                        danger={(selectedVariant?.stock || 0) < minimumOrder}
                                                    />
                                                    <SummaryRow label="Harga B2C" value={formatCurrency(selectedVariant?.priceB2C || 0)} />
                                                    <SummaryRow label="Harga B2B" value={formatCurrency(selectedVariant?.priceB2B || 0)} />
                                                    <SummaryRow label="Harga Aktif" value={formatCurrency(basePrice)} />
                                                    <SummaryRow label="Valve" value={formatCurrency(valvePrice)} />
                                                </div>

                                                <div className="mt-6 border-t border-white/10 pt-5">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-bold text-white/70">Total Harga</p>
                                                        <p className="text-3xl font-black tracking-tight">{formatCurrency(totalPrice)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={catalogGroups.length === 0 || !selectedVariant || (selectedVariant?.stock || 0) <= 0}
                                            className="flex w-full items-center justify-center gap-3 rounded-3xl border border-primary bg-white py-5 text-lg font-black text-primary shadow-sm transition-all hover:-translate-y-1 hover:bg-primary/5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            <ShoppingCart className="h-6 w-6" /> Tambah ke Keranjang
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={creatingOrder || catalogGroups.length === 0 || !selectedVariant || (selectedVariant?.stock || 0) <= 0}
                                            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-lg font-black text-white shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            {creatingOrder ? <><Loader2 className="h-6 w-6 animate-spin" /> Memproses Pesanan...</> : 'Konfirmasi & Buat Pesanan'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const SummaryRow = ({ label, value, danger }) => (
    <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold text-white/60">{label}</p>
        <p className={`text-sm font-black ${danger ? 'text-red-300' : 'text-white'}`}>{value}</p>
    </div>
);
