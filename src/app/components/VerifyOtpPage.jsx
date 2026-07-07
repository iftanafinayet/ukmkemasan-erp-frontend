import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';
import MobileVerifyOtpPage from './MobileVerifyOtpPage';
import logoUrl from '../../assets/LogoUKM.svg';

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const name = location.state?.name || '';

  const [code, setCode] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newCode = [...code];
    for (let i = 0; i < OTP_LENGTH; i++) {
      newCode[i] = pasted[i] || '';
    }
    setCode(newCode);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  }, [code]);

  const otpString = code.join('');

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (otpString.length !== OTP_LENGTH) {
      setError('Masukkan kode OTP 6 digit yang lengkap');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = getAPIUrl('/auth/verify-otp');
      const response = await axios.post(url, { email, code: otpString });
      if (response.data && response.data.token) {
        storage.setToken(response.data.token);
        storage.setUser({
          _id: response.data._id,
          name: response.data.name,
          role: response.data.role,
        });
        setVerified(true);
        toast.success('Email berhasil diverifikasi!');
        setTimeout(() => navigate('/portal'), 1200);
      }
    } catch (err) {
      let msg = 'Verifikasi gagal. Coba lagi.';
      if (err.response?.data?.message) msg = err.response.data.message;
      if (err.response?.data?.code === 'OTP_EXPIRED') {
        msg = 'Kode OTP sudah kadaluarsa. Silakan kirim ulang.';
      }
      if (err.response?.data?.code === 'INVALID_OTP') {
        msg = 'Kode OTP tidak cocok. Periksa kembali.';
      }
      setError(msg);
      setCode(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setError('');
    try {
      const url = getAPIUrl('/auth/send-otp');
      await axios.post(url, { email });
      toast.success('Kode OTP baru telah dikirim ke email Anda');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal kirim ulang OTP';
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-bold text-on-surface mb-2">Email tidak ditemukan</h2>
          <p className="text-on-surface-variant text-sm mb-4">Silakan daftar terlebih dahulu sebelum verifikasi.</p>
          <Link to="/register" className="text-primary font-bold hover:underline">Daftar Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <MobileVerifyOtpPage />

    <div className="hidden lg:flex min-h-screen w-full bg-surface-container-lowest font-sans overflow-hidden animate-fade-in">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 -translate-x-1/4 translate-y-1/4">
          <img src={logoUrl} alt="" aria-hidden="true" className="w-[520px] xl:w-[660px] max-w-none h-auto object-contain blur-[1px]" />
        </div>

        <div className="w-full max-w-xs lg:max-w-[440px] z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-modal p-4 md:p-8 border border-outline-variant/20">
            <div className="text-center mb-6">
              <button
                onClick={() => navigate('/register')}
                className="absolute top-4 left-4 p-2 text-muted hover:text-on-surface transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="mb-2 inline-flex items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2 shadow-sm lg:hidden">
                <img src={logoUrl} alt="Logo UKM Kemasan" className="h-8 w-auto object-contain" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">Verifikasi Email</h3>
              <div className="mt-1 text-on-surface-variant font-medium text-xs">
                {verified ? 'Verifikasi berhasil!' : `Masukkan kode OTP yang dikirim ke email Anda`}
              </div>
            </div>

            {verified ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-fade-in" />
                <p className="text-on-surface font-bold text-lg mb-2">Email Terverifikasi</p>
                <p className="text-on-surface-variant text-sm">Mengarahkan ke portal...</p>
              </div>
            ) : (
              <>
                <div className="mb-5 p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <Mail className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-on-surface-variant font-medium">
                    Kode OTP dikirim ke <span className="text-primary font-bold">{email}</span>
                  </p>
                  {name && <p className="text-[11px] text-muted mt-0.5">Halo, {name}!</p>}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-error-container rounded-xl border border-error/20 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                    <p className="text-on-error-container text-xs font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-5">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={idx === 0 ? handlePaste : undefined}
                        autoFocus={idx === 0}
                        className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold text-on-surface bg-surface-container-low border-2 border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpString.length !== OTP_LENGTH}
                    className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 rounded-xl font-bold text-sm tracking-wide shadow-card active:scale-[0.98] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>MEMVERIFIKASI...</span>
                      </>
                    ) : (
                      'VERIFIKASI'
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <p className="text-on-surface-variant text-xs">
                    Tidak menerima kode?{' '}
                    <button
                      onClick={handleResend}
                      disabled={resendLoading || resendCooldown > 0}
                      className="text-primary font-bold hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {resendLoading ? 'Mengirim...' : resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim ulang'}
                    </button>
                  </p>
                </div>
              </>
            )}
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
        <div className="absolute inset-0 z-0"
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
              <img src={logoUrl} alt="Logo UKM Kemasan" className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.45em] text-white/75">Email Verification</p>
            <h1 className="text-white text-4xl font-bold tracking-tight">Verifikasi Akun</h1>
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 text-left shadow-card max-w-xs">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary mb-3">Langkah Verifikasi</p>
            <ol className="text-sm font-medium text-on-surface-variant leading-relaxed space-y-2 list-decimal list-inside">
              <li>Daftar akun dengan email Anda</li>
              <li>Cek inbox email untuk kode OTP 6 digit</li>
              <li>Masukkan kode di halaman ini untuk mengaktifkan akun</li>
            </ol>
          </div>
        </div>

        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-black/10 rounded-full blur-[120px] pointer-events-none"></div>
      </div>
    </div>
    </>
  );
}
