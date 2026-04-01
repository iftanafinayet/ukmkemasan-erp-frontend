import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Mail, Lock, User, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.name || !formData.email || !formData.password) {
                throw new Error('Nama, email, dan password wajib diisi');
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Password dan konfirmasi password tidak cocok');
            }

            if (formData.password.length < 6) {
                throw new Error('Password minimal 6 karakter');
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

                toast.success('Registrasi berhasil! Selamat datang.');
                navigate('/portal');
            } else {
                throw new Error('Respons server tidak valid');
            }
        } catch (err) {
            let errorMessage = 'Registrasi gagal. Silakan coba lagi.';

            if (err.response) {
                errorMessage = err.response.data?.message || 'Registrasi gagal';
            } else if (err.request) {
                errorMessage = 'Server tidak merespons. Pastikan backend aktif.';
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
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl mb-4 shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                        <Coffee className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        ERP UKM Kemasan
                    </h1>
                    <p className="text-slate-500 font-medium">Daftar Akun Baru</p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Buat Akun Customer</h2>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text" name="name" required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama Lengkap / Nama Bisnis"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email" name="email" required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@bisnis.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password" name="password" required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 karakter"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Konfirmasi</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password" name="confirmPassword" required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Ulangi password"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">No. Telepon (Opsional)</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="tel" name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800"
                                />
                            </div>
                        </div>

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
                                "Daftar Sekarang"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Masuk di sini
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
