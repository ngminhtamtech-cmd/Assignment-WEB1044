const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const base = process.env.ASTRAL_TEST_URL;
const output = path.resolve(__dirname, '../tmp', process.env.ASTRAL_CAPTURE || 'refactor-after-visual');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      const NativeDate = Date;
      window.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length ? args : ['2026-10-17T10:00:00+07:00'])); }
        static now() { return NativeDate.parse('2026-10-17T10:00:00+07:00'); }
      };
    });
    const page = await context.newPage();
    await page.goto(base + '/index.html');
    await page.evaluate(() => localStorage.setItem('pc-astral.cart.v1', JSON.stringify([{ productId: 'p01', quantity: 2 }])));
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const name of ['index', 'products', 'product-detail', 'cart', 'checkout', 'about']) {
        await page.goto(base + '/' + name + '.html' + (name === 'product-detail' ? '?id=p01' : ''));
        await page.waitForLoadState('networkidle');
        await page.evaluate(async () => {
          await document.fonts.ready;
          for (const image of document.images) image.loading = 'eager';
          await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
        });
        await page.screenshot({ path: path.join(output, name + '-' + width + '.png'), fullPage: true });
        if (width === 1440) {
          fs.writeFileSync(path.join(output, name + '.html'), await page.content());
        }
      }
    }
    // Xác nhận mẫu để chuyển khung giao diện cố định về checkout.html.
    await page.goto(base + '/checkout.html');
    for (const [name, value] of Object.entries({ name: 'Khách Mẫu', email: 'demo@example.com', phone: '0901234567', address: 'Địa chỉ mẫu' })) {
      await page.locator('#' + name).fill(value);
    }
    await page.locator('#place-order').click();
    fs.writeFileSync(path.join(output, 'confirmation.html'), await page.content());
    console.log('Captured 18 viewports and page markup: ' + output);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
