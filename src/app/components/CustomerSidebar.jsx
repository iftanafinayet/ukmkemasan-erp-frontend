import React, { useState } from 'react';
import {
    LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Menu, X, User
} from 'lucide-react';
import { storage } from '../config/environment';
import logoUrl from '../../assets/LOGO NEONBOX.png';

/**
 * Sidebar khusus Customer
 * Hanya menampilkan menu yang relevan untuk customer
 */
export default function CustomerSidebar({ activeMenu = 'dashboard', onMenuChange, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const user = storage.getUser();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'catalog', label: 'Katalog Produk', icon: Package },
        { id: 'orders', label: 'Pesanan Saya', icon: ShoppingCart },
        { id: 'profile', label: 'Profil Saya', icon: User }
    ];

    const handleMenuClick = (menuId) => {
        if (onMenuChange) onMenuChange(menuId);
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

            {/* Overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex flex-col h-full font-sans">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl shadow-lg bg-white overflow-hidden flex-shrink-0">
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-primary/90 uppercase tracking-wider leading-none">Customer</h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UKM Kemasan</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-lg">
                                {user?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm leading-tight">{user?.name || 'Customer'}</p>
                                <p className="text-[10px] text-primary font-bold uppercase">Customer Account</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-1.5">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeMenu === item.id;

                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => handleMenuClick(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                                ? 'bg-primary text-white shadow-md shadow-primary/30 scale-[1.02]'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
