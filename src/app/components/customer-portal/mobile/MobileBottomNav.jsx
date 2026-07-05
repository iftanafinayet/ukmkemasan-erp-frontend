import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../config/environment';

export default function MobileBottomNav({ activeMenu, onMenuChange, inquiryBadge = 0 }) {
  const navigate = useNavigate();

  const handleClick = (id) => {
    if (id === 'inquiries' && !storage.getToken()) {
      navigate('/login?redirect=/portal?menu=inquiries');
      return;
    }
    onMenuChange(id);
  };

  const items = [
    { id: 'dashboard', label: 'Beranda', icon: 'home' },
    { id: 'catalog', label: 'Katalog', icon: 'grid_view' },
    { id: 'inquiries', label: 'Pesan', icon: 'chat' },
    { id: 'orders', label: 'Pesanan', icon: 'receipt_long' },
    { id: 'profile', label: 'Akun', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-14 bg-surface-container-lowest border-t border-outline-variant/30 lg:hidden">
      {items.map((item) => {
        const isActive = activeMenu === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex flex-col items-center justify-center flex-1 relative cursor-pointer transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
            {item.id === 'inquiries' && inquiryBadge > 0 && (
              <span className="absolute top-0 right-1/2 translate-x-[14px] bg-error text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
                {inquiryBadge > 99 ? '99+' : inquiryBadge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
