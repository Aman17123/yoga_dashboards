import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../dist');
const destDir = path.resolve(__dirname, '../../server/client/dist');

try {
  if (fs.existsSync(srcDir)) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.cpSync(srcDir, destDir, { recursive: true, force: true });
    console.log(`[Hostinger Deploy] Successfully copied static files:\n  From: ${srcDir}\n  To:   ${destDir}`);
  } else {
    console.warn(`[Hostinger Deploy] Warning: source directory not found: ${srcDir}`);
  }
} catch (err) {
  console.error(`[Hostinger Deploy] Error copying static build:`, err);
}
