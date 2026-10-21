// CHỨC NĂNG TRANG PRODUCT-DETAIL: trạng thái → render → sự kiện → khởi tạo.
function khoiTaoTrangChiTiet() {
  'use strict';

  const tienIch = window.PCAstral.utils;
  const giaoDien = window.PCAstral.ui;
  const maSanPham = new URLSearchParams(location.search).get('id');
  const sanPham = tienIch.timSanPham(maSanPham);

  function hienThiGia() {
    const dangGiam = sanPham.dangGiamGia();
    document.getElementById('detail-current-price').textContent = tienIch.dinhDangTien(sanPham.layGia());
    const giaGoc = document.getElementById('detail-original-price');
    giaGoc.textContent = tienIch.dinhDangTien(sanPham.price);
    giaGoc.hidden = !dangGiam;
    document.getElementById('detail-sale-badge').hidden = !dangGiam;
  }

  function hienThiThongSo() {
    const danhSach = document.getElementById('detail-specs');
    const thongSo = {};
    const cacNhan = Object.keys(sanPham.specs);
    for (let i = 0; i < cacNhan.length; i++) {
      const nhan = cacNhan[i];
      thongSo[nhan] = sanPham.specs[nhan];
    }
    thongSo['Mã sản phẩm'] = sanPham.id.toUpperCase();
    const danhSachNhan1 = Object.keys(thongSo);
    for (let viTriNhan = 0; viTriNhan < danhSachNhan1.length; viTriNhan++) {
      const nhan = danhSachNhan1[viTriNhan];
      const dongHienThi = document.createElement('div');
      const tenThongSo = document.createElement('dt');
      const moTa = document.createElement('dd');
      tenThongSo.textContent = nhan;
      moTa.textContent = thongSo[nhan];
      dongHienThi.append(tenThongSo, moTa);
      danhSach.append(dongHienThi);
    }
  }

  function hienThiSanPhamLienQuan() {
    const cungDanhMuc = tienIch.locSanPham({ category: sanPham.category });
    const lienQuan = [];
    for (let i = 0; i < cungDanhMuc.length; i++) {
      const muc = cungDanhMuc[i];
      if (muc.id !== sanPham.id) {
        lienQuan.push(muc);
      }
      if (lienQuan.length === 4) {
        break;
      }
    }
    giaoDien.hienThiLuoiSanPham(document.getElementById('related-grid'), lienQuan);
  }

  function hienThiChiTiet() {
    const duongDanDanhMuc = 'products.html?category=' + sanPham.category;
    document.title = sanPham.name + ' | PC-Astral Market';
    document.getElementById('detail-view').hidden = false;
    document.getElementById('detail-category-link').href = duongDanDanhMuc;
    document.getElementById('detail-category-link').textContent = sanPham.layTenDanhMuc();
    document.getElementById('related-category-link').href = duongDanDanhMuc;
    document.getElementById('detail-breadcrumb-name').textContent = sanPham.name;
    document.getElementById('detail-code').textContent = 'ASTRAL SELECTED / ' + sanPham.id.toUpperCase();
    document.getElementById('detail-brand-category').textContent = sanPham.brand + ' / ' + sanPham.layTenDanhMuc();
    document.getElementById('detail-name').textContent = sanPham.name;
    document.getElementById('detail-summary').textContent = sanPham.summary;
    document.getElementById('detail-description').textContent = sanPham.description;
    document.getElementById('detail-source').href = sanPham.sourceUrl;

    const anh = document.getElementById('detail-photo');
    anh.src = sanPham.imgUrl;
    anh.alt = sanPham.imageAlt;
    const tonKho = document.getElementById('detail-stock');
    if (sanPham.conHang()) {
      tonKho.textContent = 'Còn ' + sanPham.quantity + ' sản phẩm';
    } else {
      tonKho.textContent = 'Tạm hết hàng';
    }
    tonKho.classList.toggle('out', !sanPham.quantity);
    const soLuong = document.getElementById('detail-quantity');
    soLuong.max = sanPham.quantity || 1;
    soLuong.disabled = !sanPham.quantity;
    const nut = document.getElementById('detail-add');
    nut.dataset.add = sanPham.id;
    nut.disabled = !sanPham.quantity;
    hienThiGia();
    hienThiThongSo();
    hienThiSanPhamLienQuan();
  }

  function xuLyHetKhuyenMai() {
    // Cập nhật riêng giá, giữ số lượng đang nhập và focus của người dùng.
    hienThiGia();
    hienThiSanPhamLienQuan();
  }

  if (!sanPham) {
    document.getElementById('detail-empty').hidden = false;
    return;
  }
  hienThiChiTiet();
  window.addEventListener('promotion-expired', xuLyHetKhuyenMai);
}

window.PCAstral.pages["product-detail"] = khoiTaoTrangChiTiet;
