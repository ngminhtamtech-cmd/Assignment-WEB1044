// CHỨC NĂNG: giao diện đăng ký/đăng nhập; logic tài khoản và lưu trữ nằm ở luu-tru.js.
function khoiTaoTrangTaiKhoan() {
  'use strict';
  const dichVuTaiKhoan = window.PCAstral.auth;
  const mauDangKy = document.getElementById('register-form');
  const mauDangNhap = document.getElementById('login-form');
  const thongDiep = document.getElementById('account-message');
  let dangXuLy = false;

  function hienThiTaiKhoan() {
    const taiKhoan = dichVuTaiKhoan.layTaiKhoanDangNhap();
    document.getElementById('account-signed-in').hidden = !taiKhoan;
    document.getElementById('account-forms').hidden = Boolean(taiKhoan);
    let tenDangNhap = '';
    if (taiKhoan) {
      tenDangNhap = taiKhoan.username;
    }
    document.getElementById('account-username').textContent = tenDangNhap;
  }

  function hienThiLoiTaiKhoan(bieuMau, tienTo, cacLoi) {
    const danhSachTruong1 = bieuMau.querySelectorAll('input');
    for (let viTriTruong = 0; viTriTruong < danhSachTruong1.length; viTriTruong++) {
      const truong = danhSachTruong1[viTriTruong];
      const loi = cacLoi[truong.name] || '';
      document.getElementById(tienTo + '-' + truong.name + '-error').textContent = loi;
      truong.setAttribute('aria-invalid', String(Boolean(loi)));
    }
    const tenTruongLoi = Object.keys(cacLoi)[0];
    if (tenTruongLoi) {
      bieuMau.elements.namedItem(tenTruongLoi).focus();
    }
  }

  function datTrangThaiXuLy(giaTri) {
    dangXuLy = giaTri;
    document.getElementById('register-submit').disabled = giaTri;
    document.getElementById('login-submit').disabled = giaTri;
  }

  async function xuLyDangKy(suKien) {
    suKien.preventDefault();
    if (dangXuLy) {
      return;
    }
    datTrangThaiXuLy(true); // Chặn gửi lặp trong lúc tạo mã băm mật khẩu.
    thongDiep.textContent = '';
    try {
      const cacGiaTri = {
        username: mauDangKy.elements.username.value,
        password: mauDangKy.elements.password.value,
        confirmPassword: mauDangKy.elements.confirmPassword.value
      };
      const ketQua = await dichVuTaiKhoan.dangKy(cacGiaTri.username, cacGiaTri.password, cacGiaTri.confirmPassword);
      hienThiLoiTaiKhoan(mauDangKy, 'register', ketQua.errors || {});
      if (!ketQua.ok) {
        thongDiep.textContent = ketQua.message || 'Vui lòng kiểm tra các trường được báo lỗi.';
        return;
      }
      mauDangKy.reset();
      mauDangNhap.elements.username.value = ketQua.username;
      mauDangNhap.elements.password.focus();
      thongDiep.textContent = 'Đăng ký thành công. Bạn có thể đăng nhập ngay bằng tài khoản vừa tạo.';
    } catch (loi) {
      thongDiep.textContent = loi.message;
    } finally {
      datTrangThaiXuLy(false);
    }
  }

  async function xuLyDangNhap(suKien) {
    suKien.preventDefault();
    if (dangXuLy) {
      return;
    }
    const cacGiaTri = {
      username: mauDangNhap.elements.username.value,
      password: mauDangNhap.elements.password.value
    };
    const cacLoi = {};
    if (!cacGiaTri.username.trim()) {
      cacLoi.username = 'Vui lòng nhập tên đăng nhập.';
    }
    if (!cacGiaTri.password) {
      cacLoi.password = 'Vui lòng nhập mật khẩu.';
    }
    hienThiLoiTaiKhoan(mauDangNhap, 'login', cacLoi);
    thongDiep.textContent = '';
    if (Object.keys(cacLoi).length) {
      return;
    }
    datTrangThaiXuLy(true);
    try {
      const ketQua = await dichVuTaiKhoan.dangNhap(cacGiaTri.username, cacGiaTri.password);
      if (ketQua.ok) {
        thongDiep.textContent = 'Đăng nhập thành công.';
        mauDangNhap.reset();
        hienThiTaiKhoan();
        document.getElementById('logout-button').focus();
      } else {
        thongDiep.textContent = ketQua.message;
      }
    } catch (loi) {
      thongDiep.textContent = loi.message;
    } finally {
      datTrangThaiXuLy(false);
    }
  }

  function xuLyDangXuat() {
    if (dichVuTaiKhoan.dangXuat()) {
      thongDiep.textContent = 'Đã đăng xuất. Tài khoản và giỏ hàng vẫn được giữ.';
      mauDangNhap.elements.username.focus();
    }
  }

  mauDangKy.addEventListener('submit', xuLyDangKy);
  mauDangNhap.addEventListener('submit', xuLyDangNhap);
  document.getElementById('logout-button').addEventListener('click', xuLyDangXuat);
  window.addEventListener('account-changed', hienThiTaiKhoan);
  hienThiTaiKhoan();
}

window.PCAstral.pages.register = khoiTaoTrangTaiKhoan;
