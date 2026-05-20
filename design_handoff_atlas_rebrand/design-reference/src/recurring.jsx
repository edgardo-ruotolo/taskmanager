// Recurring: list + detail (the page the user explicitly missed).

const RecurringList = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="recurring"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcRefresh size={14}/>, label: 'Recurrentes' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcFilter size={13}/>}>Filtrar</Btn>
            <Btn size="sm" icon={<IcPlus size={13}/>}>Nueva recurrente</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 48px' }}>
        <Eyebrow>Tareas que se repiten · 17 plantillas activas</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          Recurrentes.
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-mute)', maxWidth: 600, lineHeight: 1.55 }}>
          Plantillas que generan issues automáticamente según un calendario. Perfecto para cierres mensuales, conciliaciones, declaraciones, reportes regulatorios — todo lo que pasa cada mes sin falta.
        </p>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 28 }}>
          {[
            { k: 'Activas', v: 17, sub: 'generando issues', accent: 'var(--moss)' },
            { k: 'Pausadas', v: 3, sub: 'no generan hasta reactivar', accent: 'var(--gold)' },
            { k: 'Issues generados', v: 248, sub: 'últimos 90 días', accent: 'var(--terra)' },
            { k: 'Próximo trigger', v: 'Mañana', sub: '06:00 · 4 issues', accent: 'var(--plum)', stringValue: true },
          ].map((c, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 16, borderRadius: 8, border: '1px solid var(--ink-line-soft)', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, right: 0, width: 3, height: 18, background: c.accent }}/>
              <Eyebrow>{c.k}</Eyebrow>
              <div className={c.stringValue ? "tight" : "tightest tnum"} style={{ fontSize: c.stringValue ? 24 : 32, fontWeight: 500, letterSpacing: '-0.04em', marginTop: 6, lineHeight: 1 }}>{c.v}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 6, letterSpacing: '0.05em' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs by cadence */}
        <div style={{ display: 'flex', gap: 4, marginTop: 32, marginBottom: 16, borderBottom: '1px solid var(--ink-line)' }}>
          {[['Todas', 20, true], ['Diarias', 3], ['Semanales', 5], ['Mensuales', 9], ['Trimestrales', 2], ['Anuales', 1], ['Pausadas', 3]].map(([l, n, a], i) => (
            <button key={i} style={{
              padding: '10px 14px', border: 'none', background: 'transparent',
              borderBottom: a ? '2px solid var(--terra)' : '2px solid transparent',
              color: a ? 'var(--ink)' : 'var(--ink-mute)',
              fontSize: 13, fontWeight: a ? 500 : 400, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: -1, letterSpacing: '-0.005em',
            }}>
              {l}<span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{n}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 130px 110px 90px 90px 24px', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ink-line)', background: 'var(--bg-cream)' }}>
            {[null, 'Plantilla', 'Cadencia', 'Próximo trigger', 'Generados', 'Lead', 'Estado', null].map((c, i) => (
              <span key={i} className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c}</span>
            ))}
          </div>

          {/* Section: Diarias */}
          <div style={{ padding: '12px 16px 6px', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--ink-line-soft)' }}>
            <IcChevDown size={13} color="var(--ink-mute)"/>
            <span className="tight" style={{ fontSize: 13, fontWeight: 500 }}>Diarias</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>3</span>
          </div>
          {[
            { icon: '◯', title: 'Revisión de timbrado diario', cadence: 'Cada día · 08:00', next: 'Mañana 08:00', generated: 28, lead: 'JC', leadc: 'var(--moss)', status: 'Activa' },
            { icon: '◐', title: 'Captura de movimientos bancarios', cadence: 'Cada día laboral · 09:00', next: 'Mañana 09:00', generated: 19, lead: 'MR', leadc: 'var(--terra)', status: 'Activa' },
            { icon: '◇', title: 'Backup de pólizas del día', cadence: 'Cada día · 23:00', next: 'Hoy 23:00', generated: 90, lead: 'AB', leadc: 'var(--ink)', status: 'Activa', highlight: true },
          ].map((r, i) => <RecRow key={i} r={r}/>)}

          {/* Section: Semanales */}
          <div style={{ padding: '12px 16px 6px', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--ink-line-soft)' }}>
            <IcChevDown size={13} color="var(--ink-mute)"/>
            <span className="tight" style={{ fontSize: 13, fontWeight: 500 }}>Semanales</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>5</span>
          </div>
          {[
            { icon: '⌘', title: 'Cierre semanal de caja chica', cadence: 'Cada viernes · 17:00', next: 'Vie 22 sept', generated: 12, lead: 'DS', leadc: 'var(--gold)', status: 'Activa' },
            { icon: '◑', title: 'Reporte semanal de KPIs', cadence: 'Cada lunes · 08:00', next: 'Lun 25 sept', generated: 11, lead: 'EL', leadc: 'var(--plum)', status: 'Activa' },
            { icon: '§', title: 'Conciliación caja menor — sucursales', cadence: 'Cada viernes · 16:00', next: 'Vie 22 sept', generated: 24, lead: 'JC', leadc: 'var(--moss)', status: 'Activa' },
          ].map((r, i) => <RecRow key={i} r={r}/>)}

          {/* Section: Mensuales */}
          <div style={{ padding: '12px 16px 6px', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--ink-line-soft)' }}>
            <IcChevDown size={13} color="var(--ink-mute)"/>
            <span className="tight" style={{ fontSize: 13, fontWeight: 500 }}>Mensuales</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>9</span>
          </div>
          {[
            { icon: '◐', title: 'Conciliación bancaria · Santander', cadence: 'Día 1 de cada mes · 06:00', next: '1 oct 06:00', generated: 8, lead: 'MR', leadc: 'var(--terra)', status: 'Activa' },
            { icon: '◐', title: 'Conciliación bancaria · BBVA', cadence: 'Día 1 de cada mes · 06:00', next: '1 oct 06:00', generated: 8, lead: 'MR', leadc: 'var(--terra)', status: 'Activa' },
            { icon: '§', title: 'Declaración IVA', cadence: 'Día 17 de cada mes · 09:00', next: '17 oct', generated: 6, lead: 'JC', leadc: 'var(--moss)', status: 'Activa' },
            { icon: '§', title: 'Declaración ISR retenciones', cadence: 'Día 17 de cada mes · 09:00', next: '17 oct', generated: 6, lead: 'JC', leadc: 'var(--moss)', status: 'Activa' },
            { icon: '⌘', title: 'Reporte mensual a CFO', cadence: 'Día 5 de cada mes · 10:00', next: '5 oct', generated: 7, lead: 'EL', leadc: 'var(--plum)', status: 'Activa' },
            { icon: '◇', title: 'Backup mensual de base de datos', cadence: 'Último día del mes · 22:00', next: '30 sept', generated: 4, lead: 'AB', leadc: 'var(--ink)', status: 'Pausada' },
          ].map((r, i) => <RecRow key={i} r={r}/>)}

          {/* Section: Trimestrales */}
          <div style={{ padding: '12px 16px 6px', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--ink-line-soft)' }}>
            <IcChevDown size={13} color="var(--ink-mute)"/>
            <span className="tight" style={{ fontSize: 13, fontWeight: 500 }}>Trimestrales & Anuales</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>3</span>
          </div>
          {[
            { icon: '◯', title: 'Declaración trimestral · pagos provisionales', cadence: 'Cada Q · día 17', next: '17 oct (Q3)', generated: 3, lead: 'JC', leadc: 'var(--moss)', status: 'Activa' },
            { icon: '⌘', title: 'Estados financieros trimestrales', cadence: 'Fin de Q · día 10 del Q+1', next: '10 oct', generated: 3, lead: 'EL', leadc: 'var(--plum)', status: 'Activa' },
            { icon: '§', title: 'Declaración anual', cadence: 'Cada año · 31 marzo', next: '31 mar 2027', generated: 2, lead: 'MR', leadc: 'var(--terra)', status: 'Activa' },
          ].map((r, i) => <RecRow key={i} r={r}/>)}
        </div>
      </div>
    </div>
  </div>
);

const RecRow = ({ r }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 130px 110px 90px 90px 24px', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--ink-line-soft)', background: r.highlight ? 'rgba(217,119,87,0.04)' : 'transparent' }}>
    <span style={{ width: 26, height: 26, background: 'var(--bg-cream-2)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>{r.icon}</span>
    <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{r.title}</span>
    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.02em' }}>{r.cadence}</span>
    <span className="mono" style={{ fontSize: 11, color: r.next.startsWith('Hoy') || r.next.startsWith('Mañana') ? 'var(--terra-deep)' : 'var(--ink-mute)' }}>{r.next}</span>
    <span className="mono tnum" style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{r.generated}</span>
    <Avatar name={r.lead} color={r.leadc} size={20} style={{ justifySelf: 'flex-start' }}/>
    <Chip tone={r.status === 'Activa' ? 'moss' : 'solid'} style={{ justifySelf: 'flex-start', padding: '1px 8px' }}>
      {r.status === 'Activa' ? '● Activa' : '⏸ Pausada'}
    </Chip>
    <IcMore size={14} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
  </div>
);

const RecurringDetail = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="recurring"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcRefresh size={14}/>, label: 'Recurrentes' },
          { label: 'Conciliación bancaria · Santander' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary">Generar ahora</Btn>
            <Btn size="sm" variant="secondary">Pausar</Btn>
            <Btn size="sm" variant="ghost" icon={<IcMore size={13}/>}/>
          </div>
        }
      />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', padding: '32px 48px' }}>
          <Eyebrow>● ACTIVA · ha generado 8 issues</Eyebrow>
          <h1 className="tightest" style={{ fontSize: 40, fontWeight: 500, margin: '8px 0 4px', letterSpacing: '-0.045em', lineHeight: 1.05 }}>
            Conciliación bancaria · <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>Santander</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-mute)', margin: 0, maxWidth: 600 }}>
            Genera un issue el día 1 de cada mes a las 06:00 hora local. Pre-asigna a Marina, agrega al ciclo del mes correspondiente, y adjunta plantilla v3.
          </p>

          {/* Schedule visualization */}
          <div style={{ marginTop: 28, padding: 22, background: 'var(--ink)', color: '#f0eadf', borderRadius: 10 }}>
            <Eyebrow style={{ color: 'var(--terra)' }}>Schedule</Eyebrow>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(240,234,223,0.08)', borderRadius: 6, fontSize: 13 }}>
                <IcCalendar size={14} color="var(--terra)"/>
                Día <span className="tight" style={{ fontWeight: 600, color: 'var(--terra)' }}>1</span> de cada mes
              </span>
              <span style={{ fontSize: 14, color: 'rgba(240,234,223,0.5)' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(240,234,223,0.08)', borderRadius: 6, fontSize: 13 }}>
                <IcCycle size={14} color="var(--terra)"/>
                A las <span className="tight" style={{ fontWeight: 600, color: 'var(--terra)' }}>06:00</span> (UTC-6)
              </span>
              <span style={{ fontSize: 14, color: 'rgba(240,234,223,0.5)' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(240,234,223,0.08)', borderRadius: 6, fontSize: 13 }}>
                <IcRefresh size={14} color="var(--terra)"/>
                Hasta <span className="tight" style={{ fontWeight: 600, color: 'var(--terra)' }}>siempre</span>
              </span>
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(240,234,223,0.15)' }}>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(240,234,223,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Próximas 6 generaciones</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {[
                  ['1 OCT', 'Mañana 06:00', true],
                  ['1 NOV', 'En 13 días'],
                  ['1 DIC', 'En 44 días'],
                  ['1 ENE', 'En 75 días'],
                  ['1 FEB', 'En 106 días'],
                  ['1 MAR', 'En 134 días'],
                ].map(([d, sub, next], i) => (
                  <div key={i} style={{ padding: 12, background: next ? 'var(--terra)' : 'rgba(240,234,223,0.06)', borderRadius: 6, color: next ? '#fff' : '#f0eadf' }}>
                    <div className="tight" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>{d}</div>
                    <div className="mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 4, letterSpacing: '0.06em' }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Issue template preview */}
          <div style={{ marginTop: 32 }}>
            <Eyebrow style={{ marginBottom: 12 }}>Plantilla del issue</Eyebrow>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <StatePip state="todo" size={13}/>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>ATL-{`{{seq}}`}</span>
                <Chip tone="solid" style={{ padding: '1px 8px' }}>Type: Conciliación</Chip>
              </div>
              <div className="tight" style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.025em' }}>
                Conciliación bancaria — Banco Santander, <span style={{ background: 'var(--terra-soft)', padding: '0 4px', borderRadius: 2, color: 'var(--terra-deep)' }}>{`{{mes}}`}</span> <span style={{ background: 'var(--terra-soft)', padding: '0 4px', borderRadius: 2, color: 'var(--terra-deep)' }}>{`{{año}}`}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 10, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                Conciliar los movimientos del extracto de <span style={{ background: 'var(--terra-soft)', padding: '0 3px', borderRadius: 2, color: 'var(--terra-deep)' }}>{`{{mes}}`}</span> contra el registro contable. Plantilla v3 adjunta.
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--ink-line-soft)' }}>
                <Chip dot="#5d7256">Backend</Chip>
                <Chip dot="#3d4a6b">Fiscal</Chip>
                <Chip tone="solid" icon={<IcUser size={10}/>}>→ Marina</Chip>
                <Chip tone="solid" icon={<IcCycle size={10}/>}>→ ciclo del mes</Chip>
                <Chip tone="solid" icon={<IcFlag size={10}/>}>Prio: High</Chip>
                <Chip tone="solid" icon={<IcPaperclip size={10}/>}>1 adjunto</Chip>
                <Chip tone="solid" icon={<IcCalendar size={10}/>}>Vence: día +5</Chip>
              </div>
            </div>
          </div>

          {/* History */}
          <div style={{ marginTop: 32 }}>
            <Eyebrow style={{ marginBottom: 12 }}>Historial de generaciones · 8</Eyebrow>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
              {[
                ['ATL-247', '1 sept 2026', 'in-progress', 'En curso — 5/8 subtasks'],
                ['ATL-198', '1 ago 2026', 'done', 'Cerrado · 0 movimientos sin identificar'],
                ['ATL-141', '1 jul 2026', 'done', 'Cerrado · 3 movimientos sin identificar'],
                ['ATL-085', '1 jun 2026', 'done', 'Cerrado'],
                ['ATL-042', '1 may 2026', 'done', 'Cerrado'],
                ['ATL-018', '1 abr 2026', 'done', 'Cerrado'],
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 80px 100px 1fr 24px', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                  <StatePip state={r[2]} size={12}/>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r[0]}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r[1]}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{r[3]}</span>
                  <IcArrow size={12} color="var(--ink-faint)" style={{ cursor: 'pointer' }}/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside style={{ background: 'var(--paper)', borderLeft: '1px solid var(--ink-line)', overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Eyebrow>Configuración</Eyebrow>

          {[
            ['Estado', <Chip tone="moss">● Activa</Chip>],
            ['Tipo', 'Conciliación'],
            ['Cadencia', <span className="mono">monthly</span>],
            ['Día del mes', <span className="mono">1</span>],
            ['Hora', <span className="mono">06:00 UTC-6</span>],
            ['Zona horaria', 'América/CDMX'],
            ['Lead', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name="MR" color="var(--terra)" size={18}/>Marina</span>],
            ['Company', 'Cierre Fiscal Q3'],
            ['Auto-asignar a ciclo', '✓ del mes activo'],
            ['Auto-notificar', '✓ Lead + watchers'],
            ['Próximo trigger', <span style={{ color: 'var(--terra-deep)' }} className="mono">1 OCT 06:00</span>],
            ['Creada por', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name="EL" color="var(--plum)" size={18}/>Eli T.</span>],
            ['Activa desde', 'feb 2026'],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '5px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)', minWidth: 110, letterSpacing: '-0.005em' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{v}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--ink-line-soft)', paddingTop: 16, marginTop: 8 }}>
            <Eyebrow style={{ marginBottom: 10 }}>Acciones</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Btn size="sm" variant="secondary" style={{ justifyContent: 'space-between', width: '100%' }}>Generar issue ahora <IcArrow size={12}/></Btn>
              <Btn size="sm" variant="secondary" style={{ justifyContent: 'space-between', width: '100%' }}>Editar plantilla <IcArrow size={12}/></Btn>
              <Btn size="sm" variant="secondary" style={{ justifyContent: 'space-between', width: '100%' }}>Duplicar recurrente <IcArrow size={12}/></Btn>
              <Btn size="sm" variant="ghost" style={{ justifyContent: 'space-between', width: '100%', color: '#c54a3a' }}>Eliminar <IcX size={12}/></Btn>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
);

Object.assign(window, { RecurringList, RecurringDetail });
