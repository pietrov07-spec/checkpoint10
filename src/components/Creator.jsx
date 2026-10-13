import { useEffect, useRef, useState } from 'react';
import { PLAT, PLATFORM_OPTIONS, SWATCHES } from '../data/config.js';
import { hexToHsl, hslToHex, shadesFrom } from '../lib/colors.js';
import { rawgEnabled, searchGames } from '../lib/rawg.js';
import { useModal } from './Ficha.jsx';

/** Buscador en RAWG: al elegir un resultado se llenan título, año, plataforma, portada y ficha. */
function RawgSearch({ app }) {
  const { t } = app;
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const ctrl = useRef(null);
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); setStatus('idle'); return undefined; }
    const id = setTimeout(async () => {
      if (ctrl.current) ctrl.current.abort();
      ctrl.current = new AbortController();
      setStatus('loading');
      try {
        setResults(await searchGames(q, ctrl.current.signal));
        setStatus('done');
      } catch (e) {
        if (e.name !== 'AbortError') setStatus('error');
      }
    }, 350);
    return () => clearTimeout(id);
  }, [q]);
  return (
    <div className="rawg">
      <div className="field-label">{t('rawgSearch')}</div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('rawgPlaceholder')} className="input-field" aria-label={t('rawgSearch')} />
      {status === 'loading' && <div className="rawg-note">{t('rawgSearching')}</div>}
      {status === 'error' && <div className="rawg-note rawg-err">{t('rawgErr')}</div>}
      {status === 'done' && !results.length && <div className="rawg-note">{t('rawgNone')}</div>}
      {results.length > 0 && (
        <ul className="rawg-results">
          {results.map((r) => (
            <li key={r.rawgId}>
              <button type="button" className="rawg-item" onClick={() => { app.applyRawg(r); setQ(''); setResults([]); }}>
                {r.cover ? <img src={r.cover} alt="" loading="lazy" /> : <span className="rawg-noimg" />}
                <span className="rawg-name">{r.title}</span>
                <span className="rawg-year">{r.relYear || '—'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="rawg-credit">{t('rawgCredit')}</div>
    </div>
  );
}

export default function Creator({ app }) {
  const { t, state } = app;
  const draft = state.draft;
  const fileRef = useRef(null);
  const panelRef = useModal(app.closeCreator);
  const pairs = shadesFrom(draft.baseColor);
  const avg = (draft.scores.reduce((a, b) => a + b, 0) / draft.scores.length).toFixed(1);
  const editing = !!state.editId;
  const canSave = !!draft.title.trim();
  const genStyle = { background: 'radial-gradient(120% 90% at 30% 10%, ' + pairs[1] + ', ' + hslToHex(hexToHsl(draft.baseColor).h, 45, 14) + ')' };

  return (
    <div className="backdrop backdrop-creator" onClick={app.closeCreator}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={editing ? t('headingEdit') : t('headingNew')} className="modal-creator" onClick={app.stop}>
        <div className="creator-head">
          <div>
            <h2 className="creator-title">{editing ? t('headingEdit') : t('headingNew')}</h2>
            <div className="eyebrow" style={{ marginTop: 5 }}>{t('touchCells')}</div>
          </div>
          <button type="button" className="modal-x modal-x-static" aria-label="Cerrar" onClick={app.closeCreator}>✕</button>
        </div>

        <div className="creator-body">
          <div className="creator-side">
            <div className="creator-preview">
              {draft.cover ? <img className="cover-img" src={draft.cover} alt="" /> : <div className="abs-fill" style={genStyle} />}
              <div className="creator-preview-cap">
                <div className="creator-preview-title">{draft.title || t('headingNew')}</div>
                <div className="creator-preview-meta">{PLAT[draft.platform]} · {draft.relYear || '—'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn-soft" style={{ flex: 1 }} onClick={() => fileRef.current && fileRef.current.click()}>{t('uploadArt')}</button>
              {draft.cover && <button type="button" className="btn-soft" aria-label="Quitar portada" onClick={app.clearCover}>✕</button>}
            </div>
            <input ref={fileRef} onChange={app.onCoverFile} type="file" accept="image/*" hidden />
            <div className="creator-avg">
              <span className="eyebrow">{t('avgWord')}</span>
              <span className="creator-avg-num" style={{ color: draft.baseColor }}>{avg}</span>
              <span style={{ fontSize: 11, color: 'var(--muted2)' }}>/5</span>
            </div>
          </div>

          <div className="creator-main">
            {rawgEnabled() && !editing && <RawgSearch app={app} />}
            <div>
              <label className="field-label" htmlFor="draft-title">{t('fieldTitle')}</label>
              <input id="draft-title" value={draft.title} onChange={app.onTitleInput} placeholder={t('titlePlaceholder')} className="input-field input-lg" />
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: 220 }}>
                <div className="field-label">{t('platformWhere')}</div>
                <div style={{ display: 'flex', gap: 7 }}>
                  {PLATFORM_OPTIONS.map((p) => {
                    const active = draft.platform === p.key;
                    return (
                      <button key={p.key} type="button" className="plat-opt" aria-pressed={active} onClick={() => app.setDraft({ platform: p.key })}
                        style={{ border: '1px solid ' + (active ? draft.baseColor : 'rgba(255,255,255,.12)'), background: active ? draft.baseColor : 'rgba(255,255,255,.03)', color: active ? '#0d1a2b' : 'var(--sub)' }}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ width: 96, flexShrink: 0 }}>
                <label className="field-label" htmlFor="draft-year">{t('fieldYear')}</label>
                <input id="draft-year" value={draft.relYear} onChange={app.onYearInput} type="number" className="input-field input-lg" />
              </div>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>{t('fieldColor')}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {SWATCHES.map((c) => (
                  <button key={c} type="button" className="swatch" aria-label={c} aria-pressed={draft.baseColor === c} onClick={() => app.setDraft({ baseColor: c })}
                    style={{ background: c, border: draft.baseColor === c ? '3px solid #fff' : '3px solid transparent' }} />
                ))}
              </div>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>{t('ratingByCat')}</div>
              <div className="stack-8">
                {app.labels.map((lab, i) => {
                  const color = pairs[Math.floor(i / 2)];
                  const score = draft.scores[i];
                  return (
                    <div key={lab} className="rate-row">
                      <div className="rate-label">{lab}</div>
                      <div style={{ flex: 1, display: 'flex', gap: 5 }}>
                        {[0, 1, 2, 3, 4].map((c) => (
                          <button key={c} type="button" className={c < score ? 'cell-on' : 'cell-off'} aria-label={`${lab}: ${c + 1}`}
                            onClick={() => app.setScore(i, c + 1)} style={c < score ? { background: color } : undefined} />
                        ))}
                      </div>
                      <div className="rate-num" style={{ color }}>{score}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="creator-foot">
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {state.confirmDelete ? (
                <>
                  <span className="confirm-del">{t('confirmDel')}</span>
                  <button type="button" className="btn-danger" onClick={app.deleteGame}>{t('delYes')}</button>
                  <button type="button" className="btn-outline" onClick={app.cancelDelete}>{t('delNo')}</button>
                </>
              ) : (
                <button type="button" className="btn-del" onClick={app.askDelete}>{t('del')}</button>
              )}
            </div>
          ) : <div />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" className="btn-outline" onClick={app.closeCreator}>{t('cancel')}</button>
            <button type="button" className={'btn-primary' + (canSave ? '' : ' is-disabled')} disabled={!canSave} onClick={app.saveDraft}>{editing ? t('saveEdit') : t('saveNew')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
