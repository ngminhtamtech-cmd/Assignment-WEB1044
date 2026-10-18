from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urljoin
from lxml import html
from concurrent.futures import ThreadPoolExecutor
BASE='https://pcmarket.vn'
CACHE=Path(__file__).resolve().parents[1]/'tmp/pcmarket'
def fetch(item):
    name,url=item
    text=urlopen(Request(urljoin(BASE,url),headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read().decode('utf-8')
    (CACHE/(name+'.html')).write_text(text,encoding='utf-8')
    tree=html.fromstring(text)
    links=tree.xpath('//a[contains(@class,"p-name")]')
    return name,[(a.text_content().strip(),a.get('href')) for a in links]
if __name__=='__main__':
    for name,rows in ThreadPoolExecutor(max_workers=3).map(fetch,[('laptop','/laptop'),('monitor','/monitor-man-hinh.html'),('accessory','/ban-phim-choi-game.html'),('mouse','/chuot-choi-game.html'),('desktop','/bo-pc-gaming-livestream.html'),('sample','/laptop-asus-tuf-gaming-16-fx610jh-tu008w')]):
        print(name,len(rows));print(*rows[:18],sep='\n')
