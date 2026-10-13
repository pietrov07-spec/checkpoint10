// Efectos de sonido. El de abrir ficha usa public/sfx/open.mp3 si existe;
// si el archivo no está, se desactiva en silencio tras el primer intento.
let openAudio = null, openDisabled = false, ac = null;

export function playOpen() {
  if (openDisabled) return;
  try {
    if (!openAudio) {
      openAudio = new Audio(import.meta.env.BASE_URL + 'sfx/open.mp3');
      openAudio.volume = 0.55;
      openAudio.preload = 'auto';
      openAudio.addEventListener('error', () => { openDisabled = true; });
    }
    openAudio.currentTime = 0;
    const p = openAudio.play();
    if (p && p.catch) p.catch(() => {});
  } catch { /* sin audio */ }
}

export function playBlip(type) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ac) ac = new AC();
    if (ac.state === 'suspended') ac.resume();
    const now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    if (type === 'close') {
      o.type = 'sine'; o.frequency.setValueAtTime(620, now); o.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.12, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      o.start(now); o.stop(now + 0.17);
    } else {
      o.type = 'triangle'; o.frequency.setValueAtTime(180, now); o.frequency.exponentialRampToValueAtTime(90, now + 0.09);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.16, now + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      o.start(now); o.stop(now + 0.14);
    }
  } catch { /* sin audio */ }
}
