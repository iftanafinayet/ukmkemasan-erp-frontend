import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../../config/environment';
import { getCartCount, subscribeCart } from '../../utils/cart';
import logoUrl from '../../../assets/LogoUKM.svg';

export default function CustomerNavbar({ activeMenu = 'dashboard', onMenuChange, onLogout }) {
  const [cartCount, setCartCount] = useState(0);
  const user = storage.getUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCartCount(getCartCount());
    return subscribeCart((items) => {
      const nextCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      setCartCount(nextCount);
    });
  }, []);

  const handleMenuClick = (menuId) => {
    if (onMenuChange) {
      onMenuChange(menuId);
    } else if (location.pathname.startsWith('/portal')) {
      navigate(`/portal?menu=${menuId}`);
    } else {
      navigate(`/portal?menu=${menuId}`);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      storage.clear();
      window.location.href = '/login';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'catalog', label: 'Katalog Produk' },
    { id: 'cart', label: 'Keranjang', badge: cartCount },
    { id: 'orders', label: 'Pesanan Saya' },
    { id: 'profile', label: 'Profil Saya' }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md transition-all duration-300 ease-in-out font-sans">
      <div className="flex justify-between items-center px-4 sm:px-8 h-20 max-w-full mx-auto">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
          <div className="hidden sm:block text-xl font-bold tracking-tighter text-teal-800 uppercase">UKM Kemasan</div>
        </div>
        <div className="hidden md:flex items-center space-x-8 font-headline text-sm font-semibold tracking-tight h-full pt-8">
          {navItems.map((item) => {
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex items-center gap-2 pb-2 h-full transition-all duration-300 ease-in-out active:scale-95 ${
                  isActive 
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-primary transition-colors'
                }`}
              >
                {item.label}
                {item.badge > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isActive ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogout} 
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 font-semibold rounded-full border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out active:scale-95 group"
          >
            <span className="text-sm">Keluar</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <button 
            onClick={handleLogout} 
            className="sm:hidden flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 transition-colors"
            title="Keluar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 overflow-hidden flex flex-shrink-0 items-center justify-center text-white font-black text-lg shadow-lg">
            {user?.name?.charAt(0) || 'C'}
          </div>
        </div>
      </div>
      <div className="bg-slate-100 h-[1px] w-full absolute bottom-0"></div>
    </nav>
  );
}
