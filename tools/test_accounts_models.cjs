// Kiểm tra lớp, JSON và tài khoản qua trình duyệt thật. Dùng cùng server tạm của run_tests.cjs.
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const base = process.env.ASTRAL_TEST_URL;
const results = [];
const errors = [];
const root = path.resolve(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(root, 'PC-Astral-Market/js/products.json'), 'utf8'));

async function check(name, action) {
  try { await action(); results.push({name,status:'PASS'}); console.log('PASS ' + name); }
  catch(error) { results.push({name,status:'FAIL',detail:error.message}); console.log('FAIL ' + name + ' ' + error.message); }
}

(async function run() {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    context.on('page', p => p.on('pageerror', e => errors.push(e.message)));
    const page = await context.newPage();
    const go = async url => {
      await page.goto(base + '/' + url);
      await page.waitForFunction(() => window.PCAstral?.initialized);
    };
    await check('C01 JSON đủ 24 sản phẩm 4 danh mục và bảy trường đúng kiểu', async () => {
      assert.equal(raw.length,24);
      assert.equal(new Set(raw.map(p=>p.category)).size,4);
      for (const p of raw) {
        for(const field of ['id','name','price','imgUrl','description','category','quantity']) assert(field in p);
        assert(Number.isSafeInteger(p.price)); assert(Number.isSafeInteger(p.quantity));
        assert(p.imgUrl.startsWith('img/'));
        assert(fs.existsSync(path.join(root,'PC-Astral-Market',p.imgUrl)));
      }
    });
    await check('C02 Product có ít nhất năm method và Cart tính đúng giỏ riêng hai món', async () => {
      await go('index.html');
      const value = await page.evaluate(() => {
        const {Product,Cart} = PCAstral.models;
        const products = PCAstral.data.products;
        const cart = new Cart(products);
        const now = Date.parse('2026-10-19T10:00:00+07:00');
        cart.themSanPham('p01'); cart.themSanPham('p07'); cart.themSanPham('p01');
        const expected = products[0].layGia(now)*2 + products[6].layGia(now);
        const correct = cart.layTongTien(now)===expected;
        const invalid = [0,-1,1.5,999].every(q=>!cart.doiSoLuong('p01',q));
        const old = cart.layGio(); old[0].quantity=99;
        const copied = cart.layGio()[0].quantity===2;
        cart.xoaSanPham('p07');
        return {methods:Object.getOwnPropertyNames(Product.prototype).filter(k=>k!=='constructor'),
          instance:products.every(p=>p instanceof Product), correct,invalid,copied,
          remaining:cart.layGio().length, original:PCAstral.cart.layGio().length};
      });
      assert(value.methods.length>=5); assert(value.instance&&value.correct&&value.invalid&&value.copied);
      assert.equal(value.remaining,1); assert.equal(value.original,0);
    });
    await check('C03 Thêm record JSON tối thiểu tự render và event delegation nhận nút con', async () => {
      await page.route('**/js/products.json', route => route.fulfill({contentType:'application/json',body:JSON.stringify([...raw,
        {id:'p25',name:'Sản phẩm thử thêm',price:123000,imgUrl:'img/p01.jpg',description:'Thử dữ liệu tối thiểu',category:'laptop',quantity:3}
      ])}));
      await go('products.html'); assert.equal(await page.locator('.product-card').count(),25);
      await page.evaluate(() => {
        const button=document.querySelector('[data-add="p25"]');
        const child=document.createElement('span'); child.textContent='Thêm thử';button.replaceChildren(child); child.click();
      });
      assert.equal(await page.locator('[data-cart-count]').textContent(),'1');
      assert.equal(await page.evaluate(()=>PCAstral.cart.layGio()[0].productId),'p25');
      await page.unroute('**/js/products.json');
      await go('products.html'); assert.equal(await page.locator('.product-card').count(),24);
      assert.equal(await page.locator('[data-cart-count]').textContent(),'0');
    });
    await check('C04 JSON hỏng được báo rõ không làm phát sinh lỗi JS chưa xử lý', async () => {
      await page.route('**/js/products.json', route=>route.fulfill({contentType:'application/json',body:'{bad json'}));
      await page.goto(base+'/products.html');
      await page.waitForFunction(()=>document.getElementById('main').textContent.includes('Không thể mở'));
      await page.unroute('**/js/products.json');
    });
    await check('C05 Đăng ký chặn rỗng sai định dạng và mật khẩu không khớp', async () => {
      await go('register.html'); await page.locator('#register-submit').click();
      assert.equal(await page.locator('#register-form [aria-invalid="true"]').count(),3);
      await page.locator('#register-username').fill('tên có dấu');
      await page.locator('#register-password').fill('Demo12345');
      await page.locator('#register-confirmPassword').fill('Khac12345');
      await page.locator('#register-submit').click();
      assert.equal(await page.locator('#register-form [aria-invalid="true"]').count(),2);
    });
    await check('C06 Đăng ký thành công lưu username salt hash và chặn tên trùng khác hoa thường', async () => {
      await page.locator('#register-username').fill('SinhVien01');
      await page.locator('#register-confirmPassword').fill('Demo12345');
      await page.locator('#register-submit').click();
      await page.waitForFunction(()=>document.getElementById('account-message').textContent.includes('Đăng ký thành công'));
      const users = await page.evaluate(()=>localStorage.getItem(PCAstral.storage.USERS_KEY));
      assert(!users.includes('Demo12345')); const parsed=JSON.parse(users);
      assert.equal(parsed.length,1); assert.equal(parsed[0].username,'sinhvien01');
      assert.equal(parsed[0].passwordHash.length,64); assert.equal(parsed[0].salt.length,32);
      for(const [key,value] of Object.entries({username:'SINHVIEN01',password:'Demo12345',confirmPassword:'Demo12345'}))
        await page.locator('#register-'+key).fill(value);
      await page.locator('#register-submit').click();
      await page.waitForFunction(()=>document.getElementById('register-username-error').textContent.includes('đã được đăng ký'));
    });
    await check('C07 Đăng nhập sai bị chặn đăng nhập đúng giữ trạng thái khi F5 và đổi trang', async () => {
      await page.locator('#login-username').fill('SINHVIEN01');
      await page.locator('#login-password').fill('MatKhauSai');
      await page.locator('#login-submit').click();
      await page.waitForFunction(()=>document.getElementById('account-message').textContent.includes('chưa đúng'));
      await page.locator('#login-password').fill('Demo12345');await page.locator('#login-submit').click();
      await page.waitForSelector('#account-signed-in:not([hidden])');
      await page.reload();await page.waitForFunction(()=>PCAstral.initialized);
      assert.equal(await page.locator('#account-username').textContent(),'sinhvien01');
      await go('products.html');assert((await page.locator('#account-link').textContent()).includes('sinhvien01'));
      await go('register.html');await page.screenshot({path:path.join(root,'docs/screenshots/current/11-account-signed-in.png'),fullPage:true});
    });
    await check('C08 Đăng xuất giữ tài khoản giỏ và đăng nhập lại được', async () => {
      await page.evaluate(()=>PCAstral.cart.themSanPham('p01'));
      await page.locator('#logout-button').click();assert(await page.locator('#account-forms').isVisible());
      assert.equal(await page.locator('[data-cart-count]').textContent(),'1');
      await page.locator('#login-username').fill('sinhvien01');await page.locator('#login-password').fill('Demo12345');
      await page.locator('#login-submit').click();await page.waitForSelector('#account-signed-in:not([hidden])');
    });
    await check('C09 Hủy reset giữ dữ liệu xác nhận reset xóa đúng khóa và đồng bộ tab khác', async () => {
      await page.evaluate(()=>{localStorage.setItem('unrelated-project','KEEP');localStorage.setItem(PCAstral.storage.ORDER_KEY,'{"id":"test"}');});
      page.once('dialog',d=>d.dismiss());await page.locator('[data-end-demo]').click();
      assert.equal(await page.locator('[data-cart-count]').textContent(),'1');
      const second=await context.newPage();await second.goto(base+'/register.html');await second.waitForFunction(()=>PCAstral.initialized);
      page.once('dialog',d=>d.accept());await page.locator('[data-end-demo]').click();
      await page.waitForURL('**/index.html');await page.waitForFunction(()=>PCAstral.initialized);
      await second.waitForURL('**/index.html');
      const state=await page.evaluate(()=>({keys:[PCAstral.storage.CART_KEY,PCAstral.storage.USERS_KEY,PCAstral.storage.AUTH_KEY,PCAstral.storage.ORDER_KEY].map(k=>localStorage.getItem(k)),other:localStorage.getItem('unrelated-project')}));
      assert(state.keys.every(value=>value===null));assert.equal(state.other,'KEEP');
      await second.close();
    });
    await check('C10 Storage chặn đăng ký không báo thành công dữ liệu tài khoản hỏng không làm lỗi trang', async () => {
      await go('register.html');
      await page.evaluate(()=>localStorage.setItem(PCAstral.storage.USERS_KEY,'{"bad":true}'));
      await page.reload();await page.waitForFunction(()=>PCAstral.initialized);
      await page.evaluate(()=>{const native=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===PCAstral.storage.USERS_KEY)throw new DOMException('Blocked','SecurityError');return native.call(this,k,v);};});
      for(const [key,value] of Object.entries({username:'demo02',password:'Demo12345',confirmPassword:'Demo12345'}))await page.locator('#register-'+key).fill(value);
      await page.locator('#register-submit').click();
      await page.waitForFunction(()=>document.getElementById('account-message').textContent.includes('Chưa lưu được'));
      assert(await page.locator('#account-signed-in').isHidden());
    });
    await check('C11 Giỏ giữ input focus và form giữ dữ liệu khi giá vừa đổi yêu cầu xác nhận lại', async () => {
      await go('product-detail.html?id=p01');await page.locator('[data-quantity-input]').click();await go('cart.html');
      const focus = await page.evaluate(()=>{const input=document.querySelector('[data-quantity]');input.focus();input.value='2';input.dispatchEvent(new Event('change',{bubbles:true}));return input===document.querySelector('[data-quantity]')&&document.activeElement===input;});
      assert(focus);
      await go('checkout.html');
      for(const [key,value] of Object.entries({name:'Khách Demo',email:'demo@example.com',phone:'0901234567',address:'Địa chỉ mô phỏng'}))await page.locator('#'+key).fill(value);
      await page.evaluate(()=>{PCAstral.data.products[0].salePrice-=1000;});
      await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isHidden());
      assert.equal(await page.locator('#name').inputValue(),'Khách Demo');assert((await page.locator('#toast').textContent()).includes('Giá vừa thay đổi'));
      await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isVisible());
      const order=await page.evaluate(()=>localStorage.getItem(PCAstral.storage.ORDER_KEY));
      await page.locator('#checkout-form').dispatchEvent('submit');
      assert.equal(await page.evaluate(()=>localStorage.getItem(PCAstral.storage.ORDER_KEY)),order);
    });
    await check('C12 Trang tài khoản tại 390 768 1440 và ảnh minh chứng', async () => {
      await go('register.html');
      await page.evaluate(()=>{localStorage.removeItem(PCAstral.storage.USERS_KEY);localStorage.removeItem(PCAstral.storage.AUTH_KEY);});
      await page.reload();await page.waitForFunction(()=>PCAstral.initialized);
      for(const width of [390,768,1440]){
        await page.setViewportSize({width,height:1000});
        assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
      }
      await page.screenshot({path:path.join(root,'docs/screenshots/current/12-register-login.png'),fullPage:true});
    });
    await check('C13 Không có lỗi JavaScript chưa xử lý trong các trường hợp bổ sung', async()=>assert.deepEqual(errors,[]));
    await context.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(root,'docs/accounts-models-tests.json'),JSON.stringify({date:'2026-10-19',results,errors},null,2));
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})();
