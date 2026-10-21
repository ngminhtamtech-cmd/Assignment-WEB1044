// CHỨC NĂNG: cấu hình danh mục/banner và nạp dữ liệu JSON sản phẩm.
// Thêm/sửa sản phẩm tại js/products.json; phải đủ 7 trường theo mẫu môn học.
// fetch chỉ đọc tệp tĩnh trong dự án, KHÔNG gọi backend hay API bán hàng.
window.PCAstral = window.PCAstral || {};
window.PCAstral.data = {
  "categories": [
    {
      "id": "laptop",
      "name": "Laptop",
      "tagline": "Học tập & gaming",
      "image": "img/p01.jpg"
    },
    {
      "id": "desktop",
      "name": "PC để bàn",
      "tagline": "Cấu hình lắp ráp",
      "image": "img/p07.jpg"
    },
    {
      "id": "monitor",
      "name": "Màn hình",
      "tagline": "Góc nhìn sắc nét",
      "image": "img/p13.jpg"
    },
    {
      "id": "accessory",
      "name": "Phụ kiện",
      "tagline": "Hoàn thiện góc máy",
      "image": "img/p19.png"
    }
  ],
  "promotion": {
    "id": "astral-launch",
    "name": "Astral Launch Sale",
    "endsAt": "2026-10-30T23:59:59+07:00"
  },
  "banners": [
    {
      "eyebrow": "PC GAMING / CẤU HÌNH NỔI BẬT",
      "title": "Sẵn sàng cho\ntrận game mới.",
      "description": "Ryzen 5 5500 cùng RTX 5050 8GB. Khám phá PC lắp ráp và chọn cấu hình cho góc máy của bạn.",
      "cta": "Xem cấu hình PC",
      "link": "product-detail.html?id=p07",
      "image": "img/p07.jpg",
      "caption": "AMD RYZEN 5 5500 / RTX 5050",
      "spec": "Ảnh sản phẩm từ PC Market"
    },
    {
      "eyebrow": "LAPTOP ASUS TUF GAMING",
      "title": "Học hết mình.\nChơi hết sức.",
      "description": "ASUS TUF Gaming 16: Core i5-14450HX, RAM 16GB và RTX 5050 trong một chiếc laptop.",
      "cta": "Khám phá laptop",
      "link": "product-detail.html?id=p01",
      "image": "img/p01.jpg",
      "caption": "ASUS TUF GAMING 16",
      "spec": "FX610JH-TU008W"
    },
    {
      "eyebrow": "MÀN HÌNH GAMING 240HZ",
      "title": "Mượt từng khung.\nRõ từng chi tiết.",
      "description": "ASUS TUF VG259QM5A, màn hình 24.5 inch Fast IPS Full HD, tần số quét 240Hz.",
      "cta": "Xem màn hình",
      "link": "product-detail.html?id=p13",
      "image": "img/p13.jpg",
      "caption": "ASUS TUF VG259QM5A",
      "spec": "24.5 inch / FHD / Fast IPS / 240Hz"
    }
  ]
};
window.PCAstral.pages = {};
window.PCAstral.initialized = false;

// CHỨC NĂNG: kiểm tra từng trường. Gặp trường sai thì dừng và trả false.
function kiemTraSanPham(sanPham) {
  if (!sanPham || typeof sanPham !== 'object') {
    return false;
  }
  const kieuMa = typeof sanPham.id;
  if (kieuMa !== 'string' && kieuMa !== 'number') {
    return false;
  }
  if (String(sanPham.id).trim() === '') {
    return false;
  }
  if (typeof sanPham.name !== 'string' || sanPham.name.trim() === '') {
    return false;
  }
  if (!Number.isSafeInteger(sanPham.price) || sanPham.price < 0) {
    return false;
  }
  if (typeof sanPham.imgUrl !== 'string' || !/^img\/[a-zA-Z0-9_.-]+$/.test(sanPham.imgUrl)) {
    return false;
  }
  if (typeof sanPham.description !== 'string') {
    return false;
  }
  if (typeof sanPham.category !== 'string' || sanPham.category.trim() === '') {
    return false;
  }
  if (!Number.isSafeInteger(sanPham.quantity) || sanPham.quantity < 0) {
    return false;
  }
  return true;
}

function boSungDanhMuc(sanPham) {
  const danhSachDanhMuc = window.PCAstral.data.categories;
  for (let i = 0; i < danhSachDanhMuc.length; i++) {
    if (danhSachDanhMuc[i].id === sanPham.category) {
      return; // Danh mục đã có, không thêm trùng.
    }
  }
  danhSachDanhMuc.push({
    id: sanPham.category,
    name: sanPham.category,
    tagline: 'Khám phá sản phẩm',
    image: sanPham.imgUrl
  });
}

// Đọc file JSON cần chờ trình duyệt: await chờ kết quả rồi mới chạy dòng tiếp.
// Không cần học thuộc Promise để sửa sản phẩm; chỉ sửa js/products.json.
async function napDuLieuSanPham() {
  try {
    let danhSachJSON;
    // MỞ TRỰC TIẾP: file:// không cho fetch JSON. Đọc bản JSON nhúng đã đóng gói.
    // Không tắt bảo mật trình duyệt, không gọi mạng trong chế độ này.
    if (window.location.protocol === 'file:') {
      if (typeof window.PCAstral.offlineProductJSON !== 'string') {
        throw new Error('Thiếu js/san-pham-du-phong.js. Hãy giải nén đầy đủ gói website mới.');
      }
      danhSachJSON = JSON.parse(window.PCAstral.offlineProductJSON);
    } else {
      // LIVE SERVER: luôn đọc JSON gốc để thay đổi sản phẩm có hiệu lực khi F5.
      const phanHoi = await fetch('js/products.json', { cache: 'no-store' });
      if (!phanHoi.ok) {
        throw new Error('Không đọc được tệp js/products.json.');
      }
      danhSachJSON = await phanHoi.json();
    }
    if (!Array.isArray(danhSachJSON) || danhSachJSON.length < 6) {
      throw new Error('Dữ liệu phải là mảng JSON có ít nhất 6 sản phẩm.');
    }
    const cacMa = [];
    for (let i = 0; i < danhSachJSON.length; i++) {
      const sanPham = danhSachJSON[i];
      if (!kiemTraSanPham(sanPham)) {
        throw new Error('Sản phẩm thiếu trường hoặc sai kiểu dữ liệu.');
      }
      const maSanPham = String(sanPham.id);
      if (cacMa.indexOf(maSanPham) !== -1) {
        throw new Error('Sản phẩm bị trùng mã.');
      }
      cacMa.push(maSanPham);
      boSungDanhMuc(sanPham);
    }
    return danhSachJSON;
  } catch (loi) {
    // su-kien.js dùng thông báo này để tránh hiển thị một trang trắng.
    window.PCAstral.dataError = loi.message;
    return [];
  }
}

// su-kien.js chờ dữ liệu nạp xong trước khi tạo Product, Cart và giao diện.
window.PCAstral.ready = napDuLieuSanPham();
