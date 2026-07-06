import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { ArrowLeft, ShoppingCart, MessageSquare } from 'lucide-react';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';
import { getCartItems } from '../../../utils/cart';
import { Carousel, CarouselContent, CarouselItem } from '../../ui/Carousel';
import useScrollToTop from '../../../hooks/useScrollToTop';

export default function MobileProductDetailPage({
  product,
  onBack,
  activeImageIdx,
  setActiveImageIdx,
  selectedSize,
  onSelectSize,
  selectedColor,
  onSelectColor,
  quantity,
  setQuantity,
  useValve,
  setUseValve,
  onAddToCart,
  totalPrice,
  unitPrice,
  selectedVariant,
  sizeOptions,
  colorOptions,
  isSizeDisabled,
  isColorDisabled
}) {
  const navigate = useNavigate();
  const isLoggedIn = !!storage.getToken();
  const cartCount = getCartItems().length;
  const [imageApi, setImageApi] = useState(null);
  useScrollToTop();

  useEffect(() => {
    if (!imageApi) return;
    const sync = () => setActiveImageIdx(imageApi.selectedScrollSnap());
    sync();
    imageApi.on('select', sync);
    return () => imageApi.off('select', sync);
  }, [imageApi, setActiveImageIdx]);

  useEffect(() => {
    if (!imageApi) return;
    if (imageApi.selectedScrollSnap() !== activeImageIdx) {
      imageApi.scrollTo(activeImageIdx);
    }
  }, [imageApi, activeImageIdx]);

  if (!product) return null;

  const handleAddToCartClick = () => {
    if (!isLoggedIn) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }
    onAddToCart();
  };

  return (
    <div className="lg:hidden bg-background min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant/20 px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate('/portal?menu=catalog')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="text-[16px] font-bold text-on-surface truncate max-w-[180px] font-headline">{product.name}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/portal?menu=cart')} className="relative">
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest" />
            )}
          </button>
        </div>
      </header>

      <main className="pt-14">
        {/* Image Carousel */}
        <section className="bg-surface-container-lowest">
          <div className="relative">
            <Carousel className="w-full" opts={{ loop: true, align: 'start' }} setApi={setImageApi}>
              <CarouselContent className="ml-0">
                {(product.images?.length > 0 ? product.images : [{ url: "https://via.placeholder.com/400" }]).map((img, idx) => (
                  <CarouselItem key={idx} className="pl-0 basis-full">
                    <div className="aspect-square w-full overflow-hidden bg-surface-container-low">
                      <img
                        src={img.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {product.images?.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {product.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${activeImageIdx === idx ? 'w-6 bg-primary' : 'w-1.5 bg-outline-variant'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeImageIdx === idx ? 'border-primary' : 'border-transparent opacity-60'
                    }`}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Product Info */}
        <section className="bg-surface-container-lowest px-4 py-6 border-b border-outline-variant/20">
          <h1 className="text-[18px] font-bold text-on-surface leading-tight mb-1">{product.name}</h1>
          <div className="flex items-center justify-between mb-1">
            <span className="text-primary text-[22px] font-extrabold">{formatCurrency(unitPrice)}</span>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {quantity >= 1000 ? 'Grosir' : 'Retail'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant text-[12px]">
            <div>Terjual {product.totalSold || 0}+</div>
            <div className="w-px h-3 bg-outline-variant/30"></div>
            <div className="text-primary font-bold">Stok: {selectedVariant?.stock?.toLocaleString() || 0} pcs</div>
          </div>
        </section>

        {/* Variant Selection */}
        <section className="bg-surface-container-lowest px-4 py-5 mt-2 border-y border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="shrink-0 w-16 text-[10px] font-bold text-muted uppercase tracking-wider">Ukuran</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  disabled={isSizeDisabled(size)}
                  onClick={() => onSelectSize(size)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-bold border-2 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selectedSize === size
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant/30 text-on-surface-variant disabled:opacity-30'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <h3 className="shrink-0 w-16 text-[10px] font-bold text-muted uppercase tracking-wider">Warna</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  disabled={isColorDisabled(color)}
                  onClick={() => onSelectColor(color)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-bold border-2 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selectedColor === color
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant/30 text-on-surface-variant disabled:opacity-30'
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 mt-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Add-ons: Valve</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUseValve(true)}
                disabled={(product.addons?.valvePrice || 0) <= 0}
                className={`rounded-xl border-2 px-4 py-3 text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${useValve
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                Pakai Valve
              </button>
              <button
                type="button"
                onClick={() => setUseValve(false)}
                className={`rounded-xl border-2 px-4 py-3 text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${!useValve
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant'
                  }`}
              >
                Tanpa Valve
              </button>
            </div>
            {useValve && product.addons?.valvePrice > 0 && (
              <p className="mt-2 text-[10px] font-bold text-primary">
                + {formatCurrency(product.addons.valvePrice)}/pcs
              </p>
            )}
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Jumlah Pesanan</h3>
            <div className="flex items-center gap-2 bg-surface-container-low rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(product.minOrder, (Number(quantity) || product.minOrder) - 100))}
                className="w-10 h-10 rounded-lg bg-surface-container-lowest shadow-card flex items-center justify-center text-primary cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setQuantity(val === '' ? '' : Number(val));
                }}
                onBlur={() => {
                  if (quantity === '' || quantity < product.minOrder) {
                    setQuantity(product.minOrder);
                  }
                }}
                className="flex-1 text-center font-bold text-on-surface border-none bg-transparent text-base outline-none"
              />
              <button
                onClick={() => setQuantity((Number(quantity) || product.minOrder) + 100)}
                className="w-10 h-10 rounded-lg bg-surface-container-lowest shadow-card flex items-center justify-center text-primary cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
            <p className="text-[11px] text-muted mt-3 italic">* Minimal order {product.minOrder} pcs</p>
          </div>
        </section>

        {/* Specifications */}
        <section className="bg-surface-container-lowest px-4 py-5 mt-2 border-y border-outline-variant/20">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Spesifikasi</h3>
          <div className="divide-y divide-outline-variant/20">
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-on-surface-variant">Kategori</span>
              <span className="text-[12px] font-semibold text-on-surface">{product.category || '-'}</span>
            </div>
            {product.material && (
              <div className="flex items-center justify-between py-2">
                <span className="text-[12px] text-on-surface-variant">Bahan</span>
                <span className="text-[12px] font-semibold text-on-surface">{product.material}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-on-surface-variant">Jumlah Varian</span>
              <span className="text-[12px] font-semibold text-on-surface">{product.variants?.length || 0} varian</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-on-surface-variant">Minimal Order</span>
              <span className="text-[12px] font-semibold text-on-surface">{product.minOrder?.toLocaleString() || 0} pcs</span>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="bg-surface-container-lowest px-4 py-6 mt-2 pb-10 border-t border-outline-variant/20">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Deskripsi Produk</h3>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">
            {product.description}
          </p>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest border-t border-outline-variant/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/portal?menu=inquiries', { state: { prefillProduct: product } })}
          className="shrink-0 p-2 rounded-xl border border-outline-variant/30 text-on-surface-variant cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <MessageSquare size={20} />
        </button>
        <button
          onClick={handleAddToCartClick}
          className="flex-1 bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-card cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ShoppingCart size={16} />
          Tambah ke Keranjang
        </button>
        <button
          onClick={() => navigate(`/portal/orders/create?orderType=Sample&productId=${product._id}&variantId=${selectedVariant?._id || ''}&size=${selectedSize}&color=${selectedColor}`)}
          disabled={!selectedVariant || selectedVariant?.stock <= 0}
          className="shrink-0 px-4 py-3 rounded-xl border border-primary/30 text-primary font-bold text-[12px] disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Sample
        </button>
      </div>
    </div>
  );
}
