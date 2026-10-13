// Tarjeta compartible de 1080×1350 dibujada en canvas.
import { resolveCover } from './images.js';

function loadImg(src) {
  return new Promise((res) => {
    if (!src) return res(null);
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** opts: { brand, platName, labels, t } */
export async function drawCard(og, avg, opts) {
  try { await document.fonts.load("800 60px 'Archivo Black'"); await document.fonts.load("700 24px 'Chakra Petch'"); } catch { /* fuentes del sistema */ }
  const cover = await loadImg(resolveCover(og));
  try {
    return paint(og, avg, cover, opts);
  } catch {
    // Una portada remota sin CORS "contamina" el canvas; se redibuja sin ella.
    return paint(og, avg, null, opts);
  }
}

function paint(og, avg, cover, { brand, platName, labels, t }) {
  const W = 1080, H = 1350, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#102138'); g.addColorStop(1, '#0a1421');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const headH = 560;
  if (cover) {
    const s = Math.max(W / cover.width, headH / cover.height), dw = cover.width * s, dh = cover.height * s;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, headH); ctx.clip();
    ctx.drawImage(cover, (W - dw) / 2, (headH - dh) / 2, dw, dh); ctx.restore();
  } else {
    ctx.fillStyle = og.genColor || '#12233b'; ctx.fillRect(0, 0, W, headH);
  }
  const ov = ctx.createLinearGradient(0, headH - 320, 0, headH); ov.addColorStop(0, 'rgba(10,20,33,0)'); ov.addColorStop(1, 'rgba(10,20,33,.96)');
  ctx.fillStyle = ov; ctx.fillRect(0, 0, W, headH);
  ctx.fillStyle = 'rgba(10,20,33,.28)'; ctx.fillRect(0, 0, W, headH);
  // marca
  const brandUp = brand.toUpperCase();
  ctx.fillStyle = '#f4d84b'; ctx.font = "700 22px 'Chakra Petch'"; ctx.textBaseline = 'alphabetic';
  ctx.save(); ctx.translate(70, 84); ctx.fillText(brandUp, 0, 0);
  ctx.fillStyle = '#7f95b0'; ctx.fillText('   ·   ' + t('cardSub'), ctx.measureText(brandUp).width, 0); ctx.restore();
  // título (hasta 2 líneas)
  ctx.fillStyle = '#ffffff'; ctx.font = "800 74px 'Archivo Black'";
  const words = og.title.toUpperCase().split(' ');
  let lines = [], cur = '';
  for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (ctx.measureText(tt).width > 760 && cur) { lines.push(cur); cur = w; } else cur = tt; }
  if (cur) lines.push(cur);
  lines = lines.slice(0, 2);
  let ty = headH - 58 - (lines.length - 1) * 72;
  for (const ln of lines) { ctx.fillText(ln, 70, ty); ty += 72; }
  ctx.font = "700 24px 'Chakra Petch'"; ctx.fillStyle = '#b9c7d8';
  ctx.fillText(platName + '  ·  ' + t('releaseWord') + ' ' + og.relYear, 72, headH - 22);
  // promedio
  const bx = W - 140, by = 120, br = 76;
  ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,20,33,.55)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = og.accent; ctx.stroke();
  ctx.fillStyle = og.accent; ctx.font = "800 58px 'Archivo Black'"; ctx.textAlign = 'center'; ctx.fillText(avg, bx, by + 8);
  ctx.font = "700 16px 'Chakra Petch'"; ctx.fillStyle = '#cdd9e6'; ctx.fillText(t('avgShort'), bx, by + 40); ctx.textAlign = 'left';
  // barras
  const y0 = headH + 64, y1 = H - 96, n = 10, rowH = (y1 - y0) / n;
  const labelR = 386, trackX = 414, trackW = W - 70 - trackX - 64, numX = W - 64;
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const cy = y0 + rowH * i + rowH / 2, color = og.pairs[Math.floor(i / 2)], score = og.scores[i];
    ctx.fillStyle = '#c3cfdd'; ctx.font = "600 23px 'Chakra Petch'"; ctx.textAlign = 'right';
    ctx.fillText(labels[i].toUpperCase(), labelR, cy);
    const gap = 8, segW = (trackW - gap * 4) / 5, bh = 34;
    for (let s = 0; s < 5; s++) {
      const sx = trackX + s * (segW + gap);
      rrect(ctx, sx, cy - bh / 2, segW, bh, 6);
      if (s < score) { ctx.fillStyle = color; ctx.fill(); }
      else { ctx.fillStyle = 'rgba(255,255,255,.045)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.stroke(); }
    }
    ctx.fillStyle = color; ctx.font = "800 26px 'Archivo Black'"; ctx.textAlign = 'left'; ctx.fillText(String(score), numX, cy);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#5f748f'; ctx.font = "700 20px 'Chakra Petch'"; ctx.fillText('@_paquer  ·  checkpoint10', 70, H - 40);
  return cv.toDataURL('image/png');
}
