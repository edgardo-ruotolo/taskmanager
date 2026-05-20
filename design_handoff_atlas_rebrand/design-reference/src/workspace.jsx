// Workspace-level pages: Workspaces list, Activity, Favorites, Drafts, Search.

const WorkspacesList = () => (
  <div className="ab" style={{ background: 'var(--bg-cream)', padding: 0, display: 'flex', flexDirection: 'column' }}>
    {/* Top minimal header */}
    <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ink-line-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IcLogo size={22}/>
        <span className="tight" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name="MR" color="var(--terra)" size={28}/>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Marina Ruiz</span>
        <IcChevDown size={12} color="var(--ink-mute)"/>
      </div>
    </div>

    <div style={{ flex: 1, padding: '48px 80px', maxWidth: 1080, margin: '0 auto', width: '100%' }}>
      <Eyebrow>Tus espacios de trabajo · 3 activos</Eyebrow>
      <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
        ¿A dónde <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>entramos hoy?</span>
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-mute)', maxWidth: 540 }}>
        Cada workspace es independiente — datos, miembros, ciclos, todo. Puedes pertenecer a varios.
      </p>

      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {[
          { name: 'Contadores Asociados', desc: 'Workspace principal · finanzas y operaciones', members: 14, role: 'Admin', last: 'hace 2 min', plan: 'Business', color: 'var(--ink)', ch: 'C', primary: true },
          { name: 'Grupo Cervantes', desc: 'Cliente externo · auditoría 2026', members: 6, role: 'Member', last: 'hace 4 h', plan: 'Pro', color: 'var(--terra)', ch: 'G' },
          { name: 'Fluentoc Internal', desc: 'Equipo de desarrollo', members: 28, role: 'Member', last: 'ayer', plan: 'Business', color: 'var(--moss)', ch: 'F' },
          { name: '+ Crear workspace', desc: 'Empieza desde cero', empty: true },
        ].map((w, i) => (
          <div key={i} style={{
            background: w.primary ? 'var(--ink)' : 'var(--paper)',
            color: w.primary ? '#f0eadf' : 'var(--ink)',
            padding: 22, borderRadius: 10,
            border: w.empty ? '1px dashed var(--ink-line)' : (w.primary ? 'none' : '1px solid var(--ink-line-soft)'),
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 14,
            opacity: w.empty ? 0.7 : 1,
            minHeight: 200,
            justifyContent: w.empty ? 'center' : 'space-between',
            alignItems: w.empty ? 'center' : 'flex-start',
            textAlign: w.empty ? 'center' : 'left',
          }}>
            {w.empty ? (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 8, background: 'var(--bg-cream-3)' }}>
                  <IcPlus size={20} color="var(--ink-mute)"/>
                </span>
                <div className="tight" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>{w.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{w.desc}</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                  <CompanyMark ch={w.ch} color={w.primary ? 'var(--terra)' : w.color} size={40}/>
                  {w.primary && <Chip tone="accent" style={{ padding: '2px 8px' }}>● ACTIVO</Chip>}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.025em' }}>{w.name}</div>
                  <div style={{ fontSize: 13, marginTop: 4, color: w.primary ? 'rgba(240,234,223,0.65)' : 'var(--ink-mute)', lineHeight: 1.5 }}>{w.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', paddingTop: 14, borderTop: w.primary ? '1px solid rgba(240,234,223,0.15)' : '1px solid var(--ink-line-soft)' }}>
                  <span className="mono" style={{ fontSize: 10.5, color: w.primary ? 'rgba(240,234,223,0.6)' : 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {w.role} · {w.members} miembros · {w.plan}
                  </span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--moss)' }}/>
                    <span className="mono" style={{ color: w.primary ? 'rgba(240,234,223,0.5)' : 'var(--ink-faint)' }}>{w.last}</span>
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Activity = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="activity"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[{ icon: <IcActivity size={14}/>, label: 'Actividad del workspace' }]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcFilter size={13}/>}>Filtros</Btn>
            <Btn size="sm" variant="secondary" icon={<IcCalendar size={13}/>}>Últimos 7 días</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Feed cronológico · 247 eventos esta semana</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Lo que pasó.
        </h1>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            ['Todo', 247, true],
            ['Issues', 134],
            ['Comentarios', 58],
            ['Páginas', 22],
            ['Ciclos', 9],
            ['Miembros', 8],
            ['Settings', 16],
          ].map(([label, count, active], i) => (
            <button key={i} style={{
              padding: '5px 12px', borderRadius: 99, border: 'none',
              background: active ? 'var(--ink)' : 'var(--paper)',
              color: active ? '#f0eadf' : 'var(--ink-soft)',
              fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: active ? 'none' : '1px solid var(--ink-line-soft)',
            }}>
              {label}<span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Day groups */}
        {[
          { day: 'Hoy · martes 18 mayo', events: [
            { time: '14:32', who: 'Marina Ruiz', wc: 'var(--terra)', verb: 'cambió estado de', tgt: 'ATL-263', tgt2: 'a in-progress', kind: 'state' },
            { time: '14:18', who: 'Javier Cano', wc: 'var(--moss)', verb: 'comentó en', tgt: 'ATL-247', kind: 'comment', preview: 'Falta el extracto de septiembre, te lo subo en la tarde' },
            { time: '13:55', who: 'Eli Tagle', wc: 'var(--plum)', verb: 'creó', tgt: '4 issues', kind: 'create', preview: 'en Cierre Fiscal Q3 · módulo Reportes' },
            { time: '11:20', who: 'Diana S.', wc: 'var(--gold)', verb: 'cerró', tgt: 'ATL-298', tgt2: '· Reporte mensual a CFO', kind: 'done' },
            { time: '10:08', who: 'Marina Ruiz', wc: 'var(--terra)', verb: 'creó la página', tgt: 'Postmortem · CFDI 4.0 SAT', kind: 'page' },
            { time: '09:32', who: 'Eli Tagle', wc: 'var(--plum)', verb: 'cerró el ciclo', tgt: 'Q3 W2 — Pólizas', kind: 'cycle' },
          ]},
          { day: 'Lunes 17 mayo', events: [
            { time: '17:45', who: 'Atlas IA', wc: 'var(--ink)', verb: 'detectó dependencia entre', tgt: 'ATL-247', tgt2: 'y ATL-285', kind: 'ai' },
            { time: '16:12', who: 'Javier Cano', wc: 'var(--moss)', verb: 'invitó a', tgt: 'sara.l@auditores.mx', tgt2: 'como Member', kind: 'invite' },
            { time: '11:45', who: 'Marina Ruiz', wc: 'var(--terra)', verb: 'editó las etiquetas del workspace', tgt: '— añadió "Fiscal-2026"', kind: 'settings' },
          ]},
          { day: 'Domingo 16 mayo', events: [
            { time: '20:14', who: 'Diana S.', wc: 'var(--gold)', verb: 'subió 3 archivos a', tgt: 'ATL-274', kind: 'attach' },
          ]},
        ].map((g, gi) => (
          <div key={gi} style={{ marginBottom: 32 }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--ink-line)' }}>
              {g.day}
            </div>
            <div style={{ position: 'relative', paddingLeft: 0 }}>
              <span style={{ position: 'absolute', left: 11, top: 18, bottom: 18, width: 1, background: 'var(--ink-line)' }}/>
              {g.events.map((e, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 60px', gap: 14, padding: '10px 0' }}>
                  <Avatar name={e.who.split(' ').map(x => x[0]).join('')} color={e.wc} size={22} style={{ zIndex: 1, position: 'relative' }}/>
                  <div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)', letterSpacing: '-0.005em' }}>
                      <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{e.who}</strong>{' '}
                      {e.kind === 'ai' && <Chip tone="accent" style={{ padding: '0 6px', fontSize: 10 }}>IA</Chip>}{' '}
                      {e.verb}{' '}
                      <span className="mono" style={{ background: 'var(--bg-cream-2)', padding: '1px 6px', borderRadius: 3, fontSize: 11, fontWeight: 500, color: 'var(--ink)' }}>{e.tgt}</span>
                      {e.tgt2 && <> {e.tgt2}</>}
                    </div>
                    {e.preview && (
                      <div style={{ marginTop: 6, padding: '6px 10px', background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 4, fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
                        "{e.preview}"
                      </div>
                    )}
                  </div>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', textAlign: 'right' }}>{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Favorites = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="favorites"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[{ icon: <IcStar size={14}/>, label: 'Favoritos' }]}
        actions={<Btn size="sm" variant="ghost" icon={<IcLayers size={13}/>}>Organizar en carpetas</Btn>}
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Tus marcados · 14 items</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Lo que <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>no quieres perder.</span>
        </h1>

        {/* Folders */}
        <Eyebrow style={{ marginBottom: 12 }}>Carpetas</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
          {[
            ['Cierre fiscal', 7, 'var(--terra)'],
            ['Auditoría 2026', 3, 'var(--moss)'],
            ['Plantillas', 2, 'var(--plum)'],
            ['Sin carpeta', 2, 'var(--ink-mute)'],
          ].map(([name, count, color], i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 14, borderRadius: 6, border: '1px solid var(--ink-line-soft)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <span style={{ width: 28, height: 28, background: color, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcStar size={12} color="#fff"/>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tight" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.015em' }}>{name}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{count} items</div>
              </div>
              <IcChevRight size={12} color="var(--ink-faint)"/>
            </div>
          ))}
        </div>

        <Eyebrow style={{ marginBottom: 12 }}>Todos</Eyebrow>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
          {[
            [<IcPages size={14}/>, 'Manual cierre fiscal · 2026', 'page', 'Cierre fiscal', 'hace 2h'],
            [<IcIssues size={14}/>, 'Vista · Mis bloqueos', 'view', 'Cierre fiscal', 'hace 6h'],
            [<IcModules size={14}/>, 'Módulo · Reportes ejecutivos', 'module', 'Cierre fiscal', 'ayer'],
            [<IcCompanies size={14}/>, 'Grupo Cervantes', 'company', 'Auditoría 2026', '2 días'],
            [<IcPages size={14}/>, 'Procedimientos de auditoría', 'page', 'Auditoría 2026', '3 días'],
            [<IcCycle size={14}/>, 'Q3 W3 — Conciliaciones', 'cycle', 'Cierre fiscal', '4 días'],
            [<IcIssues size={14}/>, 'Vista · Bugs sin resolver', 'view', 'Sin carpeta', '1 semana'],
            [<IcPages size={14}/>, 'Catálogo de cuentas — 2026', 'page', 'Plantillas', '1 semana'],
            [<IcPages size={14}/>, 'Pólizas tipo · plantillas', 'page', 'Plantillas', '2 semanas'],
            [<IcModules size={14}/>, 'Módulo · Migración ERP', 'module', 'Sin carpeta', '3 semanas'],
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 80px 140px 80px 20px', alignItems: 'center', gap: 14, padding: '11px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
              <span style={{ color: 'var(--ink-mute)' }}>{r[0]}</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{r[1]}</span>
              <Chip tone="solid" style={{ padding: '1px 8px', justifySelf: 'flex-start' }}>{r[2]}</Chip>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{r[3]}</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{r[4]}</span>
              <IcStar size={13} color="var(--gold)" style={{ fill: 'var(--gold)' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Drafts = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="drafts"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[{ icon: <IcDoc size={14}/>, label: 'Borradores' }]}
        actions={<Btn size="sm" variant="ghost">Eliminar todos</Btn>}
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Lo que dejaste a medias · 8 issues, 3 páginas, 2 comentarios</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Borradores.
        </h1>

        {/* Sections */}
        {[
          {
            title: 'Issues sin publicar',
            count: 8,
            color: 'var(--terra)',
            items: [
              ['Bug en validación de RFC con guiones', 'Backend · prio: high', 'hace 18 min', true],
              ['Investigar lentitud en reportes', 'Backend · sin etiqueta', 'hace 2h', false],
              ['Reunión kickoff con CIO de Grupo Cervantes', 'sin etiqueta · sin asignar', 'ayer', false],
            ],
          },
          {
            title: 'Páginas sin publicar',
            count: 3,
            color: 'var(--moss)',
            items: [
              ['Plan de migración ERP · v2', 'Cierre Fiscal Q3 · 412 palabras', 'hace 4h', true],
              ['Notas reunión KPMG', '0 palabras · vacía', 'ayer', false],
            ],
          },
          {
            title: 'Comentarios sin enviar',
            count: 2,
            color: 'var(--plum)',
            items: [
              ['Respuesta en ATL-285', '"Sí avancemos con los 13 que tenemos identificados…"', 'hace 35 min', true],
              ['Respuesta en Postmortem CFDI', '"Marina, no es por dejar fuera al equipo…"', 'hace 2 días', false],
            ],
          },
        ].map((s, si) => (
          <div key={si} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 4, height: 18, background: s.color, borderRadius: 99 }}/>
              <span className="tight" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>{s.title}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{s.count}</span>
            </div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
              {s.items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 80px 24px', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{it[0]}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 3, letterSpacing: '0.04em' }}>{it[1]}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{it[2]}</span>
                  {it[3] ? <Chip tone="accent" style={{ justifySelf: 'flex-start' }}>● Reciente</Chip> : <span/>}
                  <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SearchPage = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="search"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[{ icon: <IcSearch size={14}/>, label: 'Búsqueda' }]}
      />

      <div style={{ padding: '32px 48px' }}>
        {/* Big search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', background: 'var(--paper)', border: '1.5px solid var(--ink)', borderRadius: 10, boxShadow: '0 0 0 5px rgba(217,119,87,0.12)' }}>
          <IcSearch size={20}/>
          <span className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', flex: 1 }}>
            cierre fiscal conciliación santander
          </span>
          <Kbd>⌘K</Kbd>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>47 resultados · 0.18 s</span>
          <div style={{ flex: 1 }}/>
          {[['Todo', 47, true], ['Issues', 22], ['Pages', 9], ['Comentarios', 12], ['Archivos', 4]].map(([l, n, a], i) => (
            <button key={i} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: a ? 'var(--ink)' : 'transparent', color: a ? '#f0eadf' : 'var(--ink-mute)', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {l}<span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{n}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { kind: 'issue', state: 'in-progress', id: 'ATL-247', title: 'Conciliación bancaria — Banco Santander, agosto', preview: '...los 14 movimientos sin identificar... extracto de septiembre, te lo subo en la tarde...', updated: 'hace 35 min', ctx: 'Cierre Fiscal Q3 · MR' },
            { kind: 'page', id: 'PG-008', title: 'Manual de cierre fiscal · 2026 · sección 3.1', preview: '...para cada cuenta bancaria activa, el responsable debe descargar el extracto y realizar la conciliación...', updated: 'hace 4h', ctx: 'Capítulo 3 · Cuentas bancarias' },
            { kind: 'comment', id: 'CMT-2847', title: 'Comentario en ATL-247', preview: '"Marina, falta el extracto del 28 de agosto que pediste. Ya lo solicité al banco — me lo mandan en la tarde..."', updated: 'hace 35 min', ctx: 'Javier Cano' },
            { kind: 'issue', state: 'done', id: 'ATL-198', title: 'Conciliación bancaria — Santander, julio 2026', preview: '...cerrado con 0 movimientos sin identificar. Documentación subida al folder fiscal...', updated: 'hace 1 mes', ctx: 'Q3 W1 · MR' },
            { kind: 'file', id: 'FILE-014', title: 'extracto-santander-ago.pdf', preview: 'PDF · 2.4 MB · adjunto a ATL-247', updated: 'hace 5 días', ctx: 'subido por Marina' },
          ].map((r, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 16, border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {r.kind === 'issue' && <StatePip state={r.state} size={13}/>}
                {r.kind === 'page' && <IcPages size={13} color="var(--ink-mute)"/>}
                {r.kind === 'comment' && <IcComment size={13} color="var(--ink-mute)"/>}
                {r.kind === 'file' && <IcDoc size={13} color="var(--ink-mute)"/>}
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r.id}</span>
                <Chip tone="solid" style={{ padding: '1px 6px', fontSize: 10 }}>{r.kind}</Chip>
                <span className="mono" style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--ink-faint)' }}>{r.updated}</span>
              </div>
              <div className="tight" style={{ fontSize: 15.5, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {r.title.split('Santander').map((p, j, a) => (
                  <React.Fragment key={j}>
                    {p}
                    {j < a.length - 1 && <span style={{ background: 'var(--terra-soft)', padding: '0 4px', borderRadius: 2, color: 'var(--terra-deep)' }}>Santander</span>}
                  </React.Fragment>
                ))}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.55, letterSpacing: '-0.005em' }}>{r.preview}</p>
              <div className="mono" style={{ marginTop: 8, fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>↳ {r.ctx}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { WorkspacesList, Activity, Favorites, Drafts, SearchPage });
