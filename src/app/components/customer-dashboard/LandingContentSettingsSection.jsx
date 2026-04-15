import { CalendarDays, Camera, ImagePlus, Newspaper, Plus, Save, Trash2 } from 'lucide-react';
import { FormInput } from './shared';
import { ACTIVITY_ACCENT_OPTIONS } from '../../utils/landingContent';

function TextAreaField({ label, onChange, placeholder = '', rows = 4, value }) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  );
}

export default function LandingContentSettingsSection({
  landingContent,
  onActivityChange,
  onActivityImageChange,
  onActivityRemoveImage,
  onAddActivity,
  onAddArticle,
  onArticleChange,
  onArticleImageChange,
  onArticleRemoveImage,
  onRemoveActivity,
  onRemoveArticle,
  onPortfolioChange,
  onPortfolioImageChange,
  onPortfolioRemoveImage,
  onAddPortfolio,
  onRemovePortfolio,
  onSectionConfigChange,  // New prop for changing section configs
  onSave,
  saving,
}) {
  const articles = Array.isArray(landingContent?.articles) ? landingContent.articles : [];
  const activities = Array.isArray(landingContent?.activities) ? landingContent.activities : [];
  const portfolios = Array.isArray(landingContent?.portfolios) ? landingContent.portfolios : [];
  const articleSectionConfig = landingContent?.articleSectionConfig || { pillText: '', title: '', subtitle: '' };
  const gallerySectionConfig = landingContent?.gallerySectionConfig || { pillText: '', title: '', subtitle: '' };
  const portfolioSectionConfig = landingContent?.portfolioSectionConfig || { pillText: '', title: '', subtitle: '' };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-black text-slate-800">
              <Newspaper className="h-5 w-5 text-primary" />
              Landing Content Homepage
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Kelola artikel dan galeri kegiatan yang tampil di homepage customer portal. Perubahan ini langsung dipakai oleh dashboard customer.
            </p>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Konten'}
          </button>
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Artikel & Insight</p>
            <h4 className="mt-2 text-xl font-black text-slate-900">Konfigurasi Header & Daftar Artikel</h4>
          </div>
          <button
            type="button"
            onClick={onAddArticle}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Tambah Artikel
          </button>
        </div>

        <div className="space-y-4 border-b border-slate-100 pb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Header Section Artikel</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput label="Teks Label (Pill)" value={articleSectionConfig.pillText} onChange={(value) => onSectionConfigChange('articleSectionConfig', 'pillText', value)} placeholder="Contoh: Informasi Menarik" />
            <FormInput label="Judul Utama" value={articleSectionConfig.title} onChange={(value) => onSectionConfigChange('articleSectionConfig', 'title', value)} placeholder="Contoh: Artikel Pilihan..." />
          </div>
          <TextAreaField label="Subjudul / Deskripsi Singkat" value={articleSectionConfig.subtitle} onChange={(value) => onSectionConfigChange('articleSectionConfig', 'subtitle', value)} rows={2} />
        </div>

        <div className="space-y-4 pt-4">
          {articles.map((article, index) => (
            <div key={article.clientId} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 font-black text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Artikel {index + 1}</p>
                    <p className="text-xs text-slate-400">Konten insight yang tampil di dashboard customer.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveArticle(article.clientId)}
                  className="rounded-2xl border border-red-100 bg-white p-3 text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput label="Kategori" value={article.category} onChange={(value) => onArticleChange(article.clientId, 'category', value)} />
                <FormInput label="Tanggal" value={article.date} onChange={(value) => onArticleChange(article.clientId, 'date', value)} placeholder="Contoh: 10 April 2026" />
              </div>
              <div className="mt-4">
                <FormInput label="Judul" value={article.title} onChange={(value) => onArticleChange(article.clientId, 'title', value)} />
              </div>
              <div className="mt-4">
                <TextAreaField label="Ringkasan" value={article.excerpt} onChange={(value) => onArticleChange(article.clientId, 'excerpt', value)} rows={3} />
              </div>
              <div className="mt-4">
                <FormInput label="Alt Gambar" value={article.imageAlt} onChange={(value) => onArticleChange(article.clientId, 'imageAlt', value)} placeholder="Deskripsi gambar artikel" />
              </div>

              <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Gambar artikel</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Upload gambar untuk mempercantik artikel. Jika kosong, akan menggunakan placeholder default.
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary">
                    <ImagePlus className="h-4 w-4" />
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        onArticleImageChange(article.clientId, event.target.files?.[0] || null);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
                  {(article.imageFile || article.imageUrl) && (
                    <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:h-40 lg:w-64">
                      <img
                        src={article.imageFile ? URL.createObjectURL(article.imageFile) : article.imageUrl}
                        alt={article.imageAlt || 'Preview'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1 text-sm text-slate-500">
                    {article.imageFile ? (
                      <p className="font-bold text-primary">File baru terpilih: {article.imageFile.name}</p>
                    ) : article.imageUrl ? (
                      <p className="font-bold text-slate-700">Gambar saat ini tersimpan di server.</p>
                    ) : (
                      <p>Belum ada gambar untuk artikel ini.</p>
                    )}
                    <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Dashboard customer akan menampilkan gambar ini.
                    </div>
                  </div>
                  {(article.imageUrl || article.imageFile) && (
                    <button
                      type="button"
                      onClick={() => onArticleRemoveImage(article.clientId)}
                      className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-red-500 transition-colors hover:bg-red-50"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Galeri Kegiatan</p>
            <h4 className="mt-2 text-xl font-black text-slate-900">Konfigurasi Header & Daftar Kegiatan</h4>
          </div>
          <button
            type="button"
            onClick={onAddActivity}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Tambah Kegiatan
          </button>
        </div>

        <div className="space-y-4 border-b border-slate-100 pb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Header Section Galeri</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput label="Teks Label (Pill)" value={gallerySectionConfig.pillText} onChange={(value) => onSectionConfigChange('gallerySectionConfig', 'pillText', value)} placeholder="Contoh: Galeri" />
            <FormInput label="Judul Utama" value={gallerySectionConfig.title} onChange={(value) => onSectionConfigChange('gallerySectionConfig', 'title', value)} placeholder="Jika ada judul tambahan..." />
          </div>
          <TextAreaField label="Subjudul / Deskripsi Singkat" value={gallerySectionConfig.subtitle} onChange={(value) => onSectionConfigChange('gallerySectionConfig', 'subtitle', value)} rows={2} />
        </div>

        <div className="space-y-4 pt-4">
          {activities.map((activity, index) => (
            <div key={activity.clientId} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 font-black text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{activity.title || `Kegiatan ${index + 1}`}</p>
                    <p className="text-xs text-slate-400">Gunakan gambar jika ada, atau gradient accent sebagai fallback.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveActivity(activity.clientId)}
                  className="rounded-2xl border border-red-100 bg-white p-3 text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput label="Label" value={activity.label} onChange={(value) => onActivityChange(activity.clientId, 'label', value)} placeholder="Contoh: Pameran" />
                <FormInput label="Tanggal" value={activity.date} onChange={(value) => onActivityChange(activity.clientId, 'date', value)} placeholder="Contoh: April 2026" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput label="Judul" value={activity.title} onChange={(value) => onActivityChange(activity.clientId, 'title', value)} />
                <FormInput label="Lokasi" value={activity.location} onChange={(value) => onActivityChange(activity.clientId, 'location', value)} />
              </div>
              <div className="mt-4">
                <TextAreaField label="Ringkasan" value={activity.summary} onChange={(value) => onActivityChange(activity.clientId, 'summary', value)} rows={3} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Accent Gradient</label>
                  <select
                    value={activity.accent}
                    onChange={(event) => onActivityChange(activity.clientId, 'accent', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {ACTIVITY_ACCENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <FormInput label="Alt Gambar" value={activity.imageAlt} onChange={(value) => onActivityChange(activity.clientId, 'imageAlt', value)} placeholder="Deskripsi gambar" />
              </div>

              <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Gambar kegiatan</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Upload gambar baru untuk kartu galeri. Jika kosong, dashboard akan menampilkan gradient card.
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary">
                    <ImagePlus className="h-4 w-4" />
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        onActivityImageChange(activity.clientId, event.target.files?.[0] || null);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
                  {(activity.imageFile || activity.imageUrl) && (
                    <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:h-40 lg:w-64">
                      <img
                        src={activity.imageFile ? URL.createObjectURL(activity.imageFile) : activity.imageUrl}
                        alt={activity.imageAlt || 'Preview'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1 text-sm text-slate-500">
                    {activity.imageFile ? (
                      <p className="font-bold text-primary">File baru terpilih: {activity.imageFile.name}</p>
                    ) : activity.imageUrl ? (
                      <p className="font-bold text-slate-700">Gambar saat ini tersimpan di server.</p>
                    ) : (
                      <p>Belum ada gambar untuk kegiatan ini.</p>
                    )}
                    <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Dashboard customer akan memakai gambar ini di section galeri.
                    </div>
                  </div>
                  {(activity.imageUrl || activity.imageFile) && (
                    <button
                      type="button"
                      onClick={() => onActivityRemoveImage(activity.clientId)}
                      className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-red-500 transition-colors hover:bg-red-50"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Portofolio Pelanggan</p>
            <h4 className="mt-2 text-xl font-black text-slate-900">Hasil Karya & Case Studies</h4>
          </div>
          <button
            type="button"
            onClick={onAddPortfolio}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Tambah Portofolio
          </button>
        </div>

        <div className="space-y-4 border-b border-slate-100 pb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Header Section Portofolio</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput label="Teks Label (Pill)" value={portfolioSectionConfig.pillText} onChange={(value) => onSectionConfigChange('portfolioSectionConfig', 'pillText', value)} placeholder="Contoh: Portofolio" />
            <FormInput label="Judul Utama" value={portfolioSectionConfig.title} onChange={(value) => onSectionConfigChange('portfolioSectionConfig', 'title', value)} placeholder="Contoh: Hasil Karya Client..." />
          </div>
          <TextAreaField label="Subjudul / Deskripsi Singkat" value={portfolioSectionConfig.subtitle} onChange={(value) => onSectionConfigChange('portfolioSectionConfig', 'subtitle', value)} rows={2} />
        </div>

        <div className="space-y-4 pt-4">
          {portfolios.map((portfolio, index) => (
            <div key={portfolio.clientId} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 font-black text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{portfolio.clientName || `Portofolio ${index + 1}`}</p>
                    <p className="text-xs text-slate-400">Tampilkan foto produk asli yang sudah diproduksi untuk client.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePortfolio(portfolio.clientId)}
                  className="rounded-2xl border border-red-100 bg-white p-3 text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput label="Nama Client" value={portfolio.clientName} onChange={(value) => onPortfolioChange(portfolio.clientId, 'clientName', value)} placeholder="Contoh: Kopi Kenangan" />
                <FormInput label="Label / Kategori" value={portfolio.category} onChange={(value) => onPortfolioChange(portfolio.clientId, 'category', value)} placeholder="Contoh: Standing Pouch" />
              </div>
              <div className="mt-4">
                <FormInput label="Judul Case Study" value={portfolio.title} onChange={(value) => onPortfolioChange(portfolio.clientId, 'title', value)} placeholder="Contoh: Packaging Kopi Premium" />
              </div>
              <div className="mt-4">
                <TextAreaField label="Deskripsi Singkat" value={portfolio.description} onChange={(value) => onPortfolioChange(portfolio.clientId, 'description', value)} rows={3} />
              </div>

              <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Foto Hasil Produksi</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Upload foto hasil karya untuk ditampilkan sebagai bukti kualitas produksi.
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary">
                    <ImagePlus className="h-4 w-4" />
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        onPortfolioImageChange(portfolio.clientId, event.target.files?.[0] || null);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
                  {(portfolio.imageFile || portfolio.imageUrl) && (
                    <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:h-40 lg:w-64">
                      <img
                        src={portfolio.imageFile ? URL.createObjectURL(portfolio.imageFile) : portfolio.imageUrl}
                        alt={portfolio.clientName || 'Preview'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1 text-sm text-slate-500">
                    {portfolio.imageFile ? (
                      <p className="font-bold text-primary">File baru terpilih: {portfolio.imageFile.name}</p>
                    ) : portfolio.imageUrl ? (
                      <p className="font-bold text-slate-700">Gambar saat ini tersimpan di server.</p>
                    ) : (
                      <p>Belum ada gambar untuk portofolio ini.</p>
                    )}
                    <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Akan tampil di homepage sebagai hasil karya client.
                    </div>
                  </div>
                  {(portfolio.imageUrl || portfolio.imageFile) && (
                    <button
                      type="button"
                      onClick={() => onPortfolioRemoveImage(portfolio.clientId)}
                      className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-red-500 transition-colors hover:bg-red-50"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
