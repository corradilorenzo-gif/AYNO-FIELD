import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const www = path.join(root, 'www');
const vendor = path.join(www, 'vendor');
const src = path.join(root, 'web-src');
fs.mkdirSync(www, { recursive: true });
fs.mkdirSync(vendor, { recursive: true });

if (fs.existsSync(src)) {
  const parts = fs.readdirSync(src)
    .filter(name => /^index\.part\d+$/.test(name))
    .sort();
  if (parts.length) {
    const html = parts.map(name => fs.readFileSync(path.join(src, name), 'utf8')).join('');
    fs.writeFileSync(path.join(www, 'index.html'), html);
  }
}

const jsPdfSource = path.join(root, 'node_modules', 'jspdf', 'dist', 'jspdf.umd.min.js');
const jsPdfTarget = path.join(vendor, 'jspdf.umd.min.js');
if (!fs.existsSync(jsPdfSource)) {
  console.error('jsPDF non trovato. Esegui prima: npm install');
  process.exit(1);
}
fs.copyFileSync(jsPdfSource, jsPdfTarget);

const indexPath = path.join(www, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('www/index.html non trovato e nessun frammento web-src/index.part* disponibile.');
  process.exit(1);
}
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(
  /https:\/\/cdn\.jsdelivr\.net\/npm\/jspdf@[^"']+\/dist\/jspdf\.umd\.min\.js/g,
  './vendor/jspdf.umd.min.js'
);
html = html.replace('AYNO FIELD 0.9.3 — Sopralluogo AV', 'AYNO FIELD 0.9.4 — Sopralluogo AV');

const androidResponsiveFix = `<style id="android-responsive-fix">
html,body{max-width:100%;overflow-x:hidden}body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}.app{min-width:0;max-width:100%;overflow-x:hidden}.shell{grid-template-columns:245px minmax(0,1fr);min-width:0}.content{min-width:0;overflow-x:hidden}.form-grid{grid-template-columns:repeat(12,minmax(0,1fr));min-width:0}.matrix{max-width:100%}
@media(max-width:700px){.topbar{padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right));gap:8px}.brand{gap:8px;min-width:0}.ayno{font-size:27px;flex:0 0 auto}.sub{letter-spacing:.14em}.top-actions{display:flex;gap:6px;min-width:0}.top-actions .btn{padding:9px 10px;font-size:11px;white-space:nowrap}.content{padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right));overflow-x:hidden}.hero>*,.setup-head>*,.form-grid>*,.group,.card,.room-card,.project-card,.overview-project,.overview-room{min-width:0;max-width:100%}h1{font-size:clamp(38px,13vw,52px);overflow-wrap:anywhere}.section-head,.overview-head,.group-title{flex-wrap:wrap}.matrix{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap}.matrix th,.matrix td{min-width:76px}.matrix th:first-child,.matrix td:first-child{min-width:130px}.path-table{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.modal{padding:8px max(8px,env(safe-area-inset-right)) 8px max(8px,env(safe-area-inset-left))}.modal-card{width:100%;max-width:100%;padding:16px;overflow-x:hidden}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.roomtype-grid,.shape-grid{grid-template-columns:1fr}.btn{max-width:100%}}
@media(max-width:390px){.stats{grid-template-columns:1fr}.photo-grid{grid-template-columns:1fr}.sub,.sep{display:none}.topbar{height:58px}.shell{min-height:calc(100vh - 58px)}.top-actions .btn{padding:8px 9px;font-size:10px}}
</style>`;
html = html.replace('</head>', `${androidResponsiveFix}\n</head>`);

fs.writeFileSync(indexPath, html);
console.log('Web assets preparati. jsPDF locale/offline, index ricostruito e fix responsive Android applicato.');
