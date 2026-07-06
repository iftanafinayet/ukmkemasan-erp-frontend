import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';
import logoUrl from '../../assets/LogoUKM.svg';

export default function MobileLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Email dan password wajib diisi');
      }

      const loginUrl = getAPIUrl(ENDPOINTS.LOGIN);
      const response = await axios.post(loginUrl, {
        email,
        password
      });

      if (response.data && response.data.token) {
        storage.setToken(response.data.token);
        storage.setUser({
          _id: response.data._id,
          name: response.data.name,
          role: response.data.role
        });

        toast.success('Sign in success!');
        const role = response.data.role;
        navigate(role === 'admin' ? '/admin' : '/portal');
      } else {
        throw new Error('Server response invalid');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:hidden animate-fade-in">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute bottom-[-10%] left-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 -translate-x-1/4 translate-y-1/4">
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="w-[520px] max-w-none h-auto object-contain blur-[1px]"
          />
        </div>

        <div className="w-full max-w-xs z-10 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] p-4 border border-slate-100/50 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="mb-3 inline-flex items-center justify-center rounded-[1.125rem] border border-slate-200 bg-slate-50/80 px-3 py-2 shadow-sm">
                <img src={logoUrl} alt="Logo UKM Kemasan" className="h-8 w-auto object-contain" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight font-headline">Welcome Back</h1>
              <p className="mt-1 text-slate-500 font-medium text-xs">Masuk untuk melanjutkan pesanan Anda</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5 group">
                <label className="block text-xs font-bold text-slate-700 ml-1 group-focus-within:text-[#4dbace] transition-colors">
                  Email / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full text-slate-800 px-3.5 py-2.5 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-[#4dbace] focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-xs font-bold text-slate-700 group-focus-within:text-[#4dbace] transition-colors">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[10px] font-bold text-[#4dbace] hover:underline underline-offset-4">Lupa Password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-slate-800 px-3.5 py-2.5 pr-11 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-[#4dbace] focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4dbace] hover:opacity-90 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#4dbace]/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs font-medium text-slate-500">
                  Belum punya akun? {' '}
                  <Link to="/register" className="text-[#4dbace] font-black hover:underline underline-offset-4 decoration-2">Daftar Sekarang</Link>
                </p>
              </div>

              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase">ATAU</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/portal')}
                className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Masuk Sebagai Tamu
              </button>
            </form>
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
