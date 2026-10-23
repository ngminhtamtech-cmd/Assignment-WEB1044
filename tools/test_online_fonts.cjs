const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),site=path.join(root,'PC-Astral-Market');
const pages=['index.html','products.html','product-detail.html?id=p01','cart.html','checkout.html','register.html','about.html'];
const results=[];const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{const f=path.resolve(site,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!f.startsWith(site+path.sep)||!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/';const browser=await chromium.launch({channel:'chrome',headless:true});
try{
for(const blocked of [false,true])for(const mode of ['http','file']){
 const ctx=await browser.newContext();if(blocked)await ctx.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
 const p=await ctx.newPage(),errors=[],missing=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().includes('google'))missing.push(r.url());});
 const go=async name=>{await p.goto(mode==='http'?base+name:pathToFileURL(path.join(site,name.split('?')[0])).href+(name.includes('?')?'?'+name.split('?')[1]:''));await p.waitForFunction(()=>window.PCAstral?.initialized);await p.evaluate(()=>document.fonts.ready);};
 for(const width of [390,768,1440]){await p.setViewportSize({width,height:1000});for(const name of pages){
  await go(name);
  const font=await p.evaluate(()=>({loaded:[...document.fonts].filter(f=>f.family==='Sarabun'&&f.status==='loaded').length,overflow:document.documentElement.scrollWidth>innerWidth+1}));
  assert.equal(font.overflow,false,name+' overflow '+width);if(!blocked)assert(font.loaded>0,'Sarabun not loaded '+name);else assert.equal(font.loaded,0);
  results.push({mode,blocked,width,page:name,loadedSarabunFaces:font.loaded});
 }
 }
 // Xác nhận font thực tế bằng Chrome DevTools, không chỉ đọc font-family.
 await go('index.html');const cdp=await ctx.newCDPSession(p);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const doc=await cdp.send('DOM.getDocument');const node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#hero-title'});const actual=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});
 assert(actual.fonts.some(f=>blocked?/Arial/.test(f.familyName):/Sarabun/.test(f.familyName)),JSON.stringify(actual));
 await go('products.html?q=asus');assert((await p.locator('.product-card').count())>0);await p.locator('[data-add]').first().click();await go('cart.html');assert.equal(await p.locator('.cart-row').count(),1);await p.reload();await p.waitForFunction(()=>PCAstral.initialized);assert.equal(await p.locator('.cart-row').count(),1);
 await go('checkout.html');for(const [key,val] of Object.entries({name:'Kiểm tra Font',email:'font@example.com',phone:'0901234567',address:'Địa chỉ demo Đà Nẵng',note:'Kiểm tra font'}))await p.locator('#'+key).fill(val);
 await p.locator('#place-order').click();await p.locator('#order-confirmation').waitFor({state:'visible'});await p.reload();await p.waitForFunction(()=>PCAstral.initialized);assert(await p.locator('#order-confirmation').isVisible());
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);results.push({mode,blocked,flow:'search-cart-reload-checkout-confirmation',actualFonts:actual.fonts,status:'PASS'});await ctx.close();console.log(mode,blocked?'fallback':'Sarabun','PASS');
}
const crypto=require('crypto');const hashes=JSON.parse(fs.readFileSync(path.join(root,'docs/font-online-preservation.json')));for(const [f,sha] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),sha,f);
fs.writeFileSync(path.join(root,'docs/font-online-tests.json'),JSON.stringify({status:'PASS',date:'2026-10-23',browser:'Chrome',http:'Local static HTTP equivalent to Live Server serving; VS Code extension not launched',checks:results,preservedFiles:Object.keys(hashes).length},null,2));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
