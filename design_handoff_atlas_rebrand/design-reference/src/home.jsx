// Workspace Home — the landing dashboard.

const Home = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="home"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcHome size={14}/>, label: 'Home' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcBell size={13}/>}>12</Btn>
            <Btn size="sm" icon={<IcPlus size={13}/>}>Nuevo issue</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Hero greeting */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'flex-end' }}>
          <div>
            <Eyebrow>Martes · 18 mayo · semana 21</Eyebrow>
            <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 4px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
              Buenos días, Marina.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-soft)', letterSpacing: '-0.005em', lineHeight: 1.5 }}>
              <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)' }}>Cuatro</span> issues vencen hoy, <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra-deep)' }}>tres</span> ciclos cierran esta semana, y el equipo va <span style={{ fontWeight: 500 }}>2 días adelantado</span> en el cierre fiscal.
            </p>
          </div>
          <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: 20, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <IcSparkle size={20} color="var(--terra)"/>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Resumen IA</div>
              <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>
                Tienes ancho de banda para tomar 2 issues más sin riesgo de slip.
              </div>
            </div>
            <IcArrow size={14} color="rgba(240,234,223,0.7)"/>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Asignadas a ti', value: 18, delta: '+3 esta semana', trend: 'up', accent: 'var(--terra)' },
            { label: 'Por revisar', value: 7, delta: '4 sin actualizar 24h', trend: 'warn', accent: 'var(--gold)' },
            { label: 'Cierran hoy', value: 4, delta: '2 bloqueadas', trend: 'down', accent: '#c54a3a' },
            { label: 'Done · esta semana', value: 23, delta: '+8 vs sem. anterior', trend: 'up', accent: 'var(--moss)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 18, borderRadius: 8, border: '1px solid var(--ink-line-soft)', position: 'relative', overflow: 'hidden' }}>
              <Eyebrow>{s.label}</Eyebrow>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
                <span className="tightest" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>{s.value}</span>
                {s.trend === 'up' && <IcArrowUp size={14} color="var(--moss)"/>}
                {s.trend === 'down' && <IcArrowDown size={14} color="#c54a3a"/>}
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 8, letterSpacing: '0.05em' }}>{s.delta}</div>
              <span style={{ position: 'absolute', top: 0, right: 0, width: 3, height: 24, background: s.accent }}/>
            </div>
          ))}
        </div>

        {/* Two-column main */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
          {/* Today's issues */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em', margin: 0 }}>Tu día <span style={{ color: 'var(--ink-mute)' }}>· 4 issues</span></h2>
              <a className="mono" style={{ fontSize: 11, color: 'var(--terra-deep)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ver todo →</a>
            </div>

            <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, overflow: 'hidden' }}>
              {[
                { id: 'ATL-247', state: 'in-progress', title: 'Conciliación bancaria — Banco Santander agosto', prio: 'urgent', cycle: 'Q3 W3', due: 'Hoy · 18:00', estimate: '3h', assignee: ['MR', 'var(--terra)'] },
                { id: 'ATL-251', state: 'todo', title: 'Declaración IVA — preparar borrador para revisión', prio: 'high', cycle: 'Q3 W3', due: 'Hoy', estimate: '2h', assignee: ['MR', 'var(--terra)'] },
                { id: 'ATL-263', state: 'started', title: 'Migrar nómina al nuevo módulo de RRHH', prio: 'medium', cycle: 'ERP Migration', due: 'Hoy', estimate: '5h', assignee: ['MR', 'var(--terra)'] },
                { id: 'ATL-274', state: 'in-progress', title: 'Revisar conciliaciones — auditoría externa', prio: 'high', cycle: 'Auditoría', due: 'Hoy', estimate: '1.5h', assignee: ['MR', 'var(--terra)'] },
              ].map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: 'auto auto 88px 1fr auto auto auto auto',
                  alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)',
                  background: i === 0 ? 'rgba(217,119,87,0.04)' : 'transparent',
                }}>
                  <input type="checkbox" defaultChecked={false} style={{ accentColor: 'var(--ink)' }}/>
                  <StatePip state={r.state} size={14}/>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r.id}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                  <PrioDot level={r.prio} size={11}/>
                  <Chip tone="solid" icon={<IcCycle size={10}/>}>{r.cycle}</Chip>
                  <span className="mono" style={{ fontSize: 11, color: r.due === 'Hoy · 18:00' ? '#c54a3a' : 'var(--ink-mute)' }}>{r.due}</span>
                  <Avatar name={r.assignee[0]} color={r.assignee[1]} size={22}/>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div style={{ marginTop: 32 }}>
              <h2 className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Actividad reciente</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 1, background: 'var(--ink-line)' }}/>
                {[
                  ['MR', 'var(--terra)', 'Marina', 'cambió el estado de', <span className="mono" style={{ background: 'var(--bg-cream-2)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>ATL-263</span>, 'a in progress', 'hace 12 min'],
                  ['JC', 'var(--moss)', 'Javier', 'comentó en', <span className="mono" style={{ background: 'var(--bg-cream-2)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>ATL-247</span>, '— "Falta el extracto de septiembre, te lo subo en la tarde"', 'hace 35 min'],
                  ['EL', 'var(--plum)', 'Eli', 'cerró el ciclo', <span style={{ fontWeight: 500 }}>Q3 W2 — Conciliaciones</span>, '', 'hace 2 h'],
                  ['DS', 'var(--gold)', 'Diana', 'creó', <span className="mono" style={{ background: 'var(--bg-cream-2)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>4 issues</span>, 'en Auditoría 2026', 'ayer 17:42'],
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', position: 'relative' }}>
                    <Avatar name={a[0]} color={a[1]} size={22} style={{ zIndex: 1 }}/>
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)', flex: 1, letterSpacing: '-0.005em', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{a[2]}</strong> {a[3]} {a[4]} {a[5]}
                    </div>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{a[6]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Active cycles */}
            <div>
              <h2 className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Ciclos activos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Cierre Fiscal Q3', dates: '12 sept — 30 sept', pct: 68, done: 17, total: 25, accent: 'var(--terra)' },
                  { name: 'ERP Migration · Fase 2', dates: '01 sept — 15 oct', pct: 42, done: 8, total: 19, accent: 'var(--moss)' },
                  { name: 'Auditoría externa', dates: '20 ago — 30 sept', pct: 81, done: 13, total: 16, accent: 'var(--plum)' },
                ].map((c, i) => (
                  <div key={i} style={{ background: 'var(--paper)', padding: 14, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className="tight" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.015em' }}>{c.name}</span>
                      <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{c.done}/{c.total}</span>
                    </div>
                    <Bar pct={c.pct} color={c.accent}/>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{c.dates}</span>
                      <span style={{ color: c.accent }}>{c.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links / favorites */}
            <div>
              <h2 className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Favoritos</h2>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
                {[
                  [<IcPages size={14} color="var(--ink-mute)"/>, 'Manual cierre fiscal · 2026', '14 secciones'],
                  [<IcModules size={14} color="var(--ink-mute)"/>, 'Módulo · Reportes ejecutivos', '23 / 56 issues'],
                  [<IcIssues size={14} color="var(--ink-mute)"/>, 'Vista · Mis bloqueos', '7 issues'],
                  [<IcCompanies size={14} color="var(--ink-mute)"/>, 'Grupo Cervantes', 'company'],
                ].map(([icon, label, sub], i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)', cursor: 'pointer' }}>
                    {icon}
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}>{label}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Home });
