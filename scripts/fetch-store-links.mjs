// Reemplaza las búsquedas en tiendas de consola por los enlaces exactos de cada juego,
// consultando RAWG. Requiere RAWG_KEY (o VITE_RAWG_KEY) en .env.
// Uso: npm run stores        → muestra lo que encontró, sin escribir
//      npm run stores -- --write  → actualiza src/data/links.json
import { readFile, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), '');
const KEY = env.RAWG_KEY || env.VITE_RAWG_KEY;
if (!KEY) { console.error('Falta RAWG_KEY en .env (consíguela gratis en https://rawg.io/apidocs).'); process.exit(1); }
const WRITE = process.argv.includes('--write');

// id de tienda en RAWG -> clave en links.json
const STORE = { 2: 'xbox', 3: 'playstation', 6: 'nintendo' };
const api = async (p, q = {}) => {
  const res = await fetch(`https://api.rawg.io/api${p}?${new URLSearchParams({ key: KEY, ...q })}`);
  if (!res.ok) throw new Error(`${p}: ${res.status}`);
  return res.json();
};

const games = JSON.parse(await readFile('src/data/games.json', 'utf8'));
const links = JSON.parse(await readFile('src/data/links.json', 'utf8'));

for (const g of games) {
  const entry = links[g.id] || (links[g.id] = { search: [] });
  try {
    const found = (await api('/games', { search: g.title, page_size: '1', search_precise: 'true' })).results?.[0];
    if (!found) { console.log(`– ${g.title}: sin coincidencia`); continue; }
    const stores = (await api(`/games/${found.id}/stores`)).results || [];
    const exact = stores.filter((s) => STORE[s.store_id] && s.url).map((s) => ({ store: STORE[s.store_id], url: s.url }));
    console.log(`✓ ${g.title} → ${found.name}: ${exact.map((e) => e.store).join(', ') || '(sin tiendas de consola)'}`);
    if (exact.length) {
      entry.exact = exact;
      entry.search = [...new Set([...(entry.search || []), ...exact.map((e) => e.store)])];
    }
  } catch (e) {
    console.log(`✗ ${g.title}: ${e.message}`);
  }
}

if (WRITE) {
  await writeFile('src/data/links.json', JSON.stringify(links, null, 2) + '\n');
  console.log('src/data/links.json actualizado. Revisa el diff antes de publicar.');
} else {
  console.log('\n(Prueba en seco. Agrega --write para guardar los cambios.)');
}
