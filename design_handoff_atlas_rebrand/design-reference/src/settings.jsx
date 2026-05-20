// Settings, Profile, Inbox/Notifications, Stickies, plus settings sub-pages.

const Settings = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>

    {/* Settings nav */}
    <aside style={{ background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)', padding: '20px 12px', overflow: 'auto' }}>
      <Eyebrow style={{ paddingLeft: 8, marginBottom: 12 }}>Workspace</Eyebrow>
      {['General', 'Miembros', 'Equipos', 'Estados', 'Etiquetas', 'Tipos de issue', 'Vistas', 'Webhooks', 'API tokens', 'Integraciones', 'Facturación'].map((s, i) => (
        <div key={s} style={{
          padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer', marginBottom: 1,
          background: i === 3 ? 'var(--paper)' : 'transparent',
          color: i === 3 ? 'var(--ink)' : 'var(--ink-soft)',
          fontWeight: i === 3 ? 500 : 400,
          borderLeft: i === 3 ? '2px solid var(--terra)' : '2px solid transparent',
          marginLeft: -2,
          letterSpacing: '-0.005em',
        }}>{s}</div>
      ))}

      <Eyebrow style={{ paddingLeft: 8, marginTop: 24, marginBottom: 12 }}>Cuenta</Eyebrow>
      {['Perfil', 'Notificaciones', 'Apariencia', 'Seguridad', 'Idioma'].map(s => (
        <div key={s} style={{ padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer', color: 'var(--ink-soft)', letterSpacing: '-0.005em' }}>{s}</div>
      ))}
    </aside>

    {/* Right pane — managing states */}
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcSettings size={14}/>, label: 'Settings' },
          { label: 'Estados' },
        ]}
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Workspace settings · Contadores Asociados</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 44, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Estados del workflow.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginTop: 8, maxWidth: 580, lineHeight: 1.55 }}>
          Los estados controlan el flujo de cada issue. Agrupados en 5 categorías. Arrastra para reordenar dentro de una categoría — el primero es el default al crear.
        </p>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { group: 'Backlog', states: [['Backlog', 'backlog']], color: '#a8a299' },
            { group: 'Unstarted', states: [['Todo', 'todo'], ['Triage', 'todo']], color: '#6b6660' },
            { group: 'Started', states: [['In progress', 'in-progress'], ['In review', 'started'], ['Blocked', 'in-progress']], color: 'var(--terra)' },
            { group: 'Completed', states: [['Done', 'done'], ['Released', 'done']], color: 'var(--moss)' },
            { group: 'Cancelled', states: [['Cancelled', 'cancelled'], ['Duplicate', 'cancelled']], color: '#c54a3a' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--ink-line-soft)', background: 'var(--bg-cream)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: g.color }}/>
                <span className="tight" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.015em' }}>{g.group}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{g.states.length}</span>
                <span style={{ flex: 1 }}/>
                <Btn size="sm" variant="ghost" icon={<IcPlus size={12}/>}>Estado</Btn>
              </div>
              {g.states.map((s, j) => (
                <div key={j} style={{ display: 'grid', gridTemplateColumns: '20px 28px 1fr 100px 80px 28px', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: j === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                  <IcMore size={12} color="var(--ink-faint)" style={{ cursor: 'grab' }}/>
                  <StatePip state={s[1]} size={14}/>
                  <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{s[0]}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{Math.floor(Math.random() * 80 + 5)} issues</span>
                  <Chip tone={j === 0 && i === 1 ? 'accent' : 'solid'} style={{ justifySelf: 'flex-start' }}>{j === 0 && i === 1 ? '★ Default' : 'Visible'}</Chip>
                  <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Profile = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcUser size={14}/>, label: 'Cuenta' },
          { label: 'Perfil' },
        ]}
      />

      <div style={{ padding: '0 48px', flex: 1 }}>
        {/* Hero banner */}
        <div style={{ position: 'relative', height: 180, background: 'linear-gradient(135deg, var(--ink) 0%, var(--terra-deep) 100%)', borderRadius: 0, margin: '-1px -48px 0' }}>
          <svg style={{ position: 'absolute', right: 80, top: -40, opacity: 0.08 }} width="280" height="280" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14.5" stroke="#f0eadf" strokeWidth="0.5"/>
            <path d="M5 16a11 11 0 0 1 22 0" stroke="#f0eadf" strokeWidth="0.5"/>
          </svg>
          <div style={{ position: 'absolute', top: 32, left: 48, color: '#f0eadf' }}>
            <Eyebrow style={{ color: 'rgba(240,234,223,0.6)' }}>Marina Ruiz · Contadora titular</Eyebrow>
            <div className="serif" style={{ fontStyle: 'italic', fontSize: 22, marginTop: 8, color: 'var(--terra-soft)' }}>
              "Cierro mejor mis libros que el reloj a las 6:00."
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: -52, paddingLeft: 8 }}>
          <Avatar name="MR" color="var(--terra)" size={120}/>
          <div style={{ paddingBottom: 16, flex: 1 }}>
            <h1 className="tightest" style={{ fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>Marina Ruiz Cervantes</h1>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              marina.ruiz@atlas.work · CDMX, MÉXICO · UTC-6 · 3 workspaces
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 16 }}>
            <Btn size="sm" variant="secondary">Editar perfil</Btn>
            <Btn size="sm" icon={<IcSettings size={13}/>} variant="ghost"/>
          </div>
        </div>

        {/* Stats + about */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, marginTop: 32, paddingBottom: 48 }}>
          <div>
            <Eyebrow style={{ marginBottom: 12 }}>Actividad · últimos 90 días</Eyebrow>

            {/* Heatmap */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 3, marginBottom: 16 }}>
              {Array.from({ length: 91 }, (_, i) => {
                const v = Math.random();
                return <div key={i} style={{ aspectRatio: '1/1', background: v < 0.2 ? 'var(--bg-cream-3)' : v < 0.5 ? 'rgba(217,119,87,0.3)' : v < 0.8 ? 'rgba(217,119,87,0.6)' : 'var(--terra)', borderRadius: 2 }}/>;
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>Menos</span>
              {[0.2, 0.4, 0.6, 0.8, 1].map(v => (
                <span key={v} style={{ width: 12, height: 12, background: v <= 0.2 ? 'var(--bg-cream-3)' : v <= 0.5 ? 'rgba(217,119,87,0.3)' : v <= 0.8 ? 'rgba(217,119,87,0.6)' : 'var(--terra)', borderRadius: 2 }}/>
              ))}
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>Más</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', marginLeft: 'auto' }}>184 issues cerradas · racha más larga: 27 días</span>
            </div>

            <div style={{ marginTop: 28 }}>
              <Eyebrow style={{ marginBottom: 12 }}>Trabajo en curso</Eyebrow>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
                {[
                  ['ATL-247', 'in-progress', 'Conciliación bancaria — Santander', 'urgent', 'Hoy'],
                  ['ATL-263', 'started', 'Migrar nómina al módulo de RRHH', 'medium', 'Sep 22'],
                  ['ATL-274', 'in-progress', 'Revisar conciliaciones — auditoría', 'high', 'Hoy'],
                  ['ATL-292', 'todo', 'Bug · CFDI 4.0 rechazado por SAT', 'urgent', 'Hoy'],
                ].map((r, i) => (
                  <div key={r[0]} style={{ display: 'grid', gridTemplateColumns: '20px 80px 1fr 24px 80px', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                    <StatePip state={r[1]} size={13}/>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r[0]}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{r[2]}</span>
                    <PrioDot level={r[3]} size={11}/>
                    <span className="mono" style={{ fontSize: 11, color: r[4] === 'Hoy' ? '#c54a3a' : 'var(--ink-mute)' }}>{r[4]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Eyebrow style={{ marginBottom: 12 }}>Acerca de</Eyebrow>
            <div style={{ background: 'var(--paper)', padding: 18, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)', letterSpacing: '-0.005em' }}>
                Contadora titular con foco en cierres fiscales y migraciones de ERP. 8 años llevando los libros de Grupo Cervantes; ahora también de Contadores Asociados.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--ink-line-soft)' }}>
                {[
                  ['Rol', 'Workspace admin', null],
                  ['Equipos', '2 · Finance Ops, Auditoría', null],
                  ['Cuenta desde', '12 ene 2024', null],
                  ['MFA', 'Activo · App authenticator', 'var(--moss)'],
                ].map(([k, v, color], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, letterSpacing: '-0.005em' }}>
                    <span style={{ color: 'var(--ink-mute)' }}>{k}</span>
                    <span style={{ fontWeight: 500, color: color || 'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <Eyebrow style={{ marginBottom: 12 }}>Stats · 2026</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Issues cerrados', '184'],
                  ['Páginas escritas', '47'],
                  ['Comentarios', '892'],
                  ['Ciclos liderados', '12'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ background: 'var(--paper)', padding: 14, borderRadius: 6, border: '1px solid var(--ink-line-soft)' }}>
                    <div className="tightest tnum" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.035em' }}>{v}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</div>
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

const Inbox = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 360px 1fr', height: '100%' }}>
    <Sidebar active="inbox"/>

    {/* Notification list */}
    <aside style={{ background: 'var(--paper)', borderRight: '1px solid var(--ink-line)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 18, borderBottom: '1px solid var(--ink-line-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="tight" style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.025em', margin: 0 }}>Inbox <span className="mono" style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 400 }}>· 12</span></h2>
          <Btn size="sm" variant="ghost" icon={<IcCheck size={13}/>}>Marcar todo</Btn>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {['Todo', 'Sin leer · 12', 'Menciones', 'Asignaciones'].map((t, i) => (
            <button key={t} style={{ padding: '4px 10px', borderRadius: 99, border: 'none', background: i === 1 ? 'var(--ink)' : 'var(--bg-cream-2)', color: i === 1 ? '#f0eadf' : 'var(--ink-mute)', fontSize: 11.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {[
          { dot: 'unread', icon: <IcComment size={13}/>, who: 'Javier Cano', evt: 'comentó en ATL-247', preview: '"Falta el extracto de septiembre, te lo subo en la tarde"', time: '35 min', selected: true },
          { dot: 'unread', icon: <IcSparkle size={13} color="var(--terra)"/>, who: 'Atlas IA', evt: 'detectó dependencia entre ATL-247 y ATL-285', preview: 'La integración Belvo podría reducir el trabajo manual…', time: '1 h' },
          { dot: 'unread', icon: <IcFlag size={13}/>, who: 'Eli Tagle', evt: 'te asignó ATL-274', preview: 'Revisar conciliaciones — auditoría externa · urgent', time: '2 h' },
          { dot: 'unread', icon: <IcCheck size={13} color="var(--moss)"/>, who: 'Diana S.', evt: 'cerró ATL-298', preview: 'Reporte mensual a CFO · agosto', time: '4 h' },
          { dot: 'unread', icon: <IcLink size={13}/>, who: 'Marina Ruiz', evt: 'enlazó tu PR #847', preview: 'Manual cierre fiscal · sección 3.1', time: '5 h' },
          { dot: 'read', icon: <IcCycle size={13}/>, who: 'System', evt: 'el ciclo Q3 W2 fue cerrado', preview: '21/21 issues completados · velocidad +12%', time: 'ayer' },
          { dot: 'read', icon: <IcComment size={13}/>, who: 'Eli Tagle', evt: '@menciono a ti en Postmortem CFDI 4.0', preview: '"@marina necesitamos tu opinión sobre…"', time: 'ayer' },
          { dot: 'read', icon: <IcBell size={13}/>, who: 'System', evt: 'Issue vencido', preview: 'ATL-201 estuvo 3 días sin actualización', time: '2 días' },
        ].map((n, i) => (
          <div key={i} style={{
            padding: '14px 18px', borderBottom: '1px solid var(--ink-line-soft)', cursor: 'pointer',
            background: n.selected ? 'var(--bg-cream)' : 'transparent',
            borderLeft: n.selected ? '3px solid var(--terra)' : '3px solid transparent',
            paddingLeft: n.selected ? 15 : 18,
            opacity: n.dot === 'read' ? 0.7 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {n.dot === 'unread' && <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--terra)' }}/>}
              <span style={{ color: 'var(--ink-mute)' }}>{n.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{n.who}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{n.evt}</span>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--ink-faint)' }}>{n.time}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', paddingLeft: 23, lineHeight: 1.45, letterSpacing: '-0.005em' }}>{n.preview}</div>
          </div>
        ))}
      </div>
    </aside>

    {/* Selected detail */}
    <div style={{ background: 'var(--bg-cream)', overflow: 'auto', padding: '32px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-mute)', fontSize: 12 }}>
        <IcComment size={13}/>
        <span>Comentario en</span>
        <span className="mono" style={{ background: 'var(--paper)', padding: '2px 6px', borderRadius: 3, fontSize: 11, color: 'var(--ink)' }}>ATL-247</span>
      </div>

      <h1 className="tightest" style={{ fontSize: 32, fontWeight: 500, margin: '12px 0 6px', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
        Conciliación bancaria — Banco Santander, agosto 2026
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StatePip state="in-progress" size={12}/>
        <span style={{ fontSize: 13, fontWeight: 500 }}>In progress</span>
        <PrioDot level="urgent" size={10}/>
        <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Urgent · vence hoy 18:00</span>
      </div>

      <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
        <Avatar name="JC" color="var(--moss)" size={36}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em' }}>Javier Cano</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>hace 35 min · @marina</span>
          </div>
          <div style={{ marginTop: 8, padding: 16, background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 6, fontSize: 14, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
            Marina, falta el extracto del 28 de agosto que pediste. Ya lo solicité al banco —— me lo mandan en la tarde y te lo subo apenas llegue. Mientras tanto, los 13 movimientos que sí identificamos del periodo están en el archivo de la conciliación. ¿Avanzamos con esos?
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn size="sm" variant="primary">Responder</Btn>
            <Btn size="sm" variant="secondary">Ir al issue</Btn>
            <Btn size="sm" variant="ghost">Marcar leído</Btn>
            <Btn size="sm" variant="ghost" icon={<IcArchive size={13}/>}/>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 18, background: 'var(--ink)', color: '#f0eadf', borderRadius: 8, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <IcSparkle size={18} color="var(--terra)" style={{ flexShrink: 0, marginTop: 2 }}/>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--terra)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>RESPUESTA SUGERIDA · IA</div>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'rgba(240,234,223,0.85)' }}>
            "Perfecto, Javier. Sí avancemos con los 13 que tenemos identificados. Cuando llegue el del 28, lo añadimos al match. Estimo cerrar la conciliación mañana 10am."
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn size="sm" variant="accent">Usar respuesta</Btn>
            <Btn size="sm" variant="ghost" style={{ color: '#f0eadf' }}>Otra sugerencia</Btn>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Stickies = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="stickies"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[{ icon: <IcSticky size={14}/>, label: 'Notas rápidas' }]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Nueva nota</Btn>}
      />

      <div style={{ padding: '32px 40px' }}>
        <Eyebrow>Tus notas privadas · 23 en total</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Lo que <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>todavía</span> no es un issue.
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { color: '#f6e8c1', rot: -1.5, title: 'Llamada con CFO', body: '· Pregunta sobre cierre Q3\n· Modulo de reportes\n· Pedir ejemplos a Eli', date: '14 sept' },
            { color: '#e8d4d4', rot: 1, title: 'Pendientes lunes', body: '◯ Llamar a Belvo\n◯ Revisar PR de Javier\n● Mandar plantilla a Diana', date: '15 sept' },
            { color: '#dde5d8', rot: -0.8, title: 'Ideas para Q4', body: '— Automatizar pólizas tipo\n— Dashboard auditoría\n— Onboarding nuevo equipo', date: '15 sept' },
            { color: '#e0d8e6', rot: 1.4, title: 'Bug raro CFDI', body: 'Cuando el RFC tiene espacios al final, el SAT lo rechaza. Validar antes de timbrar.', date: '16 sept' },
            { color: '#f0e6d3', rot: -0.6, title: 'Conversación café', body: '"Si pudiéramos saber el flujo de caja en tiempo real, cambiaría todo."\n— Eli, ayer', date: '16 sept' },
            { color: '#dee0e6', rot: 1.2, title: 'Plantilla SAT', body: 'Carpeta /docs/sat/2026/plantillas_v3/cfdi_global', date: '17 sept' },
            { color: '#e6d4c8', rot: -1.2, title: 'Recordatorio', body: 'Renovar e.firma antes del 28 oct', date: '17 sept' },
            { color: '#d4e2e0', rot: 0.5, title: 'Cita audit. ext.', body: 'Mar 23 · 10:00\nSala virtual · meet.atlas/audit\nLlevar libro mayor', date: 'hoy' },
          ].map((n, i) => (
            <div key={i} style={{
              background: n.color, padding: 18, borderRadius: 4, minHeight: 200,
              transform: `rotate(${n.rot}deg)`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column', cursor: 'pointer',
              transition: 'transform .2s',
            }}>
              <div className="tight" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>{n.title}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'rgba(26,26,26,0.8)', flex: 1, whiteSpace: 'pre-line', letterSpacing: '-0.005em' }}>{n.body}</div>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(26,26,26,0.5)', marginTop: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{n.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Settings, Profile, Inbox, Stickies });
