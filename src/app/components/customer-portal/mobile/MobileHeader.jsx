import React, { useState, useEffect } from 'react';
import { getCartItems, subscribeCart } from '../../../utils/cart';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../config/environment';

export default function MobileHeader({ activeMenu, onMenuChange }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    const items = getCartItems();
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const isLoggedIn = !!storage.getToken();

  useEffect(() => {
    const unsubscribe = subscribeCart((items) => {
      const nextCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      setCartCount(nextCount);
    });
    return unsubscribe;
  }, []);

  const isOrdersMenu = activeMenu === 'orders';

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      if (isOrdersMenu) {
        navigate(`/portal?menu=orders&search=${query}`);
      } else {
        navigate(`/portal?menu=catalog&search=${query}`);
      }
    }
  };

  const handleCartClick = () => {
    if (activeMenu === 'cart') return;
    
    if (onMenuChange) {
      onMenuChange('cart');
    } else {
      navigate('/portal?menu=cart');
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#bbc9c7]/20 px-4 h-14 flex items-center gap-3 lg:hidden">
      <div className="flex-1 relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4947] text-xl">search</span>
        <input
          className="w-full bg-[#f2f3ff] border-none rounded-lg py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#4dbace]"
          placeholder={isOrdersMenu ? "Cari transaksi/order..." : "Cari kemasan kopi..."}
          type="text"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleCartClick} 
          className="relative p-1 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[#3c4947] text-[24px]">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
        
        {!isLoggedIn && (
          <button 
            onClick={() => navigate('/login')} 
            className="p-1 active:scale-90 transition-transform"
            title="Masuk"
          >
            <span className="material-symbols-outlined text-[#3c4947] text-[24px]">login</span>
          </button>
        )}
      </div>
    </header>
  );
}
