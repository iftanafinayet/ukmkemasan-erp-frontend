import React, { useState } from 'react';
import {
  LayoutDashboard,  // Tambah ini
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Coffee,
  Clock // Tambah ini untuk Monitoring Mesin
} from 'lucide-react';
import { storage } from '../config/environment';

/**
 * Sidebar Component Admin ERP
 * Mengelola navigasi utama operasional produksi
 */
export function Sidebar({ activeMenu = 'dashboard', onMenuChange, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  // Daftar menu yang disesuaikan untuk manajemen produksi UKM Kemasan
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Antrean Pesanan', icon: ShoppingCart },
    { id: 'inventory', label: 'Stok & Produk', icon: Package },
    { id: 'customers', label: 'Database Pelanggan', icon: Users },
    { id: 'reports', label: 'Laporan Finansial', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan ERP', icon: Settings }
  ];

  const handleMenuClick = (menuId) => {
    if (onMenuChange) {
      onMenuChange(menuId);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      storage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full font-sans">
          {/* Logo & Branding */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-primary uppercase tracking-widest text-slate-800 font-color-primary leading-none">UKM Kemasan</h1>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/30 scale-[1.02]'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {/* Badge UI untuk notifikasi pesanan baru */}
                      {item.badge && !isActive && (
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer & Logout */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar Sistem</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;