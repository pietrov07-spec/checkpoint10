# CHECKPOINT10

*10 umbrales para pensar los videojuegos.* Estante de análisis en 10 categorías, línea de tiempo, comparador, torneo y tarjetas para compartir.

Este proyecto nació como prototipo en Claude Design (un solo HTML de 1.9 MB) y aquí está convertido en un proyecto web mantenible: Vite + React, datos en JSON, pruebas automáticas y listo para publicar.

## Comandos

```bash
npm install        # una sola vez
npm run dev        # servidor de desarrollo en http://localhost:5173
npm test           # pruebas (torneo, datos, almacenamiento, enlaces)
npm run build      # versión de producción en dist/ (+ páginas por juego)
npm run preview    # sirve dist/ para revisarla antes de publicar
npm run covers     # regenera portadas WebP y de vista previa desde assets/covers-src/
npm run icons      # regenera favicon e iconos de la app
npm run stores     # (con clave RAWG) busca enlaces exactos a tiendas de consola
```

> Node se instaló en `~/.local/node`. Para usar `npm` en tu terminal agrega esto a tu `~/.zshrc`:
> `export PATH="$HOME/.local/node/bin:$PATH"`

## Estructura

```
src/
  App.jsx               estado de la app y acciones (filtros, ficha, torneo, respaldo…)
  components/           una pieza visual por archivo: Header, Shelf, Crate, Timeline,
                        Tournament, Ficha, Versus, Creator, StatsPanel, CardModal
  lib/                  lógica sin React, con pruebas:
    tournament.js         bracket de 32, pases directos, simulación
    stats.js              promedios, filtros, perfil de jugador
    storage.js            IndexedDB + migración desde la versión de Claude Design + respaldo
    links.js              enlaces a sitio oficial / tiendas
    share.js, card.js     compartir y tarjeta 1080×1350
    rawg.js               autocompletado opcional con la API de RAWG
  data/
    games.json          los 23 análisis (calificaciones, ficha técnica, datos curiosos)
    links.json          sitio oficial y tiendas de cada juego
    config.js           marca, tema, colores de plataforma
  i18n/es.json, en.json todos los textos
assets/covers-src/      portadas originales (480×600)
public/covers/          portadas optimizadas (generadas)
scripts/                portadas, iconos, páginas Open Graph, enlaces de tiendas
tests/                  pruebas con Vitest
```

### Agregar o editar un juego "de fábrica"

1. Agrega su entrada en `src/data/games.json` (copia una existente).
2. Pon su portada como `assets/covers-src/<id>.jpg` (ideal 1080×1350) y corre `npm run covers`. Esto también actualiza `src/data/covers.json`, la huella que obliga a los navegadores a descargar la portada nueva en vez de usar la que tenían guardada.
3. Agrega sus enlaces en `src/data/links.json`.
4. `npm test` revisa que no falte nada.

Los juegos que se crean desde la app (**＋ NUEVO ANÁLISIS**) se guardan en el navegador de quien los crea.

## Qué cambió respecto al prototipo

| Área | Antes (Claude Design) | Ahora |
|---|---|---|
| Carga inicial | 1.9 MB que se descomprimían en el navegador ("Unpacking…") | ~83 KB de JS comprimido; portadas WebP en 2 tamaños con carga diferida |
| Código | 1 componente de ~1,200 líneas + plantilla | Componentes y módulos separados, datos y textos en JSON |
| Guardado | `localStorage` (~5 MB; fallaba en silencio con muchas portadas) | IndexedDB, portadas subidas reducidas a ~70 KB, aviso si falla el guardado, **respaldo/restauración** en JSON. Los datos viejos se migran solos |
| Compartir | Texto + enlace a la página de inicio | Cada juego tiene su URL (`/juego/control/`) con vista previa en redes (título, promedio y portada) |
| Fichas nuevas | Todo a mano | Buscador opcional (RAWG): título, año, plataforma, portada, estudio, crítica y tiendas |
| Derechos de las portadas | Sin atribución | Sección **«Dónde conseguirlo»** en cada ficha con enlaces al sitio oficial y a las tiendas, crédito de la portada y aviso legal en el pie |
| App | Solo web | PWA instalable y con caché sin conexión |
| Calidad | Sin pruebas | 31 pruebas; corrige un torneo que se trababa con menos de 16 juegos y el texto de "análisis pendiente" que era una instrucción para Claude |
| Accesibilidad | — | Escape cierra modales, foco al abrir/cerrar, portadas navegables con teclado, respeta "reducir movimiento" |

## Enlaces a tiendas y portadas

Cada ficha muestra:
- **Sitio oficial** (cuando existe) y la **página exacta en Steam** (verificadas).
- **Búsquedas** en PlayStation Store, Xbox Store y Nintendo eShop para las consolas donde el juego está disponible. Son búsquedas porque las URLs de esas tiendas usan identificadores internos. Con una clave de RAWG en `.env`, `npm run stores -- --write` las reemplaza por enlaces exactos.
- El crédito de la portada a sus titulares, indicando que se muestra con fines de reseña.

La lista de consolas por juego (`search` en `links.json`) se armó con información general; revísala antes de publicar.

## Publicar

1. Crea `.env` a partir de `.env.example` y pon en `VITE_SITE_URL` la dirección final.
2. Sube el proyecto a GitHub e impórtalo en **Vercel** o **Netlify**: los archivos `vercel.json` y `netlify.toml` ya están configurados.
3. Para un subdirectorio (p. ej. GitHub Pages en `/checkpoint10/`) habría que ajustar `base` en `vite.config.js` y las rutas del manifiesto.

## Pendientes conocidos

- **Botón MAPA**: el prototipo enlazaba a `MapaMundial.html`, que no venía en el export. Se oculta hasta que definas `VITE_MAP_URL`.
- **Sonido al abrir ficha**: el prototipo esperaba `assets/sfx/open.mp3`, que tampoco venía. Pon el archivo en `public/sfx/open.mp3` y se activa solo.
- Los juegos creados en la app viven en cada navegador; para compartirlos entre dispositivos usa Respaldo/Restaurar o, a futuro, un backend (p. ej. Supabase).
