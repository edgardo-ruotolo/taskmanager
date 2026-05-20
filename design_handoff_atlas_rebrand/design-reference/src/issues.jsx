// Issues: spreadsheet/list view, kanban board, calendar view.

const ISSUES = [
  ['ATL-247', 'in-progress', 'urgent', 'Conciliación bancaria — Santander', 'Backend', '#5d7256', 'Q3 W3', 'Sep 18', 'MR', 'var(--terra)', 8, 5, 'Reportes'],
  ['ATL-251', 'todo', 'high', 'Declaración IVA — preparar borrador', 'Fiscal', '#d97757', 'Q3 W3', 'Sep 18', 'JC', 'var(--moss)', 3, 1, 'Reportes'],
  ['ATL-263', 'started', 'medium', 'Migrar nómina al módulo de RRHH', 'Infra', '#3d4a6b', 'ERP Migration', 'Sep 22', 'MR', 'var(--terra)', 12, 8, 'Migration'],
  ['ATL-274', 'in-progress', 'high', 'Revisar conciliaciones — auditoría', 'QA', '#9a7d52', 'Auditoría', 'Sep 18', 'EL', 'var(--plum)', 5, 3, 'Audit'],
  ['ATL-281', 'backlog', 'low', 'Documentar proceso de pagos a vendors', 'Docs', '#6b6660', '—', 'Sep 30', 'DS', 'var(--gold)', 2, 0, ''],
  ['ATL-285', 'in-progress', 'medium', 'Integración Belvo · cuentas pendientes', 'Backend', '#5d7256', 'ERP Migration', 'Sep 25', 'JC', 'var(--moss)', 4, 2, 'Migration'],
  ['ATL-292', 'todo', 'urgent', 'Bug · CFDI 4.0 rechazado por SAT', 'Bug', '#c54a3a', 'Q3 W3', 'Sep 18', 'MR', 'var(--terra)', 1, 0, ''],
  ['ATL-298', 'done', 'medium', 'Reporte mensual a CFO · agosto', 'Frontend', '#d97757', 'Q3 W2', '✓ Sep 12', 'EL', 'var(--plum)', 3, 3, 'Reportes'],
  ['ATL-301', 'cancelled', 'low', 'Migrar dashboard antiguo a v3', 'Frontend', '#d97757', '—', '— Sep 14', 'DS', 'var(--gold)', 5, 0, ''],
  ['ATL-307', 'backlog', 'medium', 'Estructura de carpetas fiscal 2027', 'Docs', '#6b6660', '—', '—', 'JC', 'var(--moss)', 1, 0, ''],
  ['ATL-312', 'started', 'high', 'Test de carga · sistema de facturación', 'Backend', '#5d7256', 'Q3 W3', 'Sep 19', 'MR', 'var(--terra)', 6, 4, 'Reportes'],
  ['ATL-315', 'in-progress', 'medium', 'UI · nueva tabla de movimientos', 'Frontend', '#d97757', 'Q3 W3', 'Sep 20', 'DS', 'var(--gold)', 4, 2, ''],
];

