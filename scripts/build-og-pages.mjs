// Después de `vite build`: crea dist/juego/<id>/index.html para cada juego base,
// con su título, descripción e imagen en las etiquetas Open Graph. Así, al pegar el
// enlace de un juego en WhatsApp, X o Threads aparece su portada y su promedio.
// La página carga la misma app, que abre la ficha de ese juego.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), '');
const SITE = (env.VITE_SITE_URL || '').replace(/\/$/, '');
if (!SITE) console.warn('⚠ Define VITE_SITE_URL en .env (p. ej. https://checkpoint10.vercel.app): las redes necesitan URLs absolutas en og:image.');

const games = JSON.parse(await readFile('src/data/games.json', 'utf8'));
const versions = JSON.parse(await readFile('src/data/covers.json', 'utf8'));
const es = JSON.parse(await readFile('src/i18n/es.json', 'utf8'));
const html = await readFile('dist/index.html', 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = (p) => SITE + p;

for (const g of games) {
  const avg = (g.scores.reduce((a, b) => a + b, 0) / g.scores.length).toFixed(1);
  const title = `${g.title} — ${avg}/5 · CHECKPOINT10`;
  const best = g.scores.map((v, i) => [v, es.labels[i]]).sort((a, b) => b[0] - a[0]).slice(0, 3).map((x) => x[1]).join(', ');
  const desc = `Análisis en 10 categorías. Lo más fuerte: ${best}.`;
  const url = abs(`/juego/${g.id}/`);
  const tags = `<!--og:start-->
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="CHECKPOINT10" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(abs(`/covers/${g.id}-og.jpg?v=${versions[g.id] || ''}`))}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <!--og:end-->`;
  const page = html
    .replace(/<!--og:start-->[\s\S]*?<!--og:end-->/, tags)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(desc)}"`);
  await mkdir(`dist/juego/${g.id}`, { recursive: true });
  await writeFile(`dist/juego/${g.id}/index.html`, page);
}

// La portada de inicio también necesita la imagen por defecto con URL absoluta.
if (SITE) {
  await writeFile('dist/index.html', html.replace('content="/icons/og-default.png"', `content="${abs('/icons/og-default.png')}"`));
}
console.log(`✓ ${games.length} páginas de juego con vista previa en dist/juego/`);
