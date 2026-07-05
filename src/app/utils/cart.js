const CART_STORAGE_KEY = 'ukm_cart_items';
const CART_EVENT = 'ukm-cart-updated';

export const getCartItems = () => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setCartItems = (items = []) => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: items }));
};

export const subscribeCart = (listener) => {
  const handler = () => listener(getCartItems());
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};

export const getCartCount = () => getCartItems().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

export const removeCartItem = (matcher) => {
  const nextItems = getCartItems().filter((item) => !matcher(item));
  setCartItems(nextItems);
  return nextItems;
};

export const clearCart = () => {
  setCartItems([]);
};

export const updateCartItem = (matcher, updates) => {
  const items = getCartItems();
  const idx = items.findIndex(matcher);
  if (idx === -1) return items;
  items[idx] = { ...items[idx], ...updates };
  setCartItems(items);
  return items;
};

export const upsertCartItem = (cartItem) => {
  const existingCart = getCartItems();
  const existingItemIndex = existingCart.findIndex((item) =>
    item.productId === cartItem.productId
    && item.variantId === cartItem.variantId
    && item.useValve === cartItem.useValve
  );

  if (existingItemIndex >= 0) {
    const nextQuantity = (Number(existingCart[existingItemIndex].quantity) || 0) + (Number(cartItem.quantity) || 0);
    existingCart[existingItemIndex] = {
      ...existingCart[existingItemIndex],
      quantity: nextQuantity,
      totalPrice: nextQuantity * (Number(cartItem.unitPrice) || 0)
    };
  } else {
    existingCart.push({ ...cartItem, selected: true });
  }

  setCartItems(existingCart);
  return existingCart;
};

export const toggleCartSelection = (index) => {
  const items = getCartItems();
  if (items[index]) {
    items[index].selected = !items[index].selected;
    setCartItems(items);
  }
  return items;
};

export const selectAllCartItems = (selected = true) => {
  const items = getCartItems().map((item) => ({ ...item, selected }));
  setCartItems(items);
  return items;
};

export const getSelectedCartItems = () => {
  return getCartItems().filter((item) => item.selected !== false);
};

export const getSelectedCount = () => {
  return getSelectedCartItems().length;
};

export const getSelectedTotal = () => {
  return getSelectedCartItems().reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
};

export const getSelectedQuantity = () => {
  return getSelectedCartItems().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
};

export const isAllSelected = () => {
  const items = getCartItems();
  return items.length > 0 && items.every((item) => item.selected !== false);
};

export { CART_STORAGE_KEY, CART_EVENT };
