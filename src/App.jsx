import { Component } from 'react';
import BASE_GAMES from './data/games.json';
import es from './i18n/es.json';
import en from './i18n/en.json';
import { CONFIG, PLAT, ROTS, THEMES } from './data/config.js';
import { genColorFrom, shadesFrom } from './lib/colors.js';
import { avgOf, matchGame } from './lib/stats.js';
import { loadCollection, saveCollection, makeBackup, parseBackup } from './lib/storage.js';
import { downscaleImage, resolveCover } from './lib/images.js';
import { playBlip, playOpen } from './lib/sfx.js';
import { drawCard } from './lib/card.js';
import { copyText, downloadDataUrl, fmt, gameUrl, homeUrl, nativeShare, openShare, shareImageFile, shareIntents } from './lib/share.js';
import { gameDetails } from './lib/rawg.js';
import * as Tour from './lib/tournament.js';
import Header from './components/Header.jsx';
import { ViewBar, CompareBar, Filters, NoResults, MobileControls } from './components/Toolbar.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import Shelf, { DragGhost } from './components/Shelf.jsx';
import Crate from './components/Crate.jsx';
import Timeline from './components/Timeline.jsx';
import Tournament from './components/Tournament.jsx';
import Ficha from './components/Ficha.jsx';
import Versus from './components/Versus.jsx';
import CardModal from './components/CardModal.jsx';
import Creator from './components/Creator.jsx';

const I18N = { es, en };
const BASE_IDS = BASE_GAMES.map((g) => g.id);
const BASE = import.meta.env.BASE_URL;

/** Id del juego en la URL (/juego/<id>/) o null. */
export function gameIdFromPath(pathname) {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '');
  const m = rest.match(/^juego\/([\w-]+)\/?$/);
  return m ? m[1] : null;
}

const emptyDraft = () => ({ title: '', platform: 'PlayStation', relYear: 2024, scores: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], baseColor: '#34a6bd', cover: null, origAccent: null, origPairs: null, facts: null, links: null });

function initialTheme() {
  try { const saved = localStorage.getItem('checkpoint10_theme'); if (THEMES[saved]) return saved; } catch { /* sin storage */ }
  return null;
}

function initialLang() {
  try { const saved = localStorage.getItem('checkpoint10_lang'); if (saved === 'es' || saved === 'en') return saved; } catch { /* sin storage */ }
  return 'es';
}

export default class App extends Component {
  state = {
    loaded: false,
    order: BASE_IDS.slice(),
    customGames: [], overrides: {}, deleted: [],
    groupBy: 'platform', lang: initialLang(),
    query: '', platFilter: null, minScore: 0,
    compareMode: false, compareIds: [], versusOpen: false, versusBars: false,
    theme: initialTheme(),
    dragId: null, ghost: null,
    openId: null, barsOn: false, fichaClosing: false, copiedShare: false,
    view: 'shelf', spineMode: false, statsOpen: false, optionsOpen: false,
    tourStage: 'setup', tourMode: null, tour: null, tourReveal: null, tourAuto: false, tourUser: '',
    isMobile: false, crateIndex: 0, crateDrag: 0, forceMobile: false, crateStyle: 'crate',
    creatorOpen: false, editId: null, confirmDelete: false, draft: emptyDraft(),
    cardOpen: false, cardBusy: false, cardImg: null, cardTitle: '',
    toast: null,
  };

  // ---------- datos derivados ----------
  t = (k) => I18N[this.state.lang][k] ?? I18N.es[k] ?? k;
  get labels() { return I18N[this.state.lang].labels; }

