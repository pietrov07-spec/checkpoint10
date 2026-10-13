// Lógica del torneo, sin React. El estado es { rounds, third, done }:
//   rounds: arreglo de rondas; cada ronda es un arreglo de duelos { a, b, w }
//           (a y b son juegos o null; w es el id del ganador o null)
//   third:  duelo por el tercer lugar (o null)
//   done:   true cuando ya hay campeón y tercer lugar

// Siembra estándar de 32: el 1 se enfrenta al 32, el 16 al 17, etc.
export const SEED32 = [1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21, 2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22];

const copy = (s) => ({ rounds: s.rounds.map((rd) => rd.map((m) => ({ ...m }))), third: s.third ? { ...s.third } : null, done: s.done });

// Un duelo con un solo participante lo gana ese participante (pase directo).
function resolveBye(m) {
  if (!m.w) {
    if (m.a && !m.b) m.w = m.a.id;
    else if (m.b && !m.a) m.w = m.b.id;
  }
  return m;
}

// Un duelo vacío (sin ninguno de los dos) cuenta como resuelto.
const isResolved = (m) => !!m.w || (!m.a && !m.b);

export const winnerOf = (m) => (m.a && m.w === m.a.id ? m.a : m.b);
export const loserOf = (m) => (m.a && m.w === m.a.id ? m.b : m.a);

export function simWinner(a, b, rng = Math.random) {
  const sa = avg(a), sb = avg(b);
  let pa = 0.5 + (sa - sb) * 0.16;
  pa = Math.max(0.18, Math.min(0.82, pa));
  return rng() < pa ? a : b;
}
const avg = (g) => g.scores.reduce((x, y) => x + y, 0) / g.scores.length;

export function seedBracket(games) {
  if (games.length < 2) return null;
  const sorted = [...games].sort((a, b) => avg(b) - avg(a));
  const order = SEED32.map((s) => (s <= sorted.length ? sorted[s - 1] : null));
  const r0 = [];
  for (let i = 0; i < order.length; i += 2) r0.push(resolveBye({ a: order[i], b: order[i + 1], w: null }));
  return advance({ rounds: [r0], third: null, done: false });
}

/** Siguiente duelo por jugar: { kind:'third' } o { kind:'match', r, m }, o null. */
export function currentMatch(s) {
  const rs = s.rounds;
  if (!rs.length) return null;
  const finalRound = rs[rs.length - 1];
  if (finalRound.length === 1) {
    const t = s.third;
    if (t && t.a && t.b && !t.w) return { kind: 'third' };
  }
  for (let r = 0; r < rs.length; r++)
    for (let m = 0; m < rs[r].length; m++) {
      const mt = rs[r][m];
      if (mt.a && mt.b && !mt.w) return { kind: 'match', r, m };
    }
  return null;
}

export function currentPair(s) {
  const cur = currentMatch(s);
  if (!cur) return null;
  if (cur.kind === 'third') return { ...cur, a: s.third.a, b: s.third.b, roundSize: 0 };
  const rd = s.rounds[cur.r];
  return { ...cur, a: rd[cur.m].a, b: rd[cur.m].b, roundSize: rd.length };
}

/** Si la última ronda ya está completa, arma la siguiente (o marca el torneo como terminado). */
export function advance(state) {
  const s = copy(state);
  for (;;) {
    const last = s.rounds[s.rounds.length - 1];
    if (!last.every(isResolved)) return s;
    if (last.length === 1) {
      s.done = !s.third || isResolved(s.third);
      return s;
    }
    const winners = last.map(winnerOf);
    if (last.length === 2) {
      const losers = last.map(loserOf);
      s.third = resolveBye({ a: losers[0], b: losers[1], w: null });
    }
    const next = [];
    for (let i = 0; i < winners.length; i += 2) next.push(resolveBye({ a: winners[i], b: winners[i + 1], w: null }));
    s.rounds.push(next);
  }
}

export function setWinner(state, id) {
  const cur = currentMatch(state);
  if (!cur) return state;
  const s = copy(state);
  if (cur.kind === 'third') s.third.w = id;
  else s.rounds[cur.r][cur.m].w = id;
  return advance(s);
}

/** Simula todos los duelos pendientes de golpe ("saltar al podio"). */
export function simulateAll(state, rng = Math.random) {
  let s = state;
  for (let guard = 0; !s.done && guard < 300; guard++) {
    const pair = currentPair(s);
    if (!pair) break;
    s = setWinner(s, simWinner(pair.a, pair.b, rng).id);
  }
  return s;
}

export function progress(s) {
  let total = 0, played = 0;
  s.rounds.forEach((rd) => rd.forEach((m) => { if (m.a && m.b) { total++; if (m.w) played++; } }));
  if (s.third && s.third.a && s.third.b) { total++; if (s.third.w) played++; }
  return { total, played };
}

export function podium(s) {
  if (!s.rounds.length) return null;
  const finalMatch = s.rounds[s.rounds.length - 1][0];
  return { champ: winnerOf(finalMatch), runner: loserOf(finalMatch), third: s.third ? winnerOf(s.third) : null };
}

/** Clave de traducción para el nombre de la ronda según cuántos duelos tiene. */
export function roundKey(n) {
  return { 16: 'tR32', 8: 'tR16', 4: 'tQ', 2: 'tSemi', 1: 'tFinal' }[n] || 'tFinal';
}
