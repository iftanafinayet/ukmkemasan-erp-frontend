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
    <div className="min-h-screen flex w-full bg-white font-sans overflow-hidden animate-fade-in">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-8%] opacity-[0.045] select-none pointer-events-none grayscale saturate-0 -translate-x-1/4 translate-y-1/4">
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="w-[520px] xl:w-[660px] max-w-none h-auto object-contain blur-[1px]"
          />
        </div>

        <div className="w-full max-w-[480px] z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-[1.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-6 md:p-8 border border-slate-100/50 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="mb-3 inline-flex items-center justify-center rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-3 shadow-sm lg:hidden">
                <img src={logoUrl} alt="Logo UKM Kemasan" className="h-10 w-auto object-contain" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h3>
              <div className="mt-1 text-slate-400 font-medium text-xs">
                Start your UKM Kemasan ERP customer access
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5 group">
                <label className="block text-xs text-slate-600 ml-1 group-focus-within:text-primary transition-colors">
                  Full Name / Business Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name or business name"
                    data-testid="register-name"
                    className="w-full text-slate-800 p-3 pl-12 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="block text-xs text-slate-600 ml-1 group-focus-within:text-primary transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your business email"
                    data-testid="register-email"
                    className="w-full text-slate-800 p-3 pl-12 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 group">
                  <label className="block text-xs text-slate-600 ml-1 group-focus-within:text-primary transition-colors">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      data-testid="register-password"
                      className="w-full text-slate-800 p-2.5 pl-10 pr-10 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <label className="block text-xs text-slate-600 ml-1 group-focus-within:text-primary transition-colors">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      data-testid="register-confirm-password"
                      className="w-full text-slate-800 p-2.5 pl-10 pr-10 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="block text-xs text-slate-600 ml-1 group-focus-within:text-primary transition-colors">
                  Phone Number
                  <span className="ml-2 text-[10px] font-semibold text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    data-testid="register-phone"
                    className="w-full text-slate-800 p-2.5 pl-10 bg-slate-50 border-b-2 border-transparent rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium placeholder:text-slate-300 shadow-sm text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                    Saya menyetujui{' '}
                    <span className="text-primary font-semibold hover:underline">Syarat & Ketentuan</span>
                    {' '}dan{' '}
                    <span className="text-primary font-semibold hover:underline">Kebijakan Privasi</span>
                    {' '}yang berlaku.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !agree}
                  data-testid="register-submit"
                  className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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

            <div className="mt-10 text-center">
              <p className="text-center mt-8 text-slate-500 text-sm font-bold">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-[#4dbace] hover:text-[#3da0b5] transition-colors">
                  Sign In
                </Link>
              </p>

              <div className="relative flex items-center gap-4 py-6 lg:hidden">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">ATAU</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <button
                onClick={() => navigate('/portal')}
                className="w-full lg:hidden bg-slate-50 border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-[0.98] transition-all"
              >
                Masuk Sebagai Tamu
              </button>
            </div>
          </div>

          <div className="mt-12 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 opacity-30">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(77, 186, 206, 0.95), rgba(41, 148, 168, 0.98)),
              repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 40px)
            `,
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent opacity-50 z-1"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl animate-slide-up">
          <div className="mb-12 flex flex-col items-center group">
            <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white px-10 py-7 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.5)] transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-[1.01]">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sky-100/80 to-transparent"></div>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl"></div>
              <img
                src={logoUrl}
                alt="Logo UKM Kemasan"
                className="relative h-28 w-auto object-contain drop-shadow-[0_14px_24px_rgba(15,23,42,0.16)] transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.45em] text-white/75">
              Customer Access
            </p>
            <h1 className="text-white text-5xl font-black tracking-tight uppercase">UKM Kemasan</h1>
            <div className="mt-4 inline-flex items-center rounded-full border border-white/80 bg-white px-5 py-1.5 text-xs font-black uppercase tracking-[0.35em] text-primary shadow-lg shadow-slate-950/10">
              Create Account
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-white p-5 text-left shadow-[0_25px_50px_-30px_rgba(15,23,42,0.5)]">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Track Orders</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                Follow packaging requests, confirmations, and delivery updates in one flow.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-5 text-left shadow-[0_25px_50px_-30px_rgba(15,23,42,0.5)]">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Stay Connected</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
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