  get games() {
    const { customGames, deleted, overrides } = this.state;
    if (this._gamesKey && this._gamesKey[0] === customGames && this._gamesKey[1] === deleted && this._gamesKey[2] === overrides) return this._games;
    const del = new Set(deleted);
    this._games = BASE_GAMES.concat(customGames)
      .filter((g) => !del.has(g.id))
      .map((g) => {
        const o = overrides[g.id];
        const m = o ? { ...g, ...o } : g;
        return { ...m, hasArt: !!m.cover, avgStr: avgOf(m).toFixed(1), genColor: m.genColor || (m.custom ? genColorFrom(m.accent) : undefined) };
      });
    this._byId = Object.fromEntries(this._games.map((g) => [g.id, g]));
    this._gamesKey = [customGames, deleted, overrides];
    return this._games;
  }
  get byId() { this.games; return this._byId; } // eslint-disable-line no-unused-expressions
  get shownGames() { return this.games.filter((g) => matchGame(g, this.state)); }
  get themeKey() { const k = this.state.theme || CONFIG.shelfTheme; return THEMES[k] ? k : 'wood'; }
  get mobileView() { return this.state.isMobile || this.state.forceMobile; }
  get gridView() { return this.state.view === 'shelf' && !this.mobileView; }
  keyOf = (g) => (this.state.groupBy === 'platform' ? g.platform : String(g.relYear));

  // ---------- ciclo de vida ----------
  async componentDidMount() {
    try {
      this._mq = window.matchMedia('(max-width: 720px)');
      this._mqL = () => this.setState({ isMobile: this._mq.matches });
      this._mqL();
      this._mq.addEventListener('change', this._mqL);
    } catch { /* sin matchMedia */ }
    window.addEventListener('popstate', this.onPopState);

    const saved = await loadCollection();
    const ids = saved.customGames.map((g) => g.id);
    const known = BASE_IDS.concat(ids);
    let order = saved.order && saved.order.length ? saved.order.filter((id) => known.includes(id)) : known.slice();
    known.forEach((id) => { if (!order.includes(id)) order.push(id); });
    this.setState({ ...saved, order, loaded: true }, () => {
      const id = gameIdFromPath(location.pathname);
      if (id && this.byId[id]) this.openFicha(id, { push: false });
    });
  }

  componentDidUpdate(_, prev) {
    if (prev.lang !== this.state.lang) {
      document.documentElement.lang = this.state.lang;
      try { localStorage.setItem('checkpoint10_lang', this.state.lang); } catch { /* sin storage */ }
    }
    if (prev.theme !== this.state.theme && this.state.theme) {
      try { localStorage.setItem('checkpoint10_theme', this.state.theme); } catch { /* sin storage */ }
    }
  }

  componentWillUnmount() {
    if (this._mq) this._mq.removeEventListener('change', this._mqL);
    window.removeEventListener('popstate', this.onPopState);
    [this._closeT, this._simT, this._revT, this._copyT, this._toastT].forEach(clearTimeout);
  }

  async persist() {
    const { customGames, order, overrides, deleted } = this.state;
    const ok = await saveCollection({ customGames, order, overrides, deleted });
    if (!ok) this.showToast(this.t('saveErr'), 'error');
  }

  showToast(text, kind = 'info') {
    clearTimeout(this._toastT);
    this.setState({ toast: { text, kind } });
    this._toastT = setTimeout(() => this.setState({ toast: null }), 4200);
  }

  setLangEs = () => this.setState({ lang: 'es' });
  setLangEn = () => this.setState({ lang: 'en' });

  // ---------- arrastrar para reordenar ----------
  setBoardRef = (el) => { this.board = el; };

  onDown = (e, id) => {
    if (e.button !== undefined && e.button !== 0) return;
    this._start = { x: e.clientX, y: e.clientY, id };
    const r = e.currentTarget.getBoundingClientRect();
    this.grab = { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width };
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
  };

  onMove = (e) => {
    if (!this._start) return;
    if (!this.state.dragId) {
      if (Math.hypot(e.clientX - this._start.x, e.clientY - this._start.y) < 6) return;
      this.setState({ dragId: this._start.id, ghost: { x: e.clientX, y: e.clientY } });
    } else {
      this.setState({ ghost: { x: e.clientX, y: e.clientY } });
      this.reorder(e.clientX);
    }
  };

  onUp = () => {
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    if (this.state.dragId) {
      playBlip('drop');
      this.setState({ dragId: null, ghost: null }, () => this.persist());
    } else if (this._start) {
      this.activateTile(this._start.id);
    }
    this._start = null;
  };

  activateTile = (id) => { if (this.state.compareMode) this.toggleCompare(id); else this.openFicha(id); };

