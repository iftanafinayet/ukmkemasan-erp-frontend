import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';
import { storage } from '../../config/environment';
import { getCartCount, subscribeCart } from '../../utils/cart';
import logoUrl from '/UKMWEBLOGO.svg';

export default function CustomerNavbar({ activeMenu = 'dashboard', onMenuChange, onLogout, inquiryBadge = 0 }) {
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const user = storage.getUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    } else {
      storage.clear();
      window.location.href = '/login';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Beranda' },
    { id: 'catalog', label: 'Katalog' },
    { id: 'cart', label: 'Keranjang', badge: cartCount },
    { id: 'orders', label: 'Pesanan Saya' },
    { id: 'profile', label: 'Profil' }
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-navbar bg-surface-container-lowest/80 backdrop-blur-md transition-all duration-300 font-sans">
        <div className="flex items-center justify-between px-4 sm:px-8 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            <div className="hidden md:flex items-center gap-1 font-semibold text-sm tracking-tight">
              {navItems.map((item) => {
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                        ? 'text-primary bg-primary/5'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                      }`}
                  >
                    {item.label}
                    {item.badge > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {storage.getToken() ? (
              <>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant font-semibold rounded-full border border-outline-variant hover:border-outline shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 group"
                >
                  <span className="text-sm">Keluar</span>
                  <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="sm:hidden flex items-center justify-center p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary overflow-hidden flex flex-shrink-0 items-center justify-center text-white font-bold text-sm shadow-card">
                  {user?.name?.charAt(0) || 'C'}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-primary font-semibold text-sm hover:text-primary/80 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Masuk
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-full shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-outline-variant/30 h-px w-full absolute bottom-0"></div>
      </nav>
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Keluar Sistem"
        message="Yakin ingin keluar dari sistem?"
        confirmLabel="Keluar"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
