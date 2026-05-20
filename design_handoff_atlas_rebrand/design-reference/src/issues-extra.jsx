// Issues extras: Calendar view, Gantt/timeline, Intake/Triage, Views list, View detail, Issue Types.

const IssuesCalendar = () => (
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
            {[['List', IcList], ['Board', IcGrid], ['Calendar', IcCalendar, true], ['Gantt', IcGantt]].map(([t, I, a]) => (
              <button key={t} style={{ padding: '5px 10px', border: 'none', background: a ? 'var(--paper)' : 'transparent', borderRadius: 4, fontSize: 12, fontWeight: 500, color: a ? 'var(--ink)' : 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', cursor: 'pointer', boxShadow: a ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                <I size={12}/>{t}
              </button>
            ))}
          </div>
        }
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Issue</Btn>}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line-soft)' }}>
        <span className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em' }}>Septiembre <span className="serif" style={{ fontStyle: 'italic', color: 'var(--ink-mute)', fontWeight: 400 }}>2026</span></span>
        <Btn size="sm" variant="ghost" icon={<IcChevLeft size={12}/>}/>
        <Btn size="sm" variant="ghost" icon={<IcChevRight size={12}/>}/>
        <Btn size="sm" variant="secondary">Hoy</Btn>
        <div style={{ flex: 1 }}/>
        <Btn size="sm" variant="ghost" icon={<IcFilter size={13}/>}>Filtros</Btn>
        <AvStack people={[{ name: 'MR', color: 'var(--terra)' }, { name: 'JC', color: 'var(--moss)' }, { name: 'EL', color: 'var(--plum)' }, { name: 'DS', color: 'var(--gold)' }]} size={22}/>
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, padding: 16, background: 'var(--bg-cream-2)', overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 8px' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '120px', gap: 4 }}>
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 0; // Sep starts on Tuesday
            const realDay = day - 1;
            const inMonth = realDay >= 1 && realDay <= 30;
            const isToday = realDay === 18;
            const isPast = realDay < 18 && inMonth;

            const events = {
              12: [['ATL-198', 'done', 'Q3 W1 cierre', 'var(--moss)']],
              14: [['ATL-247', 'in-progress', 'Conciliación bancaria', 'var(--terra)']],
              18: [['ATL-247', 'in-progress', 'Conciliación bancaria', '#c54a3a'], ['ATL-251', 'todo', 'Declaración IVA', 'var(--terra)'], ['ATL-292', 'todo', 'Bug · CFDI 4.0', '#c54a3a']],
              19: [['ATL-312', 'started', 'Test de carga', 'var(--terra)']],
              20: [['ATL-315', 'in-progress', 'UI tabla movimientos', 'var(--terra)']],
              22: [['ATL-263', 'started', 'Migrar nómina', 'var(--moss)']],
              25: [['ATL-285', 'in-progress', 'Integración Belvo', 'var(--moss)']],
              30: [['ATL-307', 'backlog', 'Carpetas 2027', 'var(--ink-mute)'], ['+2 más', '', '', 'var(--ink-mute)']],
            }[realDay] || [];

            return (
              <div key={i} style={{
                background: isToday ? 'var(--paper)' : (inMonth ? 'var(--paper)' : 'transparent'),
                border: isToday ? '1.5px solid var(--terra)' : '1px solid var(--ink-line-soft)',
                borderRadius: 6, padding: 6, opacity: !inMonth ? 0.3 : 1,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span className="tight tnum" style={{ fontSize: isToday ? 16 : 13, fontWeight: isToday ? 600 : 500, color: isToday ? 'var(--terra-deep)' : (isPast ? 'var(--ink-faint)' : 'var(--ink)'), letterSpacing: '-0.02em' }}>
                    {inMonth ? realDay : ''}
                  </span>
                  {events.length > 0 && <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)' }}>{events.length}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {events.slice(0, 3).map((e, j) => (
                    <div key={j} style={{ fontSize: 10, padding: '2px 5px', borderRadius: 3, background: e[3] + '1f', color: e[3], borderLeft: `2px solid ${e[3]}`, fontWeight: 500, letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', gap: 4, alignItems: 'center' }}>
                      {e[0] && <span className="mono" style={{ fontSize: 9, opacity: 0.7 }}>{e[0]}</span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{e[2]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const IssuesGantt = () => (
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
            {[['List', IcList], ['Board', IcGrid], ['Calendar', IcCalendar], ['Gantt', IcGantt, true]].map(([t, I, a]) => (
              <button key={t} style={{ padding: '5px 10px', border: 'none', background: a ? 'var(--paper)' : 'transparent', borderRadius: 4, fontSize: 12, fontWeight: 500, color: a ? 'var(--ink)' : 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', cursor: 'pointer', boxShadow: a ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                <I size={12}/>{t}
              </button>
            ))}
          </div>
        }
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Issue</Btn>}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line-soft)' }}>
        <span className="tight" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em' }}>Timeline · Q3 2026</span>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'inline-flex', padding: 3, background: 'var(--bg-cream-2)', borderRadius: 6 }}>
          {['Día', 'Semana', 'Mes', 'Q'].map((t, i) => (
            <button key={t} style={{ padding: '4px 10px', border: 'none', background: i === 2 ? 'var(--paper)' : 'transparent', borderRadius: 4, fontSize: 11, fontWeight: 500, color: i === 2 ? 'var(--ink)' : 'var(--ink-mute)', fontFamily: 'inherit', cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
        <Btn size="sm" variant="ghost" icon={<IcFilter size={13}/>}>Filtros</Btn>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>
        {/* Left: rows */}
        <div style={{ borderRight: '1px solid var(--ink-line)', overflow: 'auto', background: 'var(--paper)' }}>
          <div style={{ padding: '10px 16px', background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line)', display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 8, fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Geist Mono', fontWeight: 500 }}>
            <span/><span>Issue</span><span>Asig.</span>
          </div>
          {[
            { id: 'ATL-198', state: 'done', title: 'Match automático v3', av: 'MR', avc: 'var(--terra)' },
            { id: 'ATL-247', state: 'in-progress', title: 'Conciliación Santander · agosto', av: 'MR', avc: 'var(--terra)' },
            { id: 'ATL-251', state: 'todo', title: 'Declaración IVA — borrador', av: 'JC', avc: 'var(--moss)' },
            { id: 'ATL-263', state: 'started', title: 'Migrar nómina al módulo RRHH', av: 'MR', avc: 'var(--terra)' },
            { id: 'ATL-274', state: 'in-progress', title: 'Revisar conciliaciones · audit', av: 'EL', avc: 'var(--plum)' },
            { id: 'ATL-285', state: 'in-progress', title: 'Integración Belvo · pendientes', av: 'JC', avc: 'var(--moss)' },
            { id: 'ATL-292', state: 'todo', title: 'Bug · CFDI 4.0 SAT', av: 'MR', avc: 'var(--terra)' },
            { id: 'ATL-312', state: 'started', title: 'Test de carga facturación', av: 'MR', avc: 'var(--terra)' },
            { id: 'ATL-315', state: 'in-progress', title: 'UI · tabla movimientos', av: 'DS', avc: 'var(--gold)' },
            { id: 'ATL-307', state: 'backlog', title: 'Carpetas fiscal 2027', av: 'JC', avc: 'var(--moss)' },
          ].map((r, i) => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)', height: 36 }}>
              <StatePip state={r.state} size={11}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{r.id}</div>
              </div>
              <Avatar name={r.av} color={r.avc} size={18}/>
            </div>
          ))}
        </div>

        {/* Right: timeline */}
        <div style={{ overflow: 'auto', position: 'relative', background: 'var(--bg-cream-2)' }}>
          {/* Header weeks */}
          <div style={{ position: 'sticky', top: 0, background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line)', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', minWidth: 1100 }}>
            {['W30', 'W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42'].map((w, i) => (
              <div key={w} className="mono" style={{ padding: '10px 12px', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em', borderRight: i === 12 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                {w} {i === 5 && <span style={{ color: 'var(--terra)' }}>● hoy</span>}
              </div>
            ))}
          </div>

          {/* Bars */}
          <div style={{ position: 'relative', minWidth: 1100 }}>
            {[
              { row: 0, start: 0, len: 1.5, color: 'var(--moss)', label: 'ATL-198' },
              { row: 1, start: 4, len: 2.5, color: 'var(--terra)', label: 'ATL-247', overdue: true },
              { row: 2, start: 5, len: 1.2, color: 'var(--gold)', label: 'ATL-251' },
              { row: 3, start: 3, len: 4, color: 'var(--terra)', label: 'ATL-263' },
              { row: 4, start: 4.5, len: 1.5, color: 'var(--plum)', label: 'ATL-274' },
              { row: 5, start: 5.5, len: 2, color: 'var(--moss)', label: 'ATL-285' },
              { row: 6, start: 5, len: 1, color: '#c54a3a', label: 'ATL-292', critical: true },
              { row: 7, start: 5.2, len: 1.4, color: 'var(--terra)', label: 'ATL-312' },
              { row: 8, start: 5.4, len: 1.6, color: 'var(--gold)', label: 'ATL-315' },
              { row: 9, start: 9, len: 3, color: 'var(--ink-mute)', label: 'ATL-307', planned: true },
            ].map((b, i) => (
              <React.Fragment key={i}>
                {/* Row separator */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: b.row * 36, height: 36, borderBottom: '1px solid var(--ink-line-soft)' }}/>
                {/* Bar */}
                <div style={{
                  position: 'absolute', top: b.row * 36 + 10,
                  left: `${(b.start / 13) * 100}%`, width: `${(b.len / 13) * 100}%`,
                  height: 16, borderRadius: 3,
                  background: b.planned ? 'transparent' : b.color,
                  border: b.planned ? `1.5px dashed ${b.color}` : (b.critical ? '1.5px solid #fff' : 'none'),
                  boxShadow: b.critical ? '0 0 0 1.5px #c54a3a' : 'none',
                  display: 'flex', alignItems: 'center', padding: '0 6px',
                  fontSize: 10, fontFamily: 'Geist Mono', color: b.planned ? b.color : '#fff', fontWeight: 600,
                  cursor: 'grab',
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
                </div>
              </React.Fragment>
            ))}

            {/* Today line */}
            <div style={{ position: 'absolute', left: `${(5.5 / 13) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--terra)', zIndex: 2 }}/>

            {/* Dependency arrow example */}
            <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="100%" height="100%">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-mute)"/>
                </marker>
              </defs>
              <path d="M 230 26 Q 280 26 280 80" stroke="var(--ink-mute)" strokeWidth="1" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow)"/>
            </svg>

            {/* Min height */}
            <div style={{ height: 36 * 11 }}/>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const IntakePage = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="intake"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Cierre Fiscal Q3' },
          { icon: <IcInbox size={14}/>, label: 'Intake' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary">Configurar formulario</Btn>
            <Btn size="sm" variant="secondary" icon={<IcLink size={13}/>}>Compartir link</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Triage · 14 issues por revisar</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Bandeja de entrada de <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>issues.</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 560 }}>
          Issues enviadas por cualquiera con el link público — o creadas por email-to-issue. Acepta, descarta o transfiere a otra company.
        </p>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 28, marginBottom: 14, borderBottom: '1px solid var(--ink-line)' }}>
          {[['Pendiente', 14, true], ['Aceptado', 89], ['Descartado', 6], ['Duplicado', 2]].map(([l, n, a], i) => (
            <button key={i} style={{
              padding: '10px 16px', border: 'none', background: 'transparent',
              borderBottom: a ? '2px solid var(--terra)' : '2px solid transparent',
              color: a ? 'var(--ink)' : 'var(--ink-mute)',
              fontSize: 13, fontWeight: a ? 500 : 400, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: -1, letterSpacing: '-0.005em',
            }}>
              {l}<span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{n}</span>
            </button>
          ))}
        </div>

        {/* Intake cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { who: 'Ana Pérez', email: 'ana.perez@grupocervantes.mx', subj: 'CFDI rechazado al timbrar — cliente XYZ', body: 'Cuando intento timbrar la factura del cliente XYZ con RFC que tiene espacios al final, el SAT lo rechaza con código CFDI-040. Pasó ayer también con otros 2 clientes.', source: 'Email · intake@atlas.work', received: 'hace 12 min', priority: 'high', similar: 'ATL-292' },
            { who: 'Sara López', email: 'sara@kpmg.partner', subj: 'Falta documento de respaldo Q2 conciliación', body: 'Para cerrar la auditoría necesitamos el documento de respaldo de la conciliación bancaria de mayo. ¿Lo pueden subir?', source: 'Public form · auditoria', received: 'hace 45 min', priority: 'medium' },
            { who: 'Carlos M.', email: 'carlos@contadores.mx', subj: 'Plantilla de pólizas tipo no se actualizó', body: 'La plantilla v3 que mencionaron en la junta no aparece en el folder compartido.', source: 'Email · intake@atlas.work', received: 'hace 2h', priority: 'low' },
          ].map((i, idx) => (
            <div key={idx} style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, padding: 18, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Avatar name={i.who[0]} color="var(--ink-mute)" size={22}/>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{i.who}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{i.email}</span>
                  <span style={{ flex: 1 }}/>
                  <PrioDot level={i.priority} size={10}/>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{i.received}</span>
                </div>
                <div className="tight" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>{i.subj}</div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.55, letterSpacing: '-0.005em' }}>{i.body}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <Chip tone="solid" style={{ padding: '2px 8px' }}>{i.source}</Chip>
                  {i.similar && <Chip tone="accent" icon={<IcSparkle size={10}/>} style={{ padding: '2px 8px' }}>Posible duplicado de {i.similar}</Chip>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 130 }}>
                <Btn size="sm" icon={<IcCheck size={13}/>}>Aceptar</Btn>
                <Btn size="sm" variant="secondary">Editar antes</Btn>
                <Btn size="sm" variant="ghost">Mover a…</Btn>
                <Btn size="sm" variant="ghost" style={{ color: '#c54a3a' }} icon={<IcX size={13}/>}>Descartar</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ViewsList = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcSettings size={13}/>, label: 'Settings' },
          { label: 'Vistas guardadas' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Nueva vista</Btn>}
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Vistas · filtros guardados a nivel workspace</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Vistas guardadas.
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--ink-line)' }}>
          {[['Tuyas', 7, true], ['Compartidas', 12], ['Públicas del workspace', 4]].map(([l, n, a], i) => (
            <button key={i} style={{
              padding: '10px 16px', border: 'none', background: 'transparent',
              borderBottom: a ? '2px solid var(--terra)' : '2px solid transparent',
              color: a ? 'var(--ink)' : 'var(--ink-mute)',
              fontSize: 13, fontWeight: a ? 500 : 400, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: -1,
            }}>
              {l}<span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{n}</span>
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 220px 80px 110px 100px 24px', alignItems: 'center', gap: 14, padding: '10px 16px', borderBottom: '1px solid var(--ink-line)', background: 'var(--bg-cream)' }}>
            {[null, 'Nombre', 'Filtros aplicados', 'Vista', 'Compartida con', 'Última', null].map((c, i) => (
              <span key={i} className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c}</span>
            ))}
          </div>
          {[
            ['Mis bloqueos', 'Estado: blocked · Asignado a mí', 'List', 'Solo yo', 'hace 2h', 'var(--terra)', true],
            ['Bugs sin resolver', 'Etiqueta: Bug · Estado: ≠ done', 'Kanban', 'Workspace', 'ayer', '#c54a3a'],
            ['Vencen esta semana', 'Vence: 18-22 sept · Mis equipos', 'Calendar', '4 personas', '2 días', 'var(--gold)'],
            ['Urgentes sin asignar', 'Prioridad: urgent · Sin asignar', 'List', 'Workspace', '3 días', '#c54a3a'],
            ['ERP Migration · Q3', 'Módulo: ERP · Ciclo: actual', 'Gantt', 'Solo yo', '4 días', 'var(--moss)'],
            ['Para revisar — Eli', 'Asignado a: Eli · Estado: in-review', 'List', 'Eli T.', '1 semana', 'var(--plum)'],
            ['Backlog priorizado', 'Estado: backlog · Prio: high|urgent', 'List', 'Solo yo', '1 semana', 'var(--terra)'],
          ].map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 220px 80px 110px 100px 24px', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
              <IcStar size={13} color={v[6] ? 'var(--gold)' : 'var(--ink-line)'} style={{ fill: v[6] ? 'var(--gold)' : 'none' }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 18, background: v[5], borderRadius: 99 }}/>
                <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{v[0]}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v[1]}</span>
              <Chip tone="solid" style={{ justifySelf: 'flex-start', padding: '1px 8px' }}>{v[2]}</Chip>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{v[3]}</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{v[4]}</span>
              <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ViewDetail = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="issues"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar
        crumbs={[
          { icon: <IcStar size={13}/>, label: 'Vistas' },
          { label: 'Mis bloqueos' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcLink size={13}/>}>Compartir</Btn>
            <Btn size="sm" variant="secondary">Editar filtros</Btn>
            <Btn size="sm" icon={<IcStar size={13}/>}>Fijar</Btn>
          </div>
        }
      />

      {/* View hero with filters */}
      <div style={{ padding: '20px 24px', background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <Eyebrow>● Vista personal · creada hace 3 semanas</Eyebrow>
            <h1 className="tightest" style={{ fontSize: 36, fontWeight: 500, margin: '6px 0 4px', letterSpacing: '-0.04em', lineHeight: 1 }}>
              Mis bloqueos
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>Issues asignadas a mí con estado <em>blocked</em> o sin actualización en 3+ días.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div className="tightest tnum" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1 }}>7</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>resultados</div>
          </div>
        </div>

        {/* Visual filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FILTROS</span>
          <Chip tone="solid" style={{ padding: '3px 8px' }}>Estado: blocked</Chip>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>AND</span>
          <Chip tone="solid" style={{ padding: '3px 8px' }}>Asignado: yo</Chip>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>OR</span>
          <Chip tone="solid" style={{ padding: '3px 8px' }}>Sin actualización: ≥3 días</Chip>
          <span style={{ flex: 1 }}/>
          <Btn size="sm" variant="ghost" icon={<IcSparkle size={12} color="var(--terra)"/>}>Resumir con IA</Btn>
        </div>
      </div>

      {/* Reuse the table rows look */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--paper)' }}>
        {[
          ['ATL-247', 'in-progress', 'urgent', 'Conciliación bancaria — Santander', 'Backend', '#5d7256', 'Q3 W3', 'Sep 18', 'MR', 'var(--terra)', 8, 5, 'Bloqueado: falta extracto del 28 ago'],
          ['ATL-263', 'started', 'medium', 'Migrar nómina al módulo de RRHH', 'Infra', '#3d4a6b', 'ERP Mig.', 'Sep 22', 'MR', 'var(--terra)', 12, 8, '4 días sin update'],
          ['ATL-285', 'in-progress', 'medium', 'Integración Belvo · cuentas pendientes', 'Backend', '#5d7256', 'ERP Mig.', 'Sep 25', 'MR', 'var(--terra)', 4, 2, 'Esperando token de prod'],
          ['ATL-312', 'started', 'high', 'Test de carga · sistema de facturación', 'Backend', '#5d7256', 'Q3 W3', 'Sep 19', 'MR', 'var(--terra)', 6, 4, 'Esperando ambiente staging'],
        ].map((r, i) => (
          <div key={r[0]} style={{ display: 'grid', gridTemplateColumns: '32px 80px 1fr 110px 80px 36px 100px', alignItems: 'center', gap: 10, padding: '12px 24px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
            <StatePip state={r[1]} size={13}/>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r[0]}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{r[3]}</div>
              <div style={{ fontSize: 11.5, color: '#c54a3a', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IcFlag size={10}/> {r[12]}
              </div>
            </div>
            <Chip tone="solid" icon={<IcCycle size={10}/>} style={{ justifySelf: 'flex-start' }}>{r[6]}</Chip>
            <span className="mono" style={{ fontSize: 11, color: '#c54a3a' }}>{r[7]}</span>
            <PrioDot level={r[2]} size={11}/>
            <Avatar name={r[8]} color={r[9]} size={22} style={{ justifySelf: 'flex-end' }}/>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const IssueTypes = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="settings"/>

    <aside style={{ background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)', padding: '20px 12px' }}>
      <Eyebrow style={{ paddingLeft: 8, marginBottom: 12 }}>Workspace</Eyebrow>
      {['General', 'Miembros', 'Equipos', 'Estados', 'Etiquetas', 'Tipos de issue', 'Vistas', 'Webhooks', 'API tokens', 'Integraciones'].map((s, i) => (
        <div key={s} style={{
          padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer', marginBottom: 1,
          background: i === 5 ? 'var(--paper)' : 'transparent',
          color: i === 5 ? 'var(--ink)' : 'var(--ink-soft)',
          fontWeight: i === 5 ? 500 : 400,
          borderLeft: i === 5 ? '2px solid var(--terra)' : '2px solid transparent',
          marginLeft: -2,
          letterSpacing: '-0.005em',
        }}>{s}</div>
      ))}
    </aside>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcSettings size={13}/>, label: 'Settings' },
          { label: 'Tipos de issue' },
        ]}
        actions={<Btn size="sm" icon={<IcPlus size={13}/>}>Nuevo tipo</Btn>}
      />

      <div style={{ padding: '32px 48px', maxWidth: 900 }}>
        <Eyebrow>Tipos · 6 definidos</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 40, fontWeight: 500, margin: '8px 0 12px', letterSpacing: '-0.045em', lineHeight: 1 }}>
          Tipos de issue.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 540, marginBottom: 28, lineHeight: 1.55 }}>
          Define categorías de issues con campos personalizados. Por ejemplo, un bug requiere "pasos para reproducir"; una conciliación requiere "cuenta bancaria".
        </p>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
          {[
            { name: 'Task', icon: '◯', desc: 'Tipo por defecto — para trabajo general.', count: 134, fields: ['Estimación', 'Ciclo', 'Módulo'], color: 'var(--ink-mute)', default: true },
            { name: 'Bug', icon: '◑', desc: 'Defectos a corregir. Requiere pasos para reproducir y severidad.', count: 28, fields: ['Severidad', 'Versión', 'Pasos para reproducir', 'Resolución'], color: '#c54a3a' },
            { name: 'Feature', icon: '◐', desc: 'Funcionalidad nueva. Requiere user story y acceptance criteria.', count: 19, fields: ['User story', 'Criterios', 'Stakeholder'], color: 'var(--moss)' },
            { name: 'Conciliación', icon: '⌘', desc: 'Para flujos contables específicos.', count: 41, fields: ['Cuenta bancaria', 'Periodo', 'Monto esperado', 'Diferencia'], color: 'var(--terra)' },
            { name: 'Declaración', icon: '§', desc: 'Tributarias y regulatorias.', count: 18, fields: ['Tipo (ISR/IVA/etc)', 'Periodo', 'Estatus SAT'], color: 'var(--gold)' },
            { name: 'Auditoría', icon: '◇', desc: 'Solicitudes de auditor externo.', count: 7, fields: ['Auditor', 'Documento requerido', 'Fecha límite legal'], color: 'var(--plum)' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 280px 80px 30px', alignItems: 'center', gap: 14, padding: '16px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
              <span style={{ width: 36, height: 36, background: t.color, color: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.icon}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="tight" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.02em' }}>{t.name}</span>
                  {t.default && <Chip tone="accent" style={{ padding: '0 6px', fontSize: 10 }}>★ Default</Chip>}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.5 }}>{t.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {t.fields.slice(0, 3).map(f => (
                  <Chip key={f} tone="solid" style={{ padding: '1px 7px', fontSize: 10 }}>{f}</Chip>
                ))}
                {t.fields.length > 3 && <Chip tone="solid" style={{ padding: '1px 7px', fontSize: 10 }}>+{t.fields.length - 3}</Chip>}
              </div>
              <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{t.count} issues</span>
              <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { IssuesCalendar, IssuesGantt, IntakePage, ViewsList, ViewDetail, IssueTypes });
