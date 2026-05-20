// Public space (read-only shared view) + Deploy boards list.

const PublicSpace = () => (
  <div className="ab" style={{ background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column' }}>
    {/* Public header */}
    <div style={{ padding: '14px 32px', borderBottom: '1px solid var(--ink-line)', background: 'var(--paper)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IcLogo size={20}/>
        <span className="tight" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.04em' }}>Atlas</span>
      </div>
      <span style={{ fontSize: 12, color: 'var(--ink-mute)', borderLeft: '1px solid var(--ink-line)', paddingLeft: 14 }}>
        vista pública compartida por <strong style={{ color: 'var(--ink)' }}>Contadores Asociados</strong>
      </span>
      <span style={{ flex: 1 }}/>
      <Chip tone="solid" icon={<IcEye size={11}/>}>● Read-only</Chip>
      <Btn size="sm" variant="secondary" icon={<IcLink size={13}/>}>Copiar link</Btn>
      <Btn size="sm" icon={<IcArrow size={13}/>}>Iniciar sesión</Btn>
    </div>

    <div style={{ flex: 1, overflow: 'auto', padding: '40px 64px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <Eyebrow>Vista pública · "Cierre Fiscal Q3 · seguimiento"</Eyebrow>
      <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 12px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
        Cierre Fiscal Q3 — <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>seguimiento.</span>
      </h1>
      <p style={{ fontSize: 14.5, color: 'var(--ink-mute)', maxWidth: 640, lineHeight: 1.55 }}>
        Compartido por Marina Ruiz para el equipo de auditoría externa de KPMG. Acceso a 32 issues abiertos y el burndown del ciclo activo. Sin permisos de edición ni comentarios.
      </p>

      {/* Embed metric block */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Issues abiertos', 32, 'visibles aquí'],
          ['Scope completado', '68%', '17 de 25'],
          ['Cycle time medio', '3.2 d', 'últimos 30 d'],
          ['Días restantes', 13, 'cierre 30 sept'],
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--paper)', padding: 16, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <Eyebrow>{k[0]}</Eyebrow>
            <div className="tightest tnum" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.04em', marginTop: 4 }}>{k[1]}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 4, letterSpacing: '0.05em' }}>{k[2]}</div>
          </div>
        ))}
      </div>

      {/* Public board */}
      <div style={{ marginTop: 32 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Board · solo lectura</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { state: 'todo', name: 'Pendiente', count: 12, items: [['ATL-251', 'high', 'Declaración IVA — borrador', 'JC'], ['ATL-292', 'urgent', 'Bug · CFDI 4.0 SAT', 'MR']] },
            { state: 'in-progress', name: 'En progreso', count: 11, items: [['ATL-247', 'urgent', 'Conciliación bancaria — Santander', 'MR'], ['ATL-274', 'high', 'Revisar conciliaciones audit', 'EL'], ['ATL-315', 'medium', 'UI · tabla movimientos', 'DS']] },
            { state: 'started', name: 'Revisión', count: 4, items: [['ATL-263', 'medium', 'Migrar nómina al módulo RRHH', 'MR']] },
            { state: 'done', name: 'Cerrado', count: 17, items: [['ATL-298', 'medium', 'Reporte mensual a CFO', 'EL'], ['+16 más', null, '', null]] },
          ].map((col, i) => (
            <div key={i} style={{ background: 'var(--bg-cream-2)', padding: 12, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
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
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, letterSpacing: '-0.005em', lineHeight: 1.4 }}>{it[2]}</div>
                    {it[3] && <Avatar name={it[3]} color={it[3] === 'MR' ? 'var(--terra)' : it[3] === 'JC' ? 'var(--moss)' : it[3] === 'EL' ? 'var(--plum)' : 'var(--gold)'} size={16} style={{ marginTop: 6 }}/>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: 18, background: 'var(--ink)', color: '#f0eadf', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
        <IcEye size={20} color="var(--terra)"/>
        <div style={{ flex: 1 }}>
          <div className="tight" style={{ fontSize: 14, fontWeight: 500 }}>Vista pública firmada por Marina Ruiz</div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(240,234,223,0.6)', marginTop: 4 }}>token expira el 14 oct · auto-refresh activo · IP allowlist: kpmg.partner</div>
        </div>
        <Btn size="sm" variant="accent">Solicitar acceso completo</Btn>
      </div>
    </div>
  </div>
);

const DeployBoards = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="company-active"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { label: 'Deploy boards' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Crear deploy</Btn>}
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Vistas públicas publicadas · 4 activas</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Boards públicos.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 600, lineHeight: 1.55 }}>
          Publica vistas como URLs públicas para compartir con clientes, auditores externos o stakeholders sin cuenta. Permisos granulares por vista.
        </p>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            {
              name: 'Cierre Fiscal Q3 · seguimiento',
              url: 'atlas.work/p/8f3b9c-public',
              views: 247, lastView: 'hace 12 min',
              audience: 'KPMG · 5 personas con allowlist',
              created: '12 sept', expires: '14 oct',
              status: 'active', accent: 'var(--terra)',
            },
            {
              name: 'Reportes ejecutivos · CFO',
              url: 'atlas.work/p/2f1e7c-cfo',
              views: 89, lastView: 'ayer',
              audience: 'Comité ejecutivo · 3 personas',
              created: '01 sept', expires: 'No expira',
              status: 'active', accent: 'var(--plum)',
            },
            {
              name: 'Auditoría 2026 — progreso',
              url: 'atlas.work/p/4a7c8d-audit',
              views: 156, lastView: 'hace 3 h',
              audience: 'Público — quien tenga el link',
              created: '20 ago', expires: '31 dic',
              status: 'active', accent: 'var(--moss)',
            },
            {
              name: 'ERP migration · roadmap (LEGACY)',
              url: 'atlas.work/p/1c5e8f-erp-old',
              views: 12, lastView: 'hace 1 mes',
              audience: 'Público — sin restricción',
              created: '01 jun', expires: 'No expira',
              status: 'paused', accent: 'var(--ink-mute)',
            },
          ].map((b, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 18, borderRadius: 8, border: '1px solid var(--ink-line-soft)', position: 'relative', overflow: 'hidden', opacity: b.status === 'paused' ? 0.7 : 1 }}>
              <span style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 3, background: b.accent }}/>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div className="tight" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>{b.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IcLink size={11}/>{b.url}
                  </div>
                </div>
                <Chip tone={b.status === 'active' ? 'moss' : 'solid'}>{b.status === 'active' ? '● Activo' : '⏸ Pausado'}</Chip>
              </div>

              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Audiencia</div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 3, letterSpacing: '-0.005em' }}>{b.audience}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Expira</div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 3, letterSpacing: '-0.005em' }}>{b.expires}</div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-line-soft)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <div className="tight tnum" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{b.views}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>VISITAS</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>última: {b.lastView}</div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  <Btn size="sm" variant="ghost" icon={<IcEye size={12}/>}>Preview</Btn>
                  <Btn size="sm" variant="ghost" icon={<IcLink size={12}/>}>Copiar</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <h2 className="tight" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 36, marginBottom: 12 }}>Visitas · últimos 30 días</h2>
        <div style={{ background: 'var(--paper)', padding: 18, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
          <svg viewBox="0 0 800 140" style={{ width: '100%', height: 140 }}>
            <defs>
              <linearGradient id="dbFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--terra)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--terra)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[40, 80].map(y => <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="var(--ink-line-soft)"/>)}
            <path d="M 0 90 L 27 85 L 54 92 L 81 70 L 108 80 L 135 60 L 162 50 L 189 65 L 216 45 L 243 55 L 270 35 L 297 50 L 324 40 L 351 25 L 378 35 L 405 50 L 432 30 L 459 45 L 486 20 L 513 35 L 540 25 L 567 15 L 594 30 L 621 20 L 648 35 L 675 25 L 702 10 L 729 20 L 756 5 L 783 15" stroke="var(--terra)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 0 90 L 27 85 L 54 92 L 81 70 L 108 80 L 135 60 L 162 50 L 189 65 L 216 45 L 243 55 L 270 35 L 297 50 L 324 40 L 351 25 L 378 35 L 405 50 L 432 30 L 459 45 L 486 20 L 513 35 L 540 25 L 567 15 L 594 30 L 621 20 L 648 35 L 675 25 L 702 10 L 729 20 L 756 5 L 783 15 L 783 140 L 0 140 Z" fill="url(#dbFill)"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { PublicSpace, DeployBoards });
