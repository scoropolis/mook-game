import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';

await mkdir('native-src', { recursive: true });
const source = await readFile('index.html', 'utf8');
const nativeScript = '  <script type="module" src="/native.ts"></script>\n';
const output = source.replace('</head>', `${nativeScript}</head>`);
await writeFile('native-src/index.html', output);
await copyFile('native/native.ts', 'native-src/native.ts');
console.log('Prepared native web source.');
