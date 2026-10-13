import { CONFIG } from '../data/config.js';

const on = (active) => (active ? ' is-active' : '');

export default function Header({ app }) {
  const { t, state } = app;
  return (
    <header className="header">
      <div className="brand">
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }} aria-hidden="true">
          <circle cx="20" cy="20" r="17" fill="#f4d84b" />
          <circle cx="27" cy="16" r="14" fill="#0d1a2b" />
        </svg>
        <div style={{ lineHeight: 1 }}>
          <h1 className="brand-name">{CONFIG.brandName}</h1>
          <div className="brand-tagline">{t('tagline')}</div>
        </div>
      </div>
      <div className="header-actions">
        <div className="lang-switch" role="group" aria-label="Idioma / Language">
          <button type="button" className={'lang-btn' + on(state.lang === 'es')} aria-pressed={state.lang === 'es'} onClick={app.setLangEs}>ES</button>
          <button type="button" className={'lang-btn' + on(state.lang === 'en')} aria-pressed={state.lang === 'en'} onClick={app.setLangEn}>EN</button>
        </div>
        {CONFIG.mapUrl && <a href={CONFIG.mapUrl} className="btn-outline">{t('map')}</a>}
        <button type="button" className={'btn-compare' + on(state.compareMode)} onClick={app.toggleCompareMode}>{t('compare')}</button>
        {CONFIG.showNewButton && (
          <button type="button" className="btn-primary btn-new" onClick={app.openCreator}>
            <span className="label-long">{t('neww')}</span><span className="label-short">{t('newShort')}</span>
          </button>
        )}
        <div className="handle handle-desktop">@_PAQUER</div>
      </div>
      <div className="handle handle-mobile" aria-hidden="true">@_PAQUER</div>
    </header>
  );
}
