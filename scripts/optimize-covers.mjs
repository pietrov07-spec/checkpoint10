// Genera las portadas optimizadas a partir de assets/covers-src/*.jpg:
//   public/covers/<id>-300.webp, <id>-600.webp  → para la app (srcset)
//   public/covers/<id>-og.jpg (1200×630)         → vista previa al compartir (Open Graph)
// Uso: npm run covers   (vuelve a correrlo cuando agregues o cambies una portada)
import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/covers-src';
const OUT = 'public/covers';
await mkdir(OUT, { recursive: true });

const versions = {};
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
for (const f of files) {
  const id = path.parse(f).name;
  const src = path.join(SRC, f);
  // Huella del archivo: cambia cuando cambia la imagen y obliga a los navegadores a no usar la copia vieja.
  versions[id] = createHash('sha1').update(await readFile(src)).digest('hex').slice(0, 8);
  for (const w of [300, 600]) {
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, `${id}-${w}.webp`));
  }
  // Open Graph: portada centrada sobre un fondo desenfocado de la misma imagen.
  const bg = await sharp(src).resize(1200, 630, { fit: 'cover' }).blur(28).modulate({ brightness: 0.55 }).toBuffer();
  const fg = await sharp(src).resize({ height: 570 }).toBuffer();
  const { width } = await sharp(fg).metadata();
  await sharp(bg)
    .composite([{ input: fg, left: Math.round((1200 - width) / 2), top: 30 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${id}-og.jpg`));
  console.log('✓', id);
}
await writeFile('src/data/covers.json', JSON.stringify(versions, null, 2) + '\n');
console.log(`${files.length} portadas listas en ${OUT}/`);
