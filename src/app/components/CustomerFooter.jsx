import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const productLinks = [
  { label: 'Kemasan Pouch', to: '/portal?menu=catalog' },
  { label: 'Custom Packaging', to: '/portal/orders/create' },
  { label: 'Katalog Lengkap', to: '/portal?menu=catalog' },
];

const companyLinks = [
  { label: 'Tentang Kami', to: '/portal' },
  { label: 'FAQ', to: '/portal' },
  { label: 'Hubungi Kami', href: 'mailto:info@ukmkemasan.com' },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
];

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@ukmkemasan.com',
    href: 'mailto:info@ukmkemasan.com',
  },
  {
    icon: Phone,
    label: 'Telepon',
    value: '+62 812 3456 7890',
    href: 'tel:+6281234567890',
  },
  {
    icon: MapPin,
    label: 'Lokasi',
    value: 'Sidoarjo, Jawa Timur, Indonesia',
    href: null,
  },
];

function FooterLink({ children, to, href }) {
  const className =
    'group flex w-full items-center justify-between gap-3 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary';

  const content = (
    <>
      <span>{children}</span>
      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
    >
      {content}
    </a>
  );
}

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-outline-variant/15 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-[0_20px_60px_-40px_rgba(0,106,98,0.35)]">
          <div className="border-b border-outline-variant/10 bg-gradient-to-r from-primary/[0.08] via-transparent to-primary/[0.03] px-6 py-8 md:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center rounded-full border border-primary/10 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                  Packaging Partner
                </span>
                <div className="space-y-3">
                  <Link to="/portal" className="inline-block">
                    <h3 className="font-headline text-3xl font-black tracking-tight text-on-surface transition-colors hover:text-primary md:text-4xl">
                      UKM Kemasan
                    </h3>
                  </Link>
                  <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
                    Solusi kemasan yang rapi, cepat, dan siap membantu brand UKM tampil lebih kuat di rak maupun marketplace.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="rounded-[1.5rem] border border-outline-variant/10 bg-surface/90 px-4 py-4 backdrop-blur-sm transition-colors hover:border-primary/20 hover:bg-primary/5">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-on-surface/45">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-snug text-on-surface">
                        {item.value}
                      </p>
                    </div>
                  );

                  if (!item.href) {
                    return <div key={item.label}>{content}</div>;
                  }

                  return (
                    <a key={item.label} href={item.href} className="block">
                      {content}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-12 px-6 py-12 md:grid-cols-[1.2fr_0.9fr_0.9fr] md:px-10">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-on-surface/40">
                  Tentang Layanan
                </p>
                <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant">
                  Solusi pembuatan kemasan praktis dan berkualitas untuk membantu produk lokal tampil lebih profesional dan siap bersaing.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      aria-label={item.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low text-on-surface-variant transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline text-sm font-black uppercase tracking-[0.2em] text-on-surface">
                Produk
              </h4>
              <div className="space-y-3">
                {productLinks.map((link) => (
                  <FooterLink key={link.label} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline text-sm font-black uppercase tracking-[0.2em] text-on-surface">
                Perusahaan
              </h4>
              <div className="space-y-3">
                {companyLinks.map((link) => (
                  <FooterLink key={link.label} to={link.to} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-outline-variant/10 px-6 py-5 text-sm md:flex-row md:items-center md:justify-between md:px-10">
            <p className="text-on-surface-variant">
              © {currentYear} UKM Kemasan. Semua hak dilindungi.
            </p>

            <div className="flex flex-wrap items-center gap-5 text-on-surface-variant">
              <Link to="/portal" className="transition-colors hover:text-primary">Privasi</Link>
              <Link to="/portal" className="transition-colors hover:text-primary">Syarat</Link>
              <Link to="/portal" className="transition-colors hover:text-primary">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
