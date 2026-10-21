// CHỨC NĂNG TRANG HOME: trạng thái → render → sự kiện → khởi tạo.
function khoiTaoTrangChu() {
  'use strict';

  const duLieu = window.PCAstral.data;
  const tienIch = window.PCAstral.utils;
  const giaoDien = window.PCAstral.ui;
  const khungBanner = document.getElementById('hero');
  let viTriBanner = 0;
  let dungDoReChuot = false;
  let dungThuCong = false;
  let henGioDemNguoc;

  function hienThiBanner() {
    const banner = duLieu.banners[viTriBanner];
    const cacDongTieuDe = banner.title.split('\n');
    document.getElementById('hero-title').innerHTML = '';
    document.getElementById('hero-title').appendChild(document.createTextNode(cacDongTieuDe[0]));
    document.getElementById('hero-title').appendChild(document.createElement('br'));
    document.getElementById('hero-title').appendChild(document.createTextNode(cacDongTieuDe[1] || ''));
    document.getElementById('hero-eyebrow').textContent = banner.eyebrow;
    document.getElementById('hero-description').textContent = banner.description;
    const lienKet = document.getElementById('hero-link');
    lienKet.href = banner.link;
    lienKet.textContent = banner.cta + ' ';
    const anh = document.getElementById('hero-photo');
    anh.src = banner.image;
    anh.alt = banner.caption;
    anh.hidden = false;
    delete anh.dataset.fallback;
    const anhDuPhongCu = khungBanner.querySelectorAll('.image-fallback');
    for (let i = 0; i < anhDuPhongCu.length; i++) {
      anhDuPhongCu[i].remove();
    }
    document.getElementById('hero-caption-title').textContent = banner.caption;
    document.getElementById('hero-caption-spec').textContent = banner.spec;
    document.getElementById('slide-count').textContent = '0' + (viTriBanner + 1) + ' / 03';

    const cacNut = document.querySelectorAll('[data-slide]');
    for (let i = 0; i < cacNut.length; i++) {
      const nut = cacNut[i];
      const dangChon = i === viTriBanner;
      nut.classList.toggle('active', dangChon);
      nut.setAttribute('aria-pressed', String(dangChon));
    }
  }

  function chuyenBanner(buoc) {
    viTriBanner += buoc;
    if (viTriBanner < 0) {
      viTriBanner = duLieu.banners.length - 1;
    } else if (viTriBanner >= duLieu.banners.length) {
      viTriBanner = 0;
    }
    hienThiBanner();
  }

  function taoNutBanner() {
    const cacNutBanner = document.getElementById('slide-dots');
    for (let viTri = 0; viTri < duLieu.banners.length; viTri++) {
      const nut = document.createElement('button');
      nut.dataset.slide = viTri;
      nut.setAttribute('aria-label', 'Đến banner ' + (viTri + 1));
      nut.setAttribute('aria-pressed', 'false');
      cacNutBanner.append(nut);
    }
  }

  function hienThiDanhMuc() {
    const khung = document.getElementById('category-grid');
    const mau = document.getElementById('category-template');
    for (let viTri = 0; viTri < duLieu.categories.length; viTri++) {
      const danhMuc = duLieu.categories[viTri];
      const theDanhMuc = mau.content.firstElementChild.cloneNode(true);
      theDanhMuc.href = 'products.html?category=' + danhMuc.id;
      theDanhMuc.querySelector('img').src = danhMuc.image;
      theDanhMuc.querySelector('h3').textContent = danhMuc.name;
      theDanhMuc.querySelector('div > span').textContent = danhMuc.tagline;
      theDanhMuc.querySelector('.category-number').textContent = '0' + (viTri + 1);
      khung.append(theDanhMuc);
    }
  }

  function hienThiCacNhomSanPham() {
    const danhSachNhom1 = ['new', 'hot', 'sale'];
    for (let viTriNhom = 0; viTriNhom < danhSachNhom1.length; viTriNhom++) {
      const nhom = danhSachNhom1[viTriNhom];
      const danhSachSanPham = tienIch.locSanPham({ group: nhom }).slice(0, 4);
      giaoDien.hienThiLuoiSanPham(document.getElementById(nhom + '-grid'), danhSachSanPham);
    }
  }

  function capNhatDemNguoc() {
    const thoiGianConLai = Date.parse(duLieu.promotion.endsAt) - Date.now();
    const soGiay = Math.max(0, Math.floor(thoiGianConLai / 1000));
    const khungDemNguoc = document.getElementById('countdown');
    if (soGiay === 0) {
      khungDemNguoc.textContent = 'Chương trình đã kết thúc';
      clearInterval(henGioDemNguoc);
      return false;
    }
    const cacPhan = [
      Math.floor(soGiay / 86400),
      Math.floor(soGiay / 3600) % 24,
      Math.floor(soGiay / 60) % 60,
      soGiay % 60,
    ];
    const cacOSo = khungDemNguoc.querySelectorAll('[data-countdown-number]');
    for (let i = 0; i < cacOSo.length; i++) {
      let chuoiSo = String(cacPhan[i]);
      if (cacPhan[i] < 10) {
        chuoiSo = '0' + chuoiSo;
      }
      cacOSo[i].textContent = chuoiSo;
    }
    return true;
  }

  function xuLyChonBanner(suKien) {
    const nut = suKien.target.closest('[data-slide]');
    if (!nut) {
      return;
    }
    viTriBanner = Number(nut.dataset.slide);
    hienThiBanner();
  }

  function batTatTuChuyen(suKien) {
    dungThuCong = !dungThuCong;
    if (dungThuCong) {
      suKien.currentTarget.textContent = 'Tiếp tục';
    } else {
      suKien.currentTarget.textContent = 'Tạm dừng';
    }
    suKien.currentTarget.setAttribute('aria-pressed', String(dungThuCong));
  }

  function tuChuyenBanner() {
    const dangCoTieuDiem = khungBanner.contains(document.activeElement);
    if (dungDoReChuot || dungThuCong || document.hidden || dangCoTieuDiem) {
      return;
    }
    chuyenBanner(1);
  }

  function bannerTruoc() {
    chuyenBanner(-1);
  }

  function bannerSau() {
    chuyenBanner(1);
  }

  function dungKhiReChuot() {
    dungDoReChuot = true;
  }

  function tiepTucKhiRoiChuot() {
    dungDoReChuot = false;
  }

  // Truyền tên hàm vào addEventListener, không gọi hàm ngay tại dòng đăng ký.
  function ganSuKien() {
    document.getElementById('prev-slide').addEventListener('click', bannerTruoc);
    document.getElementById('next-slide').addEventListener('click', bannerSau);
    document.getElementById('slide-dots').addEventListener('click', xuLyChonBanner);
    document.getElementById('pause-slide').addEventListener('click', batTatTuChuyen);
    khungBanner.addEventListener('mouseenter', dungKhiReChuot);
    khungBanner.addEventListener('mouseleave', tiepTucKhiRoiChuot);
    window.addEventListener('promotion-expired', hienThiCacNhomSanPham);
    document.addEventListener('visibilitychange', capNhatDemNguoc);
  }

  taoNutBanner();
  hienThiBanner();
  hienThiDanhMuc();
  hienThiCacNhomSanPham();
  ganSuKien();
  setInterval(tuChuyenBanner, 6000);
  if (capNhatDemNguoc()) {
    henGioDemNguoc = setInterval(capNhatDemNguoc, 1000);
  }
}

window.PCAstral.pages["home"] = khoiTaoTrangChu;
