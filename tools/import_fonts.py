from pathlib import Path
from urllib.request import urlopen,Request
from concurrent.futures import ThreadPoolExecutor
import re,json
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'PC-Astral-Market'
FONT=SITE/'assets/fonts/sarabun';FONT.mkdir(parents=True,exist_ok=True)
s=(ROOT/'tmp/pcmarket/sarabun-google.css').read_text(encoding='utf-8')
blocks=[];jobs=[]
for m in re.finditer(r'/\* ([\w-]+) \*/\s*(@font-face\s*\{[^}]+\})',s):
 subset,block=m.groups()
 if subset=='thai':continue
 weight=re.search(r'font-weight:\s*(\d+)',block).group(1)
 url=re.search(r'url\(([^)]+)\)',block).group(1)
 name=f'sarabun-{weight}-{subset}.woff2'
 jobs.append((name,url));blocks.append(f'/* {subset} — {weight} */\n'+block.replace(url,'../assets/fonts/sarabun/'+name))
def fetch(job):
 name,url=job
 raw=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
 assert raw[:4]==b'wOF2'
 (FONT/name).write_bytes(raw)
with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(fetch,jobs))
(FONT/'OFL.txt').write_text((ROOT/'tmp/pcmarket/sarabun-OFL.txt').read_text(encoding='utf-8'),encoding='utf-8')
(FONT/'README.md').write_text('# Sarabun\n\nPhông chữ chính của PC Market, kiểm tra bằng computed style ngày 17/10/2026. Tác giả: The Sarabun Project Authors / Cadson Demak. Giấy phép SIL Open Font License 1.1 kèm trong OFL.txt.\n\nFont lấy từ Google Fonts và lưu nguyên bản WOFF2; gồm các độ đậm 400, 500, 600, 700, 800, bộ ký tự Latin, Latin mở rộng và tiếng Việt. Website không cần gọi CDN.\n\n- https://fonts.google.com/specimen/Sarabun\n- https://github.com/google/fonts/tree/main/ofl/sarabun\n- https://pcmarket.vn/static/assets/2021/script/pc_update_2021.css\n',encoding='utf-8')
(SITE/'css/fonts.css').write_text('/* Sarabun, SIL OFL 1.1. Local files support offline demos and Vietnamese. */\n'+'\n\n'.join(blocks)+'\n',encoding='utf-8')
(ROOT/'docs/typography-reference.json').write_text(json.dumps(dict(checkedAt='2026-10-17',reference='https://pcmarket.vn/',stylesheet='https://pcmarket.vn/static/assets/2021/script/pc_update_2021.css',computedBodyFont='Sarabun, sans-serif',computedProductFont='Sarabun, sans-serif',files=[dict(file=n,url=u) for n,u in jobs]),indent=2),encoding='utf-8')
print(f'Downloaded {len(jobs)} local WOFF2 files with OFL license.')
