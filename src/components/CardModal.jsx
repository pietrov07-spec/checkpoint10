import { useModal } from './Ficha.jsx';

export default function CardModal({ app }) {
  const { t, state } = app;
  const panelRef = useModal(app.closeCard);
  return (
    <div className="backdrop backdrop-card" onClick={app.closeCard}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={state.cardTitle} className="card-modal" onClick={app.stop}>
        <div className="card-preview">
          {state.cardBusy && <div className="card-busy">{t('genCard')}</div>}
          {state.cardImg && <img src={state.cardImg} alt={state.cardTitle} className="card-img" />}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-primary btn-flex" onClick={app.downloadCard}>{t('download')}</button>
          <button type="button" className="btn-outline btn-flex" onClick={app.shareCard}>{t('share')}</button>
          <button type="button" className="btn-outline" aria-label="Cerrar" onClick={app.closeCard}>✕</button>
        </div>
      </div>
    </div>
  );
}
