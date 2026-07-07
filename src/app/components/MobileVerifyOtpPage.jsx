import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';
import logoUrl from '../../assets/LogoUKM.svg';

const OTP_LENGTH = 6;

export default function MobileVerifyOtpPage() {
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
        msg = 'Kode OTP sudah kadaluarsa. Kirim ulang.';
      }
      if (err.response?.data?.code === 'INVALID_OTP') {
        msg = 'Kode OTP tidak cocok.';
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
      toast.success('Kode baru telah dikirim ke email Anda');
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
      <div className="min-h-screen bg-slate-50 flex flex-col lg:hidden items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800 mb-2">Email tidak ditemukan</h2>
        <p className="text-slate-500 text-sm mb-4 text-center">Daftar terlebih dahulu sebelum verifikasi.</p>
        <Link to="/register" className="text-[#4dbace] font-bold hover:underline">Daftar Sekarang</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:hidden animate-fade-in">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 -translate-x-1/4 translate-y-1/4">
          <img src={logoUrl} alt="" aria-hidden="true" className="w-[520px] max-w-none h-auto object-contain blur-[1px]" />
        </div>

        <div className="w-full max-w-xs z-10 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] p-4 border border-slate-100/50 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="mb-3 inline-flex items-center justify-center rounded-[1.125rem] border border-slate-200 bg-slate-50/80 px-3 py-2 shadow-sm">
                <img src={logoUrl} alt="Logo UKM Kemasan" className="h-8 w-auto object-contain" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                {verified ? 'Terverifikasi!' : 'Verifikasi Email'}
              </h1>
              {!verified && (
                <p className="mt-1 text-slate-500 font-medium text-xs">
                  Kode OTP dikirim ke {email}
                </p>
              )}
              {name && !verified && (
                <p className="text-[11px] text-slate-400 mt-0.5">Halo, {name}!</p>
              )}
            </div>

            {verified ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-fade-in" />
                <p className="text-slate-800 font-bold text-lg mb-2">Email Terverifikasi</p>
                <p className="text-slate-500 text-sm">Mengarahkan ke portal...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-5 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-red-700 text-xs font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="flex justify-center gap-2">
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
                        className="w-10 h-12 text-center text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4dbace] focus:bg-white focus:ring-2 focus:ring-[#4dbace]/10 transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpString.length !== OTP_LENGTH}
                    className="w-full bg-[#4dbace] hover:opacity-90 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#4dbace]/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verifikasi'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-xs font-medium text-slate-500">
                    Tidak menerima kode?{' '}
                    <button
                      onClick={handleResend}
                      disabled={resendLoading || resendCooldown > 0}
                      className="text-[#4dbace] font-black hover:underline underline-offset-4 decoration-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendLoading ? 'Mengirim...' : resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim ulang'}
                    </button>
                  </p>
                </div>

                <div className="pt-1 text-center">
                  <button
                    onClick={() => navigate('/register')}
                    className="text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft size={14} />
                    Kembali ke daftar
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 opacity-30">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
