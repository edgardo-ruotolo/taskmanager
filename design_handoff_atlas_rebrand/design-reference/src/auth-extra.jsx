// Auth extras: Forgot password, Reset password, Magic Link verify.

const ForgotPassword = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
    <div style={{ background: 'var(--bg-cream)', padding: '48px 56px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IcLogo size={24}/>
        <span className="tight" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380 }}>
        <Eyebrow>Recuperar acceso</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 12px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          Te mandamos<br/><span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)', fontWeight: 400 }}>un enlace.</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
          Escribe tu email y te enviamos un enlace para restablecer tu contraseña. El enlace vive por 15 minutos.
        </p>

        <label style={{ display: 'block', marginTop: 28 }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Email</span>
          <div style={{ marginTop: 6, padding: '12px 14px', background: 'var(--paper)', border: '1.5px solid var(--ink)', borderRadius: 6, fontSize: 14, fontFamily: 'Geist Mono, monospace', boxShadow: '0 0 0 4px rgba(217,119,87,0.12)' }}>
            marina.ruiz@atlas.work
          </div>
        </label>

        <Btn style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: '13px 16px' }} iconRight={<IcArrow size={14}/>}>Enviar enlace</Btn>

        <p style={{ fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 20 }}>
          ¿Recordaste? <a style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'underline' }}>Volver a iniciar sesión</a>
        </p>
      </div>
    </div>

    <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Eyebrow style={{ color: 'rgba(240,234,223,0.5)' }}>Seguridad por defecto</Eyebrow>
      <div className="tight" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.04em', marginTop: 8, lineHeight: 1.15, maxWidth: 420 }}>
        Nunca te pediremos<br/>tu contraseña <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra)' }}>por email.</span>
      </div>
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[
          ['Enlaces firmados', 'Cada email lleva un token único de un solo uso.'],
          ['Vencimiento corto', 'Los enlaces expiran en 15 minutos — no quedan flotando.'],
          ['Notificación al cambio', 'Te avisamos a tu email actual si alguien cambia tu password.'],
        ].map(([h, p], i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingTop: 16, borderTop: '1px solid rgba(240,234,223,0.15)' }}>
            <span className="mono" style={{ color: 'var(--terra)', fontSize: 11, minWidth: 24 }}>0{i+1}</span>
            <div>
              <div className="tight" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.015em' }}>{h}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(240,234,223,0.6)', marginTop: 3, lineHeight: 1.5 }}>{p}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ResetPassword = () => (
  <div className="ab" style={{ background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '40px 56px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <IcLogo size={24}/>
      <span className="tight" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
    </div>

    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 440, background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--ink-line-soft)', padding: 40, boxShadow: '0 12px 40px rgba(26,26,26,0.06)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 99, background: 'var(--terra-soft)', color: 'var(--terra-deep)' }}>
          <IcLock size={20}/>
        </span>
        <h1 className="tightest" style={{ fontSize: 32, fontWeight: 500, margin: '16px 0 6px', letterSpacing: '-0.04em', lineHeight: 1 }}>
          Nueva contraseña
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
          Mínimo 10 caracteres. Te recomendamos un gestor de contraseñas — no la reutilices.
        </p>

        <label style={{ display: 'block', marginTop: 24 }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Nueva contraseña</span>
          <div style={{ marginTop: 6, padding: '11px 14px', background: 'var(--bg-cream)', border: '1.5px solid var(--ink)', borderRadius: 6, fontSize: 18, letterSpacing: '0.3em', boxShadow: '0 0 0 4px rgba(217,119,87,0.12)' }}>
            • • • • • • • • • • • • • • •
          </div>
        </label>

        {/* Strength meter */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {['var(--moss)', 'var(--moss)', 'var(--moss)', 'var(--ink-line)'].map((c, i) => (
              <span key={i} style={{ flex: 1, height: 3, background: c, borderRadius: 99 }}/>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--moss)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>● fuerte · 3.2s para romper</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>15/64</span>
          </div>
        </div>

        <label style={{ display: 'block', marginTop: 16 }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Confirmar</span>
          <div style={{ marginTop: 6, padding: '11px 14px', background: 'var(--bg-cream)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 18, letterSpacing: '0.3em' }}>
            • • • • • • • • • • • • • • •
          </div>
        </label>

        <Btn style={{ width: '100%', justifyContent: 'center', marginTop: 22 }} iconRight={<IcCheck size={14}/>}>Cambiar contraseña</Btn>

        <div style={{ marginTop: 18, padding: 12, background: 'var(--bg-cream-2)', borderRadius: 6, fontSize: 11.5, color: 'var(--ink-mute)', lineHeight: 1.55, display: 'flex', gap: 8 }}>
          <IcKey size={12} style={{ flexShrink: 0, marginTop: 2 }}/>
          <span>Tu sesión activa en otros dispositivos se cerrará. Recibirás un email confirmando el cambio.</span>
        </div>
      </div>
    </div>
  </div>
);

const MagicLink = () => (
  <div className="ab" style={{ background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
    {/* background pattern */}
    <svg style={{ position: 'absolute', right: -200, bottom: -200, opacity: 0.05 }} width="600" height="600" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14.5" stroke="var(--ink)" strokeWidth="0.5"/>
      <path d="M5 16a11 11 0 0 1 22 0" stroke="var(--ink)" strokeWidth="0.5"/>
    </svg>

    <div style={{ width: 460, textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 99, background: 'var(--ink)', color: 'var(--terra)', position: 'relative' }}>
          <IcKey size={28}/>
          {/* loading ring */}
          <svg style={{ position: 'absolute', inset: -6 }} width="76" height="76" viewBox="0 0 76 76" fill="none">
            <circle cx="38" cy="38" r="35" stroke="var(--ink-line)" strokeWidth="2"/>
            <circle cx="38" cy="38" r="35" stroke="var(--terra)" strokeWidth="2" strokeDasharray="180 220" strokeLinecap="round" transform="rotate(-90 38 38)"/>
          </svg>
        </span>
      </div>

      <Eyebrow style={{ marginTop: 24 }}>Verificando enlace mágico</Eyebrow>
      <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '12px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
        Casi listo, <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)', fontWeight: 400 }}>Marina.</span>
      </h1>
      <p style={{ fontSize: 14.5, color: 'var(--ink-mute)', lineHeight: 1.55, maxWidth: 360, margin: '0 auto' }}>
        Comprobando el enlace que te enviamos a <span className="mono" style={{ background: 'var(--paper)', padding: '1px 6px', borderRadius: 3, color: 'var(--ink)', fontSize: 12 }}>marina.ruiz@atlas.work</span>
      </p>

      <div style={{ marginTop: 32, padding: 14, background: 'var(--paper)', borderRadius: 6, border: '1px solid var(--ink-line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--moss)', boxShadow: '0 0 0 4px rgba(93,114,86,0.2)' }}/>
          <div>
            <div className="tight" style={{ fontSize: 13, fontWeight: 500 }}>Enlace válido</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>caduca en 12:48</div>
          </div>
        </div>
        <IcCheck size={16} color="var(--moss)"/>
      </div>

      <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 28 }}>
        ¿Esto está tardando? <a style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'underline' }}>Volver a intentar</a>
      </p>
    </div>
  </div>
);

Object.assign(window, { ForgotPassword, ResetPassword, MagicLink });
