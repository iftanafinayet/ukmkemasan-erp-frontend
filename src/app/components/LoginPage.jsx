import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';
import logoUrl from '../../assets/LogoUKM.svg';
import MobileLoginPage from './MobileLoginPage';

export default function LoginPage() {
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
      const response = await axios.post(loginUrl, { email, password });

      if (response.data && response.data.token) {
        storage.setToken(response.data.token);
        storage.setUser({
          _id: response.data._id,
          name: response.data.name,
          role: response.data.role
        });
        toast.success('Sign in success! Welcome back.');
        const role = response.data.role;
        navigate(role === 'admin' ? '/admin' : '/portal');
      } else {
        throw new Error('Server response invalid (Token missing)');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      if (err.response) {
        const status = err.response.status;
        if (status === 403) {
          errorMessage = err.response.data?.message || 'Akun Anda terkunci. Silakan coba beberapa saat lagi.';
        } else if (status === 429) {
          errorMessage = 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit sebelum mencoba kembali.';
        } else {
          errorMessage = err.response.data?.message || 'Email or password incorrect';
        }
      } else if (err.request) {
        errorMessage = 'Server is not responding. Please check your connection.';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileLoginPage />
      <div className="hidden lg:flex min-h-screen w-full bg-surface-container-lowest font-sans overflow-hidden animate-fade-in">
        <div className="flex w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 z-1"></div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg animate-slide-up">
            <div className="mb-14 flex flex-col items-center group">
              <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white px-10 py-7 shadow-modal transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01]">
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sky-100/80 to-transparent"></div>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl"></div>
                <img
                  src={logoUrl}
                  alt="Logo UKM Kemasan"
                  className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.45em] text-white/75">
                Official Identity
              </p>
              <h1 className="text-white text-5xl font-bold tracking-tight uppercase">UKM Kemasan</h1>
              <div className="mt-4 inline-flex items-center rounded-full border border-white/80 bg-white px-5 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-primary shadow-card"></div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight px-4 opacity-95">
                "Your Packaging Solution."
              </h2>
              <div className="h-1 w-16 bg-white/30 mx-auto rounded-full"></div>
              <p className="text-blue-50 font-medium text-lg italic tracking-wide">
                - UKM Kemasan -
              </p>
            </div>
          </div>

          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-black/10 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background relative overflow-hidden">
          <div className="absolute bottom-[-10%] right-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 translate-x-1/4 translate-y-1/4">
            <img
              src={logoUrl}
              alt=""
              aria-hidden="true"
              className="w-[520px] xl:w-[660px] max-w-none h-auto object-contain blur-[1px]"
            />
          </div>

          <div className="w-full max-w-[400px] z-10 px-4 md:px-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-surface-container-lowest rounded-3xl shadow-modal p-6 md:p-8 border border-outline-variant/20">
              <div className="text-center mb-6">
                <div className="mb-3 inline-flex items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 shadow-sm lg:hidden">
                  <img src={logoUrl} alt="Logo UKM Kemasan" className="h-10 w-auto object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-on-surface tracking-tight">Sign In</h3>
                <div className="mt-1 text-on-surface-variant font-medium text-xs">Welcome back to UKM Kemasan ERP</div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error-container rounded-xl border border-error/20 flex items-start gap-3 animate-fade-in" role="alert">
                  <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                  <p className="text-on-error-container text-xs font-semibold leading-relaxed">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs text-on-surface-variant ml-1 font-medium">
                    Email / Username
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    data-testid="login-email"
                    className="w-full text-on-surface p-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-xs text-on-surface-variant font-medium">Password</label>
                    <Link to="/forgot-password" className="text-[10px] font-semibold text-muted hover:text-primary transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      data-testid="login-password"
                      className="w-full text-on-surface p-3 pr-10 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-on-surface-variant transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="login-submit"
                    className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-card hover:shadow-card-hover active:scale-[0.98] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>SIGNING IN...</span>
                      </>
                    ) : (
                      "SIGN IN"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center space-y-4">
                <p className="text-sm font-medium text-on-surface-variant">
                  New on our platform?{' '}
                  <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">
                    Create Account
                  </Link>
                </p>

                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-outline-variant/30"></div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">OR</span>
                  <div className="flex-1 h-px bg-outline-variant/30"></div>
                </div>

                <button
                  onClick={() => navigate('/portal')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-3.5 text-sm font-semibold text-on-surface-variant transition-all duration-200 hover:border-primary/30 hover:text-primary cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Eye className="h-4 w-4" />
                  Masuk Sebagai Tamu (Guest)
                </button>
              </div>
            </div>

            <div className="mt-12 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 opacity-30">
                <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
                <div className="w-8 h-1 bg-surface-container-high rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
