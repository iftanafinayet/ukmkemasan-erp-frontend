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
      <div className="lg:hidden bg-[#faf8ff] min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-[#4dbace]/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[#4dbace] text-4xl">lock</span>
        </div>
        <h2 className="text-xl font-bold text-[#131b2e] mb-2 font-headline">Login Diperlukan</h2>
        <p className="text-[#3c4947] text-sm mb-8 leading-relaxed">
          Silakan login terlebih dahulu untuk mengakses profil bisnis, pengaturan alamat, dan detail akun Anda.
        </p>
        <button 
          onClick={() => navigate('/login?redirect=/portal')}
          className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#4dbace]/20 active:scale-95 transition-transform"
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
      <div className="lg:hidden bg-white min-h-screen pb-24">
        <header className="px-4 h-14 flex items-center gap-3 border-b border-[#bbc9c7]/20 sticky top-0 bg-white z-10">
          <button onClick={() => setActiveSection('menu')} className="p-1">
            <span className="material-symbols-outlined text-[#131b2e]">arrow_back</span>
          </button>
          <h2 className="text-[18px] font-bold text-[#131b2e] font-headline">Edit Profil</h2>
        </header>
        <main className="p-4">
          <form onSubmit={async (e) => {
            await onSaveProfile(e);
            setActiveSection('menu');
          }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#6c7a77] ml-1">Nama Lengkap</label>
              <input required type="text" className="w-full bg-[#f2f3ff] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#4dbace] text-[#131b2e] font-medium" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#6c7a77] ml-1">Email</label>
              <input required type="email" className="w-full bg-[#f2f3ff] border-none rounded-xl p-4 opacity-60 text-[#131b2e] font-medium" value={profile.email || ''} readOnly disabled />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#6c7a77] ml-1">No Telepon</label>
              <input type="tel" className="w-full bg-[#f2f3ff] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#4dbace] text-[#131b2e] font-medium" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#6c7a77] ml-1">Alamat Lengkap</label>
              <textarea rows="4" className="w-full bg-[#f2f3ff] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#4dbace] text-[#131b2e] font-medium resize-none" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })}></textarea>
            </div>
            <button type="submit" disabled={savingProfile} className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#4dbace]/20 flex items-center justify-center gap-2">
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
      <div className="lg:hidden bg-white min-h-screen pb-24">
        <header className="px-4 h-14 flex items-center gap-3 border-b border-[#bbc9c7]/20 sticky top-0 bg-white z-10">
          <button onClick={() => setActiveSection('menu')} className="p-1">
            <span className="material-symbols-outlined text-[#131b2e]">arrow_back</span>
          </button>
          <h2 className="text-[18px] font-bold text-[#131b2e] font-headline">Ganti Password</h2>
        </header>
        <main className="p-4">
          <form onSubmit={async (e) => {
            await onChangePassword(e);
            setActiveSection('menu');
          }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#6c7a77] ml-1">Password Saat Ini</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-[#f2f3ff] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#4dbace] text-[#131b2e]" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#6c7a77] ml-1">Password Baru</label>
              <input required type="password" placeholder="Min. 8 Karakter" className="w-full bg-[#f2f3ff] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#4dbace] text-[#131b2e]" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#6c7a77] ml-1">Konfirmasi Password</label>
              <input required type="password" placeholder="Ulangi Password" className="w-full bg-[#f2f3ff] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#4dbace] text-[#131b2e]" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
            </div>
            <button type="submit" disabled={savingPassword} className="w-full bg-[#4dbace] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#4dbace]/20 flex items-center justify-center gap-2">
              {savingPassword && <Loader2 className="h-5 w-5 animate-spin" />}
              {savingPassword ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="lg:hidden bg-[#f0f3f7] min-h-screen">
      <main className="pb-24">
        {/* Profile Header Section */}
        <section className="bg-white px-4 py-6 border-b border-[#bbc9c7]/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#4dbace]/20 p-0.5 bg-[#f2f3ff] flex items-center justify-center font-bold text-2xl text-[#4dbace]">
              {user.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-[#131b2e] leading-tight line-clamp-1 font-headline">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#d3e1f6] text-[#4dbace] text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[12px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Member
                </span>
                <span className="text-[12px] text-[#6c7a77] truncate">{profile.email}</span>
              </div>
            </div>
            <button onClick={() => setActiveSection('edit')} className="material-symbols-outlined text-[#4dbace] bg-[#4dbace]/10 p-2 rounded-lg">edit</button>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-xl border border-[#bbc9c7]/50 flex flex-col items-center">
              <span className="text-[12px] text-[#6c7a77] mb-1">Total Pesanan</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#4dbace] text-[18px]">package_2</span>
                <span className="font-bold text-[#131b2e]">{stats.total || 0}</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#bbc9c7]/50 flex flex-col items-center">
              <span className="text-[12px] text-[#6c7a77] mb-1">Produksi Aktif</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#4dbace] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <span className="font-bold text-[#131b2e]">{stats.production || 0}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Groups */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Akun Saya Group */}
          <div className="bg-white border-y border-[#bbc9c7]/20">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[14px] font-bold text-[#3c4947] uppercase tracking-wider font-headline">Pengaturan Akun</h3>
            </div>
            <div className="flex flex-col">
              <div onClick={() => setActiveSection('edit')} className="flex items-center justify-between px-4 py-4 hover:bg-[#f2f3ff] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4dbace]">person</span>
                  <span className="text-[16px] font-medium text-[#131b2e]">Profil Bisnis</span>
                </div>
                <span className="material-symbols-outlined text-[#6c7a77]">chevron_right</span>
              </div>
              <div className="mx-4 h-[1px] bg-[#bbc9c7]/20"></div>
              <div onClick={() => setActiveSection('password')} className="flex items-center justify-between px-4 py-4 hover:bg-[#f2f3ff] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4dbace]">lock</span>
                  <span className="text-[16px] font-medium text-[#131b2e]">Ganti Password</span>
                </div>
                <span className="material-symbols-outlined text-[#6c7a77]">chevron_right</span>
              </div>
              <div className="mx-4 h-[1px] bg-[#bbc9c7]/20"></div>
              <div className="flex items-center justify-between px-4 py-4 hover:bg-[#f2f3ff] transition-colors group cursor-pointer opacity-50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4dbace]">location_on</span>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-medium text-[#131b2e]">Daftar Alamat</span>
                    <span className="text-[11px] text-[#6c7a77]">{profile.address || 'Belum diatur'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#f2f3ff] px-2 py-0.5 rounded text-[#4dbace]">SOON</span>
              </div>
            </div>
          </div>

          {/* Bantuan Group */}
          <div className="bg-white border-y border-[#bbc9c7]/20">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[14px] font-bold text-[#3c4947] uppercase tracking-wider font-headline">Bantuan</h3>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 hover:bg-[#f2f3ff] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4dbace]">help_center</span>
                  <span className="text-[16px] font-medium text-[#131b2e]">Pusat Bantuan</span>
                </div>
                <span className="material-symbols-outlined text-[#6c7a77]">chevron_right</span>
              </div>
              <div className="mx-4 h-[1px] bg-[#bbc9c7]/20"></div>
              <div className="flex items-center justify-between px-4 py-4 hover:bg-[#f2f3ff] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4dbace]">chat</span>
                  <span className="text-[16px] font-medium text-[#131b2e]">Hubungi Support</span>
                </div>
                <span className="material-symbols-outlined text-[#6c7a77]">chevron_right</span>
              </div>
            </div>
          </div>

          {/* Logout Button Section */}
          <div className="px-4 py-8">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-[#ba1a1a] font-bold py-4 rounded-xl border border-[#ba1a1a]/30 bg-white active:scale-[0.98] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined">logout</span>
              Keluar dari Akun
            </button>
            <p className="text-center text-[11px] text-[#6c7a77] mt-4 font-bold uppercase tracking-wider">Versi 2.4.1 (UKM Kemasan Mobile)</p>
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
