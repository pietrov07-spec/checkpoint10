// Ajustes que en Claude Design eran "props" editables del componente.
export const CONFIG = {
  brandName: 'CHECKPOINT10',
  shelfTheme: 'wood', // 'wood' | 'neon'
  shelfStyle: 'plank', // 'plank' | 'flat'
  showNewButton: true,
  // El prototipo enlazaba a MapaMundial.html, que no venía en el export.
  // Define VITE_MAP_URL en .env para mostrar el botón MAPA.
  mapUrl: import.meta.env.VITE_MAP_URL || null,
};

export const PLAT = { Xbox: 'XBOX', PlayStation: 'PLAYSTATION', Switch: 'NINTENDO SWITCH', SteamDeck: 'STEAM DECK' };
export const PLATORDER = ['Xbox', 'PlayStation', 'Switch', 'SteamDeck'];
export const PLATCOLOR = { PlayStation: '#0d5ce0', Switch: '#e60012', Xbox: '#107c10', SteamDeck: '#5a6b7d' };
export const PLATCOLOR2 = { PlayStation: '#0a3fa0', Switch: '#a4000c', Xbox: '#0a5a0a', SteamDeck: '#3d4a58' };
export const PLATSHORT = { Xbox: 'XBOX', PlayStation: 'PS', Switch: 'SWITCH', SteamDeck: 'STEAM' };
export const PLATFORM_OPTIONS = [
  { key: 'PlayStation', label: 'PlayStation' }, { key: 'Xbox', label: 'Xbox' },
  { key: 'Switch', label: 'Switch' }, { key: 'SteamDeck', label: 'Steam Deck' },
];
export const FILTER_CHIPS = [
  { k: null, l: null }, { k: 'PlayStation', l: 'PS' }, { k: 'Xbox', l: 'Xbox' }, { k: 'Switch', l: 'Switch' }, { k: 'SteamDeck', l: 'Steam Deck' },
];
export const SWATCHES = ['#34a6bd', '#57b947', '#e8397f', '#f4b52a', '#a94f96', '#e01e1e', '#6a9d6e', '#7d8fa6', '#e07b39', '#8f8f8f'];
export const ROTS = ['-2deg', '2deg', '-1.5deg', '1.5deg', '-2.5deg', '2.5deg'];

export const THEMES = {
  wood: {
    labelKey: 'themeWood', text: '#f2e7d7',
    root: 'radial-gradient(75% 55% at 80% -8%, rgba(255,196,120,.12), transparent 55%), radial-gradient(70% 60% at 12% 0%, rgba(180,90,40,.10), transparent 55%), radial-gradient(130% 100% at 50% 125%, #1b120a 0%, #271a10 45%, #322213 100%)',
    grid: 'rgba(255,214,160,.022)',
    niche: 'linear-gradient(180deg,rgba(28,16,7,.62) 0%,rgba(52,34,18,.24) 48%,rgba(52,34,18,.04) 100%)',
    nicheBorder: 'rgba(255,206,150,.07)', nicheShadow: 'inset 0 26px 34px -26px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,220,170,.06)',
    plank: 'repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 3px,transparent 3px 9px), linear-gradient(180deg,#9a6636 0%,#754824 42%,#4d2f16 100%)',
    plankShadow: '0 9px 18px rgba(0,0,0,.55),0 3px 0 rgba(0,0,0,.5),inset 0 2px 0 rgba(255,214,150,.35),inset 0 -3px 7px rgba(0,0,0,.45)',
    plankTop: '1px solid rgba(255,214,150,.45)', lip: 'linear-gradient(180deg,rgba(0,0,0,.4),transparent)',
  },
  neon: {
    labelKey: 'themeNeon', text: '#eaf6ff',
    root: 'radial-gradient(60% 48% at 50% -10%, rgba(90,225,255,.12), transparent 55%), radial-gradient(55% 45% at 85% 15%, rgba(214,90,255,.10), transparent 55%), radial-gradient(120% 95% at 50% 120%, #04060c 0%, #070a14 50%, #0a1020 100%)',
    grid: 'rgba(120,240,255,.05)',
    niche: 'linear-gradient(180deg,rgba(8,18,28,.55) 0%,rgba(16,40,56,.14) 50%,rgba(16,40,56,.03) 100%)',
    nicheBorder: 'rgba(120,240,255,.18)', nicheShadow: 'inset 0 26px 34px -26px rgba(0,0,0,.9),inset 0 0 0 1px rgba(120,240,255,.06),0 0 30px rgba(80,220,255,.07)',
    plank: 'linear-gradient(180deg,rgba(140,244,255,.55) 0%,rgba(70,190,220,.3) 45%,rgba(30,90,120,.18) 100%)',
    plankShadow: '0 0 20px rgba(80,220,255,.4),0 6px 14px rgba(0,0,0,.65),inset 0 2px 0 rgba(220,252,255,.7),inset 0 -3px 8px rgba(0,40,60,.5)',
    plankTop: '1px solid rgba(200,250,255,.75)', lip: 'linear-gradient(180deg,rgba(80,220,255,.22),transparent)',
  },
};
