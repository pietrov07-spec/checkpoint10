import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { clear } from 'idb-keyval';
import { loadCollection, saveCollection, makeBackup, parseBackup, sanitize } from '../src/lib/storage.js';

const game = (id, title = 'Mi juego') => ({ id, title, scores: Array(10).fill(3), platform: 'Xbox' });

describe('almacenamiento', () => {
  beforeEach(async () => { await clear(); localStorage.clear(); });

  it('sin datos devuelve una colección vacía', async () => {
    expect((await loadCollection()).customGames).toEqual([]);
  });

  it('migra la versión vieja de localStorage a IndexedDB', async () => {
    localStorage.setItem('paquer_custom_v1', JSON.stringify({ customGames: [game('custom_1')], order: ['rdr', 'custom_1'], overrides: {}, deleted: ['journey'] }));
    const first = await loadCollection();
    expect(first.customGames.map((g) => g.id)).toEqual(['custom_1']);
    expect(first.deleted).toEqual(['journey']);
    localStorage.clear();
    expect((await loadCollection()).customGames).toHaveLength(1); // ya vive en IndexedDB
  });

  it('guarda y vuelve a cargar', async () => {
    await saveCollection({ customGames: [game('custom_2')], order: null, overrides: { rdr: { title: 'RDR2' } }, deleted: [] });
    const c = await loadCollection();
    expect(c.overrides.rdr.title).toBe('RDR2');
  });

  it('descarta juegos de prueba y entradas mal formadas', () => {
    const s = sanitize({ customGames: [game('a', 'Prueba'), game('b'), { id: 'c' }], deleted: 'x' });
    expect(s.customGames.map((g) => g.id)).toEqual(['b']);
    expect(s.deleted).toEqual([]);
  });

  it('respaldo: ida y vuelta, y rechaza archivos ajenos', () => {
    const data = { customGames: [game('custom_3')], order: ['custom_3'], overrides: {}, deleted: [] };
    expect(parseBackup(makeBackup(data)).customGames[0].id).toBe('custom_3');
    expect(parseBackup('{"customGames":[]}')).toBeNull();
    expect(parseBackup('no es json')).toBeNull();
  });
});
