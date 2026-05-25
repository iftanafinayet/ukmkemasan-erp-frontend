import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../config/environment';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

import { formatCurrency } from '../../utils/formatters';

export default function CustomerPortalHomePage({
  stats,
  landingContent,
  popularProducts = [],
  onViewProduct,
  onNavigateToCatalog,
  onNavigateToCreateOrder
}) {
  const navigate = useNavigate();
  const user = storage.getUser() || { name: 'Customer' };
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);
  const [bannerApi, setBannerApi] = useState(null);
  const [portfolioApi, setPortfolioApi] = useState(null);
  const [galleryApi, setGalleryApi] = useState(null);

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
    if (!portfolioApi) return;

    const syncPortfolioIndex = () => {
      setActivePortfolioIndex(portfolioApi.selectedScrollSnap());
    };

    syncPortfolioIndex();
    portfolioApi.on('select', syncPortfolioIndex);

    const interval = setInterval(() => {
      portfolioApi.scrollNext();
    }, 4000);

    return () => {
      portfolioApi.off('select', syncPortfolioIndex);
      clearInterval(interval);
    };
  }, [portfolioApi]);

  useEffect(() => {
    if (!galleryApi) return;

    const syncGalleryIndex = () => {
      setActiveGalleryIndex(galleryApi.selectedScrollSnap());
    };

    syncGalleryIndex();
    galleryApi.on('select', syncGalleryIndex);

    const interval = setInterval(() => {
      galleryApi.scrollNext();
    }, 5000);

    return () => {
      galleryApi.off('select', syncGalleryIndex);
      clearInterval(interval);
    };
  }, [galleryApi]);

  const articles = Array.isArray(landingContent?.articles) ? landingContent.articles : [];
  const activities = Array.isArray(landingContent?.activities) ? landingContent.activities : [];
  const portfolios = Array.isArray(landingContent?.portfolios) ? landingContent.portfolios : [];

  const banners = Array.isArray(landingContent?.banners)
    ? landingContent.banners
    : [
      { image: '/BANNER WEB/HeroBanner1.avif', alt: 'Banner 1' },
      { image: '/BANNER WEB/HeroBanner2.avif', alt: 'Banner 2' },
    ];

  return (
    <div className="relative space-y-0 animate-in fade-in duration-500">
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="absolute right-full mr-4 bg-white text-on-surface text-xs font-bold px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
          Butuh Bantuan? Chat Admin
        </span>
      </a>

      {/* Hero Banner Carousel */}
      <section className="relative w-full h-[35vh] md:h-[50vh] overflow-hidden rounded-3xl">
        <Carousel
          className="w-full h-full"
          opts={{
            loop: true,
            align: "start",
          }}
          setApi={setBannerApi}
        >
          <CarouselContent className="h-full ml-0">
            {/* Carousel Item */}
            {banners.map((banner, idx) => (
              <CarouselItem key={idx} className="pl-0 basis-full h-full">
                <div className="relative w-full h-full overflow-hidden rounded-3xl">
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => bannerApi?.scrollTo(i)}
                className={`transition-all duration-500 rounded-full h-2.5 ${activeBannerIndex === i ? 'h-2.5 w-12 bg-primary shadow-lg shadow-primary/30' : 'h-2 w-2.5 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </section>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0 -mt-2 pt-4">
        <div className="bg-surface-container-lowest/95 backdrop-blur-sm p-6 rounded-xl border border-outline-variant/15 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center text-on-secondary-fixed">
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <h3 className="font-bold text-lg">Stok Kemasan</h3>
          <p className="text-on-secondary-container text-sm">Pantau ketersediaan berbagai jenis kemasan siap kirim.</p>
        </div>
        <div className="bg-surface-container-lowest/95 backdrop-blur-sm p-6 rounded-xl border border-outline-variant/15 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center text-on-primary-fixed-variant">
            <span className="material-symbols-outlined">brush</span>
          </div>
          <h3 className="font-bold text-lg">Kustom Desain</h3>
          <p className="text-on-secondary-container text-sm">Konsultasikan kebutuhan branding unik untuk produk Anda.</p>
        </div>
        <div className="bg-surface-container-lowest/95 backdrop-blur-sm p-6 rounded-xl border border-outline-variant/15 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center text-on-tertiary-fixed-variant">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <h3 className="font-bold text-lg">Lacak Pengiriman</h3>
          <p className="text-on-secondary-container text-sm">Informasi real-time perjalanan pesanan sampai tujuan.</p>
        </div>
        <div className="bg-surface-container-lowest/95 backdrop-blur-sm p-6 rounded-xl border border-outline-variant/15 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <h3 className="font-bold text-lg">Bantuan 24/7</h3>
          <p className="text-on-secondary-container text-sm">Tim kami siap membantu kendala operasional bisnis Anda.</p>
        </div>
      </div>

      {/* Katalog Populer Section */}
      <section className="space-y-8 pt-12">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest font-label">Top Sellers</span>
            <h2 className="text-4xl font-extrabold font-headline mt-2">Katalog Populer</h2>
          </div>
          <button onClick={onNavigateToCatalog} className="text-teal-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer text-sm">
            Semua Katalog <span className="material-symbols-outlined text-xs">open_in_new</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
          {popularProducts.length > 0 ? popularProducts.map((product, index) => (
            <div key={product._id} onClick={() => onViewProduct(product._id)} className="group flex flex-col bg-surface-container-lowest/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)] hover:translate-y-[-4px] transition-all duration-500 cursor-pointer border border-outline-variant/10">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-container/90">
                {product.images?.[0] ? (
                  <img
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={product.images[0].url}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-secondary-container opacity-50">
                    <span className="material-symbols-outlined !text-3xl mb-1">image</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                  </div>
                )}
                {index === 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-primary/90 backdrop-blur-md text-on-primary text-[9px] font-bold uppercase tracking-widest rounded-full">Hot</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-0.5 font-label">{product.category}</span>
                    <h3 className="text-xl font-black text-on-surface tracking-tight font-headline line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-primary block leading-none">
                      {formatCurrency(product.priceB2B)}
                    </span>
                    <span className="text-[9px] font-bold text-on-surface/40 uppercase">/ pcs</span>
                  </div>
                </div>

                <div className="space-y-2 mb-5 flex-grow">
                  <div className="flex flex-wrap gap-1.5">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high/90 rounded-lg text-[10px] font-bold text-on-surface/70">
                      <span className="material-symbols-outlined !text-xs opacity-50">layers</span>
                      {product.material || 'Premium Material'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-on-surface/40 font-bold uppercase tracking-tight ml-0.5">
                    <span className="material-symbols-outlined !text-xs opacity-50">trending_up</span>
                    {product.totalSold?.toLocaleString() || 0} terjual
                  </div>
                </div>

                <button className="w-full bg-primary text-on-primary font-bold py-3 px-4 rounded-xl text-xs hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/10 group/btn">
                  <span className="material-symbols-outlined !text-sm transition-transform group-hover/btn:translate-x-0.5">shopping_cart</span>
                  Pesan Sekarang
                </button>
              </div>
            </div>
          )) : (
            // Fallback content
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="group bg-surface-container-lowest/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm animate-pulse border border-outline-variant/10 h-[350px]">
                <div className="aspect-[4/3] bg-surface-container/90"></div>
                <div className="p-5 space-y-4">
                  <div className="h-5 bg-surface-container/90 rounded w-3/4"></div>
                  <div className="h-3 bg-surface-container/90 rounded w-1/2"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Portofolio Hasil Karya Section */}
      <section className="space-y-10 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
              {landingContent?.portfolioSectionConfig?.pillText || 'Hasil Karya'}
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-headline text-slate-900 leading-tight">
              {landingContent?.portfolioSectionConfig?.title || 'Portofolio Client Kami'}
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
              {landingContent?.portfolioSectionConfig?.subtitle || 'Lihat bagaimana brand-brand ternama mempercayakan kemasan produk mereka kepada kami.'}
            </p>
          </div>
          <button onClick={onNavigateToCatalog} className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.18em] rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
            Mulai Project Anda
          </button>
        </div>

        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={setPortfolioApi}
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {portfolios.length > 0 ? portfolios.map((portfolio, idx) => (
              <CarouselItem key={idx} className="pl-4 md:pl-8 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="group relative bg-white/95 backdrop-blur-sm rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 h-full">
                  <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                    <img
                      src={portfolio.imageUrl || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000&auto=format&fit=crop"}
                      alt={portfolio.clientName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white pt-20">
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{portfolio.category || 'Packaging'}</div>
                      <h4 className="font-bold text-2xl font-headline leading-tight">{portfolio.clientName}</h4>
                      <p className="text-sm font-medium text-white/70 line-clamp-2">
                        {portfolio.description || portfolio.title}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )) : (
              // Fallback content
              [1, 2, 3].map((i) => (
                <CarouselItem key={i} className="pl-4 md:pl-8 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="group relative bg-white/95 backdrop-blur-sm rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm h-full">
                    <div className="aspect-[4/5] bg-slate-200 animate-pulse"></div>
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="h-4 bg-white/20 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-white/40 rounded w-3/4"></div>
                    </div>
                  </div>
                </CarouselItem>
              ))
            )}
          </CarouselContent>

          {/* Custom Pill Navigation (Indicators) */}
          {portfolios.length > 0 && (
            <div className="flex justify-center gap-3 mt-10">
              {portfolios.map((_, i) => (
                <button
                  key={i}
                  onClick={() => portfolioApi?.scrollTo(i)}
                  className={`transition-all duration-500 rounded-full h-2.5 ${i === activePortfolioIndex
                    ? 'bg-primary w-12 shadow-lg shadow-primary/30'
                    : 'bg-slate-200 w-2.5 hover:bg-slate-300'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </section>

      {/* Artikel Terkini Section */}
      <section className="bg-surface-container-low/90 backdrop-blur-sm rounded-[2.5rem] p-6 space-y-12">
        <div className="flex flex-col items-center justify-center text-center space-y-5">

          <span className="bg-primary text-white font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            {landingContent?.articleSectionConfig?.pillText || 'Informasi Menarik'}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-headline text-slate-900 max-w-3xl leading-tight">
            {landingContent?.articleSectionConfig?.title || 'Artikel Pilihan Untuk Meningkatkan Produk Anda'}
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-600 max-w-2xl">
            {landingContent?.articleSectionConfig?.subtitle || 'Selalu update dengan tren dan teknologi terbaru di dunia kemasan. Baca artikel-artikel pilihan kami untuk menemukan solusi kemasan yang tepat bagi bisnis Anda.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {articles.slice(0, 4).length > 0 ? articles.slice(0, 4).map((article, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/portal/articles/${article._id || article.clientId}`)}
              className="group space-y-6 cursor-pointer text-center transition-all duration-300 hover:scale-105"
            >
              <div className="aspect-square overflow-hidden rounded-[2rem] bg-surface-container/90 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                <img
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={article.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuC7zXpW1G8K9u_Yv0X9jJ_l9sV9H5j_U_M9K9Y9X9Y9X9Y9X9Y9X9Y9X9Y9X9Y9X9Y9X9Y9X9Y9X9Y9X9Y9X9Y9"}
                />
              </div>
              <div className="space-y-3 px-2">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{article.category || 'Artikel'}</div>
                <h4 className="font-bold text-xl leading-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h4>
                <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt || 'Baca selengkapnya untuk informasi lebih lanjut.'}</p>
              </div>
            </div>
          )) : (
            // Fallback content if empty from DB
            <>
              {[
                { cat: 'Sustainability', title: 'Masa Depan Kemasan Ramah Lingkungan 2024', desc: 'Tren material berkelanjutan yang akan mendominasi pasar UKM di Indonesia tahun ini.' },
                { cat: 'Branding', title: 'Psikologi Warna dalam Desain Produk', desc: 'Bagaimana memilih warna yang tepat untuk meningkatkan konversi penjualan produk Anda.' },
                { cat: 'Technology', title: 'Implementasi Smart Packaging untuk UKM', desc: 'Teknologi QR Code dan tracking yang memudahkan interaksi pelanggan dengan brand.' },
                { cat: 'Compliance', title: 'Standar Keamanan Pangan Nasional', desc: 'Panduan lengkap memenuhi standar BPOM melalui pemilihan kemasan yang tepat.' }
              ].map((item, i) => (
                <div key={i} className="group space-y-6 cursor-pointer text-center">
                  <div className="aspect-square overflow-hidden rounded-[2rem] bg-surface-container/90 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                    <img alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000&auto=format&fit=crop" />
                  </div>
                  <div className="space-y-3 px-2">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.cat}</div>
                    <h4 className="font-bold text-xl leading-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Berita Terbaru Section (Gallery) */}
      <section className="space-y-10 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
              {landingContent?.gallerySectionConfig?.pillText || 'Galeri'}
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-headline text-slate-900 leading-tight">
              {landingContent?.gallerySectionConfig?.title || 'Momen Berharga & Aktivitas Terbaru'}
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
              {landingContent?.gallerySectionConfig?.subtitle || 'Koleksi momen kolaborasi dan kegiatan kami dalam mendukung kemajuan UKM di seluruh Indonesia.'}
            </p>
          </div>
          <button 
            onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
            className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.18em] rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
          >
            Hubungi Kami
          </button>
        </div>

        <div className="relative w-full">
          <Carousel
            className="w-full"
            opts={{ loop: true }}
            setApi={setGalleryApi}
          >
            <CarouselContent className="-ml-0">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <CarouselItem key={idx} className="pl-0 basis-full">
                    <div className="relative aspect-[21/10] sm:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-primary shadow-xl">
                      <img
                        src={activity.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDI2tXpsS0B-_5q6ZfR73uO-g27nOtb9lB1VlG_wA_P0tOxb_2q9v9hZ_YvqI4yR0F5_I0sX0l_fD7B1B6tO-y5J1N0kM8mO5M3qO-_I8r1sU6P8XqD1R7kU3L1_vG7Y9cZ0i9q8"}
                        alt={activity.title || "Gallery"}
                        loading="lazy"
                        className="w-full h-full object-cover lg:object-[center_30%] will-change-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-10 left-10 md:bottom-16 md:left-16 text-white space-y-4 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="inline-block px-3 py-1 bg-primary rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                          {activity.label || "Pameran"}
                        </span>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight font-headline">
                          {activity.title || "Mendukung Kemajuan UKM Indonesia"}
                        </h3>
                        <p className="text-white/70 text-sm md:text-base font-body leading-relaxed max-w-xl line-clamp-2">
                          {activity.summary || "Koleksi momen kolaborasi kami dengan berbagai mitra bisnis di seluruh penjuru negeri."}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="pl-0 basis-full">
                  <div className="relative aspect-[21/10] sm:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-primary flex flex-col items-center justify-center text-white/40 space-y-4 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-8xl">gallery_thumbnail</span>
                    <p className="font-bold uppercase tracking-widest text-sm text-white/20">Belum ada foto galeri</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>

            {activities.length > 1 && (
              <div className="flex justify-center gap-3 mt-10">
                {activities.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => galleryApi?.scrollTo(i)}
                    className={`transition-all duration-500 rounded-full h-2.5 ${i === activeGalleryIndex
                      ? 'bg-primary w-12 shadow-lg shadow-primary/30'
                      : 'bg-slate-200 w-2.5 hover:bg-slate-300'
                      }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </div>
      </section>
    </div>
  );
}
