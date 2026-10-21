// CHỨC NĂNG: lưu giỏ, đơn demo, tài khoản và trạng thái đăng nhập qua F5.
// QUAN TRỌNG: LocalStorage KHÔNG tự mất khi tắt Live Server.
// Chỉ nút "Kết thúc buổi demo" gọi ketThucDemo() để xóa dữ liệu của website này.
function khaiBaoLuuTru() {
  'use strict';

  const CART_KEY = 'pc-astral.cart.v1';
  const ORDER_KEY = 'pc-astral.last-order.v1';
  const USERS_KEY = 'pc-astral.users.v1';
  const AUTH_KEY = 'pc-astral.auth.v1';
  const RESET_KEY = 'pc-astral.demo-reset.v1';
  const DRAFT_KEY = 'pc-astral.checkout-draft.v1';
  let loiLuuTru = '';

  function layLoiLuuTru() {
    return loiLuuTru;
  }

  function baoLoiLuuTru(thongDiep) {
    loiLuuTru = thongDiep;
    window.dispatchEvent(new CustomEvent('storage-warning', { detail: thongDiep }));
  }

  // Truy cập storage cũng có thể ném lỗi, nên đặt cả getItem/setItem trong try/catch.
  function docJSON(khoa, duPhong) {
    let chuoiJSON;
    try {
      chuoiJSON = window.localStorage.getItem(khoa);
    } catch (loi) {
      baoLoiLuuTru('Trình duyệt đang chặn lưu trữ. Giỏ chỉ được giữ trong trang hiện tại và có thể mất khi chuyển trang.');
      return duPhong;
    }
    if (chuoiJSON === null) {
      return duPhong;
    }

    try {
      return JSON.parse(chuoiJSON);
    } catch (loi) {
      baoLoiLuuTru('Dữ liệu lưu trước đó không hợp lệ. Website đã dùng dữ liệu mặc định.');
      return duPhong;
    }
  }

  function luuJSON(khoa, giaTri) {
    try {
      window.localStorage.setItem(khoa, JSON.stringify(giaTri));
      return true;
    } catch (loi) {
      baoLoiLuuTru('Không lưu được dữ liệu. Hãy cho phép lưu trữ trình duyệt hoặc giải phóng dung lượng rồi thử lại.');
      return false;
    }
  }

  // XÓA BUỔI DEMO: không dùng localStorage.clear(), tránh xóa dữ liệu dự án khác.
  function ketThucDemo() {
    try {
      // Đánh dấu trước khi xóa để yêu cầu đang chờ await không ghi dữ liệu trở lại.
      const mocCu = Number(docJSON(RESET_KEY, 0)) || 0;
      const mocMoi = Math.max(Date.now(), mocCu + 1);
      window.localStorage.setItem(RESET_KEY, String(mocMoi));
      const danhSachKhoa1 = [CART_KEY, ORDER_KEY, USERS_KEY, AUTH_KEY, DRAFT_KEY];
      for (let viTriKhoa = 0; viTriKhoa < danhSachKhoa1.length; viTriKhoa++) {
        const khoa = danhSachKhoa1[viTriKhoa];
        window.localStorage.removeItem(khoa);
        window.sessionStorage.removeItem(khoa); // Dọn đơn của phiên bản cũ nếu còn.
      }
      return true;
    } catch (loi) {
      baoLoiLuuTru('Chưa xóa hết dữ liệu demo vì trình duyệt đang chặn lưu trữ. Hãy cho phép lưu trữ và thử lại.');
      return false;
    }
  }

  function xoaDuLieu(khoa) {
    try {
      window.localStorage.removeItem(khoa);
      return true;
    } catch (loi) {
      baoLoiLuuTru('Không thể thay đổi dữ liệu lưu trong trình duyệt.');
      return false;
    }
  }

  window.PCAstral.storage = {
    CART_KEY: CART_KEY,
    ORDER_KEY: ORDER_KEY,
    USERS_KEY: USERS_KEY,
    AUTH_KEY: AUTH_KEY,
    RESET_KEY: RESET_KEY,
    DRAFT_KEY: DRAFT_KEY,
    layLoiLuuTru: layLoiLuuTru,
    docJSON: docJSON,
    luuJSON: luuJSON,
    xoaDuLieu: xoaDuLieu,
    ketThucDemo: ketThucDemo
  };
}

