import { useRef } from 'react';
import { CONFIG, FILTER_CHIPS, THEMES } from '../data/config.js';
import { CoverOrColor } from './Cover.jsx';

const on = (active) => (active ? ' is-active' : '');

/** Vistas (estante / línea de tiempo / torneo), portadas/lomos, estadísticas y respaldo. */
export function ViewBar({ app }) {
  const { t, state } = app;
  const restoreRef = useRef(null);
  return (
    <div className="row row-views">
      <div className="seg-group">
        <button type="button" className={'seg' + on(state.view === 'shelf')} onClick={app.setShelf}>{t('vShelf')}</button>
        <button type="button" className={'seg' + on(state.view === 'timeline')} onClick={app.setTimeline}>{t('vTime')}</button>
        <button type="button" className={'seg' + on(state.view === 'tour')} onClick={app.setTour}>{t('tourTab')}</button>
      </div>
      {app.gridView && (
        <div className="seg-group">
          <button type="button" className={'seg' + on(!state.spineMode)} onClick={app.setCovers}>▦ {t('covers')}</button>
          <button type="button" className={'seg' + on(state.spineMode)} onClick={app.setSpines}>▤ {t('spines')}</button>
        </div>
      )}
      <div className="seg-group">
        <button type="button" className={'seg' + on(state.statsOpen)} onClick={app.toggleStats}>{t('stats')}</button>
      </div>
      {state.view === 'shelf' && (
        <div className="seg-group">
          <button type="button" className={'seg' + on(state.forceMobile)} onClick={app.toggleForceMobile} title={t('mobilePrevTitle')}>📱 {t('mobilePrev')}</button>
        </div>
      )}
      <div className="seg-group">
        <span className="seg-label">{t('data')}</span>
        <button type="button" className="seg" onClick={app.downloadBackup}>{t('backup')}</button>
        <button type="button" className="seg" onClick={() => restoreRef.current && restoreRef.current.click()}>{t('restore')}</button>
        <input ref={restoreRef} type="file" accept="application/json,.json" hidden onChange={app.onRestoreFile} />
      </div>
    </div>
  );
}

export function CompareBar({ app }) {
  const { t, state } = app;
  if (!state.compareMode) return null;
  const ids = state.compareIds;
  const ready = ids.length === 2;
  return (
    <div className="compare-bar">
      <span className="compare-title">{t('compareMode')}</span>
      <span className="compare-hint">{t('compareHint')}</span>
      <div className="compare-slots">
        {[0, 1].map((i) => {
          const g = ids[i] ? app.byId[ids[i]] : null;
          return (
            <div key={i} className={'compare-slot' + (g ? ' is-filled' : '')}>
              {g ? (
                <>
                  <div className="slot-art"><CoverOrColor game={g} sizes="44px" /></div>
                  <button type="button" className="compare-remove" aria-label="Quitar" onClick={() => app.removeCompare(g.id)}>✕</button>
                </>
              ) : (
                <span className="compare-n">{i + 1}</span>
              )}
            </div>
          );
        })}
        <button type="button" className={'btn-versus' + (ready ? '' : ' is-disabled')} disabled={!ready} onClick={app.openVersus}>{t('seeVersus')}</button>
      </div>
    </div>
  );
}

export function Filters({ app }) {
  const { t, state } = app;
  const themeKey = app.themeKey;
  const shown = app.shownGames.length;
  const total = app.games.length;
  const hasFilters = !!state.query.trim() || !!state.platFilter || state.minScore > 0;
  return (
    <>
      <div className="row row-sort">
        <div className="seg-group seg-group-gap8">
          <span className="seg-label">{t('sort')}</span>
          <button type="button" className={'tab' + on(state.groupBy === 'platform')} onClick={app.tabPlatform}>{t('platform')}</button>
          <button type="button" className={'tab' + on(state.groupBy === 'year')} onClick={app.tabYear}>{t('year')}</button>
        </div>
        <div className="seg-group seg-group-gap8">
          <span className="seg-label">{t('theme')}</span>
          {['wood', 'neon'].map((k) => (
            <button key={k} type="button" className={'theme-tab' + on(k === themeKey)} onClick={() => app.setTheme(k)}>{t(THEMES[k].labelKey)}</button>
          ))}
        </div>
        <div className="count-line"><b>{total}</b> {t('totalSuffix')}</div>
      </div>

      <div className="row row-filters">
        <div className="search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input value={state.query} onChange={app.onQuery} placeholder={t('search')} aria-label={t('search')} className="search-input" />
          {!!state.query && <button type="button" className="search-clear" aria-label="Borrar" onClick={app.clearQuery}>✕</button>}
        </div>
        <div className="seg-group seg-group-chips">
          <span className="seg-label">{t('console')}</span>
          {FILTER_CHIPS.map((d) => (
            <button key={d.k || 'all'} type="button" className={'chip' + on((state.platFilter || null) === d.k)} onClick={() => app.togglePlatform(d.k)}>{d.l || t('allPlatforms')}</button>
          ))}
        </div>
        <div className="min-score">
          <span className="seg-label">{t('minLabel')}</span>
          <input type="range" min="0" max="5" step="0.5" value={state.minScore} onChange={app.onMinScore} aria-label={t('minLabel')} />
          <span className="min-score-val">{state.minScore > 0 ? state.minScore.toFixed(1) : '—'}</span>
        </div>
        {hasFilters && <button type="button" className="btn-clear" onClick={app.clearFilters}>{t('clearFilters')}</button>}
        <div className="count-line count-right"><b>{shown}</b> {t('of')} {total}</div>
      </div>
    </>
  );
}

export function NoResults({ app }) {
  const { t } = app;
  return (
    <div className="no-results">
      <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
      <div style={{ fontSize: 16, letterSpacing: '.5px' }}>{t('noResults')}</div>
      <button type="button" className="btn-primary" style={{ marginTop: 16 }} onClick={app.clearFilters}>{t('removeFilters')}</button>
    </div>
  );
}

export const showPlank = CONFIG.shelfStyle === 'plank';
