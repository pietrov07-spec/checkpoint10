import LINKS from '../data/links.json';

export const STORE_NAMES = { steam: 'Steam', playstation: 'PlayStation Store', xbox: 'Xbox Store', nintendo: 'Nintendo eShop' };

const LOCALE = { es: { ps: 'es-mx', xbox: 'es-MX', nin: 'es-mx' }, en: { ps: 'en-us', xbox: 'en-US', nin: 'us' } };

export function storeSearchUrl(store, title, lang = 'es') {
  const q = encodeURIComponent(title);
  const loc = LOCALE[lang] || LOCALE.es;
  switch (store) {
    case 'playstation': return `https://store.playstation.com/${loc.ps}/search/${q}`;
    case 'xbox': return `https://www.xbox.com/${loc.xbox}/search/results/games?q=${q}`;
    case 'nintendo': return `https://www.nintendo.com/${loc.nin}/search/#q=${q}`;
    case 'steam': return `https://store.steampowered.com/search/?term=${q}`;
    default: return null;
  }
}

const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };

/**
 * Enlaces oficiales/tiendas de un juego, en orden: sitio oficial, tiendas exactas, búsquedas.
 * Cada enlace: { kind: 'official'|'store'|'search', label, url, host }.
 * Los juegos creados por el usuario pueden traer `links` (desde RAWG) con el mismo formato.
 */
export function gameLinks(game, t, lang) {
  const out = [];
  const data = LINKS[game.id];
  if (data) {
    if (data.official) out.push({ kind: 'official', label: t('officialSite'), url: data.official });
    if (data.steam) out.push({ kind: 'store', label: STORE_NAMES.steam, url: data.steam });
    for (const s of data.exact || []) out.push({ kind: 'store', label: STORE_NAMES[s.store] || s.store, url: s.url });
    for (const s of data.search || []) {
      if ((data.exact || []).some((e) => e.store === s)) continue;
      out.push({ kind: 'search', label: t('searchIn').replace('{store}', STORE_NAMES[s]), url: storeSearchUrl(s, game.title, lang) });
    }
  } else if (Array.isArray(game.links)) {
    for (const l of game.links) out.push({ kind: l.kind || 'store', label: l.label || hostOf(l.url), url: l.url });
  } else if (game.facts && game.facts.site) {
    out.push({ kind: 'official', label: t('officialSite'), url: game.facts.site });
  }
  return out.map((l) => ({ ...l, host: hostOf(l.url) }));
}
