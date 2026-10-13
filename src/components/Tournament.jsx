import { PLAT } from '../data/config.js';
import { avgOf } from '../lib/stats.js';
import { currentPair, podium, progress, roundKey } from '../lib/tournament.js';
import { CoverOrColor } from './Cover.jsx';
import { ShareButtons } from './icons.jsx';

function DuelCard({ app, g }) {
  const rv = app.state.tourReveal;
  const manual = app.state.tourMode === 'manual';
  const winning = rv && rv.winId === g.id;
  const losing = rv && rv.winId && rv.winId !== g.id && (rv.aId === g.id || rv.bId === g.id);
  const Tag = manual ? 'button' : 'div';
  return (
    <Tag
      type={manual ? 'button' : undefined}
      className={'duel-card' + (manual ? ' is-pickable' : '')}
      onClick={() => app.tourPick(g.id)}
      style={{
        border: '2px solid ' + (winning ? '#f4d84b' : 'rgba(255,255,255,.12)'),
        transform: winning ? 'scale(1.03)' : losing ? 'scale(.95)' : 'scale(1)',
        opacity: losing ? 0.4 : 1,
        boxShadow: winning ? '0 0 36px rgba(244,216,75,.55)' : '0 14px 30px rgba(0,0,0,.45)',
      }}
    >
      <CoverOrColor game={g} sizes="(max-width: 720px) 45vw, 400px" eager />
      <div className="duel-shade" />
      <div className="duel-info">
        <div className="duel-title">{g.title}</div>
        <div className="duel-meta">
          <span className="duel-avg">{avgOf(g).toFixed(1)}</span>
          <span className="duel-plat">{PLAT[g.platform]}</span>
        </div>
      </div>
    </Tag>
  );
}

function PodiumSlot({ g, place }) {
  if (!g) return null;
  const champ = place === 1;
  return (
    <div style={{ width: champ ? '34%' : '29%' }}>
      {champ && <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 6 }}>👑</div>}
      <div className={'podium-art' + (champ ? ' is-champ' : '')}><CoverOrColor game={g} sizes="220px" /></div>
      <div className={champ ? 'podium-title-champ' : 'podium-title'}>{g.title}</div>
      <div className={'podium-step step-' + place}>{place}</div>
    </div>
  );
}

export default function Tournament({ app }) {
  const { t, state } = app;
  const stage = state.tourStage;

  if (stage === 'setup') {
    return (
      <section className="tour">
        <div className="tour-setup">
          <h2 className="tour-setup-title">{t('tSetupTitle')}</h2>
          <div className="tour-setup-body">{t('tSetupBody')}</div>
          <div className="tour-modes">
            <button type="button" className="tour-mode" onClick={app.startManual}>
              <div style={{ fontSize: 30 }}>🎮</div>
              <div className="tour-mode-title">{t('tManual')}</div>
              <div className="tour-mode-desc">{t('tManualDesc')}</div>
            </button>
            <button type="button" className="tour-mode" onClick={app.startSim}>
              <div style={{ fontSize: 30 }}>🎲</div>
              <div className="tour-mode-title">{t('tSim')}</div>
              <div className="tour-mode-desc">{t('tSimDesc')}</div>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (stage === 'playing') {
    const pair = state.tour && currentPair(state.tour);
    if (!pair) return <section className="tour" />;
    const label = pair.kind === 'third' ? t('tThird') : t(roundKey(pair.roundSize));
    const { total, played } = progress(state.tour);
    return (
      <section className="tour">
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="duel-label">{label}</div>
          <div className="duel-progress">{t('tMatch')} {Math.min(played + 1, total)} / {total}</div>
          <div className="duel">
            <DuelCard app={app} g={pair.a} />
            <div className="duel-vs">{t('tVs')}</div>
            <DuelCard app={app} g={pair.b} />
          </div>
          <div className="duel-foot">
            {state.tourMode === 'manual' && <div className="duel-hint">👆 {t('tPickHint')}</div>}
            {state.tourMode === 'sim' && <button type="button" className="btn-outline" onClick={app.tourSkip}>{t('tSkip')}</button>}
          </div>
        </div>
      </section>
    );
  }

  const p = state.tour && podium(state.tour);
  if (!p || !p.champ) return <section className="tour" />;
  return (
    <section className="tour">
      <div className="podium">
        <div className="podium-eyebrow">{t('tPodium')}</div>
        <h2 className="podium-champ-name">🏆 {p.champ.title}</h2>
        <div className="podium-row">
          <PodiumSlot g={p.runner} place={2} />
          <PodiumSlot g={p.champ} place={1} />
          <PodiumSlot g={p.third} place={3} />
        </div>
        <div className="share-box">
          <div className="eyebrow" style={{ marginBottom: 11 }}>{t('tShareWin')}</div>
          <input value={state.tourUser} onChange={app.setTourUser} placeholder={t('tYourName')} aria-label={t('tYourName')} className="input-dark" />
          <div className="share-row-center">
            <ShareButtons targets={app.tourShareTargets(p.champ.title)} size={40} />
          </div>
        </div>
        <button type="button" className="btn-primary btn-lg" onClick={app.tourReplay}>{t('tReplay')}</button>
      </div>
    </section>
  );
}
