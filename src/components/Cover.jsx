import { resolveCover, coverSrcSet } from '../lib/images.js';

/**
 * Portada de un juego que llena su contenedor (position:absolute; inset:0).
 * Las portadas base se sirven como WebP en dos tamaños y se cargan de forma diferida.
 */
export default function Cover({ game, fit = 'cover', eager = false, sizes = '160px', className = '', style }) {
  const src = resolveCover(game);
  if (!src) return null;
  const isBase = !/^(data:|https?:)/.test(game.cover);
  return (
    <img
      className={'cover-img ' + className}
      src={src}
      srcSet={isBase ? coverSrcSet(game.cover) : undefined}
      sizes={isBase ? sizes : undefined}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={{ objectFit: fit, ...style }}
    />
  );
}

/** Portada o, si no hay arte, un bloque del color generado. */
export function CoverOrColor({ game, fit, eager, sizes }) {
  return game.hasArt
    ? <Cover game={game} fit={fit} eager={eager} sizes={sizes} />
    : <div className="abs-fill" style={{ background: game.genColor || '#12233b' }} />;
}
