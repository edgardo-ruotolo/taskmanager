// Brand concept: cover, naming exploration, voice.

const BrandCover = () => (
  <div className="ab" style={{ background: 'var(--bg-cream)', padding: '64px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IcLogo size={28}/>
        <span className="tight" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.04em' }}>TaskManager</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.15em', borderLeft: '1px solid var(--ink-line)', paddingLeft: 12 }}>Rebrand · v1.0 · 2026</span>
      </div>
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>fluentoc.com · confidential</span>
    </div>

    <div style={{ marginTop: 40 }}>
      <Eyebrow>Una propuesta de rebranding completo</Eyebrow>
      <h1 className="tightest" style={{
        fontSize: 180, lineHeight: 0.88, fontWeight: 500, margin: '24px 0 0', letterSpacing: '-0.06em',
      }}>
        Work,<br/>
        <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terra-deep)' }}>compounded.</span>
      </h1>
      <p style={{ marginTop: 32, fontSize: 18, lineHeight: 1.5, maxWidth: 720, color: 'var(--ink-soft)', letterSpacing: '-0.01em' }}>
        Una identidad nueva, hecha para equipos de contabilidad e ingeniería que necesitan orden,
        ritmo y profundidad. Cálida en la forma, precisa en el detalle. Esta es la dirección que
        proponemos para el rediseño completo de la aplicación — del login hasta los ajustes
        finos de un workspace.
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, paddingTop: 32, borderTop: '1px solid var(--ink-line)' }}>
      {[
        ['01', 'Concepto', 'Naming, voz y posicionamiento'],
        ['02', 'Fundamentos', 'Color, tipografía, componentes'],
        ['03', 'Producto', 'Todas las pantallas de la app'],
        ['04', 'Variaciones', 'Tres caminos: sobrio, moderno, experimental'],
      ].map(([n, t, s]) => (
        <div key={n}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{n} ——</span>
          <div className="tight" style={{ fontSize: 19, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>{t}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 4 }}>{s}</div>
        </div>
      ))}
    </div>
  </div>
);

