// Chỉ kiểm tra bản sao luyện bảo vệ; không ghi website hay log kiểm thử cũ.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'), practice=path.join(root,'tmp/defense/practice');
const results=[];const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const p=path.resolve(practice,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!p.startsWith(practice+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res);});
async function fillOrder(p){for(const [key,val] of Object.entries({name:'Sinh viên Ôn tập',email:'onthi@example.com',phone:'0901234567',address:'Địa chỉ demo, Đà Nẵng',note:'Luyện bảo vệ'}))await p.locator('#'+key).fill(val);}
async function run(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 for(let n=1;n<=10;n++){
  const id='C'+String(n).padStart(2,'0');const folder=path.join(practice,id,'Bài luyện có dấu','PC-Astral-Market');
  const url=base+'/'+id+'/'+encodeURIComponent('Bài luyện có dấu')+'/PC-Astral-Market/';
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Ho_Chi_Minh'});const p=await context.newPage();const errors=[];const failures=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
  if(id==='C05')await p.clock.install({time:new Date('2026-10-22T10:00:00+07:00')});
  else await context.addInitScript(()=>{const Native=Date;window.Date=class extends Native{constructor(...a){super(...(a.length?a:['2026-10-22T10:00:00+07:00']));}static now(){return Native.parse('2026-10-22T10:00:00+07:00');}};});
  const go=async page=>{await p.goto(url+page);await p.waitForFunction(()=>window.PCAstral?.initialized);};
  try{
   if(id==='C01'){
    await go('products.html');assert.equal(await p.locator('.product-card').count(),25);
    await go('products.html?q=PC%20%C3%94n%20t%E1%BA%ADp');assert.equal(await p.locator('.product-card').count(),1);
    await p.locator('[data-add="p25"]').click();await p.locator('[data-add="p25"]').click();await go('cart.html');assert.equal(await p.locator('.cart-row').count(),1);assert.equal(await p.locator('[data-quantity]').inputValue(),'2');assert.match(await p.locator('#cart-total').textContent(),/24\.000\.000/);
    await p.goto(pathToFileURL(path.join(folder,'products.html')).href);await p.waitForFunction(()=>window.PCAstral?.initialized);assert.equal(await p.locator('.product-card').count(),25);
   }
   if(id==='C02'){
    await go('products.html');assert.equal(await p.evaluate(()=>PCAstral.utils.timSanPham('p01').layGia()),18000000);
    await go('product-detail.html?id=p01');assert.match(await p.locator('#detail-current-price').textContent(),/18\.000\.000/);
    await p.locator('[data-quantity-input]').click();await p.locator('[data-quantity-input]').click();await go('cart.html');assert.match(await p.locator('#cart-total').textContent(),/36\.000\.000/);
    await go('checkout.html');await fillOrder(p);await p.locator('#place-order').click();assert.match(await p.locator('#confirmation-total').textContent(),/36\.000\.000/);await p.reload();await p.waitForFunction(()=>window.PCAstral?.initialized);assert(await p.locator('#order-confirmation').isVisible());
    assert.equal(await p.evaluate(()=>PCAstral.utils.timSanPham('p01').layGia(Date.parse('2026-11-01'))),20000000);
   }
   if(id==='C03'){
    await go('product-detail.html?id=p01');for(let i=0;i<3;i++)await p.locator('[data-quantity-input]').click();await go('cart.html');assert.equal(await p.locator('[data-quantity]').inputValue(),'2');
    for(const value of ['0','3']){await p.locator('[data-quantity]').fill(value);await p.locator('[data-quantity]').dispatchEvent('change');assert.equal(await p.locator('[data-quantity]').inputValue(),'2');}
    await p.reload();await p.waitForFunction(()=>PCAstral.initialized);assert.equal(await p.locator('[data-quantity]').inputValue(),'2');
   }
   if(id==='C04'){
    await go('index.html');assert.equal(await p.locator('[data-slide]').count(),4);await p.locator('[data-slide="3"]').click();assert.equal(await p.locator('#slide-count').textContent(),'04 / 04');assert.match(await p.locator('#hero-title').textContent(),/Banner thứ tư/);await p.locator('#next-slide').click();assert.equal(await p.locator('#slide-count').textContent(),'01 / 04');await p.locator('#prev-slide').click();assert.equal(await p.locator('#slide-count').textContent(),'04 / 04');assert.match(await p.locator('#hero-link').getAttribute('href'),/p07/);
   }
   if(id==='C05'){
    await go('product-detail.html?id=p01');await p.locator('[data-quantity-input]').click();await go('checkout.html');await fillOrder(p);const before=await p.evaluate(()=>PCAstral.cart.tinhTongGio().total);await p.clock.fastForward(15000);const after=await p.evaluate(()=>PCAstral.cart.tinhTongGio().total);assert(after>before);assert.equal(await p.locator('#name').inputValue(),'Sinh viên Ôn tập');await p.locator('#place-order').click();assert.equal(await p.evaluate(()=>localStorage.getItem('pc-astral.last-order.v1')),null);await p.locator('#place-order').click();assert(await p.locator('#order-confirmation').isVisible());assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('pc-astral.last-order.v1')).total),after);await go('index.html');assert.match(await p.locator('#countdown').textContent(),/đã kết thúc/);
   }
   if(id==='C06'){
    for(const [q,count] of [['p01',1],['P01',1],['asus',4],['zznoresult',0]]){await go('products.html?q='+q);assert.equal(await p.locator('.product-card').count(),count);}
   }
   if(id==='C07'){
    await go('products.html');const bounds=await p.evaluate(()=>{const product=PCAstral.data.products[0];product.salePrice=null;return [9999999,10000000,19999999,20000000].map(price=>{product.price=price;return PCAstral.utils.locSanPham({price:'10to20'}).some(x=>x.id===product.id);});});assert.deepEqual(bounds,[false,true,true,false]);await p.locator('#filter-price').selectOption('10to20');await p.reload();await p.waitForFunction(()=>PCAstral.initialized);assert.equal(await p.locator('#filter-price').inputValue(),'10to20');
   }
   if(id==='C08'){
    await go('products.html');await p.locator('#sort').selectOption('name-desc');await p.reload();await p.waitForFunction(()=>PCAstral.initialized);assert.equal(await p.locator('#sort').inputValue(),'name-desc');const out=await p.evaluate(()=>{const original=PCAstral.data.products.map(x=>x.id).join();const sorted=PCAstral.utils.locSanPham({sort:'name-desc'}).map(x=>x.name);return {unchanged:original===PCAstral.data.products.map(x=>x.id).join(),sorted};});assert(out.unchanged);assert.deepEqual(out.sorted,[...out.sorted].sort((a,b)=>b.localeCompare(a,'vi')));
   }
   if(id==='C09'){
    await go('product-detail.html?id=p01');await p.locator('[data-quantity-input]').click();await go('checkout.html');await fillOrder(p);
    const bounds=await p.evaluate(()=>[0,300,301].map(n=>Boolean(PCAstral.utils.kiemTraKhachHang({name:'a',email:'a@b.co',phone:'0901234567',address:'a',note:'x'.repeat(n)}).errors.note)));assert.deepEqual(bounds,[false,false,true]);
    await p.evaluate(()=>{const note=document.getElementById('note');note.value='x'.repeat(301);note.dispatchEvent(new Event('input',{bubbles:true}));});await p.reload();await p.waitForFunction(()=>PCAstral.initialized);assert.equal((await p.locator('#note').inputValue()).length,301);await p.locator('#place-order').click();assert.match(await p.locator('#note-error').textContent(),/300/);assert.equal(await p.evaluate(()=>localStorage.getItem('pc-astral.last-order.v1')),null);await p.locator('#note').fill('x'.repeat(300));await p.locator('#place-order').click();assert(await p.locator('#order-confirmation').isVisible());
   }
   if(id==='C10'){
    const broken=JSON.parse(fs.readFileSync(path.join(folder,'js/products.json'),'utf8'));broken[0].imgUrl='img/khong-ton-tai.jpg';fs.writeFileSync(path.join(folder,'js/products.json'),JSON.stringify(broken,null,2));
    await go('product-detail.html?id=p01');await p.waitForFunction(()=>document.querySelector('.detail-image .image-fallback'));assert(failures.some(x=>x.includes('khong-ton-tai.jpg')));const data=JSON.parse(fs.readFileSync(path.join(folder,'js/products.json'),'utf8'));data[0].imgUrl='img/p01.jpg';fs.writeFileSync(path.join(folder,'js/products.json'),JSON.stringify(data,null,2));fs.writeFileSync(path.join(folder,'js/san-pham-du-phong.js'),'window.PCAstral=window.PCAstral||{};window.PCAstral.offlineProductJSON='+JSON.stringify(JSON.stringify(data))+';');failures.length=0;await go('product-detail.html?id=p01');await p.waitForFunction(()=>document.querySelector('.detail-image img').naturalWidth>0);assert.equal(await p.locator('.detail-image .image-fallback').count(),0);
   }
   assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);results.push({id,status:'PASS'});console.log('PASS '+id);
  }catch(e){results.push({id,status:'FAIL',detail:e.message});console.log('FAIL '+id+' '+e.message);}
  await context.close();
 }
 // Một buổi demo riêng trên bản C02: bảy trang, tài khoản và lưu trữ qua F5.
 const context=await browser.newContext();const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const url=base+'/C02/'+encodeURIComponent('Bài luyện có dấu')+'/PC-Astral-Market/';
 try{
 for(const page of ['index.html','products.html','product-detail.html?id=p01','cart.html','checkout.html','register.html','about.html']){await p.goto(url+page);await p.waitForFunction(()=>PCAstral.initialized);}
 await p.goto(url+'register.html');await p.waitForFunction(()=>PCAstral.initialized);
 const a=await p.evaluate(async()=>{const auth=PCAstral.auth;return [await auth.dangKy('onthi01','Demo2026!', 'Demo2026!'),await auth.dangNhap('onthi01','Demo2026!')];});assert(a.every(x=>x.ok));
 await p.reload();await p.waitForFunction(()=>PCAstral.initialized);assert.equal(await p.evaluate(()=>PCAstral.auth.layTaiKhoanDangNhap().username),'onthi01');
 const b=await p.evaluate(async()=>{PCAstral.auth.dangXuat();const users=JSON.parse(localStorage.getItem('pc-astral.users.v1'));return {users,login:await PCAstral.auth.dangNhap('onthi01','Demo2026!')};});assert(b.login.ok);assert(b.users[0].passwordHash&&!('password' in b.users[0]));assert.equal(await p.evaluate(()=>PCAstral.storage.ketThucDemo()),true);assert.equal(await p.evaluate(()=>localStorage.getItem('pc-astral.users.v1')),null);assert.deepEqual(errors,[]);results.push({id:'DEMO',status:'PASS',detail:'Seven pages; register/login/reload/logout/login/reset with test credentials; storage fields checked.'});
 }catch(e){results.push({id:'DEMO',status:'FAIL',detail:e.message});}
 await context.close();
 }finally{await browser.close();await new Promise(r=>server.close(r));}
 const output={date:new Date().toISOString().slice(0,10),browser:'Google Chrome',scope:'Only isolated exercise copies; C10 intentionally reproduced a missing image before repairing it.',results};fs.writeFileSync(path.join(root,'docs/defense-practice-tests.json'),JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1;});
