// CHỨC NĂNG: tiện ích hiển thị, tìm/lọc/sắp xếp và giao diện dùng chung.
// Chỉ khởi tạo sau khi JSON đã nạp xong và giỏ đã được tạo.
// Mỗi hàm khởi tạo có phạm vi biến riêng, tránh trùng tên giữa các file.
function khoiTaoHienThi() {
  khaiBaoTienIch();
  khaiBaoGiaoDienChung();
}

function khaiBaoTienIch() {
  'use strict';

  const duLieu = window.PCAstral.data;
  const boDinhDangTien = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
  const cacKhoangGia = {
    all: [0, Infinity],
    under5: [0, 5000000],
    '5to15': [5000000, 15000000],
    '15to30': [15000000, 30000000],
    above30: [30000000, Infinity],
  };

  function dinhDangTien(giaTri) {
    return giaTri.toLocaleString('vi-VN') + ' đ';
  }

  function boDau(giaTri) {
    // Làm từng bước: tách dấu, bỏ dấu, đổi đ thành d, chuyển chữ thường, bỏ khoảng trắng.
    let chuoi = String(giaTri);
    chuoi = chuoi.normalize('NFD');
    chuoi = chuoi.replace(/[\u0300-\u036f]/g, '');
    chuoi = chuoi.replace(/đ/gi, 'd');
    chuoi = chuoi.toLowerCase();
    return chuoi.trim();
  }

  function timSanPham(id) {
    for (let i = 0; i < duLieu.products.length; i++) {
      const sanPham = duLieu.products[i];
      if (sanPham.id === id) {
        return sanPham;
      }
    }
    return undefined;
  }

  function maHoaHTML(giaTri) {
    // Đổi ký tự đặc biệt thành chữ an toàn trước khi ghép vào HTML.
    // Phải thay & đầu tiên để không thay lại ký tự vừa tạo.
    let chuoi = String(giaTri);
    chuoi = chuoi.replace(/&/g, '&amp;');
    chuoi = chuoi.replace(/</g, '&lt;');
    chuoi = chuoi.replace(/>/g, '&gt;');
    chuoi = chuoi.replace(/"/g, '&quot;');
    return chuoi.replace(/'/g, '&#39;');
  }

  function dungNhom(sanPham, nhom, thoiDiem) {
    if (!nhom) {
      return true;
    }
    if (nhom === 'new') {
      return sanPham.isNew;
    }
    if (nhom === 'hot') {
      return sanPham.isHot;
    }
    if (nhom === 'sale') {
      return sanPham.dangGiamGia(thoiDiem);
    }
    return false;
  }

  // CHỨC NĂNG: duyệt từng sản phẩm; chỉ thêm vào mảng mới khi đạt mọi điều kiện.
  function locSanPham(boLoc, thoiDiem) {
    if (boLoc === undefined) {
      boLoc = {};
    }
    if (thoiDiem === undefined) {
      thoiDiem = Date.now();
    }
    const tuKhoa = boDau(boLoc.q || '');
    const khoangGia = cacKhoangGia[boLoc.price] || cacKhoangGia.all;
    const ketQua = [];
    for (let i = 0; i < duLieu.products.length; i++) {
      const sanPham = duLieu.products[i];
      const chuoiTimKiem = boDau(sanPham.name + ' ' + sanPham.brand);
      const gia = sanPham.layGia(thoiDiem);
      if (!chuoiTimKiem.includes(tuKhoa)) {
        continue;
      }
      if (boLoc.category && sanPham.category !== boLoc.category) {
        continue;
      }
      if (boLoc.brand && sanPham.brand !== boLoc.brand) {
        continue;
      }
      if (!dungNhom(sanPham, boLoc.group, thoiDiem)) {
        continue;
      }
      if (gia < khoangGia[0] || gia >= khoangGia[1]) {
        continue;
      }
      ketQua.push(sanPham);
    }

    // sort nhận hàm so sánh có tên; chỉ sắp xếp mảng kết quả, không sửa mảng gốc.
    function soSanhGiaTang(sanPhamTruoc, sanPhamSau) {
      return sanPhamTruoc.layGia(thoiDiem) - sanPhamSau.layGia(thoiDiem);
    }
    function soSanhGiaGiam(sanPhamTruoc, sanPhamSau) {
      return sanPhamSau.layGia(thoiDiem) - sanPhamTruoc.layGia(thoiDiem);
    }
    function soSanhTen(sanPhamTruoc, sanPhamSau) {
      return sanPhamTruoc.name.localeCompare(sanPhamSau.name, 'vi');
    }
    if (boLoc.sort === 'price-asc') {
      ketQua.sort(soSanhGiaTang);
    } else if (boLoc.sort === 'price-desc') {
      ketQua.sort(soSanhGiaGiam);
    } else if (boLoc.sort === 'name') {
      ketQua.sort(soSanhTen);
    }
    return ketQua;
  }

  function kiemTraKhachHang(cacGiaTri) {
    const khachHang = {};
    const cacLoi = {};
    const truongBatBuoc = {
      name: 'họ tên', email: 'email', phone: 'số điện thoại', address: 'địa chỉ',
    };

    const danhSachKhoa1 = Object.keys(cacGiaTri);
    for (let viTriKhoa = 0; viTriKhoa < danhSachKhoa1.length; viTriKhoa++) {
      const khoa = danhSachKhoa1[viTriKhoa];
      khachHang[khoa] = String(cacGiaTri[khoa]).trim();
    }
    let soDienThoai = khachHang.phone || '';
    soDienThoai = soDienThoai.replace(/[\s().-]/g, '');
    khachHang.phone = soDienThoai.replace(/^\+84/, '0');

    const danhSachKhoa2 = Object.keys(truongBatBuoc);
    for (let viTriKhoa = 0; viTriKhoa < danhSachKhoa2.length; viTriKhoa++) {
      const khoa = danhSachKhoa2[viTriKhoa];
      if (!khachHang[khoa]) {
        cacLoi[khoa] = 'Vui lòng nhập ' + truongBatBuoc[khoa] + '.';
      }
    }
    if (khachHang.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(khachHang.email)) {
      cacLoi.email = 'Email chưa đúng định dạng, ví dụ ten@email.com.';
    }
    if (khachHang.phone && !/^0\d{9}$/.test(khachHang.phone)) {
      cacLoi.phone = 'Nhập 10 chữ số bắt đầu bằng 0 hoặc dạng +84 tương ứng.';
    }
    return { data: khachHang, errors: cacLoi };
  }

  window.PCAstral.utils = {
    dinhDangTien: dinhDangTien,
    boDau: boDau,
    timSanPham: timSanPham,
    maHoaHTML: maHoaHTML,
    priceRanges: cacKhoangGia,
    locSanPham: locSanPham,
    kiemTraKhachHang: kiemTraKhachHang
  };
}

function khaiBaoGiaoDienChung() {
  'use strict';

  const cacDanhMuc = window.PCAstral.data.categories;
  const khuyenMai = window.PCAstral.data.promotion;
  const dinhDangTien = window.PCAstral.utils.dinhDangTien;
  const maHoa = window.PCAstral.utils.maHoaHTML;
  const gioHang = window.PCAstral.cart;
  const luuTru = window.PCAstral.storage;
  let henGioThongBao;
  let daKhoiTao = false;

  // Giao diện dùng chung: chỉnh header/footer/thẻ ở đây để áp dụng cho mọi trang.
  function hienThiDauTrang() {
    const trang = document.body.dataset.page;
    let trangChuDangChon = '';
    let sanPhamDangChon = '';
    let gioiThieuDangChon = '';
    if (trang === 'home') {
      trangChuDangChon = 'aria-current="page"';
    } else if (trang === 'products') {
      sanPhamDangChon = 'aria-current="page"';
    } else if (trang === 'about') {
      gioiThieuDangChon = 'aria-current="page"';
    }
    let lienKetDanhMuc = '';
    for (let i = 0; i < cacDanhMuc.length; i++) {
      const danhMuc = cacDanhMuc[i];
      lienKetDanhMuc += `<a href="products.html?category=${danhMuc.id}">${maHoa(danhMuc.name)}</a>`;
    }
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
          <a href="index.html" ${trangChuDangChon}>Trang chủ</a>
          <a href="products.html" ${sanPhamDangChon}>Tất cả sản phẩm</a>
          ${lienKetDanhMuc}
          <a href="about.html" ${gioiThieuDangChon}>Về Astral</a>
          <a href="register.html" id="account-link">Đăng ký / Đăng nhập</a>
          <a class="nav-sale" href="products.html?group=sale">Ưu đãi tháng 10 </a>
        </div>
      </nav>`;
  }

  function hienThiCuoiTrang() {
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
        <button type="button" class="control-button" data-end-demo>Kết thúc buổi demo</button>
      </div>`;
  }

  function taoTheSanPham(sanPham) {
    const dangGiam = sanPham.dangGiamGia();
    let nhan;
    if (!sanPham.conHang()) {
      nhan = '<span class="badge muted">Hết hàng</span>';
    } else if (dangGiam) {
      const phanTramGiam = Math.round((1 - sanPham.salePrice / sanPham.price) * 100);
      nhan = `<span class="badge sale">−${phanTramGiam}%</span>`;
    } else if (sanPham.isNew) {
      nhan = '<span class="badge">Mới về</span>';
    } else {
      nhan = '<span class="badge warm">Yêu thích</span>';
    }
    let giaGoc = '';
    if (dangGiam) {
      giaGoc = `<del>${dinhDangTien(sanPham.price)}</del>`;
    }
    let khoaNut = '';
    if (!sanPham.conHang()) {
      khoaNut = 'disabled';
    }
    return `
      <article class="product-card">
        <div class="product-visual">
          ${nhan}
          <a href="product-detail.html?id=${sanPham.id}" tabindex="-1" aria-hidden="true">
            <img src="${sanPham.imgUrl}" alt="" loading="lazy" width="520" height="370">
          </a>
        </div>
        <div class="product-info">
          <span class="product-brand">${maHoa(sanPham.brand)}</span>
          <h3><a href="product-detail.html?id=${sanPham.id}">${maHoa(sanPham.name)}</a></h3>
          <p class="product-spec">${maHoa(sanPham.summary)}</p>
          <div class="price-line">
            <strong>${sanPham.layGiaHienThi()}</strong>
            ${giaGoc}
          </div>
          <div class="product-actions">
            <a href="product-detail.html?id=${sanPham.id}">Xem chi tiết </a>
            <button class="control-button add-cart" data-add="${sanPham.id}" aria-label="Thêm ${maHoa(sanPham.name)} vào giỏ" ${khoaNut}>Thêm giỏ</button>
          </div>
        </div>
      </article>`.replace(/>\s+</g, '><'); // Bỏ khoảng trắng tạo dòng thừa trong liên kết bao ảnh.
  }

  function hienThiLuoiSanPham(phanTu, danhSachSanPham) {
    if (!danhSachSanPham.length) {
      phanTu.innerHTML = `
        <div class="empty-state">
          <h2>Chưa tìm thấy sản phẩm</h2>
          <p>Thử một từ khóa khác hoặc bỏ bớt điều kiện lọc.</p>
          <a class="button" href="products.html">Khám phá sản phẩm</a>
        </div>`;
      return;
    }
    let htmlSanPham = '';
    for (let i = 0; i < danhSachSanPham.length; i++) {
      htmlSanPham += taoTheSanPham(danhSachSanPham[i]);
    }
    phanTu.innerHTML = htmlSanPham;
  }

  function thongBao(thongDiep) {
    const phanTu = document.getElementById('toast');
    phanTu.textContent = thongDiep;
    phanTu.classList.add('visible');
    clearTimeout(henGioThongBao);
    henGioThongBao = setTimeout(anThongBao, 4200);
  }

  function anThongBao() {
    document.getElementById('toast').classList.remove('visible');
  }

  function capNhatSoLuongGio() {
    const soLuong = gioHang.tinhTongGio().quantity;
    const cacNhanSoLuong = document.querySelectorAll('[data-cart-count]');
    for (let i = 0; i < cacNhanSoLuong.length; i++) {
      cacNhanSoLuong[i].textContent = soLuong;
    }
  }

  function hienThiLoiLuuTru(thongDiep) {
    const phanTu = document.getElementById('storage-warning');
    phanTu.hidden = false;
    phanTu.textContent = thongDiep;
  }

  function batTatMenu(suKien) {
    const nut = suKien.currentTarget;
    const dangMo = nut.getAttribute('aria-expanded') !== 'true';
    nut.setAttribute('aria-expanded', String(dangMo));
    document.getElementById('main-nav').classList.toggle('open', dangMo);
  }


  function xuLyAnhLoi(suKien) {
    const anh = suKien.target;
    if (anh.tagName !== 'IMG' || anh.dataset.fallback) {
      return;
    }
    anh.dataset.fallback = 'true';
    anh.hidden = true;
    const duPhong = document.createElement('span');
    duPhong.className = 'image-fallback';
    duPhong.textContent = 'Ảnh đang cập nhật';
    anh.after(duPhong);
  }

  function theoDoiKhuyenMai() {
    const hanKetThuc = Date.parse(khuyenMai.endsAt);
    let conKhuyenMai = Date.now() < hanKetThuc;
    let henGio;

    function kiemTraKhuyenMai() {
      if (!conKhuyenMai || Date.now() < hanKetThuc) {
        return;
      }
      conKhuyenMai = false;
      clearInterval(henGio);
      window.dispatchEvent(new Event('promotion-expired'));
      thongBao('Chương trình đã kết thúc. Giá sản phẩm đã được cập nhật.');
    }

    if (conKhuyenMai) {
      henGio = setInterval(kiemTraKhuyenMai, 1000);
    }
    document.addEventListener('visibilitychange', kiemTraKhuyenMai);
    window.addEventListener('focus', kiemTraKhuyenMai);
  }

  function capNhatTenTaiKhoan() {
    const nguoiDangNhap = window.PCAstral.auth.layTaiKhoanDangNhap();
    const lienKet = document.getElementById('account-link');
    if (!lienKet) {
      return;
    }
    if (nguoiDangNhap) {
      lienKet.textContent = 'Tài khoản: ' + nguoiDangNhap.username;
    } else {
      lienKet.textContent = 'Đăng ký / Đăng nhập';
    }
  }

  function xuLyCanhBao(suKien) {
    hienThiLoiLuuTru(suKien.detail);
  }

  function khoiTaoChung() {
    if (daKhoiTao) {
      return;
    }
    daKhoiTao = true;
    hienThiDauTrang();
    hienThiCuoiTrang();
    capNhatTenTaiKhoan();
    const khungThongBao = document.createElement('div');
    khungThongBao.id = 'toast';
    khungThongBao.className = 'toast';
    khungThongBao.setAttribute('role', 'status');
    khungThongBao.setAttribute('aria-live', 'polite');
    document.body.append(khungThongBao);

    const tuKhoa = new URLSearchParams(location.search).get('q');
    if (tuKhoa) {
      document.getElementById('header-q').value = tuKhoa;
    }
    document.getElementById('menu-toggle').addEventListener('click', batTatMenu);
    document.addEventListener('error', xuLyAnhLoi, true);
    window.addEventListener('cart-changed', capNhatSoLuongGio);
    window.addEventListener('storage-warning', xuLyCanhBao);
    if (luuTru.layLoiLuuTru()) {
      hienThiLoiLuuTru(luuTru.layLoiLuuTru());
    }
    capNhatSoLuongGio();
    theoDoiKhuyenMai();
  }

  window.PCAstral.ui = {
    khoiTaoChung: khoiTaoChung,
    hienThiLuoiSanPham: hienThiLuoiSanPham,
    thongBao: thongBao,
    capNhatTenTaiKhoan: capNhatTenTaiKhoan
  };
}

window.PCAstral.khoiTaoHienThi = khoiTaoHienThi;
