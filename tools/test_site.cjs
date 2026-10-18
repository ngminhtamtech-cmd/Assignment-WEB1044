const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const base = process.env.ASTRAL_TEST_URL || 'http://127.0.0.1:4173';
const results=[];
const errors=[];
const screenshots=path.join(root,'docs/screenshots');
fs.mkdirSync(screenshots,{recursive:true});
async function check(name, fn){try{await fn();results.push({name,status:'PASS'});console.log('PASS '+name);}catch(e){results.push({name,status:'FAIL',detail:e.message});console.log('FAIL '+name+' '+e.message);}}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Ho_Chi_Minh'});
 // Keep the demo test deterministic. A separate clock test covers the real expiry boundary.
 await context.addInitScript(()=>{const NativeDate=Date;const fixed=Date.parse('2026-10-16T10:00:00+07:00');window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const go=async url=>{await page.goto(base+'/'+url);await page.waitForLoadState('networkidle');};
 const snap=async name=>{await page.evaluate(async()=>{const images=[...document.images];images.forEach(img=>img.loading='eager');await Promise.all(images.map(img=>img.decode().catch(()=>{})));});await page.screenshot({path:path.join(screenshots,name+'.png'),fullPage:true});};
 await check('01. Trang chủ khởi tạo đủ ba nhóm, 24 sản phẩm / 4 danh mục',async()=>{
  await go('index.html');assert.equal(await page.locator('.product-card').count(),12);assert.equal(await page.locator('.category-tile').count(),4);
  const data=await page.evaluate(async()=>{const {products,categories}=window.PCAstral.data;return {length:products.length,counts:categories.map(c=>products.filter(p=>p.categoryId===c.id).length),new:products.filter(p=>p.isNew).length,hot:products.filter(p=>p.isHot).length,sale:products.filter(p=>p.salePrice).length};});
  assert.equal(data.length,24);assert.deepEqual(data.counts,[6,6,6,6]);assert(data.new>=6&&data.hot>=6&&data.sale>=6);await snap('01-home');
 });
 await check('02. Slider next / prev / dot / tự chuyển / dừng khi focus',async()=>{
  await page.locator('#next-slide').click();assert.equal(await page.locator('#slide-count').textContent(),'02 / 03');
  await page.locator('#prev-slide').click();assert.equal(await page.locator('#slide-count').textContent(),'01 / 03');
  await page.locator('[data-slide="2"]').click();assert.equal(await page.locator('#slide-count').textContent(),'03 / 03');
  await page.waitForTimeout(6500);assert.equal(await page.locator('#slide-count').textContent(),'03 / 03');
  await page.locator('#header-q').focus();await page.mouse.move(0,0);await page.waitForTimeout(6500);assert.equal(await page.locator('#slide-count').textContent(),'01 / 03');
 });
 await check('03. Tìm kiếm không dấu, không phân biệt hoa thường, không sửa mảng gốc',async()=>{
  await go('products.html?q=asus');assert.equal(await page.locator('.product-card').count(),4);
  const actual=await page.evaluate(async()=>{const u=window.PCAstral.utils;const d=window.PCAstral.data;const ids=d.products.map(p=>p.id).join();const a=u.selectProducts({q:'  ASUS  ',sort:'price-desc'});return {norm:u.normalize(' MÀN HÌNH ĐẸP '),length:a.length,unchanged:ids===d.products.map(p=>p.id).join()};});
  assert.equal(actual.norm,'man hinh dep');assert.equal(actual.length,4);assert(actual.unchanged);
 });
 await check('04. Lọc AND / giá biên / sắp xếp / reload / xóa lọc',async()=>{
  await go('products.html');await page.locator('#filter-category').selectOption('laptop');await page.locator('#filter-brand').selectOption('ASUS');await page.locator('#filter-price').selectOption('above30');assert.equal(await page.locator('.product-card').count(),2);
  await page.locator('#sort').selectOption('price-desc');await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('#filter-brand').inputValue(),'ASUS');assert.equal(await page.locator('#sort').inputValue(),'price-desc');await snap('02-products-filtered');
  await page.locator('#clear-filters').click();assert.equal(await page.locator('.product-card').count(),24);
  await page.locator('#sort').selectOption('price-asc');
  const prices=await page.locator('.price-line strong').allTextContents();const values=prices.map(x=>Number(x.replace(/\D/g,'')));assert.deepEqual(values,[...values].sort((a,b)=>a-b));
  const bounds=await page.evaluate(async()=>{const {products}=window.PCAstral.data;const {selectProducts}=window.PCAstral.utils;const p=products[1],old=p.price;p.price=15000000;const a=selectProducts({price:'5to15'}).some(x=>x.id===p.id),b=selectProducts({price:'15to30'}).some(x=>x.id===p.id);p.price=old;return [a,b];});assert.deepEqual(bounds,[false,true]);
  await go('products.html?q=khongtontai');assert.equal(await page.locator('.product-card').count(),0);assert(await page.locator('.empty-state').isVisible());
  await go('products.html?category=bad&price=bad&sort=bad');assert.equal(await page.locator('.product-card').count(),24);
 });
 await check('05. Chi tiết hợp lệ / thiếu ID / ID sai / hết hàng / ảnh dự phòng',async()=>{
  await go('product-detail.html?id=p01');assert((await page.locator('h1').textContent()).includes('ASUS'));await snap('03-product-detail');
  await page.evaluate(()=>document.querySelector('.detail-image img').dispatchEvent(new Event('error')));assert(await page.locator('.detail-image img').isHidden());assert.equal(await page.locator('.detail-image .image-fallback').textContent(),'Ảnh đang cập nhật');
  for(const url of ['product-detail.html','product-detail.html?id=unknown']){await go(url);assert((await page.locator('.empty-state h2').textContent()).includes('Không tìm thấy'));}
  await go('product-detail.html?id=p24');assert(await page.locator('[data-quantity-input]').isDisabled());
 });
 await check('06. Giỏ: thêm trùng, số lượng, tổng, lưu reload và xóa',async()=>{
  await go('product-detail.html?id=p01');await page.locator('[data-quantity-input]').click();await page.locator('[data-quantity-input]').click();assert.equal(await page.locator('[data-cart-count]').textContent(),'2');
  await go('cart.html');assert.equal(await page.locator('[data-quantity]').inputValue(),'2');
  assert((await page.locator('.summary-total strong').textContent()).includes('77.980.000'));
  await page.locator('[data-quantity]').fill('3');await page.locator('[data-quantity]').dispatchEvent('change');
  await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('[data-quantity]').inputValue(),'3');
  for(const value of ['0','-1','1.5','99']){await page.locator('[data-quantity]').fill(value);await page.locator('[data-quantity]').dispatchEvent('change');assert.equal(await page.locator('[data-quantity]').inputValue(),'3');}
  await snap('04-cart');await page.locator('[data-remove]').click();assert(await page.locator('.empty-state').isVisible());
 });
 await check('07. Storage JSON hỏng / ID lạ / số lượng sai / gộp trùng',async()=>{
  await page.evaluate(()=>localStorage.setItem('pc-astral.cart.v1','{bad'));await page.reload();await page.waitForLoadState('networkidle');assert(await page.locator('.empty-state').isVisible());assert(await page.locator('#storage-warning').isVisible());
  await page.evaluate(()=>localStorage.setItem('pc-astral.cart.v1',JSON.stringify([{productId:'p01',quantity:2},{productId:'p01',quantity:999},{productId:'unknown',quantity:1},{productId:'p24',quantity:1},{productId:'p02',quantity:-1},{productId:'p03',quantity:1.5}])));
  await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('.cart-row').count(),1);assert.equal(await page.locator('[data-quantity]').inputValue(),'5');
 });
 await check('08. Đồng bộ giỏ giữa hai tab',async()=>{
  const second=await context.newPage();await second.goto(base+'/product-detail.html?id=p02');await second.locator('[data-quantity-input]').click();await page.waitForFunction(()=>document.querySelectorAll('.cart-row').length===2);await second.close();
 });
 await check('09. Validation rỗng / khoảng trắng / email sai / điện thoại sai',async()=>{
  await go('checkout.html');await page.locator('#place-order').click();assert.equal(await page.locator('[aria-invalid="true"]').count(),4);assert.equal(await page.locator(':focus').getAttribute('id'),'name');
  await page.locator('#name').fill('   ');await page.locator('#email').fill('wrong');await page.locator('#phone').fill('123');await page.locator('#place-order').click();assert.equal(await page.locator('[aria-invalid="true"]').count(),4);await snap('05-checkout-errors');
 });
 await check('10. Đặt hàng hợp lệ / chuẩn hóa +84 / chống lặp / reload xác nhận',async()=>{
  await page.locator('#name').fill('Nguyễn Văn An');await page.locator('#email').fill('an@example.com');await page.locator('#phone').fill('+84 901 234 567');await page.locator('#address').fill('123 Đường Mẫu, Phường Minh Họa, TP. Hồ Chí Minh');await page.locator('#note').fill('<script>alert(1)</script>');await snap('06-checkout');
  await page.locator('#place-order').click();assert(await page.locator('.confirmation').isVisible());
  const stored=await page.evaluate(()=>({order:JSON.parse(sessionStorage.getItem('pc-astral.last-order.v1')),cart:JSON.parse(localStorage.getItem('pc-astral.cart.v1'))}));assert.equal(stored.cart.length,0);assert.equal(stored.order.customer.phone,'0901234567');assert.equal(stored.order.lines.length,2);
  await page.reload();await page.waitForLoadState('networkidle');assert(await page.locator('.confirmation').isVisible());await snap('07-order-confirmation');
  await go('checkout.html');assert(await page.locator('.empty-state').isVisible());
 });
 await check('11. SessionStorage bị chặn: giữ giỏ, không báo đặt hàng thành công',async()=>{
  await go('product-detail.html?id=p02');await page.locator('[data-quantity-input]').click();await go('checkout.html');
  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='pc-astral.last-order.v1')throw new DOMException('Blocked','SecurityError');return original.call(this,k,v);};});
  for(const [key,value]of Object.entries({name:'Nguyễn Văn An',email:'an@example.com',phone:'0901234567',address:'Địa chỉ thử nghiệm'}))await page.locator('#'+key).fill(value);
  await page.locator('#place-order').click();assert(await page.locator('.confirmation').isHidden());assert.equal(await page.locator('[data-cart-count]').textContent(),'1');assert(await page.locator('#storage-warning').isVisible());assert(await page.locator('#place-order').isEnabled());
 });
 await check('12. LocalStorage bị chặn: cảnh báo và giỏ tạm thời',async()=>{
  const isolated=await browser.newContext();await isolated.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});const p=await isolated.newPage();await p.goto(base+'/product-detail.html?id=p01');await p.locator('[data-quantity-input]').click();assert.equal(await p.locator('[data-cart-count]').textContent(),'1');assert(await p.locator('#storage-warning').isVisible());await isolated.close();
 });
 await check('13. Countdown hết hạn / giá trở về giá thường / tổng giỏ cập nhật',async()=>{
  const isolated=await browser.newContext();const p=await isolated.newPage();await p.clock.install({time:new Date('2026-10-30T23:59:57+07:00')});await p.goto(base+'/index.html');
  assert.equal(await p.locator('#sale-grid .product-card').count(),4);await p.clock.fastForward(4000);assert((await p.locator('#countdown').textContent()).includes('đã kết thúc'));assert.equal(await p.locator('#sale-grid .product-card').count(),0);
  await p.goto(base+'/product-detail.html?id=p01');assert((await p.locator('.detail-price strong').textContent()).includes('41.990.000'));await p.locator('[data-quantity-input]').click();await p.goto(base+'/cart.html');assert((await p.locator('.summary-total strong').textContent()).includes('41.990.000'));await isolated.close();
 });
 await check('14. Sáu trang responsive 390 / 768 / 1440, không tràn ngang',async()=>{
  for(const width of [390,768,1440]){
   await page.setViewportSize({width,height:1000});
   for(const url of ['index.html','products.html','product-detail.html?id=p01','cart.html','checkout.html','about.html']){await go(url);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow,`${width} ${url} overflow`);}
   if(width===390){await go('index.html');await snap('09-mobile-home');await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await go('products.html');await page.locator('#filter-toggle').click();assert(await page.locator('#filters').isVisible());await snap('10-mobile-products');}
  }
  await go('about.html');await snap('08-about');
 });
 await check('15. Bàn phím: skip link và thao tác tìm kiếm',async()=>{
  await go('index.html');await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('class'),'skip-link');await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#main');
  await page.locator('#header-q').fill('Acer');await page.locator('#header-q').press('Enter');await page.waitForLoadState('networkidle');assert.equal(await page.locator('.product-card').count(),2);
 });
 await check('18. 24 ảnh thật cục bộ / nguồn rõ ràng / không còn SVG',async()=>{
  await go('products.html');
  const audit=await page.evaluate(async()=>{const {products}=window.PCAstral.data;const images=[...document.querySelectorAll('.product-visual img')];images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode()));return {ok:products.every(p=>/\.(jpg|png|webp)$/.test(p.image)&&p.sourceUrl.startsWith('https://pcmarket.vn/')&&Object.keys(p.specs).length>=4),loaded:images.filter(i=>i.naturalWidth>0).length,svgs:document.querySelectorAll('svg').length};});
  assert(audit.ok);assert.equal(audit.loaded,24);assert.equal(audit.svgs,0);
  for(const file of fs.readdirSync(path.join(root,'PC-Astral-Market/js'))){assert(!/<svg|\.svg[\x22\x27]/i.test(fs.readFileSync(path.join(root,'PC-Astral-Market/js',file),'utf8')),file);}
 });
 await check('16. Không có lỗi JavaScript, console hoặc HTTP',async()=>assert.deepEqual(errors,[]));
 await browser.close();
 await check('17. Edge: khởi tạo, mua hàng, lưu giỏ và responsive',async()=>{
  const edge=await chromium.launch({channel:'msedge',headless:true});try{const p=await edge.newPage({viewport:{width:390,height:844}});const edgeErrors=[];p.on('pageerror',e=>edgeErrors.push(e.message));await p.goto(base+'/product-detail.html?id=p02');await p.locator('[data-quantity-input]').click();await p.goto(base+'/cart.html');await p.reload();assert.equal(await p.locator('[data-quantity]').inputValue(),'1');assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));await p.goto(base+'/checkout.html');await p.locator('#place-order').click();assert.equal(await p.locator('[aria-invalid="true"]').count(),4);assert.deepEqual(edgeErrors,[]);}finally{await edge.close();}
 });
 fs.writeFileSync(path.join(root,'docs/test-results.json'),JSON.stringify({date:new Date().toISOString().slice(0,10),base,browsers:['Google Chrome','Microsoft Edge'],results,errors},null,2));
 fs.writeFileSync(path.join(root,'docs/test-results.md'),'# Kết quả kiểm thử PC-Astral Market\n\nNgày: 17/10/2026. Kiểm thử sau refactor script defer. Chạy bằng Playwright với Chrome và Edge cài trên máy. Phục vụ HTTP tĩnh localhost.\n\n'+results.map(r=>`- **${r.status}** ${r.name}${r.detail?' — '+r.detail:''}`).join('\n')+'\n');
 console.log(`${results.filter(r=>r.status==='PASS').length}/${results.length} checks passed`);
 if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
