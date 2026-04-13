import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-black text-primary mb-2">UKM Kemasan</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Solusi kemasan premium untuk UKM yang ingin berkembang. Tingkatkan brand Anda dengan desain yang memukau.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-white">Produk</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>
              <a href="#" className="hover:text-primary transition-colors">Kemasan Pouch</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">Kemasan Box</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">Kemasan Botol</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">Custom Packaging</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">Katalog Lengkap</a>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-white">Perusahaan</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>
              <a href="#" className="hover:text-primary transition-colors">Tentang Kami</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">FAQ</a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">Hubungi Kami</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-white">Kontak</h4>
          <div className="space-y-4">
            <a href="mailto:info@ukmkemasan.com" className="flex items-start gap-3 text-slate-400 hover:text-primary transition-colors group">
              <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm">info@ukmkemasan.com</span>
            </a>
            <a href="tel:+6281234567890" className="flex items-start gap-3 text-slate-400 hover:text-primary transition-colors group">
              <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm">+62 812 3456 7890</span>
            </a>
            <div className="flex items-start gap-3 text-slate-400">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Sidoarjo, Jawa Timur, Indonesia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-xs text-center sm:text-left">
          © {currentYear} UKM Kemasan. Semua hak dilindungi.
        </p>
        <div className="flex gap-6 text-xs text-slate-400">
          <a href="#" className="hover:text-primary transition-colors">Privasi</a>
          <a href="#" className="hover:text-primary transition-colors">Syarat</a>
          <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center">
          <p className="text-sm font-semibold text-primary">
            💬 Butuh bantuan? Hubungi kami untuk konsultasi gratis tentang kebutuhan kemasan Anda.
          </p>
        </div>
      </div>
    </footer>
  );
}