  reorder(px) {
    const id = this.state.dragId;
    if (!this.board) return;
    const shelfKey = this.keyOf(this.byId[id]);
    const els = [...this.board.querySelectorAll('[data-shelf="' + shelfKey + '"]')].filter((el) => el.getAttribute('data-gid') !== id);
    let idx = 0;
    for (const el of els) { const r = el.getBoundingClientRect(); if (px > r.left + r.width / 2) idx++; }
    const cur = this.state.order.slice();
    const sameShelf = (x) => this.byId[x] && this.keyOf(this.byId[x]) === shelfKey;
    const shelfIds = cur.filter((x) => sameShelf(x) && x !== id);
    shelfIds.splice(idx, 0, id);
    let p = 0;
    const out = cur.map((x) => (sameShelf(x) ? shelfIds[p++] : x));
    if (out.join() !== cur.join()) this.setState({ order: out });
  }

  // ---------- ficha (con URL propia por juego) ----------
  openFicha = (id, { push = true } = {}) => {
    const g = this.byId[id];
    if (!g) return;
    playOpen();
    clearTimeout(this._closeT);
    document.body.style.overflow = 'hidden';
    this.setState({ openId: id, barsOn: false, fichaClosing: false });
    setTimeout(() => { if (this.state.openId === id) this.setState({ barsOn: true }); }, 90);
    if (!g.custom) {
      const path = `${BASE}juego/${id}/`;
      if (push && location.pathname !== path) history.pushState({ ficha: id }, '', path);
      document.title = `${g.title} · ${CONFIG.brandName}`;
    }
  };

  closeFicha = ({ fromHistory = false } = {}) => {
    if (this.state.fichaClosing || !this.state.openId) return;
    playBlip('close');
    this.setState({ fichaClosing: true });
    clearTimeout(this._closeT);
    this._closeT = setTimeout(() => {
      document.body.style.overflow = '';
      this.setState({ openId: null, barsOn: false, copiedShare: false, fichaClosing: false });
    }, 300);
    document.title = CONFIG.brandName;
    if (!fromHistory && gameIdFromPath(location.pathname)) {
      if (history.state && history.state.ficha) history.back();
      else history.replaceState(null, '', BASE);
    }
  };

  onPopState = () => {
    const id = gameIdFromPath(location.pathname);
    if (id && this.byId[id]) {
      if (this.state.openId !== id) this.openFicha(id, { push: false });
    } else if (this.state.openId) {
      this.closeFicha({ fromHistory: true });
    }
  };

  stop = (e) => e.stopPropagation();

  // ---------- compartir ----------
  gameMessage(og) {
    return fmt(this.t('msgGame'), { title: og.title, avg: og.avgStr, platform: PLAT[og.platform], brand: CONFIG.brandName });
  }

  flashCopied() {
    this.setState({ copiedShare: true });
    clearTimeout(this._copyT);
    this._copyT = setTimeout(() => this.setState({ copiedShare: false }), 1800);
  }

  copy = async (text) => { await copyText(text); this.flashCopied(); };

  gameShareTargets(og) {
    const msg = this.gameMessage(og), url = gameUrl(og), s = shareIntents(msg, url), t = this.t;
    return [
      { key: 'x', title: t('shareX'), onClick: () => openShare(s.x) },
      { key: 'facebook', title: t('shareFb'), onClick: () => openShare(s.facebook) },
      { key: 'tiktok', title: t('shareTikTok'), onClick: () => this.shareGameToTikTok(og) },
      { key: 'instagram', title: t('shareIg'), onClick: () => this.copy(msg + ' ' + url) },
      { key: 'whatsapp', title: t('shareWa'), onClick: () => openShare(s.whatsapp) },
      { key: 'share', title: t('shareNative'), onClick: async () => {
        const img = og.hasArt ? resolveCover(og) : null;
        if (!(await nativeShare({ title: og.title, text: msg, url, imageUrl: img, fileName: og.id + '.webp' }))) this.copy(msg + ' ' + url);
      } },
      { key: 'copy', title: t('shareCopy'), onClick: () => this.copy(msg + ' ' + url) },
    ];
  }

