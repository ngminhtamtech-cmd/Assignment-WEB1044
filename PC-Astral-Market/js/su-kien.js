// CHỨC NĂNG: khởi tạo ứng dụng và xử lý sự kiện dùng chung bằng event delegation.
function khaiBaoSuKien() {
  'use strict';
  const ungDung = window.PCAstral;
  const luuTru = ungDung.storage;

  function xuLyThemGio(suKien) {
    const gioHang = ungDung.cart;
    const thongBao = ungDung.ui.thongBao;
    const nut = suKien.target.closest('[data-add]');
    if (!nut) {
      return;
    }
    let soLuong = 1;
    if (nut.dataset.quantityInput) {
      soLuong = Number(document.getElementById(nut.dataset.quantityInput).value);
    }
    const ketQua = gioHang.themSanPham(nut.dataset.add, soLuong);
    if (!ketQua.ok) {
      thongBao(ketQua.message);
    } else if (!ketQua.persisted) {
      thongBao('Đã thêm vào giỏ tạm thời, nhưng chưa lưu được dữ liệu.');
    } else {
      thongBao('Đã thêm sản phẩm vào giỏ hàng.');
    }
  }

  function xuLyBamNutChung(suKien) {
    // target là phần tử bấm thực tế; closest tìm nút nếu bấm vào chữ/thẻ con trong nút.
    if (suKien.target.closest('[data-add]')) {
      xuLyThemGio(suKien);
    }
    if (suKien.target.closest('[data-end-demo]')) {
      const daDongY = window.confirm('Xóa giỏ, đơn demo, tài khoản và trạng thái đăng nhập của PC-Astral Market?');
      if (daDongY && luuTru.ketThucDemo()) {
        location.replace('index.html');
      }
    }
  }

  function xuLyLuuTruThayDoi(suKien) {
    if (suKien.key === luuTru.RESET_KEY) {
      location.replace('index.html');
      return;
    }
    if (suKien.key === luuTru.CART_KEY || suKien.key === null) {
      ungDung.cart.items = ungDung.cart.kiemTraGio(luuTru.docJSON(luuTru.CART_KEY, []));
      window.dispatchEvent(new Event('cart-changed'));
    }
    if (suKien.key === luuTru.USERS_KEY || suKien.key === luuTru.AUTH_KEY || suKien.key === null) {
      window.dispatchEvent(new Event('account-changed'));
    }
  }

  // Cart gọi hàm này sau mỗi lần sửa dữ liệu; các trang nghe cart-changed để render.
  function luuGio(dongGio) {
    const daLuu = luuTru.luuJSON(luuTru.CART_KEY, dongGio);
    window.dispatchEvent(new Event('cart-changed'));
    return daLuu;
  }

  async function khoiTaoWebsite() {
    const danhSachJSON = await ungDung.ready;
    if (ungDung.dataError) {
      const thongDiep = document.createElement('p');
      thongDiep.className = 'storage-warning';
      thongDiep.textContent = 'Không thể mở danh sách sản phẩm. ' + ungDung.dataError
        + ' Kiểm tra js/products.json và chạy bằng Live Server, sau đó tải lại trang.';
      document.getElementById('main').innerHTML = '';
      document.getElementById('main').appendChild(thongDiep);
      return;
    }
    const danhSachSanPham = [];
    for (let i = 0; i < danhSachJSON.length; i++) {
      const sanPham = new ungDung.models.Product(danhSachJSON[i]);
      danhSachSanPham.push(sanPham);
    }
    ungDung.data.products = danhSachSanPham;
    // GIỮ DỮ LIỆU KHI F5: đọc giỏ đã lưu, tạo lại đối tượng Cart từ các dòng JSON.
    const gioDaLuu = luuTru.docJSON(luuTru.CART_KEY, []);
    ungDung.cart = new ungDung.models.Cart(danhSachSanPham, gioDaLuu, luuGio);
    ungDung.khoiTaoHienThi();
    ungDung.ui.khoiTaoChung();
    document.addEventListener('click', xuLyBamNutChung);
    window.addEventListener('storage', xuLyLuuTruThayDoi);
    window.addEventListener('account-changed', ungDung.ui.capNhatTenTaiKhoan);
    const khoiTaoTrang = ungDung.pages[document.body.dataset.page];
    if (khoiTaoTrang) {
      khoiTaoTrang();
    }
    ungDung.initialized = true;
  }

  function baoLoiKhoiTao(loi) {
    const thongDiep = document.createElement('p');
    thongDiep.className = 'storage-warning';
    thongDiep.textContent = 'Khởi tạo chưa thành công: ' + loi.message;
    document.getElementById('main').prepend(thongDiep);
  }

  khoiTaoWebsite().catch(baoLoiKhoiTao);
}

khaiBaoSuKien();
