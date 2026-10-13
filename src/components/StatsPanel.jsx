import { PLAT, PLATORDER } from '../data/config.js';
import { avgOf, collectionStats } from '../lib/stats.js';
import { CoverOrColor } from './Cover.jsx';

export default function StatsPanel({ app }) {
  const { t } = app;
  const s = collectionStats(app.games, app.labels, PLATORDER);
  if (!s) return null;
  return (
    <section className="stats panel">
      <h2 className="stats-heading">{t('statsHeading')}</h2>
      <div className="stats-grid">
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('catByCat')}</div>
          <div className="stack-9">
            {s.catAvg.map((c) => (
              <div key={c.label} className="stat-row">
                <div className="stat-label">{c.label}</div>
                <div className="stat-track">
                  <div className={'stat-bar' + (c.hi ? ' hi' : c.lo ? ' lo' : '')} style={{ width: (c.avg / 5) * 100 + '%' }} />
                </div>
                <div className={'stat-num' + (c.hi ? ' hi' : c.lo ? ' lo' : '')}>{c.avg.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="stack-14">
          <div className="stile-row">
            <div className="stile stile-gold">
              <div className="stile-eyebrow" style={{ color: 'var(--gold-dim)' }}>{t('overallAvg')}</div>
              <div className="stile-big">{s.overall.toFixed(1)}</div>
            </div>
            <div className="stile">
              <div className="stile-eyebrow">{t('spanYears')}</div>
              <div className="stile-mid">{s.yearSpan[0]} – {s.yearSpan[1]}</div>
            </div>
          </div>
          <div className="stile-row">
            <div className="stile stile-sm">
              <div className="stile-eyebrow">{t('valuesMost')}</div>
              <div className="stile-small" style={{ color: 'var(--gold)' }}>{s.top}</div>
            </div>
            <div className="stile stile-sm">
              <div className="stile-eyebrow">{t('valuesLeast')}</div>
              <div className="stile-small" style={{ color: 'var(--rose)' }}>{s.low}</div>
            </div>
          </div>
          <div className="stile stile-sm">
            <div className="stile-eyebrow" style={{ marginBottom: 9 }}>{t('topRated')}</div>
            <div className="best-row">
              <div className="best-thumb"><CoverOrColor game={s.best} sizes="40px" /></div>
              <div className="best-title">{s.best.title}</div>
              <div className="best-avg">{avgOf(s.best).toFixed(1)}</div>
            </div>
          </div>
          <div className="stile stile-sm">
            <div className="stile-eyebrow" style={{ marginBottom: 10 }}>{t('byConsole')}</div>
            <div className="stack-8">
              {s.byPlat.map((p) => (
                <div key={p.key} className="plat-row">
                  <div className="plat-label">{PLAT[p.key]}</div>
                  <div style={{ flex: 1 }}><div className="plat-bar" style={{ width: (p.count / s.maxPlat) * 100 + '%' }} /></div>
                  <div className="plat-count">{p.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
