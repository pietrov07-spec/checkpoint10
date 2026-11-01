import { useState } from 'react';
import origins from '../data/origins.json';
import land from '../data/world-land.json';
import { fmt } from '../lib/share.js';
import { CoverOrColor } from './Cover.jsx';
import { useModal } from './Ficha.jsx';

// Encuadres del mapa en coordenadas x = lon + 180, y = 90 - lat. Todos con la misma proporción.
const VIEWS = {
  world: { labelKey: 'mapWorld', x: 0, y: 6, w: 360, h: 142 },
  namerica: { labelKey: 'mapNAmerica', x: 30, y: 28, w: 106, h: 41.8 },
  europe: { labelKey: 'mapEurope', x: 155, y: 26, w: 72, h: 28.4 },
};

/** Agrupa los juegos por lugar de origen, de más a menos juegos. Los que no tienen origen no aparecen. */
export function groupByPlace(games) {
  const byPlace = {};
  for (const g of games) {
    const key = origins.games[g.id];
    if (key) (byPlace[key] ||= { key, ...origins.places[key], games: [] }).games.push(g);
  }
  return Object.values(byPlace).sort((a, b) => b.games.length - a.games.length || a.key.localeCompare(b.key));
}

export default function WorldMap({ app }) {
  const { t, state } = app;
  const panelRef = useModal(app.closeMap);
  const [viewKey, setViewKey] = useState('world');
  const [selected, setSelected] = useState(null);
  const places = groupByPlace(app.games);
  const shown = selected ? places.filter((p) => p.key === selected) : places;
  const view = VIEWS[viewKey];
  const k = view.w / 360; // los marcadores conservan su tamaño en pantalla al acercar
  const toggle = (key) => setSelected((cur) => (cur === key ? null : key));
  const count = places.reduce((n, p) => n + p.games.length, 0);
  return (
    <div className="backdrop backdrop-map" onClick={app.closeMap}>
      <div ref={panelRef} className="modal modal-map" role="dialog" aria-modal="true" aria-labelledby="map-title" tabIndex={-1} onClick={app.stop}>
        <button type="button" className="modal-x" onClick={app.closeMap} aria-label={t('mapClose')}>✕</button>
        <h2 id="map-title" className="map-title">{t('mapTitle')}</h2>
        <div className="map-sub">{fmt(t('mapCount'), { games: count, places: places.length })}</div>
        <div className="seg-group map-views" role="group" aria-label={t('mapTitle')}>
          {Object.entries(VIEWS).map(([key, v]) => (
            <button key={key} type="button" className={'seg' + (viewKey === key ? ' is-active' : '')} aria-pressed={viewKey === key} onClick={() => setViewKey(key)}>{t(v.labelKey)}</button>
          ))}
        </div>
        <svg className="map-svg" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="group" aria-label={t('mapTitle')}>
          <path className="map-land" d={land.d} />
          {places.map((p) => {
            const name = p[state.lang];
            const n = p.games.length;
            return (
              <g
                key={p.key}
                className={'map-pin' + (selected === p.key ? ' is-selected' : '') + (p.approx ? ' is-approx' : '')}
                transform={`translate(${p.lon + 180} ${90 - p.lat})`}
                role="button"
                tabIndex={0}
                aria-pressed={selected === p.key}
                aria-label={`${name}: ${p.games.map((g) => g.title).join(', ')}`}
                onClick={() => toggle(p.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(p.key); } }}
              >
                <title>{name}</title>
                <circle className="map-pin-hit" r={5 * k} />
                <circle className="map-pin-dot" r={(n > 1 ? 2.8 : 2) * k} strokeWidth={0.5 * k} />
                {n > 1 && <text className="map-pin-n" fontSize={3 * k} dy=".35em">{n}</text>}
              </g>
            );
          })}
        </svg>
        <div className="map-legend"><span className="map-legend-dot" aria-hidden="true" />{t('mapApprox')}</div>
        {selected && <button type="button" className="btn-outline map-all" onClick={() => setSelected(null)}>{t('mapAll')}</button>}
        <ul className="map-list">
          {shown.map((p) => (
            <li key={p.key} className="map-place">
              <div className="map-place-name">{p[state.lang]}</div>
              {p.games.map((g) => (
                <button key={g.id} type="button" className="map-game" onClick={() => app.openFicha(g.id)}>
                  <span className="map-game-thumb"><CoverOrColor game={g} sizes="40px" /></span>
                  <span className="map-game-title">{g.title}</span>
                </button>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
