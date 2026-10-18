(function initProductsPage() {
  'use strict';

  const data = window.PCAstral.data;
  const utils = window.PCAstral.utils;
  const ui = window.PCAstral.ui;
  const form = document.getElementById('filters');
  const sortField = document.getElementById('sort');
  const brands = [...new Set(data.products.map(product => product.brand))].sort();
  const allowedValues = {
    category: ['', ...data.categories.map(category => category.id)],
    brand: ['', ...brands],
    group: ['', 'new', 'hot', 'sale'],
    price: Object.keys(utils.priceRanges),
    sort: ['default', 'price-asc', 'price-desc', 'name'],
  };

  function createFilterOptions() {
    const categories = document.getElementById('filter-category');
    const brandField = document.getElementById('filter-brand');
    categories.replaceChildren(new Option('Tất cả danh mục', ''));
    brandField.replaceChildren(new Option('Tất cả thương hiệu', ''));
    data.categories.forEach(function addCategory(category) {
      categories.add(new Option(category.name, category.id));
    });
    brands.forEach(function addBrand(brand) {
      brandField.add(new Option(brand, brand));
    });
  }

  function readURLState() {
    const params = new URLSearchParams(location.search);
    const state = { q: (params.get('q') || '').slice(0, 100) };
    for (const key of Object.keys(allowedValues)) {
      const value = params.get(key);
      const allowed = allowedValues[key];
      state[key] = allowed.includes(value) ? value : allowed[0];
    }
    return state;
  }

  function syncURL(state) {
    const params = new URLSearchParams();
    for (const key of Object.keys(state)) {
      const value = state[key];
      if (value && value !== 'all' && value !== 'default') params.set(key, value);
    }
    const query = params.toString();
    const url = location.pathname + (query ? '?' + query : '');
    history.replaceState(null, '', url);
  }

  function renderProductList() {
    const state = Object.fromEntries(new FormData(form));
    state.sort = sortField.value;
    const products = utils.selectProducts(state);
    const category = data.categories.find(item => item.id === state.category);
    const groupTitles = { new: 'Sản phẩm mới', hot: 'Sản phẩm hot', sale: 'Sản phẩm khuyến mãi' };
    let title = groupTitles[state.group] || 'Tìm đúng chất riêng của bạn.';
    if (category) title = category.name;

    syncURL(state);
    ui.renderGrid(document.getElementById('products-grid'), products);
    document.getElementById('result-count').textContent = products.length + ' sản phẩm';
    document.getElementById('catalog-title').textContent = title;
    document.getElementById('query-description').textContent = state.q
      ? 'Kết quả tìm kiếm cho “' + state.q + '”'
      : 'Cấu hình phù hợp, trải nghiệm trọn vẹn.';
  }

  function restoreFilters() {
    const state = readURLState();
    for (const key of Object.keys(state)) {
      const field = key === 'sort' ? sortField : form.elements.namedItem(key);
      if (field) field.value = state[key];
    }
    renderProductList();
  }

  function clearFilters() {
    form.reset();
    sortField.value = 'default';
    document.getElementById('header-q').value = '';
    renderProductList();
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    renderProductList();
  }

  function toggleFilters(event) {
    const button = event.currentTarget;
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    form.classList.toggle('open', open);
  }

  ui.initCommon();
  createFilterOptions();
  form.addEventListener('submit', handleFilterSubmit);
  form.addEventListener('change', renderProductList);
  sortField.addEventListener('change', renderProductList);
  document.getElementById('clear-filters').addEventListener('click', clearFilters);
  document.getElementById('filter-toggle').addEventListener('click', toggleFilters);
  window.addEventListener('popstate', restoreFilters);
  window.addEventListener('promotion-expired', renderProductList);
  restoreFilters();
})();