  tourShareTargets(champTitle) {
    const u = (this.state.tourUser || '').trim();
    const msg = (u ? u + ' — ' : '') + fmt(this.t('msgTour'), { title: champTitle, brand: CONFIG.brandName });
    const url = homeUrl(), s = shareIntents(msg, url);
    return [
      { key: 'x', title: 'X', onClick: () => openShare(s.x) },
      { key: 'facebook', title: 'Facebook', onClick: () => openShare(s.facebook) },
      { key: 'tiktok', title: 'TikTok', onClick: () => this.shareTourToTikTok(msg) },
      { key: 'instagram', title: 'Instagram', onClick: () => this.copy(msg) },
      { key: 'whatsapp', title: 'WhatsApp', onClick: () => openShare(s.whatsapp) },
      { key: 'copy', title: this.t('shareCopy'), onClick: () => this.copy(msg) },
    ];
  }

  // TikTok no acepta publicaciones desde un enlace web: se genera la tarjeta y se abre la hoja
  // de compartir del teléfono para elegir TikTok. Sin esa hoja (p. ej. en computadora) se
  // descarga la imagen. En ambos casos el texto queda copiado para pegarlo como descripción.
  shareGameToTikTok = async (og) => {
    const text = this.gameMessage(og) + ' ' + gameUrl(og);
    await copyText(text);
    const img = await drawCard(og, og.avgStr, { brand: CONFIG.brandName, platName: PLAT[og.platform], labels: this.labels, t: this.t });
    const fileName = og.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-paquer.png';
    const r = await shareImageFile({ dataUrl: img, fileName, title: og.title, text });
    if (r === 'unsupported') { downloadDataUrl(img, fileName); this.showToast(this.t('tiktokDownloaded')); }
    else if (r === 'shared') this.showToast(this.t('tiktokShared'));
  };

  shareTourToTikTok = async (msg) => {
    await copyText(msg);
    this.showToast(this.t('tiktokTour'));
  };

  makeCard = async (og) => {
    document.body.style.overflow = 'hidden';
    this.setState({ cardOpen: true, cardBusy: true, cardImg: null, cardTitle: og.title });
    const img = await drawCard(og, og.avgStr, { brand: CONFIG.brandName, platName: PLAT[og.platform], labels: this.labels, t: this.t });
    this.setState({ cardImg: img, cardBusy: false });
  };

  cardFileName() { return (this.state.cardTitle || 'analisis').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-paquer.png'; }

  downloadCard = () => {
    if (!this.state.cardImg) return;
    const a = document.createElement('a');
    a.href = this.state.cardImg;
    a.download = this.cardFileName();
    a.click();
  };

  shareCard = async () => {
    if (!this.state.cardImg) return;
    const og = this.games.find((g) => g.title === this.state.cardTitle);
    const ok = await nativeShare({ title: this.state.cardTitle, url: og ? gameUrl(og) : undefined, imageUrl: this.state.cardImg, fileName: this.cardFileName() });
    if (!ok) this.downloadCard();
  };

  closeCard = () => { this.setState({ cardOpen: false }); if (!this.state.openId) document.body.style.overflow = ''; };

  // ---------- crear / editar ----------
  openCreator = () => { document.body.style.overflow = 'hidden'; this.setState({ creatorOpen: true, editId: null, confirmDelete: false, draft: emptyDraft() }); };

  openEditor = (id) => {
    const g = this.byId[id];
    if (!g) return;
    document.body.style.overflow = 'hidden';
    if (gameIdFromPath(location.pathname)) history.replaceState(null, '', BASE);
    this.setState({ creatorOpen: true, editId: id, openId: null, confirmDelete: false,
      draft: { title: g.title, platform: g.platform, relYear: g.relYear, scores: g.scores.slice(), baseColor: g.accent, cover: g.cover || null, origAccent: g.accent, origPairs: g.pairs, facts: null, links: null } });
  };

  closeCreator = () => { document.body.style.overflow = ''; this.setState({ creatorOpen: false, editId: null, confirmDelete: false }); };
  askDelete = () => this.setState({ confirmDelete: true });
  cancelDelete = () => this.setState({ confirmDelete: false });

  deleteGame = () => {
    const id = this.state.editId;
    if (!id) return;
    const isCustom = this.state.customGames.some((g) => g.id === id);
    const customGames = isCustom ? this.state.customGames.filter((g) => g.id !== id) : this.state.customGames;
    const deleted = isCustom ? this.state.deleted : this.state.deleted.concat(id);
    const overrides = { ...this.state.overrides };
    delete overrides[id];
    const order = this.state.order.filter((x) => x !== id);
    document.body.style.overflow = '';
    this.setState({ customGames, deleted, overrides, order, creatorOpen: false, editId: null, confirmDelete: false }, () => this.persist());
    playBlip('close');
  };

  setDraft = (patch) => this.setState((s) => ({ draft: { ...s.draft, ...patch } }));
  setScore = (cat, val) => this.setState((s) => {
    const scores = s.draft.scores.slice();
    scores[cat] = scores[cat] === val && val === 1 ? 0 : val;
    return { draft: { ...s.draft, scores } };
  });
  onTitleInput = (e) => this.setDraft({ title: e.target.value });
  onYearInput = (e) => { const v = parseInt(e.target.value, 10); this.setDraft({ relYear: isNaN(v) ? '' : v }); };
  clearCover = () => this.setDraft({ cover: null });

  onCoverFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try { this.setDraft({ cover: await downscaleImage(f) }); } catch { /* imagen no válida */ }
  };

