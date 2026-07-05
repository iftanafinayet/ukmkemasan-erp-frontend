import React, { useState, useEffect } from 'react';
import { getCartItems, subscribeCart } from '../../../utils/cart';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../config/environment';

export default function MobileHeader({ activeMenu, onMenuChange, onToggleFilter, hasActiveFilters }) {
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
  const isCatalogMenu = activeMenu === 'catalog';

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2 || query.length === 0) {
      if (activeMenu === 'dashboard' || activeMenu === 'catalog') {
        if (onMenuChange) onMenuChange('catalog');
        navigate(`/portal?menu=catalog&search=${query}`);
      } else if (isOrdersMenu) {
        navigate(`/portal?menu=orders&search=${query}`);
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
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant/20 px-4 h-14 flex items-center gap-3 lg:hidden">
      <div className="flex-1 relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
        <input
          className="w-full bg-surface-container-low border-none rounded-lg py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary text-on-surface placeholder:text-muted"
          placeholder={isOrdersMenu ? "Cari transaksi..." : "Cari kemasan..."}
          type="text"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="flex items-center gap-1">
        {isCatalogMenu && (
          <button
            onClick={onToggleFilter}
            className={`p-2 transition-colors cursor-pointer relative ${hasActiveFilters ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[24px]">filter_list</span>
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-surface-container-lowest"></span>
            )}
          </button>
        )}
        <button
          onClick={handleCartClick}
          className="relative p-1 text-on-surface-variant cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-surface-container-lowest">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>

        {!isLoggedIn && (
          <button
            onClick={() => navigate('/login')}
            className="p-1 text-on-surface-variant cursor-pointer transition-colors"
            title="Masuk"
          >
            <span className="material-symbols-outlined text-[24px]">login</span>
          </button>
        )}
      </div>
    </header>
  );
}
