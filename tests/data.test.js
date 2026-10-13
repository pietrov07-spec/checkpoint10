import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import games from '../src/data/games.json';
import links from '../src/data/links.json';
import es from '../src/i18n/es.json';
import en from '../src/i18n/en.json';
import { avgOf, collectionStats, matchGame, versusWins } from '../src/lib/stats.js';
import { hexToHsl, hslToHex, shadesFrom } from '../src/lib/colors.js';
import { gameLinks, storeSearchUrl } from '../src/lib/links.js';
import { PLATORDER } from '../src/data/config.js';

describe('datos de la colección', () => {
  it('cada juego tiene 10 calificaciones de 0 a 5, 5 colores y plataforma válida', () => {
    for (const g of games) {
      expect(g.scores, g.id).toHaveLength(10);
      g.scores.forEach((s) => expect(s >= 0 && s <= 5).toBe(true));
      expect(g.pairs, g.id).toHaveLength(5);
      expect(PLATORDER).toContain(g.platform);
    }
  });

  it('los ids son únicos', () => {
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length);
  });

  it('cada juego tiene su portada optimizada (npm run covers)', () => {
    for (const g of games) for (const s of ['300.webp', '600.webp', 'og.jpg']) expect(existsSync(`public/${g.cover}-${s}`), `${g.id}-${s}`).toBe(true);
  });

  it('cada juego enlaza a su página oficial o a una tienda (atribución de la portada)', () => {
    const t = (k) => es[k];
    for (const g of games) {
      expect(links[g.id], g.id).toBeTruthy();
      const l = gameLinks(g, t, 'es');
      expect(l.length, g.id).toBeGreaterThan(0);
      l.forEach((x) => expect(x.url).toMatch(/^https:\/\//));
    }
  });

  it('ES y EN tienen las mismas claves', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    expect(en.labels).toHaveLength(10);
  });
});

describe('enlaces', () => {
  it('codifica el título en la búsqueda de cada tienda', () => {
    expect(storeSearchUrl('playstation', 'Death’s Door', 'es')).toBe('https://store.playstation.com/es-mx/search/Death%E2%80%99s%20Door');
    expect(storeSearchUrl('xbox', 'Cocoon', 'en')).toBe('https://www.xbox.com/en-US/search/results/games?q=Cocoon');
  });

  it('juego creado con enlaces de RAWG', () => {
    const g = { id: 'custom_1', title: 'X', links: [{ kind: 'store', label: 'Steam', url: 'https://store.steampowered.com/app/1/' }] };
    expect(gameLinks(g, (k) => es[k], 'es')).toEqual([{ kind: 'store', label: 'Steam', url: 'https://store.steampowered.com/app/1/', host: 'store.steampowered.com' }]);
  });
});

describe('estadísticas', () => {
  it('promedio, filtros y versus', () => {
    const rdr = games.find((g) => g.id === 'rdr');
    expect(avgOf(rdr)).toBe(4.7);
    expect(matchGame(rdr, { query: 'red', platFilter: 'PlayStation', minScore: 4.5 })).toBe(true);
    expect(matchGame(rdr, { query: '', platFilter: 'Xbox' })).toBe(false);
    const control = games.find((g) => g.id === 'control');
    expect(versusWins(rdr, control)).toEqual([6, 1]);
  });

  it('perfil de la colección', () => {
    const s = collectionStats(games, es.labels, PLATORDER);
    expect(s.best.id).toBe('rdr');
    expect(s.byPlat.reduce((a, p) => a + p.count, 0)).toBe(games.length);
    expect(collectionStats([], es.labels, PLATORDER)).toBeNull();
  });
});

describe('colores', () => {
  it('hex → hsl → hex conserva el color', () => {
    for (const c of ['#34a6bd', '#e01e1e', '#f4d84b']) {
      const { h, s, l } = hexToHsl(c);
      expect(hslToHex(h, s, l)).toBe(c);
    }
  });
  it('shadesFrom da 5 tonos válidos', () => {
    const sh = shadesFrom('#57b947');
    expect(sh).toHaveLength(5);
    sh.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/));
  });
});
