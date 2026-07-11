import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { ENDPOINTS, getAPIUrl } from '../config/environment';
import logoUrl from '../../assets/LogoUKM.svg';

const STEPS = {
  REQUEST_OTP: 'REQUEST_OTP',
  RESET_PASSWORD: 'RESET_PASSWORD',
  SUCCESS: 'SUCCESS',
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.REQUEST_OTP);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email) throw new Error('Email wajib diisi');

      const url = getAPIUrl(ENDPOINTS.FORGOT_PASSWORD);
      await axios.post(url, { email });
      toast.success('Kode OTP telah dikirim ke email Anda');
      setStep(STEPS.RESET_PASSWORD);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal mengirim OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp) throw new Error('Kode OTP wajib diisi');
      if (!newPassword || newPassword.length < 6) throw new Error('Password baru minimal 6 karakter');

      const url = getAPIUrl(ENDPOINTS.RESET_PASSWORD);
      await axios.post(url, { email, code: otp, newPassword });
      toast.success('Password berhasil direset! Silakan login kembali.');
      setStep(STEPS.SUCCESS);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal mereset password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <form onSubmit={handleRequestOtp} className="space-y-3 md:space-y-4">
      <div className="space-y-1.5">
        <label className="block text-xs text-on-surface-variant ml-1 font-medium">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email terdaftar Anda"
            className="w-full text-on-surface p-2.5 pl-10 md:pl-12 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted text-sm"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error-container rounded-xl border border-error/20 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
          <p className="text-on-error-container text-xs font-semibold leading-relaxed">{error}</p>
        </div>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 rounded-xl font-bold text-sm tracking-wide shadow-card hover:shadow-card-hover active:scale-[0.98] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>MENGIRIM OTP...</span>
            </>
          ) : (
            'KIRIM KODE OTP'
          )}
        </button>
      </div>
    </form>
  );

  const renderStepTwo = () => (
    <form onSubmit={handleResetPassword} className="space-y-3 md:space-y-4">
      <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-start gap-2.5">
        <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Kode OTP telah dikirim ke <span className="font-semibold text-on-surface">{email}</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs text-on-surface-variant ml-1 font-medium">Kode OTP</label>
        <div className="relative">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Masukkan 6 digit kode OTP"
            className="w-full text-on-surface p-2.5 pl-4 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted text-sm tracking-[0.3em] text-center"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs text-on-surface-variant ml-1 font-medium">Password Baru</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full text-on-surface p-2.5 pl-10 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted text-sm"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error-container rounded-xl border border-error/20 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
          <p className="text-on-error-container text-xs font-semibold leading-relaxed">{error}</p>
        </div>
      )}

      <div className="pt-1 flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 rounded-xl font-bold text-sm tracking-wide shadow-card hover:shadow-card-hover active:scale-[0.98] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>MERESET PASSWORD...</span>
            </>
          ) : (
            'RESET PASSWORD'
          )}
        </button>

        <button
          type="button"
          onClick={handleRequestOtp}
          disabled={loading}
          className="text-xs font-semibold text-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          Kirim ulang kode OTP
        </button>
      </div>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center py-6 space-y-4 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-on-surface">Password Berhasil Direset!</h4>
        <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
          Silakan login menggunakan password baru Anda.
        </p>
      </div>
      <button
        onClick={() => navigate('/login')}
        className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 rounded-xl font-bold text-sm tracking-wide shadow-card active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        KEMBALI KE LOGIN
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-surface-container-lowest font-sans overflow-hidden animate-fade-in">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 -translate-x-1/4 translate-y-1/4">
          <img src={logoUrl} alt="" aria-hidden="true" className="w-[520px] xl:w-[660px] max-w-none h-auto object-contain blur-[1px]" />
        </div>

        <div className="w-full max-w-xs lg:max-w-[440px] z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-modal p-4 md:p-8 border border-outline-variant/20">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors mb-4 md:mb-6 cursor-pointer"
            >
              <ArrowLeft size={14} />
              Kembali ke Login
            </Link>

            <div className="text-center mb-4">
              <div className="mb-2 inline-flex items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2 shadow-sm lg:hidden">
                <img src={logoUrl} alt="Logo UKM Kemasan" className="h-8 w-auto object-contain" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
                {step === STEPS.SUCCESS ? 'Password Direset' : 'Lupa Password'}
              </h3>
              <div className="mt-1 text-on-surface-variant font-medium text-xs">
                {step === STEPS.REQUEST_OTP && 'Masukkan email Anda untuk menerima kode OTP'}
                {step === STEPS.RESET_PASSWORD && 'Masukkan kode OTP dan password baru Anda'}
                {step === STEPS.SUCCESS && 'Password Anda berhasil diperbarui'}
              </div>
            </div>

            {step === STEPS.REQUEST_OTP && renderStepOne()}
            {step === STEPS.RESET_PASSWORD && renderStepTwo()}
            {step === STEPS.SUCCESS && renderSuccess()}
          </div>

          <div className="mt-5 lg:mt-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 opacity-30">
              <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
              <div className="w-6 h-0.5 bg-surface-container-high rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(color-mix(in srgb, var(--color-primary) 95%, transparent), color-mix(in srgb, var(--color-primary-dark) 98%, transparent)),
              repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 40px)
            `,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent opacity-50 z-1"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl animate-slide-up">
          <div className="mb-12 flex flex-col items-center group">
            <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white px-10 py-7 shadow-modal transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01]">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sky-100/80 to-transparent"></div>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl"></div>
              <img
                src={logoUrl}
                alt="Logo UKM Kemasan"
                className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.45em] text-white/75">Account Recovery</p>
            <h1 className="text-white text-5xl font-bold tracking-tight uppercase">UKM Kemasan</h1>
            <div className="mt-4 inline-flex items-center rounded-full border border-white/80 bg-white px-5 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-primary shadow-card">
              Reset Password
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-white p-5 text-left shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">Secure Recovery</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-on-surface-variant">
                Kode OTP dikirim langsung ke email terdaftar Anda untuk keamanan akun.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-5 text-left shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">Quick Access</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-on-surface-variant">
                Reset password dalam hitungan menit dan kembali mengakses akun Anda.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight px-4 opacity-95">
              "Lupa password? Jangan khawatir — kami bantu Anda kembali."
            </h2>
            <div className="h-1 w-16 bg-white/30 mx-auto rounded-full"></div>
            <p className="text-blue-50 font-medium text-base tracking-wide">
              Account recovery portal for UKM Kemasan ERP
            </p>
          </div>
        </div>

        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-black/10 rounded-full blur-[120px] pointer-events-none"></div>
      </div>
    </div>
  );
}
