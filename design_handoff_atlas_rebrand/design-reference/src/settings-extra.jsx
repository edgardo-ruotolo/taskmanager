// Settings extras: Labels, Webhooks, API Tokens, Teams, Members.

const settingsNav = (active) => (
  <aside style={{ background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)', padding: '20px 12px' }}>
    <Eyebrow style={{ paddingLeft: 8, marginBottom: 12 }}>Workspace</Eyebrow>
    {['General', 'Miembros', 'Equipos', 'Estados', 'Etiquetas', 'Tipos de issue', 'Vistas', 'Webhooks', 'API tokens', 'Integraciones', 'Facturación'].map((s, i) => (
      <div key={s} style={{
        padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer', marginBottom: 1,
        background: i === active ? 'var(--paper)' : 'transparent',
        color: i === active ? 'var(--ink)' : 'var(--ink-soft)',
        fontWeight: i === active ? 500 : 400,
        borderLeft: i === active ? '2px solid var(--terra)' : '2px solid transparent',
        marginLeft: -2, letterSpacing: '-0.005em',
      }}>{s}</div>
    ))}
  </aside>
);

const Labels = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>
    {settingsNav(4)}

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcSettings size={13}/>, label: 'Settings' },
          { label: 'Etiquetas' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Nueva etiqueta</Btn>}
      />

      <div style={{ padding: '32px 48px', maxWidth: 900 }}>
        <Eyebrow>12 etiquetas · 4 con sub-etiquetas</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 40, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Etiquetas.
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-mute)', maxWidth: 540, marginBottom: 24, lineHeight: 1.55 }}>
          Categoriza los issues con tags de color. Puedes anidar etiquetas para crear taxonomías — ej. "Fiscal/IVA" o "Backend/API".
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 13, marginBottom: 20 }}>
          <IcSearch size={13} color="var(--ink-mute)"/>
          <span style={{ color: 'var(--ink-mute)' }}>Buscar etiquetas…</span>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { name: 'Backend', color: '#5d7256', count: 94, children: [['API', 47], ['DB', 28], ['Workers', 19]] },
            { name: 'Frontend', color: '#d97757', count: 38, children: [['UI', 24], ['UX', 14]] },
            { name: 'Fiscal', color: '#3d4a6b', count: 54, children: [['IVA', 22], ['ISR', 18], ['Retenciones', 14]] },
            { name: 'Bug', color: '#c54a3a', count: 37 },
            { name: 'Infra', color: '#9a7d52', count: 23 },
            { name: 'Docs', color: '#6b6660', count: 19 },
            { name: 'QA', color: '#6b4a5c', count: 14 },
            { name: 'Research', color: '#c79e3d', count: 11 },
            { name: 'Auditoría', color: '#5d7256', count: 9, children: [['KPMG', 5], ['Interna', 4]] },
          ].map((l, i) => (
            <React.Fragment key={l.name}>
              <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 80px 100px 24px', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                {l.children ? <IcChevDown size={12} color="var(--ink-mute)"/> : <span/>}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color }}/>
                  <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{l.name}</span>
                </span>
                <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{l.count} issues</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l.color}</span>
                <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
              </div>
              {l.children && l.children.map((c, j) => (
                <div key={c[0]} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 80px 100px 24px', alignItems: 'center', gap: 14, padding: '10px 16px 10px 32px', borderTop: '1px solid var(--ink-line-soft)', background: 'rgba(0,0,0,0.015)' }}>
                  <span style={{ color: 'var(--ink-faint)', fontFamily: 'Geist Mono', fontSize: 11 }}>↳</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, opacity: 0.7 }}/>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{l.name}<span style={{ color: 'var(--ink-faint)' }}>/</span>{c[0]}</span>
                  </span>
                  <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{c[1]} issues</span>
                  <span/>
                  <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Webhooks = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>
    {settingsNav(7)}

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcSettings size={13}/>, label: 'Settings' },
          { label: 'Webhooks' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Crear webhook</Btn>}
      />

      <div style={{ padding: '32px 48px', maxWidth: 1000 }}>
        <Eyebrow>4 webhooks activos · 0 con fallos</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 40, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Webhooks.
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-mute)', maxWidth: 540, marginBottom: 24, lineHeight: 1.55 }}>
          Atlas envía un POST a tu endpoint cuando ocurren eventos. Firmamos cada request con HMAC-SHA256 — verifica la firma antes de procesar.
        </p>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { name: 'Slack notify · #fiscal-2026', url: 'https://hooks.slack.com/services/T01AB.../B01CD.../xy...', events: ['issue.created', 'issue.updated', 'comment.created'], status: 'healthy', last: '200 OK · hace 2 min', count: 8472 },
            { name: 'Internal dashboard', url: 'https://internal.contadores.mx/api/atlas-webhook', events: ['issue.closed', 'cycle.closed'], status: 'healthy', last: '200 OK · hace 14 min', count: 348 },
            { name: 'Pager · oncall escalation', url: 'https://api.pagerduty.com/integration/atlas/in', events: ['issue.priority_urgent'], status: 'healthy', last: '200 OK · ayer', count: 12 },
            { name: 'Belvo · sync trigger', url: 'https://api.belvo.com/atlas/sync', events: ['recurring.triggered'], status: 'healthy', last: '200 OK · hoy 06:00', count: 47 },
          ].map((w, i) => (
            <div key={i} style={{ padding: 18, borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--moss)' }}/>
                    <span className="tight" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.02em' }}>{w.name}</span>
                    <Chip tone="moss" style={{ padding: '1px 6px' }}>● healthy</Chip>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 6, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>POST {w.url}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {w.events.map(e => (
                      <Chip key={e} tone="solid" style={{ padding: '1px 7px', fontSize: 10 }}><span className="mono">{e}</span></Chip>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div className="tight tnum" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{w.count.toLocaleString()}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>entregados</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--moss)', marginTop: 4 }}>{w.last}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deliveries log */}
        <h2 className="tight" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 36, marginBottom: 12 }}>Últimas entregas</h2>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, fontFamily: 'Geist Mono, monospace' }}>
          {[
            ['14:32:18', '200', 'POST · issue.updated · ATL-263', '142ms', 'var(--moss)'],
            ['14:18:04', '200', 'POST · comment.created · ATL-247', '88ms', 'var(--moss)'],
            ['13:55:11', '200', 'POST · issue.created · ATL-298..301', '237ms', 'var(--moss)'],
            ['11:20:42', '200', 'POST · issue.closed · ATL-298', '94ms', 'var(--moss)'],
            ['10:08:00', '200', 'POST · page.created · PG-052', '112ms', 'var(--moss)'],
            ['09:32:55', '200', 'POST · cycle.closed · Q3-W2', '156ms', 'var(--moss)'],
          ].map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 50px 1fr 80px', alignItems: 'center', gap: 14, padding: '8px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)', fontSize: 11 }}>
              <span style={{ color: 'var(--ink-faint)' }}>{d[0]}</span>
              <span style={{ padding: '1px 6px', borderRadius: 3, background: d[4] + '1f', color: d[4], fontWeight: 600 }}>{d[1]}</span>
              <span style={{ color: 'var(--ink-soft)' }}>{d[2]}</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>{d[3]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ApiTokens = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>
    {settingsNav(8)}

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcSettings size={13}/>, label: 'Settings' },
          { label: 'API tokens' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Generar token</Btn>}
      />

      <div style={{ padding: '32px 48px', maxWidth: 1000 }}>
        <Eyebrow>5 tokens activos · permisos granulares</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 40, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          API tokens.
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-mute)', maxWidth: 540, marginBottom: 24, lineHeight: 1.55 }}>
          Tokens personales para acceder a la API de Atlas. Cada uno tiene scope limitado. Rotamos tokens automáticamente cada 90 días si lo activas.
        </p>

        {/* Just-created banner */}
        <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: 18, borderRadius: 8, marginBottom: 24 }}>
          <Eyebrow style={{ color: 'var(--terra)' }}>● TOKEN RECIÉN CREADO · CÓPIALO AHORA</Eyebrow>
          <div className="mono" style={{ marginTop: 12, padding: '14px 16px', background: 'rgba(240,234,223,0.08)', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>atl_pat_8f3b9c2e4d1a7e6b5c8d2f4e8a9b3c7d_v2</span>
            <Btn size="sm" variant="accent" icon={<IcLink size={12}/>}>Copiar</Btn>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(240,234,223,0.6)', marginTop: 10, lineHeight: 1.5 }}>
            Por seguridad, este token solo se muestra una vez. Si lo pierdes, regenera otro.
          </p>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
          {[
            { name: 'Personal dev token', preview: 'atl_pat_8f3b9c…2f4e', scopes: ['read:issues', 'write:issues', 'read:pages'], created: '14 sept 2026', expires: 'En 90 días · 12 dic', lastUsed: 'hace 2 h', rotation: true, new: true },
            { name: 'CI/CD · GitHub Actions', preview: 'atl_pat_4a7c8d…9b3e', scopes: ['read:issues', 'write:issues', 'read:cycles'], created: '02 ago 2026', expires: 'En 47 días', lastUsed: 'hace 8 min', rotation: true },
            { name: 'Slack bot · readonly', preview: 'atl_pat_2f1e7c…6d8a', scopes: ['read:*'], created: '15 jul 2026', expires: 'No expira', lastUsed: 'hace 14 min', rotation: false },
            { name: 'Reportes · scheduled', preview: 'atl_pat_8b3c9e…1f5d', scopes: ['read:analytics', 'read:cycles'], created: '01 jul 2026', expires: 'No expira', lastUsed: 'ayer 06:00', rotation: false },
            { name: 'Belvo integration', preview: 'atl_pat_1c5e8f…4a2b', scopes: ['write:issues', 'read:recurring'], created: '14 jun 2026', expires: 'En 12 días · 30 sept', lastUsed: 'hoy 06:00', rotation: true, expiring: true },
          ].map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 240px 130px 130px 90px 24px', alignItems: 'center', gap: 14, padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IcKey size={13} color="var(--ink-mute)"/>
                  <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{t.name}</span>
                  {t.new && <Chip tone="accent" style={{ padding: '0 6px', fontSize: 9.5 }}>NUEVO</Chip>}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>{t.preview}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {t.scopes.map(s => (
                  <Chip key={s} tone="solid" style={{ padding: '1px 6px', fontSize: 10 }}><span className="mono">{s}</span></Chip>
                ))}
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{t.created}</span>
              <span className="mono" style={{ fontSize: 11, color: t.expiring ? '#c54a3a' : 'var(--ink-mute)' }}>{t.expires}</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{t.lastUsed}</span>
              <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Teams = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>
    {settingsNav(2)}

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[{ icon: <IcSettings size={13}/>, label: 'Settings' }, { label: 'Equipos' }]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Nuevo equipo</Btn>}
      />

      <div style={{ padding: '32px 48px', maxWidth: 1000 }}>
        <Eyebrow>5 equipos · 28 miembros totales</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 40, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Equipos.
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            {
              name: 'Finance Ops', desc: 'Cierres, conciliaciones, declaraciones fiscales.',
              members: ['MR', 'JC', 'EL', 'DS'], colors: ['var(--terra)', 'var(--moss)', 'var(--plum)', 'var(--gold)'],
              count: 8, color: 'var(--terra)', lead: 'Marina R.',
              companies: ['Cierre Q3', 'Cervantes 2026', 'Audit KPMG'],
            },
            {
              name: 'Engineering', desc: 'Plataforma, integraciones, automatizaciones.',
              members: ['AB', 'KL', 'PR', 'DS'], colors: ['var(--ink)', 'var(--terra)', 'var(--moss)', 'var(--gold)'],
              count: 14, color: 'var(--moss)', lead: 'Andrés B.',
              companies: ['ERP Migration', 'Cierre Q3'],
            },
            {
              name: 'Audit Team', desc: 'Soporte a auditores externos · KPMG, Deloitte.',
              members: ['EL', 'SR', 'TR'], colors: ['var(--plum)', 'var(--terra)', 'var(--moss)'],
              count: 5, color: 'var(--plum)', lead: 'Eli T.',
              companies: ['Audit KPMG', 'Audit 2025'],
            },
            {
              name: 'Product · Design', desc: 'Diseño de producto, research, hand-off.',
              members: ['DS', 'MA'], colors: ['var(--gold)', 'var(--terra)'],
              count: 3, color: 'var(--gold)', lead: 'Diana S.',
              companies: ['Cierre Q3', 'ERP Migration'],
            },
          ].map((t, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 18, borderRadius: 8, border: '1px solid var(--ink-line-soft)', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 3, background: t.color }}/>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div className="tight" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>{t.name}</div>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '4px 0 0', lineHeight: 1.5 }}>{t.desc}</p>
                </div>
                <span className="tight tnum" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em', color: t.color }}>{t.count}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--ink-line-soft)' }}>
                <AvStack people={t.members.map((m, j) => ({ name: m, color: t.colors[j] }))} size={22}/>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Lead</div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.lead}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Companies</div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.companies.length}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                {t.companies.map(c => <Chip key={c} tone="solid" style={{ padding: '1px 7px', fontSize: 10 }}>{c}</Chip>)}
              </div>
            </div>
          ))}
        </div>

        {/* Members list */}
        <h2 className="tight" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 36, marginBottom: 12 }}>Todos los miembros · 14</h2>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
          {[
            ['Marina Ruiz', 'marina.ruiz@atlas.work', 'Admin', ['Finance Ops'], 'var(--terra)', 'EN LÍNEA'],
            ['Javier Cano', 'javier.cano@atlas.work', 'Member', ['Finance Ops', 'Engineering'], 'var(--moss)', 'EN LÍNEA'],
            ['Eli Tagle', 'eli.tagle@atlas.work', 'Admin', ['Finance Ops', 'Audit Team'], 'var(--plum)', 'EN LÍNEA'],
            ['Diana Silva', 'diana.silva@atlas.work', 'Member', ['Product · Design', 'Finance Ops'], 'var(--gold)', 'AUSENTE · 12 min'],
            ['Andrés Beltrán', 'andres.beltran@atlas.work', 'Member', ['Engineering'], 'var(--ink)', 'EN LÍNEA'],
            ['Sara López', 'sara.lopez@kpmg.partner', 'Guest', ['Audit Team'], 'var(--terra)', 'INVITADA · pendiente'],
          ].map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 1fr 120px 24px', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
              <Avatar name={m[0].split(' ').map(x => x[0]).join('')} color={m[4]} size={28}/>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{m[0]}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{m[1]}</div>
              </div>
              <Chip tone={m[2] === 'Admin' ? 'accent' : (m[2] === 'Guest' ? 'solid' : 'solid')} style={{ padding: '1px 8px', justifySelf: 'flex-start' }}>{m[2]}</Chip>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {m[3].map(t => <Chip key={t} tone="solid" style={{ padding: '1px 7px', fontSize: 10 }}>{t}</Chip>)}
              </div>
              <span className="mono" style={{ fontSize: 10, color: m[5].startsWith('EN LÍNEA') ? 'var(--moss)' : (m[5].startsWith('INVITADA') ? 'var(--terra-deep)' : 'var(--ink-mute)'), letterSpacing: '0.08em' }}>
                <span style={{ marginRight: 4 }}>●</span>{m[5]}
              </span>
              <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Labels, Webhooks, ApiTokens, Teams });
