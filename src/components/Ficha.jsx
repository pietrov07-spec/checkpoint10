import { useEffect, useRef } from 'react';
import { gameLinks } from '../lib/links.js';
import { CoverOrColor } from './Cover.jsx';
import { ShareButtons } from './icons.jsx';

// Modales abiertos, del más antiguo al más reciente: Escape solo cierra el de arriba.
const modalStack = [];

/** Cierra con Escape y devuelve el foco al elemento que abrió el modal. */
export function useModal(onClose) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const token = {};
    modalStack.push(token);
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape' && modalStack[modalStack.length - 1] === token) {
        e.stopImmediatePropagation();
        closeRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    if (panelRef.current) panelRef.current.focus({ preventScroll: true });
    return () => {
      modalStack.splice(modalStack.indexOf(token), 1);
      window.removeEventListener('keydown', onKey);
      if (prev && prev.focus) prev.focus({ preventScroll: true });
    };
  }, []);
  return panelRef;
}

function LinksBlock({ app, og }) {
  const { t, state } = app;
  const links = gameLinks(og, t, state.lang);
  const studio = og.facts && og.facts.studio ? og.facts.studio.split(' — ')[0] : og.title;
  return (
    <div className="links-box">
      <div className="fact-eyebrow" style={{ color: og.accent }}>🛒 <span>{t('whereToGet')}</span></div>
      {links.length > 0 && (
        <div className="links-list">
          {links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={'link-chip link-' + l.kind} title={l.url}>
              {l.kind === 'official' ? '🔗 ' : l.kind === 'search' ? '⌕ ' : '🛍 '}{l.label}
            </a>
          ))}
        </div>
      )}
      {og.hasArt && <p className="cover-credit">{t('coverCredit').replace('{studio}', studio)}</p>}
    </div>
  );
}

export default function Ficha({ app }) {
  const { t, state } = app;
  const og = app.byId[state.openId];
  const panelRef = useModal(app.closeFicha);
  if (!og) return null;
  const barsOn = state.barsOn;
  const avg = og.avgStr;
  const f = og.facts || null;
  const factRows = f ? [
    f.studio && { icon: '🏛', label: t('factStudio'), value: f.studio },
    f.director && { icon: '🎬', label: t('factDir'), value: f.director },
    f.awards && { icon: '🏆', label: t('factAwards'), value: f.awards },
    f.score && { icon: '📊', label: t('factScore'), value: f.score },
  ].filter(Boolean) : [];
  const trivia = (f && f.trivia) || [];
  const closing = state.fichaClosing;

  return (
    <div className="backdrop backdrop-ficha" onClick={app.closeFicha}
      style={{ animation: closing ? 'fichaBackdropOut .28s ease both' : 'fichaBackdropIn .22s ease both' }}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={og.title} className="modal modal-ficha" onClick={app.stop}
        style={{ animation: closing ? 'fichaOut .28s cubic-bezier(.4,0,.7,.3) both' : 'fichaIn .34s cubic-bezier(.2,.9,.3,1.2) both' }}>
        <button type="button" className="modal-x" aria-label="Cerrar" onClick={app.closeFicha}>✕</button>
        <div className="ficha-tools">
          <button type="button" className="btn-tool" title={t('editTitle')} onClick={() => app.openEditor(og.id)}>{t('edit')}</button>
        </div>

        <div className="ficha-head">
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 className="ficha-title">{og.title}</h2>
            <div className="ficha-meta">{og.platform.toUpperCase()} · {og.year} · {t('releaseWord')} {og.relYear}</div>
          </div>
          {!og.pending && (
            <div style={{ textAlign: 'center' }}>
              <div className="ficha-avg" style={{ color: og.accent }}>{avg}</div>
              <div className="ficha-avg-label">{t('avg')}</div>
            </div>
          )}
        </div>

        <div className="ficha-body">
          <div className="ficha-cover">
            {og.hasArt ? <CoverOrColor game={og} fit="contain" sizes="230px" eager /> : (
              <div className="noart noart-lg" style={{ background: og.genColor }}><div className="noart-title">{og.title}</div></div>
            )}
          </div>

          {og.pending ? (
            <div className="pending">
              <div style={{ fontSize: 34 }}>📊</div>
              <div className="pending-title">{t('pendingTitle')}</div>
              <p className="pending-body">{t('pendingBody')}</p>
            </div>
          ) : (
            <div className="bars">
              {app.labels.map((lab, i) => {
                const color = og.pairs[Math.floor(i / 2)];
                const score = og.scores[i];
                return (
                  <div key={lab} className="bar-row">
                    <div className="bar-label">{lab}</div>
                    <div className="bar-segs" role="img" aria-label={`${lab}: ${score}/5`}>
                      {[0, 1, 2, 3, 4].map((c) => (
                        <div key={c} className={c < score ? 'seg-on' : 'seg-off'}
                          style={c < score ? { background: barsOn ? color : 'rgba(255,255,255,0.05)', transitionDelay: i * 35 + c * 70 + 'ms' } : undefined} />
                      ))}
                    </div>
                    <div className="bar-num" style={{ color: barsOn ? color : '#42546e', transitionDelay: i * 35 + 280 + 'ms' }}>{score}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {(factRows.length > 0 || trivia.length > 0) && (
          <div className="ficha-section">
            <div className="eyebrow" style={{ marginBottom: 12 }}>{t('tech')}</div>
            <div className="facts-grid">
              {factRows.map((r) => (
                <div key={r.label} className="fact">
                  <div className="fact-eyebrow" style={{ color: og.accent }}>{r.icon} <span>{r.label}</span></div>
                  <div className="fact-value">{r.value}</div>
                </div>
              ))}
            </div>
            {trivia.length > 0 && (
              <div className="trivia">
                <div className="trivia-title">{t('triviaTitle')}</div>
                <div className="stack-7">
                  {trivia.map((tx) => (
                    <div key={tx} className="trivia-item"><span className="trivia-mark">›</span><span>{tx}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <LinksBlock app={app} og={og} />

        <div className="ficha-share">
          <span className="eyebrow" style={{ flexShrink: 0 }}>{t('shareLabel')}</span>
          <button type="button" className="btn-card" onClick={() => app.makeCard(og)}>{t('makeCard')}</button>
          <div className="vrule" />
          <div className="share-row">
            <ShareButtons targets={app.gameShareTargets(og)} />
          </div>
          {state.copiedShare && <span className="copied">{t('copied')}</span>}
        </div>
      </div>
    </div>
  );
}
