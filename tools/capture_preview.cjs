const {chromium}=require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 for(const [url,file] of [['index.html','01-home'],['product-detail.html?id=p01','03-product-detail']]){
  await page.goto('http://127.0.0.1:4173/'+url);await page.waitForLoadState('networkidle');
  await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode()));});
  await page.screenshot({path:path.resolve('docs/screenshots/'+file+'.png'),fullPage:true});
  if(file==='01-home')await page.screenshot({path:path.resolve('docs/screenshots/preview-desktop.png')});
 }
 await page.setViewportSize({width:390,height:900});await page.goto('http://127.0.0.1:4173/index.html');await page.waitForLoadState('networkidle');
 await page.screenshot({path:path.resolve('docs/screenshots/preview-mobile.png')});
 console.log('Preview screenshots refreshed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
