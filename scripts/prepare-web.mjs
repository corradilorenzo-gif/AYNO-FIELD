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
fs.writeFileSync(indexPath, html);
console.log('Web assets preparati. jsPDF locale/offline e index ricostruito.');
