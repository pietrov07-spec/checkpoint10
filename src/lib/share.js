export const fmt = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

const BASE = import.meta.env.BASE_URL;
const SITE = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');

/** URL pública de la app (usa VITE_SITE_URL si está definida). */
export function homeUrl() {
  if (SITE) return SITE + BASE;
  return typeof location !== 'undefined' ? location.origin + BASE : BASE;
}

/** URL propia de un juego. Solo los juegos base tienen página estática con vista previa (Open Graph). */
export function gameUrl(game) {
  if (!game || game.custom) return homeUrl();
  return `${homeUrl()}juego/${game.id}/`;
}

export function shareIntents(msg, url) {
  const enc = encodeURIComponent(msg), eu = encodeURIComponent(url);
  const withUrl = encodeURIComponent(msg + (url ? ' ' + url : ''));
  return {
    x: 'https://twitter.com/intent/tweet?text=' + enc + (url ? '&url=' + eu : ''),
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + (url ? eu : enc) + '&quote=' + enc,
    whatsapp: 'https://api.whatsapp.com/send?text=' + withUrl,
  };
}

export function openShare(url) {
  window.open(url, '_blank', 'noopener,noreferrer,width=640,height=680');
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* sin portapapeles */ }
    document.body.removeChild(ta);
  }
}

/** Comparte con la hoja nativa (con imagen si se puede). Devuelve false si hay que caer a copiar. */
export async function nativeShare({ title, text, url, imageUrl, fileName }) {
  try {
    if (imageUrl && navigator.canShare) {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], fileName || 'checkpoint10.png', { type: blob.type || 'image/png' });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title, text, url }); return true; }
    }
    if (navigator.share) { await navigator.share({ title, text, url }); return true; }
  } catch (e) {
    if (e && e.name === 'AbortError') return true;
  }
  return false;
}

/**
 * Comparte una imagen (data URL) con la hoja nativa del sistema, para elegir una app
 * que no acepta enlaces web, como TikTok. Devuelve 'shared', 'aborted' o 'unsupported'.
 */
export async function shareImageFile({ dataUrl, fileName, title, text }) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], fileName, { type: blob.type || 'image/png' });
    if (!navigator.canShare || !navigator.canShare({ files: [file] })) return 'unsupported';
    await navigator.share({ files: [file], title, text });
    return 'shared';
  } catch (e) {
    return e && e.name === 'AbortError' ? 'aborted' : 'unsupported';
  }
}

export function downloadDataUrl(dataUrl, fileName) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}
