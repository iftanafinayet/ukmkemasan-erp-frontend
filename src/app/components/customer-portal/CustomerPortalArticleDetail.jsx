import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { ENDPOINTS } from '../../config/environment';
import { normalizeLandingContent } from '../../utils/landingContent';

export default function CustomerPortalArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get(ENDPOINTS.LANDING_CONTENT);
        const landingContent = normalizeLandingContent(response.data);
        const foundArticle = landingContent.articles.find((a) => a.clientId === id || a._id === id);
        setArticle(foundArticle);
        setAllArticles(landingContent.articles);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-bold text-sm uppercase tracking-widest">Loading Article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-8">
        <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-muted">
          <span className="material-symbols-outlined text-4xl">error_outline</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Artikel Tidak Ditemukan</h2>
        <p className="text-on-surface-variant max-w-md">Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
        <button
          onClick={() => navigate('/portal')}
          className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Kembali ke Home
        </button>
      </div>
    );
  }
  const renderContent = (content) => {
    if (!content) return <div className="text-on-surface-variant italic text-center py-10">Konten artikel belum tersedia.</div>;

    return content.split('\n\n').map((block, index) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return null;

      const imageMatch = trimmedBlock.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        const [_, alt, url] = imageMatch;
        return (
          <div key={index} className="w-full my-10">
            <img 
              src={url} 
              alt={alt} 
              className="w-full h-auto rounded-[2rem] shadow-card-hover object-cover max-h-[600px]" 
            />
            {alt && <p className="text-center text-sm text-muted mt-3 italic">{alt}</p>}
          </div>
        );
      }

      const TextWrapper = ({ children }) => (
        <div className="max-w-3xl mx-auto w-full">
          {children}
        </div>
      );

      if (trimmedBlock.startsWith('# ')) {
        const id = trimmedBlock.replace('# ', '').toLowerCase().replace(/\s+/g, '-');
        return (
          <TextWrapper key={index}>
            <h2 id={id} className="text-2xl md:text-3xl font-black text-slate-900 mt-12 mb-6 font-headline scroll-mt-24">
              {trimmedBlock.replace('# ', '')}
            </h2>
          </TextWrapper>
        );
      }

      if (trimmedBlock.startsWith('## ')) {
        const id = trimmedBlock.replace('## ', '').toLowerCase().replace(/\s+/g, '-');
        return (
          <TextWrapper key={index}>
            <h3 id={id} className="text-xl md:text-2xl font-bold text-on-surface mt-8 mb-4 font-headline scroll-mt-24">
              {trimmedBlock.replace('## ', '')}
            </h3>
          </TextWrapper>
        );
      }

      if (trimmedBlock.startsWith('> ')) {
        return (
          <div key={index} className="bg-primary/5 border-l-8 border-primary p-8 rounded-r-3xl my-10 max-w-4xl mx-auto">
            <p className="text-lg md:text-xl font-medium text-on-surface italic leading-relaxed font-body">
              {trimmedBlock.replace('> ', '')}
            </p>
          </div>
        );
      }

      return (
        <TextWrapper key={index}>
          <p className="text-on-surface leading-loose font-body text-base md:text-lg mb-6 whitespace-pre-line">
            {trimmedBlock}
          </p>
        </TextWrapper>
      );
    });
  };


  return (
    <>
      <div className="relative min-h-screen animate-in fade-in duration-500 bg-transparent">
        {/* Desktop Background */}
        <div
          className="hidden lg:block fixed inset-0 -z-10 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "url('/background/bg.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Decorative Background Accents */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-teal-200/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-200/20 blur-[100px] pointer-events-none" />

        {/* Header Section */}
        <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
          <img
            src={article.imageUrl || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000&auto=format&fit=crop"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24 text-white">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                {article.category || 'Artikel'}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight font-headline max-w-3xl">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm font-medium text-white/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {article.date || 'Tanggal tidak tersedia'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 -mt-12 relative z-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Article Body */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-outline-variant/30 space-y-8">
                {/* Back Button */}
                <div className="max-w-3xl mx-auto w-full">
                  <button
                    onClick={() => navigate('/portal')}
                    className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Home
                  </button>
                </div>

                {/* Article Body */}
                <div className="space-y-8">
                  <div className="max-w-3xl mx-auto w-full">
                    <p className="text-lg md:text-xl font-medium text-on-surface-variant leading-relaxed whitespace-pre-line italic border-l-4 border-primary pl-6 mb-8">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="text-on-surface leading-loose font-body text-base md:text-lg space-y-6">
                    {renderContent(article.content)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-24 space-y-8">
                
                {/* TOC Widget */}
                <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-card-hover shadow-slate-200/50 border border-outline-variant/30">
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                    Daftar Isi
                  </h3>
                  <div className="space-y-2">
                    {article.content?.split('\n\n')
                      .filter(block => block.trim().startsWith('#'))
                      .map((block, idx) => {
                        const isMain = block.trim().startsWith('# ');
                        const text = block.trim().replace(/^#+\s+/, '');
                        const id = text.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <button 
                            key={idx} 
                            onClick={() => {
                              const element = document.getElementById(id);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={`block text-left py-2 px-3 rounded-xl transition-all hover:bg-primary/10 hover:text-primary text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isMain ? 'text-slate-900 font-bold pl-0' : 'text-on-surface-variant pl-4'}`}
                          >
                            {text}
                          </button>
                        );
                      })
                    }
                  </div>
                </div>

                {/* Related Articles Widget */}
                <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-card-hover shadow-slate-200/50 border border-outline-variant/30">
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">auto_stories</span>
                    Artikel Menarik
                  </h3>
                  <div className="space-y-4">
                    {allArticles
                      .filter((a) => (a.clientId !== id && a._id !== id))
                      .slice(0, 3)
                      .map((related, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            navigate(`/portal/articles/${related._id || related.clientId}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="group cursor-pointer flex gap-3 p-2 rounded-2xl hover:bg-surface-container-low transition-all"
                        >
                          <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-high">
                            <img 
                              src={related.imageUrl || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000&auto=format&fit=crop"} 
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                              {related.title}
                            </h4>
                            <p className="text-[11px] text-muted mt-1 truncate">{related.category || 'Artikel'}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* CTA Widget */}
                <div className="bg-primary rounded-[2rem] p-8 text-white shadow-card-hover shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined">chat</span>
                    </div>
                    <h3 className="text-xl font-black leading-tight">Butuh Konsultasi Desain?</h3>
                    <p className="text-white/80 text-xs leading-relaxed">
                      Dapatkan saran ahli untuk kemasan produk Anda secara gratis.
                    </p>
                    <a 
                      href="https://wa.me/6282326237919" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-surface-container-lowest text-primary font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-surface-container-low transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Chat Admin Sekarang
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
