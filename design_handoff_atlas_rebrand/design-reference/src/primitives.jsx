// Shared primitives: badges, buttons, chips, avatars, placeholders.

const Btn = ({ children, variant = 'primary', size = 'md', icon, iconRight, style, ...rest }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid transparent',
    fontWeight: 500, letterSpacing: '-0.01em', fontFamily: 'Geist, sans-serif',
    borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .12s',
  };
  const sizes = {
    sm: { padding: '5px 10px', fontSize: 12 },
    md: { padding: '8px 14px', fontSize: 13 },
    lg: { padding: '11px 20px', fontSize: 14 },
  };
  const variants = {
    primary: { background: 'var(--ink)', color: '#f0eadf', borderColor: 'var(--ink)' },
    secondary: { background: 'var(--paper)', color: 'var(--ink)', borderColor: 'var(--ink-line)' },
    ghost: { background: 'transparent', color: 'var(--ink-soft)' },
    accent: { background: 'var(--terra)', color: '#fff', borderColor: 'var(--terra)' },
    destructive: { background: 'transparent', color: '#c54a3a', borderColor: 'rgba(197,74,58,0.3)' },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...rest}>
      {icon}{children}{iconRight}
    </button>
  );
};

const Chip = ({ children, dot, icon, style, tone = 'neutral' }) => {
  const tones = {
    neutral: { bg: 'transparent', bd: 'var(--ink-line)', fg: 'var(--ink-soft)' },
    solid: { bg: 'var(--bg-cream-3)', bd: 'transparent', fg: 'var(--ink)' },
    accent: { bg: 'var(--terra-soft)', bd: 'transparent', fg: 'var(--terra-deep)' },
    moss: { bg: 'var(--moss-soft)', bd: 'transparent', fg: 'var(--moss)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px',
      borderRadius: 4, background: t.bg, border: `1px solid ${t.bd}`,
      fontSize: 11, color: t.fg, fontWeight: 500, ...style,
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: 99, background: dot }}/>}
      {icon}{children}
    </span>
  );
};

const Avatar = ({ name = 'NA', size = 24, color = 'var(--terra)', src }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: size, height: size, borderRadius: 99, background: color, color: '#fff',
    fontSize: size * 0.42, fontWeight: 600, fontFamily: 'Geist, sans-serif',
    flexShrink: 0, letterSpacing: '-0.02em',
    backgroundImage: src ? `url(${src})` : undefined, backgroundSize: 'cover',
  }}>
    {!src && name.slice(0, 2).toUpperCase()}
  </span>
);

const AvStack = ({ people = [], max = 3, size = 22 }) => (
  <span style={{ display: 'inline-flex' }}>
    {people.slice(0, max).map((p, i) => (
      <span key={i} style={{ marginLeft: i === 0 ? 0 : -size * 0.35, border: '1.5px solid var(--bg-cream)', borderRadius: 99 }}>
        <Avatar {...p} size={size}/>
      </span>
    ))}
    {people.length > max && (
      <span style={{ marginLeft: -size * 0.35, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: 99, background: 'var(--bg-cream-3)', color: 'var(--ink-mute)', fontSize: size*0.4, fontWeight: 600, border: '1.5px solid var(--bg-cream)' }}>
        +{people.length - max}
      </span>
    )}
  </span>
);

const Kbd = ({ children }) => (
  <kbd style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, padding: '1px 5px', border: '1px solid var(--ink-line)', borderRadius: 3, background: 'var(--paper)', color: 'var(--ink-mute)', boxShadow: '0 1px 0 var(--ink-line)' }}>
    {children}
  </kbd>
);

const Bar = ({ pct = 50, color = 'var(--ink)', track = 'var(--ink-line-soft)', height = 6 }) => (
  <span style={{ display: 'block', height, background: track, borderRadius: 99, overflow: 'hidden' }}>
    <span style={{ display: 'block', width: pct + '%', height: '100%', background: color, borderRadius: 99, transition: 'width .3s' }}/>
  </span>
);

const Img = ({ label = 'image', w = '100%', h = 120, style }) => (
  <div className="placeholder" style={{ width: w, height: h, borderRadius: 4, ...style }}>
    {label}
  </div>
);

// Tiny logo/identity mark for sample companies/workspaces
const CompanyMark = ({ ch = 'A', color = 'var(--ink)', size = 20, shape = 'rounded' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: size, height: size, borderRadius: shape === 'rounded' ? 4 : (shape === 'pill' ? 99 : 0),
    background: color, color: '#fff', fontSize: size * 0.5, fontWeight: 700,
    fontFamily: 'Geist, sans-serif', letterSpacing: '-0.04em',
  }}>{ch}</span>
);

// Eyebrow heading (small caps mono)
const Eyebrow = ({ children, style }) => (
  <div className="mono" style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', ...style }}>{children}</div>
);

Object.assign(window, { Btn, Chip, Avatar, AvStack, Kbd, Bar, Img, CompanyMark, Eyebrow });
