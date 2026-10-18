(function initCheckoutPage() {
  'use strict';

  const cart = window.PCAstral.cart;
  const storage = window.PCAstral.storage;
  const utils = window.PCAstral.utils;
  const ui = window.PCAstral.ui;
  const form = document.getElementById('checkout-form');
  const submitButton = document.getElementById('place-order');
  let submitting = false;
  let displayedTotal = 0;
  let confirmedOrder = null;

  function validOrder(order) {
    if (!order || typeof order.id !== 'string') return false;
    if (typeof order.createdAt !== 'string' || !Number.isFinite(Date.parse(order.createdAt))) return false;
    if (!order.customer || typeof order.customer.name !== 'string') return false;
    if (!Array.isArray(order.lines) || order.lines.length === 0) return false;

    let expectedTotal = 0;
    for (const line of order.lines) {
      if (!line || typeof line.name !== 'string') return false;
      if (!Number.isInteger(line.quantity) || line.quantity < 1) return false;
      if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) return false;
      expectedTotal += line.quantity * line.unitPrice;
    }
    return Number.isFinite(order.total) && order.total === expectedTotal;
  }

  function readConfirmedOrder() {
    const orderId = new URLSearchParams(location.search).get('order');
    if (!orderId) return null;
    const order = storage.readJSON(storage.ORDER_KEY, null, true);
    if (!validOrder(order) || order.id !== orderId) return null;
    return order;
  }

  function showConfirmation(order) {
    confirmedOrder = order;
    document.getElementById('checkout-heading').hidden = true;
    document.getElementById('checkout-layout').hidden = true;
    document.getElementById('checkout-empty').hidden = true;
    document.getElementById('order-confirmation').hidden = false;
    document.getElementById('confirmation-customer').textContent = order.customer.name;
    document.getElementById('confirmation-id').textContent = order.id;
    document.getElementById('confirmation-time').textContent = new Date(order.createdAt).toLocaleString('vi-VN');
    document.getElementById('confirmation-payment').textContent = 'COD mô phỏng';
    document.getElementById('confirmation-total').textContent = utils.money(order.total);

    const list = document.getElementById('confirmation-lines');
    const totalRow = list.querySelector('.summary-total');
    const template = document.getElementById('confirmation-line-template');
    list.querySelectorAll('[data-confirmed-line]').forEach(line => line.remove());
    for (const item of order.lines) {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector('span').textContent = item.name + ' × ' + item.quantity;
      row.querySelector('b').textContent = utils.money(item.unitPrice * item.quantity);
      list.insertBefore(row, totalRow);
    }
  }

  function renderSummary() {
    const totals = cart.getTotals();
    displayedTotal = totals.total;
    document.getElementById('checkout-subtotal').textContent = utils.money(totals.total);
    document.getElementById('checkout-total').textContent = utils.money(totals.total);
    const container = document.getElementById('checkout-lines');
    const template = document.getElementById('checkout-line-template');
    container.replaceChildren();
    for (const line of totals.lines) {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector('[data-line-name]').textContent = line.product.name;
      row.querySelector('[data-line-quantity]').textContent = '× ' + line.quantity;
      row.querySelector('[data-line-total]').textContent = utils.money(line.subtotal);
      container.append(row);
    }
  }

  function renderCheckout() {
    if (confirmedOrder) return;
    const empty = cart.getCart().length === 0;
    document.getElementById('checkout-empty').hidden = !empty;
    document.getElementById('checkout-layout').hidden = empty;
    // Không dựng lại form: giữ nguyên dữ liệu và focus khi giá hoặc giỏ thay đổi.
    renderSummary();
  }

  function showFieldErrors(errors) {
    for (const key of ['name', 'email', 'phone', 'address']) {
      document.getElementById(key + '-error').textContent = errors[key] || '';
      form.elements[key].setAttribute('aria-invalid', String(Boolean(errors[key])));
    }
    const firstField = Object.keys(errors)[0];
    if (firstField) form.elements[firstField].focus();
    return Boolean(firstField);
  }

  function createOrder(customer, totals) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const lines = totals.lines.map(function snapshotLine(line) {
      return {
        productId: line.productId,
        name: line.product.name,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      };
    });
    return {
      id: 'AST-' + timestamp + '-' + suffix,
      createdAt: new Date().toISOString(),
      customer,
      lines,
      total: totals.total,
      shipping: 0,
      payment: 'COD demo',
    };
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    if (submitting || confirmedOrder) return;
    const values = Object.fromEntries(new FormData(form));
    const validation = utils.validateCustomer(values);
    if (showFieldErrors(validation.errors)) return;

    const totals = cart.getTotals();
    if (!totals.lines.length) {
      ui.toast('Giỏ hàng đã trống. Vui lòng chọn lại sản phẩm.');
      renderCheckout();
      return;
    }
    if (totals.total !== displayedTotal) {
      renderSummary();
      ui.toast('Giá vừa thay đổi. Vui lòng xem lại tổng tiền và xác nhận lần nữa.');
      return;
    }

    submitting = true;
    submitButton.disabled = true;
    const order = createOrder(validation.data, totals);
    // Chỉ xóa giỏ sau khi lưu được đơn để lỗi storage không làm mất lựa chọn.
    if (!storage.writeJSON(storage.ORDER_KEY, order, true)) {
      submitting = false;
      submitButton.disabled = false;
      ui.toast('Chưa lưu được đơn hàng. Giỏ hàng vẫn được giữ để bạn thử lại.');
      return;
    }
    cart.clearCart();
    history.replaceState(null, '', 'checkout.html?order=' + encodeURIComponent(order.id));
    showConfirmation(order);
  }

  function handleCartChanged() {
    if (!submitting) renderCheckout();
  }

  ui.initCommon();
  form.addEventListener('submit', handleCheckoutSubmit);
  window.addEventListener('promotion-expired', renderCheckout);
  window.addEventListener('cart-changed', handleCartChanged);
  confirmedOrder = readConfirmedOrder();
  if (confirmedOrder) showConfirmation(confirmedOrder);
  else renderCheckout();
})();
