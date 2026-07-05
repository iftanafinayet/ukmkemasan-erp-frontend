import React, { useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

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
  const navigate = useNavigate();
  const isLoggedIn = !!storage.getToken();
  const [activeSection, setActiveSection] = useState('menu'); // 'menu', 'edit', 'password'

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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    storage.clear();
    window.location.href = '/login';
  };

  if (activeSection === 'edit') {
    return (
      <div className="lg:hidden bg-surface-container-lowest min-h-screen pb-24">
        <header className="px-4 h-14 flex items-center gap-3 border-b border-outline-variant/20 sticky top-0 bg-surface-container-lowest z-10">
          <button onClick={() => setActiveSection('menu')} className="p-1">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h2 className="text-[18px] font-bold text-on-surface font-headline">Edit Profil</h2>
        </header>
        <main className="p-4">
          <form onSubmit={async (e) => {
            await onSaveProfile(e);
            setActiveSection('menu');
          }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted ml-1">Nama Lengkap</label>
              <input required type="text" className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface font-medium" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted ml-1">Email</label>
              <input required type="email" className="w-full bg-surface-container-low border-none rounded-xl p-4 opacity-60 text-on-surface font-medium" value={profile.email || ''} readOnly disabled />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted ml-1">No Telepon</label>
              <input type="tel" className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface font-medium" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted ml-1">Alamat Lengkap</label>
              <textarea rows="4" className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface font-medium resize-none" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })}></textarea>
            </div>
            <button type="submit" disabled={savingProfile} className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold shadow-card-hover shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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
      <div className="lg:hidden bg-surface-container-lowest min-h-screen pb-24">
        <header className="px-4 h-14 flex items-center gap-3 border-b border-outline-variant/20 sticky top-0 bg-surface-container-lowest z-10">
          <button onClick={() => setActiveSection('menu')} className="p-1">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h2 className="text-[18px] font-bold text-on-surface font-headline">Ganti Password</h2>
        </header>
        <main className="p-4">
          <form onSubmit={async (e) => {
            await onChangePassword(e);
            setActiveSection('menu');
          }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted ml-1">Password Saat Ini</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted ml-1">Password Baru</label>
              <input required type="password" placeholder="Min. 8 Karakter" className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted ml-1">Konfirmasi Password</label>
              <input required type="password" placeholder="Ulangi Password" className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary text-on-surface" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
            </div>
            <button type="submit" disabled={savingPassword} className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold shadow-card-hover shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              {savingPassword && <Loader2 className="h-5 w-5 animate-spin" />}
              {savingPassword ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="lg:hidden bg-background min-h-screen">
      <main className="pb-24">
        {/* Profile Header Section */}
        <section className="bg-surface-container-lowest px-4 py-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-0.5 bg-surface-container-low flex items-center justify-center font-bold text-2xl text-primary">
              {user.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-on-surface leading-tight line-clamp-1 font-headline">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-container text-primary text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[12px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Member
                </span>
                <span className="text-[12px] text-muted truncate">{profile.email}</span>
              </div>
            </div>
            <button onClick={() => setActiveSection('edit')} className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">edit</button>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 flex flex-col items-center">
              <span className="text-[12px] text-muted mb-1">Total Pesanan</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">package_2</span>
                <span className="font-bold text-on-surface">{stats.total || 0}</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 flex flex-col items-center">
              <span className="text-[12px] text-muted mb-1">Produksi Aktif</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <span className="font-bold text-on-surface">{stats.production || 0}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Groups */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Akun Saya Group */}
          <div className="bg-surface-container-lowest border-y border-outline-variant/20">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider font-headline">Pengaturan Akun</h3>
            </div>
            <div className="flex flex-col">
              <div onClick={() => setActiveSection('edit')} className="flex items-center justify-between px-4 py-4 hover:bg-surface-container-low transition-all duration-200 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <span className="text-[16px] font-medium text-on-surface">Profil Bisnis</span>
                </div>
                <span className="material-symbols-outlined text-muted">chevron_right</span>
              </div>
              <div className="mx-4 h-[1px] bg-outline-variant/20"></div>
              <div onClick={() => setActiveSection('password')} className="flex items-center justify-between px-4 py-4 hover:bg-surface-container-low transition-all duration-200 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <span className="text-[16px] font-medium text-on-surface">Ganti Password</span>
                </div>
                <span className="material-symbols-outlined text-muted">chevron_right</span>
              </div>
              <div className="mx-4 h-[1px] bg-outline-variant/20"></div>
              <div className="flex items-center justify-between px-4 py-4 hover:bg-surface-container-low transition-all duration-200 group cursor-pointer opacity-50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-medium text-on-surface">Daftar Alamat</span>
                    <span className="text-[11px] text-muted">{profile.address || 'Belum diatur'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-surface-container-low px-2 py-0.5 rounded text-primary">SOON</span>
              </div>
            </div>
          </div>

          {/* Bantuan Group */}
          <div className="bg-surface-container-lowest border-y border-outline-variant/20">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider font-headline">Bantuan</h3>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 hover:bg-surface-container-low transition-all duration-200 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">help_center</span>
                  <span className="text-[16px] font-medium text-on-surface">Pusat Bantuan</span>
                </div>
                <span className="material-symbols-outlined text-muted">chevron_right</span>
              </div>
              <div className="mx-4 h-[1px] bg-outline-variant/20"></div>
              <div className="flex items-center justify-between px-4 py-4 hover:bg-surface-container-low transition-all duration-200 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">chat</span>
                  <span className="text-[16px] font-medium text-on-surface">Hubungi Support</span>
                </div>
                <span className="material-symbols-outlined text-muted">chevron_right</span>
              </div>
            </div>
          </div>

          {/* Logout Button Section */}
          <div className="px-4 py-8">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-error font-bold py-4 rounded-xl border border-error/30 bg-surface-container-lowest active:scale-[0.98] transition-all duration-200 shadow-card cursor-pointer focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
            >
              <span className="material-symbols-outlined">logout</span>
              Keluar dari Akun
            </button>
            <p className="text-center text-[11px] text-muted mt-4 font-bold uppercase tracking-wider">Versi 2.4.1 (UKM Kemasan Mobile)</p>
          </div>
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
