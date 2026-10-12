import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const mode = (process.argv[2] || 'debug').toLowerCase();
const androidDir = path.join(process.cwd(), 'android');
if (!fs.existsSync(androidDir)) {
  console.error('Cartella android non trovata. Esegui: npm run cap:add:android');
  process.exit(1);
}
const isWin = process.platform === 'win32';
const gradle = isWin ? 'gradlew.bat' : './gradlew';
const task = mode === 'release' ? 'assembleRelease' : 'assembleDebug';
const result = spawnSync(gradle, [task], { cwd: androidDir, stdio: 'inherit', shell: isWin });
if (result.status !== 0) process.exit(result.status ?? 1);
const apk = mode === 'release'
  ? path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release')
  : path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug');
console.log(`APK generato in: ${apk}`);
