// Cycles + Modules: list overview, detail with burndown.

const CyclesOverview = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="cycles"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Contadores Asoc.' },
          { label: 'Cierre Fiscal Q3' },
          { icon: <IcCycle size={14}/>, label: 'Cycles' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Nuevo ciclo</Btn>}
      />

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Header */}
        <div>
          <Eyebrow>Ciclos · 12 totales</Eyebrow>
          <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
            El ritmo del trimestre.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-mute)', marginTop: 8, maxWidth: 600 }}>
            Tres ciclos activos, dos próximos, siete cerrados. Promedio de cierre: 98% de scope.
          </p>
        </div>

        {/* Active cycle hero */}
        <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: 32, borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <Eyebrow style={{ color: 'var(--terra)' }}>● CICLO ACTIVO</Eyebrow>
              <div className="tightest" style={{ fontSize: 42, fontWeight: 500, letterSpacing: '-0.04em', marginTop: 8, lineHeight: 1 }}>
                Q3 W3 — Conciliaciones
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'rgba(240,234,223,0.6)', marginTop: 8, letterSpacing: '0.08em' }}>
                12 SEP — 30 SEP · 13 DÍAS RESTANTES · LIDERA MARINA RUIZ
              </div>

              {/* mini-stats */}
              <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
                {[
                  ['Issues', '25', '17 done'],
                  ['Scope', '68%', '+12% vs ayer'],
                  ['Velocity', '4.2', 'issues/día'],
                  ['Predicción', 'On track', 'IA · alta confianza'],
                ].map(([k, v, sub], i) => (
                  <div key={i}>
                    <div className="mono" style={{ fontSize: 10, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k}</div>
                    <div className="tight" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 4 }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,234,223,0.5)', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Burndown sparkline */}
            <div>
              <Eyebrow style={{ color: 'rgba(240,234,223,0.5)', marginBottom: 8 }}>Burndown</Eyebrow>
              <svg viewBox="0 0 240 120" style={{ width: '100%' }}>
                <defs>
                  <linearGradient id="bd" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--terra)" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="var(--terra)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 10 L240 110" stroke="rgba(240,234,223,0.2)" strokeWidth="1" strokeDasharray="3 3" fill="none"/>
                <path d="M0 15 L30 22 L60 30 L90 38 L120 50 L150 58 L180 62 L210 72" stroke="var(--terra)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0 15 L30 22 L60 30 L90 38 L120 50 L150 58 L180 62 L210 72 L210 120 L0 120 Z" fill="url(#bd)"/>
                {[[0,15],[30,22],[60,30],[90,38],[120,50],[150,58],[180,62],[210,72]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="var(--terra)" stroke="#161514" strokeWidth="1.5"/>
                ))}
                {/* end forecast */}
                <path d="M210 72 L240 80" stroke="var(--terra)" strokeWidth="2" strokeDasharray="3 3" fill="none"/>
                <text x="240" y="85" fontSize="9" fill="rgba(240,234,223,0.6)" fontFamily="Geist Mono">FCST</text>
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'rgba(240,234,223,0.5)' }}>12 SEP</span>
                <span className="mono" style={{ fontSize: 9.5, color: 'rgba(240,234,223,0.5)' }}>30 SEP</span>
              </div>
            </div>
          </div>

          {/* shape decoration */}
          <svg style={{ position: 'absolute', right: -120, top: -80, opacity: 0.04 }} width="360" height="360" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14.5" stroke="#f0eadf" strokeWidth="0.5"/>
            <path d="M5 16a11 11 0 0 1 22 0" stroke="#f0eadf" strokeWidth="0.5"/>
          </svg>
        </div>

        {/* Cycles list */}
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Próximos & cerrados</Eyebrow>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
            {[
              { name: 'Q3 W4 — Declaraciones', dates: '23 sept — 7 oct', total: 18, done: 0, pct: 0, status: 'upcoming' },
              { name: 'Q3 W5 — Auditoría externa', dates: '01 oct — 14 oct', total: 22, done: 0, pct: 0, status: 'upcoming' },
              { name: 'Q3 W2 — Pólizas', dates: '29 ago — 11 sept', total: 21, done: 21, pct: 100, status: 'completed' },
              { name: 'Q3 W1 — Apertura', dates: '15 ago — 28 ago', total: 14, done: 13, pct: 92, status: 'completed' },
              { name: 'Q2 W4 — Cierre Q2', dates: '15 jun — 30 jun', total: 28, done: 26, pct: 93, status: 'completed' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px 120px 80px 24px', alignItems: 'center', gap: 16, padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                <Chip tone={c.status === 'upcoming' ? 'accent' : 'moss'} style={{ justifySelf: 'flex-start' }}>{c.status === 'upcoming' ? '○ Próximo' : '✓ Cerrado'}</Chip>
                <span className="tight" style={{ fontSize: 14.5, fontWeight: 500, letterSpacing: '-0.015em' }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{c.dates}</span>
                <Bar pct={c.pct} color={c.pct === 100 ? 'var(--moss)' : (c.status === 'upcoming' ? 'var(--ink-line)' : 'var(--terra)')}/>
                <span className="mono tnum" style={{ fontSize: 11.5, color: 'var(--ink-mute)' }}>{c.done}/{c.total}</span>
                <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
);

const ModulesOverview = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="modules"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Contadores Asoc.' },
          { label: 'Cierre Fiscal Q3' },
          { icon: <IcModules size={14}/>, label: 'Modules' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Nuevo módulo</Btn>}
      />

      <div style={{ padding: '32px 40px' }}>
        <Eyebrow>Modules · agrupación temática</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          Módulos del cierre.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-mute)', marginTop: 8, maxWidth: 600 }}>
          Mientras los ciclos miden tiempo, los módulos miden alcance. Cada uno agrupa issues relacionadas por capacidad o entregable.
        </p>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { name: 'Reportes ejecutivos', desc: 'Dashboards mensuales para CFO y auditoría.', total: 56, done: 23, lead: 'MR', leadc: 'var(--terra)', status: 'On track', accent: 'var(--terra)', team: 4 },
            { name: 'Migración ERP', desc: 'Mover de SAP legacy a Odoo 17.', total: 89, done: 34, lead: 'JC', leadc: 'var(--moss)', status: 'At risk', accent: 'var(--gold)', team: 6 },
            { name: 'Auditoría externa', desc: 'Documentación y soporte a KPMG.', total: 32, done: 28, lead: 'EL', leadc: 'var(--plum)', status: 'Closing soon', accent: 'var(--moss)', team: 3 },
            { name: 'Fiscal — declaraciones', desc: 'ISR, IVA, retenciones, DIOT.', total: 47, done: 39, lead: 'MR', leadc: 'var(--terra)', status: 'On track', accent: 'var(--terra)', team: 5 },
            { name: 'Nómina', desc: 'Cálculo, dispersión, recibos.', total: 28, done: 28, lead: 'DS', leadc: 'var(--gold)', status: 'Completed', accent: 'var(--moss)', team: 2, done_all: true },
            { name: 'Tesorería', desc: 'Pagos, conciliaciones, flujo.', total: 41, done: 19, lead: 'JC', leadc: 'var(--moss)', status: 'On track', accent: 'var(--terra)', team: 4 },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 18, borderRadius: 8, border: '1px solid var(--ink-line-soft)', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 3, background: m.accent }}/>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div className="tight" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.45 }}>{m.desc}</div>
                </div>
                <Chip tone={m.done_all ? 'moss' : (m.accent === 'var(--gold)' ? 'accent' : 'solid')}>
                  {m.done_all ? '✓ ' + m.status : m.status}
                </Chip>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="tightest tnum" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.04em' }}>{Math.round(m.done / m.total * 100)}<span style={{ fontSize: 16, color: 'var(--ink-mute)' }}>%</span></span>
                <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{m.done}/{m.total}</span>
              </div>
              <Bar pct={m.done / m.total * 100} color={m.accent} height={4}/>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--ink-line-soft)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={m.lead} color={m.leadc} size={20}/>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>+ {m.team - 1}</span>
                </span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>Vence 30 sept</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { CyclesOverview, ModulesOverview });