  /** Llena el borrador con un resultado de RAWG y, en segundo plano, su ficha técnica y tiendas. */
  applyRawg = async (r) => {
    this.setDraft({ title: r.title, relYear: r.relYear || this.state.draft.relYear, platform: r.platform, cover: r.cover || this.state.draft.cover, facts: null, links: null });
    try {
      const d = await gameDetails(r.rawgId);
      this.setDraft({ facts: d.facts, links: d.links });
    } catch { /* la ficha queda sin datos extra */ }
  };

  fieldsFromDraft(d) {
    const colorChanged = d.baseColor !== d.origAccent;
    const f = {
      title: d.title.trim(), platform: d.platform, relYear: d.relYear || new Date().getFullYear(),
      accent: d.baseColor, cover: d.cover,
      genColor: genColorFrom(d.baseColor),
      scores: d.scores.slice(),
      pairs: colorChanged ? shadesFrom(d.baseColor) : d.origPairs || shadesFrom(d.baseColor),
      pending: false,
    };
    if (d.facts) f.facts = d.facts;
    if (d.links) f.links = d.links;
    return f;
  }

  saveDraft = () => {
    const d = this.state.draft;
    if (!d.title.trim()) return;
    const fields = this.fieldsFromDraft(d);
    document.body.style.overflow = '';
    if (this.state.editId) {
      const id = this.state.editId;
      this.setState({ overrides: { ...this.state.overrides, [id]: fields }, creatorOpen: false, editId: null }, () => { this.persist(); this.openFicha(id); });
      return;
    }
    const id = 'custom_' + Date.now();
    const game = { id, year: new Date().getFullYear(), rot: ROTS[Math.floor(Math.random() * ROTS.length)], custom: true, ...fields };
    this.setState({ customGames: this.state.customGames.concat(game), order: this.state.order.concat(id), creatorOpen: false }, () => { this.persist(); this.openFicha(id); });
  };

