"""Import a fixed, reviewable set of 24 PC Market product pages and original photos.
Run only when intentionally refreshing the source snapshot. Website stays offline.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor
from lxml import html
from PIL import Image
import json, re, io

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT/'tmp/pcmarket'
BASE = 'https://pcmarket.vn'
PHOTO = ROOT/'PC-Astral-Market/assets/images/products'
DATE = '2026-10-16'
def clean(value): return ' '.join(value.split())
def get(url):
    return urlopen(Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=45).read()
def number(value): return int(re.sub(r'\D', '', value) or 0)
selections = [('laptop','laptop',[9,10,0,1,16,17]),('desktop','desktop',[0,1,2,3,4,5]),('monitor','monitor',[0,1,2,8,9,11]),('accessory','accessory',[0,4,8]),('mouse','accessory',[1,2,14])]
jobs=[]
for filename,category,indices in selections:
    tree=html.fromstring((CACHE/(filename+'.html')).read_text(encoding='utf-8'))
    links=tree.xpath('//a[contains(@class,"p-name")]')
    for i in indices: jobs.append((f'p{len(jobs)+1:02}',category,urljoin(BASE,links[i].get('href'))))
def fetch(job):
    pid,category,url=job
    page=CACHE/(pid+'.html')
    if not page.exists(): page.write_bytes(get(url))
    tree=html.fromstring(page.read_bytes())
    name=clean(tree.xpath('//h1')[0].text_content())
    price=number(tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," pd-price ")]')[0].text_content())
    dels=tree.xpath('//*[contains(@class,"pd-market-price")]')
    original=number(dels[0].text_content()) if dels else price
    imageurl=urljoin(BASE,tree.xpath('//meta[@property="og:image"]/@content')[0])
    assert urlparse(imageurl).hostname=='pcmarket.vn'
    raw=get(imageurl)
    with Image.open(io.BytesIO(raw)) as image:
        image.verify()
        extension={'JPEG':'.jpg','PNG':'.png','WEBP':'.webp'}[image.format]
    relative='assets/images/products/'+pid+extension
    (ROOT/'PC-Astral-Market'/relative).write_bytes(raw)
    specs=[];section=''
    for row in tree.xpath('//table//tr'):
        cells=[clean(" ".join(c.itertext())) for c in row.xpath('./td|./th')]
        if len(cells)==1:section=cells[0]
        elif len(cells)>=2 and cells[0] and cells[1]:specs.append({'section':section,'label':cells[0],'value':cells[1],'extra':cells[2:]})
    return dict(id=pid,categoryId=category,sourceName=name,sourcePrice=price,sourceOriginalPrice=original,sourceUrl=url,sourceImageUrl=imageurl,sourceRetrievedAt=DATE,image=relative,sourceSpecs=specs)
if __name__=='__main__':
    rows=list(ThreadPoolExecutor(max_workers=3).map(fetch,jobs))
    (ROOT/'docs/product-sources.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    for r in rows: print(r['id'],r['sourcePrice'],r['image'],r['sourceName'][:75],len(r['sourceSpecs']))
