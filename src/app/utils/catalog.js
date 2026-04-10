const normalizeWhitespace = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const stripSkuSuffix = (value = '') => normalizeWhitespace(value).replace(/\s*\([^)]*\)\s*$/, '').trim();

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractWeightLabel = (value = '') => {
  const match = normalizeWhitespace(value).match(/(\d+(?:[.,]\d+)?)\s*(gr|kg)\b/i);
  if (!match) return '';

  return `${match[1].replace(/([.,]0+)$/, '')} ${match[2].toLowerCase()}`;
};

const extractColorFromName = (value = '') => {
  const cleaned = stripSkuSuffix(value);
  const parts = cleaned.split(' - ').map(normalizeWhitespace).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

const inferFamilyName = (product = {}, variant = {}) => {
  const color = normalizeWhitespace(variant.color || extractColorFromName(product.name));
  let baseName = stripSkuSuffix(product.name || product.category || 'Produk');

  if (color) {
    baseName = baseName.replace(new RegExp(`\\s*-\\s*${escapeRegex(color)}$`, 'i'), '').trim();
  }

  baseName = baseName.replace(/(\d+(?:[.,]\d+)?)\s*(gr|kg)\b/ig, ' ');
  baseName = normalizeWhitespace(baseName);

  return baseName || normalizeWhitespace(product.category || 'Produk');
};

const toWeightOrder = (value = '') => {
  const match = normalizeWhitespace(value).match(/(\d+(?:[.,]\d+)?)\s*(gr|kg)\b/i);
  if (!match) return null;

  const amount = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(amount)) return null;

  return match[2].toLowerCase() === 'kg' ? amount * 1000 : amount;
};

const compareVariantSizes = (left = '', right = '') => {
  const leftWeight = toWeightOrder(left);
  const rightWeight = toWeightOrder(right);

  if (leftWeight !== null && rightWeight !== null) {
    return leftWeight - rightWeight;
  }

  if (leftWeight !== null) return -1;
  if (rightWeight !== null) return 1;

  return normalizeWhitespace(left).localeCompare(normalizeWhitespace(right), 'id', { numeric: true });
};

const createCatalogGroup = (product = {}, variant = {}, familyName = '') => ({
  key: `${product.category || 'Lain Lain'}::${familyName}`,
  slug: `${product.category || 'lain-lain'}-${familyName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''),
  name: familyName,
  category: product.category || 'Lain Lain',
  representativeProductId: product._id,
  productId: product._id,
  materialLabel: normalizeWhitespace(product.material) || '-',
  description: product.description || '',
  addons: product.addons || {},
  minOrder: product.minOrder || 100,
  images: product.images || [],
  variants: [],
  _materials: new Set([normalizeWhitespace(product.material)].filter(Boolean)),
  _sizes: new Set([normalizeWhitespace(variant.size)].filter(Boolean)),
  _colors: new Set([normalizeWhitespace(variant.color)].filter(Boolean)),
  _startingPriceB2C: Number.isFinite(Number(variant.priceB2C)) ? Number(variant.priceB2C) : Number(product.priceB2C) || 0,
  _startingPriceB2B: Number.isFinite(Number(variant.priceB2B)) ? Number(variant.priceB2B) : Number(product.priceB2B) || 0,
  _totalStock: Number(variant.stock) || 0
});

export const buildCatalogGroups = (products = []) => {
  const catalogMap = new Map();

  products.forEach((product) => {
    const variants = Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [{
          sku: product.sku || '',
          color: '',
          size: '',
          priceB2C: product.priceB2C || product.priceBase || 0,
          priceB2B: product.priceB2B || product.priceBase || 0,
          stock: product.stockPolos || 0
        }];

    variants.forEach((variant) => {
      const normalizedVariant = {
        sku: variant.sku || product.sku || '',
        color: normalizeWhitespace(variant.color || extractColorFromName(product.name) || 'Default'),
        size: normalizeWhitespace(variant.size || extractWeightLabel(product.name) || 'Default'),
        priceB2C: Number(variant.priceB2C) || Number(product.priceB2C) || Number(product.priceBase) || 0,
        priceB2B: Number(variant.priceB2B) || Number(product.priceB2B) || Number(product.priceBase) || 0,
        stock: Math.max(0, Number(variant.stock ?? product.stockPolos ?? 0) || 0),
        variantId: variant._id || '',
        sourceProductId: product._id,
        material: product.material || '',
        imageUrl: product.images?.[0]?.url || ''
      };

      const familyName = inferFamilyName(product, normalizedVariant);
      const catalogKey = `${product.category || 'Lain Lain'}::${familyName}`;

      if (!catalogMap.has(catalogKey)) {
        catalogMap.set(catalogKey, createCatalogGroup(product, normalizedVariant, familyName));
      }

      const group = catalogMap.get(catalogKey);
      const existingVariantIndex = group.variants.findIndex((item) =>
        normalizeWhitespace(item.size).toLowerCase() === normalizedVariant.size.toLowerCase()
        && normalizeWhitespace(item.color).toLowerCase() === normalizedVariant.color.toLowerCase()
      );

      if (existingVariantIndex >= 0) {
        const existingVariant = group.variants[existingVariantIndex];
        const mergedStock = existingVariant.stock + normalizedVariant.stock;

        group.variants[existingVariantIndex] = {
          ...existingVariant,
          stock: mergedStock,
          priceB2C: Math.min(existingVariant.priceB2C, normalizedVariant.priceB2C),
          priceB2B: Math.min(existingVariant.priceB2B, normalizedVariant.priceB2B)
        };
      } else {
        group.variants.push(normalizedVariant);
      }

      if (!group.images?.length && product.images?.length) {
        group.images = product.images;
      }

      if (product.description && !group.description) {
        group.description = product.description;
      }

      if (product.addons?.valvePrice && !group.addons?.valvePrice) {
        group.addons = product.addons;
      }

      group.minOrder = Math.max(group.minOrder || 100, product.minOrder || 100);
      group._materials.add(normalizeWhitespace(product.material));
      group._sizes.add(normalizedVariant.size);
      group._colors.add(normalizedVariant.color);
      group._startingPriceB2C = Math.min(group._startingPriceB2C, normalizedVariant.priceB2C || group._startingPriceB2C);
      group._startingPriceB2B = Math.min(group._startingPriceB2B, normalizedVariant.priceB2B || group._startingPriceB2B);
      group._totalStock += normalizedVariant.stock;
    });
  });

  return Array.from(catalogMap.values())
    .map((group) => ({
      ...group,
      materialLabel: group._materials.size <= 1
        ? (Array.from(group._materials)[0] || group.materialLabel)
        : `${group._materials.size} material`,
      availableSizes: Array.from(group._sizes).sort(compareVariantSizes),
      availableColors: Array.from(group._colors).sort((left, right) => left.localeCompare(right, 'id')),
      priceB2C: group._startingPriceB2C,
      priceB2B: group._startingPriceB2B,
      stockPolos: group._totalStock,
      variants: [...group.variants].sort((left, right) => {
        const sizeComparison = compareVariantSizes(left.size, right.size);
        if (sizeComparison !== 0) return sizeComparison;
        return left.color.localeCompare(right.color, 'id');
      })
    }))
    .sort((left, right) => {
      const categoryComparison = left.category.localeCompare(right.category, 'id');
      if (categoryComparison !== 0) return categoryComparison;
      return left.name.localeCompare(right.name, 'id');
    });
};
