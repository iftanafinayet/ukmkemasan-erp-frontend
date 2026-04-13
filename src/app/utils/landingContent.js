const DEFAULT_ACTIVITY_ACCENT = 'from-slate-900 via-slate-800 to-cyan-900';

export const ACTIVITY_ACCENT_OPTIONS = [
  { value: 'from-slate-900 via-slate-800 to-cyan-900', label: 'Slate Cyan' },
  { value: 'from-primary via-cyan-700 to-emerald-700', label: 'Primary Emerald' },
  { value: 'from-amber-500 via-orange-500 to-rose-500', label: 'Amber Rose' },
  { value: 'from-indigo-700 via-sky-700 to-cyan-500', label: 'Indigo Sky' },
];

const createClientId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const createEmptyArticle = () => ({
  clientId: createClientId('article'),
  category: '',
  title: '',
  date: '',
  excerpt: '',
});

export const createEmptyActivity = () => ({
  clientId: createClientId('activity'),
  label: '',
  title: '',
  date: '',
  location: '',
  summary: '',
  accent: DEFAULT_ACTIVITY_ACCENT,
  imageUrl: '',
  imagePublicId: '',
  imageAlt: '',
  imageFile: null,
  imageRemoved: false,
});

export const createEmptyLandingContent = () => ({
  articles: [],
  activities: [],
  articleSectionConfig: { pillText: 'Informasi Menarik', title: 'Artikel Pilihan Untuk Meningkatkan Produk Anda', subtitle: 'Selalu update dengan tren dan teknologi terbaru di dunia kemasan. Baca artikel-artikel pilihan kami untuk menemukan solusi kemasan yang tepat bagi bisnis Anda.' },
  gallerySectionConfig: { pillText: 'Galeri', title: '', subtitle: '' },
});

export const normalizeLandingContent = (payload = {}) => ({
  articles: Array.isArray(payload.articles)
    ? payload.articles.map((article) => ({
        ...createEmptyArticle(),
        ...article,
        clientId: article.clientId || article._id || createClientId('article'),
      }))
    : [],
  activities: Array.isArray(payload.activities)
    ? payload.activities.map((activity) => ({
        ...createEmptyActivity(),
        ...activity,
        clientId: activity.clientId || activity._id || createClientId('activity'),
        imageFile: null,
        imageRemoved: false,
      }))
    : [],
  articleSectionConfig: payload.articleSectionConfig || { pillText: '', title: '', subtitle: '' },
  gallerySectionConfig: payload.gallerySectionConfig || { pillText: '', title: '', subtitle: '' },
});

export const buildLandingContentPayload = (landingContent = createEmptyLandingContent()) => ({
  articles: Array.isArray(landingContent.articles)
    ? landingContent.articles.map((article) => ({
        _id: article._id,
        category: article.category,
        title: article.title,
        date: article.date,
        excerpt: article.excerpt,
      }))
    : [],
  activities: Array.isArray(landingContent.activities)
    ? landingContent.activities.map((activity) => ({
        _id: activity._id,
        clientId: activity.clientId,
        label: activity.label,
        title: activity.title,
        date: activity.date,
        location: activity.location,
        summary: activity.summary,
        accent: activity.accent,
        imageUrl: activity.imageUrl,
        imagePublicId: activity.imagePublicId,
        imageAlt: activity.imageAlt,

        removeImage: Boolean(activity.imageRemoved),
      }))
    : [],
  articleSectionConfig: landingContent.articleSectionConfig,
  gallerySectionConfig: landingContent.gallerySectionConfig,
});
