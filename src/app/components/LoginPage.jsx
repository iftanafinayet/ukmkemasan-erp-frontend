import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
// Import helper dari konfigurasi environment kamu
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Validasi Input Dasar
      if (!email || !password) {
        throw new Error('Email dan password wajib diisi');
      }

      // 2. Ambil URL API dari Config
      const loginUrl = getAPIUrl(ENDPOINTS.LOGIN);

      // 3. Request ke Backend MERN
      const response = await axios.post(loginUrl, {
        email,
        password
      });

      // 4. Handle Berhasil Login
      if (response.data && response.data.token) {
        // Simpan token dan data user ke localStorage lewat helper
        storage.setToken(response.data.token);

        // Backend mengembalikan { _id, name, role, token } (flat, bukan nested)
        storage.setUser({
          _id: response.data._id,
          name: response.data.name,
          role: response.data.role
        });

        toast.success('Login berhasil! Selamat datang kembali.');

        // Redirect berdasarkan role
        const role = response.data.role;
        navigate(role === 'admin' ? '/admin' : '/portal');
      } else {
        throw new Error('Respons server tidak valid (Token missing)');
      }
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = 'Login gagal. Silakan coba lagi.';

      if (err.response) {
        // Error dari server (misal: 401 Unauthorized)
        errorMessage = err.response.data?.message || 'Email atau password salah';
      } else if (err.request) {
        // Server tidak bisa dihubungi
        errorMessage = 'Server tidak merespons. Silakan periksa koneksi internet atau status server.';
      } else {
        // Error lainnya (misal: validasi input)
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Branding Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl mb-4 shadow-xl shadow-primary/20 transition-transform hover:scale-105">
            <Coffee className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight tracking-tight uppercase">
            ERP UKM Kemasan
          </h1>
          <p className="text-slate-500 font-medium">Monitoring Produksi Kemasan</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 transition-all">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Masuk ke Dashboard</h2>

          {/* Alert Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Bisnis</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="[EMAIL_ADDRESS]"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-8 uppercase font-bold tracking-[0.2em]">
          &copy; 2026 ERP UKM Kemasan &bull; Powered by CCIT FTUI Devs
        </p>
      </div>
    </div>
  );
}