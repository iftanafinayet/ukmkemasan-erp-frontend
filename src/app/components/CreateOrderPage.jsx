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
import ShippingSelector from './customer-portal/ShippingSelector';
import { formatCurrency } from '../utils/formatters';

export default function CreateOrderPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialProductId = searchParams.get('productId') || '';
    const initialCatalogKey = searchParams.get('catalog') || '';
    const isSample = searchParams.get('orderType') === 'Sample';

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

    const [shipping, setShipping] = useState(null);

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
    const SAMPLE_SHIPPING = 20000;
    const safeQuantity = isSample
        ? Math.min(3, Math.max(1, Number(orderForm.quantity) || 1))
        : Math.max(minimumOrder, Number(orderForm.quantity) || minimumOrder);
    const valvePrice = (isSample || !orderForm.useValve || !selectedCatalog?.addons?.valvePrice)
        ? 0
        : selectedCatalog.addons.valvePrice;
    const basePrice = selectedVariant
        ? (isSample ? selectedVariant.priceB2C : (safeQuantity >= 1000 ? selectedVariant.priceB2B : selectedVariant.priceB2C))
        : 0;
    const subtotal = (basePrice + valvePrice) * safeQuantity;
    const totalPrice = isSample ? subtotal + SAMPLE_SHIPPING : subtotal;
    const grandTotal = isSample ? totalPrice : totalPrice + (shipping?.cost || 0);

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

        if (!isSample && safeQuantity % 100 !== 0) {
            return toast.error('Jumlah pesanan harus kelipatan 100 pcs.');
        }

        if (safeQuantity > selectedVariant.stock) {
            return toast.error(`Stok tidak mencukupi. Hanya tersedia ${selectedVariant.stock} pcs untuk varian ini.`);
        }

        if (!isSample && !shipping) {
            return toast.error('Pilih alamat tujuan & kurir (ongkir) terlebih dahulu.');
        }

        setCreatingOrder(true);
        try {
            const payload = {
                productId: orderForm.productId,
                variantId: orderForm.variantId || undefined,
                quantity: safeQuantity,
                useValve: orderForm.useValve
            };
            if (isSample) payload.orderType = 'Sample';
            if (!isSample && shipping) {
                payload.shipping = {
                    destinationId: shipping.destinationId,
                    courierCode: shipping.courierCode,
                    courierService: shipping.courierService,
                    cost: shipping.cost,
                    cashback: shipping.cashback,
                    recipient: shipping.recipient,
                };
            }
            await api.post(ENDPOINTS.ORDERS, payload);
            toast.success(isSample ? 'Sample berhasil dipesan!' : 'Pesanan berhasil dibuat!');
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

            <main className="pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                            Kembali
                        </button>
                    </div>

                    <div className="mb-8">
                        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-on-surface sm:gap-4 sm:text-4xl">
                            <ShoppingCart className="h-10 w-10 text-primary" />
                            {isSample ? 'Pesan Sample' : 'Buat Pesanan Baru'}
                            {isSample && <span className="text-xs bg-warning-container text-on-warning-container px-3 py-1 rounded-full font-bold">SAMPLE</span>}
                        </h1>
                        <p className="mt-2 font-medium text-on-surface-variant leading-relaxed">
                            {isSample
                                ? 'Pesan maksimal 3 pcs per sample. Pilih ukuran & warna yang ingin dicoba.'
                                : 'Pilih katalog kemasan, lalu tentukan varian ukuran dan warna yang Anda butuhkan.'}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-card">
                        <div className="p-6 sm:p-8 lg:p-10">
                            {loadingProducts ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Memuat katalog...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateOrder} className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                                            <Layers size={16} /> Pilih Kategori
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => handleSelectCategory(category)}
                                                    data-testid={`category-btn-${category}`}
                                                    className={`rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selectedCategory === category
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                        : 'border border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/30 hover:text-primary'
                                                        }`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                                            <Package size={16} /> Pilih Katalog
                                        </label>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {filteredCatalogs.map((catalog) => (
                                                <button
                                                    key={catalog.key}
                                                    type="button"
                                                    onClick={() => handleSelectCatalog(catalog)}
                                                    data-testid={`catalog-btn-${catalog.key}`}
                                                    className={`rounded-2xl border px-5 py-4 text-left transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                                                        selectedCatalogKey === catalog.key
                                                            ? 'border-primary bg-primary/5 shadow-elevated shadow-primary/10'
                                                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30 hover:shadow-card'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-primary uppercase tracking-wider truncate">{catalog.category}</p>
                                                            <h3 className="mt-0.5 text-sm font-bold text-on-surface truncate">{catalog.name}</h3>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-[10px] font-semibold text-muted uppercase">Mulai</p>
                                                            <p className="text-sm font-bold text-primary">{formatCurrency(catalog.priceB2B)}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedCatalog && (
                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
                                            <div className="space-y-8">
                                                <VariantSelectorSection
                                                    title="Pilih Ukuran & Warna"
                                                    activeVariantLabel={selectedVariant ? `${selectedVariant.size} • ${selectedVariant.color}` : 'Belum dipilih'}
                                                    description="Pilih ukuran dan warna yang tersedia untuk varian ini."
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
                                                    showDirectVariants={false}
                                                />

                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    <div className="space-y-3">
                                                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">#</span>
                                                            Kuantitas (pcs)
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                required
                                                                min={isSample ? 1 : minimumOrder}
                                                                step={isSample ? 1 : minimumOrder}
                                                                max={isSample ? 3 : (selectedVariant?.stock || undefined)}
                                                                data-testid="order-quantity-input"
                                                                className="w-full rounded-2xl border border-outline-variant bg-surface-container-low py-4 pl-6 pr-16 text-xl font-bold text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                value={safeQuantity}
                                                                onChange={(e) => setOrderForm((current) => ({
                                                                    ...current,
                                                                    quantity: Number(e.target.value) || (isSample ? 1 : minimumOrder)
                                                                }))}
                                                            />
                                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted">pcs</span>
                                                        </div>
                                                        <p className="flex items-center gap-1 text-[10px] font-bold text-muted">
                                                            <Info size={12} /> {isSample ? 'Maksimal 3 pcs untuk sample.' : `Minimal order ${minimumOrder.toLocaleString()} pcs. Harga B2B aktif mulai 1000 pcs.`}
                                                        </p>
                                                    </div>

                                                    {selectedCatalog.addons?.valvePrice > 0 && (
                                                        <div className="space-y-3">
                                                            <label className="text-xs font-black uppercase tracking-widest text-muted">Tambahan Valve</label>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${orderForm.useValve
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-outline-variant/30 bg-surface-container-lowest text-muted hover:border-outline-variant'
                                                                    }`}>
                                                                    <input type="radio" name="valve" checked={orderForm.useValve} onChange={() => setOrderForm((current) => ({ ...current, useValve: true }))} className="sr-only" />
                                                                    <span className="font-bold">Ya, Pakai</span>
                                                                </label>
                                                                <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${!orderForm.useValve
                                                                    ? 'border-primary bg-primary text-white'
                                                                    : 'border-outline-variant/30 bg-surface-container-lowest text-muted hover:border-outline-variant'
                                                                    }`}>
                                                                    <input type="radio" name="valve" checked={!orderForm.useValve} onChange={() => setOrderForm((current) => ({ ...current, useValve: false }))} className="sr-only" />
                                                                    <span className="font-bold">Tidak</span>
                                                                </label>
                                                            </div>
                                                            {orderForm.useValve && (
                                                                <p className="flex items-center gap-1 text-[10px] font-bold text-primary">
                                                                    + Tambahan biaya {formatCurrency(selectedCatalog.addons.valvePrice)}/pcs
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-3xl bg-primary p-6 text-white shadow-elevated shadow-primary/20 sm:p-8">
                                                <div className="mb-6 flex items-center gap-3">
                                                    <p className="text-l font-bold uppercase tracking-wider text-white/90">Ringkasan Varian</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <SummaryRow label="Katalog" value={selectedCatalog.name} />
                                                    <SummaryRow label="Ukuran" value={selectedVariant?.size || '-'} />
                                                    <SummaryRow label="Warna" value={selectedVariant?.color || '-'} />
                                                    <SummaryRow label="Stok" value={`${(selectedVariant?.stock || 0).toLocaleString()} pcs`} danger={(selectedVariant?.stock || 0) < minimumOrder} />
                                                    <SummaryRow label="Harga B2C" value={formatCurrency(selectedVariant?.priceB2C || 0)} />
                                                    <SummaryRow label="Harga B2B" value={formatCurrency(selectedVariant?.priceB2B || 0)} />
                                                    <SummaryRow label="Harga Aktif" value={formatCurrency(basePrice)} />
                                                    <SummaryRow label="Valve" value={formatCurrency(valvePrice)} />
                                                    {isSample && <SummaryRow label="Ongkir (fixed)" value={formatCurrency(SAMPLE_SHIPPING)} />}
                                                    {!isSample && shipping && <SummaryRow label={`Ongkir (${shipping.courierCode})`} value={formatCurrency(shipping.cost)} />}
                                                </div>

                                                <div className="mt-6 border-t border-white/20 pt-5">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-semibold text-white/80">Total Harga</p>
                                                        <p className="text-3xl font-bold tracking-tight">{formatCurrency(grandTotal)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCatalog && !isSample && (
                                        <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-card sm:p-8">
                                            <div className="mb-5 flex items-center gap-3">
                                                <ShoppingCart className="h-5 w-5 text-primary" />
                                                <p className="text-sm font-black uppercase tracking-widest text-muted">Alamat & Pengiriman</p>
                                            </div>
                                            <ShippingSelector
                                                items={[{ productId: orderForm.productId, variantId: orderForm.variantId, quantity: safeQuantity }]}
                                                itemValue={subtotal}
                                                value={shipping}
                                                onChange={setShipping}
                                                formatCurrency={formatCurrency}
                                            />
                                        </div>
                                    )}

                                    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={catalogGroups.length === 0 || !selectedVariant || (selectedVariant?.stock || 0) <= 0}
                                            className="flex w-full items-center justify-center gap-3 rounded-3xl border border-primary bg-surface-container-lowest py-5 text-lg font-bold text-primary shadow-card transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-1 hover:bg-primary/5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            <ShoppingCart className="h-6 w-6" /> Tambah ke Keranjang
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={creatingOrder || catalogGroups.length === 0 || !selectedVariant || (selectedVariant?.stock || 0) <= 0}
                                            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-1 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            {creatingOrder ? <><Loader2 className="h-6 w-6 animate-spin" /> Memproses...</> : (isSample ? 'Konfirmasi & Pesan Sample' : 'Konfirmasi & Buat Pesanan')}
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
        <p className="text-xs font-semibold text-white/70">{label}</p>
        <p className={`text-sm font-bold ${danger ? 'text-white/50 line-through' : 'text-white'}`}>{value}</p>
    </div>
);
