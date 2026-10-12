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
html = html.replace('AYNO FIELD 0.9.3 — Sopralluogo AV', 'AYNO FIELD 0.9.5 — Sopralluogo AV');
html = html.replace("${label('1–2 POSTI',112,58)}", "${label('1–2 POSTI',105,58)}");
html = html.replace("${label('7–12 POSTI',123,22)}", "${label('7–12 POSTI',112,22)}");
html = html.replace("${label('12–20 POSTI',119,19)}", "${label('12–20 POSTI',108,19)}");
html = html.replace("${label('EXECUTIVE',118,20)}", "${label('EXECUTIVE',110,20)}");

const androidResponsiveFix = `<style id="android-responsive-fix">
html,body{max-width:100%;overflow-x:hidden}body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}.app{min-width:0;max-width:100%;overflow-x:hidden}.shell{grid-template-columns:245px minmax(0,1fr);min-width:0}.content{min-width:0;overflow-x:hidden}.form-grid{grid-template-columns:repeat(12,minmax(0,1fr));min-width:0}.matrix{max-width:100%}
@media(max-width:700px){
.topbar{padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right));gap:8px}.brand{gap:8px;min-width:0}.ayno{font-size:27px;flex:0 0 auto}.sub{letter-spacing:.14em}.top-actions{display:flex;gap:6px;min-width:0}.top-actions .btn{padding:9px 10px;font-size:11px;white-space:nowrap}.content{padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right));overflow-x:hidden}.hero>*,.setup-head>*,.form-grid>*,.group,.card,.room-card,.project-card,.overview-project,.overview-room{min-width:0;max-width:100%}h1{font-size:clamp(38px,13vw,52px);overflow-wrap:anywhere}.section-head,.overview-head,.group-title{flex-wrap:wrap}.matrix{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap}.matrix th,.matrix td{min-width:76px}.matrix th:first-child,.matrix td:first-child{min-width:130px}.path-table{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
.modal{align-items:flex-start;overflow-y:auto;padding:8px max(8px,env(safe-area-inset-right)) 8px max(8px,env(safe-area-inset-left))}.modal-card{width:100%;max-width:100%;min-width:0;padding:14px;overflow-x:hidden}#modalBody,.form-grid,.group,.roomtype-grid,.roomtype-card,.roomtype-inner,.roomtype-visual,.roomtype-card-desc{min-width:0;max-width:100%}.roomtype-grid,.shape-grid{grid-template-columns:1fr}.roomtype-inner{width:100%;overflow:hidden;padding:12px}.roomtype-visual{margin:2px -12px 0;padding:8px 12px;overflow:hidden}.roomtype-card-desc,.roomtype-card-title,.roomtype-card-meta,.roomtype-purpose{white-space:normal;overflow-wrap:break-word;word-break:normal}.roomtype-card-desc{font-size:10.5px;line-height:1.45;padding-right:2px}.roomtype-card svg{display:block;width:100%;max-width:100%;height:auto;min-height:96px;overflow:visible}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.btn{max-width:100%}}
@media(max-width:420px){.modal{padding-left:6px;padding-right:6px}.modal-card{padding:12px}.roomtype-inner{padding:10px}.roomtype-visual{margin-left:-10px;margin-right:-10px;padding-left:10px;padding-right:10px}.roomtype-card-title{font-size:13px}.roomtype-card-meta{font-size:10.5px}.roomtype-purpose{font-size:9.5px;letter-spacing:.06em}.roomtype-card-desc{font-size:10px}}
@media(max-width:390px){.stats{grid-template-columns:1fr}.photo-grid{grid-template-columns:1fr}.sub,.sep{display:none}.topbar{height:58px}.shell{min-height:calc(100vh - 58px)}.top-actions .btn{padding:8px 9px;font-size:10px}}
</style>`;
html = html.replace('</head>', `${androidResponsiveFix}\n</head>`);

fs.writeFileSync(indexPath, html);
console.log('Web assets preparati. jsPDF locale/offline, index ricostruito e fix Android 0.9.5 applicato.');
