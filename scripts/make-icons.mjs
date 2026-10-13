// Genera favicon, iconos de la PWA y la imagen Open Graph por defecto a partir del logo (luna amarilla).
// Uso: npm run icons
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const logo = (size, pad = 0) => {
  const s = 40, p = pad * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-p} ${-p} ${s + 2 * p} ${s + 2 * p}">
  <rect x="${-p}" y="${-p}" width="${s + 2 * p}" height="${s + 2 * p}" fill="#0d1a2b"/>
  <circle cx="20" cy="20" r="17" fill="#f4d84b"/><circle cx="27" cy="16" r="14" fill="#0d1a2b"/></svg>`;
};

await mkdir('public/icons', { recursive: true });
await writeFile('public/favicon.svg', logo(64, 0.05));
const png = (svg, file) => sharp(Buffer.from(svg)).png().toFile(file);
await png(logo(192, 0.08), 'public/icons/icon-192.png');
await png(logo(512, 0.08), 'public/icons/icon-512.png');
await png(logo(512, 0.3), 'public/icons/icon-maskable-512.png');
await png(logo(180, 0.1), 'public/icons/apple-touch-icon.png');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0d1a2b"/>
  <g transform="translate(345,150)">
    <rect x="0" y="0" width="90" height="300" rx="6" fill="#1f8ba8"/>
    <rect x="105" y="30" width="90" height="270" rx="6" fill="#e01e1e"/>
    <rect x="210" y="-10" width="90" height="310" rx="6" fill="#57b947"/>
    <rect x="315" y="50" width="90" height="250" rx="6" fill="#f4d84b"/>
    <rect x="420" y="10" width="90" height="290" rx="6" fill="#a94f96"/>
  </g>
  <rect x="345" y="475" width="510" height="14" rx="7" fill="#f4d84b"/>
</svg>`;
await png(og, 'public/icons/og-default.png');
console.log('Iconos listos en public/icons/');
