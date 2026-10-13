const Svg = ({ children }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const ICONS = {
  x: (
    <Svg>
      <path d="M4 3h3.4l5 6.6L17 3h3l-6.6 8.3L20.6 21H17l-5.2-6.9L6 21H3l7-8.6z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  facebook: (
    <Svg>
      <path d="M14.5 8.5V6.8c0-.8.4-1.3 1.4-1.3H17V2.7C16.4 2.6 15.6 2.5 14.7 2.5c-2 0-3.4 1.2-3.4 3.5v2.5H8.8V12h2.5v9h3.2v-9h2.4l.4-3.5z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  tiktok: (
    <Svg>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  instagram: (
    <Svg>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  whatsapp: (
    <Svg>
      <path d="M4 20l1.2-4.1A7.5 7.5 0 1 1 8 18.2L4 20z" />
      <path d="M9.2 8.4c.15-.35.3-.35.5-.35h.4c.15 0 .35 0 .5.4l.55 1.4c.05.15.1.3 0 .45l-.4.55c-.1.15-.2.25-.05.5.15.25.65 1.05 1.4 1.7.95.85 1.35.95 1.6 1.05.15.05.35.05.5-.1l.55-.65c.15-.2.3-.15.5-.1l1.35.65c.2.1.35.15.4.25.05.15.05.6-.15 1.15-.2.55-1.1 1.05-1.55 1.1-.45.05-.85.2-2.8-.6s-3.15-2.85-3.25-3c-.1-.15-.8-1.05-.8-2 0-.95.5-1.4.65-1.6z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  share: (
    <Svg>
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="M8.2 10.9l7.6-4.4M8.2 13.1l7.6 4.4" />
    </Svg>
  ),
  copy: (
    <Svg>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  ),
};

export function ShareButtons({ targets, size = 38 }) {
  return targets.map((s) => (
    <button key={s.key} type="button" className="share-btn" style={{ width: size, height: size }} title={s.title} aria-label={s.title} onClick={s.onClick}>
      {ICONS[s.key]}
    </button>
  ));
}