  // ---------- respaldo ----------
  downloadBackup = () => {
    const { customGames, order, overrides, deleted } = this.state;
    const blob = new Blob([makeBackup({ customGames, order, overrides, deleted })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `checkpoint10-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  onRestoreFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const data = parseBackup(await f.text());
    if (!data) { this.showToast(this.t('restoreErr'), 'error'); return; }
    const known = BASE_IDS.concat(data.customGames.map((g) => g.id));
    let order = (data.order || []).filter((id) => known.includes(id));
    known.forEach((id) => { if (!order.includes(id)) order.push(id); });
    this.setState({ ...data, order }, async () => { await this.persist(); this.showToast(this.t('restoreOk')); });
  };

  // ---------- filtros, vistas, comparar ----------
  tabPlatform = () => this.setState({ groupBy: 'platform', dragId: null, ghost: null });
  tabYear = () => this.setState({ groupBy: 'year', dragId: null, ghost: null });
  setTheme = (t) => this.setState({ theme: t });
  cycleTheme = () => { const keys = Object.keys(THEMES); this.setTheme(keys[(keys.indexOf(this.themeKey) + 1) % keys.length]); };
  onQuery = (e) => this.setState({ query: e.target.value });
  clearQuery = () => this.setState({ query: '' });
  togglePlatform = (k) => this.setState((s) => ({ platFilter: s.platFilter === k ? null : k }));
  onMinScore = (e) => this.setState({ minScore: parseFloat(e.target.value) });
  clearFilters = () => this.setState({ query: '', platFilter: null, minScore: 0 });
  setShelf = () => this.setState({ view: 'shelf' });
  setTimeline = () => this.setState({ view: 'timeline', dragId: null, ghost: null });
  toggleStats = () => this.setState((s) => ({ statsOpen: !s.statsOpen }));
  toggleOptions = () => this.setState((s) => ({ optionsOpen: !s.optionsOpen }));
  setCovers = () => this.setState({ spineMode: false });
  setSpines = () => this.setState({ spineMode: true });

  toggleCompareMode = () => this.setState((s) => ({ compareMode: !s.compareMode, compareIds: [], versusOpen: false }));
  toggleCompare = (id) => {
    playBlip('drop');
    this.setState((s) => {
      let ids = s.compareIds.slice();
      if (ids.includes(id)) ids = ids.filter((x) => x !== id);
      else if (ids.length < 2) ids.push(id);
      else ids = [ids[1], id];
      return { compareIds: ids };
    });
  };
  removeCompare = (id) => this.setState((s) => ({ compareIds: s.compareIds.filter((x) => x !== id) }));
  openVersus = () => {
    if (this.state.compareIds.length !== 2) return;
    playOpen();
    document.body.style.overflow = 'hidden';
    this.setState({ versusOpen: true, versusBars: false });
    setTimeout(() => { if (this.state.versusOpen) this.setState({ versusBars: true }); }, 90);
  };
  closeVersus = () => { playBlip('close'); document.body.style.overflow = ''; this.setState({ versusOpen: false, versusBars: false }); };

  // ---------- cajón móvil ----------
  crateClamp(i) { const n = this.shownGames.length; return n ? Math.max(0, Math.min(n - 1, i)) : 0; }
  crateGo = (i) => { playBlip('flip'); this.setState({ crateIndex: this.crateClamp(i), crateDrag: 0 }); };
  crateNext = () => this.crateGo(this.state.crateIndex + 1);
  cratePrev = () => this.crateGo(this.state.crateIndex - 1);
  toggleForceMobile = () => this.setState((s) => ({ forceMobile: !s.forceMobile, crateIndex: 0, crateDrag: 0 }));
  setCrateStyle = (s) => this.setState({ crateStyle: s, crateDrag: 0 });
  crateOpen = () => { const g = this.shownGames[this.crateClamp(this.state.crateIndex)]; if (g) this.openFicha(g.id); };
  get crateDragging() { return !!this._cr; }

  // Las portadas se hojean deslizando hacia los lados (en Cajón y en Coverflow). El gesto
  // vertical queda para el navegador (touch-action: pan-y), así se puede bajar la página
  // con el dedo sobre las portadas; cuando el navegador toma el gesto avisa con pointercancel.
  crateDown = (e) => {
    if (e.target.closest('[data-crate-open]')) return;
    const card = e.target.closest('[data-o]');
    this._cr = { y: e.clientY, x: e.clientX, moved: false, o: card ? Number(card.dataset.o) : 0 };
    window.addEventListener('pointermove', this.crateMove);
    window.addEventListener('pointerup', this.crateUp);
    window.addEventListener('pointercancel', this.crateCancel);
  };
  crateMove = (e) => {
    if (!this._cr) return;
    if (Math.hypot(e.clientX - this._cr.x, e.clientY - this._cr.y) > 4) this._cr.moved = true;
    this.setState({ crateDrag: Math.max(-140, Math.min(140, e.clientX - this._cr.x)) });
  };
  crateEnd() {
    window.removeEventListener('pointermove', this.crateMove);
    window.removeEventListener('pointerup', this.crateUp);
    window.removeEventListener('pointercancel', this.crateCancel);
    const cr = this._cr;
    this._cr = null;
    return cr;
  }
  crateUp = () => {
    const d = this.state.crateDrag, cr = this.crateEnd();
    if (!cr) return;
    if (!cr.moved) {
      // Toque: la portada del frente abre su ficha; una de atrás o de adelante pasa al frente.
      if (cr.o) this.crateGo(this.crateClamp(this.state.crateIndex) + cr.o);
      else { this.crateOpen(); this.setState({ crateDrag: 0 }); }
      return;
    }
    if (d < -46) this.crateNext();
    else if (d > 46) this.cratePrev();
    else this.setState({ crateDrag: 0 });
  };
  crateCancel = () => { this.crateEnd(); this.setState({ crateDrag: 0 }); };

  // ---------- torneo ----------
  setTour = () => {
    clearTimeout(this._simT); clearTimeout(this._revT);
    this.setState({ view: 'tour', tourStage: 'setup', tourMode: null, tour: null, tourReveal: null, tourAuto: false, dragId: null, ghost: null });
  };

  startTournament(mode) {
    const tour = Tour.seedBracket(this.games);
    if (!tour) return;
    this.setState({ tourMode: mode, tourStage: 'playing', tour, tourReveal: null, tourAuto: mode === 'sim' }, () => {
      if (mode === 'sim') { clearTimeout(this._simT); this._simT = setTimeout(() => this.tourSimStep(), 500); }
    });
  }
  startManual = () => this.startTournament('manual');
  startSim = () => this.startTournament('sim');

  setWinner(id) {
    const tour = Tour.setWinner(this.state.tour, id);
    this.setState(tour.done ? { tour, tourStage: 'result', tourAuto: false } : { tour });
  }

  tourPick = (id) => { if (this.state.tourMode === 'manual') this.setWinner(id); };

  tourSimStep() {
    if (this.state.tourStage !== 'playing') return;
    const pair = Tour.currentPair(this.state.tour);
    if (!pair) return;
    const w = Tour.simWinner(pair.a, pair.b);
    this.setState({ tourReveal: { aId: pair.a.id, bId: pair.b.id, winId: w.id } });
    clearTimeout(this._revT);
    this._revT = setTimeout(() => {
      this.setState({ tourReveal: null });
      this.setWinner(w.id);
      if (this.state.tourAuto) { clearTimeout(this._simT); this._simT = setTimeout(() => this.tourSimStep(), 280); }
    }, 680);
  }

  tourSkip = () => {
    clearTimeout(this._simT); clearTimeout(this._revT);
    this.setState({ tour: Tour.simulateAll(this.state.tour), tourReveal: null, tourAuto: false, tourStage: 'result' });
  };

  tourReplay = () => {
    clearTimeout(this._simT); clearTimeout(this._revT);
    this.setState({ tourStage: 'setup', tourMode: null, tour: null, tourReveal: null, tourAuto: false });
  };
  setTourUser = (e) => this.setState({ tourUser: e.target.value });

  // ---------- render ----------
  render() {
    const s = this.state;
    const theme = THEMES[this.themeKey];
    const noResults = s.loaded && this.shownGames.length === 0 && !s.compareMode;
    return (
      <div className={"root theme-" + this.themeKey} style={{ background: theme.root, color: theme.text }}>
        <div className="grid-bg" style={{ backgroundImage: `linear-gradient(${theme.grid} 1px,transparent 1px),linear-gradient(90deg,${theme.grid} 1px,transparent 1px)` }} />
        <div className="vignette" />

        <Header app={this} />
        {s.isMobile ? <MobileControls app={this} /> : <ViewBar app={this} />}
        <CompareBar app={this} />
        {!s.isMobile && s.view !== 'tour' && <Filters app={this} />}
        {noResults && <NoResults app={this} />}
        {s.statsOpen && <StatsPanel app={this} />}

        <main className="main">
          {this.gridView && <Shelf app={this} />}
          {s.view === 'shelf' && this.mobileView && <Crate app={this} />}
          {s.view === 'timeline' && <Timeline app={this} />}
          {s.view === 'tour' && <Tournament app={this} />}
        </main>

        <footer className="footer">{this.t('footerLegal')}</footer>

        <DragGhost app={this} />
        {s.openId && <Ficha app={this} />}
        {s.versusOpen && <Versus app={this} />}
        {s.cardOpen && <CardModal app={this} />}
        {s.creatorOpen && <Creator app={this} />}
        {s.toast && <div className={'toast toast-' + s.toast.kind} role="status">{s.toast.text}</div>}
      </div>
    );
  }
}
