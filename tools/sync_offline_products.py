"""Tạo bản JSON nhúng cho file:// từ products.json, không sửa dữ liệu gốc."""
from pathlib import Path
import json

SITE = Path(__file__).resolve().parents[1] / 'PC-Astral-Market'


def sync_offline_products():
    products = json.loads((SITE / 'js/products.json').read_text(encoding='utf-8'))
    json_text = json.dumps(products, ensure_ascii=False, separators=(',', ':'))
    script = (
        '// TỰ SINH từ products.json khi đóng gói. Không sửa trực tiếp file này.\n'
        '// Chỉ dùng cho mở HTML bằng file://; Live Server vẫn đọc products.json.\n'
        'window.PCAstral = window.PCAstral || {};\n'
        'window.PCAstral.offlineProductJSON = '
        + json.dumps(json_text, ensure_ascii=True) + ';\n'
    )
    (SITE / 'js/san-pham-du-phong.js').write_text(script, encoding='utf-8')
    return len(products)


if __name__ == '__main__':
    print('Synced', sync_offline_products(), 'products for file:// mode.')
