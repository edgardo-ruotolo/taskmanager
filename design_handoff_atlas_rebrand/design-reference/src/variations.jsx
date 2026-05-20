// 3 brand variations side by side: Sober / Modern / Experimental.
// Same dashboard screen, three identities.

// Direction A — SOBER: muted, conservative, accountant-friendly
const VariantSober = () => (
  <div style={{ background: '#f7f5f0', color: '#1c1c1c', height: '100%', fontFamily: 'Geist, sans-serif', display: 'flex', flexDirection: 'column' }}>
    {/* header */}
    <div style={{ padding: '16px 28px', borderBottom: '1px solid #e0dccf', display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1c1c1c" strokeWidth="1.5"/>
        <path d="M8 12h8M12 8v8" stroke="#1c1c1c" strokeWidth="1.5"/>
      </svg>
      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.025em' }}>Ledger</span>
      <span style={{ fontSize: 12, color: '#7a766c', borderLeft: '1px solid #d0ccbe', paddingLeft: 14 }}>Cierre Fiscal Q3</span>
    </div>

    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: '#7a766c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hoy · martes 18 mayo</div>
        <h1 style={{ fontSize: 32, fontWeight: 500, margin: '6px 0 4px', letterSpacing: '-0.03em' }}>Buenos días, Marina.</h1>
        <p style={{ fontSize: 13, color: '#605c54', margin: 0 }}>4 issues vencen hoy. Equipo va 2 días adelantado en el cierre.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[['Asignadas', 18], ['Revisión', 7], ['Vencen hoy', 4], ['Cerrados', 23]].map(([k, v], i) => (
          <div key={i} style={{ background: '#fff', padding: 14, border: '1px solid #e0dccf', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#7a766c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 4, border: '1px solid #e0dccf' }}>
        {[
          ['ATL-247', 'urgent', 'Conciliación bancaria — Santander', 'in-progress'],
          ['ATL-251', 'high', 'Declaración IVA — preparar borrador', 'todo'],
          ['ATL-292', 'urgent', 'Bug · CFDI 4.0 rechazado por SAT', 'todo'],
          ['ATL-274', 'high', 'Revisar conciliaciones', 'in-progress'],
        ].map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 64px 1fr auto', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid #ece8db', fontSize: 12.5 }}>
            <StatePip state={r[3]} size={11}/>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10.5, color: '#7a766c' }}>{r[0]}</span>
            <span style={{ fontWeight: 500 }}>{r[2]}</span>
            <PrioDot level={r[1]} size={9}/>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div style={{ padding: '10px 28px', borderTop: '1px solid #e0dccf', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Geist Mono', fontSize: 10, color: '#7a766c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      <span>SOBRIO · Cream + ink · Sin acento</span>
      <span>Para auditores y contadores titulares</span>
    </div>
  </div>
);

// Direction B — MODERN (the chosen direction)
const VariantModern = () => (
  <div style={{ background: 'var(--bg-cream)', color: 'var(--ink)', height: '100%', fontFamily: 'Geist, sans-serif', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--ink-line)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <IcLogo size={22}/>
      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
      <span style={{ fontSize: 12, color: 'var(--ink-mute)', borderLeft: '1px solid var(--ink-line)', paddingLeft: 14 }}>Cierre Fiscal Q3</span>
    </div>

    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Eyebrow>Hoy · martes 18 mayo</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 38, fontWeight: 500, margin: '6px 0 4px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>Buenos días, Marina.</h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: 0 }}>
          <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)' }}>Cuatro</span> issues vencen hoy. El equipo va 2 días adelantado.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[['Asignadas', 18, 'var(--terra)'], ['Revisión', 7, 'var(--gold)'], ['Vencen hoy', 4, '#c54a3a'], ['Cerrados', 23, 'var(--moss)']].map(([k, v, c], i) => (
          <div key={i} style={{ background: 'var(--paper)', padding: 14, border: '1px solid var(--ink-line-soft)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: 0, right: 0, width: 3, height: 18, background: c }}/>
            <Eyebrow>{k}</Eyebrow>
            <div className="tightest" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.05em', marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
        {[
          ['ATL-247', 'urgent', 'Conciliación bancaria — Santander', 'in-progress', 'MR', 'var(--terra)'],
          ['ATL-251', 'high', 'Declaración IVA — preparar borrador', 'todo', 'JC', 'var(--moss)'],
          ['ATL-292', 'urgent', 'Bug · CFDI 4.0 rechazado por SAT', 'todo', 'MR', 'var(--terra)'],
          ['ATL-274', 'high', 'Revisar conciliaciones', 'in-progress', 'EL', 'var(--plum)'],
        ].map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 64px 1fr 12px 22px', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)', fontSize: 12.5 }}>
            <StatePip state={r[3]} size={11}/>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{r[0]}</span>
            <span style={{ fontWeight: 500, letterSpacing: '-0.005em' }}>{r[2]}</span>
            <PrioDot level={r[1]} size={9}/>
            <Avatar name={r[4]} color={r[5]} size={20}/>
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '10px 28px', borderTop: '1px solid var(--ink-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ink)', color: '#f0eadf' }}>
      <span className="mono" style={{ fontSize: 10, color: 'var(--terra)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>● MODERNO · Cream + ink + terra · DIRECCIÓN PROPUESTA</span>
      <span className="mono" style={{ fontSize: 10, color: 'rgba(240,234,223,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Editorial · Cálido · Profesional</span>
    </div>
  </div>
);

// Direction C — EXPERIMENTAL: brutalist, monoespaciado, alto contraste
const VariantExperimental = () => (
  <div style={{ background: '#fafaf7', color: '#0a0a0a', height: '100%', fontFamily: 'Geist Mono, monospace', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '12px 24px', borderBottom: '2px solid #0a0a0a', display: 'flex', alignItems: 'center', gap: 14, background: '#0a0a0a', color: '#fafaf7' }}>
      <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Geist, sans-serif', letterSpacing: '-0.06em' }}>[ TESSERA ]</span>
      <span style={{ fontSize: 11, fontFamily: 'Geist Mono', color: '#a3a39f', marginLeft: 'auto' }}>/c/cierre-fiscal-q3 ──── 247 issues ──── 18%</span>
    </div>

    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ borderBottom: '2px dashed #0a0a0a', paddingBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '0.2em' }}>$ today --user marina</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: '8px 0 4px', letterSpacing: '-0.07em', fontFamily: 'Geist, sans-serif', lineHeight: 0.9 }}>
          [4]_DEADLINES.<br/><span style={{ color: '#e94f37' }}>TODAY ↘</span>
        </h1>
        <p style={{ fontSize: 12, color: '#0a0a0a', margin: 0 }}>→ team_velocity +2d ahead of schedule</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '2px solid #0a0a0a' }}>
        {[['ASSIGN', 18, false], ['REVIEW', 7, false], ['DUE', 4, true], ['DONE', 23, false]].map(([k, v, h], i) => (
          <div key={i} style={{ padding: 14, borderRight: i < 3 ? '2px solid #0a0a0a' : 'none', background: h ? '#e94f37' : '#fafaf7', color: h ? '#fafaf7' : '#0a0a0a' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', fontWeight: 700 }}>{k}_</div>
            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 2, letterSpacing: '-0.05em', fontFamily: 'Geist, sans-serif' }}>{String(v).padStart(2, '0')}</div>
          </div>
        ))}
      </div>

      <div style={{ border: '2px solid #0a0a0a' }}>
        <div style={{ padding: '8px 14px', borderBottom: '2px solid #0a0a0a', background: '#0a0a0a', color: '#fafaf7', display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.2em' }}>
          <span>// ACTIVE_WORK.queue</span>
          <span>[4/247]</span>
        </div>
        {[
          ['ATL-247', '!!!', 'Conciliación bancaria — Santander', '►', 'MR'],
          ['ATL-251', '!!', 'Declaración IVA — borrador', '○', 'JC'],
          ['ATL-292', '!!!', 'Bug · CFDI 4.0 rechazado por SAT', '○', 'MR'],
          ['ATL-274', '!!', 'Revisar conciliaciones · audit', '►', 'EL'],
        ].map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 80px 1fr 40px 30px', alignItems: 'center', gap: 10, padding: '8px 14px', borderTop: i === 0 ? 'none' : '1px dashed #d0d0c8', fontSize: 12 }}>
            <span style={{ fontWeight: 800, color: r[1] === '!!!' ? '#e94f37' : '#0a0a0a' }}>{r[1]}</span>
            <span style={{ fontSize: 11, color: '#605c54' }}>{r[0]}</span>
            <span style={{ fontWeight: 500, fontFamily: 'Geist, sans-serif', letterSpacing: '-0.005em' }}>{r[2]}</span>
            <span style={{ textAlign: 'center', fontWeight: 700 }}>{r[3]}</span>
            <span style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', background: '#0a0a0a', color: '#fafaf7', padding: '2px 4px' }}>{r[4]}</span>
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '10px 28px', borderTop: '2px solid #0a0a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', color: '#fafaf7' }}>
      <span style={{ fontSize: 10, letterSpacing: '0.15em' }}>// EXPERIMENTAL · BRUTALIST · MONO-FIRST</span>
      <span style={{ fontSize: 10, color: '#e94f37', letterSpacing: '0.15em' }}>HIGH_RISK · DEV_TEAMS_ONLY ↗</span>
    </div>
  </div>
);

const VariantsCompare = () => (
  <div className="ab" style={{ padding: '50px 56px', background: '#f0eee9' }}>
    <Eyebrow>04 · Tres direcciones</Eyebrow>
    <h2 className="tightest" style={{ fontSize: 64, fontWeight: 500, margin: '12px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
      Una pantalla, <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>tres temperamentos.</span>
    </h2>
    <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginTop: 12, maxWidth: 720, lineHeight: 1.55, marginBottom: 36 }}>
      Tomamos el dashboard home como caso de prueba. Tres caminos posibles: el <strong style={{ color: 'var(--ink)' }}>sobrio</strong> mantiene la calma del original; el <strong style={{ color: 'var(--ink)' }}>moderno</strong> (Atlas) es la propuesta principal; el <strong style={{ color: 'var(--ink)' }}>experimental</strong> empuja hacia un look brutalista para equipos técnicos. Eligen una, dos, o mezcla.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      {[
        ['A · Sobrio', '"Ledger"', '#7a766c', VariantSober, 'Para auditores. Color minimo, tipo seria, cero distracciones. Inspirada en libros contables tradicionales.'],
        ['B · Moderno', '"Atlas"', 'var(--terra-deep)', VariantModern, 'La dirección propuesta. Editorial sin perder densidad. Funciona para finanzas Y para ingeniería.', true],
        ['C · Experimental', '"Tessera"', '#e94f37', VariantExperimental, 'Brutalista, mono-first, alto contraste. Para equipos técnicos que valoran tener un look único.'],
      ].map(([label, name, color, Cmp, desc, primary], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <span className="mono" style={{ fontSize: 10, color, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
              <div className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 2 }}>{name}</div>
            </div>
            {primary && <Chip tone="accent" style={{ padding: '4px 10px' }}>● Propuesta</Chip>}
          </div>
          <div style={{ aspectRatio: '4/5', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--ink-line)', boxShadow: primary ? '0 16px 50px rgba(217,119,87,0.18)' : '0 4px 16px rgba(26,26,26,0.06)' }}>
            <Cmp/>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.005em' }}>{desc}</p>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 48, padding: 28, background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
      <Eyebrow>Comparativa rápida</Eyebrow>
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 0 }}>
        {[
          ['', 'A · Sobrio', 'B · Moderno', 'C · Experimental'],
          ['Familia tipográfica', 'Geist + serif sutil', 'Geist + Instrument Serif (italic)', 'Geist Mono dominante'],
          ['Color', '2 tonos · sin acento', 'Cream + ink + terracota', 'Negro + rojo + cream'],
          ['Personalidad', 'Calmada · auditor', 'Editorial · profesional', 'Técnica · ruidosa'],
          ['Densidad', 'Alta', 'Media-alta', 'Muy alta'],
          ['Riesgo de marca', 'Mínimo (puede parecer genérico)', 'Bajo (diferenciable y serio)', 'Alto (no apto para todos)'],
          ['Mejor para', 'Contadores, auditores', 'Mix: finanzas + ingeniería', 'Equipos dev, startups'],
        ].map((row, i) => (
          <React.Fragment key={i}>
            {row.map((cell, j) => (
              <div key={j} style={{
                padding: '11px 14px', fontSize: 12.5,
                borderTop: i > 0 ? '1px solid var(--ink-line-soft)' : 'none',
                background: i === 0 ? 'var(--bg-cream)' : (j === 2 ? 'rgba(217,119,87,0.04)' : 'transparent'),
                fontWeight: i === 0 ? 600 : (j === 0 ? 500 : 400),
                color: i === 0 ? 'var(--ink)' : (j === 0 ? 'var(--ink-mute)' : 'var(--ink)'),
                letterSpacing: i === 0 ? '0.08em' : '-0.005em',
                textTransform: i === 0 ? 'uppercase' : 'none',
                fontFamily: i === 0 ? 'Geist Mono, monospace' : 'Geist, sans-serif',
                fontSize: i === 0 ? 10 : 12.5,
              }}>{cell}</div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

// Closer
const ClosingNotes = () => (
  <div className="ab" style={{ padding: '64px 80px', background: 'var(--ink)', color: '#f0eadf', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IcLogo size={26} color="#f0eadf"/>
      <span className="tight" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas — propuesta de rebranding</span>
      <span className="mono" style={{ fontSize: 10, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginLeft: 16, paddingLeft: 16, borderLeft: '1px solid rgba(240,234,223,0.2)' }}>Fin · próximos pasos</span>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 80, alignItems: 'flex-end' }}>
      <div>
        <Eyebrow style={{ color: 'var(--terra)' }}>Próximos pasos</Eyebrow>
        <h2 className="tightest" style={{ fontSize: 88, fontWeight: 500, lineHeight: 0.95, letterSpacing: '-0.06em', margin: '16px 0 0' }}>
          ¿Cuál de las tres<br/>
          <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra)', fontWeight: 400 }}>nos convence?</span>
        </h2>
        <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.55, maxWidth: 560, color: 'rgba(240,234,223,0.75)' }}>
          Si la dirección está clara, el siguiente paso es producir el design system completo en Figma (~2 semanas) y empezar a aplicarlo módulo por módulo en el código existente. Si quieres mezclar elementos entre direcciones, también funciona — el sistema de tokens se adapta.
        </p>
      </div>

      <div>
        <Eyebrow style={{ color: 'rgba(240,234,223,0.5)', marginBottom: 14 }}>Cobertura propuesta</Eyebrow>
        {[
          ['Brand identity completa', '01'],
          ['Sistema de design tokens en código', '02'],
          ['Componentes refactorizados', '03'],
          ['Migración pantalla por pantalla', '04'],
          ['QA visual + dark mode', '05'],
        ].map(([t, n], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: i === 0 ? '1px solid rgba(240,234,223,0.2)' : '1px solid rgba(240,234,223,0.1)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--terra)' }}>{n}</span>
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>{t}</span>
            <IcCheck size={14} color="var(--moss)" style={{ marginLeft: 'auto' }}/>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid rgba(240,234,223,0.15)' }}>
      <span className="mono" style={{ fontSize: 10.5, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>TaskManager → Atlas · 2026 · fluentoc</span>
      <span className="mono" style={{ fontSize: 10.5, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>v 1.0 · interno · confidencial</span>
    </div>

    <svg style={{ position: 'absolute', right: -240, top: -100, opacity: 0.04, pointerEvents: 'none' }} width="700" height="700" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14.5" stroke="#f0eadf" strokeWidth="0.5"/>
      <path d="M5 16a11 11 0 0 1 22 0" stroke="#f0eadf" strokeWidth="0.5"/>
    </svg>
  </div>
);

Object.assign(window, { VariantsCompare, ClosingNotes, VariantSober, VariantModern, VariantExperimental });
