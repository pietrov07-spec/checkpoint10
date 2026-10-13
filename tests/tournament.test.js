import { describe, it, expect } from 'vitest';
import * as T from '../src/lib/tournament.js';
import games from '../src/data/games.json';

const mk = (n) => Array.from({ length: n }, (_, i) => ({ id: 'g' + i, title: 'G' + i, scores: Array(10).fill(5 - (i % 5)) }));
// Generador aleatorio con semilla, para resultados repetibles.
const seeded = (s = 1) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

function playManual(state) {
  let s = state, guard = 0;
  while (!s.done && guard++ < 100) {
    const p = T.currentPair(s);
    expect(p).not.toBeNull();
    s = T.setWinner(s, p.a.id); // siempre gana el de arriba
  }
  return s;
}

describe('torneo', () => {
  it('no arranca con menos de 2 juegos', () => {
    expect(T.seedBracket(mk(1))).toBeNull();
  });

  it('con la colección real siembra 32 lugares y da pases directos', () => {
    const s = T.seedBracket(games);
    expect(s.rounds[0]).toHaveLength(16);
    const byes = s.rounds[0].filter((m) => !(m.a && m.b));
    expect(byes).toHaveLength(32 - games.length);
    byes.forEach((m) => expect(m.w).toBeTruthy());
  });

  it('el mejor promedio queda como cabeza de serie 1', () => {
    const s = T.seedBracket(games);
    const best = [...games].sort((a, b) => avg(b) - avg(a))[0];
    expect(s.rounds[0][0].a.id).toBe(best.id);
  });

  it('modo manual: termina con campeón, subcampeón y tercer lugar distintos', () => {
    const s = playManual(T.seedBracket(games));
    const p = T.podium(s);
    expect(s.done).toBe(true);
    expect(new Set([p.champ.id, p.runner.id, p.third.id]).size).toBe(3);
    const { total, played } = T.progress(s);
    expect(played).toBe(total);
    expect(total).toBe(games.length); // n−1 eliminaciones + duelo por el 3er lugar
  });

  it.each([2, 3, 5, 9, 16, 17, 32, 40])('no se atora con %i juegos (antes se trababa con menos de 16)', (n) => {
    const s = T.simulateAll(T.seedBracket(mk(n)), seeded(n));
    expect(s.done).toBe(true);
    expect(T.podium(s).champ).toBeTruthy();
  });

  it('simulateAll es repetible con la misma semilla', () => {
    const a = T.podium(T.simulateAll(T.seedBracket(games), seeded(7)));
    const b = T.podium(T.simulateAll(T.seedBracket(games), seeded(7)));
    expect(a.champ.id).toBe(b.champ.id);
  });

  it('simWinner favorece al de mejor promedio pero permite sorpresas (18 %–82 %)', () => {
    const [hi, lo] = [{ id: 'h', scores: Array(10).fill(5) }, { id: 'l', scores: Array(10).fill(1) }];
    expect(T.simWinner(hi, lo, () => 0.81).id).toBe('h');
    expect(T.simWinner(hi, lo, () => 0.83).id).toBe('l');
  });

  it('nombres de ronda', () => {
    expect([16, 8, 4, 2, 1].map(T.roundKey)).toEqual(['tR32', 'tR16', 'tQ', 'tSemi', 'tFinal']);
  });
});

const avg = (g) => g.scores.reduce((a, b) => a + b, 0) / g.scores.length;
