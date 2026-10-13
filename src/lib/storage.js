// Persistencia de la colección en IndexedDB (cientos de MB disponibles, frente a
// los ~5 MB de localStorage que antes se llenaban con unas decenas de portadas).
import { get, set } from 'idb-keyval';

const KEY = 'collection_v2';
const LEGACY_KEY = 'paquer_custom_v1';
export const BACKUP_FORMAT = 'checkpoint10-backup';

const EMPTY = { customGames: [], order: null, overrides: {}, deleted: [] };

/** Normaliza lo guardado (o importado) y descarta lo que no tenga la forma esperada. */
export function sanitize(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.customGames)) return null;
  const isGame = (g) => g && typeof g.id === 'string' && typeof g.title === 'string' && Array.isArray(g.scores) && g.scores.length === 10;
  return {
    // El prototipo filtraba juegos de prueba que se colaron en el guardado; se conserva el filtro.
    customGames: raw.customGames.filter(isGame).filter((g) => !/\b(prueba|test)\b/i.test(g.title) && g.id !== 'mijuegoprueba'),
    order: Array.isArray(raw.order) ? raw.order.filter((x) => typeof x === 'string') : null,
    overrides: raw.overrides && typeof raw.overrides === 'object' ? raw.overrides : {},
    deleted: Array.isArray(raw.deleted) ? raw.deleted.filter((x) => typeof x === 'string') : [],
  };
}

/** Carga la colección; si solo existe la versión vieja en localStorage, la migra. */
export async function loadCollection() {
  try {
    const saved = sanitize(await get(KEY));
    if (saved) return saved;
  } catch (e) {
    console.warn('IndexedDB no disponible', e);
  }
  try {
    const legacy = sanitize(JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'));
    if (legacy) {
      await saveCollection(legacy);
      return legacy;
    }
  } catch (e) {
    /* sin datos previos */
  }
  return { ...EMPTY };
}

/** Guarda la colección. Devuelve false si el navegador lo rechazó (cuota, modo privado…). */
export async function saveCollection(data) {
  try {
    await set(KEY, { customGames: data.customGames, order: data.order, overrides: data.overrides, deleted: data.deleted });
    return true;
  } catch (e) {
    console.error('No se pudo guardar la colección', e);
    return false;
  }
}

export function makeBackup(data) {
  return JSON.stringify({ format: BACKUP_FORMAT, version: 2, exportedAt: new Date().toISOString(), ...data });
}

export function parseBackup(text) {
  let raw;
  try { raw = JSON.parse(text); } catch { return null; }
  if (!raw || raw.format !== BACKUP_FORMAT) return null;
  return sanitize(raw);
}
