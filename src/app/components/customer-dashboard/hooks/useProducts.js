import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { ENDPOINTS } from '../../../config/environment';

const EMPTY_PRODUCT_FORM = {
  name: '',
  category: 'Standing Pouch',
  material: '',
  minOrder: 100,
  valvePrice: 600,
  description: '',
  variants: [],
};

const createEmptyVariant = () => ({
  _id: '',
  sku: '',
  size: '',
  color: '',
  priceB2C: '',
  priceB2B: '',
  stock: '',
});

const getEmptyProductForm = () => ({
  ...EMPTY_PRODUCT_FORM,
  variants: [createEmptyVariant()],
});

const normalizeProductVariants = (variants = []) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [createEmptyVariant()];
  }

  return variants.map((variant) => ({
    _id: variant._id || '',
    sku: variant.sku || '',
    size: variant.size || '',
    color: variant.color || '',
    priceB2C: variant.priceB2C ?? '',
    priceB2B: variant.priceB2B ?? '',
    stock: variant.stock ?? '',
  }));
};

export function useProducts(setData) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(getEmptyProductForm());
  const [imageFiles, setImageFiles] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const resetProductForm = useCallback(() => {
    setNewProduct(getEmptyProductForm());
    setImageFiles([]);
    setDeleteImageIds([]);
    setExistingImages([]);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
    resetProductForm();
  }, [resetProductForm]);

  const addImageFiles = useCallback((files) => {
    const remaining = 5 - existingImages.length - imageFiles.length;
    if (remaining <= 0) return;
    setImageFiles((currentFiles) => [...currentFiles, ...files.slice(0, remaining)]);
  }, [existingImages.length, imageFiles.length]);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      material: product.material,
      minOrder: product.minOrder || 100,
      valvePrice: product.addons?.valvePrice ?? 0,
      description: product.description || '',
      variants: normalizeProductVariants(product.variants),
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setDeleteImageIds([]);
    setIsModalOpen(true);
  }, []);

  const handleAddProduct = async (event) => {
    event.preventDefault();

    try {
      const normalizedVariants = (newProduct.variants || [])
        .map((variant) => ({
          ...(variant._id ? { _id: variant._id } : {}),
          sku: String(variant.sku || '').trim(),
          size: String(variant.size || '').trim(),
          color: String(variant.color || '').trim(),
          priceB2C: Number(variant.priceB2C),
          priceB2B: Number(variant.priceB2B),
          stock: Number(variant.stock),
        }))
        .filter((variant) => variant.sku || variant.size || variant.color || variant.priceB2C || variant.priceB2B || variant.stock);

      if (normalizedVariants.length === 0) {
        toast.error('Tambahkan minimal satu varian produk.');
        return;
      }

      const hasInvalidVariant = normalizedVariants.some((variant) => (
        !variant.sku
        || !variant.size
        || !variant.color
        || !Number.isFinite(variant.priceB2C)
        || !Number.isFinite(variant.priceB2B)
        || !Number.isFinite(variant.stock)
      ));

      if (hasInvalidVariant) {
        toast.error('Lengkapi SKU, ukuran, warna, harga, dan stok untuk setiap varian.');
        return;
      }

      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('material', newProduct.material);
      formData.append('minOrder', Number(newProduct.minOrder || 100));
      formData.append('description', newProduct.description || '');
      formData.append('addons', JSON.stringify({
        valvePrice: Number(newProduct.valvePrice || 0),
      }));
      formData.append('variants', JSON.stringify(normalizedVariants));

      imageFiles.forEach((file) => formData.append('images', file));

      if (deleteImageIds.length > 0) {
        formData.append('deleteImageIds', JSON.stringify(deleteImageIds));
      }

      if (editingProduct) {
        await api.put(ENDPOINTS.PRODUCT_BY_ID(editingProduct._id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produk berhasil diupdate!');
      } else {
        await api.post(ENDPOINTS.PRODUCTS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produk baru berhasil ditambahkan!');
      }

      closeProductModal();
      const response = await api.get(ENDPOINTS.PRODUCTS);
      setData(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      await api.delete(ENDPOINTS.PRODUCT_BY_ID(productId));
      toast.success('Produk berhasil dihapus!');
      const response = await api.get(ENDPOINTS.PRODUCTS);
      setData(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  const handleRemoveExistingImage = (publicId) => {
    setDeleteImageIds((currentIds) => [...currentIds, publicId]);
    setExistingImages((currentImages) => currentImages.filter((image) => image.publicId !== publicId));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setImageFiles((currentFiles) => currentFiles.filter((_, index) => index !== indexToRemove));
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingProduct,
    setEditingProduct,
    newProduct,
    setNewProduct,
    imageFiles,
    setImageFiles,
    deleteImageIds,
    setDeleteImageIds,
    existingImages,
    setExistingImages,
    resetProductForm,
    closeProductModal,
    addImageFiles,
    handleEditProduct,
    handleAddProduct,
    handleDeleteProduct,
    handleRemoveExistingImage,
    handleRemoveNewImage,
  };
}
