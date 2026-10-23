// Lập danh sách vị trí hàm bằng parser; không sửa mã website.
const fs=require('fs'),path=require('path');
const babel=require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/lib/transform/babelBundle.js');
const root=path.resolve(__dirname,'..'),site=path.join(root,'PC-Astral-Market');const symbols={};
function walk(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())walk(file);else if(file.endsWith('.js')){const relative=path.relative(site,file).replaceAll('\\','/');symbols[relative]=[];babel.traverse(babel.babelParse(fs.readFileSync(file,'utf8'),relative,false),{Function(p){let name=p.node.id?.name||p.node.key?.name;const owner=p.findParent(x=>x.isClassDeclaration());if(owner)name=owner.node.id.name+'.'+name;symbols[relative].push({name,start:p.node.loc.start.line,end:p.node.loc.end.line});}});}}}
walk(path.join(site,'js'));fs.writeFileSync(path.join(root,'docs/defense-source-symbols.json'),JSON.stringify(symbols,null,2));console.log('Indexed functions in '+Object.keys(symbols).length+' JS files.');
