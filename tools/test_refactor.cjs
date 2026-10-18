const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const site = path.join(root, 'PC-Astral-Market');
const base = process.env.ASTRAL_TEST_URL;
const results = [];
const errors = [];
const external = [];

async function check(name, action) {
  try {
    await action();
    results.push({ name, status: 'PASS' });
    console.log('PASS ' + name);
  } catch (error) {
    results.push({ name, status: 'FAIL', detail: error.message });
    console.log('FAIL ' + name + ': ' + error.message);
  }
}

function observe(context) {
  context.on('page', page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
    page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
  });
}

(async () => {
  await check('R01. Không còn module; script defer đúng thứ tự; dữ liệu giữ nguyên', async () => {
    for (const name of fs.readdirSync(path.join(site, 'js'))) {
      assert(!/\b(import|export)\s/.test(fs.readFileSync(path.join(site, 'js', name), 'utf8')), name);
    }
    for (const name of fs.readdirSync(site).filter(name => name.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(site, name), 'utf8');
      const scripts = [...html.matchAll(/<script([^>]+)src="js\/([^"]+)"[^>]*>/g)];
      assert.equal(scripts.length, 6);
      assert(scripts.every(match => match[1].includes('defer') && !match[1].includes('async')));
      assert.deepEqual(scripts.slice(0, 5).map(match => match[2]), ['data.js', 'utils.js', 'storage.js', 'cart.js', 'common.js']);
    }
    const previousPath = path.join(root, 'tmp/refactor-before/PC-Astral-Market/js/data.js');
    const previous = {};
    vm.runInNewContext(fs.readFileSync(previousPath, 'utf8').replace(/export const (\w+) =/g, 'globalThis.$1 ='), previous);
    const current = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(site, 'js/data.js'), 'utf8'), current);
    for (const key of ['categories', 'products', 'promotion', 'banners']) {
      assert.equal(JSON.stringify(current.window.PCAstral.data[key]), JSON.stringify(previous[key]));
    }
  });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await check('R02. Cập nhật giỏ giữ input và focus, không render lồng nhau', async () => {
      const context = await browser.newContext(); observe(context);
      const page = await context.newPage();
      await page.goto(base + '/product-detail.html?id=p01');
      await page.locator('[data-quantity-input]').click();
      await page.goto(base + '/cart.html');
      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-quantity]');
        input.focus(); input.value = '3'; input.dispatchEvent(new Event('change', { bubbles: true }));
        return { same: input === document.querySelector('[data-quantity]'), focus: input === document.activeElement, value: input.value, quantity: PCAstral.cart.getTotals().quantity };
      });
      assert.deepEqual(result, { same: true, focus: true, value: '3', quantity: 3 });
      await context.close();
    });

    await check('R03. Hết khuyến mãi và đồng bộ giỏ giữ nguyên dữ liệu form', async () => {
      const context = await browser.newContext(); observe(context);
      const page = await context.newPage();
      await page.clock.install({ time: new Date('2026-10-30T23:59:55+07:00') });
      await page.goto(base + '/product-detail.html?id=p01');
      await page.locator('[data-quantity-input]').click();
      await page.goto(base + '/checkout.html');
      await page.locator('#name').fill('Khách đang nhập');
      await page.locator('#note').fill('Giữ nội dung này');
      const form = await page.locator('#checkout-form').elementHandle();
      await page.clock.fastForward(5000);
      assert((await page.locator('#checkout-total').textContent()).includes('41.990.000'));
      assert.equal(await page.locator('#name').inputValue(), 'Khách đang nhập');
      assert.equal(await page.locator('#note').inputValue(), 'Giữ nội dung này');
      assert(await form.evaluate(element => element === document.getElementById('checkout-form')));
      const second = await context.newPage();
      await second.goto(base + '/product-detail.html?id=p02');
      await second.locator('[data-quantity-input]').click();
      await page.waitForFunction(() => document.querySelectorAll('#checkout-lines > div').length === 2);
      assert.equal(await page.locator('#name').inputValue(), 'Khách đang nhập');
      await context.close();
    });

    await check('R04. Giá đổi ngay trước submit; lưu đơn trước xóa giỏ; chống gửi lặp và HTML injection', async () => {
      const context = await browser.newContext(); observe(context);
      const page = await context.newPage();
      await page.clock.install({ time: new Date('2026-10-30T23:59:40+07:00') });
      await page.clock.pauseAt(new Date('2026-10-30T23:59:58+07:00'));
      await page.goto(base + '/product-detail.html?id=p01');
      await page.locator('[data-quantity-input]').click();
      await page.goto(base + '/checkout.html');
      const values = { name: '<img src=x onerror=alert(1)>', email: 'demo@example.com', phone: '0901234567', address: 'Địa chỉ thử nghiệm' };
      for (const [name, value] of Object.entries(values)) await page.locator('#' + name).fill(value);
      // Nhảy thời gian mà chưa chạy timer để kiểm tra nhánh so sánh giá lúc submit.
      await page.clock.setSystemTime(new Date('2026-10-31T00:00:01+07:00'));
      await page.locator('#place-order').click();
      assert(await page.locator('.confirmation').isHidden());
      assert.equal(await page.evaluate(() => sessionStorage.getItem('pc-astral.last-order.v1')), null);
      const orderState = await page.evaluate(() => {
        const operations = [];
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) { operations.push(key); return original.call(this, key, value); };
        const form = document.getElementById('checkout-form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        const first = sessionStorage.getItem('pc-astral.last-order.v1');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        return { operations, same: first === sessionStorage.getItem('pc-astral.last-order.v1'), order: JSON.parse(first) };
      });
      assert.deepEqual(orderState.operations, ['pc-astral.last-order.v1', 'pc-astral.cart.v1']);
      assert(orderState.same); assert.equal(orderState.order.total, 41990000);
      assert.equal(await page.locator('#confirmation-customer').textContent(), values.name);
      assert.equal(await page.locator('#confirmation-customer img').count(), 0);
      await page.reload(); assert(await page.locator('.confirmation').isVisible());
      await context.close();
    });

    await check('R05. Slider hover, tạm dừng; countdown không reset khi reload', async () => {
      const context = await browser.newContext(); observe(context);
      const page = await context.newPage();
      await page.clock.install({ time: new Date('2026-10-17T10:00:00+07:00') });
      await page.goto(base + '/index.html');
      await page.locator('#hero-title').hover();
      await page.clock.fastForward(7000); assert.equal(await page.locator('#slide-count').textContent(), '01 / 03');
      await page.locator('#pause-slide').click(); await page.locator('#header-q').focus(); await page.mouse.move(0, 0);
      await page.clock.fastForward(7000); assert.equal(await page.locator('#slide-count').textContent(), '01 / 03');
      const before = await page.locator('#countdown').textContent();
      await page.reload(); assert.equal(await page.locator('#countdown').textContent(), before);
      await context.close();
    });
  } finally { await browser.close(); }

  await check('R06. Chrome và Edge: sáu trang × ba kích thước, font local, không tràn ngang', async () => {
    for (const channel of ['chrome', 'msedge']) {
      const browser = await chromium.launch({ channel, headless: true });
      try {
        const context = await browser.newContext(); observe(context);
        const page = await context.newPage();
        await page.goto(base + '/product-detail.html?id=p02');
        await page.locator('[data-quantity-input]').click();
        for (const width of [390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const url of ['index.html', 'products.html', 'product-detail.html?id=p01', 'cart.html', 'checkout.html', 'about.html']) {
            await page.goto(base + '/' + url); await page.evaluate(() => document.fonts.ready);
            assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), channel + ' ' + width + ' ' + url);
            assert(await page.evaluate(() => getComputedStyle(document.body).fontFamily.includes('Sarabun') && document.fonts.check('400 16px Sarabun', 'Đặng Nguyễn ₫')));
            assert.equal(await page.locator('#site-header .brand').count(), 1);
          }
        }
      } finally { await browser.close(); }
    }
  });
  await check('R07. Không lỗi JS, console, HTTP hoặc yêu cầu tài nguyên ngoài', async () => {
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
  });
  fs.writeFileSync(path.join(root, 'docs/refactor-tests.json'), JSON.stringify({ date: new Date().toISOString(), results, errors, external }, null, 2));
  if (results.some(result => result.status === 'FAIL')) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
