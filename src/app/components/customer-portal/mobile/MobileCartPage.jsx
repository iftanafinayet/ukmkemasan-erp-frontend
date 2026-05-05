import React from 'react';
import { Loader2 } from 'lucide-react';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';

export default function MobileCartPage({
    cartItems = [],
    cartTotal = 0,
    cartQuantity = 0,
    checkingOutCart = false,
    formatCurrency,
    onAddItem,
    onClearCart,
    onRemoveItem,
    onCheckout,
    onBack
}) {
    const navigate = useNavigate();
    const isLoggedIn = !!storage.getToken();

    if (!isLoggedIn) {
      return (
        <div className="lg:hidden bg-[#faf8ff] min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-[#4dbace]/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[#4dbace] text-4xl">shopping_cart</span>
          </div>
          <h2 className="text-xl font-bold text-[#131b2e] mb-2 font-headline">Login Diperlukan</h2>
          <p className="text-[#3c4947] text-sm mb-8 leading-relaxed">
            Silakan login terlebih dahulu untuk melihat isi keranjang belanja dan memproses pesanan Anda.
          </p>
          <button 
            onClick={() => navigate('/login?redirect=/portal?menu=cart')}
            className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#4dbace]/20 active:scale-95 transition-transform"
          >
            Masuk Sekarang
          </button>
        </div>
      );
    }

    return (
        <div className="lg:hidden bg-[#faf8ff] min-h-screen pb-40">
            <header className="px-4 h-14 flex items-center gap-3 border-b border-[#bbc9c7]/20 sticky top-0 bg-white z-10">
              <button onClick={onBack} className="p-1">
                <span className="material-symbols-outlined text-[#131b2e]">arrow_back</span>
              </button>
              <h2 className="text-[18px] font-bold text-[#131b2e] font-headline">Keranjang Belanja</h2>
              {cartItems.length > 0 && (
                <button onClick={onClearCart} className="ml-auto text-[12px] font-bold text-red-500">Hapus Semua</button>
              )}
            </header>

            <main className="p-4">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-[#eaedff] rounded-full flex items-center justify-center mb-6">
                          <span className="material-symbols-outlined text-[#bbc9c7] text-5xl">shopping_cart</span>
                        </div>
                        <p className="text-[#131b2e] font-bold text-lg mb-2">Keranjang Anda Kosong</p>
                        <p className="text-[#6c7a77] text-sm mb-8">Yuk, cari produk kemasan terbaik untuk bisnis Anda!</p>
                        <button
                          onClick={onAddItem}
                          className="bg-[#4dbace] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#4dbace]/20"
                        >
                           Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={`${item.productId}-${item.variantId}-${item.useValve}-${index}`} className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm border border-[#bbc9c7]/10">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f2f3ff] shrink-0 border border-[#bbc9c7]/20">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="material-symbols-outlined text-[#bbc9c7]">image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-[14px] font-bold text-[#131b2e] line-clamp-2 leading-tight font-headline">{item.name}</h4>
                                        <button onClick={() => onRemoveItem?.(item)} className="p-1 text-[#6c7a77] active:text-red-500">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#6c7a77] mt-1 font-medium">
                                      {item.selectedSize} • {item.selectedColor} {item.useValve ? '• Valve' : ''}
                                    </p>
                                    <div className="flex justify-between items-end mt-2">
                                        <p className="text-[14px] font-bold text-[#4dbace] font-headline">{formatCurrency(item.totalPrice)}</p>
                                        <div className="flex items-center bg-[#f2f3ff] rounded-lg px-2 py-1 gap-3">
                                            <span className="font-bold text-[12px] text-[#131b2e]">{item.quantity.toLocaleString()} pcs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Bottom Sticky Action */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-14 left-0 w-full bg-white border-t border-[#bbc9c7]/20 p-4 z-40 lg:hidden shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-[#6c7a77] font-bold uppercase tracking-wider">Estimasi Total</p>
                            <p className="text-[18px] font-bold text-[#4dbace] font-headline">{formatCurrency(cartTotal)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-[#6c7a77] font-bold uppercase tracking-wider">Total Item</p>
                            <p className="text-[14px] font-bold text-[#131b2e]">{cartQuantity.toLocaleString()} pcs</p>
                        </div>
                    </div>
                    <button 
                        onClick={onCheckout} 
                        disabled={checkingOutCart} 
                        className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#4dbace]/20 active:scale-95 transition-transform"
                    >
                        {checkingOutCart ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Checkout Pesanan'}
                    </button>
                </div>
            )}
        </div>
    );
}
