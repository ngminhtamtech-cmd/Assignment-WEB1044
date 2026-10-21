// CHỨC NĂNG TRANG PRODUCTS: trạng thái → render → sự kiện → khởi tạo.
function khoiTaoTrangSanPham() {
  'use strict';

  const duLieu = window.PCAstral.data;
  const tienIch = window.PCAstral.utils;
  const giaoDien = window.PCAstral.ui;
  const bieuMau = document.getElementById('filters');
  const oSapXep = document.getElementById('sort');
  // Tạo các lựa chọn từ dữ liệu sản phẩm; indexOf giúp bỏ thương hiệu trùng.
  const cacThuongHieu = [];
  for (let i = 0; i < duLieu.products.length; i++) {
    const thuongHieu = duLieu.products[i].brand;
    if (cacThuongHieu.indexOf(thuongHieu) === -1) {
      cacThuongHieu.push(thuongHieu);
    }
  }
  cacThuongHieu.sort();

  const maDanhMuc = [''];
  for (let i = 0; i < duLieu.categories.length; i++) {
    maDanhMuc.push(duLieu.categories[i].id);
  }
  const thuongHieuHopLe = [''];
  for (let i = 0; i < cacThuongHieu.length; i++) {
    thuongHieuHopLe.push(cacThuongHieu[i]);
  }
  const giaTriHopLe = {
    category: maDanhMuc,
    brand: thuongHieuHopLe,
    group: ['', 'new', 'hot', 'sale'],
    price: Object.keys(tienIch.priceRanges),
    sort: ['default', 'price-asc', 'price-desc', 'name']
  };

  function taoLuaChonLoc() {
    const cacDanhMuc = document.getElementById('filter-category');
    const oThuongHieu = document.getElementById('filter-brand');
    cacDanhMuc.innerHTML = '';
    cacDanhMuc.appendChild(new Option('Tất cả danh mục', ''));
    oThuongHieu.innerHTML = '';
    oThuongHieu.appendChild(new Option('Tất cả thương hiệu', ''));
    for (let i = 0; i < duLieu.categories.length; i++) {
      const danhMuc = duLieu.categories[i];
      cacDanhMuc.add(new Option(danhMuc.name, danhMuc.id));
    }
    for (let i = 0; i < cacThuongHieu.length; i++) {
      const thuongHieu = cacThuongHieu[i];
      oThuongHieu.add(new Option(thuongHieu, thuongHieu));
    }
  }

  function docBoLocTuURL() {
    const thamSo = new URLSearchParams(location.search);
    const trangThai = { q: (thamSo.get('q') || '').slice(0, 100) };
    const danhSachKhoa1 = Object.keys(giaTriHopLe);
    for (let viTriKhoa = 0; viTriKhoa < danhSachKhoa1.length; viTriKhoa++) {
      const khoa = danhSachKhoa1[viTriKhoa];
      const giaTri = thamSo.get(khoa);
      const choPhep = giaTriHopLe[khoa];
      if (choPhep.includes(giaTri)) {
        trangThai[khoa] = giaTri;
      } else {
        trangThai[khoa] = choPhep[0];
      }
    }
    return trangThai;
  }

  function capNhatURL(trangThai) {
    const thamSo = new URLSearchParams();
    const danhSachKhoa2 = Object.keys(trangThai);
    for (let viTriKhoa = 0; viTriKhoa < danhSachKhoa2.length; viTriKhoa++) {
      const khoa = danhSachKhoa2[viTriKhoa];
      const giaTri = trangThai[khoa];
      if (giaTri && giaTri !== 'all' && giaTri !== 'default') {
        thamSo.set(khoa, giaTri);
      }
    }
    const tuKhoa = thamSo.toString();
    let duongDan = location.pathname;
    if (tuKhoa) {
      duongDan += '?' + tuKhoa;
    }
    history.replaceState(null, '', duongDan);
  }

  function hienThiDanhSachSanPham() {
    // Đọc tường minh từng trường để dễ biết giá trị bộ lọc lấy từ đâu.
    const trangThai = {
      q: bieuMau.elements.q.value,
      category: bieuMau.elements.category.value,
      brand: bieuMau.elements.brand.value,
      group: bieuMau.elements.group.value,
      price: bieuMau.elements.price.value,
      sort: oSapXep.value
    };
    const danhSachSanPham = tienIch.locSanPham(trangThai);
    let danhMuc = null;
    for (let i = 0; i < duLieu.categories.length; i++) {
      if (duLieu.categories[i].id === trangThai.category) {
        danhMuc = duLieu.categories[i];
        break;
      }
    }
    const tenNhom = { new: 'Sản phẩm mới', hot: 'Sản phẩm hot', sale: 'Sản phẩm khuyến mãi' };
    let tieuDe = tenNhom[trangThai.group] || 'Tìm đúng chất riêng của bạn.';
    if (danhMuc) {
      tieuDe = danhMuc.name;
    }

    capNhatURL(trangThai);
    giaoDien.hienThiLuoiSanPham(document.getElementById('products-grid'), danhSachSanPham);
    document.getElementById('result-count').textContent = danhSachSanPham.length + ' sản phẩm';
    document.getElementById('catalog-title').textContent = tieuDe;
    const moTa = document.getElementById('query-description');
    if (trangThai.q) {
      moTa.textContent = 'Kết quả tìm kiếm cho “' + trangThai.q + '”';
    } else {
      moTa.textContent = 'Cấu hình phù hợp, trải nghiệm trọn vẹn.';
    }
  }

  function khoiPhucBoLoc() {
    const trangThai = docBoLocTuURL();
    const danhSachKhoa3 = Object.keys(trangThai);
    for (let viTriKhoa = 0; viTriKhoa < danhSachKhoa3.length; viTriKhoa++) {
      const khoa = danhSachKhoa3[viTriKhoa];
      let truong = bieuMau.elements.namedItem(khoa);
      if (khoa === 'sort') {
        truong = oSapXep;
      }
      if (truong) {
        truong.value = trangThai[khoa];
      }
    }
    hienThiDanhSachSanPham();
  }

  function xoaBoLoc() {
    bieuMau.reset();
    oSapXep.value = 'default';
    document.getElementById('header-q').value = '';
    hienThiDanhSachSanPham();
  }

  function xuLyLoc(suKien) {
    suKien.preventDefault();
    hienThiDanhSachSanPham();
  }

  function batTatBoLoc(suKien) {
    const nut = suKien.currentTarget;
    const dangMo = nut.getAttribute('aria-expanded') !== 'true';
    nut.setAttribute('aria-expanded', String(dangMo));
    bieuMau.classList.toggle('open', dangMo);
  }

  taoLuaChonLoc();
  bieuMau.addEventListener('submit', xuLyLoc);
  bieuMau.addEventListener('change', hienThiDanhSachSanPham);
  oSapXep.addEventListener('change', hienThiDanhSachSanPham);
  document.getElementById('clear-filters').addEventListener('click', xoaBoLoc);
  document.getElementById('filter-toggle').addEventListener('click', batTatBoLoc);
  window.addEventListener('popstate', khoiPhucBoLoc);
  window.addEventListener('promotion-expired', hienThiDanhSachSanPham);
  khoiPhucBoLoc();
}

window.PCAstral.pages["products"] = khoiTaoTrangSanPham;
