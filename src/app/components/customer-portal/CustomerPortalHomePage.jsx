import {
  ArrowRight,
  BadgeCheck,
  Box,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock,
  Eye,
  ImagePlus,
  Layers,
  MapPin,
  Newspaper,
  Package,
  Plus,
  Ruler,
  ShoppingCart,
  Sparkles,
  Tag,
} from 'lucide-react';
import { EmptyState } from '../customer-dashboard/shared';

export default function CustomerPortalHomePage({
  getStatusColor,
  getStatusLabel,
  landingContent,
  onNavigateToCatalog,
  onNavigateToCreateOrder,
  onViewAllOrders,
  onViewOrder,
  orders,
  stats,
}) {
  const articles = Array.isArray(landingContent?.articles) ? landingContent.articles : [];
  const activities = Array.isArray(landingContent?.activities) ? landingContent.activities : [];
  const articleConfig = landingContent?.articleSectionConfig || { pillText: 'Informasi Menarik', title: 'Artikel Pilihan Untuk Meningkatkan Produk Anda', subtitle: 'Selalu update dengan tren dan teknologi terbaru di dunia kemasan. Baca artikel-artikel pilihan kami untuk menemukan solusi kemasan yang tepat bagi bisnis Anda.' };
  const galleryConfig = landingContent?.gallerySectionConfig || { pillText: 'Galeri', title: '', subtitle: '' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_35%),linear-gradient(135deg,_#4dbace_0%,_#256f80_50%,_#133c46_100%)] p-6 text-white shadow-2xl shadow-cyan-900/20 sm:p-8 lg:p-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent_62%)] lg:block" />
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full border border-white/15 bg-white/5 blur-2xl" />
        <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full border border-white/10 bg-white/10 blur-2xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Official Packaging Partner
            </span>
            <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.8rem]">
              UKM Kemasan membantu brand tampil lebih siap jual lewat solusi kemasan yang rapi, fleksibel, dan mudah dipesan.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Di dashboard ini Anda bisa mengenal layanan UKM Kemasan, melihat progres pesanan, lalu langsung lanjut ke proses purchase tanpa berpindah alur.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                'Standing pouch & roll stock',
                'MOQ fleksibel kelipatan 100 pcs',
                'Alur order sampai pengiriman terpantau',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white/85 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onNavigateToCreateOrder}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-primary shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              >
                <Plus size={18} />
                Purchase Sekarang
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-95"
              >
                Lihat Katalog
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative rounded-[1.75rem] border border-white/15 bg-slate-950/20 p-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/60">Profile Snapshot</p>
                <h3 className="mt-2 text-2xl font-black">UKM Kemasan</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100">
                <BadgeCheck className="h-4 w-4" />
                Active Service
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  icon: Layers,
                  title: 'Solusi kemasan terkurasi',
                  description: 'Pilihan produk disusun untuk kebutuhan UKM, reseller, sampai brand yang sedang scale up.',
                },
                {
                  icon: Ruler,
                  title: 'Varian ukuran dan material',
                  description: 'Pilih format kemasan yang sesuai kebutuhan produk, kuantitas, dan positioning brand Anda.',
                },
                {
                  icon: Tag,
                  title: 'Purchase lebih cepat',
                  description: 'Masuk ke katalog atau langsung ke form order untuk memulai permintaan pembelian.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/70">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Pesanan Anda</p>
                <p className="mt-2 text-3xl font-black">{stats.total}</p>
                <p className="mt-1 text-xs text-white/60">Total order yang sudah tercatat</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Produksi Aktif</p>
                <p className="mt-2 text-3xl font-black">{stats.production}</p>
                <p className="mt-1 text-xs text-white/60">Pesanan yang sedang berjalan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Tentang UKM Kemasan</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Partner kemasan untuk produk yang ingin tampil lebih profesional.</h3>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
              <Box className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            UKM Kemasan memudahkan proses pemesanan kemasan dari eksplorasi katalog, input detail order, sampai monitoring status produksi. Section ini sengaja ditempatkan di homepage agar customer baru langsung paham layanan yang tersedia dan customer lama bisa langsung lanjut purchase.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNavigateToCreateOrder}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-slate-800 active:scale-95"
            >
              Direct To Purchase
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary active:scale-95"
            >
              Jelajahi Produk
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfc_100%)] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Kenapa di dashboard</p>
          <div className="mt-5 space-y-4">
            {[
              'Customer langsung memahami positioning UKM Kemasan saat pertama masuk.',
              'CTA purchase selalu terlihat tanpa harus membuka menu lain lebih dulu.',
              'Dashboard tetap berfungsi sebagai ringkasan order, bukan sekadar halaman statistik.',
            ].map((point, index) => (
              <div key={point} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                  0{index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-600">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLE SECTION - NEW CENTERED LAYOUT */}
      <section className="rounded-3xl bg-slate-50/50 py-12 px-6 sm:px-10 text-center border border-slate-100">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center rounded-full bg-[#45bbd4] px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-md">
            {articleConfig.pillText}
          </span>
        </div>
        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 max-w-3xl mx-auto leading-tight">
          {articleConfig.title}
        </h3>
        {articleConfig.subtitle && (
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 max-w-4xl mx-auto">
            {articleConfig.subtitle}
          </p>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
          {articles.length > 0 ? articles.map((article, index) => (
            <article
              key={article._id || article.clientId || article.title}
              className={`rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col h-full bg-white border-slate-100`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                  {article.category || 'Artikel'}
                </span>
                {article.date && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {article.date}
                  </span>
                )}
              </div>
              <h4 className="mt-5 text-xl font-black leading-snug text-slate-900 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              {article.excerpt && (
                <p className="mt-3 text-sm leading-6 text-slate-500 line-clamp-3">
                  {article.excerpt}
                </p>
              )}
              <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                Baca Selengkapnya
                <ArrowRight className="h-4 w-4" />
              </div>
            </article>
          )) : <EmptyState text="Belum ada artikel yang dipublikasikan." />}
        </div>
      </section>

      {/* GALLERY SECTION - NEW CENTERED SLIDER LAYOUT */}
      <section className="rounded-3xl bg-white xl:px-10 py-12 text-center border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none w-96 h-96">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-slate-900 fill-current">
            <path d="M45.7,-76.4C58,-68.2,65.8,-52.1,70.5,-36.8C75.2,-21.5,76.8,-6.8,75.1,7C73.3,20.8,68.2,33.7,60.8,45.4C53.4,57.1,43.7,67.6,31.5,72.4C19.3,77.3,4.6,76.5,-9.7,73.5C-24,70.5,-37.9,65.3,-50.2,56.7C-62.5,48.1,-73.2,36.1,-78.9,21.9C-84.6,7.7,-85.4,-8.7,-79.8,-22.6C-74.1,-36.5,-62.1,-47.9,-48.9,-55.8C-35.8,-63.7,-21.6,-68.1,-4.3,-62.1C13.1,-56,33.4,-84.6,45.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center rounded-full bg-[#45bbd4] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md">
              {galleryConfig.pillText}
            </span>
          </div>
          {galleryConfig.title && (
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 max-w-3xl mx-auto leading-tight">
              {galleryConfig.title}
            </h3>
          )}
          {galleryConfig.subtitle && (
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 max-w-3xl mx-auto">
              {galleryConfig.subtitle}
            </p>
          )}

          <div className="mt-10 overflow-hidden relative group">
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-4 sm:px-8 hide-scrollbar text-left scroll-smooth">
              {activities.length > 0 ? activities.map((activity) => (
                <article key={activity._id || activity.clientId || activity.title} className="snap-center sm:snap-start shrink-0 w-[85vw] sm:w-[450px] lg:w-[600px] overflow-hidden rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 bg-white group/card relative">
                  {activity.imageUrl ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                      <img
                        src={activity.imageUrl}
                        alt={activity.imageAlt || activity.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                            {activity.label || 'Kegiatan'}
                          </span>
                          <span className="text-xs font-bold text-white/80">{activity.date}</span>
                        </div>
                        <h4 className="text-2xl font-black text-white leading-snug drop-shadow-sm">
                          {activity.title}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <div className={`relative aspect-[16/9] w-full bg-gradient-to-br ${activity.accent || 'from-[#45bbd4] via-cyan-600 to-cyan-900'} p-8 text-white flex flex-col justify-between overflow-hidden`}>
                      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/20 bg-white/10" />
                      <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full border border-white/10 bg-white/5" />

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md shadow-sm">
                          {activity.label || 'Kegiatan'}
                        </span>
                        <span className="text-xs font-bold text-white/90 bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">{activity.date}</span>
                      </div>

                      <div className="relative z-10 mt-auto">
                        <h4 className="text-3xl font-black leading-tight drop-shadow-md pb-2">
                          {activity.title}
                        </h4>
                      </div>
                    </div>
                  )}
                  {(activity.location || activity.summary) && (
                    <div className="p-6 bg-white space-y-3">
                      {activity.location && (
                        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#45bbd4]">
                          <MapPin className="h-4 w-4" />
                          {activity.location}
                        </div>
                      )}
                      {activity.summary && (
                        <p className="text-sm leading-relaxed text-slate-600">
                          {activity.summary}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              )) : (
                <div className="w-full shrink-0 snap-center">
                  <EmptyState text="Belum ada kegiatan yang ditampilkan." />
                </div>
              )}
            </div>
            {activities.length > 1 && (
              <>
                <div className="absolute top-[40%] left-0 pl-2 sm:pl-4 hidden md:block">
                  <button className="bg-white/90 text-[#45bbd4] border border-slate-100 p-3 rounded-full shadow-lg backdrop-blur hover:bg-[#45bbd4] hover:text-white transition-colors">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                </div>
                <div className="absolute top-[40%] right-0 pr-2 sm:pr-4 hidden md:block">
                  <button className="bg-white/90 text-[#45bbd4] border border-slate-100 p-3 rounded-full shadow-lg backdrop-blur hover:bg-[#45bbd4] hover:text-white transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
