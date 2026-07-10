import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, ClipboardList,
  MoreHorizontal, X, Users, BarChart3, Settings,
  Warehouse, Database, Receipt, ArrowRightLeft,
  Cog, MessageSquare, QrCode, LogOut,
} from 'lucide-react';
import { storage } from '../../config/environment';

const PRIMARY_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, matches: ['dashboard'] },
  { id: 'orders', label: 'Pesanan', icon: ShoppingCart, matches: ['orders', 'sales-orders'] },
  { id: 'inventory', label: 'Inventory', icon: Package, matches: ['inventory', 'inventory-items', 'warehouse', 'warehouse-retail', 'item-categories', 'inventory-adjustment', 'stock-card', 'stock-card-retail', 'stock-opname'] },
  { id: 'sales', label: 'Sales', icon: ClipboardList, matches: ['sales-processing', 'invoice', 'payment-received', 'sales-return', 'production-dashboard'] },
];

const MORE_ITEMS = [
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'invoice', label: 'Invoice', icon: Receipt },
  { id: 'payment-received', label: 'Pembayaran', icon: Receipt },
  { id: 'sales-return', label: 'Retur', icon: ArrowRightLeft },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
  { id: 'warehouse-retail', label: 'Warehouse Retail', icon: Warehouse },
  { id: 'inventory-adjustment', label: 'Adjustment', icon: ArrowRightLeft },
  { id: 'item-categories', label: 'Kategori', icon: Database },
  { id: 'stock-card', label: 'Stock Card', icon: Database },
  { id: 'stock-card-retail', label: 'Stock Card Retail', icon: Database },
  { id: 'stock-opname', label: 'Stock Opname', icon: ClipboardList },
  { id: 'production-dashboard', label: 'Produksi', icon: Cog },
  { id: 'inquiries', label: 'Pesan', icon: MessageSquare },
  { id: 'scanner', label: 'Scan Resi', icon: QrCode },
  { id: 'reports', label: 'Laporan', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export default function MobileAdminBottomNav({ activeMenu, onMenuChange, inquiryBadge = 0 }) {
  const [moreOpen, setMoreOpen] = useState(false);

  const handleClick = (item) => {
    if (item.id === 'inventory') {
      onMenuChange('inventory-items');
    } else if (item.id === 'sales') {
      onMenuChange('sales-processing');
    } else {
      onMenuChange(item.id);
    }
    setMoreOpen(false);
  };

  const handleLogout = () => {
    setMoreOpen(false);
    storage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-slate-200 h-16 pb-[env(safe-area-inset-bottom,0px)]">
        {PRIMARY_ITEMS.map((item) => {
          const isActive = item.matches.includes(activeMenu);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${
            moreOpen ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal size={22} strokeWidth={moreOpen ? 2.5 : 2} />
          <span className={`text-[10px] mt-0.5 ${moreOpen ? 'font-bold' : 'font-medium'}`}>
            Lainnya
          </span>
        </button>
      </nav>

      {/* More Menu Overlay */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/50" onClick={() => setMoreOpen(false)} />
      )}

      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-[61] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
          moreOpen ? 'translate-y-0' : 'translate-y-full'
        } max-h-[70vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+16px)]`}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-800">Menu Admin</h3>
          <button
            onClick={() => setMoreOpen(false)}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3">
          {MORE_ITEMS.map((item) => {
            const isActive = activeMenu === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm flex-1 text-left">{item.label}</span>
                {item.id === 'inquiries' && inquiryBadge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {inquiryBadge > 99 ? '99+' : inquiryBadge}
                  </span>
                )}
              </button>
            );
          })}

          <hr className="my-3 border-slate-100" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-red-500 hover:bg-red-50 font-semibold text-sm cursor-pointer transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-red-50 text-red-500">
              <LogOut size={18} />
            </div>
            <span>Keluar Sistem</span>
          </button>
        </div>
      </div>
    </>
  );
}
