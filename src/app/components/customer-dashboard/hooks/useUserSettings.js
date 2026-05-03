import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { ENDPOINTS, storage } from '../../../config/environment';
import { normalizeLandingContent, buildLandingContentPayload, createEmptyLandingContent, createEmptyArticle, createEmptyActivity, createEmptyPortfolio } from '../../../utils/landingContent';

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const EMPTY_PASSWORDS = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function useUserSettings() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [landingContent, setLandingContent] = useState(createEmptyLandingContent());
  const [savingLandingContent, setSavingLandingContent] = useState(false);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const response = await api.put(ENDPOINTS.PROFILE, profile);
      storage.setUser({
        _id: response.data._id,
        name: response.data.name,
        role: response.data.role,
      });
      toast.success('Profil berhasil diupdate!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put(ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password berhasil diubah!');
      setPasswords(EMPTY_PASSWORDS);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const updateArticleField = (clientId, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.map((article) => (
        article.clientId === clientId ? { ...article, [field]: value } : article
      )),
    }));
  };

  const updateActivityField = (clientId, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.map((activity) => (
        activity.clientId === clientId ? { ...activity, [field]: value } : activity
      )),
    }));
  };

  const updatePortfolioField = (clientId, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.map((portfolio) => (
        portfolio.clientId === clientId ? { ...portfolio, [field]: value } : portfolio
      )),
    }));
  };

  const handleAddLandingArticle = () => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: [...currentContent.articles, createEmptyArticle()],
    }));
  };

  const handleRemoveLandingArticle = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.filter((article) => article.clientId !== clientId),
    }));
  };

  const handleAddLandingActivity = () => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: [...currentContent.activities, createEmptyActivity()],
    }));
  };

  const handleRemoveLandingActivity = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.filter((activity) => activity.clientId !== clientId),
    }));
  };

  const handleAddLandingPortfolio = () => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: [...currentContent.portfolios, createEmptyPortfolio()],
    }));
  };

  const handleRemoveLandingPortfolio = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.filter((portfolio) => portfolio.clientId !== clientId),
    }));
  };

  const handleLandingArticleImageChange = (clientId, file) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.map((article) => (
        article.clientId === clientId
          ? {
              ...article,
              imageFile: file || null,
              imageRemoved: false,
            }
          : article
      )),
    }));
  };

  const handleLandingArticleRemoveImage = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.map((article) => (
        article.clientId === clientId
          ? {
              ...article,
              imageFile: null,
              imageUrl: '',
              imagePublicId: '',
              imageRemoved: true,
            }
          : article
      )),
    }));
  };

  const handleLandingActivityImageChange = (clientId, file) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.map((activity) => (
        activity.clientId === clientId
          ? {
              ...activity,
              imageFile: file || null,
              imageRemoved: false,
            }
          : activity
      )),
    }));
  };

  const handleLandingActivityRemoveImage = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.map((activity) => (
        activity.clientId === clientId
          ? {
              ...activity,
              imageFile: null,
              imageUrl: '',
              imagePublicId: '',
              imageRemoved: true,
            }
          : activity
      )),
    }));
  };

  const handleLandingPortfolioImageChange = (clientId, file) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.map((portfolio) => (
        portfolio.clientId === clientId
          ? {
              ...portfolio,
              imageFile: file || null,
              imageRemoved: false,
            }
          : portfolio
      )),
    }));
  };

  const handleLandingPortfolioRemoveImage = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.map((portfolio) => (
        portfolio.clientId === clientId
          ? {
              ...portfolio,
              imageFile: null,
              imageUrl: '',
              imagePublicId: '',
              imageRemoved: true,
            }
          : portfolio
      )),
    }));
  };

  const handleLandingSectionConfigChange = (sectionType, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      [sectionType]: {
        ...currentContent[sectionType],
        [field]: value,
      },
    }));
  };

  const handleSaveLandingContent = async () => {
    setSavingLandingContent(true);

    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify(buildLandingContentPayload(landingContent)));

      landingContent.articles.forEach((article) => {
        if (article.imageFile) {
          formData.append(`articleImage:${article.clientId}`, article.imageFile);
        }
      });

      (landingContent.activities || []).forEach((activity) => {
        if (activity.imageFile) {
          formData.append(`activityImage:${activity.clientId}`, activity.imageFile);
        }
      });

      (landingContent.portfolios || []).forEach((portfolio) => {
        if (portfolio.imageFile) {
          formData.append(`portfolioImage:${portfolio.clientId}`, portfolio.imageFile);
        }
      });

      const response = await api.put(ENDPOINTS.LANDING_CONTENT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLandingContent(normalizeLandingContent(response.data));
      toast.success('Konten landing page berhasil diperbarui.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan konten landing page.');
    } finally {
      setSavingLandingContent(false);
    }
  };

  return {
    profile,
    setProfile,
    passwords,
    setPasswords,
    savingProfile,
    savingPassword,
    landingContent,
    setLandingContent,
    savingLandingContent,
    handleSaveProfile,
    handleChangePassword,
    updateArticleField,
    updateActivityField,
    updatePortfolioField,
    handleAddLandingArticle,
    handleRemoveLandingArticle,
    handleAddLandingActivity,
    handleRemoveLandingActivity,
    handleAddLandingPortfolio,
    handleRemoveLandingPortfolio,
    handleLandingArticleImageChange,
    handleLandingArticleRemoveImage,
    handleLandingActivityImageChange,
    handleLandingActivityRemoveImage,
    handleLandingPortfolioImageChange,
    handleLandingPortfolioRemoveImage,
    handleLandingSectionConfigChange,
    handleSaveLandingContent,
  };
}
