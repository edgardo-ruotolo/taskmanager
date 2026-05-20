// Pages: doc list + page editor view.

const PagesList = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="pages"/>
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcPages size={14}/>, label: 'Pages' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcDownload size={13}/>}>Exportar</Btn>
            <Btn size="sm" icon={<IcPlus size={13}/>}>Nueva página</Btn>
          </div>
        }
      />
      <div style={{ padding: '32px 56px' }}>
        <Eyebrow>Documentación viva · 47 páginas</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
          La memoria del equipo.
        </h1>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
          {/* Recent + pinned */}
          <div>
            <Eyebrow style={{ marginBottom: 12 }}>Fijadas</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { title: 'Manual de cierre fiscal 2026', icon: '⌘', meta: '14 secciones · actualizado ayer', cover: 'var(--terra)' },
                { title: 'Procedimientos de auditoría', icon: '§', meta: '8 secciones · 4 días', cover: 'var(--moss)' },
                { title: 'Onboarding equipo finanzas', icon: '◐', meta: '11 secciones · 1 semana', cover: 'var(--plum)' },
                { title: 'Catálogo de cuentas — 2026', icon: '☷', meta: '24 secciones · 3 semanas', cover: 'var(--ink)' },
              ].map((p, i) => (
                <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, padding: 16, display: 'flex', gap: 14, cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 56, background: p.cover, color: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{p.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tight" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.015em' }}>{p.title}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 6, letterSpacing: '0.04em' }}>{p.meta}</div>
                  </div>
                </div>
              ))}
            </div>

            <Eyebrow style={{ marginTop: 32, marginBottom: 12 }}>Recientes</Eyebrow>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8 }}>
              {[
                ['Postmortem · CFDI 4.0 SAT', 'Marina Ruiz', 'hace 2h'],
                ['Plan Q4 · roadmap fiscal', 'Eli Tagle', 'hace 6h'],
                ['Comparativa Odoo vs SAP', 'Javier Cano', 'ayer'],
                ['Pólizas tipo · nuevas plantillas', 'Diana S.', 'hace 2 días'],
                ['Checklist cierre mensual', 'Marina Ruiz', 'hace 4 días'],
                ['Reunión kickoff · auditoría externa', 'Eli Tagle', 'hace 1 semana'],
              ].map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto 80px', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-line-soft)' }}>
                  <IcDoc size={14} color="var(--ink-mute)"/>
                  <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{p[0]}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{p[1]}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{p[2]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <Eyebrow style={{ marginBottom: 12 }}>Tu actividad</Eyebrow>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 8, padding: 16 }}>
              <div className="tightest tnum" style={{ fontSize: 52, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>847<span style={{ fontSize: 16, color: 'var(--ink-mute)' }}> palabras</span></div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>esta semana · +28%</div>

              <svg viewBox="0 0 200 50" style={{ width: '100%', marginTop: 16 }}>
                {[12, 24, 8, 32, 28, 40, 22].map((v, i) => (
                  <rect key={i} x={i * 28 + 4} y={50 - v} width="20" height={v} fill={i === 5 ? 'var(--terra)' : 'var(--ink-line)'} rx="2"/>
                ))}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <span key={i} className="mono" style={{ fontSize: 10, color: i === 5 ? 'var(--terra-deep)' : 'var(--ink-mute)' }}>{d}</span>
                ))}
              </div>
            </div>

            <Eyebrow style={{ marginTop: 28, marginBottom: 12 }}>Templates</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['📋 Meeting notes', '✦ Postmortem', '◇ RFC técnico', '◯ Checklist mensual', '⌘ Manual de proceso'].map(t => (
                <div key={t} style={{ padding: '10px 12px', background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 500, letterSpacing: '-0.005em' }}>{t}</span>
                  <IcPlus size={12} color="var(--ink-mute)"/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PageEditor = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 220px 1fr', height: '100%' }}>
    <Sidebar active="pages"/>

    {/* TOC */}
    <aside style={{ background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)', padding: '20px 16px', overflow: 'auto' }}>
      <Eyebrow style={{ marginBottom: 14 }}>Contenido</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[
          ['1. Marco normativo', false],
          ['2. Calendario fiscal', false],
          ['3. Cuentas bancarias', true],
          ['  3.1 Conciliaciones', false],
          ['  3.2 Movimientos atípicos', false],
          ['4. Pólizas tipo', false],
          ['5. Declaraciones', false],
          ['6. Cierre mensual', false],
          ['7. Cierre anual', false],
        ].map(([t, a], i) => (
          <div key={i} style={{
            padding: '6px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer',
            background: a ? 'var(--paper)' : 'transparent',
            color: a ? 'var(--ink)' : 'var(--ink-soft)',
            fontWeight: a ? 500 : 400,
            borderLeft: a ? '2px solid var(--terra)' : '2px solid transparent',
            marginLeft: -2,
            letterSpacing: '-0.005em',
          }}>{t}</div>
        ))}
      </div>
    </aside>

    {/* Editor */}
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcPages size={13}/>, label: 'Pages' },
          { label: 'Manual de cierre fiscal' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--moss)' }}/>GUARDADO · hace 2 s
            </span>
            <AvStack people={[{ name: 'EL', color: 'var(--plum)' }, { name: 'JC', color: 'var(--moss)' }]} size={22}/>
            <Btn size="sm" variant="secondary" icon={<IcEye size={13}/>}>Vista pública</Btn>
            <Btn size="sm" icon={<IcSparkle size={13}/>} variant="accent">IA</Btn>
          </div>
        }
      />

      <div style={{ flex: 1, padding: '48px 80px', maxWidth: 880, margin: '0 auto', width: '100%' }}>
        <Eyebrow>Capítulo 3 · revisado por Marina · v 4.2</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 52, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.05em', lineHeight: 1.05 }}>
          Cuentas bancarias <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terra-deep)' }}>& conciliaciones.</span>
        </h1>

        <div style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)', letterSpacing: '-0.005em' }}>
          <p style={{ margin: '0 0 16px' }}>
            La conciliación bancaria es el proceso de cuadrar los movimientos del extracto contra el registro contable. Se hace mensualmente, antes del día 5 del mes siguiente.
          </p>

          <h2 className="tight" style={{ fontSize: 24, fontWeight: 500, color: 'var(--ink)', marginTop: 32, marginBottom: 8, letterSpacing: '-0.03em' }}>3.1 Conciliaciones</h2>

          <p style={{ margin: '0 0 16px' }}>
            Para cada cuenta bancaria activa, el responsable debe:
          </p>

          <ol style={{ paddingLeft: 24, lineHeight: 1.8 }}>
            <li>Descargar el extracto en formato PDF y CSV desde el portal del banco.</li>
            <li>Importar el CSV usando la plantilla <code className="mono" style={{ background: 'var(--bg-cream-2)', padding: '2px 6px', borderRadius: 3, fontSize: 13 }}>tpl-extracto-v3</code>.</li>
            <li>Correr el match automático contra pólizas del periodo.</li>
            <li>Investigar diferencias mayores a <strong style={{ color: 'var(--ink)' }}>$1,000 MXN</strong>.</li>
          </ol>

          {/* Callout */}
          <div style={{ display: 'flex', gap: 14, padding: 18, background: 'var(--terra-soft)', borderRadius: 8, marginTop: 24, marginBottom: 24, border: '1px solid rgba(217,119,87,0.2)' }}>
            <IcFlag size={18} color="var(--terra-deep)" style={{ flexShrink: 0, marginTop: 1 }}/>
            <div>
              <div className="tight" style={{ fontSize: 14, fontWeight: 600, color: 'var(--terra-deep)', letterSpacing: '-0.015em' }}>Importante — política fiscal</div>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                Toda diferencia no documentada después de 3 días genera un alerta automática al CFO. El sistema lo hace por ti — no necesitas enviar correo.
              </p>
            </div>
          </div>

          {/* Linked issues block */}
          <div style={{ background: 'var(--bg-cream)', borderRadius: 8, padding: 16, marginTop: 24, border: '1px solid var(--ink-line-soft)' }}>
            <Eyebrow style={{ marginBottom: 10 }}>Issues relacionadas · 3</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['ATL-247', 'in-progress', 'Conciliación bancaria — Santander', 'urgent'],
                ['ATL-285', 'in-progress', 'Integración Belvo · cuentas pendientes', 'medium'],
                ['ATL-198', 'done', 'Implementar match automático v3', 'medium'],
              ].map((iss, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 4 }}>
                  <StatePip state={iss[1]} size={11}/>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{iss[0]}</span>
                  <span style={{ fontSize: 13, flex: 1, fontWeight: 500 }}>{iss[2]}</span>
                  <PrioDot level={iss[3]} size={10}/>
                </div>
              ))}
            </div>
          </div>

          <h2 className="tight" style={{ fontSize: 24, fontWeight: 500, color: 'var(--ink)', marginTop: 32, marginBottom: 8, letterSpacing: '-0.03em' }}>3.2 Movimientos atípicos</h2>
          <p style={{ margin: 0, color: 'var(--ink-mute)' }}>
            Un movimiento se considera atípico si...
            <span style={{ background: 'var(--terra-soft)', padding: '0 2px', borderRadius: 2 }}>excede en 3 desviaciones estándar el promedio mensual de la cuenta</span>, o si...
          </p>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { PagesList, PageEditor });
