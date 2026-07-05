import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';
import logoUrl from '../../assets/LogoUKM.svg';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error('Name, email, and password are required.');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Password and confirm password do not match.');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      const registerUrl = getAPIUrl(ENDPOINTS.REGISTER);
      const response = await axios.post(registerUrl, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'customer'
      });

      if (response.data && response.data.token) {
        storage.setToken(response.data.token);
        storage.setUser({
          _id: response.data._id,
          name: response.data.name,
          role: response.data.role
        });
        toast.success('Account created successfully. Welcome aboard.');
        navigate('/portal');
      } else {
        throw new Error('Server response invalid.');
      }
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response) {
        errorMessage = err.response.data?.message || 'Registration failed.';
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
    <div className="min-h-screen flex w-full bg-surface-container-lowest font-sans overflow-hidden animate-fade-in">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 -translate-x-1/4 translate-y-1/4">
          <img src={logoUrl} alt="" aria-hidden="true" className="w-[520px] xl:w-[660px] max-w-none h-auto object-contain blur-[1px]" />
        </div>

        <div className="w-full max-w-[440px] z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-modal p-5 md:p-8 border border-outline-variant/20">
            <div className="text-center mb-4">
              <div className="mb-2 inline-flex items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-2.5 shadow-sm lg:hidden">
                <img src={logoUrl} alt="Logo UKM Kemasan" className="h-9 w-auto object-contain" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">Create Account</h3>
              <div className="mt-1 text-on-surface-variant font-medium text-xs">
                Start your UKM Kemasan ERP customer access
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container rounded-xl border border-error/20 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                <p className="text-on-error-container text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs text-on-surface-variant ml-1 font-medium">Full Name / Business Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Your name or business name" data-testid="register-name"
                    className="w-full text-on-surface p-3 pl-12 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-on-surface-variant ml-1 font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="Enter your business email" data-testid="register-email"
                    className="w-full text-on-surface p-3 pl-12 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs text-on-surface-variant ml-1 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                      placeholder="Minimum 6 characters" data-testid="register-password"
                      className="w-full text-on-surface p-2.5 pl-10 pr-10 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted text-sm"
                      required
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-on-surface-variant transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-on-surface-variant ml-1 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Repeat your password" data-testid="register-confirm-password"
                      className="w-full text-on-surface p-2.5 pl-10 pr-10 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted text-sm"
                      required
                    />
                    <button
                      type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-on-surface-variant transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-on-surface-variant ml-1 font-medium">
                  Phone Number <span className="ml-2 text-[10px] font-semibold text-muted">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="Enter your phone number" data-testid="register-phone"
                    className="w-full text-on-surface p-2.5 pl-10 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-medium placeholder:text-muted text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <span className="text-xs text-on-surface-variant leading-relaxed">
                    Saya menyetujui{' '}
                    <span className="text-primary font-semibold hover:underline cursor-pointer">Syarat & Ketentuan</span>
                    {' '}dan{' '}
                    <span className="text-primary font-semibold hover:underline cursor-pointer">Kebijakan Privasi</span>
                    {' '}yang berlaku.
                  </span>
                </label>
              </div>

              <div className="pt-1">
                <button
                  type="submit" disabled={loading || !agree} data-testid="register-submit"
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-card hover:shadow-card-hover active:scale-[0.98] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>CREATING ACCOUNT...</span>
                    </>
                  ) : (
                    'CREATE ACCOUNT'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-on-surface-variant text-sm font-medium">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline transition-colors">
                  Sign In
                </Link>
              </p>

              <div className="relative flex items-center gap-3 py-4 lg:hidden">
                <div className="flex-1 h-px bg-outline-variant/30"></div>
                <span className="text-[9px] font-bold text-muted uppercase">ATAU</span>
                <div className="flex-1 h-px bg-outline-variant/30"></div>
              </div>

              <button
                onClick={() => navigate('/portal')}
                className="w-full lg:hidden bg-surface-container-low border border-outline-variant text-on-surface-variant py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Masuk Sebagai Tamu
              </button>
            </div>
          </div>

          <div className="mt-8 text-center space-y-2">
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
                src={logoUrl} alt="Logo UKM Kemasan"
                className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.45em] text-white/75">Customer Access</p>
            <h1 className="text-white text-5xl font-bold tracking-tight uppercase">UKM Kemasan</h1>
            <div className="mt-4 inline-flex items-center rounded-full border border-white/80 bg-white px-5 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-primary shadow-card">
              Create Account
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-white p-5 text-left shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">Track Orders</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-on-surface-variant">
                Follow packaging requests, confirmations, and delivery updates in one flow.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-5 text-left shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">Stay Connected</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-on-surface-variant">
                Keep your production communication and customer visibility in one ERP space.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight px-4 opacity-95">
              "Build one account, then keep every packaging request moving from one place."
            </h2>
            <div className="h-1 w-16 bg-white/30 mx-auto rounded-full"></div>
            <p className="text-blue-50 font-medium text-base tracking-wide">
              Customer registration portal for UKM Kemasan ERP
            </p>
          </div>
        </div>

        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-black/10 rounded-full blur-[120px] pointer-events-none"></div>
      </div>
    </div>
  );
}
