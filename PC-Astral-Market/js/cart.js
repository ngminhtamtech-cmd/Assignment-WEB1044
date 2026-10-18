(function setupCart() {
  'use strict';

  const utils = window.PCAstral.utils;
  const storage = window.PCAstral.storage;
  let items = sanitizeCart(storage.readJSON(storage.CART_KEY, []));

  // Storage có thể bị sửa: bỏ dòng sai, gộp ID trùng và giới hạn tồn kho.
  function sanitizeCart(raw) {
    if (!Array.isArray(raw)) return [];
    const result = [];

    for (const row of raw) {
      if (!row || typeof row !== 'object') continue;
      const product = utils.findProduct(row.productId);
      if (!product || product.stock < 1) continue;
      if (!Number.isSafeInteger(row.quantity) || row.quantity < 1) continue;

      const existing = result.find(item => item.productId === product.id);
      if (existing) {
        existing.quantity = Math.min(product.stock, existing.quantity + row.quantity);
      } else {
        result.push({ productId: product.id, quantity: Math.min(product.stock, row.quantity) });
      }
    }
    return result;
  }

  function getCart() {
    return items.map(item => ({ ...item }));
  }

  function notifyCartChanged() {
    window.dispatchEvent(new CustomEvent('cart-changed'));
  }

  function saveCart() {
    const persisted = storage.writeJSON(storage.CART_KEY, items);
    notifyCartChanged();
    return persisted;
  }

  function addItem(id, quantity = 1) {
    const product = utils.findProduct(id);
    const existing = items.find(item => item.productId === id);
    const oldQuantity = existing ? existing.quantity : 0;
    const validQuantity = Number.isInteger(quantity) && quantity >= 1;

    if (!product || !validQuantity || oldQuantity + quantity > product.stock) {
      return { ok: false, message: 'Số lượng vượt quá tồn kho hoặc không hợp lệ.' };
    }
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId: id, quantity });
    }
    return { ok: true, persisted: saveCart() };
  }

  function updateQuantity(id, quantity) {
    const product = utils.findProduct(id);
    const existing = items.find(item => item.productId === id);
    if (!product || !existing || !Number.isInteger(quantity)) return false;
    if (quantity < 1 || quantity > product.stock) return false;

    existing.quantity = quantity;
    saveCart();
    return true;
  }

  function removeItem(id) {
    items = items.filter(item => item.productId !== id);
    return saveCart();
  }

  function clearCart() {
    items = [];
    return saveCart();
  }

  // Cùng một timestamp giúp mọi dòng giỏ dùng giá nhất quán lúc hết khuyến mãi.
  function getTotals(now = Date.now()) {
    const lines = items.map(function createCartLine(item) {
      const product = utils.findProduct(item.productId);
      const unitPrice = utils.currentPrice(product, now);
      return {
        ...item,
        product,
        unitPrice,
        subtotal: unitPrice * item.quantity,
      };
    });
    const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    return { lines, quantity, total, shipping: 0 };
  }

  function handleStorageChange(event) {
    if (event.key !== storage.CART_KEY && event.key !== null) return;
    items = sanitizeCart(storage.readJSON(storage.CART_KEY, []));
    notifyCartChanged();
  }

  window.PCAstral.cart = {
    sanitizeCart, getCart, addItem, updateQuantity, removeItem, clearCart, getTotals,
  };
  window.addEventListener('storage', handleStorageChange);
})();
