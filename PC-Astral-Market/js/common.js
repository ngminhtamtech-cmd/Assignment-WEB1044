(function setupCommonUI() {
  'use strict';

  const { categories, promotion } = window.PCAstral.data;
  const { money, isSale, currentPrice, escapeHTML: esc } = window.PCAstral.utils;
  const cart = window.PCAstral.cart;
  const storage = window.PCAstral.storage;
  let toastTimer;
  let initialized = false;

  // Giao diện dùng chung: chỉnh header/footer/thẻ ở đây để áp dụng cho mọi trang.
  function renderHeader() {
    const page = document.body.dataset.page;
    const activeHome = page === 'home' ? 'aria-current="page"' : '';
    const activeProducts = page === 'products' ? 'aria-current="page"' : '';
    const activeAbout = page === 'about' ? 'aria-current="page"' : '';
    const categoryLinks = categories.map(function categoryLink(category) {
      return `<a href="products.html?category=${category.id}">${esc(category.name)}</a>`;
    }).join('');
    document.getElementById('site-header').innerHTML = `
      <div class="topbar">
        <div class="container">
          <span>Một góc máy tốt. Ngàn ý tưởng mới.</span>
          <span>PC-Astral Market · Cửa hàng mô phỏng</span>
        </div>
      </div>
      <div class="header-main container">
        <a class="brand" href="index.html" aria-label="PC-Astral Market - Trang chủ">
          <span>PC-ASTRAL<small>MARKET</small></span>
        </a>
        <form class="header-search" action="products.html" role="search">
          <label class="sr-only" for="header-q">Tìm kiếm sản phẩm</label>
          <input id="header-q" name="q" type="search" placeholder="Bạn đang tìm gì cho góc máy của mình?" maxlength="100">
          <button aria-label="Tìm kiếm">Tìm kiếm</button>
        </form>
        <a class="cart-link" href="cart.html">
          <span>Giỏ hàng</span>
          <b data-cart-count>0</b>
        </a>
        <button id="menu-toggle" class="control-button menu-toggle" aria-label="Mở menu" aria-expanded="false" aria-controls="main-nav">Menu</button>
      </div>
      <nav id="main-nav" class="main-nav" aria-label="Điều hướng chính">
        <div class="container">
          <a href="index.html" ${activeHome}>Trang chủ</a>
          <a href="products.html" ${activeProducts}>Tất cả sản phẩm</a>
          ${categoryLinks}
          <a href="about.html" ${activeAbout}>Về Astral</a>
          <a class="nav-sale" href="products.html?group=sale">Ưu đãi tháng 10 </a>
        </div>
      </nav>`;
  }

  function renderFooter() {
    document.getElementById('site-footer').innerHTML = `
      <div class="container footer-grid">
        <div>
          <a class="brand" href="index.html">
            <span>PC-ASTRAL<small>MARKET</small></span>
          </a>
          <p>Công nghệ phù hợp.<br>Cảm hứng mỗi ngày.</p>
        </div>
        <div>
          <h3>Khám phá</h3>
          <a href="products.html">Tất cả sản phẩm</a>
          <a href="products.html?group=new">Sản phẩm mới</a>
          <a href="products.html?group=sale">Ưu đãi hôm nay</a>
        </div>
        <div>
          <h3>Đồng hành cùng bạn</h3>
          <a href="about.html#policies">Chính sách mua hàng</a>
          <a href="about.html#contact">Thông tin liên hệ</a>
          <a href="cart.html">Giỏ hàng của bạn</a>
        </div>
        <div>
          <h3>Về dự án</h3>
          <p>Website học tập môn WEB1044.<br>Ảnh và cấu hình tham khảo từ<br>
            <a href="https://pcmarket.vn/" target="_blank" rel="noopener noreferrer">PC Market</a>. Đặt hàng mô phỏng.</p>
          <span class="footer-tag">HTML / CSS / JAVASCRIPT</span>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© 2026 PC-Astral Market</span>
        <span>Thiết kế cho những khởi đầu mới</span>
      </div>`;
  }

  function createProductCard(product) {
    const sale = isSale(product);
    let badge;
    if (!product.stock) {
      badge = '<span class="badge muted">Hết hàng</span>';
    } else if (sale) {
      const discount = Math.round((1 - product.salePrice / product.price) * 100);
      badge = `<span class="badge sale">−${discount}%</span>`;
    } else if (product.isNew) {
      badge = '<span class="badge">Mới về</span>';
    } else {
      badge = '<span class="badge warm">Yêu thích</span>';
    }
    const originalPrice = sale ? `<del>${money(product.price)}</del>` : '';
    const disabled = product.stock ? '' : 'disabled';
    return `
      <article class="product-card">
        <div class="product-visual">
          ${badge}
          <a href="product-detail.html?id=${product.id}" tabindex="-1" aria-hidden="true">
            <img src="${product.image}" alt="" loading="lazy" width="520" height="370">
          </a>
        </div>
        <div class="product-info">
          <span class="product-brand">${esc(product.brand)}</span>
          <h3><a href="product-detail.html?id=${product.id}">${esc(product.name)}</a></h3>
          <p class="product-spec">${esc(product.summary)}</p>
          <div class="price-line">
            <strong>${money(currentPrice(product))}</strong>
            ${originalPrice}
          </div>
          <div class="product-actions">
            <a href="product-detail.html?id=${product.id}">Xem chi tiết </a>
            <button class="control-button add-cart" data-add="${product.id}" aria-label="Thêm ${esc(product.name)} vào giỏ" ${disabled}>Thêm giỏ</button>
          </div>
        </div>
      </article>`.replace(/>\s+</g, '><'); // Bỏ khoảng trắng tạo dòng thừa trong liên kết bao ảnh.
  }

  function emptyState(title, description, href = 'products.html', action = 'Khám phá sản phẩm') {
    return `
      <div class="empty-state">
        <h2>${esc(title)}</h2>
        <p>${esc(description)}</p>
        <a class="button" href="${esc(href)}">${esc(action)} </a>
      </div>`;
  }

  function renderGrid(target, products) {
    if (!products.length) {
      target.innerHTML = emptyState('Chưa tìm thấy sản phẩm', 'Thử một từ khóa khác hoặc bỏ bớt điều kiện lọc.');
      return;
    }
    target.innerHTML = products.map(createProductCard).join('');
  }

  function toast(message) {
    const target = document.getElementById('toast');
    target.textContent = message;
    target.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function hideToast() {
      target.classList.remove('visible');
    }, 4200);
  }

  function updateBadge() {
    const quantity = cart.getTotals().quantity;
    document.querySelectorAll('[data-cart-count]').forEach(function updateCount(element) {
      element.textContent = quantity;
    });
  }

  function showStorageWarning(message) {
    const element = document.getElementById('storage-warning');
    element.hidden = false;
    element.textContent = message;
  }

  function toggleMenu(event) {
    const button = event.currentTarget;
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    document.getElementById('main-nav').classList.toggle('open', open);
  }

  function handleAddToCart(event) {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    let quantity = 1;
    if (button.dataset.quantityInput) {
      quantity = Number(document.getElementById(button.dataset.quantityInput).value);
    }
    const result = cart.addItem(button.dataset.add, quantity);
    if (!result.ok) {
      toast(result.message);
    } else if (!result.persisted) {
      toast('Đã thêm vào giỏ tạm thời, nhưng chưa lưu được dữ liệu.');
    } else {
      toast('Đã thêm sản phẩm vào giỏ hàng.');
    }
  }

  function handleImageError(event) {
    const image = event.target;
    if (image.tagName !== 'IMG' || image.dataset.fallback) return;
    image.dataset.fallback = 'true';
    image.hidden = true;
    const fallback = document.createElement('span');
    fallback.className = 'image-fallback';
    fallback.textContent = 'Ảnh đang cập nhật';
    image.after(fallback);
  }

  function watchPromotion() {
    const deadline = Date.parse(promotion.endsAt);
    let wasActive = Date.now() < deadline;
    let timer;

    function checkPromotion() {
      if (!wasActive || Date.now() < deadline) return;
      wasActive = false;
      clearInterval(timer);
      window.dispatchEvent(new CustomEvent('promotion-expired'));
      toast('Chương trình đã kết thúc. Giá sản phẩm đã được cập nhật.');
    }

    if (wasActive) timer = setInterval(checkPromotion, 1000);
    document.addEventListener('visibilitychange', checkPromotion);
    window.addEventListener('focus', checkPromotion);
  }

  function initCommon() {
    if (initialized) return;
    initialized = true;
    renderHeader();
    renderFooter();
    const notification = document.createElement('div');
    notification.id = 'toast';
    notification.className = 'toast';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    document.body.append(notification);

    const query = new URLSearchParams(location.search).get('q');
    if (query) document.getElementById('header-q').value = query;
    document.getElementById('menu-toggle').addEventListener('click', toggleMenu);
    document.addEventListener('click', handleAddToCart);
    document.addEventListener('error', handleImageError, true);
    window.addEventListener('cart-changed', updateBadge);
    window.addEventListener('storage-warning', function handleWarning(event) {
      showStorageWarning(event.detail);
    });
    if (storage.storageNotice()) showStorageWarning(storage.storageNotice());
    updateBadge();
    watchPromotion();
  }

  window.PCAstral.ui = { initCommon, renderGrid, emptyState, toast };
})();