const NamingExploration = () => {
  const candidates = [
    { name: 'Atlas', tag: 'Tu mapa del trabajo', desc: 'Peso, claridad, escala. Sugiere la herramienta que te da vista panorámica de todo lo que pasa.', primary: true },
    { name: 'Cadence', tag: 'El ritmo del equipo', desc: 'Encaja perfecto con cycles, sprints, releases. Musical, profesional, internacional.' },
    { name: 'Ledger', tag: 'Cuenta lo que importa', desc: 'Contable por origen, riguroso por carácter. Para equipos que miden todo.' },
    { name: 'Plinth', tag: 'Base sólida del proyecto', desc: 'Arquitectónico. La base sobre la que construyes. Corto, único, sin homónimos.' },
    { name: 'Foliant', tag: 'Tomo de operaciones', desc: 'Editorial, documental. Para equipos que tratan el trabajo como un cuerpo de obra.' },
    { name: 'Vector', tag: 'Dirección y magnitud', desc: 'Técnico, de ingeniería. Funciona si el branding se inclina hacia lo computacional.' },
  ];
  return (
    <div className="ab" style={{ padding: '60px 72px', background: 'var(--bg-cream)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <Eyebrow>01 · Naming</Eyebrow>
          <h2 className="tightest" style={{ fontSize: 64, fontWeight: 500, margin: '12px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
            Seis nombres, <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)', fontWeight: 400 }}>un favorito.</span>
          </h2>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 340, lineHeight: 1.55 }}>
          El resto de esta propuesta usa <strong style={{ color: 'var(--ink)' }}>Atlas</strong> como nombre de trabajo.
          Los otros cinco quedan como camino alternativo si quieres explorar otra ruta — el sistema
          de diseño se adapta sin fricción.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {candidates.map((c) => (
          <div key={c.name} style={{
            background: c.primary ? 'var(--ink)' : 'var(--paper)',
            color: c.primary ? '#f0eadf' : 'var(--ink)',
            padding: 28, borderRadius: 8,
            border: c.primary ? 'none' : '1px solid var(--ink-line-soft)',
            minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            {c.primary && (
              <span className="mono" style={{ position: 'absolute', top: 14, right: 14, fontSize: 9.5, color: 'var(--terra)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>● Propuesta</span>
            )}
            <div>
              <Eyebrow style={{ color: c.primary ? 'rgba(240,234,223,0.5)' : 'var(--ink-mute)' }}>{c.name.length} letras</Eyebrow>
              <div className="tightest" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.05em', marginTop: 10, lineHeight: 1 }}>
                {c.name}
              </div>
              <div className="serif" style={{ fontStyle: 'italic', fontSize: 18, marginTop: 10, color: c.primary ? 'var(--terra-soft)' : 'var(--terra-deep)' }}>
                "{c.tag}"
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: c.primary ? 'rgba(240,234,223,0.7)' : 'var(--ink-mute)', marginTop: 24 }}>
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const BrandVoice = () => (
  <div className="ab" style={{ padding: '60px 72px', background: 'var(--paper)' }}>
    <Eyebrow>01 · Voz & posicionamiento</Eyebrow>
    <h2 className="tightest" style={{ fontSize: 64, fontWeight: 500, margin: '12px 0 32px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
      Una voz <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>seria</span>, no aburrida.
    </h2>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
      <div>
        <Eyebrow style={{ marginBottom: 16 }}>Tagline</Eyebrow>
        <div className="tight" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Atlas es donde el trabajo<br/>
          de tu equipo <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)' }}>encuentra forma.</span>
        </div>

        <div style={{ marginTop: 48 }}>
          <Eyebrow style={{ marginBottom: 16 }}>Manifiesto — 3 principios</Eyebrow>
          {[
            ['Densidad con respeto.', 'Cuando una pantalla pide datos, los entrega. Cuando pide enfoque, se calla. Nunca al revés.'],
            ['Orden visible.', 'Cada tarea tiene un dueño, un estado, un ciclo, un porqué. La interfaz lo muestra sin gritarlo.'],
            ['Tipo antes que ícono.', 'Una palabra clara pesa más que un símbolo decorativo. Los íconos refuerzan; no narran.'],
          ].map(([h, p], i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderTop: '1px solid var(--ink-line-soft)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', minWidth: 24 }}>0{i+1}</span>
              <div>
                <div className="tight" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>{h}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 4, lineHeight: 1.5 }}>{p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 16 }}>Tono — sí / no</Eyebrow>
        <div style={{ border: '1px solid var(--ink-line)', borderRadius: 8, overflow: 'hidden' }}>
          {[
            ['Toast confirma guardado', 'Cambios guardados · hace 2 s', '¡Listo! ✨ Tus cambios se guardaron correctamente 🎉'],
            ['Estado vacío de Issues', 'Aún no hay issues en este ciclo. Crea la primera —— ⌘N', '¡Ups! No encontramos nada por aquí. ¿Empezamos?'],
            ['Confirmación destructiva', 'Esta acción borra 12 issues y no se puede deshacer.', '¿Estás seguro? ¡Esto no tiene vuelta atrás! 😱'],
            ['Saludo de bienvenida', 'Buenos días, Marina. 4 issues vencen hoy.', '¡Hola Marina! Espero que tengas un día genial 👋'],
          ].map(([ctx, yes, no], i) => (
            <div key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)', padding: '18px 20px' }}>
              <Eyebrow>{ctx}</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                <div style={{ borderLeft: '2px solid var(--moss)', paddingLeft: 12 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--moss)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>SÍ</span>
                  <div style={{ fontSize: 13, marginTop: 4, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{yes}</div>
                </div>
                <div style={{ borderLeft: '2px solid #c54a3a', paddingLeft: 12, opacity: 0.85 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: '#c54a3a', letterSpacing: '0.18em', textTransform: 'uppercase' }}>NO</span>
                  <div style={{ fontSize: 13, marginTop: 4, color: 'var(--ink-mute)', letterSpacing: '-0.01em', textDecoration: 'line-through', textDecorationColor: 'rgba(197,74,58,0.4)' }}>{no}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const LogoLockup = () => {
  const Lock = ({ bg = 'var(--bg-cream)', fg = 'var(--ink)', accent = 'var(--terra)', name = 'Atlas', label }) => (
    <div style={{ background: bg, padding: '32px 28px', borderRadius: 6, border: '1px solid var(--ink-line-soft)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, minHeight: 180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: fg }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14.5" stroke={fg} strokeWidth="1.5"/>
          <path d="M5 16a11 11 0 0 1 22 0" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="16" cy="16" r="3" fill={accent}/>
        </svg>
        <span className="tight" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.045em' }}>{name}</span>
      </div>
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 'auto' }}>{label}</span>
    </div>
  );
  return (
    <div className="ab" style={{ padding: '60px 72px', background: 'var(--bg-cream-2)' }}>
      <Eyebrow>01 · Logotipo · "Atlas"</Eyebrow>
      <h2 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '12px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
        Una marca <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>geodésica.</span>
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 560, marginBottom: 36, lineHeight: 1.55 }}>
        El símbolo es un meridiano — la línea que une polos. Sugiere navegación, mapa, y al mismo tiempo la cabeza de un alfiler clavado en el trabajo importante. Funciona como avatar, como favicon y como marca de agua.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Lock label="Default · light"/>
        <Lock bg="var(--ink)" fg="#f0eadf" accent="var(--terra)" label="Dark"/>
        <Lock bg="var(--terra)" fg="#fff" accent="#fff" label="Accent"/>
        <Lock bg="var(--paper)" fg="var(--ink)" accent="var(--moss)" label="Mono moss"/>
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, alignItems: 'center' }}>
        <Eyebrow>Tamaños</Eyebrow>
        {[16, 24, 32, 48, 64].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IcLogo size={s} color="var(--ink)"/>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{s}px</span>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { BrandCover, NamingExploration, BrandVoice, LogoLockup });
