import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const read = (p) => fs.readFile(path.join(pub, p));
const pngDimensions = async (p) => {
  const b = await read(p);
  assert.equal(b.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', p);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};
for (const [p, size] of [
  ['assets/apple-touch-icon.png', 180],
  ['assets/icon-192.png', 192],
  ['assets/icon-512.png', 512],
  ['assets/favicon-32.png', 32],
]) assert.deepEqual(await pngDimensions(p), [size,size], p);

const ico = await read('favicon.ico');
assert.equal(ico.readUInt16LE(0),0);
assert.equal(ico.readUInt16LE(2),1);

const manifest = JSON.parse((await read('manifest.webmanifest')).toString());
assert.equal(manifest.short_name,'GDSantos');
assert.equal(manifest.display,'standalone');
assert.equal(manifest.start_url,'/pt/');
assert.ok(manifest.icons.some(i => i.sizes === '192x192'));
assert.ok(manifest.icons.some(i => i.sizes === '512x512'));

for (const locale of ['', 'pt/', 'en/', 'es/', 'pt/projeto/', 'en/projeto/', 'es/projeto/']) {
  const html = (await read(locale+'index.html')).toString();
  assert.ok(html.includes('apple-mobile-web-app-title" content="GDSantos"'),locale);
  assert.ok(html.includes('/assets/apple-touch-icon.png?v=liquio1'),locale);
  assert.ok(html.includes('/assets/favicon-32.png?v=gds2'),locale);
  assert.ok(html.includes('/manifest.webmanifest'),locale);
  assert.ok(html.includes('/assets/favicon.svg?v=gds2'),locale);
  assert.ok(html.includes('/favicon.ico?v=gds2'),locale);
}
const faviconSvg = (await read('assets/favicon.svg')).toString();
assert.ok(faviconSvg.includes('font-family="Georgia,serif"') && faviconSvg.includes('fill="#e63950">G</text>'),'Browser favicon must be original crimson G');
console.log('Original G browser favicon, Liquio iOS/Android icons, manifest and seven pages OK.');
