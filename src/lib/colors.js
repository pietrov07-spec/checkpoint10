export function hexToHsl(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let hue = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue /= 6;
  }
  return { h: hue * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  const f = (n) => { const k = (n + h * 12) % 12; const a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + to(f(0)) + to(f(8)) + to(f(4));
}

/** Cinco tonos derivados de un color base: uno por cada par de categorías. */
export function shadesFrom(base) {
  const { h, s, l } = hexToHsl(base);
  const sat = Math.max(s, 42);
  const Ls = [l, Math.min(l + 20, 86), Math.max(l - 16, 20), Math.min(l + 36, 92), Math.max(l - 30, 14)];
  return Ls.map((L) => hslToHex(h, sat, L));
}

/** Fondo oscuro para juegos sin portada. */
export function genColorFrom(base) {
  return hslToHex(hexToHsl(base).h, 40, 16);
}
