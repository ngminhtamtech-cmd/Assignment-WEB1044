// CHỨC NĂNG TRANG CART: trạng thái → render → sự kiện → khởi tạo.
function khoiTaoTrangGio() {
  'use strict';

  const gioHang = window.PCAstral.cart;
  const tienIch = window.PCAstral.utils;
  const giaoDien = window.PCAstral.ui;
  const khung = document.getElementById('cart-rows');
  const mau = document.getElementById('cart-row-template');
  let dangHienThi = false;

  function capNhatDongGio(dongHienThi, dongGio) {
    const sanPham = dongGio.product;
    const duongDanChiTiet = 'product-detail.html?id=' + sanPham.id;
    dongHienThi.dataset.productId = sanPham.id;
    const cacLienKet = dongHienThi.querySelectorAll('a');
    for (let i = 0; i < cacLienKet.length; i++) {
      cacLienKet[i].href = duongDanChiTiet;
    }
    const anh = dongHienThi.querySelector('img');
    // Không gán lại src khi chỉ đổi số lượng để giữ trạng thái ảnh dự phòng.
    if (anh.getAttribute('src') !== sanPham.imgUrl) {
      anh.src = sanPham.imgUrl;
    }
    anh.alt = sanPham.imageAlt;
    dongHienThi.querySelector('h3').textContent = sanPham.name;
    dongHienThi.querySelector('.cart-name > span').textContent = tienIch.dinhDangTien(dongGio.unitPrice);
    dongHienThi.querySelector('.cart-subtotal').textContent = tienIch.dinhDangTien(dongGio.subtotal);
    dongHienThi.querySelector('[data-remove]').dataset.remove = sanPham.id;

    const oNhap = dongHienThi.querySelector('[data-quantity]');
    oNhap.dataset.quantity = sanPham.id;
    oNhap.value = dongGio.quantity;
    oNhap.max = sanPham.quantity;
    oNhap.setAttribute('aria-label', 'Số lượng ' + sanPham.name);
    const nutGiam = dongHienThi.querySelector('[data-step="-1"]');
    const nutTang = dongHienThi.querySelector('[data-step="1"]');
    nutGiam.dataset.id = sanPham.id;
    nutTang.dataset.id = sanPham.id;
    nutGiam.disabled = dongGio.quantity === 1;
    nutTang.disabled = dongGio.quantity === sanPham.quantity;
    nutGiam.setAttribute('aria-label', 'Giảm số lượng ' + sanPham.name);
    nutTang.setAttribute('aria-label', 'Tăng số lượng ' + sanPham.name);
  }

  function timDongHienThi(maSanPham) {
    for (let i = 0; i < khung.children.length; i++) {
      const dongHienThi = khung.children[i];
      if (dongHienThi.dataset.productId === maSanPham) {
        return dongHienThi;
      }
    }
    return null;
  }

  function hienThiGioHang() {
    if (dangHienThi) {
      return;
    }
    dangHienThi = true;
    try {
      const tongGio = gioHang.tinhTongGio();
      // ÔN JS - CÂU 4: chỉ hiển thị tổng do Cart tính; phép nhân và cộng tiền nằm trong mo-hinh.js.
      document.getElementById('cart-subtitle').textContent = tongGio.quantity + ' sản phẩm đang chờ cùng bạn về nhà.';
      document.getElementById('cart-empty').hidden = tongGio.lines.length > 0;
      document.getElementById('cart-layout').hidden = tongGio.lines.length === 0;
      document.getElementById('cart-kind-count').textContent = tongGio.lines.length + ' loại sản phẩm';
      document.getElementById('cart-subtotal').textContent = tienIch.dinhDangTien(tongGio.total);
      document.getElementById('cart-total').textContent = tienIch.dinhDangTien(tongGio.total);

      // Giữ lại input của dòng còn tồn tại, tránh thay cả DOM gây vòng change/blur.
      // Duyệt ngược vì remove làm thay đổi danh sách phần tử con ngay lập tức.
      for (let i = khung.children.length - 1; i >= 0; i--) {
        const dongHienThi = khung.children[i];
        const muc = gioHang.timDongGio(dongHienThi.dataset.productId);
        if (!muc) {
          dongHienThi.remove();
        }
      }
      for (let i = 0; i < tongGio.lines.length; i++) {
        const dongGio = tongGio.lines[i];
        let dongHienThi = timDongHienThi(dongGio.productId);
        if (!dongHienThi) {
          dongHienThi = mau.content.firstElementChild.cloneNode(true);
          khung.append(dongHienThi);
        }
        capNhatDongGio(dongHienThi, dongGio);
      }
    } finally {
      dangHienThi = false;
    }
  }

  function xuLyBamNutGio(suKien) {
    const nutXoa = suKien.target.closest('[data-remove]');
    if (nutXoa) {
      const daLuu = gioHang.xoaSanPham(nutXoa.dataset.remove);
      if (daLuu) {
        giaoDien.thongBao('Đã xóa sản phẩm khỏi giỏ.');
      } else {
        giaoDien.thongBao('Đã xóa trong trang hiện tại nhưng chưa lưu được. F5 có thể khôi phục dòng cũ.');
      }
      return;
    }
    const nutDoiSoLuong = suKien.target.closest('[data-step]');
    if (!nutDoiSoLuong) {
      return;
    }
    const dongGio = gioHang.timDongGio(nutDoiSoLuong.dataset.id);
    if (dongGio) {
      gioHang.doiSoLuong(dongGio.productId, dongGio.quantity + Number(nutDoiSoLuong.dataset.step));
    }
  }

  function xuLyDoiSoLuong(suKien) {
    // ÔN JS - CÂU 5: nhập sai thì báo lỗi và hiển thị lại số lượng cũ; nút giảm đã bị khóa ở mức 1.
    if (dangHienThi || !suKien.target.matches('[data-quantity]')) {
      return;
    }
    const oNhap = suKien.target;
    const daDoi = gioHang.doiSoLuong(oNhap.dataset.quantity, Number(oNhap.value));
    if (!daDoi) {
      giaoDien.thongBao('Số lượng phải là số nguyên từ 1 đến số lượng còn hàng.');
      hienThiGioHang();
    }
  }

  // EVENT DELEGATION: chỉ nghe trên thẻ cha, dùng closest/data-* tìm nút của dòng.
  khung.addEventListener('click', xuLyBamNutGio);
  // ÔN JS - CÂU 6: nghe ở khung cha, không gắn lại listener cho từng nút khi thêm dòng; dùng closest để tìm nút.
  khung.addEventListener('change', xuLyDoiSoLuong);
  window.addEventListener('cart-changed', hienThiGioHang);
  window.addEventListener('promotion-expired', hienThiGioHang);
  hienThiGioHang();
}

window.PCAstral.pages["cart"] = khoiTaoTrangGio;
