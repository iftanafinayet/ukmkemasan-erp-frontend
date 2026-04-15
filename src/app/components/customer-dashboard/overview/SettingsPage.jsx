import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Loader2,
  Save,
} from 'lucide-react';
import { InputField } from '../shared';
import LandingContentSettingsSection from '../LandingContentSettingsSection';

export default function SettingsPage({
  isAdmin,
  landingContent,
  onActivityChange,
  onActivityImageChange,
  onActivityRemoveImage,
  onAddActivity,
  onAddArticle,
  onChangePassword,
  onRemoveActivity,
  onRemoveArticle,
  onSaveProfile,
  onSaveLandingContent,
  onSectionConfigChange,
  onArticleChange,
  onArticleImageChange,
  onArticleRemoveImage,
  onPortfolioChange,
  onPortfolioImageChange,
  onPortfolioRemoveImage,
  onAddPortfolio,
  onRemovePortfolio,
  passwords,
  profile,
  savingLandingContent,
  savingPassword,
  savingProfile,
  setPasswords,
  setProfile,
  user,
}) {
  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isAdmin ? 'max-w-5xl' : 'max-w-2xl'}`}>
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profil Saya
        </h3>
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
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Profil
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Ganti Password
        </h3>
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
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Ubah Password
          </button>
        </form>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Info Akun</p>
        <p className="text-sm text-slate-600">
          Role: <span className="font-bold text-primary uppercase">{user?.role}</span>
        </p>
      </div>

      {isAdmin && (
        <LandingContentSettingsSection
          landingContent={landingContent}
          onActivityChange={onActivityChange}
          onActivityImageChange={onActivityImageChange}
          onActivityRemoveImage={onActivityRemoveImage}
          onAddActivity={onAddActivity}
          onAddArticle={onAddArticle}
          onArticleChange={onArticleChange}
          onArticleImageChange={onArticleImageChange}
          onArticleRemoveImage={onArticleRemoveImage}
          onRemoveActivity={onRemoveActivity}
          onRemoveArticle={onRemoveArticle}
          onPortfolioChange={onPortfolioChange}
          onPortfolioImageChange={onPortfolioImageChange}
          onPortfolioRemoveImage={onPortfolioRemoveImage}
          onAddPortfolio={onAddPortfolio}
          onRemovePortfolio={onRemovePortfolio}
          onSectionConfigChange={onSectionConfigChange}
          onSave={onSaveLandingContent}
          saving={savingLandingContent}
        />
      )}
    </div>
  );
}
