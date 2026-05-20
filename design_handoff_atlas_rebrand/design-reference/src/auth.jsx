// Auth: Login, Register, Forgot, Onboarding.

const AuthLogin = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
    {/* Left — brand panel */}
    <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IcLogo size={26} color="#f0eadf"/>
        <span className="tight" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
      </div>

      <div>
        <div className="tightest" style={{ fontSize: 64, fontWeight: 500, lineHeight: 0.95, letterSpacing: '-0.05em' }}>
          El trabajo<br/>
          de tu equipo,<br/>
          <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra)', fontWeight: 400 }}>en orden.</span>
        </div>
        <p style={{ marginTop: 28, fontSize: 14, lineHeight: 1.55, color: 'rgba(240,234,223,0.65)', maxWidth: 360 }}>
          Issues, ciclos, módulos, páginas. Una sola superficie para que ingeniería y operaciones
          hablen el mismo idioma.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="mono" style={{ fontSize: 10.5, color: 'rgba(240,234,223,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          v 4.2 · multi-workspace · SOC 2
        </div>
        <AvStack people={[{ name: 'MR', color: 'var(--terra)' }, { name: 'JC', color: 'var(--moss)' }, { name: 'EL', color: 'var(--plum)' }, { name: 'DS', color: 'var(--gold)' }]} max={4} size={24}/>
      </div>

      {/* large meridian */}
      <svg style={{ position: 'absolute', right: -180, bottom: -180, opacity: 0.05 }} width="520" height="520" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14.5" stroke="#f0eadf" strokeWidth="0.5"/>
        <path d="M5 16a11 11 0 0 1 22 0" stroke="#f0eadf" strokeWidth="0.5"/>
      </svg>
    </div>

    {/* Right — form */}
    <div style={{ background: 'var(--bg-cream)', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
        <Eyebrow>Acceso</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 44, fontWeight: 500, margin: '8px 0 4px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Bienvenida.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Continúa donde dejaste el ciclo.</p>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 16px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', color: 'var(--ink)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.2 8.4 9.9V14.9H7.9V12h2.5V9.8C10.4 7.4 11.9 6 14.1 6c1 0 2.1.2 2.1.2v2.4H15c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 2.9h-2.2v7c4.7-.7 8.4-4.9 8.4-9.9z" fill="var(--ink)"/></svg>
            Continuar con Google
          </button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 16px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
            <IcGit size={16}/>
            Continuar con GitHub
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--ink-faint)', fontSize: 11, letterSpacing: '0.1em' }} className="mono">
          <span style={{ flex: 1, height: 1, background: 'var(--ink-line)' }}/>O CON EMAIL<span style={{ flex: 1, height: 1, background: 'var(--ink-line)' }}/>
        </div>

        <label style={{ display: 'block' }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Email</span>
          <div style={{ marginTop: 6, padding: '12px 14px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 14, fontFamily: 'Geist Mono, monospace' }}>
            marina.ruiz@atlas.work
          </div>
        </label>
        <label style={{ display: 'block', marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Contraseña</span>
            <a className="mono" style={{ fontSize: 10.5, color: 'var(--terra-deep)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Recuperar</a>
          </div>
          <div style={{ marginTop: 6, padding: '12px 14px', background: 'var(--paper)', border: '1.5px solid var(--ink)', borderRadius: 6, fontSize: 18, letterSpacing: '0.3em' }}>
            • • • • • • • •
          </div>
        </label>

        <Btn style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: '13px 16px', fontSize: 14 }} iconRight={<IcArrow size={14}/>}>
          Iniciar sesión
        </Btn>

        <p style={{ fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 24 }}>
          ¿No tienes cuenta? <a style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>Crear workspace</a>
        </p>
      </div>
    </div>
  </div>
);

const AuthRegister = () => (
  <div className="ab" style={{ background: 'var(--bg-cream)', padding: '40px 64px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IcLogo size={24}/>
        <span className="tight" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
      </div>
      <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>¿Ya tienes cuenta? <a style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>Iniciar sesión</a></span>
    </div>

    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginTop: 20 }}>
      <div>
        <Eyebrow>Crear cuenta</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 72, fontWeight: 500, margin: '12px 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          Empieza<br/><span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terra-deep)' }}>tu workspace.</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-mute)', maxWidth: 420, lineHeight: 1.55 }}>
          Gratis hasta 5 colaboradores. Sin tarjeta, sin demos comerciales, sin trial countdown.
          Migrar desde Jira, Linear o Asana toma menos de 15 minutos.
        </p>

        <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--ink-line)', display: 'flex', gap: 32 }}>
          <div>
            <div className="tight" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>14k+</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>equipos activos</div>
          </div>
          <div>
            <div className="tight" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>SOC 2</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>tipo II certificado</div>
          </div>
          <div>
            <div className="tight" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>99.98<span style={{ fontSize: 18, color: 'var(--ink-mute)' }}>%</span></div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>uptime · 12 m</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--paper)', padding: 36, borderRadius: 8, border: '1px solid var(--ink-line-soft)', boxShadow: '0 12px 32px rgba(26,26,26,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Eyebrow>Paso 1 de 3</Eyebrow>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 28, height: 3, background: 'var(--ink)', borderRadius: 99 }}/>
            <span style={{ width: 28, height: 3, background: 'var(--ink-line)', borderRadius: 99 }}/>
            <span style={{ width: 28, height: 3, background: 'var(--ink-line)', borderRadius: 99 }}/>
          </div>
        </div>

        {[
          ['Nombre completo', 'Marina Ruiz'],
          ['Email corporativo', 'marina@contadores-asociados.mx', true],
          ['Contraseña', '• • • • • • • • • •'],
        ].map(([label, val, focus]) => (
          <label key={label} style={{ display: 'block', marginBottom: 14 }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
            <div style={{ marginTop: 6, padding: '11px 14px', background: 'var(--bg-cream)', border: focus ? '1.5px solid var(--ink)' : '1px solid var(--ink-line)', borderRadius: 6, fontSize: 14, fontFamily: label.includes('Email') ? 'Geist Mono, monospace' : 'inherit', boxShadow: focus ? '0 0 0 4px rgba(217,119,87,0.12)' : 'none' }}>
              {val}
            </div>
          </label>
        ))}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: 'var(--ink-mute)', marginTop: 18 }}>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--ink)', marginTop: 2 }}/>
          <span>Acepto los <a style={{ color: 'var(--ink)', textDecoration: 'underline' }}>términos</a> y la <a style={{ color: 'var(--ink)', textDecoration: 'underline' }}>política de privacidad</a>. No enviaremos emails de marketing sin tu permiso.</span>
        </label>

        <Btn style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '13px 16px' }} iconRight={<IcArrow size={14}/>}>Continuar</Btn>
      </div>
    </div>
  </div>
);