khaiBaoLuuTru();

// CHỨC NĂNG: đăng ký / đăng nhập mô phỏng, hoàn toàn trên trình duyệt.
// Username + salt + mã băm mật khẩu lưu ở USERS_KEY; không lưu mật khẩu nguyên văn.
// Đây không phải xác thực an toàn cho cửa hàng thật: người dùng vẫn có thể sửa LocalStorage.
function khaiBaoTaiKhoan() {
  'use strict';
  const luuTru = window.PCAstral.storage;
  const SO_LAN_BAM = 120000;

  function docTaiKhoan() {
    const duLieu = luuTru.docJSON(luuTru.USERS_KEY, []);
    const danhSachHopLe = [];
    if (!Array.isArray(duLieu)) {
      return danhSachHopLe;
    }
    for (let i = 0; i < duLieu.length; i++) {
      const taiKhoan = duLieu[i];
      if (!taiKhoan || typeof taiKhoan.username !== 'string') {
        continue;
      }
      if (!/^[a-z0-9_.-]{3,24}$/.test(taiKhoan.username)) {
        continue;
      }
      if (!/^[a-f0-9]{32}$/.test(taiKhoan.salt)) {
        continue;
      }
      if (!/^[a-f0-9]{64}$/.test(taiKhoan.passwordHash)) {
        continue;
      }
      danhSachHopLe.push(taiKhoan);
    }
    return danhSachHopLe;
  }

  function timTaiKhoan(danhSach, tenDangNhap) {
    for (let i = 0; i < danhSach.length; i++) {
      const taiKhoan = danhSach[i];
      if (taiKhoan.username === tenDangNhap) {
        return taiKhoan;
      }
    }
    return null;
  }

  function layTaiKhoanDangNhap() {
    const trangThai = luuTru.docJSON(luuTru.AUTH_KEY, null);
    if (!trangThai || typeof trangThai.username !== 'string') {
      return null;
    }
    const taiKhoan = timTaiKhoan(docTaiKhoan(), trangThai.username);
    if (taiKhoan) {
      return { username: trangThai.username };
    }
    return null;
  }

  // Đổi từng byte thành hai ký tự hệ 16 để lưu dưới dạng chuỗi JSON.
  function doiSangHex(cacByte) {
    let chuoiHex = '';
    for (let i = 0; i < cacByte.length; i++) {
      let kyTuHex = cacByte[i].toString(16);
      if (kyTuHex.length === 1) {
        kyTuHex = '0' + kyTuHex;
      }
      chuoiHex += kyTuHex;
    }
    return chuoiHex;
  }

  // Phần API bổ sung: trình duyệt tạo mã băm; không tự viết thuật toán mật mã.
  // await cần thiết vì Web Crypto trả kết quả bất đồng bộ.
  async function bamMatKhau(matKhau, chuoiNgauNhien) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Hãy mở bằng Live Server trên localhost hoặc 127.0.0.1 để dùng đăng ký.');
    }
    const cacByteNgauNhien = new Uint8Array(chuoiNgauNhien.length / 2);
    for (let i = 0; i < cacByteNgauNhien.length; i++) {
      const capKyTu = chuoiNgauNhien.slice(i * 2, i * 2 + 2);
      cacByteNgauNhien[i] = parseInt(capKyTu, 16);
    }
    const khoa = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(matKhau), 'PBKDF2', false, ['deriveBits']
    );
    const ketQuaBam = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: cacByteNgauNhien, iterations: SO_LAN_BAM, hash: 'SHA-256' }, khoa, 256
    );
    return doiSangHex(new Uint8Array(ketQuaBam));
  }

  function kiemTraDangKy(tenNguoiDung, matKhau, nhapLaiMatKhau) {
    const cacLoi = {};
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(tenNguoiDung.trim())) {
      cacLoi.username = 'Tên đăng nhập gồm 3–24 ký tự: chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.';
    }
    if (matKhau.length < 8 || matKhau.length > 64 || !matKhau.trim()) {
      cacLoi.password = 'Mật khẩu phải có 8–64 ký tự và không chỉ chứa khoảng trắng.';
    }
    if (!nhapLaiMatKhau || matKhau !== nhapLaiMatKhau) {
      cacLoi.confirmPassword = 'Vui lòng nhập lại đúng mật khẩu.';
    }
    return cacLoi;
  }

  async function dangKy(tenNguoiDung, matKhau, nhapLaiMatKhau) {
    const mocBatDau = luuTru.docJSON(luuTru.RESET_KEY, null);
    const cacLoi = kiemTraDangKy(tenNguoiDung, matKhau, nhapLaiMatKhau);
    if (Object.keys(cacLoi).length) {
      return { ok: false, errors: cacLoi };
    }
    const tenDangNhap = tenNguoiDung.trim().toLowerCase();
    if (timTaiKhoan(docTaiKhoan(), tenDangNhap)) {
      return { ok: false, errors: { username: 'Tên đăng nhập này đã được đăng ký.' } };
    }
    const chuoiNgauNhien = doiSangHex(crypto.getRandomValues(new Uint8Array(16)));
    const maBam = await bamMatKhau(matKhau, chuoiNgauNhien);
    // SAU AWAIT: buổi demo có thể đã kết thúc trong lúc tạo mã băm.
    if (mocBatDau !== luuTru.docJSON(luuTru.RESET_KEY, null)) {
      return { ok: false, message: 'Buổi demo đã kết thúc. Hãy đăng ký lại nếu muốn bắt đầu buổi mới.' };
    }
    const danhSachTaiKhoan = docTaiKhoan(); // Đọc lại sau thao tác bất đồng bộ.
    if (timTaiKhoan(danhSachTaiKhoan, tenDangNhap)) {
      return { ok: false, errors: { username: 'Tên đăng nhập này đã được đăng ký.' } };
    }
    danhSachTaiKhoan.push({ username: tenDangNhap, salt: chuoiNgauNhien, passwordHash: maBam });
    if (!luuTru.luuJSON(luuTru.USERS_KEY, danhSachTaiKhoan)) {
      return { ok: false, message: 'Chưa lưu được tài khoản. Hãy cho phép LocalStorage rồi thử lại.' };
    }
    return { ok: true, username: tenDangNhap };
  }

  async function dangNhap(tenNguoiDung, matKhau) {
    const mocBatDau = luuTru.docJSON(luuTru.RESET_KEY, null);
    const tenDangNhap = tenNguoiDung.trim().toLowerCase();
    const taiKhoan = timTaiKhoan(docTaiKhoan(), tenDangNhap);
    if (!taiKhoan) {
      return { ok: false, message: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' };
    }
    const maBamVuaNhap = await bamMatKhau(matKhau, taiKhoan.salt);
    if (mocBatDau !== luuTru.docJSON(luuTru.RESET_KEY, null)) {
      return { ok: false, message: 'Buổi demo đã kết thúc. Trạng thái đăng nhập không được lưu.' };
    }
    const taiKhoanHienTai = timTaiKhoan(docTaiKhoan(), tenDangNhap);
    if (!taiKhoanHienTai || taiKhoanHienTai.passwordHash !== taiKhoan.passwordHash || taiKhoanHienTai.salt !== taiKhoan.salt) {
      return { ok: false, message: 'Tài khoản đã thay đổi. Vui lòng đăng nhập lại.' };
    }
    if (maBamVuaNhap !== taiKhoan.passwordHash) {
      return { ok: false, message: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' };
    }
    if (!luuTru.luuJSON(luuTru.AUTH_KEY, { username: tenDangNhap })) {
      return { ok: false, message: 'Chưa lưu được trạng thái đăng nhập.' };
    }
    window.dispatchEvent(new Event('account-changed'));
    return { ok: true };
  }

  function dangXuat() {
    const thanhCong = luuTru.xoaDuLieu(luuTru.AUTH_KEY);
    if (thanhCong) {
      window.dispatchEvent(new Event('account-changed'));
    }
    return thanhCong;
  }

  window.PCAstral.auth = {
    dangKy: dangKy,
    dangNhap: dangNhap,
    dangXuat: dangXuat,
    layTaiKhoanDangNhap: layTaiKhoanDangNhap,
    kiemTraDangKy: kiemTraDangKy
  };
}

khaiBaoTaiKhoan();
