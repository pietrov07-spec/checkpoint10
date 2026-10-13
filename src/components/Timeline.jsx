import { PLAT } from '../data/config.js';
import { avgOf } from '../lib/stats.js';
import { CoverOrColor } from './Cover.jsx';

export default function Timeline({ app }) {
  const { t } = app;
  const rows = [...app.shownGames].sort((a, b) => b.relYear - a.relYear || b.year - a.year || avgOf(b) - avgOf(a));
  let last = null;
  return (
    <section className="timeline">
      <div className="eyebrow" style={{ marginBottom: 18 }}>{t('timeHeading')}</div>
      {rows.length === 0 && <div className="empty-note">🔍 —</div>}
      <div className="timeline-track">
        <div className="timeline-line" />
        {rows.map((g) => {
          const showYear = g.relYear !== last;
          last = g.relYear;
          return (
            <div key={g.id} className="timeline-item">
              <div className="timeline-dot" style={{ background: g.accent, boxShadow: '0 0 0 2px ' + g.accent + '66' }} />
              {showYear && <div className="timeline-year">{g.relYear}</div>}
              <button type="button" className="timeline-row" onClick={() => app.openFicha(g.id)}>
                <div className="timeline-thumb"><CoverOrColor game={g} sizes="44px" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="timeline-title">{g.title}</div>
                  <div className="timeline-meta">{PLAT[g.platform]} · {t('played')} {g.year}</div>
                </div>
                <div className="timeline-avg">{avgOf(g).toFixed(1)}</div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
