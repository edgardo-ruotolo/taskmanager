// Issue Detail — the deep page for one issue.

const IssueDetail = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="issues"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar
        crumbs={[
          { icon: <IcCompanies size={13}/>, label: 'Contadores Asoc.' },
          { label: 'Cierre Fiscal Q3' },
          { icon: <IcIssues size={14}/>, label: 'Issues' },
          { label: <span className="mono">ATL-247</span> },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="ghost" icon={<IcChevLeft size={13}/>}/>
            <Btn size="sm" variant="ghost" icon={<IcChevRight size={13}/>}/>
            <Btn size="sm" variant="secondary" icon={<IcLink size={13}/>}>Copiar link</Btn>
            <Btn size="sm" variant="secondary">Suscribirse</Btn>
            <Btn size="sm" variant="ghost" icon={<IcMore size={13}/>}/>
          </div>
        }
      />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        {/* Main content */}
        <div style={{ overflow: 'auto', padding: '32px 56px', background: 'var(--bg-cream)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {/* Status + meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 10px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                <StatePip state="in-progress" size={12}/> In progress
                <IcChevDown size={11} color="var(--ink-mute)"/>
              </button>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>ATL-247</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>·</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>creado hace 6 días por <strong style={{ color: 'var(--ink-soft)' }}>Eli Tagle</strong></span>
              <span style={{ flex: 1 }}/>
              <Chip tone="accent" icon={<IcSparkle size={11}/>}>IA detectó dependencia con ATL-285</Chip>
            </div>

            {/* Title */}
            <h1 className="tightest" style={{ fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.15 }}>
              Conciliación bancaria — Banco Santander, agosto 2026
            </h1>

            {/* Description (rich) */}
            <div style={{ marginTop: 28, fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)', letterSpacing: '-0.005em' }}>
              <p style={{ margin: 0 }}>
                Conciliar los movimientos del extracto de agosto contra el registro contable. <strong style={{ color: 'var(--ink)' }}>Hay 14 movimientos sin identificar</strong> que necesitan revisión cruzada con tesorería.
              </p>
              <h3 className="tight" style={{ fontSize: 18, marginTop: 28, marginBottom: 8, color: 'var(--ink)', fontWeight: 500, letterSpacing: '-0.025em' }}>Criterios de aceptación</h3>
              <ul style={{ paddingLeft: 22, margin: '0 0 16px' }}>
                <li>Todos los movimientos del extracto deben tener póliza asociada.</li>
                <li>Diferencias mayores a $1,000 MXN documentadas con evidencia.</li>
                <li>Reporte firmado por contador titular y subido al folder fiscal.</li>
              </ul>
              <h3 className="tight" style={{ fontSize: 18, marginTop: 28, marginBottom: 8, color: 'var(--ink)', fontWeight: 500, letterSpacing: '-0.025em' }}>Adjuntos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { name: 'extracto-santander-ago.pdf', size: '2.4 MB' },
                  { name: 'polizas-agosto.xlsx', size: '847 KB' },
                ].map(f => (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 6 }}>
                    <div style={{ width: 32, height: 40, background: 'var(--bg-cream-2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IcDoc size={16} color="var(--ink-mute)"/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>{f.size}</div>
                    </div>
                    <IcDownload size={14} color="var(--ink-mute)"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-issues */}
            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <h3 className="tight" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.025em', margin: 0, color: 'var(--ink)' }}>Sub-issues</h3>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>5/8 completados</span>
                <span style={{ flex: 1 }}/>
                <Bar pct={62.5} color="var(--terra)" height={4}/>
                <Btn size="sm" variant="ghost" icon={<IcPlus size={12}/>}>Añadir</Btn>
              </div>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, overflow: 'hidden' }}>
                {[
                  ['done', 'Descargar extracto desde portal bancario', 'EL', 'var(--plum)'],
                  ['done', 'Importar al sistema con plantilla CSV', 'MR', 'var(--terra)'],
                  ['done', 'Match automático de pólizas — 1ra pasada', 'MR', 'var(--terra)'],
                  ['done', 'Revisar movimientos con monto exacto', 'JC', 'var(--moss)'],
                  ['done', 'Identificar transferencias inter-cuentas', 'MR', 'var(--terra)'],
                  ['in-progress', 'Investigar 14 movimientos sin póliza', 'MR', 'var(--terra)'],
                  ['todo', 'Generar reporte final de conciliación', 'MR', 'var(--terra)'],
                  ['todo', 'Subir al folder fiscal · firma de contador titular', 'EL', 'var(--plum)'],
                ].map((s, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                    <StatePip state={s[0]} size={12}/>
                    <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em', textDecoration: s[0] === 'done' ? 'line-through' : 'none', color: s[0] === 'done' ? 'var(--ink-mute)' : 'var(--ink)' }}>{s[1]}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>ATL-247.{i+1}</span>
                    <Avatar name={s[2]} color={s[3]} size={20}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div style={{ marginTop: 40 }}>
              <h3 className="tight" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 14px', color: 'var(--ink)' }}>Comentarios <span className="mono" style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 400 }}>· 4</span></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { who: 'Eli Tagle', av: 'EL', avc: 'var(--plum)', when: 'hace 3 días', txt: 'Marina, prioridad alta. El cliente preguntó por el reporte esta mañana.' },
                  { who: 'Marina Ruiz', av: 'MR', avc: 'var(--terra)', when: 'hace 2 días', txt: 'Tomado. Empecé con el match automático — 178 de 192 movimientos OK en primera pasada.' },
                  { who: 'Javier Cano', av: 'JC', avc: 'var(--moss)', when: 'hace 35 min', txt: 'Falta el extracto del 28 de agosto, lo solicité al banco. Te lo subo en la tarde.', latest: true },
                  { who: 'Atlas IA', av: 'A', avc: 'var(--ink)', when: 'hace 12 min', ai: true, txt: 'Sugerencia: 8 de los 14 movimientos sin póliza coinciden con patrones de comisión bancaria. ¿Quieres que aplique la regla automáticamente?' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    {c.ai ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'var(--ink)', color: 'var(--terra)', flexShrink: 0 }}>
                        <IcSparkle size={14}/>
                      </span>
                    ) : (
                      <Avatar name={c.av} color={c.avc} size={28}/>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{c.who}</span>
                        {c.ai && <Chip tone="accent" style={{ padding: '1px 6px', fontSize: 10 }}>IA</Chip>}
                        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{c.when}</span>
                        {c.latest && <span className="mono" style={{ fontSize: 10, color: 'var(--terra-deep)', marginLeft: 'auto' }}>● NUEVO</span>}
                      </div>
                      <div style={{ marginTop: 6, padding: 12, background: c.ai ? 'var(--ink)' : 'var(--paper)', color: c.ai ? '#f0eadf' : 'var(--ink-soft)', border: c.ai ? 'none' : '1px solid var(--ink-line-soft)', borderRadius: 6, fontSize: 13.5, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                        {c.txt}
                        {c.ai && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button style={{ padding: '5px 10px', background: 'var(--terra)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11.5, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>Aplicar regla</button>
                            <button style={{ padding: '5px 10px', background: 'transparent', color: '#f0eadf', border: '1px solid rgba(240,234,223,0.2)', borderRadius: 4, fontSize: 11.5, fontFamily: 'inherit', cursor: 'pointer' }}>Ver detalles</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Composer */}
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <Avatar name="MR" color="var(--terra)" size={28}/>
                  <div style={{ flex: 1, padding: 12, background: 'var(--paper)', border: '1.5px solid var(--ink)', borderRadius: 6, boxShadow: '0 0 0 4px rgba(217,119,87,0.12)' }}>
                    <div style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Escribe un comentario…</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, paddingTop: 10, borderTop: '1px solid var(--ink-line-soft)' }}>
                      <IcPaperclip size={14} color="var(--ink-mute)"/>
                      <IcLink size={14} color="var(--ink-mute)"/>
                      <IcSparkle size={14} color="var(--terra)"/>
                      <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        <Kbd>⌘</Kbd><Kbd>↵</Kbd>
                        <Btn size="sm">Comentar</Btn>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar — properties */}
        <aside style={{ background: 'var(--paper)', borderLeft: '1px solid var(--ink-line)', overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Eyebrow>Propiedades</Eyebrow>

          {[
            ['Estado', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><StatePip state="in-progress" size={12}/>In progress</span>],
            ['Prioridad', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PrioDot level="urgent" size={11}/>Urgent</span>],
            ['Asignado a', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name="MR" color="var(--terra)" size={18}/>Marina Ruiz</span>],
            ['Estimación', <span className="mono">8h</span>],
            ['Tiempo gastado', <span className="mono">5.2h</span>],
            ['Ciclo', <Chip tone="solid" icon={<IcCycle size={10}/>}>Q3 W3</Chip>],
            ['Módulo', <Chip tone="solid" icon={<IcModules size={10}/>}>Reportes ejec.</Chip>],
            ['Etiquetas', <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Chip dot="#5d7256">Backend</Chip>
              <Chip dot="#3d4a6b">Fiscal</Chip>
            </span>],
            ['Inicio', <span className="mono">12 sept</span>],
            ['Vence', <span className="mono" style={{ color: '#c54a3a' }}>HOY · 18:00</span>],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '6px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)', minWidth: 90, letterSpacing: '-0.005em' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{v}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--ink-line-soft)', paddingTop: 16 }}>
            <Eyebrow style={{ marginBottom: 10 }}>Relaciones</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Bloquea', 'ATL-251', 'in-progress'],
                ['Relacionado', 'ATL-285', 'in-progress'],
                ['Duplica', 'ATL-198', 'cancelled'],
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'var(--bg-cream)', borderRadius: 4 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: 60 }}>{r[0]}</span>
                  <StatePip state={r[2]} size={10}/>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 500 }}>{r[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--ink-line-soft)', paddingTop: 16 }}>
            <Eyebrow style={{ marginBottom: 10 }}>Observadores</Eyebrow>
            <AvStack people={[{ name: 'MR', color: 'var(--terra)' }, { name: 'EL', color: 'var(--plum)' }, { name: 'JC', color: 'var(--moss)' }, { name: 'DS', color: 'var(--gold)' }]} size={22}/>
          </div>
        </aside>
      </div>
    </div>
  </div>
);

Object.assign(window, { IssueDetail });
