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
  threads: (
    <Svg>
      <path d="M16.5 11.6c-.1-.05-.2-.1-.3-.14-.18-3.3-2-5.2-5-5.2-2 0-3.6.85-4.6 2.4l1.6 1.1c.75-1.1 1.9-1.35 2.9-1.35 1.7 0 2.9 1 3 2.85-.6-.15-1.3-.2-2-.2-2.6 0-4.3 1.4-4.2 3.4.06 1.9 1.7 3.1 3.7 3.1 1.6 0 3.6-.7 4.1-3.4.9.6 1.4 1.5 1.4 2.7 0 1.9-1.9 4.1-5.4 4.1-3.9 0-5.9-2.6-5.9-6.9S6 5.5 9.9 5.5c1.3 0 4.2.2 5.6 3.2l1.8-.7C15.9 5 13.2 3.7 9.9 3.7 4.9 3.7 2 6.9 2 12.4S5 21 10 21c4.7 0 7.4-3 7.4-5.9 0-2-1-3-1.9-3.5z" fill="currentColor" stroke="none" />
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
