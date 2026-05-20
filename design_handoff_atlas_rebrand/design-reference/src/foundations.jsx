// Foundations: Color, Type, Iconography, Component catalog.

const ColorFoundations = () => {
  const Swatch = ({ name, hex, token, contrast = 'dark', size = 'lg' }) => (
    <div style={{ background: hex, color: contrast === 'dark' ? 'var(--ink)' : '#f0eadf', padding: size === 'lg' ? 18 : 12, borderRadius: 6, minHeight: size === 'lg' ? 120 : 84, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="mono" style={{ fontSize: 10, opacity: 0.75, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{token}</div>
      <div>
        <div className="tight" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>{name}</div>
        <div className="mono" style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{hex}</div>
      </div>
    </div>
  );
  return (
    <div className="ab" style={{ padding: '60px 72px', background: 'var(--bg-cream)' }}>
      <Eyebrow>02 · Color</Eyebrow>
      <h2 className="tightest" style={{ fontSize: 64, fontWeight: 500, margin: '12px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
        Cálidos, <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>nunca</span> fríos.
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 560, marginBottom: 36, lineHeight: 1.55 }}>
        Reemplazamos los grises azulados del sistema actual por una paleta sobre base cream.
        El acento terracota se usa con disciplina — solo en el 5% del píxel pintado — y los tonos secundarios marcan estado, no decoración.
      </p>

      <div style={{ marginBottom: 28 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Brand · primarios</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Swatch name="Cream" hex="#f5f3ee" token="--bg-cream"/>
          <Swatch name="Ink" hex="#1a1a1a" token="--ink" contrast="light"/>
          <Swatch name="Terracotta" hex="#d97757" token="--terra" contrast="light"/>
          <Swatch name="Paper" hex="#ffffff" token="--paper"/>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Estados — un color, un significado</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          <Swatch name="Moss" hex="#5d7256" token="state · success" contrast="light" size="sm"/>
          <Swatch name="Gold" hex="#c79e3d" token="state · warning" contrast="light" size="sm"/>
          <Swatch name="Rust" hex="#c54a3a" token="state · danger / urgent" contrast="light" size="sm"/>
          <Swatch name="Indigo" hex="#3d4a6b" token="state · info / low" contrast="light" size="sm"/>
          <Swatch name="Plum" hex="#6b4a5c" token="accent · alt" contrast="light" size="sm"/>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Neutrales · escala de tinta sobre cream</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
          {[
            ['#f5f3ee', '50'],['#efece4', '100'],['#e6e1d3', '200'],['#d8d2c4', '300'],['#a8a299', '500'],['#6b6660', '700'],['#2a2724', '900'],['#1a1a1a', '950'],
          ].map(([hex, n]) => (
            <div key={n} style={{ background: hex, height: 64, borderRadius: 4, border: '1px solid rgba(0,0,0,0.04)', padding: 8, color: parseInt(n) > 400 ? '#f0eadf' : 'var(--ink)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="mono" style={{ fontSize: 10, opacity: 0.7 }}>ink/{n}</div>
              <div className="mono" style={{ fontSize: 10, opacity: 0.7 }}>{hex}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 12 }}>Labels de proyecto · 8 tonos (con base cream)</Eyebrow>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['Frontend', '#d97757'], ['Backend', '#5d7256'], ['Design', '#6b4a5c'], ['Research', '#c79e3d'],
            ['Bug', '#c54a3a'], ['Infra', '#3d4a6b'], ['Docs', '#6b6660'], ['QA', '#9a7d52'],
          ].map(([name, color]) => (
            <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 99, background: color + '1f', border: `1px solid ${color}40`, fontSize: 12, color, fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: color }}/>{name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const TypeFoundations = () => (
  <div className="ab" style={{ padding: '60px 72px', background: 'var(--paper)' }}>
    <Eyebrow>02 · Tipografía</Eyebrow>
    <h2 className="tightest" style={{ fontSize: 64, fontWeight: 500, margin: '12px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
      Geist, <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>Instrument</span>, Mono.
    </h2>
    <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 600, marginBottom: 40, lineHeight: 1.55 }}>
      Geist hace el trabajo pesado — UI, headlines, body. Instrument Serif aparece solo en italics
      como acento editorial. Geist Mono se reserva para datos: IDs, fechas, números, código.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48 }}>
      <div>
        <Eyebrow style={{ marginBottom: 12 }}>Geist Sans · primaria</Eyebrow>
        <div style={{ fontSize: 96, lineHeight: 0.95, fontWeight: 500, letterSpacing: '-0.055em' }}>Aa Bb 24</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {[['Light', 300], ['Regular', 400], ['Medium', 500], ['Semibold', 600], ['Bold', 700]].map(([n, w]) => (
            <div key={n}>
              <div style={{ fontSize: 24, fontWeight: w, letterSpacing: '-0.03em' }}>Atlas</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{n} · {w}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--ink-line-soft)' }}>
          <Eyebrow style={{ marginBottom: 16 }}>Escala tipográfica</Eyebrow>
          {[
            ['Display', 72, 500, '-0.05em'],
            ['Headline 1', 40, 500, '-0.04em'],
            ['Headline 2', 28, 500, '-0.03em'],
            ['Title', 20, 500, '-0.02em'],
            ['Body L', 16, 400, '-0.01em'],
            ['Body', 14, 400, '-0.005em'],
            ['Caption', 12, 500, '0'],
          ].map(([name, size, w, tr]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '6px 0', borderBottom: '1px dashed var(--ink-line-soft)' }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', width: 80, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{name}</span>
              <span style={{ fontSize: size, fontWeight: w, letterSpacing: tr, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>El trabajo, en orden.</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{size}/{w}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 12 }}>Instrument Serif · acento</Eyebrow>
        <div className="serif" style={{ fontStyle: 'italic', fontSize: 84, lineHeight: 0.95, fontWeight: 400, color: 'var(--terra-deep)', letterSpacing: '-0.04em' }}>compounded</div>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 12, lineHeight: 1.55 }}>
          Aparece solo en italics, en taglines y eyebrow editorials. Nunca en cuerpo de texto, nunca en UI funcional. Es la "respiración" de la marca.
        </p>

        <div style={{ marginTop: 36 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Geist Mono · datos</Eyebrow>
          <div className="mono" style={{ fontSize: 14, lineHeight: 1.6, padding: 16, background: 'var(--bg-cream-2)', borderRadius: 6, border: '1px solid var(--ink-line-soft)' }}>
            <div>ATL-247 · OPEN</div>
            <div style={{ color: 'var(--ink-mute)' }}>created 2026-05-12 14:32</div>
            <div style={{ color: 'var(--moss)' }}>+ 14 commits ahead</div>
            <div style={{ color: 'var(--terra-deep)' }}>est. 6.5h · spent 4.2h</div>
          </div>
        </div>

        <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-cream)', borderRadius: 8, border: '1px solid var(--ink-line-soft)' }}>
          <Eyebrow style={{ marginBottom: 10 }}>Pairing en uso</Eyebrow>
          <div className="tight" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Cierra el trimestre <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terra-deep)' }}>sin sorpresas.</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Q3 · 2026 · 47 issues abiertas</div>
        </div>
      </div>
    </div>
  </div>
);

const Spacing = () => (
  <div className="ab" style={{ padding: '60px 72px', background: 'var(--bg-cream-2)' }}>
    <Eyebrow>02 · Espacio, esquinas, sombras</Eyebrow>
    <h2 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '12px 0 32px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
      Sistema de 4px.
    </h2>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40 }}>
      <div>
        <Eyebrow style={{ marginBottom: 16 }}>Spacing scale</Eyebrow>
        {[4, 8, 12, 16, 24, 32, 48, 64].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px dashed var(--ink-line-soft)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', width: 40 }}>s-{s}</span>
            <span style={{ width: s, height: 12, background: 'var(--terra)', borderRadius: 2 }}/>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{s}px</span>
          </div>
        ))}
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 16 }}>Radios</Eyebrow>
        {[
          ['none', 0],
          ['sm', 3],
          ['md', 6],
          ['lg', 10],
          ['pill', 99],
        ].map(([name, r]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <div style={{ width: 36, height: 36, background: 'var(--ink)', borderRadius: r }}/>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>r-{name}</span>
          </div>
        ))}
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 16 }}>Elevación</Eyebrow>
        {[
          ['none', 'flat'],
          ['100', '0 1px 0 rgba(26,26,26,0.04), 0 1px 2px rgba(26,26,26,0.06)'],
          ['200', '0 4px 12px rgba(26,26,26,0.06), 0 1px 3px rgba(26,26,26,0.08)'],
          ['300', '0 12px 32px rgba(26,26,26,0.10), 0 2px 6px rgba(26,26,26,0.06)'],
        ].map(([name, s]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
            <div style={{ width: 40, height: 28, background: 'var(--paper)', borderRadius: 4, boxShadow: name === 'none' ? 'none' : s, border: name === 'none' ? '1px solid var(--ink-line)' : '1px solid rgba(0,0,0,0.04)' }}/>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>z-{name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const IconFoundations = () => {
  const Group = ({ title, items }) => (
    <div>
      <Eyebrow style={{ marginBottom: 14 }}>{title}</Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
        {items.map(([Cmp, name]) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 10, background: 'var(--paper)', borderRadius: 4, border: '1px solid var(--ink-line-soft)' }}>
            <Cmp size={20} stroke={1.5}/>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="ab" style={{ padding: '60px 72px', background: 'var(--bg-cream)' }}>
      <Eyebrow>02 · Iconografía</Eyebrow>
      <h2 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '12px 0 8px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
        Outline para UI, <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>filled</span> para estado.
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 540, marginBottom: 36, lineHeight: 1.55 }}>
        Stroke uniforme de 1.5px. Esquinas redondeadas suaves. La versión filled se reserva para estados activos, seleccionados, o como pip de estado/prioridad.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <Group title="Navegación" items={[
          [IcHome, 'home'], [IcInbox, 'inbox'], [IcSearch, 'search'], [IcCompanies, 'companies'],
          [IcIssues, 'issues'], [IcCycle, 'cycles'], [IcModules, 'modules'], [IcPages, 'pages'],
          [IcAnalytics, 'analytics'], [IcActivity, 'activity'], [IcStar, 'favorites'], [IcSticky, 'stickies'],
          [IcArchive, 'archive'], [IcSettings, 'settings'], [IcTeam, 'team'], [IcBell, 'bell'],
        ]}/>
        <Group title="Acciones & UI" items={[
          [IcPlus, 'plus'], [IcCheck, 'check'], [IcX, 'close'], [IcChevDown, 'chev'],
          [IcFilter, 'filter'], [IcSort, 'sort'], [IcGrid, 'grid'], [IcList, 'list'],
          [IcCalendar, 'calendar'], [IcGantt, 'gantt'], [IcMore, 'more'], [IcArrow, 'arrow'],
          [IcLink, 'link'], [IcPaperclip, 'attach'], [IcComment, 'comment'], [IcFlag, 'flag'],
        ]}/>
        <Group title="Estado · pips (filled)" items={[
          [() => <StatePip state="backlog" size={20}/>, 'backlog'],
          [() => <StatePip state="todo" size={20}/>, 'todo'],
          [() => <StatePip state="in-progress" size={20}/>, 'in-prog'],
          [() => <StatePip state="started" size={20}/>, 'started'],
          [() => <StatePip state="done" size={20}/>, 'done'],
          [() => <StatePip state="cancelled" size={20}/>, 'cancelled'],
          [() => <PrioDot level="urgent" size={16}/>, 'urgent'],
          [() => <PrioDot level="high" size={16}/>, 'high'],
        ]}/>
      </div>
    </div>
  );
};

const ComponentCatalog = () => (
  <div className="ab" style={{ padding: '60px 72px', background: 'var(--paper)' }}>
    <Eyebrow>02 · Componentes</Eyebrow>
    <h2 className="tightest" style={{ fontSize: 56, fontWeight: 500, margin: '12px 0 32px', letterSpacing: '-0.05em', lineHeight: 0.95 }}>
      Piezas.
    </h2>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
      <div>
        <Eyebrow style={{ marginBottom: 12 }}>Botones</Eyebrow>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <Btn variant="primary" icon={<IcPlus size={14}/>}>Nuevo issue</Btn>
          <Btn variant="secondary">Cancelar</Btn>
          <Btn variant="accent" icon={<IcSparkle size={14}/>}>Análisis IA</Btn>
          <Btn variant="ghost">Más opciones</Btn>
          <Btn variant="destructive">Eliminar</Btn>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
          <Btn size="sm" variant="secondary">Small</Btn>
          <Btn size="md" variant="secondary">Default</Btn>
          <Btn size="lg" variant="primary" iconRight={<IcArrow size={14}/>}>Large CTA</Btn>
        </div>

        <Eyebrow style={{ marginTop: 32, marginBottom: 12 }}>Inputs</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--paper)', border: '1px solid var(--ink-line)', borderRadius: 6, fontSize: 13 }}>
            <IcSearch size={14} color="var(--ink-mute)"/>
            <span style={{ color: 'var(--ink-mute)' }}>Buscar issues, ciclos, páginas…</span>
            <span style={{ marginLeft: 'auto' }}><Kbd>⌘K</Kbd></span>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--paper)', border: '1.5px solid var(--ink)', borderRadius: 6, fontSize: 13, boxShadow: '0 0 0 4px rgba(217,119,87,0.12)' }}>
            <span>Cierre fiscal Q3</span><span style={{ borderLeft: '1.5px solid var(--ink)', marginLeft: 1, animation: 'blink 1s infinite' }}/>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-cream-2)', border: '1px solid var(--ink-line-soft)', borderRadius: 6, fontSize: 13, color: 'var(--ink-faint)' }}>
            Deshabilitado
          </div>
        </div>

        <Eyebrow style={{ marginTop: 32, marginBottom: 12 }}>Chips & badges</Eyebrow>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip dot="#5d7256">Done</Chip>
          <Chip dot="#d97757">In progress</Chip>
          <Chip dot="#c79e3d">In review</Chip>
          <Chip tone="solid" icon={<IcFlag size={11}/>}>Q3-2026</Chip>
          <Chip tone="accent">⌘ AI suggested</Chip>
          <Chip tone="moss" icon={<IcCheck size={11}/>}>On track</Chip>
        </div>
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 12 }}>Avatares</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name="MR" size={16} color="var(--terra)"/>
          <Avatar name="JC" size={24} color="var(--moss)"/>
          <Avatar name="EL" size={32} color="var(--plum)"/>
          <Avatar name="DS" size={40} color="var(--gold)"/>
          <Avatar name="AB" size={48} color="var(--ink)"/>
          <AvStack people={[{ name: 'MR', color: 'var(--terra)' }, { name: 'JC', color: 'var(--moss)' }, { name: 'EL', color: 'var(--plum)' }, { name: 'DS', color: 'var(--gold)' }, { name: 'AB', color: 'var(--ink)' }]} max={3} size={28}/>
        </div>

        <Eyebrow style={{ marginTop: 32, marginBottom: 12 }}>Card · issue row</Eyebrow>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', borderRadius: 6, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="checkbox" style={{ accentColor: 'var(--ink)' }}/>
          <StatePip state="in-progress" size={14}/>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', minWidth: 64 }}>ATL-247</span>
          <span style={{ fontSize: 13, flex: 1, fontWeight: 500, letterSpacing: '-0.01em' }}>Conciliación bancaria — agosto</span>
          <PrioDot level="high" size={11}/>
          <Chip dot="#5d7256">Backend</Chip>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>Sep 12</span>
          <Avatar name="MR" size={20} color="var(--terra)"/>
        </div>

        <Eyebrow style={{ marginTop: 32, marginBottom: 12 }}>Progress · barras</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span className="mono" style={{ color: 'var(--ink-mute)' }}>CYCLE · Q3 W3</span>
              <span className="mono" style={{ color: 'var(--ink)' }}>68%</span>
            </div>
            <Bar pct={68} color="var(--ink)"/>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span className="mono" style={{ color: 'var(--ink-mute)' }}>MODULE · Reportes</span>
              <span className="mono" style={{ color: 'var(--terra-deep)' }}>42%</span>
            </div>
            <Bar pct={42} color="var(--terra)"/>
          </div>
        </div>

        <Eyebrow style={{ marginTop: 32, marginBottom: 12 }}>Toggle / segmented</Eyebrow>
        <div style={{ display: 'inline-flex', padding: 3, background: 'var(--bg-cream-2)', borderRadius: 6, border: '1px solid var(--ink-line-soft)' }}>
          {['List', 'Board', 'Calendar', 'Gantt'].map((t, i) => (
            <button key={t} style={{ padding: '6px 12px', border: 'none', background: i === 1 ? 'var(--paper)' : 'transparent', borderRadius: 4, fontSize: 12, fontWeight: 500, color: i === 1 ? 'var(--ink)' : 'var(--ink-mute)', fontFamily: 'inherit', cursor: 'pointer', boxShadow: i === 1 ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { ColorFoundations, TypeFoundations, Spacing, IconFoundations, ComponentCatalog });
