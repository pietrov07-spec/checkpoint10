// Autocompletado de fichas con la API de RAWG (https://rawg.io/apidocs).
// Requiere VITE_RAWG_KEY en .env; sin clave, el buscador no aparece.
const KEY = import.meta.env.VITE_RAWG_KEY || '';
const API = 'https://api.rawg.io/api';

export const rawgEnabled = () => !!KEY;

// id de tienda en RAWG -> nombre que mostramos
export const RAWG_STORES = { 1: 'Steam', 2: 'Xbox Store', 3: 'PlayStation Store', 4: 'App Store', 5: 'GOG', 6: 'Nintendo eShop', 7: 'Xbox 360 Store', 8: 'Google Play', 9: 'itch.io', 11: 'Epic Games Store' };

async function api(path, params = {}) {
  const qs = new URLSearchParams({ key: KEY, ...params });
  const res = await fetch(`${API}${path}?${qs}`);
  if (!res.ok) throw new Error('RAWG ' + res.status);
  return res.json();
}

/** Plataforma de CHECKPOINT10 más probable según las plataformas que reporta RAWG. */
export function guessPlatform(platforms = []) {
  const slugs = platforms.map((p) => p.platform?.slug || '');
  if (slugs.some((s) => s.startsWith('playstation'))) return 'PlayStation';
  if (slugs.some((s) => s.startsWith('xbox'))) return 'Xbox';
  if (slugs.some((s) => s.startsWith('nintendo'))) return 'Switch';
  return 'SteamDeck';
}

export async function searchGames(query, signal) {
  if (!KEY || !query.trim()) return [];
  const qs = new URLSearchParams({ key: KEY, search: query, page_size: '6', search_precise: 'true' });
  const res = await fetch(`${API}/games?${qs}`, { signal });
  if (!res.ok) throw new Error('RAWG ' + res.status);
  const data = await res.json();
  return (data.results || []).map((g) => ({
    rawgId: g.id,
    title: g.name,
    relYear: g.released ? Number(g.released.slice(0, 4)) : null,
    cover: g.background_image || null,
    platform: guessPlatform(g.platforms),
  }));
}

/** Detalles + tiendas para llenar la ficha técnica y los enlaces de un juego. */
export async function gameDetails(rawgId) {
  const [d, stores] = await Promise.all([api(`/games/${rawgId}`), api(`/games/${rawgId}/stores`).catch(() => ({ results: [] }))]);
  const names = (arr) => (arr || []).map((x) => x.name).join(', ');
  const studio = [names(d.developers), d.publishers?.length ? 'ed. ' + names(d.publishers) : ''].filter(Boolean).join(' — ');
  const links = [];
  if (d.website) links.push({ kind: 'official', url: d.website });
  for (const s of stores.results || []) {
    if (s.url) links.push({ kind: 'store', label: RAWG_STORES[s.store_id] || 'Tienda', url: s.url });
  }
  return {
    facts: {
      studio: studio || undefined,
      score: d.metacritic ? 'Metacritic ' + d.metacritic : undefined,
      site: d.website || undefined,
      source: 'RAWG.io',
    },
    links,
  };
}