const Onboarding = () => (
  <div className="ab" style={{ background: 'var(--bg-cream)', display: 'grid', gridTemplateColumns: '1fr 480px' }}>
    <div style={{ padding: '56px 72px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IcLogo size={24}/>
        <span className="tight" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.15em', textTransform: 'uppercase', marginLeft: 16, paddingLeft: 16, borderLeft: '1px solid var(--ink-line)' }}>Setup · 2 de 4</span>
      </div>

      <div style={{ marginTop: 60 }}>
        <Eyebrow>Cuéntanos sobre tu equipo</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '12px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          ¿Qué tipo de trabajo<br/>vas a <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)', fontWeight: 400 }}>orquestar?</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 420, lineHeight: 1.55 }}>
          Configuramos los estados, etiquetas y vistas iniciales según tu respuesta. Puedes cambiar todo después.
        </p>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 580 }}>
          {[
            { name: 'Ingeniería de software', desc: 'Sprints, bugs, releases, code review.', icon: <IcGit size={20}/>, selected: true },
            { name: 'Contabilidad & Auditoría', desc: 'Cierres, conciliaciones, declaraciones.', icon: <IcLayers size={20}/> },
            { name: 'Operaciones', desc: 'Procesos, tickets internos, vendor mgmt.', icon: <IcActivity size={20}/> },
            { name: 'Producto / Diseño', desc: 'Roadmap, research, hand-off.', icon: <IcModules size={20}/> },
            { name: 'Marketing / Growth', desc: 'Campañas, content, lanzamientos.', icon: <IcZap size={20}/> },
            { name: 'Otro / Mixto', desc: 'Lo configuramos contigo.', icon: <IcPlus size={20}/> },
          ].map((o) => (
            <button key={o.name} style={{
              padding: 18, background: o.selected ? 'var(--ink)' : 'var(--paper)',
              border: o.selected ? '1.5px solid var(--ink)' : '1px solid var(--ink-line-soft)',
              borderRadius: 8, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              color: o.selected ? '#f0eadf' : 'var(--ink)', position: 'relative',
              boxShadow: o.selected ? '0 0 0 4px rgba(217,119,87,0.15)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                {o.icon}
                {o.selected && <IcCheck size={16} color="var(--terra)"/>}
              </div>
              <div className="tight" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.02em' }}>{o.name}</div>
              <div style={{ fontSize: 12, marginTop: 4, color: o.selected ? 'rgba(240,234,223,0.7)' : 'var(--ink-mute)', lineHeight: 1.5 }}>{o.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <Btn variant="secondary" icon={<IcChevLeft size={14}/>}>Atrás</Btn>
          <Btn iconRight={<IcArrow size={14}/>}>Continuar</Btn>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-mute)', alignSelf: 'center' }}>
            <Kbd>Enter</Kbd> para continuar
          </span>
        </div>
      </div>
    </div>

    <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: 40, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Eyebrow style={{ color: 'rgba(240,234,223,0.5)' }}>Vista previa · tu workspace</Eyebrow>

      <div style={{ marginTop: 16, background: 'var(--bg-cream)', borderRadius: 8, padding: 16, color: 'var(--ink)', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, transform: 'rotate(-1deg)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CompanyMark ch="C" color="var(--terra)" size={20}/>
          <span className="tight" style={{ fontSize: 13, fontWeight: 500 }}>Contadores Asociados</span>
          <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-mute)' }}>5 miembros</span>
        </div>
        <div style={{ background: 'var(--paper)', borderRadius: 4, padding: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatePip state="in-progress" size={12}/>
          <span style={{ fontWeight: 500, flex: 1 }}>Sprint inicial · onboarding</span>
          <PrioDot level="high" size={9}/>
        </div>
        <div style={{ background: 'var(--paper)', borderRadius: 4, padding: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatePip state="todo" size={12}/>
          <span style={{ fontWeight: 500, flex: 1 }}>Invitar equipo</span>
          <PrioDot level="medium" size={9}/>
        </div>
        <div style={{ background: 'var(--paper)', borderRadius: 4, padding: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatePip state="backlog" size={12}/>
          <span style={{ fontWeight: 500, flex: 1, color: 'var(--ink-mute)' }}>Configurar integraciones</span>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 4 }}>
          <Chip dot="#d97757">In progress</Chip>
          <Chip dot="#5d7256">Done</Chip>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(240,234,223,0.15)' }}>
        <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--terra)', lineHeight: 1.4 }}>
          "Pasamos de 11 herramientas a una. El cierre mensual ahora es predecible."
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: 'rgba(240,234,223,0.5)', marginTop: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          — Eli Tagle · CFO en Grupo Cervantes
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { AuthLogin, AuthRegister, Onboarding });
