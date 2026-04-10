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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2"><ShoppingCart className="h-5 w-5 text-blue-500" /></div>
            <p className="text-[10px] font-black uppercase text-blue-500">Total Pesanan</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
        </div>
        <div className="rounded-3xl border border-slate-100 border-l-4 border-l-amber-400 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2"><Clock className="h-5 w-5 text-amber-500" /></div>
            <p className="text-[10px] font-black uppercase text-amber-500">Dalam Produksi</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{stats.production}</h3>
        </div>
        <div className="rounded-3xl border border-slate-100 border-l-4 border-l-primary bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-primary/5 p-2"><Package className="h-5 w-5 text-primary" /></div>
            <p className="text-[10px] font-black uppercase text-primary">Selesai</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{stats.completed}</h3>
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)]">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Artikel & Insight</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Informasi menarik dan update artikel terbaru dari UKM Kemasan.</h3>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 sm:flex">
              <Newspaper className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {articles.length > 0 ? articles.map((article, index) => (
              <article
                key={article._id || article.clientId || article.title}
                className={`rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${index === 0 ? 'border-primary/20 bg-[linear-gradient(180deg,_#f4fbfc_0%,_#ffffff_100%)]' : 'border-slate-100 bg-slate-50/60'}`}
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
                <h4 className="mt-4 text-lg font-black leading-snug text-slate-900">
                  {article.title}
                </h4>
                {article.excerpt && (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {article.excerpt}
                  </p>
                )}
                {index === 0 && (
                  <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                    Highlight Minggu Ini
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </article>
            )) : <EmptyState text="Belum ada artikel yang dipublikasikan." />}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Galeri Kegiatan</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Update aktivitas UKM Kemasan seperti pameran, workshop, dan kunjungan produksi.</h3>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 sm:flex">
              <Camera className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {activities.length > 0 ? activities.map((activity) => (
              <article key={activity._id || activity.clientId || activity.title} className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50">
                {activity.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    <img
                      src={activity.imageUrl}
                      alt={activity.imageAlt || activity.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                          {activity.label || 'Kegiatan'}
                        </span>
                        <span className="text-[11px] font-bold text-white/75">{activity.date}</span>
                      </div>
                      <h4 className="mt-3 max-w-xs text-xl font-black leading-snug">
                        {activity.title}
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div className={`relative min-h-52 bg-gradient-to-br ${activity.accent || 'from-slate-900 via-slate-800 to-cyan-900'} p-5 text-white`}>
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/15 bg-white/10" />
                    <div className="absolute bottom-4 right-4 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                          {activity.label || 'Kegiatan'}
                        </span>
                        <span className="text-[11px] font-bold text-white/75">{activity.date}</span>
                      </div>
                      <div className="mt-12">
                        <h4 className="max-w-xs text-xl font-black leading-snug">
                          {activity.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3 p-5">
                  {activity.location && (
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
                      <MapPin className="h-4 w-4 text-primary" />
                      {activity.location}
                    </div>
                  )}
                  {activity.summary && (
                    <p className="text-sm leading-6 text-slate-500">
                      {activity.summary}
                    </p>
                  )}
                </div>
              </article>
            )) : <EmptyState text="Belum ada kegiatan yang ditampilkan." />}
          </div>
        </section>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 font-black text-slate-800">
            <Clock className="h-5 w-5 text-primary" /> Pesanan Terbaru
          </h3>
          <button type="button" onClick={onViewAllOrders} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            Lihat Semua <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {orders.length > 0 ? orders.slice(0, 5).map((order) => (
            <div
              key={order._id}
              onClick={() => onViewOrder(order._id)}
              className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary/20 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-black text-slate-800">#{order.orderNumber || order._id.slice(-6)}</p>
                <p className="text-[10px] font-bold uppercase text-slate-400">{order.product?.name || 'Produk'} · {order.details?.quantity} pcs</p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className={`rounded-full border px-3 py-1 text-[10px] font-black ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
                <Eye size={16} className="text-slate-300 transition-colors group-hover:text-primary" />
              </div>
            </div>
          )) : <EmptyState text="Belum ada pesanan. Mulai pesan sekarang!" />}
        </div>
      </div>
    </div>
  );
}