const IssuesList = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="issues"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Contadores Asoc.' },
          { label: 'Cierre Fiscal Q3' },
          { icon: <IcIssues size={14}/>, label: 'Issues' },
        ]}
        viewSwitcher={
          <div style={{ display: 'inline-flex', padding: 3, background: 'var(--bg-cream-2)', borderRadius: 6, border: '1px solid var(--ink-line-soft)' }}>
            {[['List', IcList, true], ['Board', IcGrid], ['Calendar', IcCalendar], ['Gantt', IcGantt]].map(([t, I, a], i) => (
              <button key={t} style={{ padding: '5px 10px', border: 'none', background: a ? 'var(--paper)' : 'transparent', borderRadius: 4, fontSize: 12, fontWeight: 500, color: a ? 'var(--ink)' : 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', cursor: 'pointer', boxShadow: a ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                <I size={12}/>{t}
              </button>
            ))}
          </div>
        }
        actions={
          <Btn size="sm" icon={<IcPlus size={13}/>}>Issue</Btn>
        }
      />

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line-soft)' }}>
        <span className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em' }}>Issues <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>· 247</span></span>
        <div style={{ flex: 1 }}/>
        <Btn size="sm" variant="ghost" icon={<IcFilter size={13}/>}>Filtros · 3</Btn>
        <Btn size="sm" variant="ghost" icon={<IcSort size={13}/>}>Prioridad</Btn>
        <Btn size="sm" variant="ghost" icon={<IcLayers size={13}/>}>Agrupar · Estado</Btn>
        <div style={{ width: 1, height: 18, background: 'var(--ink-line)', margin: '0 4px' }}/>
        <Btn size="sm" variant="ghost" icon={<IcSparkle size={13} color="var(--terra)"/>}>Pregunta a IA</Btn>
      </div>

      {/* Active filter chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 24px', background: 'var(--bg-cream-2)', borderBottom: '1px solid var(--ink-line-soft)' }}>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>FILTROS</span>
        {[
          ['Estado', 'In progress, Todo, Started'],
          ['Ciclo', 'Q3 W3, ERP Migration'],
          ['Asignado a', 'Tú'],
        ].map(([k, v]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px 3px 4px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 4, fontSize: 11 }}>
            <span className="mono" style={{ color: 'var(--ink-mute)', padding: '0 4px' }}>{k}:</span>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</span>
            <IcX size={10} color="var(--ink-mute)" style={{ cursor: 'pointer' }}/>
          </span>
        ))}
        <button style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--ink-mute)', cursor: 'pointer', fontFamily: 'inherit' }}>Limpiar</button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--paper)' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '28px 32px 80px 1fr 110px 120px 110px 60px 36px 100px 60px', alignItems: 'center', gap: 10, padding: '8px 24px', borderBottom: '1px solid var(--ink-line)', background: 'var(--bg-cream)', position: 'sticky', top: 0, zIndex: 1 }}>
          <span/><span/>
          {['ID', 'Título', 'Etiqueta', 'Ciclo', 'Vence', 'Est.', 'P', 'Sub-issues', 'Asignado'].map(c => (
            <span key={c} className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c}</span>
          ))}
        </div>

        {/* Group: In progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px 8px', background: 'var(--bg-cream)' }}>
          <IcChevDown size={14} color="var(--ink-mute)"/>
          <StatePip state="in-progress" size={14}/>
          <span className="tight" style={{ fontSize: 14, fontWeight: 500 }}>In progress</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>4</span>
          <span style={{ flex: 1 }}/>
          <Btn size="sm" variant="ghost" icon={<IcPlus size={12}/>}>Añadir</Btn>
        </div>
        {ISSUES.filter(r => r[1] === 'in-progress').map(r => <IssueRow key={r[0]} r={r}/>)}

        {/* Group: Started */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px 8px', background: 'var(--bg-cream)' }}>
          <IcChevDown size={14} color="var(--ink-mute)"/>
          <StatePip state="started" size={14}/>
          <span className="tight" style={{ fontSize: 14, fontWeight: 500 }}>Started</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>2</span>
        </div>
        {ISSUES.filter(r => r[1] === 'started').map(r => <IssueRow key={r[0]} r={r}/>)}

        {/* Group: Todo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px 8px', background: 'var(--bg-cream)' }}>
          <IcChevDown size={14} color="var(--ink-mute)"/>
          <StatePip state="todo" size={14}/>
          <span className="tight" style={{ fontSize: 14, fontWeight: 500 }}>Todo</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>2</span>
        </div>
        {ISSUES.filter(r => r[1] === 'todo').map(r => <IssueRow key={r[0]} r={r}/>)}

        {/* Group: Backlog (collapsed) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px 8px', background: 'var(--bg-cream)' }}>
          <IcChevRight size={14} color="var(--ink-mute)"/>
          <StatePip state="backlog" size={14}/>
          <span className="tight" style={{ fontSize: 14, fontWeight: 500 }}>Backlog</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>187</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px 8px', background: 'var(--bg-cream)' }}>
          <IcChevRight size={14} color="var(--ink-mute)"/>
          <StatePip state="done" size={14}/>
          <span className="tight" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-mute)' }}>Done</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>52</span>
        </div>
      </div>
    </div>
  </div>
);

const IssueRow = ({ r }) => {
  const [id, state, prio, title, label, labelColor, cycle, due, av, avc, subTotal, subDone] = r;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '28px 32px 80px 1fr 110px 120px 110px 60px 36px 100px 60px', alignItems: 'center', gap: 10, padding: '9px 24px', borderTop: '1px solid var(--ink-line-soft)', fontSize: 13 }}>
      <input type="checkbox" style={{ accentColor: 'var(--ink)' }}/>
      <StatePip state={state} size={13}/>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{id}</span>
      <span style={{ fontWeight: 500, letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 99, background: labelColor + '1f', color: labelColor, fontSize: 11, fontWeight: 500, justifySelf: 'flex-start' }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: labelColor }}/>{label}
      </span>
      <Chip tone="solid" icon={<IcCycle size={10}/>} style={{ justifySelf: 'flex-start' }}>{cycle}</Chip>
      <span className="mono" style={{ fontSize: 11, color: due.startsWith('Sep 18') ? '#c54a3a' : (due.startsWith('✓') ? 'var(--moss)' : (due === '—' ? 'var(--ink-faint)' : 'var(--ink-mute)')) }}>{due}</span>
      <PrioDot level={prio} size={11}/>
      <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--ink-mute)', justifySelf: 'flex-start' }}>{subDone}/{subTotal}</span>
      <span style={{ justifySelf: 'flex-end' }}><Avatar name={av} color={avc} size={22}/></span>
      <IcMore size={14} color="var(--ink-faint)" style={{ justifySelf: 'flex-end', cursor: 'pointer' }}/>
    </div>
  );
};

// Kanban board
const IssuesKanban = () => {
  const cols = [
    { state: 'backlog', name: 'Backlog', count: 187, dim: true },
    { state: 'todo', name: 'Todo', count: 32 },
    { state: 'in-progress', name: 'In progress', count: 18, accent: true },
    { state: 'started', name: 'In review', count: 7 },
    { state: 'done', name: 'Done · esta semana', count: 23, dim: true },
  ];

  const ByState = {
    'backlog': [['ATL-281', 'low', 'Documentar proceso de pagos a vendors', 'Docs', '#6b6660', 'DS', 'var(--gold)', 2, 0], ['ATL-307', 'medium', 'Estructura carpetas fiscal 2027', 'Docs', '#6b6660', 'JC', 'var(--moss)', 1, 0]],
    'todo': [['ATL-251', 'high', 'Declaración IVA — preparar borrador para revisión', 'Fiscal', '#d97757', 'JC', 'var(--moss)', 3, 1], ['ATL-292', 'urgent', 'Bug · CFDI 4.0 rechazado por SAT', 'Bug', '#c54a3a', 'MR', 'var(--terra)', 1, 0]],
    'in-progress': [['ATL-247', 'urgent', 'Conciliación bancaria — Santander agosto', 'Backend', '#5d7256', 'MR', 'var(--terra)', 8, 5], ['ATL-274', 'high', 'Revisar conciliaciones — auditoría externa', 'QA', '#9a7d52', 'EL', 'var(--plum)', 5, 3], ['ATL-285', 'medium', 'Integración Belvo · cuentas pendientes', 'Backend', '#5d7256', 'JC', 'var(--moss)', 4, 2], ['ATL-315', 'medium', 'UI · nueva tabla de movimientos contables', 'Frontend', '#d97757', 'DS', 'var(--gold)', 4, 2]],
    'started': [['ATL-263', 'medium', 'Migrar nómina al módulo de RRHH', 'Infra', '#3d4a6b', 'MR', 'var(--terra)', 12, 8], ['ATL-312', 'high', 'Test de carga · sistema de facturación', 'Backend', '#5d7256', 'MR', 'var(--terra)', 6, 4]],
    'done': [['ATL-298', 'medium', 'Reporte mensual a CFO · agosto', 'Frontend', '#d97757', 'EL', 'var(--plum)', 3, 3]],
  };

  return (
    <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
      <Sidebar active="issues"/>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          crumbs={[
            { icon: <IcCompanies size={13}/>, label: 'Contadores Asoc.' },
            { label: 'Cierre Fiscal Q3' },
            { icon: <IcIssues size={14}/>, label: 'Issues' },
          ]}
          viewSwitcher={
            <div style={{ display: 'inline-flex', padding: 3, background: 'var(--bg-cream-2)', borderRadius: 6, border: '1px solid var(--ink-line-soft)' }}>
              {[['List', IcList], ['Board', IcGrid, true], ['Calendar', IcCalendar], ['Gantt', IcGantt]].map(([t, I, a], i) => (
                <button key={t} style={{ padding: '5px 10px', border: 'none', background: a ? 'var(--paper)' : 'transparent', borderRadius: 4, fontSize: 12, fontWeight: 500, color: a ? 'var(--ink)' : 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', cursor: 'pointer', boxShadow: a ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                  <I size={12}/>{t}
                </button>
              ))}
            </div>
          }
          actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Issue</Btn>}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line-soft)' }}>
          <span className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em' }}>Issues <span style={{ color: 'var(--ink-mute)', fontWeight: 400 }}>· board view</span></span>
          <div style={{ flex: 1 }}/>
          <Btn size="sm" variant="ghost" icon={<IcFilter size={13}/>}>Filtros</Btn>
          <Btn size="sm" variant="ghost" icon={<IcSort size={13}/>}>Prioridad</Btn>
          <AvStack people={[{ name: 'MR', color: 'var(--terra)' }, { name: 'JC', color: 'var(--moss)' }, { name: 'EL', color: 'var(--plum)' }, { name: 'DS', color: 'var(--gold)' }]} size={24}/>
        </div>

        {/* Columns */}
        <div style={{ flex: 1, display: 'flex', gap: 14, padding: 20, overflow: 'auto', background: 'var(--bg-cream-2)' }}>
          {cols.map(col => (
            <div key={col.state} style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', opacity: col.dim ? 0.7 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: col.accent ? 'var(--ink)' : 'var(--paper)', color: col.accent ? '#f0eadf' : 'var(--ink)', borderRadius: '8px 8px 0 0', border: '1px solid', borderColor: col.accent ? 'var(--ink)' : 'var(--ink-line-soft)', borderBottom: 'none' }}>
                <StatePip state={col.state} size={12}/>
                <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', flex: 1 }}>{col.name}</span>
                <span className="mono" style={{ fontSize: 10.5, color: col.accent ? 'rgba(240,234,223,0.6)' : 'var(--ink-mute)' }}>{col.count}</span>
                <IcPlus size={12} color={col.accent ? '#f0eadf' : 'var(--ink-mute)'} style={{ cursor: 'pointer' }}/>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-cream)', padding: 10, borderRadius: '0 0 8px 8px', border: '1px solid var(--ink-line-soft)', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(ByState[col.state] || []).map((c) => (
                  <div key={c[0]} style={{ background: 'var(--paper)', padding: 12, borderRadius: 6, border: '1px solid var(--ink-line-soft)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{c[0]}</span>
                      <PrioDot level={c[1]} size={10}/>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.35 }}>{c[2]}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 7px', borderRadius: 99, background: c[4] + '1f', color: c[4], fontSize: 10, fontWeight: 500 }}>
                        <span style={{ width: 5, height: 5, borderRadius: 99, background: c[4] }}/>{c[3]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{c[8]}/{c[7]} sub</span>
                      <Avatar name={c[5]} color={c[6]} size={20}/>
                    </div>
                  </div>
                ))}
                {col.state === 'backlog' && (
                  <button style={{ padding: '8px 10px', background: 'transparent', border: '1px dashed var(--ink-line)', borderRadius: 6, fontSize: 12, color: 'var(--ink-mute)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <IcPlus size={12}/>Añadir issue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { IssuesList, IssuesKanban });
