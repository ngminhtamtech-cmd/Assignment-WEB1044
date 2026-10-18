(function setupStorage() {
  'use strict';

  const CART_KEY = 'pc-astral.cart.v1';
  const ORDER_KEY = 'pc-astral.last-order.v1';
  let notice = '';

  function storageNotice() {
    return notice;
  }

  function warn(message) {
    notice = message;
    window.dispatchEvent(new CustomEvent('storage-warning', { detail: message }));
  }

  // Truy cập storage cũng có thể ném lỗi, nên đặt cả getItem/setItem trong try/catch.
  function readJSON(key, fallback, session = false) {
    let raw;
    try {
      const storage = session ? window.sessionStorage : window.localStorage;
      raw = storage.getItem(key);
    } catch {
      warn('Trình duyệt đang chặn lưu trữ. Giỏ chỉ được giữ trong trang hiện tại và có thể mất khi chuyển trang.');
      return fallback;
    }
    if (raw === null) return fallback;

    try {
      return JSON.parse(raw);
    } catch {
      warn('Dữ liệu lưu trước đó không hợp lệ. Website đã dùng dữ liệu mặc định.');
      return fallback;
    }
  }

  function writeJSON(key, value, session = false) {
    try {
      const storage = session ? window.sessionStorage : window.localStorage;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      warn('Không lưu được dữ liệu. Hãy cho phép lưu trữ trình duyệt hoặc giải phóng dung lượng rồi thử lại.');
      return false;
    }
  }

  window.PCAstral.storage = { CART_KEY, ORDER_KEY, storageNotice, readJSON, writeJSON };
})();
