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
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute bottom-[-10%] left-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 -translate-x-1/4 translate-y-1/4">
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="w-[520px] max-w-none h-auto object-contain blur-[1px]"
          />
        </div>

        <div className="w-full max-w-md z-10 animate-slide-up">
          <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-slate-100/50 backdrop-blur-sm">
            <div className="text-center mb-10">
              <div className="mb-6 inline-flex items-center justify-center rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-5 py-4 shadow-sm">
                <img src={logoUrl} alt="Logo UKM Kemasan" className="h-14 w-auto object-contain" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight font-headline">Welcome Back</h1>
              <p className="mt-2 text-slate-400 font-medium text-sm">Masuk untuk melanjutkan pesanan Anda</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-sm font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 group">
                <label className="block text-sm font-bold text-slate-700 ml-1 group-focus-within:text-[#4dbace] transition-colors">
                  Email / Username
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full text-slate-800 p-4 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-[#4dbace] focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-sm font-bold text-slate-700 group-focus-within:text-[#4dbace] transition-colors">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#4dbace] hover:underline underline-offset-4">Lupa Password?</Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-slate-800 p-4 pr-12 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-[#4dbace] focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#4dbace] hover:opacity-90 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#4dbace]/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                </button>
              </div>

              <div className="mt-10 text-center">
                <p className="text-sm font-medium text-slate-500">
                  Belum punya akun? {' '}
                  <Link to="/register" className="text-[#4dbace] font-black hover:underline underline-offset-4 decoration-2">Daftar Sekarang</Link>
                </p>
              </div>

              <div className="relative flex items-center gap-4 py-6">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">ATAU</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <button 
                type="button"
                onClick={() => navigate('/portal')}
                className="w-full bg-white border-2 border-slate-200 text-slate-800 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Masuk Sebagai Tamu
              </button>
            </form>
          </div>

          <div className="mt-12 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 opacity-30">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
              &copy; 2026 UKM Kemasan &#8211; Official ERP System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
