import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
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
    <div className="lg:hidden bg-[#faf8ff] min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#bbc9c7]/20 px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate('/portal?menu=catalog')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-[#131b2e]" />
        </button>
        <h1 className="text-[16px] font-bold text-[#131b2e] truncate max-w-[180px] font-headline">{product.name}</h1>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#3c4947] text-[24px]">share</span>
          <button onClick={() => navigate('/portal?menu=cart')} className="relative">
            <span className="material-symbols-outlined text-[#3c4947] text-[24px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="pt-14">
        {/* Image Carousel */}
        <section className="bg-white">
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
                    className={`h-1.5 rounded-full transition-all ${activeImageIdx === idx ? 'w-6 bg-[#4dbace]' : 'w-1.5 bg-[#bbc9c7]'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 px-4 py-4 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 ${activeImageIdx === idx ? 'border-[#4dbace]' : 'border-transparent'
                    }`}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Product Info */}
        <section className="bg-white px-4 py-6 border-b border-[#bbc9c7]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#4dbace] text-[22px] font-bold font-headline">{formatCurrency(unitPrice)}</span>
            <span className="bg-[#4dbace]/10 text-[#4dbace] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {quantity >= 1000 ? 'Grosir' : 'Retail'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 border-b border-[#bbc9c7]/20 pb-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6c7a77]">Retail</p>
              <p className="text-xs font-bold text-[#131b2e]">{formatCurrency(selectedVariant?.priceB2C || 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6c7a77]">Grosir</p>
              <p className="text-xs font-bold text-[#4dbace]">{formatCurrency(selectedVariant?.priceB2B || 0)}</p>
            </div>
          </div>
          <h1 className="text-[18px] font-bold text-[#131b2e] leading-tight mb-3 font-headline">{product.name}</h1>
          <div className="flex items-center gap-4 text-[#3c4947] text-[12px]">
            <div className="w-px h-3 bg-[#bbc9c7]/30"></div>
            <div>Terjual {product.totalSold || 0}+</div>
          </div>
        </section>

        {/* Variant Selection */}
        <section className="bg-white px-4 py-6 mt-2 border-y border-[#bbc9c7]/20">
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-[#131b2e] mb-3">Pilih Ukuran</h3>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  disabled={isSizeDisabled(size)}
                  onClick={() => onSelectSize(size)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold border-2 transition-all ${selectedSize === size
                      ? 'border-[#4dbace] bg-[#4dbace]/5 text-[#4dbace]'
                      : 'border-[#bbc9c7]/30 text-[#3c4947] disabled:opacity-30'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-[#131b2e] mb-3">Pilih Warna</h3>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  disabled={isColorDisabled(color)}
                  onClick={() => onSelectColor(color)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold border-2 transition-all ${selectedColor === color
                      ? 'border-[#4dbace] bg-[#4dbace]/5 text-[#4dbace]'
                      : 'border-[#bbc9c7]/30 text-[#3c4947] disabled:opacity-30'
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[14px] font-bold text-[#131b2e] mb-3">Jumlah Pesanan</h3>
            <div className="flex items-center gap-4 bg-[#f2f3ff] rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(product.minOrder, quantity - 100))}
                className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#4dbace]"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.minOrder, Number(e.target.value)))}
                className="flex-1 text-center font-bold text-[#131b2e] border-none bg-transparent text-lg"
              />
              <button
                onClick={() => setQuantity(quantity + 100)}
                className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#4dbace]"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="text-[11px] text-[#6c7a77] mt-3 italic">* Minimal order {product.minOrder} pcs (kelipatan 100)</p>
          </div>
        </section>

        {/* Specifications */}
        <section className="bg-white px-4 py-6 mt-2 border-y border-[#bbc9c7]/20">
          <h3 className="text-[14px] font-bold text-[#131b2e] mb-4 font-headline">Informasi Produk</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6c7a77]">Kategori</span>
              <span className="text-[#131b2e] font-medium uppercase">{product.category}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6c7a77]">Material</span>
              <span className="text-[#131b2e] font-medium">{product.material || '-'}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6c7a77]">Min. Order</span>
              <span className="text-[#131b2e] font-medium">{product.minOrder} pcs</span>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="bg-white px-4 py-6 mt-2 pb-10 border-t border-[#bbc9c7]/20">
          <h3 className="text-[14px] font-bold text-[#131b2e] mb-3 font-headline">Deskripsi Produk</h3>
          <p className="text-[13px] text-[#3c4947] leading-relaxed">
            {product.description}
          </p>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-[#bbc9c7]/20 px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] text-[#6c7a77] font-bold uppercase tracking-wider">Total Harga</p>
          <p className="text-[18px] font-bold text-[#4dbace] font-headline">{formatCurrency(totalPrice)}</p>
        </div>
        <button
          onClick={handleAddToCartClick}
          className="bg-[#4dbace] text-white px-8 py-3.5 rounded-xl font-bold text-[14px] flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-[#4dbace]/20"
        >
          <ShoppingCart size={18} />
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
