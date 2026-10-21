// Thử bản sao ở đường dẫn có khoảng trắng và tiếng Việt, mở file:// không có server.
const {chromium} = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const assert = require('assert/strict');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const source = process.env.ASTRAL_FILE_SITE || path.join(root, 'PC-Astral-Market');
fs.mkdirSync(path.join(root, 'tmp'), {recursive:true});
const destination = fs.mkdtempSync(path.join(root, 'tmp', 'Máy khác - '));
const site = path.join(destination, 'Bài nộp', 'PC-Astral-Market');
fs.cpSync(source, site, {recursive:true});
const base = pathToFileURL(site + path.sep).href;
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(site,'js/san-pham-du-phong.js'),'utf8'),sandbox);
assert.deepEqual(JSON.parse(sandbox.window.PCAstral.offlineProductJSON),
  JSON.parse(fs.readFileSync(path.join(site,'js/products.json'),'utf8')));
const results = [];

(async function run() {
  for (const channel of ['chrome','msedge']) {
    const browser = await chromium.launch({channel,headless:true});
    try {
      const context = await browser.newContext({viewport:{width:1440,height:1000}});
      const page = await context.newPage();
      const errors = [];
      const network = [];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
      page.on('requestfailed',r=>errors.push(r.url()+' '+r.failure().errorText));
      page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
      async function ready() {
        await page.waitForFunction(()=>window.PCAstral && PCAstral.initialized);
      }
      async function go(url) {
        await page.goto(base+url);
        await ready();
      }
      for (const url of ['index.html','products.html','product-detail.html?id=p01','cart.html','checkout.html','register.html','about.html']) {
        await go(url);
        assert.equal(await page.locator('#site-header .brand').count(),1);
        assert.equal(await page.evaluate(()=>PCAstral.data.products.length),24);
        await page.evaluate(async()=>{
          await document.fonts.ready;
          for(const img of document.images) {img.loading='eager';await img.decode();}
        });
      }
      await go('index.html');
      await page.locator('#main-nav a[href="products.html?category=laptop"]').click();
      await ready();
      assert.equal(await page.locator('.product-card').count(),6);
      await page.locator('[data-add="p01"]').click();
      await page.locator('[data-add="p01"]').click();
      await page.locator('a.cart-link').click();
      await ready();
      assert.equal(await page.locator('[data-quantity]').inputValue(),'2');
      await page.reload();await ready();
      assert.equal(await page.locator('[data-quantity]').inputValue(),'2');
      await page.locator('[data-step="1"]').click();
      assert.equal(await page.locator('[data-quantity]').inputValue(),'3');
      await go('register.html');
      const account = await page.evaluate(async()=>{
        const registered=await PCAstral.auth.dangKy('demo_file','DemoTest123','DemoTest123');
        const loggedIn=await PCAstral.auth.dangNhap('demo_file','DemoTest123');
        return {registered,loggedIn};
      });
      assert(account.registered.ok && account.loggedIn.ok);
      await go('checkout.html');
      assert.equal(await page.evaluate(()=>PCAstral.auth.layTaiKhoanDangNhap().username),'demo_file');
      for(const [key,value] of Object.entries({name:'Khách Kiểm Thử',email:'test@example.com',phone:'0901234567',address:'Địa chỉ demo'})) {
        await page.locator('#'+key).fill(value);
      }
      await page.locator('#note').fill('Nháp trên máy khác');
      await page.reload();await ready();
      assert.equal(await page.locator('#email').inputValue(),'test@example.com');
      assert.equal(await page.locator('#note').inputValue(),'Nháp trên máy khác');
      await page.locator('#place-order').click();
      await page.locator('#order-confirmation').waitFor({state:'visible'});
      await page.reload();await ready();
      assert(await page.locator('#order-confirmation').isVisible());
      await go('cart.html');
      assert(await page.locator('#cart-empty').isVisible());
      page.once('dialog',d=>d.accept());
      await page.locator('[data-end-demo]').click();
      await page.waitForURL('**/index.html');await ready();
      assert.equal(await page.evaluate(()=>PCAstral.auth.layTaiKhoanDangNhap()),null);
      assert.deepEqual(errors,[]);
      assert.deepEqual(network,[]);
      if(channel==='chrome')await page.screenshot({path:path.join(root,'docs/screenshots/current/13-file-mode.png'),fullPage:true});
      results.push({browser:channel,status:'PASS',pages:7,checks:'Real file URLs, nested Vietnamese/spaced path, images/fonts, menu, category, cart merge/change/reload/navigation, register/login, checkout draft/reload/submit, confirmation reload, reset, no network or console errors'});
      console.log('PASS file:// '+channel);
    } finally {
      await browser.close();
    }
  }
  fs.writeFileSync(path.join(root,'docs/file-mode-tests.json'),JSON.stringify({source,base,results},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
