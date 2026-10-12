import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const www = path.join(root, 'www');
const vendor = path.join(www, 'vendor');
fs.mkdirSync(vendor, { recursive: true });

const jsPdfSource = path.join(root, 'node_modules', 'jspdf', 'dist', 'jspdf.umd.min.js');
const jsPdfTarget = path.join(vendor, 'jspdf.umd.min.js');
if (!fs.existsSync(jsPdfSource)) {
  console.error('jsPDF non trovato. Esegui prima: npm install');
  process.exit(1);
}
fs.copyFileSync(jsPdfSource, jsPdfTarget);

const indexPath = path.join(www, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(
  /https:\/\/cdn\.jsdelivr\.net\/npm\/jspdf@[^"']+\/dist\/jspdf\.umd\.min\.js/g,
  './vendor/jspdf.umd.min.js'
);
fs.writeFileSync(indexPath, html);
console.log('Web assets preparati. jsPDF ora è locale/offline.');
