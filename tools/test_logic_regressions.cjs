// Các ca lỗi cụ thể trước/sau sửa. Công cụ kiểm thử không được nạp vào website.
const {chromium} = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const base = process.env.ASTRAL_TEST_URL;
const baseline = process.env.ASTRAL_BASELINE === '1';
const results = [];
const customer = {name:'  Khách thử nháp  ',email:'sai-email',phone:'0901234567',address:'Địa chỉ thử',note:'Ghi chú còn đang nhập'};

(async () => {
 for (const channel of baseline ? ['chrome'] : ['chrome','msedge']) {
  const browser = await chromium.launch({channel,headless:true});
  async function check(name, action) {
   const context = await browser.newContext({viewport:{width:1440,height:1000}});
   const page = await context.newPage(); page.setDefaultTimeout(3500);
   const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
   const go = async url => {await page.goto(base+'/'+url);await page.waitForFunction(()=>window.PCAstral?.initialized);};
   const checkout = async () => {
    await go('index.html');await page.evaluate(()=>PCAstral.cart.themSanPham('p01',1));await go('checkout.html');
    for(const [k,v] of Object.entries({...customer,email:'demo@example.com'}))await page.locator('#'+k).fill(v);
   };
   try {await action({page,context,go,checkout});assert.deepEqual(errors,[]);results.push({browser:channel,name,status:'PASS'});console.log('PASS '+channel+' '+name);}
   catch(e){results.push({browser:channel,name,status:'FAIL',detail:e.message});console.log('FAIL '+channel+' '+name+' '+e.message.slice(0,260));}
   finally{await context.close();}
  }
  try {
   await check('L01 F5 giữ cả năm trường nháp kể cả dữ liệu sai',async({page,go,checkout})=>{
    await checkout();for(const [k,v] of Object.entries(customer))await page.locator('#'+k).fill(v);
    await page.reload();await page.waitForFunction(()=>PCAstral.initialized);
    for(const [k,v] of Object.entries(customer))assert.equal(await page.locator('#'+k).inputValue(),v);
    await page.locator('#place-order').click();assert(await page.locator('#email-error').textContent());
    await page.locator('#email').fill('demo@example.com');await page.locator('#place-order').click();
    assert(await page.locator('#order-confirmation').isVisible());
    assert.equal(await page.evaluate(()=>localStorage.getItem('pc-astral.checkout-draft.v1')),null);
   });
   await check('L02 Giá tự cập nhật vẫn cần xác nhận lại',async({page,checkout})=>{
    await checkout();await page.evaluate(()=>{PCAstral.data.products[0].salePrice-=1000;window.dispatchEvent(new Event('promotion-expired'));});
    await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isHidden());
    assert.equal(await page.locator('#name').inputValue(),customer.name);
    await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isVisible());
   });
   await check('L03 Lưu đơn được nhưng xóa giỏ lỗi rồi F5 thử lại không sinh đơn mới',async({page,checkout})=>{
    await checkout();await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===PCAstral.storage.CART_KEY&&v==='[]')throw Error('Cart write blocked');return save.call(this,k,v);};});
    await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isVisible());
    const order=await page.evaluate(()=>JSON.parse(localStorage.getItem(PCAstral.storage.ORDER_KEY)));
    assert.equal(order.choDonGio,true);assert.equal(await page.evaluate(()=>PCAstral.cart.layGio().length),1);
    for(const width of [390,768,1440]) {
     await page.setViewportSize({width,height:1000});
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     if(channel==='chrome'&&!base.startsWith('file:'))await page.screenshot({path:path.resolve(__dirname,'../docs/screenshots/current/14-cleanup-retry-'+width+'.png'),fullPage:true});
    }
    await page.reload();await page.waitForFunction(()=>PCAstral.initialized);
    await page.locator('#retry-cart-cleanup').click();
    const state=await page.evaluate(()=>({order:JSON.parse(localStorage.getItem(PCAstral.storage.ORDER_KEY)),cart:JSON.parse(localStorage.getItem(PCAstral.storage.CART_KEY))}));
    assert.equal(state.order.id,order.id);assert.equal(state.order.choDonGio,false);assert.deepEqual(state.cart,[]);
    await page.locator('#checkout-form').dispatchEvent('submit');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(PCAstral.storage.ORDER_KEY)).id),order.id);
   });
   for(const action of ['dangKy','dangNhap'])await check('L04 Reset trong lúc '+action+' không ghi lại tài khoản',async({page,go})=>{
    await go('register.html');
    if(action==='dangNhap')await page.evaluate(()=>PCAstral.auth.dangKy('demo_user','MatKhau123','MatKhau123'));
    const state=await page.evaluate(async action=>{
     const native=crypto.subtle.deriveBits.bind(crypto.subtle);let release;let entered;
     const started=new Promise(r=>entered=r);const gate=new Promise(r=>release=r);
     crypto.subtle.deriveBits=async function(...args){entered();await gate;return native(...args);};
     const pending=PCAstral.auth[action]('demo_user','MatKhau123','MatKhau123');await started;
     const reset=PCAstral.storage.ketThucDemo();release();const result=await pending;
     return {reset,result,users:localStorage.getItem(PCAstral.storage.USERS_KEY),auth:localStorage.getItem(PCAstral.storage.AUTH_KEY)};
    },action);
    assert(state.reset);assert.equal(state.result.ok,false);assert.equal(state.users,null);assert.equal(state.auth,null);
   });
   if(!baseline){
    await check('L05 Giỏ thay đổi cùng tổng tiền vẫn cần xác nhận',async({page,checkout})=>{
     await checkout();await page.evaluate(()=>{PCAstral.data.products[1].salePrice=PCAstral.data.products[0].layGia();PCAstral.cart.items=[{productId:'p02',quantity:1}];PCAstral.cart.baoGioThayDoi();});
     await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isHidden());
     await page.locator('#place-order').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(PCAstral.storage.ORDER_KEY)).lines[0].productId),'p02');
    });
    await check('L06 Giỏ mới không bị nút dọn giỏ đơn cũ xóa',async({page,go,checkout})=>{
     await checkout();await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===PCAstral.storage.CART_KEY&&v==='[]')throw Error('blocked');return save.call(this,k,v);};});
     await page.locator('#place-order').click();await page.reload();await page.waitForFunction(()=>PCAstral.initialized);
     await page.evaluate(()=>PCAstral.cart.doiSoLuong('p01',2));
     assert(await page.locator('#retry-cart-cleanup').isDisabled());
     assert.equal(await page.evaluate(()=>PCAstral.cart.layGio()[0].quantity),2);
    });
    await check('L07 Nháp hỏng sai kiểu và tab khác không ghi đè form đang gõ',async({page,context,go,checkout})=>{
     await checkout();await page.evaluate(()=>localStorage.setItem(PCAstral.storage.DRAFT_KEY,'{bad'));await page.reload();await page.waitForFunction(()=>PCAstral.initialized);assert.equal(await page.locator('#name').inputValue(),'');
     await page.evaluate(()=>localStorage.setItem(PCAstral.storage.DRAFT_KEY,JSON.stringify({name:12,email:'bad',note:{}})));await page.reload();await page.waitForFunction(()=>PCAstral.initialized);assert.equal(await page.locator('#name').inputValue(),'');assert.equal(await page.locator('#email').inputValue(),'bad');
     await page.locator('#name').fill('Tab một');const other=await context.newPage();await other.goto(base+'/checkout.html');await other.waitForFunction(()=>PCAstral.initialized);await other.locator('#name').fill('Tab hai');
     assert.equal(await page.locator('#name').inputValue(),'Tab một');await page.reload();await page.waitForFunction(()=>PCAstral.initialized);assert.equal(await page.locator('#name').inputValue(),'Tab hai');
    });
    await check('L08 Ghi nháp bị chặn vẫn nhập được và xóa nháp lỗi báo rõ',async({page,checkout})=>{
     await checkout();await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===PCAstral.storage.DRAFT_KEY)throw Error('blocked');return save.call(this,k,v);};const del=Storage.prototype.removeItem;Storage.prototype.removeItem=function(k){if(k===PCAstral.storage.DRAFT_KEY)throw Error('blocked');return del.call(this,k);};});
     await page.locator('#note').fill('Vẫn nhập được');assert(await page.locator('#storage-warning').isVisible());
     await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isVisible());assert(await page.locator('#draft-cleanup-message').textContent());
    });
    await check('L09 Reset xóa nháp giữ dữ liệu website khác',async({page,checkout})=>{
     await checkout();await page.evaluate(()=>{localStorage.setItem('other-site','KEEP');PCAstral.storage.ketThucDemo();});
     assert.equal(await page.evaluate(()=>localStorage.getItem(PCAstral.storage.DRAFT_KEY)),null);assert.equal(await page.evaluate(()=>localStorage.getItem('other-site')),'KEEP');
    });
    await check('L10 Lưu đơn lỗi giữ nguyên giỏ và nháp',async({page,checkout})=>{
     await checkout();await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===PCAstral.storage.ORDER_KEY)throw Error('blocked');return save.call(this,k,v);};});
     await page.locator('#place-order').click();assert(await page.locator('#order-confirmation').isHidden());assert(await page.locator('#place-order').isEnabled());
     assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(PCAstral.storage.DRAFT_KEY)).name),customer.name);assert.equal(await page.evaluate(()=>PCAstral.cart.layGio().length),1);
    });
    await check('L11 Tab cũ không dọn lại giỏ mua mới sau khi tab khác hoàn tất',async({page,checkout})=>{
     await checkout();await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===PCAstral.storage.CART_KEY&&v==='[]')throw Error('blocked');return save.call(this,k,v);};});
     await page.locator('#place-order').click();await page.reload();await page.waitForFunction(()=>PCAstral.initialized);
     await page.evaluate(()=>{const order=JSON.parse(localStorage.getItem(PCAstral.storage.ORDER_KEY));order.choDonGio=false;localStorage.setItem(PCAstral.storage.ORDER_KEY,JSON.stringify(order));});
     await page.locator('#retry-cart-cleanup').dispatchEvent('click');
     assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(PCAstral.storage.CART_KEY))[0].quantity),1);
     assert(await page.locator('#retry-cart-cleanup').isHidden());
    });
    await check('L12 Giỏ đã xóa nhưng lưu cờ hoàn tất lỗi vẫn thử lại cùng đơn',async({page,checkout})=>{
     await checkout();await page.evaluate(()=>{let writes=0;const save=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===PCAstral.storage.ORDER_KEY&&++writes>1)throw Error('metadata blocked');return save.call(this,k,v);};});
     await page.locator('#place-order').click();const id=await page.locator('#confirmation-id').textContent();
     assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(PCAstral.storage.CART_KEY)).length),0);
     await page.reload();await page.waitForFunction(()=>PCAstral.initialized);await page.locator('#retry-cart-cleanup').click();
     assert.equal(await page.locator('#confirmation-id').textContent(),id);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(PCAstral.storage.ORDER_KEY)).choDonGio),false);
     await page.evaluate(()=>{const order=JSON.parse(localStorage.getItem(PCAstral.storage.ORDER_KEY));delete order.choDonGio;localStorage.setItem(PCAstral.storage.ORDER_KEY,JSON.stringify(order));});
     await page.reload();await page.waitForFunction(()=>PCAstral.initialized);assert.equal(await page.locator('#confirmation-id').textContent(),id);assert(await page.locator('#retry-cart-cleanup').isHidden());
    });
   }
  } finally {await browser.close();}
 }
 const filename=baseline?'logic-baseline.json':(base.startsWith('file:')?'logic-file-regressions.json':'logic-regressions.json');
 fs.writeFileSync(path.resolve(__dirname,'../docs/'+filename),JSON.stringify({date:'2026-10-21',base,results},null,2));
 if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
