import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem } from '../../ui/Carousel';
import useScrollToTop from '../../../hooks/useScrollToTop';

export default function MobileHomePage({
  stats,
  landingContent,
  popularProducts,
  onViewProduct,
  onNavigateToCatalog,
  onViewAllOrders,
  user,
  onNavigateToCreateOrder,
  onNavigateToInquiries,
}) {
  useScrollToTop();
  const navigate = useNavigate();
  const isLoggedIn = !!storage.getToken();
  const articles = Array.isArray(landingContent?.articles) ? landingContent.articles : [];
  const portfolios = Array.isArray(landingContent?.portfolios) ? landingContent.portfolios : [];
  const activities = Array.isArray(landingContent?.activities) ? landingContent.activities : [];

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState(null);
  const [bannerApi, setBannerApi] = useState(null);

  useEffect(() => {
    if (!bannerApi) return;

    const syncBannerIndex = () => {
      setActiveBannerIndex(bannerApi.selectedScrollSnap());
    };

    syncBannerIndex();
    bannerApi.on('select', syncBannerIndex);

    const interval = setInterval(() => {
      bannerApi.scrollNext();
    }, 5000);

    return () => {
      bannerApi.off('select', syncBannerIndex);
      clearInterval(interval);
    };
  }, [bannerApi]);

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

  const banners = Array.isArray(landingContent?.banners)
    ? landingContent.banners
    : [
      { image: '/BANNER WEB/Mobile1.avif', alt: 'Banner 1' },
      { image: '/BANNER WEB/Mobile2.avif', alt: 'Banner 2' },
    ];

  return (
    <div className="lg:hidden bg-background">
      <main className="space-y-4 pb-12">
        {/* 1. Top Bar & Search (Assume handled by parent/wrapper) */}

        {/* 2. Main Banner Promo */}
        <section className="px-4 pt-4">
          <div className="relative w-full overflow-hidden rounded-2xl shadow-card-hover">
            <Carousel
              className="w-full"
              opts={{
                loop: true,
                align: "start",
              }}
              setApi={setBannerApi}
            >
              <CarouselContent className="ml-0">
                {banners.map((banner, idx) => (
                  <CarouselItem key={idx} className="pl-0 basis-full">
                    <div className="relative w-full overflow-hidden rounded-2xl">
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        className="w-full h-auto block"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => bannerApi?.scrollTo(i)}
                    className={`transition-all duration-200 rounded-full h-1.5 focus-visible:ring-2 focus-visible:ring-white ${activeBannerIndex === i ? 'w-6 bg-surface-container-lowest shadow-card-hover' : 'w-1.5 bg-surface-container-lowest/40 hover:bg-surface-container-lowest/60'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </Carousel>
          </div>
        </section>

        {/* 3. Quick Navigation / Menu Kategori */}
        <section className="px-4 py-2">
          <div className="grid grid-cols-4 gap-y-4">
            <div onClick={onNavigateToCatalog} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">package_2</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-on-surface">Stok Kemasan</span>
            </div>
            <a href="https://wa.me/6281226733221" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">architecture</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-on-surface">Kustom Desain</span>
            </a>
            <div onClick={() => handleAction(onViewAllOrders)} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-on-surface">Pesanan Saya</span>
            </div>
            <a
              href="https://wa.me/6281226733221?text=Halo%20UKM%20Kemasan%2C%20saya%20butuh%20bantuan%20terkait%20produk%2Fpesanan.%20Bisa%20dibantu%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <div className="w-11 h-11 bg-error-container rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-2xl">support_agent</span>
              </div>
              <span className="text-[10px] text-center font-medium leading-tight text-on-surface">Bantuan</span>
            </a>
          </div>
        </section>

        {/* 4. Pilihan Terbaik / Produk Terlaris */}
        <section className="bg-surface-container-lowest py-6 border-y border-outline-variant/20">
          <div className="px-4 flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xs font-bold mb-1 font-headline uppercase tracking-wider text-on-surface-variant">Pilihan Terbaik</h2>
              <p className="text-[10px] text-on-surface-variant">Produk kemasan paling laris bulan ini</p>
            </div>
            <button onClick={onNavigateToCatalog} className="text-primary text-[10px] font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Lihat Semua</button>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-3 px-4 pb-2">
            {popularProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => onViewProduct(product._id)}
                className="group flex flex-col min-w-[150px] max-w-[150px] bg-surface-container-lowest rounded-[1rem] overflow-hidden shadow-card hover:shadow-md transition-all duration-200 cursor-pointer border border-outline-variant/40"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-200 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant opacity-40">
                      <span className="material-symbols-outlined text-xl mb-1">image</span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 flex flex-col flex-grow">
                  <span className="text-[8px] font-bold text-primary uppercase tracking-widest block mb-0.5 font-label">{product.category}</span>
                  <h3 className="text-[12px] font-bold text-on-surface tracking-tight font-headline line-clamp-1 leading-tight mb-1.5">{product.name}</h3>

                  <div className="space-y-1 mb-2.5 flex-grow">
                    <div className="text-[14px] font-black text-primary flex items-baseline gap-0.5">
                      {product.priceB2B > 0 ? (
                        <>
                          {formatCurrency(product.priceB2B)} <span className="text-[8px] font-bold text-on-surface-variant/70 uppercase tracking-tighter">/ pcs</span>
                        </>
                      ) : (
                        <span className="text-[11px]">Hubungi Admin</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <div className="px-1.5 py-0.5 bg-surface-container-high rounded-md text-[8px] font-bold text-on-surface/60">
                        {product.variants?.length || 0} Opsi
                      </div>
                      <div className="px-1.5 py-0.5 bg-surface-container-high rounded-md text-[8px] font-bold text-on-surface/60">
                        Terjual {product.totalSold || 0}+
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Aktivitas Terbaru (Naikkan Posisi) */}
        <section className="px-4 pt-2 pb-4">
          <h2 className="text-xs font-bold mb-3 font-headline uppercase tracking-wider text-on-surface-variant">Aktivitas Terbaru</h2>
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
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-primary shadow-card">
                        <img
                          src={activity.imageUrl || "https://images.unsplash.com/photo-1542382103-60fce78ed46f"}
                          alt={activity.title || "UKM Kemasan"}
                          loading="lazy"
                          className="w-full h-full object-cover will-change-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                        <div className="absolute bottom-6 left-5 text-white space-y-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <span className="inline-block px-2.5 py-1 bg-primary/20 backdrop-blur-md rounded-full text-[8px] font-bold uppercase tracking-widest text-primary border border-primary/20">
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
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-primary flex flex-col items-center justify-center text-white/40 space-y-3 border border-outline-variant/20">
                      <span className="material-symbols-outlined text-5xl">gallery_thumbnail</span>
                      <p className="font-bold text-[9px] text-white/60 uppercase tracking-widest">Belum ada foto galeri</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>

              {activities.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
                  {activities.map((_, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-200 rounded-full h-1 ${i === activeGalleryIndex
                        ? 'bg-surface-container-lowest w-4'
                        : 'bg-surface-container-lowest/40 w-1'
                        }`}
                    />
                  ))}
                </div>
              )}
            </Carousel>
          </div>
        </section>

        {/* 6. Hasil Karya Terbaik (Portofolio) */}
        <section className="px-4 pt-2 pb-4">
          <h2 className="text-xs font-bold mb-3 font-headline uppercase tracking-wider text-on-surface-variant">Hasil Karya Terbaik</h2>
          <div className="relative overflow-hidden rounded-xl">
            <Carousel className="w-full" opts={{ loop: true, align: 'start' }}>
              <CarouselContent className="-ml-3">
                {portfolios.map((portfolio, idx) => (
                  <CarouselItem key={idx} className="pl-3 basis-[85%]">
                    <div className="relative rounded-lg overflow-hidden aspect-[16/9] shadow-card">
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

        {/* 7. Artikel Pilihan */}
        <section className="px-4 pt-2 pb-4">
          <h2 className="text-xs font-bold mb-3 font-headline uppercase tracking-wider text-on-surface-variant">Artikel Pilihan</h2>
          <div className="flex flex-col gap-3">
            {articles.slice(0, 3).map((article, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/portal/articles/${article._id || article.clientId}`)}
                className="flex gap-3 items-center cursor-pointer active:opacity-70 transition-all duration-200"
              >
                <img
                  className="w-16 h-16 rounded-lg object-cover"
                  src={article.imageUrl || "https://via.placeholder.com/100"}
                  alt={article.title}
                />
                <div className="flex-1">
                  <h4 className="font-bold text-[11px] text-on-surface line-clamp-2">{article.title}</h4>
                  <p className="text-[9px] text-on-surface-variant mt-1">{article.category || 'Tips'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. CTA Get in Touch - Banner CTA Konsultasi Whatsapp */}
        <section className="px-4 pt-4">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-xl shadow-primary/20">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-surface-container-lowest/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-surface-container-lowest/10 rounded-full blur-2xl"></div>

            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-surface-container-lowest/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
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

              <button
                onClick={onNavigateToInquiries}
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-surface-container-lowest text-primary text-[12px] font-black rounded-2xl shadow-card-hover active:scale-[0.98] transition-all duration-200 uppercase tracking-widest border border-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                Hubungi Admin
              </button>

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
