import React, { useCallback } from 'react';
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
  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <section className="relative overflow-hidden rounded-[24px] bg-primary p-6 md:p-8 shadow-card shadow-primary/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl md:text-5xl font-black text-white uppercase font-headline">{(profile.name || user?.name || 'C').charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-headline text-2xl md:text-3xl font-black tracking-tight text-white line-clamp-1">{profile.name || user?.name}</h1>
            <p className="text-white/80 text-sm mt-0.5 truncate">{profile.email}</p>
            <span className="mt-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Customer Account
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Profile Sidebar */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 overflow-hidden">
            <h2 className="px-5 pt-5 pb-2 text-[10px] font-black uppercase tracking-widest text-muted">Navigasi Profil</h2>
            <nav className="flex flex-col p-2">
              <button onClick={() => scrollTo('edit-profil')} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-on-surface font-semibold hover:bg-surface-container-low transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person</span>
                Edit Profil
              </button>
              <button onClick={() => scrollTo('ganti-password')} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-on-surface font-semibold hover:bg-surface-container-low transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <span className="material-symbols-outlined text-primary text-[22px]">lock</span>
                Ganti Password
              </button>
              <div className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-muted cursor-not-allowed opacity-60">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
                  <span className="font-semibold">Notifikasi</span>
                </div>
                <span className="text-[9px] font-black bg-surface-container-high px-2 py-0.5 rounded uppercase tracking-wider text-primary">Soon</span>
              </div>
            </nav>
          </div>

          <div className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 p-5">
            <h3 className="font-headline text-[15px] font-bold text-on-surface mb-1">Butuh Bantuan?</h3>
            <p className="text-[13px] text-on-surface-variant mb-4 leading-relaxed">Tim dukungan kami siap membantu Anda untuk segala kendala pesanan.</p>
            <a
              href="https://wa.me/6281226733221"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/15 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Hubungi CS
            </a>
          </div>
        </div>

        {/* Right Side: Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Edit Profil Section */}
          <section id="edit-profil" className="bg-surface-container-lowest rounded-[20px] p-5 md:p-6 shadow-card border border-outline-variant/20">
            <div className="flex items-start gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">edit_square</span>
              <div>
                <h2 className="font-headline text-[18px] font-bold text-on-surface">Edit Profil</h2>
                <p className="text-on-surface-variant text-[12px] mt-0.5">Perbarui informasi personal Anda untuk pengalaman yang lebih baik.</p>
              </div>
            </div>

            <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nama Lengkap</label>
                <input required type="text" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm transition-all" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email</label>
                <input required type="email" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 opacity-60 text-on-surface text-sm cursor-not-allowed" value={profile.email || ''} readOnly disabled title="Email tidak dapat diubah" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">No Telepon</label>
                <input type="tel" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm transition-all" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Alamat Lengkap</label>
                <textarea rows="3" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm resize-none transition-all" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })}></textarea>
              </div>
              <div className="md:col-span-2 pt-1">
                <button type="submit" disabled={savingProfile} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] shadow-card-hover shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  {savingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </section>

          {/* Ganti Password Section */}
          <section id="ganti-password" className="bg-surface-container-lowest rounded-[20px] p-5 md:p-6 shadow-card border border-outline-variant/20">
            <div className="flex items-start gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">key</span>
              <div>
                <h2 className="font-headline text-[18px] font-bold text-on-surface">Ganti Password</h2>
                <p className="text-on-surface-variant text-[12px] mt-0.5">Gunakan kata sandi yang kuat untuk menjaga keamanan akun Anda.</p>
              </div>
            </div>

            <form onSubmit={onChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password Saat Ini</label>
                  <input required type="password" placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm transition-all" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password Baru</label>
                  <input required type="password" placeholder="Min. 8 Karakter" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm transition-all" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Konfirmasi Password Baru</label>
                  <input required type="password" placeholder="Ulangi Password" className="w-full bg-surface-container-low border-none rounded-xl p-3.5 focus:ring-2 focus:ring-primary text-on-surface text-sm transition-all" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                </div>
              </div>
              <div className="pt-1">
                <button type="submit" disabled={savingPassword} className="bg-surface-container-lowest border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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
