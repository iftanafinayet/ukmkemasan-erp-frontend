import React from 'react';
import { Loader2 } from 'lucide-react';

export default function CustomerPortalProfileSection({
  onChangePassword,
  onSaveProfile,
  passwords,
  profile,
  savingPassword,
  savingProfile,
  setPasswords,
  setProfile,
  user,
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Profile Header Editorial */}
      <header className="relative mb-12">
        <div className="h-48 md:h-64 rounded-xl overflow-hidden relative mb-[-4rem] z-0">
          <div className="absolute inset-0 bg-primary opacity-90"></div>
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        </div>
        <div className="relative z-10 px-4 md:px-8 flex flex-col md:flex-row items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 flex items-center justify-center bg-surface-container">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <span className="text-4xl md:text-5xl font-black text-primary/30 uppercase font-headline">{(profile.name || user?.name || 'C').charAt(0)}</span>
            )}
          </div>
          <div className="flex-grow pb-2 md:pb-4 text-center md:text-left self-center md:self-end">
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-white md:text-on-surface">{profile.name || user?.name}</h1>
            <p className="font-body text-white/80 md:text-on-secondary-container text-sm md:text-base">{profile.email}</p>
          </div>
          <div className="pb-4 hidden md:block">
            <span className="px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-sm font-semibold whitespace-nowrap">
                Customer Account
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16 md:mt-16">
        {/* Left Side: Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6 md:p-8">
            <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-secondary-container mb-6">Navigasi Profil</h2>
            <nav className="space-y-2">
              <a href="#edit-profil" className="flex items-center gap-3 p-3 rounded-lg bg-primary-container text-on-primary-container font-semibold transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                Edit Profil
              </a>
              <a href="#ganti-password" className="flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:bg-white/50 transition-all">
                <span className="material-symbols-outlined">lock</span>
                Ganti Password
              </a>
              <div className="flex items-center justify-between p-3 rounded-lg text-on-surface-variant cursor-not-allowed opacity-50">
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined">notifications</span>
                   Notifikasi
                 </div>
                 <span className="text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded-md">SOON</span>
              </div>
            </nav>
          </div>
          
          <div className="bg-primary/5 rounded-xl p-6 md:p-8 border border-primary/10">
            <h3 className="font-headline text-lg font-bold text-primary mb-2">Butuh Bantuan?</h3>
            <p className="text-sm text-on-secondary-container mb-4 font-body">Tim dukungan kami siap membantu Anda untuk segala kendala pesanan.</p>
            <button className="w-full py-3 px-4 rounded-full bg-white text-primary font-bold text-sm shadow-sm hover:shadow-md transition-all font-body">Hubungi CS</button>
          </div>
        </div>

        {/* Right Side: Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Edit Profil Section */}
          <section id="edit-profil" className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_12px_32px_-4px_rgba(0,106,98,0.05)] border border-outline-variant/10">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="font-headline text-2xl font-extrabold text-on-surface">Edit Profil</h2>
                   <p className="text-on-secondary-container text-sm font-body mt-1">Perbarui informasi personal Anda untuk pengalaman yang lebih baik.</p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl opacity-80 hidden sm:block">edit_square</span>
             </div>
             
             <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="font-label text-xs font-bold uppercase tracking-wider text-on-secondary-container ml-1">Nama Lengkap</label>
                   <input required type="text" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary text-on-surface transition-all font-body" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <label className="font-label text-xs font-bold uppercase tracking-wider text-on-secondary-container ml-1">Email</label>
                   <input required type="email" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary text-on-surface transition-all font-body opacity-70 cursor-not-allowed" value={profile.email || ''} readOnly disabled title="Email tidak dapat diubah" />
                </div>
                <div className="space-y-2">
                   <label className="font-label text-xs font-bold uppercase tracking-wider text-on-secondary-container ml-1">No Telepon</label>
                   <input type="tel" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary text-on-surface transition-all font-body" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="font-label text-xs font-bold uppercase tracking-wider text-on-secondary-container ml-1">Alamat Lengkap</label>
                   <textarea rows="3" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary text-on-surface transition-all font-body resize-none" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })}></textarea>
                </div>
                <div className="md:col-span-2 pt-4">
                   <button type="submit" disabled={savingProfile} className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 font-body w-full sm:w-auto">
                      {savingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                      {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                   </button>
                </div>
             </form>
          </section>

          {/* Ganti Password Section */}
          <section id="ganti-password" className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_12px_32px_-4px_rgba(0,106,98,0.05)] border border-outline-variant/10">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="font-headline text-2xl font-extrabold text-on-surface">Ganti Password</h2>
                   <p className="text-on-secondary-container text-sm font-body mt-1">Gunakan kata sandi yang kuat untuk menjaga keamanan akun Anda.</p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl opacity-80 hidden sm:block">key</span>
             </div>
             
             <form onSubmit={onChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2 md:col-span-2">
                      <label className="font-label text-xs font-bold uppercase tracking-wider text-on-secondary-container ml-1">Password Saat Ini</label>
                      <input required type="password" placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary text-on-surface transition-all font-body" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                   </div>
                   <div className="space-y-2">
                      <label className="font-label text-xs font-bold uppercase tracking-wider text-on-secondary-container ml-1">Password Baru</label>
                      <input required type="password" placeholder="Min. 8 Karakter" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary text-on-surface transition-all font-body" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                   </div>
                   <div className="space-y-2">
                      <label className="font-label text-xs font-bold uppercase tracking-wider text-on-secondary-container ml-1">Konfirmasi Password Baru</label>
                      <input required type="password" placeholder="Ulangi Password" className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary text-on-surface transition-all font-body" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                   </div>
                </div>
                <div className="pt-4">
                   <button type="submit" disabled={savingPassword} className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 font-body w-full sm:w-auto">
                      {savingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                      {savingPassword ? 'Memperbarui...' : 'Perbarui Password'}
                   </button>
                </div>
             </form>
          </section>
        </div>
      </div>
    </div>
  );
}
