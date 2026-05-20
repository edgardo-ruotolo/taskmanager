// Archives, Estimates, Importer, Integrations.

const Archives = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="archives"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { icon: <IcArchive size={14}/>, label: 'Archivos' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcRefresh size={13}/>}>Restaurar selección</Btn>
            <Btn size="sm" variant="destructive">Vaciar archivos</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>● Solo lectura · todo lo cerrado y archivado</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Archivos.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 600, lineHeight: 1.55 }}>
          Issues, ciclos, módulos y páginas archivados. Permanecen indexados para búsqueda y reportes, pero no aparecen en las listas activas. Puedes restaurar o eliminar permanentemente.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--ink-line)' }}>
          {[['Issues', 89, true], ['Cycles', 7], ['Modules', 3], ['Pages', 12]].map(([l, n, a], i) => (
            <button key={i} style={{
              padding: '6px 12px', border: 'none', background: a ? 'var(--ink)' : 'transparent',
              color: a ? '#f0eadf' : 'var(--ink-mute)',
              borderRadius: 4, fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.005em',
            }}>
              {l}<span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{n}</span>
            </button>
          ))}
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 12, color: 'var(--ink-mute)' }}>
            <IcSearch size={12}/>Buscar en archivos
          </div>
          <Btn size="sm" variant="ghost" icon={<IcCalendar size={13}/>}>Cualquier fecha</Btn>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
          {/* Group: Esta semana */}
          <div style={{ padding: '10px 16px 6px', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>esta semana · 4 archivados</span>
          </div>
          {[
            ['ATL-298', 'done', 'Reporte mensual a CFO · agosto', 'Frontend', '#d97757', '13 sept', 'Marina R.', 'cerrado'],
            ['ATL-201', 'done', 'Plantilla extracto v3 · pólizas', 'Backend', '#5d7256', '12 sept', 'Javier C.', 'cerrado'],
            ['ATL-301', 'cancelled', 'Migrar dashboard antiguo a v3', 'Frontend', '#d97757', '14 sept', 'Diana S.', 'duplicado'],
            ['ATL-209', 'done', 'Manual de conciliación · v2', 'Docs', '#6b6660', '14 sept', 'Eli T.', 'cerrado'],
          ].map((r, i) => <ArchRow key={r[0]} r={r}/>)}

          <div style={{ padding: '10px 16px 6px', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--ink-line-soft)' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>semana pasada · 12 archivados</span>
          </div>
          {[
            ['ATL-178', 'done', 'Conciliación bancaria julio', 'Backend', '#5d7256', '06 sept', 'Marina R.', 'cerrado'],
            ['ATL-145', 'done', 'Reporte de KPIs · agosto', 'Frontend', '#d97757', '04 sept', 'Eli T.', 'cerrado'],
            ['ATL-167', 'cancelled', 'Bug duplicado · CFDI espacios', 'Bug', '#c54a3a', '03 sept', 'Sistema', 'duplicado'],
            ['ATL-132', 'done', 'Plantilla declaración IVA', 'Fiscal', '#3d4a6b', '01 sept', 'Javier C.', 'cerrado'],
          ].map((r, i) => <ArchRow key={r[0]} r={r}/>)}

          <div style={{ padding: '10px 16px 6px', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--ink-line-soft)' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>agosto · 73 archivados — ver todos</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ArchRow = ({ r }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '24px 20px 80px 1fr 120px 90px 100px 100px 24px', alignItems: 'center', gap: 10, padding: '12px 16px', borderTop: '1px solid var(--ink-line-soft)', opacity: 0.85 }}>
    <input type="checkbox" style={{ accentColor: 'var(--ink)' }}/>
    <StatePip state={r[1]} size={12}/>
    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r[0]}</span>
    <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em', textDecoration: 'line-through', textDecorationColor: 'rgba(0,0,0,0.2)', color: 'var(--ink-soft)' }}>{r[2]}</span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 99, background: r[4] + '1f', color: r[4], fontSize: 10.5, fontWeight: 500, justifySelf: 'flex-start' }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: r[4] }}/>{r[3]}
    </span>
    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r[5]}</span>
    <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{r[6]}</span>
    <Chip tone={r[7] === 'cerrado' ? 'moss' : 'solid'} style={{ padding: '1px 7px', justifySelf: 'flex-start' }}>{r[7]}</Chip>
    <IcRefresh size={13} color="var(--ink-mute)" style={{ cursor: 'pointer' }}/>
  </div>
);

const Estimates = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { label: 'Estimaciones' },
        ]}
        actions={<Btn size="sm" variant="secondary">Habilitar para esta company</Btn>}
      />

      <div style={{ padding: '32px 48px', maxWidth: 900 }}>
        <Eyebrow>Configurar estimaciones del equipo</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 44, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Estimar <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>esfuerzo.</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 540, lineHeight: 1.55 }}>
          Elige cómo el equipo asigna esfuerzo a cada issue. Esto alimenta velocity, cycle time y predicciones de IA.
        </p>

        {/* System pick */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            {
              name: 'Puntos · Fibonacci',
              desc: 'El estándar de scrum. Mide complejidad relativa, no horas exactas.',
              values: ['1', '2', '3', '5', '8', '13', '21'],
              selected: true,
              recommended: 'Equipos de ingeniería',
            },
            {
              name: 'Horas',
              desc: 'Para equipos donde el tiempo es la métrica natural (consultoría, finanzas).',
              values: ['1h', '2h', '4h', '8h', '16h', '24h+'],
              recommended: 'Equipos de contabilidad',
            },
            {
              name: 'T-shirt',
              desc: 'Para roadmapping de alto nivel. Bajo costo cognitivo.',
              values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
              recommended: 'Producto · planning',
            },
          ].map((s, i) => (
            <div key={i} style={{
              padding: 18, borderRadius: 8,
              background: s.selected ? 'var(--ink)' : 'var(--paper)',
              color: s.selected ? '#f0eadf' : 'var(--ink)',
              border: s.selected ? 'none' : '1px solid var(--ink-line-soft)',
              cursor: 'pointer',
              boxShadow: s.selected ? '0 0 0 4px rgba(217,119,87,0.15)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="tight" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>{s.name}</div>
                {s.selected && <IcCheck size={16} color="var(--terra)"/>}
              </div>
              <p style={{ fontSize: 12.5, margin: 0, color: s.selected ? 'rgba(240,234,223,0.7)' : 'var(--ink-mute)', lineHeight: 1.5 }}>{s.desc}</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: s.selected ? '1px solid rgba(240,234,223,0.15)' : '1px solid var(--ink-line-soft)' }}>
                {s.values.map(v => (
                  <span key={v} className="mono" style={{ padding: '2px 7px', borderRadius: 3, background: s.selected ? 'rgba(240,234,223,0.1)' : 'var(--bg-cream-2)', fontSize: 11, fontWeight: 500 }}>{v}</span>
                ))}
              </div>
              <div className="mono" style={{ marginTop: 10, fontSize: 10, color: s.selected ? 'var(--terra)' : 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ★ {s.recommended}
              </div>
            </div>
          ))}
        </div>

        {/* Stats card with current system */}
        <div style={{ marginTop: 32, padding: 22, background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
          <Eyebrow>Distribución actual · puntos Fibonacci</Eyebrow>
          <div className="tight" style={{ fontSize: 20, fontWeight: 500, marginTop: 6, letterSpacing: '-0.025em', marginBottom: 18 }}>
            247 issues estimados · promedio <span className="mono">4.2</span> pts
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {[['1', 28, 11], ['2', 42, 17], ['3', 71, 29], ['5', 58, 23], ['8', 32, 13], ['13', 12, 5], ['21', 4, 2]].map(([pts, count, pct], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4 }}>
                  <div style={{ width: '100%', height: pct * 2.5 + '%', background: i === 2 || i === 3 ? 'var(--terra)' : 'var(--ink-line)', borderRadius: 3, minHeight: 6 }}/>
                </div>
                <div className="mono tnum" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6 }}>{count}</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                  {pts} pt · {pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Importer = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { label: 'Importer' },
        ]}
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Migra desde otra herramienta · 15 minutos en promedio</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          Importer.
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-mute)', maxWidth: 600, marginBottom: 32, lineHeight: 1.55 }}>
          Trae tus issues, ciclos, miembros y comentarios. Mantenemos las referencias cruzadas y los IDs originales como alias.
        </p>

        {/* Sources */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'Jira', desc: 'Cloud y Server. Mapeamos epics → modules, sprints → cycles.', status: 'En curso', progress: 64, accent: 'var(--terra)', active: true },
            { name: 'Linear', desc: 'Direct API. Mantiene IDs como aliases para preservar enlaces externos.', status: 'Disponible', accent: 'var(--moss)' },
            { name: 'Asana', desc: 'Projects, sections, tasks. Subtareas como sub-issues.', status: 'Disponible', accent: 'var(--gold)' },
            { name: 'Trello', desc: 'Boards → companies. Listas → estados. Cards → issues.', status: 'Disponible', accent: 'var(--plum)' },
            { name: 'GitHub Issues', desc: 'Repos, labels, milestones. Sync bidireccional opcional.', status: 'Disponible', accent: 'var(--ink)' },
            { name: 'CSV / Excel', desc: 'Sube tu archivo y mapeamos columnas.', status: 'Disponible', accent: 'var(--ink-mute)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--paper)', padding: 18, borderRadius: 8,
              border: s.active ? '1.5px solid var(--terra)' : '1px solid var(--ink-line-soft)',
              boxShadow: s.active ? '0 0 0 4px rgba(217,119,87,0.1)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 40, height: 40, background: s.accent, color: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, fontFamily: 'Geist Mono' }}>
                  {s.name[0]}
                </span>
                <div style={{ flex: 1 }}>
                  <div className="tight" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.02em' }}>{s.name}</div>
                  {s.active ? (
                    <div className="mono" style={{ fontSize: 10, color: 'var(--terra-deep)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>● IMPORTANDO · {s.progress}%</div>
                  ) : (
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>{s.status}</div>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '12px 0', lineHeight: 1.5 }}>{s.desc}</p>
              {s.active && <Bar pct={s.progress} color="var(--terra)" height={4}/>}
              {!s.active && <Btn size="sm" variant="secondary" style={{ marginTop: 4 }}>Conectar</Btn>}
            </div>
          ))}
        </div>

        {/* Active import progress */}
        <div style={{ marginTop: 32, background: 'var(--ink)', color: '#f0eadf', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Eyebrow style={{ color: 'var(--terra)' }}>● MIGRACIÓN EN CURSO · JIRA → ATLAS</Eyebrow>
            <Btn size="sm" variant="ghost" style={{ color: '#f0eadf', borderColor: 'rgba(240,234,223,0.2)' }}>Pausar</Btn>
          </div>
          <div className="tightest tnum" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>
            1,847<span style={{ fontSize: 18, color: 'rgba(240,234,223,0.5)' }}> / 2,890</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(240,234,223,0.5)', marginTop: 4, letterSpacing: '0.1em' }}>ISSUES MIGRADAS · ~12 MIN RESTANTES</div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Miembros', 14, 14, true],
              ['Etiquetas', 47, 47, true],
              ['Estados → mapeados', 8, 8, true],
              ['Issues', 1847, 2890, false, 64],
              ['Comentarios', 0, '~ 4.2k', false, 0],
              ['Attachments', 0, '~ 380', false, 0],
            ].map(([k, done, total, complete, pct], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 100px', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(240,234,223,0.85)' }}>
                <span>{k}</span>
                <span style={{ height: 4, background: 'rgba(240,234,223,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: (complete ? 100 : (pct || 0)) + '%', height: '100%', background: complete ? 'var(--moss)' : 'var(--terra)' }}/>
                </span>
                <span className="mono tnum" style={{ textAlign: 'right', fontSize: 11, color: 'rgba(240,234,223,0.6)' }}>{done} / {total} {complete && '✓'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Integrations = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>

    <aside style={{ background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)', padding: '20px 12px' }}>
      <Eyebrow style={{ paddingLeft: 8, marginBottom: 12 }}>Workspace</Eyebrow>
      {['General', 'Miembros', 'Equipos', 'Estados', 'Etiquetas', 'Tipos de issue', 'Vistas', 'Webhooks', 'API tokens', 'Integraciones', 'Facturación'].map((s, i) => (
        <div key={s} style={{
          padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer', marginBottom: 1,
          background: i === 9 ? 'var(--paper)' : 'transparent',
          color: i === 9 ? 'var(--ink)' : 'var(--ink-soft)',
          fontWeight: i === 9 ? 500 : 400,
          borderLeft: i === 9 ? '2px solid var(--terra)' : '2px solid transparent',
          marginLeft: -2,
        }}>{s}</div>
      ))}
    </aside>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcSettings size={13}/>, label: 'Settings' },
          { label: 'Integraciones' },
        ]}
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>4 conectadas · 8 disponibles</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 44, fontWeight: 500, margin: '8px 0 12px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Conexiones con el resto de tu stack.
        </h1>

        <Eyebrow style={{ marginTop: 28, marginBottom: 12 }}>Conectadas</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { name: 'Slack', desc: 'Notificaciones en #fiscal-2026 y #ingenieria. Crea issues desde mensajes.', accent: '#611f69', members: '14 conectados', last: 'hace 2 min' },
            { name: 'GitHub', desc: '3 repos vinculados. PRs cierran issues automáticamente via "fixes ATL-247".', accent: '#1a1a1a', members: '6 repos', last: 'hace 14 min' },
            { name: 'Belvo', desc: 'Sync diario de movimientos bancarios. Crea issues de conciliación si hay discrepancias.', accent: '#0066ff', members: '3 cuentas', last: 'hoy 06:00' },
            { name: 'Google Calendar', desc: 'Tus ciclos y deadlines aparecen en tu calendario personal.', accent: '#4285f4', members: 'tu calendario', last: 'sync continuo' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 16, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                <span style={{ width: 36, height: 36, background: s.accent, color: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, fontFamily: 'Geist Mono' }}>
                  {s.name[0]}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="tight" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.02em' }}>{s.name}</span>
                    <Chip tone="moss" style={{ padding: '1px 6px', fontSize: 10 }}>● Conectado</Chip>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '4px 0 0', lineHeight: 1.5 }}>{s.desc}</p>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.members} · {s.last}</div>
                </div>
                <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
              </div>
            </div>
          ))}
        </div>

        <Eyebrow style={{ marginTop: 32, marginBottom: 12 }}>Disponibles</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            ['Microsoft Teams', '#5559a6'],
            ['Discord', '#5865f2'],
            ['Notion', '#1a1a1a'],
            ['Figma', '#f24e1e'],
            ['Linear', '#5e6ad2'],
            ['Sentry', '#362d59'],
            ['SAT (e.firma)', 'var(--terra-deep)'],
            ['SAP', '#0073e7'],
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 14, borderRadius: 6, border: '1px solid var(--ink-line-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 32, height: 32, background: s[1], color: '#fff', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                {s[0][0]}
              </span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{s[0]}</span>
              <Btn size="sm" variant="ghost" style={{ padding: '4px 10px' }}>+</Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Archives, Estimates, Importer, Integrations });
