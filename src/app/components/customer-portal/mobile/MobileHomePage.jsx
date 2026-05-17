import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem } from '../../ui/carousel';

export default function MobileHomePage({
  stats,
  landingContent,
  popularProducts,
  onViewProduct,
  onNavigateToCatalog,
  onViewAllOrders,
  user,
  onNavigateToCreateOrder,
}) {
  const navigate = useNavigate();
  const isLoggedIn = !!storage.getToken();
  const articles = Array.isArray(landingContent?.articles) ? landingContent.articles : [];
  const portfolios = Array.isArray(landingContent?.portfolios) ? landingContent.portfolios : [];
  const activities = Array.isArray(landingContent?.activities) ? landingContent.activities : [];

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState(null);

  useEffect(() => {
    if (!carouselApi) return;

    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 4000);

    carouselApi.on('select', () => {
      setActiveGalleryIndex(carouselApi.selectedScrollSnap());
    });

    return () => {
      clearInterval(interval);
      carouselApi.off('select');
    };
  }, [carouselApi]);

  const handleAction = (callback) => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/portal');
      return;
    }
    callback();
  };

  return (
    <div className="lg:hidden bg-[#faf8ff]">
      <main className="space-y-4 pb-12">
        {/* Hero Section */}
        <section className="px-4 pt-4">
          <div className="grid grid-cols-1 gap-6 items-stretch">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-xl bg-primary p-8 text-on-primary shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)]">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <img
                  src={landingContent?.heroSectionConfig?.heroImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuB1ZrOr2wdSAxlwsuSmjsQe23TRXhopxwtXl5QI36DFoxs8DkPPk8ts3ubrTp18DphIh32AF8Ohlz_FlR1cXJC0K4cJWPwn6U4qrJYPGV2XylExnns99KoqOHVYUWBanZGsnNKrcYLklBv0oP2BkRy3g_4HLxE0q4U1k06X1V5MS7XpYAC0zLVyMV1gy3rovo51GFhWf79sSo9VTBnUQQw4lEu2n-Ar842FgQf1yaOgHxq9wK5X7IxobXpFZpmPiRbjdJu1dI-ZYWJO"}
                  alt="Packaging Design"
                  className="w-full h-full object-cover mix-blend-overlay"
                />
              </div>
              <div className="relative z-10 space-y-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-white border border-white/10">
                  {landingContent?.heroSectionConfig?.pillText || 'Solution for UKM'}
                </span>
                <h1 className="text-2xl font-extrabold tracking-tighter leading-tight font-headline">
                  {landingContent?.heroSectionConfig?.title || 'UKM Kemasan membantu brand tampil lebih siap jual...'}
                </h1>
                <p className="text-white/80 font-body leading-relaxed text-[12px]">
                  {landingContent?.heroSectionConfig?.subtitle || 'Tingkatkan nilai estetika dan keamanan produk Anda dengan kemasan premium yang dirancang khusus untuk pertumbuhan bisnis kecil dan menengah.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 py-2">
          <div className="grid grid-cols-4 gap-y-4">
            <div onClick={onNavigateToCatalog} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-[#4dbace]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4dbace] text-2xl">package_2</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-[#131b2e]">Stok Kemasan</span>
            </div>
            <div onClick={() => window.open('https://wa.me/6282326237919', '_blank')} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-[#4dbace]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4dbace] text-2xl">architecture</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-[#131b2e]">Kustom Desain</span>
            </div>
            <div onClick={() => handleAction(onViewAllOrders)} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-[#4dbace]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4dbace] text-2xl">local_shipping</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-[#131b2e]">Lacak Kirim</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a] text-2xl">support_agent</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-[#131b2e]">Bantuan</span>
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section className="bg-white py-6 border-y border-[#bbc9c7]/20">
          <div className="px-4 flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xs font-bold text-[#131b2e] font-headline">Pilihan Terbaik</h2>
              <p className="text-[10px] text-[#3c4947]">Produk kemasan paling laris bulan ini</p>
            </div>
            <button onClick={onNavigateToCatalog} className="text-[#4dbace] text-[10px] font-bold">Lihat Semua</button>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-3 px-4 pb-2">
            {popularProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => onViewProduct(product._id)}
                className="min-w-[140px] max-w-[140px] bg-white rounded-lg border border-[#bbc9c7]/30 overflow-hidden shadow-sm"
              >
                <img
                  className="w-full aspect-square object-cover"
                  src={product.images?.[0]?.url || "https://via.placeholder.com/150"}
                  alt={product.name}
                />
                <div className="p-2.5">
                  <p className="text-[11px] text-[#131b2e] line-clamp-2 min-h-[32px]">{product.name}</p>
                  <p className="text-[13px] font-bold text-[#131b2e] mt-1">{formatCurrency(product.priceB2B)}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="text-[9px] text-[#3c4947] font-medium">Varian: {product.variants?.length || 0} opsi</div>
                    <div className="text-[9px] text-[#3c4947]">Terjual {product.totalSold || 0}+</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio Carousel */}
        <section className="px-4 pt-2 pb-4">
          <h2 className="text-xs font-bold mb-3 font-headline uppercase tracking-wider text-[#3c4947]">Hasil Karya Terbaik</h2>
          <div className="relative overflow-hidden rounded-xl">
            <Carousel className="w-full" opts={{ loop: true, align: 'start' }}>
              <CarouselContent className="-ml-3">
                {portfolios.map((portfolio, idx) => (
                  <CarouselItem key={idx} className="pl-3 basis-[85%]">
                    <div className="relative rounded-lg overflow-hidden aspect-[16/9] shadow-sm">
                      <img
                        className="w-full h-full object-cover"
                        src={portfolio.imageUrl || "https://via.placeholder.com/300"}
                        alt={portfolio.clientName}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <h4 className="text-white font-bold text-xs">{portfolio.clientName}</h4>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

        {/* Articles */}
        <section className="px-4 pt-2 pb-4">
          <h2 className="text-xs font-bold mb-3 font-headline uppercase tracking-wider text-[#3c4947]">Artikel Pilihan</h2>
          <div className="flex flex-col gap-3">
            {articles.slice(0, 3).map((article, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate(`/portal/articles/${article._id || article.clientId}`)}
                className="flex gap-3 items-center cursor-pointer active:opacity-70 transition-opacity"
              >
                <img
                  className="w-16 h-16 rounded-lg object-cover"
                  src={article.imageUrl || "https://via.placeholder.com/100"}
                  alt={article.title}
                />
                <div className="flex-1">
                  <h4 className="font-bold text-[11px] text-[#131b2e] line-clamp-2">{article.title}</h4>
                  <p className="text-[9px] text-[#3c4947] mt-1">{article.category || 'Tips'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Aktivitas Terbaru (Gallery) Section */}
        <section className="px-4 pt-2 pb-4">
          <h2 className="text-xs font-bold mb-3 font-headline uppercase tracking-wider text-[#3c4947]">Aktivitas Terbaru</h2>
          <div className="relative w-full">
            <Carousel
              className="w-full"
              opts={{ loop: true }}
              setApi={setCarouselApi}
            >
              <CarouselContent className="-ml-0">
                {activities.length > 0 ? (
                  activities.map((activity, idx) => (
                    <CarouselItem key={idx} className="pl-0 basis-full">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#4dbace] shadow-sm">
                        <img
                          src={activity.imageUrl || "https://images.unsplash.com/photo-1542382103-60fce78ed46f"}
                          alt={activity.title || "UKM Kemasan"}
                          loading="lazy"
                          className="w-full h-full object-cover will-change-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                        <div className="absolute bottom-6 left-5 text-white space-y-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <span className="inline-block px-2.5 py-1 bg-[#4dbace]/20 backdrop-blur-md rounded-full text-[8px] font-bold uppercase tracking-widest text-[#4dbace] border border-[#4dbace]/20">
                            {activity.label || "Pameran"}
                          </span>
                          <h3 className="text-lg font-bold tracking-tight leading-tight font-headline">
                            {activity.title || "Mendukung Kemajuan UKM Indonesia"}
                          </h3>
                          <p className="text-white/80 text-[10px] leading-snug line-clamp-2">
                            {activity.summary || "Koleksi momen kolaborasi kami dengan mitra bisnis."}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem className="pl-0 basis-full">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#4dbace] flex flex-col items-center justify-center text-white/40 space-y-3 border border-[#bbc9c7]/20">
                      <span className="material-symbols-outlined text-5xl">gallery_thumbnail</span>
                      <p className="font-bold text-[9px] text-white/30 uppercase tracking-widest">Belum ada foto galeri</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>

              {activities.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
                  {activities.map((_, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-500 rounded-full h-1 ${i === activeGalleryIndex
                        ? 'bg-white w-4'
                        : 'bg-white/40 w-1'
                        }`}
                    />
                  ))}
                </div>
              )}
            </Carousel>
          </div>
        </section>

        {/* CTA Get in Touch - Enhanced Bright Version */}
        <section className="px-4 pt-4">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-xl shadow-primary/20">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
                <span className="material-symbols-outlined text-white text-3xl">chat</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-headline leading-tight">
                  Butuh Konsultasi Desain <br /> & Custom Kemasan?
                </h3>
                <p className="text-white/80 text-[11px] leading-relaxed max-w-[220px] mx-auto">
                  Hubungi Packaging Specialist kami untuk mendapatkan penawaran terbaik sesuai budget Anda.
                </p>
              </div>

              <a
                href="https://wa.me/6282326237919"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-white text-primary text-[12px] font-black rounded-2xl shadow-lg active:scale-[0.98] transition-all uppercase tracking-widest border border-white/10"
              >
                Konsultasi via WhatsApp
              </a>

              <p className="text-white/60 text-[9px] font-medium tracking-wide">
                Respon Cepat • Konsultasi Gratis • Tanpa Minimal Order*
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
