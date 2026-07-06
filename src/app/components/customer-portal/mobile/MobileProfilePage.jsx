import React, { useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useScrollToTop from '../../../hooks/useScrollToTop';

export default function MobileProfilePage({
  user,
  profile,
  stats,
  onSaveProfile,
  onChangePassword,
  savingProfile,
  savingPassword,
  passwords,
  setPasswords,
  setProfile
}) {
  useScrollToTop();
  const navigate = useNavigate();
  const isLoggedIn = !!storage.getToken();
  const [activeSection, setActiveSection] = useState('menu'); // 'menu', 'edit', 'password'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="lg:hidden bg-background min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">lock</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2 font-headline">Login Diperlukan</h2>
        <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
          Silakan login terlebih dahulu untuk mengakses profil bisnis, pengaturan alamat, dan detail akun Anda.
        </p>
        <button
          onClick={() => navigate('/login?redirect=/portal')}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm shadow-card-hover shadow-primary/20 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    storage.clear();
    window.location.href = '/login';
  };

  if (activeSection === 'edit') {
    return (
      <div className="lg:hidden bg-gradient-to-b from-primary/5 to-background min-h-screen pb-24">
        <header className="px-4 h-14 flex items-center gap-3 border-b border-outline-variant/20 sticky top-0 bg-background/95 backdrop-blur-md z-10">
          <button onClick={() => setActiveSection('menu')} className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-on-surface text-[20px]">arrow_back</span>
          </button>
          <h2 className="text-[18px] font-bold text-on-surface font-headline">Edit Profil</h2>
        </header>
        <main className="p-4">
          <form onSubmit={async (e) => {
            await onSaveProfile(e);
            setActiveSection('menu');
          }} className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nama Lengkap</label>
              <input required type="text" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface font-medium text-sm" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email</label>
              <input required type="email" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 opacity-60 text-on-surface font-medium text-sm" value={profile.email || ''} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">No Telepon</label>
              <input type="tel" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface font-medium text-sm" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Alamat Lengkap</label>
              <textarea rows="4" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface font-medium resize-none text-sm" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })}></textarea>
            </div>
            <button type="submit" disabled={savingProfile} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold shadow-card-hover shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              {savingProfile && <Loader2 className="h-5 w-5 animate-spin" />}
              {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  if (activeSection === 'password') {
    return (
      <div className="lg:hidden bg-gradient-to-b from-primary/5 to-background min-h-screen pb-24">
        <header className="px-4 h-14 flex items-center gap-3 border-b border-outline-variant/20 sticky top-0 bg-background/95 backdrop-blur-md z-10">
          <button onClick={() => setActiveSection('menu')} className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-on-surface text-[20px]">arrow_back</span>
          </button>
          <h2 className="text-[18px] font-bold text-on-surface font-headline">Ganti Password</h2>
        </header>
        <main className="p-4">
          <form onSubmit={async (e) => {
            await onChangePassword(e);
            setActiveSection('menu');
          }} className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password Saat Ini</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password Baru</label>
              <input required type="password" placeholder="Min. 8 Karakter" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Konfirmasi Password</label>
              <input required type="password" placeholder="Ulangi Password" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
            </div>
            <button type="submit" disabled={savingPassword} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold shadow-card-hover shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              {savingPassword && <Loader2 className="h-5 w-5 animate-spin" />}
              {savingPassword ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="lg:hidden bg-gradient-to-b from-primary/5 to-background min-h-screen">
      <main className="px-4 pt-5 pb-24 space-y-4">
        {/* Profile Header Card */}
        <section className="relative overflow-hidden rounded-[20px] bg-primary p-5 shadow-card shadow-primary/20">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-2xl text-white shrink-0">
              {user.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-white leading-tight line-clamp-1 font-headline">{user.name}</h2>
              <p className="text-[12px] text-white/80 truncate mt-0.5">{profile.email}</p>
            </div>
            <button onClick={() => setActiveSection('edit')} className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 text-white active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-[20px] shadow-card border border-outline-variant/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">package_2</span>
            </div>
            <div className="min-w-0">
              <p className="text-[18px] font-black text-on-surface leading-none">{stats.total || 0}</p>
              <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-bold">Total Pesanan</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-[20px] shadow-card border border-outline-variant/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <div className="min-w-0">
              <p className="text-[18px] font-black text-on-surface leading-none">{stats.production || 0}</p>
              <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-bold">Produksi Aktif</p>
            </div>
          </div>
        </section>

        {/* Pengaturan Akun */}
        <section className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 overflow-hidden">
          <h3 className="px-4 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-muted">Pengaturan Akun</h3>
          <div className="flex flex-col">
            <button onClick={() => setActiveSection('edit')} className="flex items-center justify-between px-4 py-3.5 active:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">person</span>
                <span className="text-[14px] font-medium text-on-surface">Profil Bisnis</span>
              </div>
              <span className="material-symbols-outlined text-muted text-[20px]">chevron_right</span>
            </button>
            <div className="mx-4 h-px bg-outline-variant/20" />
            <button onClick={() => setActiveSection('password')} className="flex items-center justify-between px-4 py-3.5 active:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">lock</span>
                <span className="text-[14px] font-medium text-on-surface">Ganti Password</span>
              </div>
              <span className="material-symbols-outlined text-muted text-[20px]">chevron_right</span>
            </button>
            <div className="mx-4 h-px bg-outline-variant/20" />
            <div className="flex items-center justify-between px-4 py-3.5 opacity-60">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-on-surface">Daftar Alamat</span>
                  <span className="text-[11px] text-muted">{profile.address || 'Belum diatur'}</span>
                </div>
              </div>
              <span className="text-[9px] font-black bg-surface-container-high px-2 py-0.5 rounded text-primary uppercase tracking-wider">Soon</span>
            </div>
          </div>
        </section>

        {/* Bantuan */}
        <section className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 overflow-hidden">
          <h3 className="px-4 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-muted">Bantuan</h3>
          <div className="flex flex-col">
            <a href="https://wa.me/6281226733221" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3.5 active:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">help_center</span>
                <span className="text-[14px] font-medium text-on-surface">Pusat Bantuan</span>
              </div>
              <span className="material-symbols-outlined text-muted text-[20px]">chevron_right</span>
            </a>
            <div className="mx-4 h-px bg-outline-variant/20" />
            <a href="https://wa.me/6281226733221" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3.5 active:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">chat</span>
                <span className="text-[14px] font-medium text-on-surface">Hubungi Support</span>
              </div>
              <span className="material-symbols-outlined text-muted text-[20px]">chevron_right</span>
            </a>
          </div>
        </section>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-error font-bold py-3.5 rounded-[20px] border border-error/30 bg-surface-container-lowest active:scale-[0.98] transition-transform shadow-card"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Keluar dari Akun
          </button>
          <p className="text-center text-[11px] text-muted mt-4 font-bold uppercase tracking-wider">UKM Kemasan 2026</p>
        </div>
      </main>
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Keluar Sistem"
        message="Yakin ingin keluar dari sistem?"
        confirmLabel="Keluar"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
