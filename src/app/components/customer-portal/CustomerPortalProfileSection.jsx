import { Lock, Mail, MapPin, Phone, Save, User, Loader2 } from 'lucide-react';
import { InputField } from '../customer-dashboard/shared';

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
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div className="rounded-3xl bg-gradient-to-r from-primary to-primary p-6 text-white shadow-xl shadow-primary/20 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black backdrop-blur-sm">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-2xl font-black">{profile.name || user?.name}</h2>
            <p className="font-medium text-primary/10">{profile.email}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase backdrop-blur-sm">Customer Account</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8">
        <h3 className="mb-6 flex items-center gap-2 font-black text-slate-800"><User className="h-5 w-5 text-primary" /> Edit Profil</h3>
        <form onSubmit={onSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField icon={User} label="Nama" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} required />
            <InputField icon={Mail} label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField icon={Phone} label="No. Telepon" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
            <InputField icon={MapPin} label="Alamat" value={profile.address} onChange={(value) => setProfile({ ...profile, address: value })} />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 sm:w-auto"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Profil
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8">
        <h3 className="mb-6 flex items-center gap-2 font-black text-slate-800"><Lock className="h-5 w-5 text-primary" /> Ganti Password</h3>
        <form onSubmit={onChangePassword} className="space-y-4">
          <InputField
            icon={Lock}
            label="Password Lama"
            type="password"
            value={passwords.currentPassword}
            onChange={(value) => setPasswords({ ...passwords, currentPassword: value })}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              icon={Lock}
              label="Password Baru"
              type="password"
              value={passwords.newPassword}
              onChange={(value) => setPasswords({ ...passwords, newPassword: value })}
              required
              placeholder="Min. 6 karakter"
            />
            <InputField
              icon={Lock}
              label="Konfirmasi"
              type="password"
              value={passwords.confirmPassword}
              onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 sm:w-auto"
          >
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
}
