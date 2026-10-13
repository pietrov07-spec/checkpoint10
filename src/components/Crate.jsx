import { PLAT, PLATCOLOR, PLATORDER, PLATSHORT } from '../data/config.js';
import { avgOf } from '../lib/stats.js';
import Cover from './Cover.jsx';

const on = (active) => (active ? ' is-active' : '');

/** Posición 3D de cada portada alrededor de la del frente (cajón de vinilos o coverflow). */
export function crateCards(games, idx, drag, style, dragging) {
  const n = games.length;
  const cards = [];
  // Deslizar a la izquierda (drag < 0) acerca al frente la siguiente portada.
  const relOf = (o) => o + drag / 150;
  for (let o = -4; o <= 5; o++) {
    const i = idx + o;
    if (i < 0 || i >= n) continue;
    const g = games[i];
    const rel = relOf(o);
    const isFront = Math.round(rel) === 0 && o === 0;
    let transform, opacity, zi;
    if (style === 'flow') {
      const d = Math.min(5, Math.abs(rel)), sgn = rel < 0 ? -1 : 1;
      const ry = Math.abs(rel) < 0.02 ? 0 : -sgn * Math.min(58, 34 + d * 4);
      transform = `translateX(-50%) translateX(${rel * 54}%) translateZ(${-d * 60}px) rotateY(${ry}deg) scale(${1 - d * 0.05})`;
      opacity = d > 4.5 ? 0 : 1;
      zi = 100 - Math.round(Math.abs(rel) * 10);
    } else {
      let ty, tz, rx, scale;
      if (rel <= 0) { const d = Math.min(4, -rel); rx = -Math.min(72, d * 20); ty = d * 30; tz = d * 26; scale = 1 - d * 0.02; opacity = d > 4 ? 0 : 1; }
      // Las que vienen asoman por arriba de la del frente (lo bastante para poder tocarlas).
      else { const d = Math.min(rel, 4); rx = Math.min(24, 6 + d * 4); ty = -d * 58; tz = -d * 30; scale = 1 - d * 0.06; opacity = rel > 3.6 ? 0 : 1; }
      transform = `translateX(-50%) translateY(${ty}px) translateZ(${tz}px) rotateX(${rx}deg) scale(${scale})`;
      zi = rel <= 0 ? 200 + Math.round(rel * 10) : 100 - Math.round(rel);
    }
    cards.push({
      g, o, z: zi, isFront,
      style: {
        transform, transformOrigin: style === 'flow' ? 'center center' : 'center bottom',
        transition: dragging ? 'none' : 'transform .42s cubic-bezier(.2,.8,.2,1)',
        opacity, zIndex: zi,
        boxShadow: isFront ? '0 30px 50px rgba(0,0,0,.6)' : '0 14px 26px rgba(0,0,0,.5)',
        // Todas las portadas visibles se pueden tocar: la del frente abre su ficha, las demás pasan al frente.
        pointerEvents: opacity > 0 ? 'auto' : 'none',
      },
    });
  }
  return cards.sort((a, b) => a.z - b.z);
}

export default function Crate({ app }) {
  const { t, state } = app;
  const games = app.shownGames;
  const n = games.length;
  const idx = app.crateClamp(state.crateIndex);
  const front = games[idx];
  const cards = crateCards(games, idx, state.crateDrag, state.crateStyle, app.crateDragging);
  return (
    <section className="crate">
      {n === 0 && <div className="empty-note">🔍 —</div>}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <div className="seg-group">
          <button type="button" className={'seg' + on(state.crateStyle === 'crate')} onClick={() => app.setCrateStyle('crate')}>A · {t('crateA')}</button>
          <button type="button" className={'seg' + on(state.crateStyle === 'flow')} onClick={() => app.setCrateStyle('flow')}>B · {t('crateB')}</button>
        </div>
      </div>
      <div className="crate-stage" onPointerDown={app.crateDown}>
        <div className="crate-fade" />
        {cards.map(({ g, o, style }) => (
          <div key={g.id} data-o={o} className={'crate-card' + (state.crateStyle === 'crate' ? ' is-crate' : '')} style={style}>
            {g.hasArt ? <Cover game={g} sizes="300px" eager /> : <div className="abs-fill" style={{ background: g.genColor || '#12233b' }} />}
            <div className="crate-plat-bar" style={{ background: PLATCOLOR[g.platform] || '#5a6b7d' }} />
            <div className="crate-plat" style={{ background: PLATCOLOR[g.platform] || '#5a6b7d' }}>{PLATSHORT[g.platform] || ''}</div>
          </div>
        ))}
      </div>

      <div className="crate-caption">
        <button type="button" data-crate-open="1" className="crate-open" onClick={app.crateOpen}>
          <div className="crate-title">{front ? front.title : ''}</div>
          <div className="crate-meta">
            <span className="crate-plat-name"><span className="dot" style={{ background: front ? PLATCOLOR[front.platform] || '#5a6b7d' : '#5a6b7d' }} />{front ? PLAT[front.platform] : ''}</span>
            <span className="crate-avg">{front ? avgOf(front).toFixed(1) : ''}</span>
          </div>
        </button>
      </div>

      <div className="crate-nav">
        <button type="button" className="round-btn" aria-label="Anterior" onClick={app.cratePrev}>←</button>
        <div className="crate-pos">{(n ? idx + 1 : 0) + ' / ' + n}</div>
        <button type="button" className="round-btn" aria-label="Siguiente" onClick={app.crateNext}>→</button>
      </div>
      <div className="crate-hint">{t('crateHint')}</div>
      <div className="crate-legend">
        {PLATORDER.map((k) => (
          <span key={k}><span className="legend-sq" style={{ background: PLATCOLOR[k] }} />{PLAT[k]}</span>
        ))}
      </div>
    </section>
  );
}
