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
  onNavigateToCreateOrder,
  onViewAllOrders,
  user
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
    <div className="lg:hidden bg-[#faf8ff] min-h-screen">
      <main className="pt-4 pb-24">
        {/* Berita Terbaru Section (Activities / Hero Banner) */}
        <section className="px-4 mb-2">

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
                          <span className="inline-block px-2.5 py-1 bg-[#4dbace]/20 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-[#4dbace] border border-[#4dbace]/20">
                            {activity.label || "Pameran"}
                          </span>
                          <h3 className="text-xl font-bold tracking-tight leading-tight font-headline">
                            {activity.title || "Mendukung Kemajuan UKM Indonesia"}
                          </h3>
                          <p className="text-white/80 text-[11px] leading-snug line-clamp-2">
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
                      <p className="font-bold text-[10px] text-white/30 uppercase tracking-widest">Belum ada foto galeri</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>

              {activities.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
                  {activities.map((_, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-500 rounded-full h-1.5 ${i === activeGalleryIndex
                          ? 'bg-white w-6'
                          : 'bg-white/40 w-1.5 hover:bg-white/60'
                        }`}
                    />
                  ))}
                </div>
              )}
            </Carousel>
          </div>
        </section>

        {/* Profile Summary Row */}
        <section className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 bg-white border border-[#bbc9c7]/20 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4dbace] text-xl">account_balance_wallet</span>
              <div>
                <p className="text-[10px] text-[#3c4947] font-medium">Pesanan Selesai</p>
                <p className="text-xs font-bold">{stats.completed || 0} Order</p>
              </div>
            </div>
            <div className="w-px h-6 bg-[#bbc9c7]/30"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4dbace] text-xl">stars</span>
              <div>
                <p className="text-[10px] text-[#3c4947] font-medium">Produksi Aktif</p>
                <p className="text-xs font-bold text-[#4dbace]">{stats.production || 0} Project</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 pt-2 pb-6">
          <div className="grid grid-cols-4 gap-y-4">
            <div onClick={onNavigateToCatalog} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-[#4dbace]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4dbace] text-2xl">package_2</span>
              </div>
              <span className="text-[11px] text-center font-medium leading-tight text-[#131b2e]">Stok Kemasan</span>
            </div>
            <div onClick={onNavigateToCatalog} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-[#4dbace]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4dbace] text-2xl">architecture</span>
              </div>
              <span className="text-[11px] text-center font-medium leading-tight text-[#131b2e]">Kustom Desain</span>
            </div>
            <div onClick={() => handleAction(onViewAllOrders)} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-11 h-11 bg-[#4dbace]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4dbace] text-2xl">local_shipping</span>
              </div>
              <span className="text-[11px] text-center font-medium leading-tight text-[#131b2e]">Lacak Kirim</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a] text-2xl">support_agent</span>
              </div>
              <span className="text-[11px] text-center font-medium leading-tight text-[#131b2e]">Bantuan</span>
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section className="bg-white py-6 border-y border-[#bbc9c7]/20">
          <div className="px-4 flex justify-between items-end mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e] font-headline">Pilihan Terbaik</h2>
              <p className="text-[11px] text-[#3c4947]">Produk kemasan paling laris bulan ini</p>
            </div>
            <button onClick={onNavigateToCatalog} className="text-[#4dbace] text-xs font-bold">Lihat Semua</button>
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
                  <p className="text-xs text-[#131b2e] line-clamp-2 min-h-[32px]">{product.name}</p>
                  <p className="text-sm font-bold text-[#131b2e] mt-1">{formatCurrency(product.priceB2B)}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="text-[10px] text-[#3c4947] font-medium">Varian: {product.variants?.length || 0} opsi</div>
                    <div className="text-[10px] text-[#3c4947]">Terjual {product.totalSold || 0}+</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio Carousel */}
        <section className="px-4 pt-8 pb-4">
          <h2 className="text-sm font-bold mb-3 font-headline">Hasil Karya Terbaik</h2>
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
                        <h4 className="text-white font-bold text-sm">{portfolio.clientName}</h4>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

        {/* Articles */}
        <section className="px-4 pt-8 pb-10">
          <h2 className="text-sm font-bold mb-3 font-headline">Artikel Pilihan</h2>
          <div className="flex flex-col gap-3">
            {articles.slice(0, 3).map((article, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <img
                  className="w-16 h-16 rounded-lg object-cover"
                  src={article.imageUrl || "https://via.placeholder.com/100"}
                  alt={article.title}
                />
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-[#131b2e] line-clamp-2">{article.title}</h4>
                  <p className="text-[10px] text-[#3c4947] mt-1">{article.category || 'Tips'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
