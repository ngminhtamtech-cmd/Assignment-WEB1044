// CHỨC NĂNG TRANG CHECKOUT: trạng thái → render → sự kiện → khởi tạo.
function khoiTaoTrangDatHang() {
  'use strict';

  const gioHang = window.PCAstral.cart;
  const luuTru = window.PCAstral.storage;
  const tienIch = window.PCAstral.utils;
  const giaoDien = window.PCAstral.ui;
  const bieuMau = document.getElementById('checkout-form');
  const nutDatHang = document.getElementById('place-order');
  let dangGui = false;
  let tongDaHienThi = 0;
  let donDaXacNhan = null;
  let cacDongDaHienThi = null;
  let canXacNhanLai = false;
  const cacTruongNhap = ['name', 'email', 'phone', 'address', 'note'];

  // Đọc form ở một chỗ, dùng cho lưu nháp và kiểm tra khi đặt hàng.
  function docGiaTriBieuMau() {
    const cacGiaTri = {};
    for (let viTriTenTruong = 0; viTriTenTruong < cacTruongNhap.length; viTriTenTruong++) {
      const tenTruong = cacTruongNhap[viTriTenTruong];
      cacGiaTri[tenTruong] = bieuMau.elements[tenTruong].value;
    }
    return cacGiaTri;
  }

  // GIỮ FORM KHI F5: lưu nguyên nội dung đang gõ, kể cả email chưa nhập xong.
  function luuBanNhap() {
    if (!donDaXacNhan) {
      luuTru.luuJSON(luuTru.DRAFT_KEY, docGiaTriBieuMau());
    }
  }

  function khoiPhucBanNhap() {
    const banNhap = luuTru.docJSON(luuTru.DRAFT_KEY, null);
    if (!banNhap || typeof banNhap !== 'object' || Array.isArray(banNhap)) {
      return;
    }
    for (let viTriTenTruong = 0; viTriTenTruong < cacTruongNhap.length; viTriTenTruong++) {
      const tenTruong = cacTruongNhap[viTriTenTruong];
      if (typeof banNhap[tenTruong] === 'string') {
        bieuMau.elements[tenTruong].value = banNhap[tenTruong];
      }
    }
  }

  // So từng ID và số lượng; khi kiểm tra giá thì so thêm đơn giá từng dòng.
  function cacDongGiongNhau(danhSachA, danhSachB, kiemTraGia) {
    if (kiemTraGia === undefined) {
      kiemTraGia = false;
    }
    if (!Array.isArray(danhSachA) || !Array.isArray(danhSachB) || danhSachA.length !== danhSachB.length) {
      return false;
    }
    for (let viTriDongA = 0; viTriDongA < danhSachA.length; viTriDongA++) {
      const dongA = danhSachA[viTriDongA];
      if (!dongA) {
        return false;
      }
      let soDongKhop = 0;
      for (let viTriDongB = 0; viTriDongB < danhSachB.length; viTriDongB++) {
        const dongB = danhSachB[viTriDongB];
        if (dongB && dongA.productId === dongB.productId && dongA.quantity === dongB.quantity) {
          if (!kiemTraGia || dongA.unitPrice === dongB.unitPrice) {
            soDongKhop++;
          }
        }
      }
      if (soDongKhop !== 1) {
        return false;
      }
    }
    return true;
  }

  function donHangHopLe(donHang) {
    if (!donHang || typeof donHang.id !== 'string') {
      return false;
    }
    if (typeof donHang.createdAt !== 'string' || !Number.isFinite(Date.parse(donHang.createdAt))) {
      return false;
    }
    if (!donHang.customer || typeof donHang.customer.name !== 'string') {
      return false;
    }
    if (!Array.isArray(donHang.lines) || donHang.lines.length === 0) {
      return false;
    }

    let tongDuKien = 0;
    const danhSachDongGio1 = donHang.lines;
    for (let viTriDongGio = 0; viTriDongGio < danhSachDongGio1.length; viTriDongGio++) {
      const dongGio = danhSachDongGio1[viTriDongGio];
      if (!dongGio || typeof dongGio.name !== 'string' || typeof dongGio.productId !== 'string') {
        return false;
      }
      if (!Number.isInteger(dongGio.quantity) || dongGio.quantity < 1) {
        return false;
      }
      if (!Number.isFinite(dongGio.unitPrice) || dongGio.unitPrice < 0) {
        return false;
      }
      tongDuKien += dongGio.quantity * dongGio.unitPrice;
    }
    return Number.isFinite(donHang.total) && donHang.total === tongDuKien;
  }

  function docDonDaDat() {
    const maDonHang = new URLSearchParams(location.search).get('order');
    const donHang = luuTru.docJSON(luuTru.ORDER_KEY, null);
    if (!donHangHopLe(donHang)) {
      return null;
    }
    if (donHang.id === maDonHang) {
      return donHang;
    }
    // Quay lại checkout khi giỏ đơn cũ chưa dọn: xem đơn đó, tránh đặt trùng.
    if (!maDonHang && donHang.choDonGio === true && cacDongGiongNhau(gioHang.layGio(), donHang.lines)) {
      history.replaceState(null, '', 'checkout.html?order=' + encodeURIComponent(donHang.id));
      return donHang;
    }
    return null;
  }

  function hienThiCanhBaoDonGio() {
    const thongDiep = document.getElementById('cart-cleanup-message');
    const nutThuLai = document.getElementById('retry-cart-cleanup');
    const dangCho = donDaXacNhan && donDaXacNhan.choDonGio === true;
    thongDiep.hidden = !dangCho;
    nutThuLai.hidden = !dangCho;
    if (!dangCho) {
      return;
    }
    const gioDaLuu = luuTru.docJSON(luuTru.CART_KEY, null);
    const donMoiNhat = luuTru.docJSON(luuTru.ORDER_KEY, null);
    const dungDon = donMoiNhat && donMoiNhat.id === donDaXacNhan.id;
    if (dungDon && donMoiNhat.choDonGio !== true) {
      donDaXacNhan.choDonGio = false;
      thongDiep.hidden = true;
      nutThuLai.hidden = true;
      return;
    }
    const gioTrong = Array.isArray(gioDaLuu) && gioDaLuu.length === 0;
    const gioKhop = cacDongGiongNhau(gioDaLuu, donDaXacNhan.lines);
    nutThuLai.disabled = !dungDon || (!gioTrong && !gioKhop);
    if (nutThuLai.disabled) {
      thongDiep.textContent = 'Đơn đã lưu. Giỏ hoặc đơn gần nhất đã thay đổi nên không tự xóa giỏ hiện tại.';
    } else {
      thongDiep.textContent = 'Đơn đã lưu, nhưng bước dọn giỏ chưa hoàn tất. Thử lại chỉ dọn giỏ, không tạo thêm đơn.';
    }
  }

  function thuDonGio() {
    if (!donDaXacNhan || donDaXacNhan.choDonGio !== true) {
      return;
    }
    const donMoiNhat = luuTru.docJSON(luuTru.ORDER_KEY, null);
    const gioDaLuu = luuTru.docJSON(luuTru.CART_KEY, null);
    if (!donMoiNhat || donMoiNhat.id !== donDaXacNhan.id || !Array.isArray(gioDaLuu)) {
      hienThiCanhBaoDonGio();
      return;
    }
    // Tab khác đã dọn xong: không xóa giỏ mua mới dù có cùng sản phẩm/số lượng.
    if (donMoiNhat.choDonGio !== true) {
      donDaXacNhan.choDonGio = false;
      hienThiCanhBaoDonGio();
      return;
    }
    if (gioDaLuu.length > 0 && !cacDongGiongNhau(gioDaLuu, donDaXacNhan.lines)) {
      hienThiCanhBaoDonGio();
      return;
    }
    // Đọc giỏ đã lưu trước khi xóa, không dùng bản cũ trong bộ nhớ của tab.
    gioHang.items = gioHang.kiemTraGio(gioDaLuu);
    const daDonGio = gioHang.xoaGio();
    if (daDonGio) {
      donDaXacNhan.choDonGio = false;
      if (!luuTru.luuJSON(luuTru.ORDER_KEY, donDaXacNhan)) {
        donDaXacNhan.choDonGio = true;
      }
    }
    // Nếu lưu giỏ thất bại, Cart đã phục hồi bộ nhớ; cập nhật badge theo kết quả đó.
    window.dispatchEvent(new Event('cart-changed'));
    hienThiCanhBaoDonGio();
  }

  function xoaBanNhapSauDatHang() {
    const thongDiep = document.getElementById('draft-cleanup-message');
    const daXoa = luuTru.xoaDuLieu(luuTru.DRAFT_KEY);
    thongDiep.hidden = daXoa;
    if (!daXoa) {
      thongDiep.textContent = 'Đơn đã lưu nhưng chưa xóa được bản nháp. Bản nháp có thể xuất hiện khi mở form lần sau.';
    }
  }

  function hienThiXacNhan(donHang) {
    donDaXacNhan = donHang;
    document.getElementById('checkout-heading').hidden = true;
    document.getElementById('checkout-layout').hidden = true;
    document.getElementById('checkout-empty').hidden = true;
    document.getElementById('order-confirmation').hidden = false;
    document.getElementById('confirmation-customer').textContent = donHang.customer.name;
    document.getElementById('confirmation-id').textContent = donHang.id;
    document.getElementById('confirmation-time').textContent = new Date(donHang.createdAt).toLocaleString('vi-VN');
    document.getElementById('confirmation-payment').textContent = 'COD mô phỏng';
    document.getElementById('confirmation-total').textContent = tienIch.dinhDangTien(donHang.total);

    const danhSach = document.getElementById('confirmation-lines');
    const dongTongTien = danhSach.querySelector('.summary-total');
    const mau = document.getElementById('confirmation-line-template');
    const cacDongCu = danhSach.querySelectorAll('[data-confirmed-line]');
    for (let i = 0; i < cacDongCu.length; i++) {
      cacDongCu[i].remove();
    }
    const danhSachMuc2 = donHang.lines;
    for (let viTriMuc = 0; viTriMuc < danhSachMuc2.length; viTriMuc++) {
      const muc = danhSachMuc2[viTriMuc];
      const dongHienThi = mau.content.firstElementChild.cloneNode(true);
      dongHienThi.querySelector('span').textContent = muc.name + ' × ' + muc.quantity;
      dongHienThi.querySelector('b').textContent = tienIch.dinhDangTien(muc.unitPrice * muc.quantity);
      danhSach.insertBefore(dongHienThi, dongTongTien);
    }
    hienThiCanhBaoDonGio();
  }

  function hienThiTongTien() {
    const tongGio = gioHang.tinhTongGio();
    if (cacDongDaHienThi && !cacDongGiongNhau(cacDongDaHienThi, tongGio.lines, true)) {
      canXacNhanLai = true;
    }
    cacDongDaHienThi = tongGio.lines;
    tongDaHienThi = tongGio.total;
    document.getElementById('checkout-subtotal').textContent = tienIch.dinhDangTien(tongGio.total);
    document.getElementById('checkout-total').textContent = tienIch.dinhDangTien(tongGio.total);
    const khung = document.getElementById('checkout-lines');
    const mau = document.getElementById('checkout-line-template');
    khung.innerHTML = '';
    const danhSachDongGio3 = tongGio.lines;
    for (let viTriDongGio = 0; viTriDongGio < danhSachDongGio3.length; viTriDongGio++) {
      const dongGio = danhSachDongGio3[viTriDongGio];
      const dongHienThi = mau.content.firstElementChild.cloneNode(true);
      dongHienThi.querySelector('[data-line-name]').textContent = dongGio.product.name;
      dongHienThi.querySelector('[data-line-quantity]').textContent = '× ' + dongGio.quantity;
      dongHienThi.querySelector('[data-line-total]').textContent = tienIch.dinhDangTien(dongGio.subtotal);
      khung.append(dongHienThi);
    }
  }

  function hienThiDatHang() {
    if (donDaXacNhan) {
      return;
    }
    const gioTrong = gioHang.layGio().length === 0;
    document.getElementById('checkout-empty').hidden = !gioTrong;
    document.getElementById('checkout-layout').hidden = gioTrong;
    // Không dựng lại form: giữ nguyên dữ liệu và focus khi giá hoặc giỏ thay đổi.
    hienThiTongTien();
  }

  function hienThiLoiDatHang(cacLoi) {
    const danhSachKhoa4 = ['name', 'email', 'phone', 'address'];
    for (let viTriKhoa = 0; viTriKhoa < danhSachKhoa4.length; viTriKhoa++) {
      const khoa = danhSachKhoa4[viTriKhoa];
      document.getElementById(khoa + '-error').textContent = cacLoi[khoa] || '';
      bieuMau.elements[khoa].setAttribute('aria-invalid', String(Boolean(cacLoi[khoa])));
    }
    const truongDau = Object.keys(cacLoi)[0];
    if (truongDau) {
      bieuMau.elements[truongDau].focus();
    }
    return Boolean(truongDau);
  }

  function taoDonHang(khachHang, tongGio) {
    const mocThoiGian = Date.now().toString(36).toUpperCase();
    const hauTo = Math.random().toString(36).slice(2, 6).toUpperCase();
    const cacDong = [];
    for (let i = 0; i < tongGio.lines.length; i++) {
      const dongGio = tongGio.lines[i];
      cacDong.push({
        productId: dongGio.productId,
        name: dongGio.product.name,
        quantity: dongGio.quantity,
        unitPrice: dongGio.unitPrice
      });
    }
    return {
      id: 'AST-' + mocThoiGian + '-' + hauTo,
      createdAt: new Date().toISOString(),
      customer: khachHang,
      lines: cacDong,
      total: tongGio.total,
      shipping: 0,
      payment: 'COD demo',
      choDonGio: true,
    };
  }

  function xuLyDatHang(suKien) {
    suKien.preventDefault();
    if (dangGui || donDaXacNhan) {
      return;
    }
    const cacGiaTri = docGiaTriBieuMau();
    const kiemTra = tienIch.kiemTraKhachHang(cacGiaTri);
    if (hienThiLoiDatHang(kiemTra.errors)) {
      return;
    }

    const tongGio = gioHang.tinhTongGio();
    if (!tongGio.lines.length) {
      giaoDien.thongBao('Giỏ hàng đã trống. Vui lòng chọn lại sản phẩm.');
      hienThiDatHang();
      return;
    }
    if (canXacNhanLai || tongGio.total !== tongDaHienThi || !cacDongGiongNhau(cacDongDaHienThi, tongGio.lines, true)) {
      hienThiTongTien();
      canXacNhanLai = false;
      giaoDien.thongBao('Giá vừa thay đổi hoặc giỏ đã được cập nhật. Vui lòng xem lại và xác nhận lần nữa.');
      return;
    }

    dangGui = true;
    nutDatHang.disabled = true;
    const donHang = taoDonHang(kiemTra.data, tongGio);
    // Chỉ xóa giỏ sau khi lưu được đơn để lỗi storage không làm mất lựa chọn.
    if (!luuTru.luuJSON(luuTru.ORDER_KEY, donHang)) {
      dangGui = false;
      nutDatHang.disabled = false;
      giaoDien.thongBao('Chưa lưu được đơn hàng. Giỏ hàng vẫn được giữ để bạn thử lại.');
      return;
    }
    donDaXacNhan = donHang;
    history.replaceState(null, '', 'checkout.html?order=' + encodeURIComponent(donHang.id));
    xoaBanNhapSauDatHang();
    thuDonGio();
    hienThiXacNhan(donHang);
  }

  function xuLyGioThayDoi() {
    if (donDaXacNhan) {
      hienThiCanhBaoDonGio();
      return;
    }
    if (!dangGui) {
      hienThiDatHang();
    }
  }

  bieuMau.addEventListener('submit', xuLyDatHang);
  bieuMau.addEventListener('input', luuBanNhap);
  document.getElementById('retry-cart-cleanup').addEventListener('click', thuDonGio);
  window.addEventListener('promotion-expired', hienThiDatHang);
  window.addEventListener('cart-changed', xuLyGioThayDoi);
  donDaXacNhan = docDonDaDat();
  if (donDaXacNhan) {
    hienThiXacNhan(donDaXacNhan);
  } else {
    khoiPhucBanNhap();
    hienThiDatHang();
  }
}

window.PCAstral.pages["checkout"] = khoiTaoTrangDatHang;
