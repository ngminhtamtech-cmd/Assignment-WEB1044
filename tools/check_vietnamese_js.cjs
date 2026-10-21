// Kiểm tra cấu trúc mã trước khi đóng gói; không nạp công cụ này vào website.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const crypto = require('crypto');
const babel = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/lib/transform/babelBundle.js');
const root = path.resolve(__dirname, '..');
const site = path.join(root, 'PC-Astral-Market');
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'docs/doi-ten-javascript.json'), 'utf8'));
const allowed = new Set(Object.values(mapping.functions).concat(['kiemTraSanPham', 'boSungDanhMuc', 'napDuLieuSanPham', 'luuGio', 'constructor',
  'docGiaTriBieuMau', 'luuBanNhap', 'khoiPhucBanNhap', 'cacDongGiongNhau', 'hienThiCanhBaoDonGio', 'thuDonGio', 'xoaBanNhapSauDatHang']));
const files = Object.values(mapping.files);
const names = [];
const hashes = {};
for (const oldName of Object.keys(mapping.files)) assert(!fs.existsSync(path.join(site, oldName)), oldName);
for (const file of files) {
  const source = fs.readFileSync(path.join(site, file), 'utf8');
  hashes[file] = crypto.createHash('sha256').update(source).digest('hex');
  const ast = babel.babelParse(source, file, false);
  babel.traverse(ast, {
    Function(p) {
      assert(p.isFunctionDeclaration() || p.isClassMethod(), 'Expected named declaration: ' + file);
      const name = p.node.id?.name || p.node.key?.name;
      assert(allowed.has(name), 'Unexpected function name ' + name + ' in ' + file);
      names.push(name);
    },
    'ImportDeclaration|ExportNamedDeclaration|ExportDefaultDeclaration|ConditionalExpression|SpreadElement|RestElement|ObjectPattern|ArrayPattern|OptionalMemberExpression|ForOfStatement|AssignmentPattern'() {
      assert.fail('Unexpected complex syntax in ' + file);
    },
    CallExpression(p) {
      const method = p.node.callee.property?.name;
      assert(!['map', 'filter', 'reduce', 'forEach', 'replaceChildren'].includes(method), file + ': ' + method);
    },
    CatchClause(p) {
      assert.equal(p.node.param?.name, 'loi', 'Catch needs an explicit Vietnamese name');
    }
  });
}
const pages = fs.readdirSync(site).filter(name => name.endsWith('.html'));
for (const page of pages) {
  const source = fs.readFileSync(path.join(site, page), 'utf8');
  const tags = source.match(/<script\b[^>]*>/g) || [];
  const scripts = tags.map(tag => {
    assert(/\bdefer\b/.test(tag), page);
    return tag.match(/src="([^"]+)"/)[1];
  });
  assert(scripts.length >= 6, page);
  for (const script of scripts) assert(files.includes(script) && fs.existsSync(path.join(site, script)), page + ': ' + script);
  assert.equal(scripts[0], 'js/san-pham-du-phong.js');
  assert.equal(scripts[1], 'js/du-lieu.js');
  assert.equal(scripts.at(-1), 'js/su-kien.js');
}
const result = {status:'PASS', date:'2026-10-21', javascript_files:files.length, html_pages:pages.length,
  function_declarations:names.length, all_custom_functions_vietnamese:true,
  standard_names_preserved:['Product', 'Cart', 'constructor', 'Browser APIs', 'JSON fields', 'Storage keys'],
  simple_syntax_verified:true, source_sha256:hashes};
fs.writeFileSync(path.join(root, 'docs/viet-hoa-check.json'), JSON.stringify(result, null, 2));
console.log('PASS: ' + files.length + ' files, ' + names.length + ' named functions/methods, ' + pages.length + ' pages');
