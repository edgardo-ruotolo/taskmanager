// Detail screens: Cycle detail, Module detail.

const CycleDetail = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="cycles"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { icon: <IcCycle size={14}/>, label: 'Cycles' },
          { label: 'Q3 W3 — Conciliaciones' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcDownload size={13}/>}>Reporte</Btn>
            <Btn size="sm" variant="secondary">Cerrar ciclo</Btn>
            <Btn size="sm" icon={<IcPlus size={13}/>}>Issue</Btn>
          </div>
        }
      />

      {/* Hero */}
      <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: '32px 48px', position: 'relative', overflow: 'hidden' }}>
        <Eyebrow style={{ color: 'var(--terra)' }}>● CICLO ACTIVO · 13 DÍAS RESTANTES</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '12px 0 4px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          Q3 W3 — <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra)', fontWeight: 400 }}>Conciliaciones</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(240,234,223,0.65)', maxWidth: 540 }}>
          Cerrar todas las conciliaciones bancarias del mes de agosto y dejar listos los borradores de declaraciones de septiembre.
        </p>

        <div style={{ display: 'flex', gap: 40, marginTop: 32, flexWrap: 'wrap' }}>
          {[
            ['Periodo', '12 SEP — 30 SEP'],
            ['Scope', '25 issues'],
            ['Lead', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name="MR" color="var(--terra)" size={18}/>Marina Ruiz</span>],
            ['Equipo', '5 personas'],
            ['Estado', <span style={{ color: 'var(--moss)' }}>● On track</span>],
          ].map(([k, v], i) => (
            <div key={i}>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6, letterSpacing: '-0.005em' }}>{v}</div>
            </div>
          ))}
        </div>

        <svg style={{ position: 'absolute', right: -120, top: -80, opacity: 0.04 }} width="360" height="360" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14.5" stroke="#f0eadf" strokeWidth="0.5"/>
          <path d="M5 16a11 11 0 0 1 22 0" stroke="#f0eadf" strokeWidth="0.5"/>
        </svg>
      </div>

      <div style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <Eyebrow>Burndown · scope vs ideal</Eyebrow>
                <div className="tight" style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.025em' }}>17 de 25 cerrados · 68% scope</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11 }} className="mono">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: 'var(--terra)' }}/>REAL</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: 'var(--ink-line)' }}/>IDEAL</span>
              </div>
            </div>

            <svg viewBox="0 0 600 200" style={{ width: '100%', marginTop: 16, height: 220 }}>
              {[40, 80, 120, 160].map(y => <line key={y} x1="20" y1={y} x2="600" y2={y} stroke="var(--ink-line-soft)" strokeWidth="1"/>)}
              {/* Ideal */}
              <path d="M 20 30 L 580 170" stroke="var(--ink-line)" strokeWidth="1.5" strokeDasharray="4 4" fill="none"/>
              {/* Actual */}
              <defs>
                <linearGradient id="cdFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--terra)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--terra)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M 20 30 L 60 38 L 100 42 L 140 50 L 180 55 L 220 65 L 260 78 L 300 90 L 340 105" stroke="var(--terra)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 20 30 L 60 38 L 100 42 L 140 50 L 180 55 L 220 65 L 260 78 L 300 90 L 340 105 L 340 200 L 20 200 Z" fill="url(#cdFill)"/>
              {/* Today marker */}
              <line x1="340" y1="0" x2="340" y2="200" stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 3"/>
              <text x="346" y="18" fontSize="10" fill="var(--ink)" fontFamily="Geist Mono">HOY · DÍA 7</text>
              {/* Forecast */}
              <path d="M 340 105 L 580 175" stroke="var(--terra)" strokeWidth="2" strokeDasharray="3 3" fill="none"/>
              <text x="580" y="185" fontSize="10" fill="var(--terra-deep)" fontFamily="Geist Mono" textAnchor="end">CIERRE PROYECTADO ↓</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)' }}>12 SEP · INICIO</span>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)' }}>30 SEP · CIERRE</span>
            </div>
          </div>

          {/* Stats donut */}
          <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <Eyebrow>Estados</Eyebrow>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <svg viewBox="0 0 100 100" style={{ width: 140, height: 140, transform: 'rotate(-90deg)' }}>
                {[
                  { color: 'var(--moss)', dash: 68 },
                  { color: 'var(--terra)', dash: 16, off: -68 },
                  { color: 'var(--gold)', dash: 8, off: -84 },
                  { color: 'var(--ink-mute)', dash: 8, off: -92 },
                ].map((s, i) => (
                  <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={`${s.dash} 100`} strokeDashoffset={s.off}/>
                ))}
              </svg>
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['Done', 17, 'var(--moss)'], ['In progress', 4, 'var(--terra)'], ['Todo', 2, 'var(--gold)'], ['Backlog', 2, 'var(--ink-mute)']].map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: l[2] }}/>
                  <span style={{ fontWeight: 500 }}>{l[0]}</span>
                  <span className="mono tnum" style={{ color: 'var(--ink-mute)' }}>{l[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Velocity + team distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <Eyebrow>Velocity por día</Eyebrow>
            <div className="tight" style={{ fontSize: 18, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>4.2 issues/día · meta 3.5</div>
            <svg viewBox="0 0 320 100" style={{ width: '100%', marginTop: 12 }}>
              {[3, 4, 5, 3, 6, 4, 5].map((h, i) => (
                <rect key={i} x={i * 44 + 8} y={100 - h * 14} width="32" height={h * 14} fill={i === 6 ? 'var(--terra)' : 'var(--ink-line)'} rx="2"/>
              ))}
              <line x1="0" y1="51" x2="320" y2="51" stroke="var(--terra-deep)" strokeWidth="1" strokeDasharray="3 3"/>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map((d, i) => (
                <span key={i} className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)' }}>{d}</span>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <Eyebrow>Distribución del trabajo</Eyebrow>
            <div className="tight" style={{ fontSize: 18, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>Quién cerró qué · este ciclo</div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Marina R.', 'var(--terra)', 8], ['Eli T.', 'var(--plum)', 5], ['Javier C.', 'var(--moss)', 3], ['Diana S.', 'var(--gold)', 1]].map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 80px 1fr 30px', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <Avatar name={p[0].slice(0,2)} color={p[1]} size={18}/>
                  <span style={{ fontWeight: 500, letterSpacing: '-0.005em' }}>{p[0]}</span>
                  <span style={{ height: 8, background: 'var(--bg-cream-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <span style={{ display: 'block', width: (p[2] / 8 * 100) + '%', height: '100%', background: p[1] }}/>
                  </span>
                  <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink)' }}>{p[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Issues in cycle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.025em', margin: 0 }}>Issues del ciclo <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>· 25</span></h2>
            <Btn size="sm" variant="ghost" icon={<IcList size={13}/>}>Ver todos</Btn>
          </div>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
            {[
              ['ATL-198', 'done', 'medium', 'Implementar match automático v3', 'MR'],
              ['ATL-247', 'in-progress', 'urgent', 'Conciliación bancaria — Santander', 'MR'],
              ['ATL-251', 'todo', 'high', 'Declaración IVA — preparar borrador', 'JC'],
              ['ATL-274', 'in-progress', 'high', 'Revisar conciliaciones — auditoría', 'EL'],
              ['ATL-292', 'todo', 'urgent', 'Bug · CFDI 4.0 rechazado por SAT', 'MR'],
              ['ATL-312', 'started', 'high', 'Test de carga · facturación', 'MR'],
              ['ATL-315', 'in-progress', 'medium', 'UI · tabla movimientos contables', 'DS'],
            ].map((r, i) => (
              <div key={r[0]} style={{ display: 'grid', gridTemplateColumns: '20px 80px 1fr 16px 22px', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                <StatePip state={r[1]} size={13}/>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r[0]}</span>
                <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em', textDecoration: r[1] === 'done' ? 'line-through' : 'none', color: r[1] === 'done' ? 'var(--ink-mute)' : 'var(--ink)' }}>{r[3]}</span>
                <PrioDot level={r[2]} size={11}/>
                <Avatar name={r[4]} color={r[4] === 'MR' ? 'var(--terra)' : r[4] === 'EL' ? 'var(--plum)' : r[4] === 'JC' ? 'var(--moss)' : 'var(--gold)'} size={20}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ModuleDetail = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="modules"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { icon: <IcModules size={14}/>, label: 'Modules' },
          { label: 'Reportes ejecutivos' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcLink size={13}/>}>Copiar link</Btn>
            <Btn size="sm" icon={<IcPlus size={13}/>}>Issue al módulo</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 48px' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <Eyebrow>Módulo · Cierre Fiscal Q3</Eyebrow>
            <h1 className="tightest" style={{ fontSize: 52, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
              Reportes ejecutivos.
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--ink-mute)', marginTop: 12, lineHeight: 1.55, maxWidth: 560 }}>
              Dashboards mensuales y trimestrales para CFO y comité de auditoría. Incluye flujo de caja, P&L, conciliaciones y notas técnicas.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Lead</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <Avatar name="MR" color="var(--terra)" size={22}/>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>Marina Ruiz</span>
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Periodo</div>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 6 }}>Aug 15 — Sep 30</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Estado</div>
                <div style={{ marginTop: 6 }}><Chip tone="accent">○ On track</Chip></div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Equipo</div>
                <div style={{ marginTop: 4 }}><AvStack people={[{ name: 'MR', color: 'var(--terra)' }, { name: 'EL', color: 'var(--plum)' }, { name: 'JC', color: 'var(--moss)' }, { name: 'DS', color: 'var(--gold)' }]} size={22}/></div>
              </div>
            </div>
          </div>

          {/* Big progress */}
          <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: 24, borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Eyebrow style={{ color: 'var(--terra)' }}>● PROGRESO</Eyebrow>
            <div>
              <div className="tightest tnum" style={{ fontSize: 72, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>
                41<span style={{ fontSize: 28, color: 'rgba(240,234,223,0.5)' }}>%</span>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.08em', marginTop: 4 }}>23 DE 56 ISSUES</div>
            </div>
            <Bar pct={41} color="var(--terra)" track="rgba(240,234,223,0.15)"/>
          </div>
        </div>

        {/* Kanban-style by status with module's issues */}
        <Eyebrow style={{ marginBottom: 12 }}>Issues del módulo · agrupadas por estado</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { state: 'todo', name: 'Todo', count: 12, items: [['ATL-251', 'high', 'Declaración IVA · borrador'], ['ATL-307', 'medium', 'Carpetas 2027']] },
            { state: 'in-progress', name: 'In progress', count: 11, items: [['ATL-247', 'urgent', 'Conciliación bancaria — Santander'], ['ATL-274', 'high', 'Revisar conciliaciones audit'], ['ATL-315', 'medium', 'UI · tabla movimientos']] },
            { state: 'started', name: 'In review', count: 4, items: [['ATL-263', 'medium', 'Migrar nómina al módulo RRHH'], ['ATL-312', 'high', 'Test de carga facturación']] },
            { state: 'done', name: 'Done', count: 23, items: [['ATL-198', 'medium', 'Match automático v3'], ['ATL-201', 'medium', 'Plantilla extracto v3'], ['+21 más', null, '']] },
          ].map((col, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <StatePip state={col.state} size={11}/>
                <span className="tight" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.015em' }}>{col.name}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{col.count}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {col.items.map((it, j) => (
                  <div key={j} style={{ background: 'var(--paper)', padding: 10, borderRadius: 6, border: '1px solid var(--ink-line-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{it[0]}</span>
                      {it[1] && <PrioDot level={it[1]} size={9}/>}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 4, letterSpacing: '-0.005em', lineHeight: 1.4 }}>{it[2]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Linked pages */}
        <div style={{ marginTop: 32 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Páginas vinculadas · 4</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              ['Manual de reportes · v 4.2', '14 secciones'],
              ['Plantillas de dashboard ejecutivo', '8 plantillas'],
              ['Glosario contable', 'A-Z'],
              ['Reuniones del módulo · histórico', '12 actas'],
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 6 }}>
                <IcPages size={14} color="var(--ink-mute)"/>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1, letterSpacing: '-0.005em' }}>{p[0]}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{p[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { CycleDetail, ModuleDetail });
