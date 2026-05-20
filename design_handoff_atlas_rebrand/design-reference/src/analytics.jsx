// Analytics: charts dashboard.

const Analytics = () => (
  <div className="ab" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
    <Sidebar active="analytics"/>

    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
      <Topbar
        crumbs={[
          { icon: <IcAnalytics size={14}/>, label: 'Analytics' },
          { label: 'Trimestre actual' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<IcCalendar size={13}/>}>Q3 2026</Btn>
            <Btn size="sm" variant="secondary" icon={<IcDownload size={13}/>}>PDF</Btn>
          </div>
        }
      />

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <Eyebrow>Analytics · Q3 2026 · trimestre en curso</Eyebrow>
          <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
            Velocidad, <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>composición</span>, salud.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-mute)', marginTop: 8, maxWidth: 640 }}>
            Cuatro indicadores que necesitas saber cada lunes. Todo lo demás es ruido.
          </p>
        </div>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Velocidad · issues/sem', value: 47, delta: '+12%', trend: 'up' },
            { label: 'Cycle time medio', value: '3.2', unit: 'días', delta: '-0.8 d', trend: 'up' },
            { label: 'Throughput · 4 sem', value: 188, delta: '+24', trend: 'up' },
            { label: 'WIP · en curso', value: 31, unit: 'issues', delta: 'estable', trend: 'flat' },
          ].map((k, i) => (
            <div key={i} style={{ background: 'var(--paper)', padding: 18, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
              <Eyebrow>{k.label}</Eyebrow>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
                <span className="tightest tnum" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>{k.value}</span>
                {k.unit && <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{k.unit}</span>}
              </div>
              <div className="mono" style={{ fontSize: 10.5, marginTop: 8, letterSpacing: '0.05em', color: k.trend === 'up' ? 'var(--moss)' : (k.trend === 'down' ? '#c54a3a' : 'var(--ink-mute)'), display: 'flex', alignItems: 'center', gap: 4 }}>
                {k.trend === 'up' && '↗'}{k.trend === 'down' && '↘'}{k.trend === 'flat' && '→'} {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Big chart + breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <Eyebrow>Issues creados vs cerrados · 13 semanas</Eyebrow>
                <div className="tight" style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.025em' }}>El equipo está cerrando más rápido de lo que entra trabajo.</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }} className="mono"><span style={{ width: 10, height: 2, background: 'var(--terra)' }}/>CERRADOS</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }} className="mono"><span style={{ width: 10, height: 2, background: 'var(--ink)', borderTop: '1.5px dashed var(--ink)' }}/>CREADOS</span>
              </div>
            </div>

            <svg viewBox="0 0 600 200" style={{ width: '100%', marginTop: 16, height: 220 }}>
              {/* grid */}
              {[40, 80, 120, 160].map(y => (
                <line key={y} x1="20" y1={y} x2="600" y2={y} stroke="var(--ink-line-soft)" strokeWidth="1"/>
              ))}
              {[0, 20, 40, 60].reverse().map((v, i) => (
                <text key={i} x="0" y={i * 40 + 44} fontSize="9" fill="var(--ink-mute)" fontFamily="Geist Mono">{v}</text>
              ))}
              {/* Created (dashed line) */}
              <path d="M 30 80 L 78 88 L 126 70 L 174 92 L 222 68 L 270 78 L 318 86 L 366 60 L 414 74 L 462 70 L 510 82 L 558 76" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4 4" fill="none"/>
              {/* Closed (solid line + area) */}
              <defs>
                <linearGradient id="closedFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--terra)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--terra)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M 30 110 L 78 120 L 126 100 L 174 118 L 222 88 L 270 70 L 318 64 L 366 50 L 414 48 L 462 40 L 510 38 L 558 32" stroke="var(--terra)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 30 110 L 78 120 L 126 100 L 174 118 L 222 88 L 270 70 L 318 64 L 366 50 L 414 48 L 462 40 L 510 38 L 558 32 L 558 200 L 30 200 Z" fill="url(#closedFill)"/>
              {/* dots */}
              {[[30,110],[78,120],[126,100],[174,118],[222,88],[270,70],[318,64],[366,50],[414,48],[462,40],[510,38],[558,32]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="3" fill="var(--terra)" stroke="var(--paper)" strokeWidth="1.5"/>
              ))}
              {/* week labels */}
              {['W1', 'W3', 'W5', 'W7', 'W9', 'W11', 'W13'].map((w, i) => (
                <text key={w} x={30 + i * 90} y="195" fontSize="9" fill="var(--ink-mute)" fontFamily="Geist Mono" textAnchor="middle">{w}</text>
              ))}
            </svg>
          </div>

          {/* Composition donut */}
          <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <Eyebrow>Composición por etiqueta</Eyebrow>
            <div className="tight" style={{ fontSize: 16, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em', marginBottom: 16 }}>247 issues</div>

            {/* Donut */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 100 100" style={{ width: 160, height: 160, transform: 'rotate(-90deg)' }}>
                {[
                  { color: 'var(--terra)', dash: '38' },
                  { color: 'var(--moss)', dash: '22', off: -38 },
                  { color: 'var(--gold)', dash: '15', off: -60 },
                  { color: 'var(--plum)', dash: '12', off: -75 },
                  { color: 'var(--ink)', dash: '13', off: -87 },
                ].map((s, i) => (
                  <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={`${s.dash} 100`} strokeDashoffset={s.off}/>
                ))}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="tightest" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>72%</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>OPERATIVO</div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Backend', 'var(--terra)', 94, '38%'],
                ['Fiscal', 'var(--moss)', 54, '22%'],
                ['Bug', 'var(--gold)', 37, '15%'],
                ['Frontend', 'var(--plum)', 30, '12%'],
                ['Otras', 'var(--ink)', 32, '13%'],
              ].map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto auto', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: l[1] }}/>
                  <span style={{ fontWeight: 500 }}>{l[0]}</span>
                  <span className="mono tnum" style={{ color: 'var(--ink-mute)' }}>{l[2]}</span>
                  <span className="mono" style={{ color: 'var(--ink)' }}>{l[3]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team heatmap */}
        <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <Eyebrow>Equipo · throughput por miembro</Eyebrow>
              <div className="tight" style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.025em' }}>Distribución del trabajo cerrado · últimas 13 semanas</div>
            </div>
            <Chip tone="accent" icon={<IcSparkle size={11}/>}>IA: Eli está saturado · considera redistribuir</Chip>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(13, 1fr)', gap: 4 }}>
            <span/>
            {Array.from({ length: 13 }, (_, i) => (
              <span key={i} className="mono" style={{ fontSize: 9, color: 'var(--ink-mute)', textAlign: 'center' }}>W{i+1}</span>
            ))}
            {[
              ['Marina R.', 'var(--terra)', [4,3,5,7,3,8,6,9,5,7,8,6,9]],
              ['Javier C.', 'var(--moss)', [3,2,4,3,2,5,4,3,4,5,4,3,5]],
              ['Eli T.', 'var(--plum)', [8,9,7,9,10,11,9,10,12,11,9,12,13]],
              ['Diana S.', 'var(--gold)', [2,3,2,3,4,3,5,2,4,3,4,5,3]],
              ['Equipo extra', 'var(--ink-mute)', [1,1,2,3,1,2,3,1,2,1,2,3,2]],
            ].map(([name, color, week], i) => (
              <React.Fragment key={name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500 }}>
                  <Avatar name={name.slice(0,2)} color={color} size={16}/>{name}
                </div>
                {week.map((v, j) => {
                  const opacity = 0.15 + (v / 13) * 0.85;
                  return <div key={j} style={{ height: 22, background: color, opacity, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="mono tnum" style={{ fontSize: 9, color: opacity > 0.5 ? '#fff' : 'var(--ink)' }}>{v}</span>
                  </div>;
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Cumulative flow + cycle time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'var(--paper)', padding: 22, borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
            <Eyebrow>Distribución de cycle time</Eyebrow>
            <div className="tight" style={{ fontSize: 18, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>Mediana: 2.8 días · P90: 9.4 días</div>

            <svg viewBox="0 0 320 160" style={{ width: '100%', marginTop: 16 }}>
              {[40, 80, 36, 72, 56, 48, 28, 32, 18, 22, 14, 8].map((h, i) => (
                <rect key={i} x={i * 26 + 12} y={140 - h} width="20" height={h} fill={i === 2 ? 'var(--terra)' : 'var(--ink-line)'} rx="2"/>
              ))}
              <line x1="62" y1="0" x2="62" y2="140" stroke="var(--terra)" strokeWidth="1.5" strokeDasharray="3 3"/>
              <text x="66" y="14" fontSize="10" fill="var(--terra-deep)" fontFamily="Geist Mono">P50 · 2.8d</text>
              <line x1="270" y1="0" x2="270" y2="140" stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 3"/>
              <text x="244" y="14" fontSize="10" fill="var(--ink)" fontFamily="Geist Mono" textAnchor="end">P90 ↓</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)' }}>1d</span>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)' }}>12d+</span>
            </div>
          </div>

          <div style={{ background: 'var(--ink)', color: '#f0eadf', padding: 22, borderRadius: 8 }}>
            <Eyebrow style={{ color: 'var(--terra)' }}>● ATLAS · INSIGHT</Eyebrow>
            <div className="tight" style={{ fontSize: 22, fontWeight: 500, marginTop: 8, letterSpacing: '-0.025em', lineHeight: 1.25 }}>
              Tres recomendaciones para esta semana.
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Redistribuir 2-3 issues de Eli', 'Está 38% sobre el promedio del equipo. Marina y Javier tienen capacidad.'],
                ['Atender el ciclo Q3 W3 mañana', 'Hay 4 issues sin asignar que pueden cerrar antes del viernes con foco.'],
                ['Revisar bloqueos de ATL-247', 'Lleva 6 días en in-progress, 2 días sobre la mediana del equipo.'],
              ].map(([h, p], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(240,234,223,0.12)' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--terra)', minWidth: 20 }}>0{i+1}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{h}</div>
                    <div style={{ fontSize: 12, color: 'rgba(240,234,223,0.65)', marginTop: 2, lineHeight: 1.5 }}>{p}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Analytics });
