import React, { useState, useEffect } from 'react';
import { getCartItems, subscribeCart } from '../../../utils/cart';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../config/environment';
import logoUrl from '/UKMWEBLOGO.svg';

export default function MobileHeader({ activeMenu, onMenuChange, onToggleFilter, hasActiveFilters }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => getCartItems().length);
  const isLoggedIn = !!storage.getToken();

  useEffect(() => {
    const unsubscribe = subscribeCart((items) => {
      setCartCount(items.length);
    });
    return unsubscribe;
  }, []);

  const handleCartClick = () => {
    if (activeMenu === 'cart') return;
    if (onMenuChange) {
      onMenuChange('cart');
    } else {
      navigate('/portal?menu=cart');
    }
  };

  const handleProfileClick = () => {
    if (activeMenu === 'profile') return;
    if (onMenuChange) {
      onMenuChange('profile');
    } else {
      navigate('/portal?menu=profile');
    }
  };

  const handleLogout = () => {
    storage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest px-5 h-14 flex items-center justify-between lg:hidden border-b border-outline-variant/10 shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center">
        <img src={logoUrl} alt="UKM Kemasan" className="h-9 w-auto object-contain" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 text-on-surface-variant">
        {/* Cart */}
        <button
          onClick={handleCartClick}
          className="relative p-1 transition-colors cursor-pointer"
          aria-label="Keranjang"
        >
          <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-surface-container-lowest">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>

        {isLoggedIn ? (
          <>
            {/* Profile Avatar with notification dot */}
            <button
              onClick={handleProfileClick}
              className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-colors cursor-pointer"
              aria-label="Profil"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1 transition-colors cursor-pointer"
              aria-label="Keluar"
            >
              <span className="material-symbols-outlined text-[24px]">exit_to_app</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Masuk
          </button>
        )}
      </div>
    </header>
  );
}
