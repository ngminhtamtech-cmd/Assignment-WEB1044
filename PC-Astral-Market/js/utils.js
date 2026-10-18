// Hàm bao giữ biến riêng trong file; các hàm cuối file được chia sẻ qua PCAstral.
(function setupUtilities() {
  'use strict';

  const data = window.PCAstral.data;
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
  const priceRanges = {
    all: [0, Infinity],
    under5: [0, 5000000],
    '5to15': [5000000, 15000000],
    '15to30': [15000000, 30000000],
    above30: [30000000, Infinity],
  };

  function money(value) {
    return currencyFormatter.format(value);
  }

  function normalize(value) {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .trim();
  }

  function findProduct(id) {
    return data.products.find(product => product.id === id);
  }

  function isSale(product, now = Date.now()) {
    const belongsToPromotion = product.promotionId === data.promotion.id;
    const hasSalePrice = Number.isFinite(product.salePrice);
    const promotionIsActive = now < Date.parse(data.promotion.endsAt);
    return belongsToPromotion && hasSalePrice && promotionIsActive;
  }

  function currentPrice(product, now = Date.now()) {
    if (isSale(product, now)) return product.salePrice;
    return product.price;
  }

  function escapeHTML(value) {
    const entities = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    };
    return String(value).replace(/[&<>"']/g, character => entities[character]);
  }

  function matchesGroup(product, group, now) {
    if (!group) return true;
    if (group === 'new') return product.isNew;
    if (group === 'hot') return product.isHot;
    if (group === 'sale') return isSale(product, now);
    return false;
  }

  // filter tạo mảng mới: sort kết quả không đổi thứ tự sản phẩm trong data.js.
  function selectProducts(filters = {}, now = Date.now()) {
    const keyword = normalize(filters.q || '');
    const range = priceRanges[filters.price] || priceRanges.all;
    const result = data.products.filter(function matchesFilters(product) {
      const searchableText = normalize(product.name + ' ' + product.brand);
      const price = currentPrice(product, now);
      if (!searchableText.includes(keyword)) return false;
      if (filters.category && product.categoryId !== filters.category) return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (!matchesGroup(product, filters.group, now)) return false;
      return price >= range[0] && price < range[1];
    });

    if (filters.sort === 'price-asc') {
      result.sort((first, second) => currentPrice(first, now) - currentPrice(second, now));
    } else if (filters.sort === 'price-desc') {
      result.sort((first, second) => currentPrice(second, now) - currentPrice(first, now));
    } else if (filters.sort === 'name') {
      result.sort((first, second) => first.name.localeCompare(second.name, 'vi'));
    }
    return result;
  }

  function validateCustomer(values) {
    const customer = {};
    const errors = {};
    const requiredFields = {
      name: 'họ tên', email: 'email', phone: 'số điện thoại', address: 'địa chỉ',
    };

    for (const key of Object.keys(values)) {
      customer[key] = String(values[key]).trim();
    }
    customer.phone = (customer.phone || '').replace(/[\s().-]/g, '').replace(/^\+84/, '0');

    for (const key of Object.keys(requiredFields)) {
      if (!customer[key]) errors[key] = 'Vui lòng nhập ' + requiredFields[key] + '.';
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.email = 'Email chưa đúng định dạng, ví dụ ten@email.com.';
    }
    if (customer.phone && !/^0\d{9}$/.test(customer.phone)) {
      errors.phone = 'Nhập 10 chữ số bắt đầu bằng 0 hoặc dạng +84 tương ứng.';
    }
    return { data: customer, errors };
  }

  window.PCAstral.utils = {
    money, normalize, findProduct, isSale, currentPrice, escapeHTML,
    priceRanges, selectProducts, validateCustomer,
  };
})();
