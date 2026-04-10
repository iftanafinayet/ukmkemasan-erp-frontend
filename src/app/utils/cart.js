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
    existingCart.push(cartItem);
  }

  setCartItems(existingCart);
  return existingCart;
};

export { CART_STORAGE_KEY, CART_EVENT };
