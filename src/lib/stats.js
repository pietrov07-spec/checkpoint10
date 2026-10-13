export const avgOf = (g) => g.scores.reduce((a, b) => a + b, 0) / g.scores.length;

export function matchGame(g, { query = '', platFilter = null, minScore = 0 }) {
  const q = query.trim().toLowerCase();
  if (q && !g.title.toLowerCase().includes(q)) return false;
  if (platFilter && g.platform !== platFilter) return false;
  if (minScore > 0 && avgOf(g) < minScore) return false;
  return true;
}

/** Perfil de jugador sobre toda la colección. Devuelve null si no hay juegos. */
export function collectionStats(games, labels, platOrder) {
  const n = games.length;
  if (!n) return null;
  const catAvg = labels.map((label, i) => ({ label, avg: games.reduce((s, g) => s + g.scores[i], 0) / n }));
  const maxA = Math.max(...catAvg.map((c) => c.avg));
  const minA = Math.min(...catAvg.map((c) => c.avg));
  const overall = games.reduce((s, g) => s + avgOf(g), 0) / n;
  const best = games.reduce((m, g) => (avgOf(g) > avgOf(m) ? g : m), games[0]);
  const years = games.map((g) => g.relYear);
  const byPlat = platOrder
    .map((k) => ({ key: k, count: games.filter((g) => g.platform === k).length }))
    .filter((p) => p.count)
    .sort((a, b) => b.count - a.count);
  return {
    catAvg: catAvg.map((c) => ({ ...c, hi: c.avg === maxA, lo: c.avg === minA })),
    overall,
    top: catAvg.find((c) => c.avg === maxA).label,
    low: catAvg.find((c) => c.avg === minA).label,
    best,
    yearSpan: [Math.min(...years), Math.max(...years)],
    byPlat,
    maxPlat: Math.max(...byPlat.map((p) => p.count)),
  };
}

/** Cuántas categorías gana cada juego en un versus. */
export function versusWins(a, b) {
  const wins = [0, 0];
  a.scores.forEach((av, i) => {
    const bv = b.scores[i];
    if (av > bv) wins[0]++;
    else if (bv > av) wins[1]++;
  });
  return wins;
}
