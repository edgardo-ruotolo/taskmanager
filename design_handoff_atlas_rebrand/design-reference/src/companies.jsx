// Companies list + Company Settings.

const CompaniesList = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="companies"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[{ icon: <IcCompanies size={14}/>, label: 'Companies' }]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcFilter size={13}/>}>Filtrar</Btn>
            <Btn size="sm" icon={<IcPlus size={13}/>}>Nueva company</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Tus proyectos · 4 activos, 2 archivados</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          Companies.
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-mute)', marginTop: 8, maxWidth: 600 }}>
          Cada company es un proyecto con su propia jerarquía de issues, ciclos y módulos. Comparten el sidebar de Pages, Inbox y Analytics.
        </p>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            {
              name: 'Cierre Fiscal Q3', tag: 'cierre-q3', desc: 'Consolidación contable trimestral. Conciliaciones, declaraciones, reportes ejecutivos.',
              members: 8, issues: { open: 47, total: 247 }, lead: 'MR', leadc: 'var(--terra)', accent: 'var(--terra)', status: 'Active', kind: 'Interno',
              cycles: 3, due: '30 sept',
            },
            {
              name: 'ERP Migration · Fase 2', tag: 'erp-fase2', desc: 'Migración de SAP legacy a Odoo 17. Nómina, tesorería, módulo fiscal.',
              members: 6, issues: { open: 53, total: 89 }, lead: 'JC', leadc: 'var(--moss)', accent: 'var(--moss)', status: 'Active', kind: 'Interno',
              cycles: 5, due: '15 oct',
            },
            {
              name: 'Auditoría externa · KPMG', tag: 'audit-kpmg', desc: 'Soporte documental y operativo al equipo de auditoría externa.',
              members: 5, issues: { open: 4, total: 32 }, lead: 'EL', leadc: 'var(--plum)', accent: 'var(--plum)', status: 'Closing', kind: 'Cliente',
              cycles: 2, due: '14 oct',
            },
            {
              name: 'Grupo Cervantes 2026', tag: 'cervantes-26', desc: 'Cliente externo · cuentas, fiscal, asesoría continua.',
              members: 4, issues: { open: 18, total: 156 }, lead: 'MR', leadc: 'var(--terra)', accent: 'var(--gold)', status: 'Active', kind: 'Cliente',
              cycles: 8, due: 'continuo',
            },
            {
              name: 'Auditoría 2025', tag: 'audit-25', desc: 'Cerrado en febrero 2026. Documentación archivada.',
              members: 3, issues: { open: 0, total: 89 }, lead: 'EL', leadc: 'var(--plum)', accent: 'var(--ink-mute)', status: 'Archived', kind: 'Cliente',
              cycles: 4, due: '— cerrado',
            },
            {
              name: 'Migración inicial · 2024', tag: 'migration-24', desc: 'Cerrado · primer setup del workspace.',
              members: 2, issues: { open: 0, total: 47 }, lead: 'JC', leadc: 'var(--moss)', accent: 'var(--ink-mute)', status: 'Archived', kind: 'Interno',
              cycles: 0, due: '— cerrado',
            },
          ].map((c, i) => (
            <div key={i} style={{
              background: 'var(--paper)', padding: 20, borderRadius: 8,
              border: '1px solid var(--ink-line-soft)',
              opacity: c.status === 'Archived' ? 0.6 : 1,
              position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 3, background: c.accent }}/>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CompanyMark ch={c.name[0]} color={c.accent} size={36}/>
                  <div>
                    <div className="tight" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 3, letterSpacing: '0.08em' }}>
                      /{c.tag} · {c.kind}
                    </div>
                  </div>
                </div>
                <Chip tone={c.status === 'Active' ? 'moss' : (c.status === 'Closing' ? 'accent' : 'solid')}>
                  {c.status === 'Active' && '● ' + c.status}
                  {c.status === 'Closing' && '◐ ' + c.status}
                  {c.status === 'Archived' && '◆ ' + c.status}
                </Chip>
              </div>

              <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: '12px 0', lineHeight: 1.55, letterSpacing: '-0.005em' }}>{c.desc}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 14, borderTop: '1px solid var(--ink-line-soft)' }}>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Issues</div>
                  <div className="tight tnum" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>{c.issues.open}<span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>/{c.issues.total}</span></div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ciclos</div>
                  <div className="tight tnum" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>{c.cycles}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cierre</div>
                  <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{c.due}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AvStack people={Array.from({ length: c.members }, (_, j) => ({ name: ['MR', 'JC', 'EL', 'DS', 'AB'][j % 5], color: ['var(--terra)', 'var(--moss)', 'var(--plum)', 'var(--gold)', 'var(--ink)'][j % 5] }))} size={22} max={3}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CompanySettings = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="company-active"/>

    <aside style={{ background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)', padding: '20px 12px' }}>
      <Eyebrow style={{ paddingLeft: 8, marginBottom: 12 }}>Cierre Fiscal Q3</Eyebrow>
      {['General', 'Miembros', 'Estados', 'Etiquetas', 'Vistas', 'Workflows', 'Estimaciones', 'Permisos', 'Notificaciones', 'Importer', 'Webhooks', 'Archivar'].map((s, i) => (
        <div key={s} style={{
          padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer', marginBottom: 1,
          background: i === 0 ? 'var(--paper)' : 'transparent',
          color: i === 0 ? 'var(--ink)' : 'var(--ink-soft)',
          fontWeight: i === 0 ? 500 : 400,
          borderLeft: i === 0 ? '2px solid var(--terra)' : '2px solid transparent',
          marginLeft: -2,
          letterSpacing: '-0.005em',
        }}>{s}</div>
      ))}
    </aside>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { icon: <IcSettings size={13}/>, label: 'Settings' },
        ]}
      />

      <div style={{ padding: '32px 48px', maxWidth: 900 }}>
        <Eyebrow>Company · ajustes generales</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 40, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Cierre Fiscal Q3
        </h1>

        {/* General form */}
        {[
          { label: 'Nombre', value: 'Cierre Fiscal Q3', mono: false },
          { label: 'Identificador', value: 'CFQ3', mono: true, hint: 'Aparece en los IDs de issues — ej. CFQ3-247.' },
          { label: 'Descripción', value: 'Consolidación contable del trimestre. Conciliaciones, declaraciones, reportes ejecutivos para CFO y auditoría.', textarea: true },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{f.label}</label>
            <div style={{ marginTop: 6, padding: f.textarea ? 14 : '11px 14px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 14, fontFamily: f.mono ? 'Geist Mono, monospace' : 'inherit', minHeight: f.textarea ? 80 : 'auto' }}>
              {f.value}
            </div>
            {f.hint && <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 6, letterSpacing: '-0.005em' }}>{f.hint}</div>}
          </div>
        ))}

        {/* Two-column toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 8 }}>
          {[
            ['Cycles habilitados', 'Sprints o iteraciones de tiempo fijo', true],
            ['Modules', 'Agrupación temática de issues', true],
            ['Estimations', 'Asigna esfuerzo a cada issue (puntos u horas)', true],
            ['Time tracking', 'Registra tiempo gastado por miembro', true],
            ['Intake / Triage', 'Buzón para issues externos antes de aceptar', false],
            ['Customer feedback', 'Vincular feedback de clientes', false],
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{t[0]}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{t[1]}</div>
              </div>
              <span style={{ width: 32, height: 18, borderRadius: 99, background: t[2] ? 'var(--ink)' : 'var(--ink-line)', position: 'relative', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: 2, left: t[2] ? 16 : 2, width: 14, height: 14, borderRadius: 99, background: '#fff', transition: 'left .15s' }}/>
              </span>
            </div>
          ))}
        </div>

        {/* Lead + visibility */}
        <div style={{ marginTop: 24, padding: 18, background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
          <Eyebrow>Lead & visibilidad</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 6 }}>Lead</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-cream)', border: '1px solid var(--ink-line)', borderRadius: 6 }}>
                <Avatar name="MR" color="var(--terra)" size={24}/>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>Marina Ruiz</span>
                <IcChevDown size={12} color="var(--ink-mute)" style={{ marginLeft: 'auto' }}/>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 6 }}>Visibilidad</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[['Pública', false], ['Workspace', true], ['Privada', false]].map(([l, a], i) => (
                  <button key={i} style={{ flex: 1, padding: '10px 12px', background: a ? 'var(--ink)' : 'var(--paper)', color: a ? '#f0eadf' : 'var(--ink-soft)', border: '1px solid', borderColor: a ? 'var(--ink)' : 'var(--ink-line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ marginTop: 24, padding: 18, border: '1px solid rgba(197,74,58,0.3)', borderRadius: 8, background: 'rgba(197,74,58,0.04)' }}>
          <Eyebrow style={{ color: '#c54a3a' }}>● ZONA DESTRUCTIVA</Eyebrow>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Archivar company</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Los datos permanecen pero la company queda en solo-lectura.</div>
            </div>
            <Btn size="sm" variant="destructive">Archivar</Btn>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(197,74,58,0.2)' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#c54a3a' }}>Eliminar permanentemente</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Borra todos los issues, ciclos y attachments. No reversible.</div>
            </div>
            <Btn size="sm" variant="destructive" style={{ background: '#c54a3a', color: '#fff', borderColor: '#c54a3a' }}>Eliminar</Btn>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { CompaniesList, CompanySettings });
