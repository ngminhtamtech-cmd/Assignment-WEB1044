"""Build JS and source attribution from the downloaded PC Market snapshot, offline."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'PC-Astral-Market'
rows=json.loads((ROOT/'docs/product-sources.json').read_text(encoding='utf-8'))
names=['ASUS TUF Gaming 16 FX610JH-TU008W','ASUS TUF Gaming A16 FA607NUQ-RL007W','HP Victus 16-s0138AX 9Q985PA','HP OMEN 16-am0178TX BX8Y4PA','Acer Nitro ProPanel ANV15-52-50VA','Acer Aspire 7 A715-59G-53RH','PC AMD Ryzen 5 5500 / RTX 5050','PC Gaming i5-12400F / RTX 3060 12GB','PC AMD Ryzen 7 5700X / RTX 5060','PC Ultra i5-12400F / RTX 5060','PC Ultra i5-14400F / RTX 5050','PC AMD Ryzen 7 5700X / RTX 3050 6GB','ASUS TUF Gaming VG259QM5A','AOC 24G50Z','LG UltraGear 25G523B-B','ViewSonic VX24G30','MSI MAG 272F X24','GIGABYTE GS25F2','DareU EK98L Grey Black','DareU EK87 Pro Black Golden','DareU EK75 Pro Sakura Pink','ASUS TUF M3 Gen II','Logitech G502X Đen','Logitech G102 Gen2 Lightsync Black']
summaries=['Core i5-14450HX · 16GB · RTX 5050','Ryzen 7 170 · 16GB · RTX 4050','Ryzen 7-7840HS · 32GB · RTX 4070','Core Ultra 5 225H · 16GB · RTX 5060','Core 5 210H · 16GB · RTX 3050','Core 5 210H · 16GB · RTX 4050','Ryzen 5 5500 · RTX 5050 8GB','Core i5-12400F · RTX 3060 12GB','Ryzen 7 5700X · RTX 5060 8GB','Core i5-12400F · 16GB · RTX 5060','Core i5-14400F · RTX 5050 8GB','Ryzen 7 5700X · RTX 3050 6GB','24.5 inch · Fast IPS · FHD · 240Hz','23.8 inch · IPS · FHD · 260Hz','25 inch · IPS · FHD · 200Hz','24 inch · IPS · FHD · 240Hz','27 inch · IPS · FHD · 240Hz','24.5 inch · IPS · FHD · 200Hz','Dream switch · PBT · RGB · Có dây','Dream switch · Triple Mode · RGB','Dream switch · Triple Mode · Hồng','Có dây · 8.000 DPI · 59g','Chuột gaming có dây · Màu đen','Có dây USB · RGB · 8.000 DPI']
brands=['ASUS','ASUS','HP','HP','Acer','Acer']+['PC lắp ráp']*6+['ASUS','AOC','LG','ViewSonic','MSI','GIGABYTE','DareU','DareU','DareU','ASUS','Logitech','Logitech']
categories=[dict(id=cid,name=name,tagline=tag,image=rows[i]['image']) for cid,name,tag,i in [('laptop','Laptop','Học tập & gaming',0),('desktop','PC để bàn','Cấu hình lắp ráp',6),('monitor','Màn hình','Góc nhìn sắc nét',12),('accessory','Phụ kiện','Hoàn thiện góc máy',18)]]
products=[]
for i,row in enumerate(rows):
    specs={}
    if row['categoryId']=='laptop':
        for s in row['sourceSpecs']:
            label=s['label'];section=s['section'];key=None
            if label=='Tên bộ vi xử lý':key='Bộ vi xử lý'
            elif label=='Dung lượng' and 'RAM' in section:key='RAM'
            elif label=='Dung lượng' and 'SSD' in section:key='Ổ cứng'
            elif label=='Màn hình':key='Màn hình'
            elif label=='Bộ xử lý' and 'VGA' in section:key='Card đồ họa'
            elif label=='Hệ điều hành đi kèm':key='Hệ điều hành'
            elif label=='Bluetooth':key='Bluetooth'
            if key:specs[key]=s['value']
    elif row['categoryId']=='desktop':
        for s in row['sourceSpecs']:
            if s['label'].isdigit():
                value=s['value'];v=value.lower()
                key=next((label for token,label in [('cpu','Bộ vi xử lý'),('mainboard','Bo mạch chủ'),('ram','RAM'),('ổ cứng','Ổ cứng'),('nguồn','Nguồn'),('card','Card đồ họa'),('vỏ','Vỏ case'),('tản','Tản nhiệt')] if v.startswith(token)), 'Linh kiện '+s['label'])
                specs[key]=value
    else:
        for s in row['sourceSpecs']:
            # G102 source mixes variants: omit variant-dependent names and colors.
            if s['label'].lower().rstrip(':') in ['tên sản phẩm','màu sắc','bảo hành','thương hiệu','hãng sản xuất','model']:continue
            if len(s['value'])<=200 and len(specs)<10:specs[s['label'].rstrip(':')]=s['value']
    assert len(specs)>=4,(row['id'],specs)
    sale=i%3==0 and row['sourceOriginalPrice']>row['sourcePrice']
    item={k:row[k] for k in ['id','categoryId','image','sourceUrl','sourceImageUrl','sourceRetrievedAt']}
    item.update(name=names[i],brand=brands[i],summary=summaries[i],price=row['sourceOriginalPrice'] if sale else row['sourcePrice'],salePrice=row['sourcePrice'] if sale else None,imageAlt='Ảnh sản phẩm '+names[i],description={'laptop':'Laptop dành cho học tập, công việc và giải trí. Đối chiếu cấu hình bên dưới để lựa chọn theo nhu cầu sử dụng.','desktop':'Bộ PC lắp ráp với các linh kiện được liệt kê trong bảng cấu hình. Ảnh thể hiện bộ máy tham khảo trên trang nguồn.','monitor':'Màn hình gaming cho góc máy cá nhân. Kích thước, độ phân giải và tần số quét được trình bày ở bảng thông số.','accessory':'Phụ kiện cho thao tác hằng ngày và giải trí. Xem thông số kết nối, thiết kế và tính năng để chọn thiết bị phù hợp.'}[row['categoryId']],specs=specs,stock=0 if i==23 else 5+i%8,isNew=i%3==1,isHot=i%3==2,promotionId='astral-launch' if sale else None)
    products.append(item)
assert sum(p['salePrice'] is not None for p in products)>=6
banners=[dict(eyebrow='PC GAMING / CẤU HÌNH NỔI BẬT',title='Sẵn sàng cho\ntrận game mới.',description='Ryzen 5 5500 cùng RTX 5050 8GB. Khám phá PC lắp ráp và chọn cấu hình cho góc máy của bạn.',cta='Xem cấu hình PC',link='product-detail.html?id=p07',image=products[6]['image'],caption='AMD RYZEN 5 5500 / RTX 5050',spec='Ảnh sản phẩm từ PC Market'),dict(eyebrow='LAPTOP ASUS TUF GAMING',title='Học hết mình.\nChơi hết sức.',description='ASUS TUF Gaming 16: Core i5-14450HX, RAM 16GB và RTX 5050 trong một chiếc laptop.',cta='Khám phá laptop',link='product-detail.html?id=p01',image=products[0]['image'],caption='ASUS TUF GAMING 16',spec='FX610JH-TU008W'),dict(eyebrow='MÀN HÌNH GAMING 240HZ',title='Mượt từng khung.\nRõ từng chi tiết.',description='ASUS TUF VG259QM5A, màn hình 24.5 inch Fast IPS Full HD, tần số quét 240Hz.',cta='Xem màn hình',link='product-detail.html?id=p13',image=products[12]['image'],caption='ASUS TUF VG259QM5A',spec='24.5 inch / FHD / Fast IPS / 240Hz')]
# The data loader and banner configuration in du-lieu.js are maintained by hand.
# Rebuild only the JSON product catalogue, keeping the seven required fields.
for product in products:
    product['imgUrl'] = product.pop('image').replace('assets/images/products/', 'img/')
    product['category'] = product.pop('categoryId')
    product['quantity'] = product.pop('stock')
(SITE/'js/products.json').write_text(json.dumps(products,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
from sync_offline_products import sync_offline_products
sync_offline_products()
sources='# Nguồn tài nguyên PC-Astral Market\n\nẢnh, tên model, cấu hình và giá tham khảo được lấy từ [PC Market](https://pcmarket.vn/) ngày **16/10/2026** theo yêu cầu của người dùng. Ảnh JPG/PNG được lưu nguyên bản trong dự án; không cần CDN khi chạy demo. Quyền hình ảnh thuộc chủ sở hữu tương ứng; không tuyên bố đây là ảnh tự tạo.\n\nPC-Astral Market là thương hiệu bài tập độc lập. Không sao chép logo, địa chỉ, hotline hoặc quy trình đặt hàng của PC Market. Logo thể hiện bằng chữ, điều khiển dùng nút văn bản; không dùng SVG.\n\nGiá là bản chụp tại thời điểm thu thập, không cập nhật trực tiếp. 8 sản phẩm dùng cặp giá thường/giá giảm từ nguồn cho chiến dịch mô phỏng kết thúc 30/10/2026; các sản phẩm khác dùng giá bán đã ghi nhận. Nhãn mới/hot, số lượng tồn kho và thời hạn countdown do dự án đặt để kiểm thử, không đại diện cho trạng thái PC Market. Trang G102 có bảng lẫn biến thể màu trắng/đen; chỉ dùng tên biến thể từ tiêu đề và các thông số không phụ thuộc màu.\n\n## 24 sản phẩm và ảnh gốc\n\n'
for p,row in zip(products,rows):sources+=f"- **{p['id']} — {p['name']}**: [Trang sản phẩm]({p['sourceUrl']}) · [Ảnh gốc]({p['sourceImageUrl']}) · file `{p['imgUrl']}`. Giá nguồn: {row['sourcePrice']:,} VNĐ.\n"
sources+='\n## Công nghệ và tài liệu\n\nWebsite sử dụng HTML5, CSS3, JavaScript thuần nạp bằng script defer; không cài thư viện chạy ngoài. DOM, Storage, timer và URLSearchParams là API trình duyệt.\n\n- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)\n- [MDN Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)\n- [MDN script và defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)\n\nBanner được dàn trang bằng HTML/CSS kết hợp ảnh sản phẩm đã dẫn nguồn. Sơ đồ báo cáo do dự án tạo; ảnh minh chứng chụp từ website local. Công cụ tạo tài liệu và kiểm thử không nằm trong mã chạy của website.\n'
(SITE/'ASSET-SOURCES.md').write_text(sources,encoding='utf-8')
print('Built 24 real-photo products with attribution.')

# Preserve typography attribution when rebuilding product data.
font_readme=SITE/"assets/fonts/sarabun/README.md"
if font_readme.exists():
    with (SITE/"ASSET-SOURCES.md").open("a",encoding="utf-8") as f:
        f.write("\n## Phông chữ\n\nSarabun theo PC Market; font lưu cục bộ, có tiếng Việt và giấy phép SIL OFL 1.1. Xem assets/fonts/sarabun/README.md.\n")
