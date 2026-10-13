// Ruta pública de una portada de la colección base (generadas por `npm run covers`).
const BASE = import.meta.env.BASE_URL;
export const coverUrl = (path, size = 600) => `${BASE}${path}-${size}.webp`;
export const coverSrcSet = (path) => `${coverUrl(path, 300)} 300w, ${coverUrl(path, 600)} 600w`;

/** URL utilizable de la portada de un juego (archivo base, data URL subida o URL remota). */
export function resolveCover(g) {
  if (!g || !g.cover) return null;
  if (g.cover.startsWith('data:') || /^https?:/.test(g.cover)) return g.cover;
  return coverUrl(g.cover);
}

/**
 * Reduce una imagen subida a máx. 600 px de ancho en JPEG antes de guardarla:
 * una foto de 4 MB del teléfono queda en ~60–90 KB.
 */
export function downscaleImage(file, maxW = 600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagen no válida'));
      img.onload = () => {
        const s = Math.min(1, maxW / img.width);
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s);
        cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
