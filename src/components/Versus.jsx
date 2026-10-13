import { PLAT } from '../data/config.js';
import { avgOf, versusWins } from '../lib/stats.js';
import { CoverOrColor } from './Cover.jsx';
import { useModal } from './Ficha.jsx';

function Head({ app, g, side, wins }) {
  const left = side === 'left';
  const crown = wins > 0 && <span className="vs-crown">👑 {wins}</span>;
  return (
    <div className="vs-head" style={{ flexDirection: left ? 'row' : 'row-reverse' }}>
      <div className="vs-thumb"><CoverOrColor game={g} sizes="96px" eager /></div>
      <div style={{ textAlign: left ? 'left' : 'right', flex: 1 }}>
        <div className="vs-title">{g.title}</div>
        <div className="vs-meta">{PLAT[g.platform]} · {g.relYear}</div>
        <div className="vs-score" style={{ justifyContent: left ? 'flex-start' : 'flex-end' }}>
          {!left && crown}
          <span className="vs-avg" style={{ color: g.accent }}>{avgOf(g).toFixed(1)}</span>
          <span className="vs-avg-label">{app.t('avgShort')}</span>
          {left && crown}
        </div>
      </div>
    </div>
  );
}

export default function Versus({ app }) {
  const { state } = app;
  const panelRef = useModal(app.closeVersus);
  const [a, b] = state.compareIds.map((id) => app.byId[id]);
  if (!a || !b) return null;
  const wins = versusWins(a, b);
  const on = state.versusBars;
  return (
    <div className="backdrop backdrop-vs" onClick={app.closeVersus}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={a.title + ' vs ' + b.title} className="modal modal-vs" onClick={app.stop}>
        <button type="button" className="modal-x" style={{ zIndex: 2 }} aria-label="Cerrar" onClick={app.closeVersus}>✕</button>
        <div className="vs-top">
          <Head app={app} g={a} side="left" wins={wins[0]} />
          <div className="vs-word">VS</div>
          <Head app={app} g={b} side="right" wins={wins[1]} />
        </div>
        <div className="stack-7">
          {app.labels.map((lab, i) => {
            const av = a.scores[i], bv = b.scores[i];
            const aWin = av > bv, bWin = bv > av;
            const delay = i * 45 + 'ms';
            return (
              <div key={lab} className="vs-row">
                <div className="vs-side vs-left">
                  <div className="vs-bar" style={{ width: (on ? (av / 5) * 100 : 0) + '%', background: aWin ? a.accent : a.accent + '66', boxShadow: aWin ? '0 0 8px ' + a.accent + '88' : 'none', transitionDelay: delay }} />
                  <div className="vs-num vs-num-l" style={{ color: aWin ? '#f4d84b' : '#8aa0bd' }}>{av}</div>
                </div>
                <div className="vs-label">{lab}</div>
                <div className="vs-side vs-right">
                  <div className="vs-num vs-num-r" style={{ color: bWin ? '#f4d84b' : '#8aa0bd' }}>{bv}</div>
                  <div className="vs-bar" style={{ width: (on ? (bv / 5) * 100 : 0) + '%', background: bWin ? b.accent : b.accent + '66', boxShadow: bWin ? '0 0 8px ' + b.accent + '88' : 'none', transitionDelay: delay }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
