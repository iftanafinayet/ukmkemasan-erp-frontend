import React, { useState } from 'react';
import ConfirmDialog from './ui/ConfirmDialog';
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
  Database,
  Cog,
  MessageSquare
} from 'lucide-react';
import { storage } from '../config/environment';
import logoUrl from '../../assets/LogoUKM.svg';

export function Sidebar({ activeMenu = 'dashboard', onMenuChange, onLogout, inquiryBadge = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(['inventory', 'sales']);

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
    {
      id: 'production',
      label: 'Production',
      icon: Cog,
      children: [
        { id: 'production-dashboard', label: 'Production Dashboard', icon: ClipboardList },
      ]
    },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-sidebar p-2 bg-primary text-white rounded-lg shadow-card cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-sidebar w-64 bg-surface-container-lowest border-r border-outline-variant/30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full font-sans">
          <div className="p-6 border-b border-outline-variant/30">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
              <h1 className="font-bold text-lg text-on-surface uppercase tracking-tight">UKM Kemasan</h1>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
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
                      data-testid={`menu-item-${item.id}`}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                        isParentActive && !hasChildren
                          ? 'bg-surface-container-high text-primary font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isParentActive ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>
                          <Icon size={18} />
                        </div>
                        <span className={`text-sm ${isParentActive ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                          {item.label}
                        </span>
                        {item.id === 'inquiries' && inquiryBadge > 0 && (
                          <span className="ml-auto bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {inquiryBadge > 99 ? '99+' : inquiryBadge}
                          </span>
                        )}
                      </div>
                      {hasChildren && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {hasChildren && isExpanded && (
                      <ul className="ml-4 pl-4 border-l border-outline-variant/30 mt-1 space-y-1">
                        {item.children.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={(e) => handleSubMenuClick(e, sub.id)}
                              data-testid={`menu-item-${sub.id}`}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                                activeMenu === sub.id
                                  ? 'text-primary font-bold bg-primary/5'
                                  : 'text-muted hover:text-on-surface hover:bg-surface-container-low font-medium'
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

          <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/30">
            <button
              onClick={handleLogout}
              data-testid="logout-btn"
              className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container rounded-xl transition-colors duration-200 font-semibold text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar Sistem</span>
            </button>
          </div>
        </div>
      </aside>

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

export default Sidebar;
