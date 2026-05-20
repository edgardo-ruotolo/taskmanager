// God Mode — admin / super-admin pages.

const GodModeSidebar = ({ active = 0 }) => (
  <aside style={{ background: '#0f0f10', color: '#e6e1d3', width: 240, padding: 0, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
    <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'var(--terra)', color: '#fff' }}>
          <IcLock size={14}/>
        </span>
        <div>
          <div className="tight" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.025em' }}>God Mode</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(230,225,211,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SUPER-ADMIN</div>
        </div>
      </div>
    </div>

    <nav style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflow: 'auto' }}>
      <Eyebrow style={{ paddingLeft: 8, color: 'rgba(230,225,211,0.4)', marginTop: 8, marginBottom: 8 }}>Instancia</Eyebrow>
      {[
        [<IcSettings size={14}/>, 'General'],
        [<IcMail size={14}/>, 'Email'],
        [<IcKey size={14}/>, 'Authentication'],
        [<IcSparkle size={14}/>, 'AI · Atlas Brain'],
        [<IcLayers size={14}/>, 'Storage & files'],
      ].map((item, i) => (
        <div key={i} style={{
          padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer',
          background: i === active ? 'rgba(255,255,255,0.06)' : 'transparent',
          color: i === active ? '#f0eadf' : 'rgba(230,225,211,0.7)',
          fontWeight: i === active ? 500 : 400,
          borderLeft: i === active ? '2px solid var(--terra)' : '2px solid transparent',
          marginLeft: -2,
          display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.005em',
        }}>
          {item[0]}<span>{item[1]}</span>
        </div>
      ))}

      <Eyebrow style={{ paddingLeft: 8, color: 'rgba(230,225,211,0.4)', marginTop: 16, marginBottom: 8 }}>Datos</Eyebrow>
      {[
        [<IcUser size={14}/>, 'Usuarios', '4.8k'],
        [<IcLayers size={14}/>, 'Workspaces', '147'],
        [<IcCompanies size={14}/>, 'Companies', '412'],
        [<IcIssues size={14}/>, 'Estados globales', null],
      ].map((item, i) => (
        <div key={'d'+i} style={{
          padding: '7px 10px', fontSize: 12.5, borderRadius: 4, cursor: 'pointer',
          background: 5 + i === active ? 'rgba(255,255,255,0.06)' : 'transparent',
          color: 5 + i === active ? '#f0eadf' : 'rgba(230,225,211,0.7)',
          fontWeight: 5 + i === active ? 500 : 400,
          borderLeft: 5 + i === active ? '2px solid var(--terra)' : '2px solid transparent',
          marginLeft: -2,
          display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.005em',
        }}>
          {item[0]}<span style={{ flex: 1 }}>{item[1]}</span>
          {item[2] && <span className="mono" style={{ fontSize: 10, color: 'rgba(230,225,211,0.4)' }}>{item[2]}</span>}
        </div>
      ))}
    </nav>

    <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--moss)' }}/>
      <span className="mono" style={{ fontSize: 10, color: 'rgba(230,225,211,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sistema operativo</span>
      <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(230,225,211,0.6)' }}>v 4.2.8</span>
    </div>
  </aside>
);

const GodModeTopbar = () => (
  <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: '#161514', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#e6e1d3' }}>
    <span style={{ fontSize: 12, color: 'rgba(230,225,211,0.5)' }}>God Mode</span>
    <span style={{ fontSize: 11, color: 'rgba(230,225,211,0.3)' }}>/</span>
    <span style={{ fontSize: 13, fontWeight: 500 }}>General</span>
    <div style={{ flex: 1 }}/>
    <Chip tone="accent" style={{ padding: '2px 8px' }}>● PRODUCCIÓN</Chip>
    <span className="mono" style={{ fontSize: 11, color: 'rgba(230,225,211,0.5)', letterSpacing: '0.1em' }}>AS · marina.ruiz · super-admin</span>
  </header>
);

const GodModeGeneral = () => (
  <div className="ab ab-dark" style={{ display: 'flex', height: '100%', background: '#0a0a0a' }}>
    <GodModeSidebar active={0}/>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto', color: '#e6e1d3' }}>
      <GodModeTopbar/>

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <Eyebrow style={{ color: 'rgba(230,225,211,0.5)' }}>Salud de la instancia · refresh cada 30 s</Eyebrow>
          <h1 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
            Estado global.
          </h1>
        </div>

        {/* Health cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            ['API · latency', '47', 'ms p95', 'var(--moss)', '↘ -8 ms'],
            ['Uptime · 30d', '99.98', '%', 'var(--moss)', '+ 0.02 vs mes'],
            ['Active users', '2,148', 'last 24h', 'var(--terra)', '+ 12%'],
            ['Storage', '4.2 TB', 'de 10 TB', 'var(--gold)', '+ 180 GB sem.'],
            ['Errors · 1h', '12', 'todos 4xx', 'var(--moss)', 'normal'],
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Eyebrow style={{ color: 'rgba(230,225,211,0.5)' }}>{s[0]}</Eyebrow>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                <span className="tightest tnum" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.04em', color: s[3] }}>{s[1]}</span>
                <span style={{ fontSize: 11, color: 'rgba(230,225,211,0.5)' }}>{s[2]}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: s[3], marginTop: 6, letterSpacing: '0.05em' }}>{s[4]}</div>
            </div>
          ))}
        </div>

        {/* Traffic chart */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 22, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Eyebrow style={{ color: 'rgba(230,225,211,0.5)' }}>Tráfico API · últimas 24 horas</Eyebrow>
              <div className="tight" style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.025em' }}>1.2M requests · pico 14:32</div>
            </div>
            <Btn size="sm" variant="secondary" style={{ background: 'rgba(255,255,255,0.05)', color: '#e6e1d3', borderColor: 'rgba(255,255,255,0.1)' }}>Exportar</Btn>
          </div>

          <svg viewBox="0 0 800 160" style={{ width: '100%', marginTop: 16 }}>
            {Array.from({ length: 24 }, (_, i) => {
              const h = 40 + Math.sin(i / 24 * Math.PI * 2) * 30 + Math.random() * 25;
              return <rect key={i} x={i * 33 + 4} y={160 - h} width="25" height={h} fill={i === 14 ? 'var(--terra)' : 'rgba(217,119,87,0.4)'} rx="2"/>;
            })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
              <span key={i} className="mono" style={{ fontSize: 9.5, color: 'rgba(230,225,211,0.4)' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Two-col: workspaces & queue */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Eyebrow style={{ color: 'rgba(230,225,211,0.5)' }}>Workspaces con más actividad · 24h</Eyebrow>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Contadores Asociados', 14872, 'Business', true],
                ['Fluentoc Internal', 8923, 'Business'],
                ['Grupo Cervantes', 4287, 'Pro'],
                ['Auditores XYZ', 2911, 'Pro'],
                ['Distribuidora ABC', 1872, 'Free'],
              ].map((w, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.025)', borderRadius: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.005em' }}>{w[0]}</span>
                  <span className="mono tnum" style={{ fontSize: 12, color: 'rgba(230,225,211,0.7)', textAlign: 'right' }}>{w[1].toLocaleString()}</span>
                  <Chip tone={w[2] === 'Business' ? 'accent' : 'solid'} style={{ justifySelf: 'flex-end', padding: '1px 7px', fontSize: 10 }}>{w[2]}</Chip>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Eyebrow style={{ color: 'rgba(230,225,211,0.5)' }}>Job queue · workers</Eyebrow>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Email send', 0, 0, 'var(--moss)', 'idle'],
                ['Webhook deliveries', 14, 0, 'var(--terra)', 'running'],
                ['Recurrente · daily generation', 0, 0, 'var(--moss)', 'idle'],
                ['Search index rebuild', 47, 2, 'var(--gold)', 'running'],
                ['File OCR · invoices', 0, 8, '#c54a3a', 'backed up'],
                ['AI · embeddings refresh', 23, 0, 'var(--terra)', 'running'],
              ].map((j, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 50px 50px 90px', alignItems: 'center', gap: 12, fontSize: 11.5, padding: '6px 12px', background: 'rgba(255,255,255,0.025)', borderRadius: 4 }}>
                  <span style={{ fontWeight: 500 }}>{j[0]}</span>
                  <span className="mono tnum" style={{ textAlign: 'right', color: 'rgba(230,225,211,0.7)' }}>{j[1]} run</span>
                  <span className="mono tnum" style={{ textAlign: 'right', color: j[2] > 0 ? '#c54a3a' : 'rgba(230,225,211,0.4)' }}>{j[2]} fail</span>
                  <span className="mono" style={{ color: j[3], fontSize: 10, letterSpacing: '0.08em', textAlign: 'right' }}>● {j[4]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GodModeUsers = () => (
  <div className="ab ab-dark" style={{ display: 'flex', height: '100%', background: '#0a0a0a' }}>
    <GodModeSidebar active={6}/>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto', color: '#e6e1d3' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: '#161514', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 12, color: 'rgba(230,225,211,0.5)' }}>God Mode</span>
        <span style={{ fontSize: 11, color: 'rgba(230,225,211,0.3)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Workspaces & usuarios</span>
        <div style={{ flex: 1 }}/>
        <Btn size="sm" variant="secondary" style={{ background: 'rgba(255,255,255,0.05)', color: '#e6e1d3', borderColor: 'rgba(255,255,255,0.1)' }} icon={<IcDownload size={13}/>}>Exportar CSV</Btn>
        <Btn size="sm" variant="accent">Suspender workspace</Btn>
      </header>

      <div style={{ padding: '32px 40px' }}>
        <Eyebrow style={{ color: 'rgba(230,225,211,0.5)' }}>147 workspaces · 4,872 usuarios · 412 companies</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 24px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Workspaces & usuarios.
        </h1>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, flex: 1, fontSize: 12 }}>
            <IcSearch size={13} color="rgba(230,225,211,0.5)"/>
            <span style={{ color: 'rgba(230,225,211,0.5)' }}>Buscar workspace, slug, owner email…</span>
          </div>
          <Btn size="sm" variant="secondary" style={{ background: 'rgba(255,255,255,0.05)', color: '#e6e1d3', borderColor: 'rgba(255,255,255,0.1)' }} icon={<IcFilter size={13}/>}>Plan · todos</Btn>
          <Btn size="sm" variant="secondary" style={{ background: 'rgba(255,255,255,0.05)', color: '#e6e1d3', borderColor: 'rgba(255,255,255,0.1)' }}>Estado · todos</Btn>
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '24px 1.4fr 1fr 80px 70px 90px 100px 100px 24px', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[null, 'Workspace', 'Owner', 'Plan', 'Miembros', 'Issues', 'Storage', 'Estado', null].map((c, i) => (
              <span key={i} className="mono" style={{ fontSize: 10, color: 'rgba(230,225,211,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c}</span>
            ))}
          </div>
          {[
            { n: 'Contadores Asociados', slug: 'contadores-asoc', owner: 'marina.ruiz@atlas.work', plan: 'Business', mem: 14, iss: '4.2k', stor: '847 MB', stat: 'active' },
            { n: 'Fluentoc Internal', slug: 'fluentoc', owner: 'admin@fluentoc.com', plan: 'Business', mem: 28, iss: '12.8k', stor: '1.2 GB', stat: 'active' },
            { n: 'Grupo Cervantes', slug: 'cervantes', owner: 'cfo@grupocervantes.mx', plan: 'Pro', mem: 6, iss: '892', stor: '230 MB', stat: 'active' },
            { n: 'Auditores XYZ', slug: 'audit-xyz', owner: 'team@auditoresxyz.com', plan: 'Pro', mem: 4, iss: '478', stor: '124 MB', stat: 'active' },
            { n: 'Distribuidora ABC', slug: 'dist-abc', owner: 'ops@dist-abc.mx', plan: 'Free', mem: 3, iss: '94', stor: '38 MB', stat: 'active' },
            { n: 'Acme Test Workspace', slug: 'acme-test', owner: 'demo@example.com', plan: 'Free', mem: 1, iss: '2', stor: '1 MB', stat: 'suspended' },
            { n: 'Old Corp Inc', slug: 'old-corp', owner: 'oldcorp@example.com', plan: 'Free', mem: 0, iss: '0', stor: '0 MB', stat: 'pending' },
          ].map((w, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1.4fr 1fr 80px 70px 90px 100px 100px 24px', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)', opacity: w.stat === 'suspended' || w.stat === 'pending' ? 0.7 : 1 }}>
              <input type="checkbox"/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{w.n}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(230,225,211,0.5)' }}>/{w.slug}</div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(230,225,211,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.owner}</span>
              <Chip tone={w.plan === 'Business' ? 'accent' : 'solid'} style={{ padding: '1px 7px', fontSize: 10, justifySelf: 'flex-start' }}>{w.plan}</Chip>
              <span className="mono tnum" style={{ fontSize: 11.5, color: 'rgba(230,225,211,0.7)' }}>{w.mem}</span>
              <span className="mono tnum" style={{ fontSize: 11.5, color: 'rgba(230,225,211,0.7)' }}>{w.iss}</span>
              <span className="mono tnum" style={{ fontSize: 11.5, color: 'rgba(230,225,211,0.7)' }}>{w.stor}</span>
              <span className="mono" style={{ fontSize: 10, color: w.stat === 'active' ? 'var(--moss)' : (w.stat === 'suspended' ? '#c54a3a' : 'var(--gold)'), letterSpacing: '0.08em', textTransform: 'uppercase' }}>● {w.stat}</span>
              <IcMore size={14} color="rgba(230,225,211,0.4)" style={{ cursor: 'pointer' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const GodModeAi = () => (
  <div className="ab ab-dark" style={{ display: 'flex', height: '100%', background: '#0a0a0a' }}>
    <GodModeSidebar active={3}/>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto', color: '#e6e1d3' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: '#161514', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 12, color: 'rgba(230,225,211,0.5)' }}>God Mode</span>
        <span style={{ fontSize: 11, color: 'rgba(230,225,211,0.3)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>AI · Atlas Brain</span>
        <div style={{ flex: 1 }}/>
        <Chip tone="moss" style={{ padding: '2px 8px' }}>● Operativo</Chip>
      </header>

      <div style={{ padding: '32px 40px' }}>
        <Eyebrow style={{ color: 'rgba(230,225,211,0.5)' }}>Configuración de la capa de IA</Eyebrow>
        <h1 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
          Atlas <span className="serif" style={{ fontStyle: 'italic', color: 'var(--terra)', fontWeight: 400 }}>Brain.</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(230,225,211,0.6)', marginTop: 8, maxWidth: 600, lineHeight: 1.55 }}>
          Modelos, providers, límites de uso, y políticas de retención de prompts.
        </p>

        {/* Provider selector */}
        <div style={{ marginTop: 28 }}>
          <Eyebrow style={{ color: 'rgba(230,225,211,0.5)', marginBottom: 12 }}>Provider primario</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { name: 'Anthropic', model: 'claude-haiku-4-5', tag: 'primary', active: true, latency: '142 ms', cost: '$0.002/req' },
              { name: 'OpenAI', model: 'gpt-4-turbo', tag: 'fallback', latency: '218 ms', cost: '$0.003/req' },
              { name: 'Google', model: 'gemini-2.0-pro', tag: 'embeddings', latency: '94 ms', cost: '$0.001/req' },
              { name: 'Local · Ollama', model: 'qwen3-32b', tag: 'private', latency: '380 ms', cost: 'free · on-prem' },
            ].map((p, i) => (
              <div key={i} style={{
                background: p.active ? 'rgba(217,119,87,0.12)' : 'rgba(255,255,255,0.03)',
                border: p.active ? '1.5px solid var(--terra)' : '1px solid rgba(255,255,255,0.06)',
                padding: 16, borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="tight" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.02em' }}>{p.name}</div>
                  <Chip tone={p.active ? 'accent' : 'solid'} style={{ padding: '1px 7px', fontSize: 10 }}>{p.tag}</Chip>
                </div>
                <div className="mono" style={{ fontSize: 11, color: p.active ? 'var(--terra)' : 'rgba(230,225,211,0.5)', marginTop: 6 }}>{p.model}</div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'rgba(230,225,211,0.5)' }}>{p.latency}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'rgba(230,225,211,0.5)' }}>{p.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities matrix */}
        <div style={{ marginTop: 32 }}>
          <Eyebrow style={{ color: 'rgba(230,225,211,0.5)', marginBottom: 12 }}>Capabilities</Eyebrow>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
            {[
              ['Resumen de issue', '8.7k usos/día', true, '$2.1k/mes', 'haiku-4-5'],
              ['Sugerencias en comentarios', '12.4k usos/día', true, '$3.4k/mes', 'haiku-4-5'],
              ['Detección de duplicados', '4.2k usos/día', true, '$1.8k/mes', 'gemini-2.0-pro · embeddings'],
              ['Búsqueda semántica', '47k consultas/día', true, '$5.2k/mes', 'gemini-2.0-pro · embeddings'],
              ['Auto-asignación inteligente', '1.8k usos/día', false, '— pausado', '—'],
              ['Generación de reportes', '247 usos/día', true, '$890/mes', 'claude-sonnet-4'],
            ].map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px 200px 50px', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{c[0]}</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(230,225,211,0.7)' }}>{c[1]}</span>
                <span className="mono" style={{ fontSize: 11, color: c[2] ? 'var(--moss)' : 'rgba(230,225,211,0.5)' }}>{c[3]}</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(230,225,211,0.5)' }}>{c[4]}</span>
                <span style={{ width: 32, height: 18, borderRadius: 99, background: c[2] ? 'var(--terra)' : 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0, justifySelf: 'flex-end' }}>
                  <span style={{ position: 'absolute', top: 2, left: c[2] ? 16 : 2, width: 14, height: 14, borderRadius: 99, background: '#fff', transition: 'left .15s' }}/>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy block */}
        <div style={{ marginTop: 28, padding: 20, background: 'rgba(217,119,87,0.08)', border: '1px solid rgba(217,119,87,0.2)', borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <IcLock size={18} color="var(--terra)" style={{ flexShrink: 0, marginTop: 2 }}/>
            <div>
              <div className="tight" style={{ fontSize: 14, fontWeight: 500, color: 'var(--terra)' }}>Política de retención de prompts</div>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'rgba(230,225,211,0.75)', lineHeight: 1.55 }}>
                Los prompts y completions se mantienen 24 horas para debugging y luego se eliminan. No se usan para entrenar modelos externos. Workspaces en plan Business pueden activar <span className="mono" style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 3 }}>zero-retention</span> y enrutarse exclusivamente al provider on-prem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { GodModeGeneral, GodModeUsers, GodModeAi });
