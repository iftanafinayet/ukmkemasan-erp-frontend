import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Warehouse,
  ClipboardList,
  Receipt,
  ArrowRightLeft,
  Truck,
  Database
} from 'lucide-react';
import { storage } from '../config/environment';
import logoUrl from '../../assets/LogoUKM.svg';

export function Sidebar({ activeMenu = 'dashboard', onMenuChange, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(['inventory', 'sales']); // Default expanded

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      children: [
        { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
        { id: 'warehouse-retail', label: 'Warehouse Retail', icon: Warehouse },
        { id: 'inventory-items', label: 'Items', icon: Package },
        { id: 'item-categories', label: 'Item Categories', icon: Database },
        { id: 'inventory-adjustment', label: 'Inventory Adjustment', icon: ArrowRightLeft },
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      children: [
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'orders', label: 'Sales Orders', icon: ShoppingCart },
        { id: 'sales-processing', label: 'Sales Processing', icon: ClipboardList },
        { id: 'invoice', label: 'Invoice', icon: Receipt },
        { id: 'payment-received', label: 'Payment Received', icon: Receipt },
        { id: 'sales-return', label: 'Sales Return', icon: ArrowRightLeft },
      ]
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: Truck,
      children: []
    },
    {
      id: 'stocks',
      label: 'Stocks',
      icon: Truck,
      children: [
        { id: 'stock-card', label: 'Stock Card' },
        { id: 'stock-card-retail', label: 'Stock Card Retail' },
        { id: 'stock-opname', label: 'Stock Opname' },
      ]
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleMenuClick = (item) => {
    if (item.children && item.children.length > 0) {
      setExpandedMenus(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id) 
          : [...prev, item.id]
      );
    } else {
      if (onMenuChange) onMenuChange(item.id);
      setIsOpen(false);
    }
  };

  const handleSubMenuClick = (e, subId) => {
    e.stopPropagation();
    if (onMenuChange) onMenuChange(subId);
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full font-sans">
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
              <h1 className="font-black text-lg text-slate-800 uppercase tracking-tighter">UKM Kemasan</h1>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedMenus.includes(item.id);
                const hasChildren = item.children && item.children.length > 0;
                const isParentActive = activeMenu.startsWith(item.id);

                return (
                  <li key={item.id} className="space-y-1">
                    <button
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isParentActive && !hasChildren
                          ? 'bg-slate-100 text-primary font-bold'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isParentActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon size={18} />
                        </div>
                        <span className={`text-sm ${isParentActive ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>
                          {item.label}
                        </span>
                      </div>
                      {hasChildren && (
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      )}
                    </button>

                    {hasChildren && isExpanded && (
                      <ul className="ml-4 pl-4 border-l border-slate-100 mt-1 space-y-1">
                        {item.children.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={(e) => handleSubMenuClick(e, sub.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                                activeMenu === sub.id
                                  ? 'text-primary font-black bg-primary/5'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              {sub.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

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