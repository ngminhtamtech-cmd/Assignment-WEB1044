const {chromium}=require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const metadata=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/package-check.json'),'utf8'));
const root=metadata.extractedDirectory;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!target.startsWith(root+path.sep)||!fs.existsSync(target)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/PC-Astral-Market';
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage();const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  for(const url of ['index.html','products.html','product-detail.html?id=p01','cart.html','checkout.html','about.html','register.html']){
   await page.goto(base+'/'+url);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);assert(await page.evaluate(()=>getComputedStyle(document.body).fontFamily.includes('Sarabun')&&document.fonts.check('400 16px Sarabun','Tiếng Việt Đặng Nguyễn ₫')));assert(await page.locator('#site-header .brand').count());assert.equal(await page.locator('svg').count(),0);
   await page.evaluate(async()=>{for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode()));});
  }
  await page.goto(base+'/product-detail.html?id=p01');await page.locator('[data-quantity-input]').click();await page.locator('[data-quantity-input]').click();
  await page.goto(base+'/cart.html');await page.reload();assert.equal(await page.locator('[data-quantity]').inputValue(),'2');
  await page.goto(base+'/checkout.html');
  for(const [key,value]of Object.entries({name:'Khách Kiểm Thử',email:'demo@example.com',phone:'0901234567',address:'Địa chỉ mô phỏng'}))await page.locator('#'+key).fill(value);
  const state=await page.evaluate(()=>{
    const form=document.getElementById('checkout-form');
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    const first=localStorage.getItem('pc-astral.last-order.v1');
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    return {same:first===localStorage.getItem('pc-astral.last-order.v1'),cart:JSON.parse(localStorage.getItem('pc-astral.cart.v1'))};
  });
  assert(state.same);assert.equal(state.cart.length,0);assert(await page.locator('.confirmation').isVisible());
  await page.reload();assert(await page.locator('.confirmation').isVisible());assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  await page.goto(base+'/register.html');
  for(const [key,value] of Object.entries({username:'zipdemo',password:'ZipDemo123',confirmPassword:'ZipDemo123'}))await page.locator('#register-'+key).fill(value);
  await page.locator('#register-submit').click();await page.waitForFunction(()=>document.getElementById('account-message').textContent.includes('Đăng ký thành công'));
  await page.locator('#login-password').fill('ZipDemo123');await page.locator('#login-submit').click();await page.waitForSelector('#account-signed-in:not([hidden])');
  await page.reload();await page.waitForFunction(()=>PCAstral.initialized);assert(await page.locator('#account-signed-in').isVisible());
  page.once('dialog',dialog=>dialog.accept());await page.locator('[data-end-demo]').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>PCAstral.initialized);
  assert.equal(await page.evaluate(()=>localStorage.getItem(PCAstral.storage.USERS_KEY)),null);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  const result={status:'PASS',pages:7,scenario:'Extracted ZIP: all pages, local assets, cart add/reload, checkout, duplicate submission, confirmation reload, register/login/reload/reset; nested website directory',externalRequests:external.length,errors};
  fs.writeFileSync(path.resolve(__dirname,'../docs/package-smoke.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
