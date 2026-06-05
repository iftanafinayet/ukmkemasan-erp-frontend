import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from './Sidebar';
import CustomerNavbar from './customer-portal/CustomerNavbar';
import { ENDPOINTS, storage } from '../config/environment';
import {
    ArrowLeft, Loader2, Package, Edit3, Trash2,
    ShoppingCart, Layers, Ruler, Box, ImagePlus,
    RefreshCw, AlertCircle, MessageSquare, Minus, Plus, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext
} from './ui/carousel';
import { getCartItems, upsertCartItem } from '../utils/cart';
import VariantSelectorSection from './customer-order/VariantSelectorSection';
import { formatCurrency } from '../utils/formatters';
import MobileProductDetailPage from './customer-portal/mobile/MobileProductDetailPage';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = storage.getUser();
    const isAdmin = user?.role === 'admin';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(100);
    const [useValve, setUseValve] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const carouselApi = useRef(null);

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(ENDPOINTS.PRODUCT_BY_ID(id));
            setProduct(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                storage.clear();
                return;
            }
            toast.error('Gagal memuat detail produk.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        if (!product) return;

        if (product.category) {
          api.get(ENDPOINTS.PRODUCTS).then((res) => {
            const sameCategory = (res.data || []).filter(
              (p) => p.category === product.category && p._id !== product._id
            ).slice(0, 8);
            setRelatedProducts(sameCategory);
          }).catch(() => {});
        }

        const firstAvailableVariant = product.variants?.find((variant) => variant.stock > 0)
            || product.variants?.[0]
            || null;

        setSelectedVariantId(firstAvailableVariant?._id || '');
        setSelectedSize(firstAvailableVariant?.size || '');
        setSelectedColor(firstAvailableVariant?.color || '');
        setQuantity(product.minOrder || 100);
        setUseValve(false);
    }, [product]);

    const handleDelete = async () => {
        if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            await api.delete(ENDPOINTS.PRODUCT_BY_ID(id));
            toast.success('Produk berhasil dihapus!');
            navigate(isAdmin ? '/admin' : '/portal');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus produk.');
        }
    };

    const goBack = () => navigate(isAdmin ? '/admin' : '/portal?menu=catalog');

    const handleMenuChange = (menuId) => {
        if (isAdmin) {
            navigate('/admin');
        } else {
            navigate(`/portal?menu=${menuId}`);
        }
    };

    const variants = useMemo(() => product?.variants || [], [product]);
    const minimumOrder = product?.minOrder || 100;
    const safeQuantity = Math.max(minimumOrder, Number(quantity) || minimumOrder);

    const sizeOptions = useMemo(() => [...new Set(variants.map((variant) => variant.size))], [variants]);
    const colorOptions = useMemo(() => [...new Set(variants.map((variant) => variant.color))], [variants]);

    const selectedVariant = useMemo(() => 
        variants.find((variant) => String(variant._id) === String(selectedVariantId))
        || variants.find((variant) => variant.size === selectedSize && variant.color === selectedColor)
        || null,
    [variants, selectedVariantId, selectedSize, selectedColor]);

    const priceTier = safeQuantity >= 1000 ? 'B2B' : 'B2C';
    const baseVariantPrice = selectedVariant
        ? (safeQuantity >= 1000 ? selectedVariant.priceB2B : selectedVariant.priceB2C)
        : 0;
    const valvePrice = useValve ? product?.addons?.valvePrice || 0 : 0;
    const unitPrice = baseVariantPrice + valvePrice;
    const totalPrice = unitPrice * safeQuantity;
    const displayedStock = selectedVariant?.stock ?? product?.stockPolos ?? 0;

    const isSizeDisabled = (size) => !variants.some((variant) =>
        variant.size === size
        && (!selectedColor || variant.color === selectedColor)
        && variant.stock > 0
    );

    const isColorDisabled = (color) => !variants.some((variant) =>
        variant.color === color
        && (!selectedSize || variant.size === selectedSize)
        && variant.stock > 0
    );

    const handleSelectSize = (size) => {
        const nextVariant = variants.find((variant) =>
            variant.size === size
            && variant.color === selectedColor
            && variant.stock > 0
        ) || variants.find((variant) =>
            variant.size === size
            && variant.stock > 0
        ) || variants.find((variant) => variant.size === size);

        setSelectedSize(size);
        setSelectedColor(nextVariant?.color || '');
        setSelectedVariantId(nextVariant?._id || '');
    };

    const handleSelectColor = (color) => {
        const nextVariant = variants.find((variant) =>
            variant.color === color
            && variant.size === selectedSize
            && variant.stock > 0
        ) || variants.find((variant) =>
            variant.color === color
            && variant.stock > 0
        ) || variants.find((variant) => variant.color === color);

        setSelectedColor(color);
        setSelectedSize(nextVariant?.size || '');
        setSelectedVariantId(nextVariant?._id || '');
    };

    const handleSelectVariant = (variant) => {
        setSelectedVariantId(variant?._id || '');
        setSelectedSize(variant?.size || '');
        setSelectedColor(variant?.color || '');
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            toast.error('Pilih ukuran dan warna terlebih dahulu.');
            return;
        }

        if (safeQuantity % 100 !== 0) {
            toast.error('Jumlah pesanan harus kelipatan 100 pcs.');
            return;
        }

        if (selectedVariant.stock <= 0) {
            toast.error('Varian ini sedang habis.');
            return;
        }

        if (safeQuantity > selectedVariant.stock) {
            toast.error(`Stok tidak mencukupi. Hanya tersedia ${selectedVariant.stock} pcs untuk varian ini.`);
            return;
        }

        const cartItem = {
            productId: product._id,
            variantId: selectedVariant._id,
            quantity: safeQuantity,
            totalPrice,
            name: product.name,
            sku: selectedVariant.sku,
            selectedColor: selectedVariant.color,
            selectedSize: selectedVariant.size,
            useValve,
            unitPrice,
            imageUrl: product.images?.[0]?.url || '',
            productCategory: product.category || '',
        };

        const existingItem = getCartItems().find((item) =>
            item.productId === cartItem.productId
            && item.variantId === cartItem.variantId
            && item.useValve === cartItem.useValve
        );
        const nextQuantity = (Number(existingItem?.quantity) || 0) + safeQuantity;

        if (nextQuantity > selectedVariant.stock) {
            toast.error(`Total item di keranjang (${nextQuantity} pcs) melebihi stok yang tersedia (${selectedVariant.stock} pcs).`);
            return;
        }

        upsertCartItem(cartItem);
        toast.success('Varian produk ditambahkan ke keranjang.');
    };

    return (
        <div className={isAdmin ? "flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20 lg:h-screen" : "min-h-screen bg-transparent font-sans text-on-surface"}>
            {!isAdmin && (
                <div
                  className="hidden lg:block fixed inset-0 -z-10 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: "url('/background/bg.svg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                  }}
                />
            )}
            {/* Desktop View */}
            <div className="hidden lg:flex flex-col flex-1">
                {isAdmin ? (
                    <Sidebar activeMenu="inventory" onMenuChange={handleMenuChange} />
                ) : (
                    <CustomerNavbar activeMenu="catalog" onMenuChange={(menu) => navigate('/portal?menu=' + menu)} />
                )}
                <main className={isAdmin ? "flex-1 overflow-y-auto overflow-x-hidden" : "pt-32 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1620px] mx-auto space-y-12"}>
                    <div className={isAdmin ? "mx-auto max-w-5xl px-4 pb-6 pt-20 sm:px-6 sm:pb-8 lg:p-8" : "w-full"}>
                        <div className="mb-4">
                          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-3">
                            <button onClick={() => navigate(isAdmin ? '/admin' : '/portal?menu=catalog')} className="hover:text-primary transition-colors">Beranda</button>
                            <ChevronRight size={12} />
                            <button onClick={() => navigate(isAdmin ? '/admin' : '/portal?menu=catalog')} className="hover:text-primary transition-colors">Katalog</button>
                            {product?.category && (
                              <>
                                <ChevronRight size={12} />
                                <span className="text-slate-600 font-semibold">{product.category}</span>
                              </>
                            )}
                            {product?.name && (
                              <>
                                <ChevronRight size={12} />
                                <span className="text-slate-800 font-bold truncate max-w-[200px]">{product.name}</span>
                              </>
                            )}
                          </nav>
                          <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={goBack}
                                data-testid="product-detail-back-btn"
                                className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary"
                            >
                                <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                                Kembali
                            </button>
                            <button
                                    onClick={fetchProduct}
                                    data-testid="product-detail-refresh-btn"
                                    className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition-all duration-500 hover:rotate-180 hover:bg-slate-100"
                                >
                            <RefreshCw size={20} className={loading ? 'animate-spin text-primary' : ''} />
                        </button>
                    </div>
                    </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Memuat detail produk...</p>
                        </div>
                    )}

                    {!loading && !product && (
                        <div className="flex flex-col items-center justify-center py-32 opacity-40">
                            <AlertCircle size={60} strokeWidth={1} className="mb-4 text-slate-600" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Produk tidak ditemukan</p>
                        </div>
                    )}

                     {!loading && product && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Z-Pattern: Images + Specs (left column) | Buy Card (right column, sticky) */}
                            <div className={`grid grid-cols-1 gap-8 ${isAdmin ? 'lg:grid-cols-[1.3fr_1fr]' : 'lg:grid-cols-[1.3fr_1fr]'}`}>
                                {/* Left Column: Images → Specs → Deskripsi (stacked, no space gap) */}
                                <div className="space-y-6">
                                    {/* Images */}
                                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                        {product.images?.length > 0 ? (
                                            <div className="relative">
                                                <Carousel className="w-full" opts={{ loop: true, startIndex: activeImageIdx }} setApi={(api) => { carouselApi.current = api; api.on('select', () => setActiveImageIdx(api.selectedScrollSnap())); }}>
                                                    <CarouselContent>
                                                        {product.images.map((img, idx) => (
                                                            <CarouselItem key={idx}>
                                                                <div className="relative aspect-[4/3] bg-white flex items-center justify-center p-4">
                                                                    <img src={img.url} alt={img.alt || product.name} className="max-h-full max-w-full object-contain" />
                                                                </div>
                                                            </CarouselItem>
                                                        ))}
                                                    </CarouselContent>
                                                    {product.images.length > 1 && (
                                                        <>
                                                            <CarouselPrevious className="left-3 h-9 w-9 border-0 bg-white/90 shadow-md hover:bg-white" />
                                                            <CarouselNext className="right-3 h-9 w-9 border-0 bg-white/90 shadow-md hover:bg-white" />
                                                        </>
                                                    )}
                                                </Carousel>
                                                {/* Thumbnail overlay scroll */}
                                                {product.images.length > 1 && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent pt-8 pb-2 px-3">
                                                        <div className="flex gap-1.5 overflow-x-auto justify-center flex-nowrap scrollbar-thin">
                                                            {product.images.map((img, idx) => (
                                                                <button key={idx} onClick={() => { setActiveImageIdx(idx); carouselApi.current?.scrollTo(idx); }}
                                                                    className={`flex-shrink-0 w-10 h-10 overflow-hidden rounded-md border-2 transition-all ${activeImageIdx === idx ? 'border-white shadow-md brightness-100' : 'border-white/50 brightness-75 hover:brightness-90'}`}>
                                                                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex aspect-[4/3] flex-col items-center justify-center bg-slate-50">
                                                <ImagePlus className="mb-2 h-12 w-12 text-slate-300" />
                                                <p className="text-xs font-bold text-slate-400">Belum ada foto</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Informasi Produk (directly below images) */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Produk</h3>
                                        <table className="w-full text-sm">
                                            <tbody>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-2.5 text-slate-500 font-medium w-1/3">Kategori</td>
                                                    <td className="py-2.5 text-slate-800 font-semibold">{product.category}</td>
                                                </tr>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-2.5 text-slate-500 font-medium">Material</td>
                                                    <td className="py-2.5 text-slate-800 font-semibold">{product.material || '-'}</td>
                                                </tr>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-2.5 text-slate-500 font-medium">Varian</td>
                                                    <td className="py-2.5 text-slate-800 font-semibold">{variants.length} opsi</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2.5 text-slate-500 font-medium">Min. Order</td>
                                                    <td className="py-2.5 text-slate-800 font-semibold">{minimumOrder.toLocaleString()} pcs</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Deskripsi */}
                                    {product.description && (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3">Deskripsi</h3>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                                        </div>
                                    )}

                                    {/* Related Products (inline in left column, below deskripsi) */}
                                    {!isAdmin && relatedProducts.length > 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-bold text-slate-800">Produk Terkait</h3>
                                                <button onClick={() => navigate('/portal?menu=catalog')} className="text-xs font-semibold text-primary hover:underline">Lihat Semua</button>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3">Kategori {product.category}</p>
                                            <div className="space-y-3">
                                                {relatedProducts.slice(0, 4).map((rp) => (
                                                    <button key={rp._id} onClick={() => navigate(`/portal/products/${rp._id}`)} className="w-full flex items-center gap-3 text-left group p-2 rounded-xl hover:bg-slate-50 transition-all">
                                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                                                            {rp.images?.[0] ? <img src={rp.images[0].url} alt={rp.name} className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImagePlus size={18} /></div>}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">{rp.name}</p>
                                                            <p className="text-xs font-bold text-primary mt-0.5">{formatCurrency(rp.priceB2B || rp.priceB2C || 0)}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Sticky Buy Card */}
                                {!isAdmin && (
                                <div>
                                    <div className="sticky top-28 space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">{product.category}</span>
                                                {product.isNew && <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-md">Terbaru</span>}
                                            </div>
                                            <h1 className="text-base font-bold text-slate-900 leading-tight">{product.name}</h1>
                                            <div className="mt-4">
                                                <p className="text-2xl font-black text-primary">{selectedVariant ? formatCurrency(baseVariantPrice) : 'Pilih varian'}</p>
                                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{priceTier === 'B2B' ? 'Harga Grosir (≥1000 pcs)' : 'Harga Retail'}</p>
                                            </div>
                                            {selectedVariant && (
                                                <div className="flex items-center gap-3 mt-3 text-xs bg-slate-50 rounded-xl p-3">
                                                    <div><span className="text-slate-400">Retail</span><p className="font-bold text-slate-700">{formatCurrency(selectedVariant.priceB2C)}</p></div>
                                                    <div className="w-px h-8 bg-slate-200" />
                                                    <div><span className="text-slate-400">Grosir</span><p className="font-bold text-primary">{formatCurrency(selectedVariant.priceB2B)}</p></div>
                                                </div>
                                            )}
                                            <div className="mt-3 flex items-center gap-2 text-xs">
                                                <span className={`w-2 h-2 rounded-full ${displayedStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-slate-500">{displayedStock <= 0 ? 'Stok habis' : `Stok: ${displayedStock.toLocaleString()} pcs`}</span>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <VariantSelectorSection
                                                title="Pilih Varian"
                                                activeVariantLabel={selectedVariant ? `${selectedVariant.size} • ${selectedVariant.color}` : 'Belum dipilih'}
                                                variants={variants}
                                                selectedVariantId={selectedVariant?._id || selectedVariantId}
                                                sizeOptions={sizeOptions}
                                                colorOptions={colorOptions}
                                                selectedSize={selectedSize}
                                                selectedColor={selectedColor}
                                                isSizeDisabled={isSizeDisabled}
                                                isColorDisabled={isColorDisabled}
                                                onSelectVariant={handleSelectVariant}
                                                onSelectSize={handleSelectSize}
                                                onSelectColor={handleSelectColor}
                                                showDirectVariants={false}
                                                getVariantId={(variant) => variant._id}
                                                getVariantSku={(variant) => variant.sku || product.sku || '-'}
                                            />
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <p className="text-xs font-bold text-slate-500 mb-3">Jumlah Pesanan</p>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => setQuantity(Math.max(minimumOrder, safeQuantity - minimumOrder))} disabled={safeQuantity <= minimumOrder}
                                                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"><Minus size={16} /></button>
                                                <div className="relative flex-1">
                                                    <input type="number" min={minimumOrder} step={minimumOrder} max={selectedVariant?.stock || undefined} value={safeQuantity}
                                                        onChange={(e) => setQuantity(Number(e.target.value) || minimumOrder)}
                                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                </div>
                                                <button type="button" onClick={() => setQuantity(safeQuantity + minimumOrder)} disabled={selectedVariant?.stock ? safeQuantity >= selectedVariant.stock : false}
                                                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"><Plus size={16} /></button>
                                            </div>
                                            <p className="mt-2 text-[10px] text-slate-400">Min. {minimumOrder.toLocaleString()} pcs (kelipatan {minimumOrder.toLocaleString()})</p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <p className="text-xs font-bold text-slate-500 mb-3">Add-ons: Valve</p>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setUseValve(true)} disabled={(product.addons?.valvePrice || 0) <= 0}
                                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${useValve ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'} disabled:opacity-40`}>Pakai Valve</button>
                                                <button type="button" onClick={() => setUseValve(false)}
                                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${!useValve ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>Tanpa Valve</button>
                                            </div>
                                            {useValve && product.addons?.valvePrice > 0 && <p className="mt-2 text-[10px] font-bold text-primary">+ {formatCurrency(product.addons.valvePrice)}/pcs</p>}
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs text-slate-500">Total</span>
                                                <span className="text-xl font-black text-slate-900">{formatCurrency(totalPrice)}</span>
                                            </div>
                                            <button onClick={handleAddToCart} disabled={!selectedVariant || displayedStock <= 0}
                                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                                <ShoppingCart size={18} />
                                                {!storage.getToken() ? 'Tambah ke Keranjang' : 'Checkout Sekarang'}
                                            </button>
                                            <button onClick={() => navigate('/portal?menu=inquiries', { state: { prefillProduct: product } })}
                                                className="w-full mt-2 py-2.5 rounded-xl border border-primary/20 text-primary text-xs font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5">
                                                <MessageSquare size={14} />
                                                Tanyakan Produk Ini
                                            </button>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Informasi Pengiriman</p>
                                            <p className="text-xs text-slate-500 mt-1">Estimasi 3-5 hari kerja setelah pembayaran dikonfirmasi</p>
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* Admin */}
                                {isAdmin && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <h3 className="text-xs font-bold text-slate-500 mb-4">Admin Actions</h3>
                                    <button onClick={() => navigate('/admin')} className="w-full py-3 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 mb-2"><Edit3 size={16} /> Edit di Dashboard</button>
                                    <button onClick={handleDelete} className="w-full py-3 rounded-xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Trash2 size={16} /> Hapus Produk</button>
                                </div>
                                )}
                             </div>
                         </div>
                      )}
                 </div>
                 </main>
                 </div>

                {/* Mobile View */}
                {!isAdmin && (
                <MobileProductDetailPage 
                product={product}
                onBack={goBack}
                activeImageIdx={activeImageIdx}
                setActiveImageIdx={setActiveImageIdx}
                selectedSize={selectedSize}
                onSelectSize={handleSelectSize}
                selectedColor={selectedColor}
                onSelectColor={handleSelectColor}
                quantity={safeQuantity}
                setQuantity={setQuantity}
                useValve={useValve}
                setUseValve={setUseValve}
                onAddToCart={handleAddToCart}
                totalPrice={totalPrice}
                unitPrice={unitPrice}
                selectedVariant={selectedVariant}
                sizeOptions={sizeOptions}
                colorOptions={colorOptions}
                isSizeDisabled={isSizeDisabled}
                isColorDisabled={isColorDisabled}
                />
                )}
                </div>
                );
                }

