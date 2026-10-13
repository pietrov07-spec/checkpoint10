import { PLAT, PLATORDER, THEMES } from '../data/config.js';
import { avgOf } from '../lib/stats.js';
import Cover from './Cover.jsx';
import { showPlank } from './Toolbar.jsx';

const PlatIcon = ({ k }) => {
  const c = 'currentColor';
  if (k === 'Xbox') return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="1.6" /><path d="M8 7 Q12 12 16 17 M16 7 Q12 12 8 17" fill="none" stroke={c} strokeWidth="1.6" /></svg>;
  if (k === 'Switch') return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="16" rx="3.2" fill="none" stroke={c} strokeWidth="1.6" /><rect x="13" y="4" width="7" height="16" rx="3.2" fill="none" stroke={c} strokeWidth="1.6" /><circle cx="7.5" cy="8.5" r="1.3" fill={c} /></svg>;
  if (k === 'SteamDeck') return <svg width="22" height="20" viewBox="0 0 26 20" aria-hidden="true"><rect x="1" y="2" width="24" height="16" rx="8" fill="none" stroke={c} strokeWidth="1.5" /><circle cx="7" cy="10" r="3.2" fill="none" stroke={c} strokeWidth="1.5" /><circle cx="19" cy="10" r="3.2" fill="none" stroke={c} strokeWidth="1.5" /></svg>;
  if (k === 'PlayStation') return <svg width="22" height="20" viewBox="0 0 26 20" aria-hidden="true"><text x="13" y="15" textAnchor="middle" fontFamily="Archivo Black, sans-serif" fontSize="13" fill={c}>PS</text></svg>;
  return <span className="year-dot" />;
};

/** Agrupa los juegos visibles por plataforma o por año, respetando el orden del usuario. */
export function buildGroups(app) {
  const { order, groupBy } = app.state;
  const shown = new Set(app.shownGames.map((g) => g.id));
  let keys, labelOf;
  if (groupBy === 'platform') {
    keys = PLATORDER.filter((k) => app.shownGames.some((g) => g.platform === k));
    labelOf = (k) => PLAT[k];
  } else {
    keys = [...new Set(app.shownGames.map((g) => g.relYear))].sort((a, b) => b - a).map(String);
    labelOf = (k) => k;
  }
  return keys
    .map((k) => ({ key: k, label: labelOf(k), games: order.map((id) => app.byId[id]).filter((g) => g && shown.has(g.id) && app.keyOf(g) === k) }))
    .filter((gr) => gr.games.length);
}

function Tile({ app, g, groupKey }) {
  const { state } = app;
  const spine = state.spineMode;
  const cmp = state.compareMode ? state.compareIds : [];
  const selected = cmp.includes(g.id);
  const dimmed = state.compareMode && cmp.length >= 2 && !selected;
  const isDragging = g.id === state.dragId;
  return (
    <div
      data-gid={g.id}
      data-shelf={groupKey}
      className={'tile' + (spine ? ' tile-spine' : ' tile-cover')}
      onPointerDown={(e) => app.onDown(e, g.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); app.activateTile(g.id); } }}
      role="button"
      tabIndex={0}
      aria-label={g.title}
      title={g.title}
    >
      <div className="tile-shadow" />
      {isDragging ? (
        <div className="tile-placeholder" />
      ) : spine ? (
        <div className="spine" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.28), rgba(255,255,255,.06) 22%, rgba(0,0,0,.14) 60%, rgba(0,0,0,.34)) , ' + (g.hasArt ? g.accent || '#2a3b56' : g.genColor || '#2a3b56') }}>
          {g.hasArt ? <Cover game={g} sizes="60px" className="spine-art" /> : <div className="abs-fill" style={{ background: g.genColor || '#2a3b56' }} />}
          <div className="spine-shade" />
          <div className="spine-title" style={{ fontSize: Math.max(8, Math.min(13, Math.floor(150 / (g.title.length || 1)))) + 'px' }}>{g.title}</div>
          <div className="spine-avg">{avgOf(g).toFixed(1)}</div>
        </div>
      ) : (
        <div className="tile-face">
          {g.hasArt ? (
            <Cover game={g} sizes="(max-width: 720px) 40vw, 150px" />
          ) : (
            <div className="noart" style={{ background: g.genColor }}>
              <div className="noart-shade" />
              <div className="noart-title">{g.title}</div>
              <div className="noart-badge">{g.platform.toUpperCase()} · {g.year}</div>
            </div>
          )}
        </div>
      )}
      {selected && (
        <>
          <div className="tile-selected" />
          <div className="tile-select-n">{cmp.indexOf(g.id) + 1}</div>
        </>
      )}
      {dimmed && <div className="tile-dim" />}
    </div>
  );
}

export default function Shelf({ app }) {
  const { t } = app;
  const theme = THEMES[app.themeKey];
  const groups = buildGroups(app);
  return (
    <div ref={app.setBoardRef} className="board">
      {groups.map((group) => (
        <section key={group.key} className="shelf">
          <div className="shelf-head">
            <PlatIcon k={app.state.groupBy === 'platform' ? group.key : null} />
            <h2 className="shelf-label">{group.label}</h2>
            <span className="shelf-count">{group.games.length} {group.games.length === 1 ? t('gameOne') : t('gameMany')}</span>
            <div className="shelf-rule" />
          </div>
          <div className="niche" style={{ background: theme.niche, border: '1px solid ' + theme.nicheBorder, borderBottom: 'none', boxShadow: theme.nicheShadow }}>
            {group.games.map((g) => <Tile key={g.id} app={app} g={g} groupKey={group.key} />)}
          </div>
          {showPlank && (
            <>
              <div className="plank" style={{ background: theme.plank, boxShadow: theme.plankShadow, borderTop: theme.plankTop }} />
              <div className="plank-lip" style={{ background: theme.lip }} />
            </>
          )}
        </section>
      ))}
    </div>
  );
}

/** Portada "fantasma" que sigue al puntero mientras se arrastra. */
export function DragGhost({ app }) {
  const { dragId, ghost } = app.state;
  const grab = app.grab;
  if (!dragId || !ghost || !grab) return null;
  const g = app.byId[dragId];
  if (!g) return null;
  return (
    <div className="ghost" style={{ left: ghost.x - grab.x + 'px', top: ghost.y - grab.y + 'px', width: grab.w + 'px' }}>
      <div className="ghost-face">
        {g.hasArt ? <Cover game={g} eager /> : (
          <div className="noart" style={{ background: g.genColor }}><div className="noart-title">{g.title}</div></div>
        )}
      </div>
    </div>
  );
}
