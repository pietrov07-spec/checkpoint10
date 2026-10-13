import { useRef } from 'react';
import { CONFIG, FILTER_CHIPS, THEMES } from '../data/config.js';
import { CoverOrColor } from './Cover.jsx';

const on = (active) => (active ? ' is-active' : '');

// ---------- piezas (las usan tanto la versión de escritorio como la de celular) ----------

function ViewTabs({ app, className = '' }) {
  const { t, state } = app;
  return (
    <div className={'seg-group ' + className}>
      <button type="button" className={'seg' + on(state.view === 'shelf')} onClick={app.setShelf}>{t('vShelf')}</button>
      <button type="button" className={'seg' + on(state.view === 'timeline')} onClick={app.setTimeline}>{t('vTime')}</button>
      <button type="button" className={'seg' + on(state.view === 'tour')} onClick={app.setTour}>{t('tourTab')}</button>
    </div>
  );
}

function StatsToggle({ app }) {
  return (
    <div className="seg-group">
      <button type="button" className={'seg' + on(app.state.statsOpen)} onClick={app.toggleStats}>{app.t('stats')}</button>
    </div>
  );
}

function DataGroup({ app }) {
  const { t } = app;
  const restoreRef = useRef(null);
  return (
    <div className="seg-group">
      <span className="seg-label">{t('data')}</span>
      <button type="button" className="seg" onClick={app.downloadBackup}>{t('backup')}</button>
      <button type="button" className="seg" onClick={() => restoreRef.current && restoreRef.current.click()}>{t('restore')}</button>
      <input ref={restoreRef} type="file" accept="application/json,.json" hidden onChange={app.onRestoreFile} />
    </div>
  );
}

function SortGroup({ app }) {
  const { t, state } = app;
  return (
    <div className="seg-group seg-group-gap8">
      <span className="seg-label">{t('sort')}</span>
      <button type="button" className={'tab' + on(state.groupBy === 'platform')} onClick={app.tabPlatform}>{t('platform')}</button>
      <button type="button" className={'tab' + on(state.groupBy === 'year')} onClick={app.tabYear}>{t('year')}</button>
    </div>
  );
}

function ThemeGroup({ app }) {
  const { t } = app;
  return (
    <div className="seg-group seg-group-gap8">
      <span className="seg-label">{t('theme')}</span>
      {Object.keys(THEMES).map((k) => (
        <button key={k} type="button" className={'theme-tab' + on(k === app.themeKey)} onClick={() => app.setTheme(k)}>{t(THEMES[k].labelKey)}</button>
      ))}
    </div>
  );
}

function SearchBox({ app }) {
  const { t, state } = app;
  return (
    <div className="search">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input value={state.query} onChange={app.onQuery} placeholder={t('search')} aria-label={t('search')} className="search-input" />
      {!!state.query && <button type="button" className="search-clear" aria-label="Borrar" onClick={app.clearQuery}>✕</button>}
    </div>
  );
}

function ConsoleChips({ app }) {
  const { t, state } = app;
  return (
    <div className="seg-group seg-group-chips">
      <span className="seg-label">{t('console')}</span>
      {FILTER_CHIPS.map((d) => (
        <button key={d.k || 'all'} type="button" className={'chip' + on((state.platFilter || null) === d.k)} onClick={() => app.togglePlatform(d.k)}>{d.l || t('allPlatforms')}</button>
      ))}
    </div>
  );
}

function MinScore({ app }) {
  const { t, state } = app;
  return (
    <div className="min-score">
      <span className="seg-label">{t('minLabel')}</span>
      <input type="range" min="0" max="5" step="0.5" value={state.minScore} onChange={app.onMinScore} aria-label={t('minLabel')} />
      <span className="min-score-val">{state.minScore > 0 ? state.minScore.toFixed(1) : '—'}</span>
    </div>
  );
}

const hasFilters = (s) => !!s.query.trim() || !!s.platFilter || s.minScore > 0;

// ---------- escritorio ----------

/** Vistas (estante / línea de tiempo / torneo), portadas/lomos, estadísticas y respaldo. */
export function ViewBar({ app }) {
  const { t, state } = app;
  return (
    <div className="row row-views">
      <ViewTabs app={app} />
      {app.gridView && (
        <div className="seg-group">
          <button type="button" className={'seg' + on(!state.spineMode)} onClick={app.setCovers}>▦ {t('covers')}</button>
          <button type="button" className={'seg' + on(state.spineMode)} onClick={app.setSpines}>▤ {t('spines')}</button>
        </div>
      )}
      <StatsToggle app={app} />
      {state.view === 'shelf' && (
        <div className="seg-group">
          <button type="button" className={'seg' + on(state.forceMobile)} onClick={app.toggleForceMobile} title={t('mobilePrevTitle')}>📱 {t('mobilePrev')}</button>
        </div>
      )}
      <DataGroup app={app} />
    </div>
  );
}

export function Filters({ app }) {
  const { t, state } = app;
  const total = app.games.length;
  return (
    <>
      <div className="row row-sort">
        <SortGroup app={app} />
        <ThemeGroup app={app} />
        <div className="count-line"><b>{total}</b> {t('totalSuffix')}</div>
      </div>
      <div className="row row-filters">
        <SearchBox app={app} />
        <ConsoleChips app={app} />
        <MinScore app={app} />
        {hasFilters(state) && <button type="button" className="btn-clear" onClick={app.clearFilters}>{t('clearFilters')}</button>}
        <div className="count-line count-right"><b>{app.shownGames.length}</b> {t('of')} {total}</div>
      </div>
    </>
  );
}

// ---------- celular ----------

/**
 * En el celular solo quedan a la vista las vistas y el buscador; el resto
 * (estadísticas, orden, tema, filtros y respaldo) vive en el panel ⚙ AJUSTES.
 */
export function MobileControls({ app }) {
  const { t, state } = app;
  const open = state.optionsOpen;
  const active = hasFilters(state);
  const isTour = state.view === 'tour';
  return (
    <div className="m-controls">
      <ViewTabs app={app} className="m-views" />
      <div className="m-search-row">
        {!isTour ? <SearchBox app={app} /> : <div style={{ flex: 1 }} />}
        <button type="button" className={'m-options-btn' + on(open)} aria-expanded={open} onClick={app.toggleOptions}>
          {open ? '✕' : '⚙'} {t('options')}{!open && (active || state.statsOpen) ? <span className="m-dot" aria-hidden="true" /> : null}
        </button>
      </div>
      {open && (
        <div className="m-options">
          <StatsToggle app={app} />
          {!isTour && (
            <>
              <ConsoleChips app={app} />
              <MinScore app={app} />
              <SortGroup app={app} />
            </>
          )}
          <DataGroup app={app} />
          {!isTour && (
            <div className="m-options-foot">
              <span className="count-line"><b>{app.shownGames.length}</b> {t('of')} {app.games.length}</span>
              {active && <button type="button" className="btn-clear" onClick={app.clearFilters}>{t('clearFilters')}</button>}
            </div>
          )}
        </div>
      )}
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
