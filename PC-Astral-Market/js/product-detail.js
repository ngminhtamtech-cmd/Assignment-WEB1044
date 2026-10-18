(function initProductDetailPage() {
  'use strict';

  const data = window.PCAstral.data;
  const utils = window.PCAstral.utils;
  const ui = window.PCAstral.ui;
  const productId = new URLSearchParams(location.search).get('id');
  const product = utils.findProduct(productId);

  function renderPrice() {
    const sale = utils.isSale(product);
    document.getElementById('detail-current-price').textContent = utils.money(utils.currentPrice(product));
    const originalPrice = document.getElementById('detail-original-price');
    originalPrice.textContent = utils.money(product.price);
    originalPrice.hidden = !sale;
    document.getElementById('detail-sale-badge').hidden = !sale;
  }

  function renderSpecifications() {
    const list = document.getElementById('detail-specs');
    const specifications = { ...product.specs, 'Mã sản phẩm': product.id.toUpperCase() };
    for (const label of Object.keys(specifications)) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = specifications[label];
      row.append(term, description);
      list.append(row);
    }
  }

  function renderRelatedProducts() {
    const related = utils.selectProducts({ category: product.categoryId })
      .filter(item => item.id !== product.id)
      .slice(0, 4);
    ui.renderGrid(document.getElementById('related-grid'), related);
  }

  function renderProduct() {
    const category = data.categories.find(item => item.id === product.categoryId);
    const categoryURL = 'products.html?category=' + category.id;
    document.title = product.name + ' | PC-Astral Market';
    document.getElementById('detail-view').hidden = false;
    document.getElementById('detail-category-link').href = categoryURL;
    document.getElementById('detail-category-link').textContent = category.name;
    document.getElementById('related-category-link').href = categoryURL;
    document.getElementById('detail-breadcrumb-name').textContent = product.name;
    document.getElementById('detail-code').textContent = 'ASTRAL SELECTED / ' + product.id.toUpperCase();
    document.getElementById('detail-brand-category').textContent = product.brand + ' / ' + category.name;
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-summary').textContent = product.summary;
    document.getElementById('detail-description').textContent = product.description;
    document.getElementById('detail-source').href = product.sourceUrl;

    const image = document.getElementById('detail-photo');
    image.src = product.image;
    image.alt = product.imageAlt;
    const stock = document.getElementById('detail-stock');
    stock.textContent = product.stock ? 'Còn ' + product.stock + ' sản phẩm' : 'Tạm hết hàng';
    stock.classList.toggle('out', !product.stock);
    const quantity = document.getElementById('detail-quantity');
    quantity.max = product.stock || 1;
    quantity.disabled = !product.stock;
    const button = document.getElementById('detail-add');
    button.dataset.add = product.id;
    button.disabled = !product.stock;
    renderPrice();
    renderSpecifications();
    renderRelatedProducts();
  }

  function handlePromotionExpired() {
    // Cập nhật riêng giá, giữ số lượng đang nhập và focus của người dùng.
    renderPrice();
    renderRelatedProducts();
  }

  ui.initCommon();
  if (!product) {
    document.getElementById('detail-empty').hidden = false;
    return;
  }
  renderProduct();
  window.addEventListener('promotion-expired', handlePromotionExpired);
})();
