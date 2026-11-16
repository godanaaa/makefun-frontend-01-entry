import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
mkdirSync(output, { recursive: true });
cpSync(resolve(here, 'app'), resolve(output, 'app'), { recursive: true, force: true });
cpSync(resolve(here, 'screenshots'), resolve(output, 'screenshots'), { recursive: true, force: true });
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(resolve(output, 'dossier.json'), dossier);
