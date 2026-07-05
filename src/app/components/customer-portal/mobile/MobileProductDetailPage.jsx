import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { ArrowLeft, ShoppingCart, Layers, Ruler, Box, Package, ImagePlus, MessageSquare } from 'lucide-react';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';
import { getCartItems } from '../../../utils/cart';

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

  if (!product) return null;

  const handleAddToCartClick = () => {
    if (!isLoggedIn) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }
    onAddToCart();
  };

  return (
    <div className="lg:hidden bg-background min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant/20 px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate('/portal?menu=catalog')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <h1 className="text-[16px] font-bold text-on-surface truncate max-w-[180px] font-headline">{product.name}</h1>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant text-[24px]">share</span>
          <button onClick={() => navigate('/portal?menu=cart')} className="relative">
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="pt-14">
        {/* Image Carousel */}
        <section className="bg-surface-container-lowest">
          <div className="aspect-square w-full relative">
            <img
              src={product.images?.[activeImageIdx]?.url || "https://via.placeholder.com/400"}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            {product.images?.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
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
            <div className="grid grid-cols-5 gap-2 px-4 py-4 overflow-hidden">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-square rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeImageIdx === idx ? 'border-primary scale-105' : 'border-transparent opacity-60'
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
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary text-[22px] font-bold font-headline">{formatCurrency(unitPrice)}</span>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {quantity >= 1000 ? 'Grosir' : 'Retail'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 border-b border-outline-variant/20 pb-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Retail</p>
              <p className="text-xs font-bold text-on-surface">{formatCurrency(selectedVariant?.priceB2C || 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Grosir</p>
              <p className="text-xs font-bold text-primary">{formatCurrency(selectedVariant?.priceB2B || 0)}</p>
            </div>
          </div>
          <h1 className="text-[18px] font-bold text-on-surface leading-tight mb-3 font-headline">{product.name}</h1>
          <div className="flex items-center gap-4 text-on-surface-variant text-[12px]">
            <div>Terjual {product.totalSold || 0}+</div>
            <div className="w-px h-3 bg-outline-variant/30"></div>
            <div className="text-primary font-bold">Stok: {selectedVariant?.stock?.toLocaleString() || 0} pcs</div>
          </div>
        </section>

        {/* Variant Selection */}
        <section className="bg-surface-container-lowest px-4 py-6 mt-2 border-y border-outline-variant/20">
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-on-surface mb-3 uppercase tracking-wider text-[10px] text-muted">Pilih Ukuran</h3>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  disabled={isSizeDisabled(size)}
                  onClick={() => onSelectSize(size)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold border-2 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selectedSize === size
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-outline-variant/30 text-on-surface-variant disabled:opacity-30'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-on-surface mb-3 uppercase tracking-wider text-[10px] text-muted">Pilih Warna</h3>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  disabled={isColorDisabled(color)}
                  onClick={() => onSelectColor(color)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold border-2 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selectedColor === color
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-outline-variant/30 text-on-surface-variant disabled:opacity-30'
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-on-surface mb-3 uppercase tracking-wider text-[10px] text-muted">Add-ons: Valve</h3>
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
            <h3 className="text-[14px] font-bold text-on-surface mb-3 uppercase tracking-wider text-[10px] text-muted">Jumlah Pesanan</h3>
            <div className="flex items-center gap-4 bg-surface-container-low rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(product.minOrder, quantity - 100))}
                className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-card flex items-center justify-center text-primary cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.minOrder, Number(e.target.value)))}
                className="flex-1 text-center font-bold text-on-surface border-none bg-transparent text-lg"
              />
              <button
                onClick={() => setQuantity(quantity + 100)}
                className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-card flex items-center justify-center text-primary cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="text-[11px] text-muted mt-3 italic">* Minimal order {product.minOrder} pcs (kelipatan 100)</p>
          </div>
        </section>

        {/* Specifications */}
        <section className="bg-surface-container-lowest px-4 py-6 mt-2 border-y border-outline-variant/20">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4">Informasi Produk</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background p-3 rounded-xl border border-outline-variant/60">
              <Layers size={16} className="text-primary mb-1.5" />
              <p className="text-[9px] font-bold text-muted uppercase">Kategori</p>
              <p className="text-[12px] font-bold text-on-surface truncate">{product.category}</p>
            </div>
            <div className="bg-background p-3 rounded-xl border border-outline-variant/60">
              <Ruler size={16} className="text-primary mb-1.5" />
              <p className="text-[9px] font-bold text-muted uppercase">Material</p>
              <p className="text-[12px] font-bold text-on-surface truncate">{product.material || '-'}</p>
            </div>
            <div className="bg-background p-3 rounded-xl border border-outline-variant/60">
              <Package size={16} className="text-primary mb-1.5" />
              <p className="text-[9px] font-bold text-muted uppercase">Varian</p>
              <p className="text-[12px] font-bold text-on-surface">{product.variants?.length || 0} Opsi</p>
            </div>
            <div className="bg-background p-3 rounded-xl border border-outline-variant/60">
              <Box size={16} className="text-primary mb-1.5" />
              <p className="text-[9px] font-bold text-muted uppercase">Min. Order</p>
              <p className="text-[12px] font-bold text-on-surface">{product.minOrder?.toLocaleString()} pcs</p>
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
      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest border-t border-outline-variant/20 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/portal?menu=inquiries', { state: { prefillProduct: product } })}
          className="p-3.5 rounded-xl border-2 border-primary/30 text-primary active:scale-95 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <MessageSquare size={18} />
        </button>
        <div className="flex-1">
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Total Harga</p>
          <p className="text-[18px] font-bold text-primary font-headline">{formatCurrency(totalPrice)}</p>
        </div>
        <button
          onClick={handleAddToCartClick}
          className="bg-primary text-on-primary px-6 py-3.5 rounded-xl font-bold text-[13px] flex items-center gap-2 active:scale-95 transition-all duration-200 shadow-card-hover shadow-primary/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ShoppingCart size={18} />
          Beli Sekarang
        </button>
        <button
          onClick={() => navigate(`/portal/orders/create?orderType=Sample&productId=${product._id}&variantId=${selectedVariant?._id || ''}&size=${selectedSize}&color=${selectedColor}`)}
          disabled={!selectedVariant || selectedVariant?.stock <= 0}
          className="px-4 py-3.5 rounded-xl border-2 border-primary/40 text-primary font-bold text-[12px] active:scale-95 transition-all duration-200 disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Sample
        </button>
      </div>
    </div>
  );
}
