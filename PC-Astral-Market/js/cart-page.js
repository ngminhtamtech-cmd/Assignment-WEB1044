(function initCartPage() {
  'use strict';

  const cart = window.PCAstral.cart;
  const utils = window.PCAstral.utils;
  const ui = window.PCAstral.ui;
  const container = document.getElementById('cart-rows');
  const template = document.getElementById('cart-row-template');
  let rendering = false;

  function updateCartRow(row, line) {
    const product = line.product;
    const detailURL = 'product-detail.html?id=' + product.id;
    row.dataset.productId = product.id;
    row.querySelectorAll('a').forEach(link => { link.href = detailURL; });
    const image = row.querySelector('img');
    // Không gán lại src khi chỉ đổi số lượng để giữ trạng thái ảnh dự phòng.
    if (image.getAttribute('src') !== product.image) image.src = product.image;
    image.alt = product.imageAlt;
    row.querySelector('h3').textContent = product.name;
    row.querySelector('.cart-name > span').textContent = utils.money(line.unitPrice);
    row.querySelector('.cart-subtotal').textContent = utils.money(line.subtotal);
    row.querySelector('[data-remove]').dataset.remove = product.id;

    const input = row.querySelector('[data-quantity]');
    input.dataset.quantity = product.id;
    input.value = line.quantity;
    input.max = product.stock;
    input.setAttribute('aria-label', 'Số lượng ' + product.name);
    const decrease = row.querySelector('[data-step="-1"]');
    const increase = row.querySelector('[data-step="1"]');
    decrease.dataset.id = product.id;
    increase.dataset.id = product.id;
    decrease.disabled = line.quantity === 1;
    increase.disabled = line.quantity === product.stock;
    decrease.setAttribute('aria-label', 'Giảm số lượng ' + product.name);
    increase.setAttribute('aria-label', 'Tăng số lượng ' + product.name);
  }

  function renderCart() {
    if (rendering) return;
    rendering = true;
    try {
      const totals = cart.getTotals();
      document.getElementById('cart-subtitle').textContent = totals.quantity + ' sản phẩm đang chờ cùng bạn về nhà.';
      document.getElementById('cart-empty').hidden = totals.lines.length > 0;
      document.getElementById('cart-layout').hidden = totals.lines.length === 0;
      document.getElementById('cart-kind-count').textContent = totals.lines.length + ' loại sản phẩm';
      document.getElementById('cart-subtotal').textContent = utils.money(totals.total);
      document.getElementById('cart-total').textContent = utils.money(totals.total);

      // Giữ lại input của dòng còn tồn tại, tránh thay cả DOM gây vòng change/blur.
      for (const row of [...container.children]) {
        if (!totals.lines.some(line => line.productId === row.dataset.productId)) row.remove();
      }
      for (const line of totals.lines) {
        let row = [...container.children].find(element => element.dataset.productId === line.productId);
        if (!row) {
          row = template.content.firstElementChild.cloneNode(true);
          updateCartRow(row, line);
          container.append(row);
        } else {
          updateCartRow(row, line);
        }
      }
    } finally {
      rendering = false;
    }
  }

  function handleCartClick(event) {
    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) {
      cart.removeItem(removeButton.dataset.remove);
      ui.toast('Đã xóa sản phẩm khỏi giỏ.');
      return;
    }
    const stepButton = event.target.closest('[data-step]');
    if (!stepButton) return;
    const line = cart.getCart().find(item => item.productId === stepButton.dataset.id);
    if (line) cart.updateQuantity(line.productId, line.quantity + Number(stepButton.dataset.step));
  }

  function handleQuantityChange(event) {
    if (rendering || !event.target.matches('[data-quantity]')) return;
    const input = event.target;
    const updated = cart.updateQuantity(input.dataset.quantity, Number(input.value));
    if (!updated) {
      ui.toast('Số lượng phải là số nguyên từ 1 đến số lượng còn hàng.');
      renderCart();
    }
  }

  ui.initCommon();
  container.addEventListener('click', handleCartClick);
  container.addEventListener('change', handleQuantityChange);
  window.addEventListener('cart-changed', renderCart);
  window.addEventListener('promotion-expired', renderCart);
  renderCart();
})();
