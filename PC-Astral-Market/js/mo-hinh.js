// CHỨC NĂNG: mô hình sản phẩm và giỏ hàng. Không sửa HTML trong hai class này.
// Giữ tên Product, Cart và các trường JSON theo mẫu môn học; phương thức dùng tiếng Việt.
// constructor là từ khóa JavaScript để khởi tạo đối tượng, không đổi tên.
function khaiBaoMoHinh() {
  'use strict';

  class Product {
    // ÔN JS - CÂU 2: mỗi object giữ ID, tên, giá... của cùng một sản phẩm, tránh lệch chỉ số giữa nhiều mảng.
    constructor(duLieu) {
      // Bảy thuộc tính bắt buộc khớp mẫu của môn học.
      this.id = String(duLieu.id);
      this.name = duLieu.name;
      this.price = duLieu.price;
      this.imgUrl = duLieu.imgUrl;
      this.description = duLieu.description;
      this.category = duLieu.category;
      this.quantity = duLieu.quantity; // Tồn kho minh họa, KHÔNG phải số lượng mua.

      // Thông tin bổ sung để giữ các chức năng của PC-Astral Market.
      this.brand = duLieu.brand || 'Astral';
      this.summary = duLieu.summary || duLieu.description;
      this.specs = duLieu.specs || {};
      this.imageAlt = duLieu.imageAlt || duLieu.name;
      this.salePrice = null;
      if (duLieu.salePrice !== undefined && duLieu.salePrice !== null) {
        this.salePrice = duLieu.salePrice;
      }
      this.isNew = Boolean(duLieu.isNew);
      this.isHot = Boolean(duLieu.isHot);
      this.promotionId = duLieu.promotionId || null;
      this.sourceUrl = duLieu.sourceUrl || 'https://pcmarket.vn/';
    }

    // 1. Kiểm tra sản phẩm có đang được giảm giá hay không.
    dangGiamGia(thoiDiem) {
      if (thoiDiem === undefined) {
        thoiDiem = Date.now();
      }
      const khuyenMai = window.PCAstral.data.promotion;
      if (this.promotionId !== khuyenMai.id) {
        return false;
      }
      if (!Number.isFinite(this.salePrice) || this.salePrice < 0 || this.salePrice >= this.price) {
        return false;
      }
      return thoiDiem < Date.parse(khuyenMai.endsAt);
    }

    // 2. Lấy giá hiện hành; tất cả trang và giỏ dùng chung phương thức này.
    layGia(thoiDiem) {
      // dangGiamGia tự lấy giờ hiện tại nếu không truyền thoiDiem.
      if (this.dangGiamGia(thoiDiem)) {
        return this.salePrice;
      }
      return this.price;
    }

    // 3. Định dạng giá để hiển thị. Không dùng chuỗi tiền để tính toán.
    layGiaHienThi(thoiDiem) {
      const giaHienTai = this.layGia(thoiDiem);
      return giaHienTai.toLocaleString('vi-VN') + ' đ';
    }

    // 4. Kiểm tra còn hàng để bật hoặc khóa nút mua.
    conHang() {
      return this.quantity > 0;
    }

    // 5. Kiểm tra tổng số lượng muốn mua, kể cả hàng đã có trong giỏ.
    coTheMua(soLuong) {
      return Number.isSafeInteger(soLuong) && soLuong >= 1 && soLuong <= this.quantity;
    }

    // 6. Tra tên danh mục từ mã danh mục.
    layTenDanhMuc() {
      const danhSachDanhMuc = window.PCAstral.data.categories;
      for (let i = 0; i < danhSachDanhMuc.length; i++) {
        const danhMuc = danhSachDanhMuc[i];
        if (danhMuc.id === this.category) {
          return danhMuc.name;
        }
      }
      return this.category;
    }
  }

  class Cart {
    constructor(danhSachSanPham, dongGio, khiThayDoi) {
      if (dongGio === undefined) {
        dongGio = [];
      }
      if (khiThayDoi === undefined) {
        khiThayDoi = null;
      }
      this.danhSachSanPham = danhSachSanPham;
      this.khiThayDoi = khiThayDoi;
      this.items = this.kiemTraGio(dongGio);
    }

    timSanPham(maSanPham) {
      const maCanTim = String(maSanPham);
      for (let i = 0; i < this.danhSachSanPham.length; i++) {
        const sanPham = this.danhSachSanPham[i];
        if (sanPham.id === maCanTim) {
          return sanPham;
        }
      }
      return undefined;
    }

    // Tìm một dòng giỏ theo ID; dùng chung khi thêm và thay đổi số lượng.
    timDongGio(maSanPham) {
      const maCanTim = String(maSanPham);
      for (let i = 0; i < this.items.length; i++) {
        const dong = this.items[i];
        if (dong.productId === maCanTim) {
          return dong;
        }
      }
      return undefined;
    }

    // Dữ liệu LocalStorage có thể hỏng: bỏ ID lạ, số âm/lẻ, gộp trùng và chặn quá kho.
    kiemTraGio(duLieu) {
      if (!Array.isArray(duLieu)) {
        return [];
      }
      const gioHopLe = [];
      for (let viTriDong = 0; viTriDong < duLieu.length; viTriDong++) {
        const dong = duLieu[viTriDong];
        if (!dong || typeof dong !== 'object') {
          continue;
        }
        const sanPham = this.timSanPham(dong.productId);
        if (!sanPham || !sanPham.conHang()) {
          continue;
        }
        if (!Number.isSafeInteger(dong.quantity) || dong.quantity < 1) {
          continue;
        }
        let daCo = null;
        for (let i = 0; i < gioHopLe.length; i++) {
          if (gioHopLe[i].productId === sanPham.id) {
            daCo = gioHopLe[i];
            break;
          }
        }
        if (daCo) {
          daCo.quantity = Math.min(sanPham.quantity, daCo.quantity + dong.quantity);
        } else {
          gioHopLe.push({ productId: sanPham.id, quantity: Math.min(sanPham.quantity, dong.quantity) });
        }
      }
      return gioHopLe;
    }

    layGio() {
      // Trả bản sao để nơi khác không tự sửa dữ liệu rồi quên lưu/render.
      const banSao = [];
      for (let i = 0; i < this.items.length; i++) {
        const dong = this.items[i];
        banSao.push({ productId: dong.productId, quantity: dong.quantity });
      }
      return banSao;
    }

    baoGioThayDoi() {
      if (this.khiThayDoi) {
        return this.khiThayDoi(this.layGio());
      }
      return true; // Giỏ tạo riêng để luyện tập không tự ghi đè giỏ của website.
    }

    themSanPham(maSanPham, soLuong) {
      // ÔN JS - CÂU 3: tìm dòng theo ID, kiểm tra tổng lượng với tồn kho; đã có thì cộng, chưa có thì thêm dòng.
      if (soLuong === undefined) {
        soLuong = 1;
      }
      const sanPham = this.timSanPham(maSanPham);
      const dongCu = this.timDongGio(maSanPham);
      let soLuongCu = 0;
      if (dongCu) {
        soLuongCu = dongCu.quantity;
      }
      if (!sanPham || !Number.isSafeInteger(soLuong) || soLuong < 1) {
        return { ok: false, message: 'Số lượng vượt quá tồn kho hoặc không hợp lệ.' };
      }
      const tongSoLuong = soLuongCu + soLuong;
      if (!sanPham.coTheMua(tongSoLuong)) {
        return { ok: false, message: 'Số lượng vượt quá tồn kho hoặc không hợp lệ.' };
      }
      if (dongCu) {
        dongCu.quantity += soLuong;
      } else {
        // ÔN JS - CÂU 2: một dòng giỏ là object gồm productId và quantity; hai giá trị luôn đi cùng nhau.
        this.items.push({ productId: sanPham.id, quantity: soLuong });
      }
      return { ok: true, persisted: this.baoGioThayDoi() };
    }

    doiSoLuong(maSanPham, soLuong) {
      // ÔN JS - CÂU 5: 0, số âm/lẻ hoặc quá kho đều bị chặn, dữ liệu cũ giữ nguyên; muốn bỏ hàng dùng xoaSanPham.
      const sanPham = this.timSanPham(maSanPham);
      const dong = this.timDongGio(maSanPham);
      // Quy ước rõ: số lượng 0 bị chặn. Muốn bỏ hàng phải bấm Xóa.
      if (!sanPham || !dong || !sanPham.coTheMua(soLuong)) {
        return false;
      }
      dong.quantity = soLuong;
      this.baoGioThayDoi();
      return true;
    }

    xoaSanPham(maSanPham) {
      // Duyệt từ cuối về đầu để splice không làm bỏ sót dòng kế tiếp.
      const maCanXoa = String(maSanPham);
      for (let i = this.items.length - 1; i >= 0; i--) {
        if (this.items[i].productId === maCanXoa) {
          this.items.splice(i, 1);
        }
      }
      return this.baoGioThayDoi();
    }

    xoaGio() {
      const gioTruocKhiXoa = this.items;
      this.items = [];
      const daLuu = this.baoGioThayDoi();
      if (!daLuu) {
        this.items = gioTruocKhiXoa;
      }
      return daLuu;
    }

    // CHỨC NĂNG: tính thành tiền từng dòng, rồi cộng dồn từ 0 bằng vòng for.
    tinhTongGio(thoiDiem) {
      // ÔN JS - CÂU 4: dùng for để dễ theo dõi; thành tiền = giá hiện hành * số lượng, tổng = cộng các thành tiền.
      // ÔN JS - CÂU 4: tính từ dữ liệu Cart, không đọc chữ trên HTML; cùng thời điểm để giá giảm nhất quán.
      if (thoiDiem === undefined) {
        thoiDiem = Date.now();
      }
      const cacDong = [];
      let tongSoLuong = 0;
      let tongTien = 0;
      for (let i = 0; i < this.items.length; i++) {
        const dong = this.items[i];
        const sanPham = this.timSanPham(dong.productId);
        const donGia = sanPham.layGia(thoiDiem);
        const thanhTien = donGia * dong.quantity;
        cacDong.push({
          productId: dong.productId,
          quantity: dong.quantity,
          product: sanPham,
          unitPrice: donGia,
          subtotal: thanhTien
        });
        tongSoLuong += dong.quantity;
        tongTien += thanhTien;
      }
      return { lines: cacDong, quantity: tongSoLuong, total: tongTien, shipping: 0 };
    }

    layTongTien(thoiDiem) {
      return this.tinhTongGio(thoiDiem).total;
    }
  }

  window.PCAstral.models = { Product: Product, Cart: Cart };
}

khaiBaoMoHinh();
