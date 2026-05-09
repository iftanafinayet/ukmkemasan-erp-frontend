import React from 'react';

export default function MobileBottomNav({ activeMenu, onMenuChange }) {
  const items = [
    { id: 'dashboard', label: 'Beranda', icon: 'home' },
    { id: 'catalog', label: 'Katalog', icon: 'grid_view' },
    { id: 'orders', label: 'Pesanan', icon: 'receipt_long' },
    { id: 'profile', label: 'Akun', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-14 bg-white border-t border-[#bbc9c7]/30 lg:hidden">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onMenuChange(item.id)}
          className={`flex flex-col items-center justify-center flex-1 ${activeMenu === item.id ? 'text-[#4dbace]' : 'text-[#3c4947]'
            }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: `'FILL' ${activeMenu === item.id ? 1 : 0}` }}
          >
            {item.icon}
          </span>
          <span className={`text-[10px] mt-0.5 ${activeMenu === item.id ? 'font-bold' : 'font-medium'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
