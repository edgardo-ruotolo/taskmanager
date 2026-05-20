// Shell pieces: Sidebar, Topbar, Command palette.

// Reusable sidebar so multiple screens can embed it.
const Sidebar = ({ active = 'home', compact = false }) => {
  const NavItem = ({ icon: I, label, k, badge, indent = 0, active: a, soft }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 6px ' + (10 + indent * 14) + 'px',
      borderRadius: 5, cursor: 'pointer',
      background: a ? 'var(--paper)' : 'transparent',
      color: a ? 'var(--ink)' : (soft ? 'var(--ink-faint)' : 'var(--ink-soft)'),
      fontSize: 13, fontWeight: a ? 500 : 400, letterSpacing: '-0.005em',
      boxShadow: a ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
      borderLeft: a ? '2px solid var(--terra)' : '2px solid transparent',
      marginLeft: -2,
    }}>
      <I size={15} color={a ? 'var(--ink)' : 'var(--ink-mute)'}/>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', background: a ? 'var(--bg-cream-3)' : 'transparent', padding: '1px 6px', borderRadius: 3 }}>{badge}</span>}
      {k && <Kbd>{k}</Kbd>}
    </div>
  );
  return (
    <aside style={{ width: compact ? 200 : 232, background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Workspace switcher */}
      <div style={{ padding: 12, borderBottom: '1px solid var(--ink-line-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 5, background: 'var(--paper)', border: '1px solid var(--ink-line-soft)', cursor: 'pointer' }}>
          <CompanyMark ch="C" color="var(--ink)" size={22}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Contadores Asoc.</div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>BUSINESS</div>
          </div>
          <IcChevDown size={12} color="var(--ink-mute)"/>
        </div>
      </div>

      {/* Search trigger */}
      <div style={{ padding: '10px 12px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 5, background: 'var(--bg-cream-3)', border: '1px solid transparent', fontSize: 12, color: 'var(--ink-mute)' }}>
          <IcSearch size={13}/>
          <span>Buscar…</span>
          <span style={{ marginLeft: 'auto' }}><Kbd>⌘K</Kbd></span>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
        <NavItem icon={IcHome} label="Home" active={active === 'home'}/>
        <NavItem icon={IcInbox} label="Inbox" badge="12" active={active === 'inbox'}/>
        <NavItem icon={IcStar} label="Favoritos" active={active === 'favorites'}/>
        <NavItem icon={IcSticky} label="Notas" active={active === 'stickies'}/>
        <NavItem icon={IcDoc} label="Borradores" active={active === 'drafts'}/>
        <NavItem icon={IcActivity} label="Actividad" active={active === 'activity'}/>
        <NavItem icon={IcAnalytics} label="Analytics" active={active === 'analytics'}/>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px 4px' }}>
          <Eyebrow>Workspace</Eyebrow>
          <IcPlus size={12} color="var(--ink-mute)"/>
        </div>
        <NavItem icon={IcPages} label="Pages" active={active === 'pages'}/>
        <NavItem icon={IcCompanies} label="Companies" active={active === 'companies'} badge="4"/>

        <div style={{ paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
          <NavItem icon={IcChevDown} label="Cierre Fiscal Q3" indent={0} active={active === 'company-active'}/>
          <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <NavItem icon={IcIssues} label="Issues" indent={0} active={active === 'issues'} badge="247"/>
            <NavItem icon={IcCycle} label="Cycles" indent={0} active={active === 'cycles'}/>
            <NavItem icon={IcModules} label="Modules" indent={0} active={active === 'modules'}/>
            <NavItem icon={IcInbox} label="Intake" indent={0} active={active === 'intake'}/>
            <NavItem icon={IcArchive} label="Archives" indent={0} soft/>
          </div>
          <NavItem icon={IcChevRight} label="Auditoría 2026" indent={0} soft/>
          <NavItem icon={IcChevRight} label="ERP Migration" indent={0} soft/>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px 4px' }}>
          <Eyebrow>Your teams</Eyebrow>
          <IcPlus size={12} color="var(--ink-mute)"/>
        </div>
        <NavItem icon={IcTeam} label="Finance Ops" badge="8" soft/>
        <NavItem icon={IcTeam} label="Engineering" badge="14" soft/>
      </nav>

      {/* User */}
      <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--ink-line-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name="MR" size={28} color="var(--terra)"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.01em' }}>Marina Ruiz</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--moss)' }}/>EN LÍNEA
          </div>
        </div>
        <IcSettings size={14} color="var(--ink-mute)"/>
      </div>
    </aside>
  );
};

// Topbar with breadcrumbs + view switcher + actions
const Topbar = ({ crumbs = [], actions, viewSwitcher, sticky = true }) => (
  <header style={{
    display: 'flex', alignItems: 'center', gap: 16, padding: '10px 24px',
    background: 'var(--bg-cream)', borderBottom: '1px solid var(--ink-line)',
    minHeight: 52, flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>/</span>}
          <span style={{
            fontSize: i === crumbs.length - 1 ? 14 : 13,
            fontWeight: i === crumbs.length - 1 ? 500 : 400,
            color: i === crumbs.length - 1 ? 'var(--ink)' : 'var(--ink-mute)',
            letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>{c.icon}{c.label}</span>
        </React.Fragment>
      ))}
    </div>
    {viewSwitcher}
    {actions}
  </header>
);

// Sidebar gallery card with annotations
const SidebarCard = () => (
  <div className="ab" style={{ padding: '40px 56px', background: 'var(--bg-cream)' }}>
    <Eyebrow>04 · Shell · Sidebar</Eyebrow>
    <h2 className="tightest" style={{ fontSize: 48, fontWeight: 500, margin: '12px 0 8px', letterSpacing: '-0.045em', lineHeight: 0.95 }}>
      Navegación que <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>respira.</span>
    </h2>
    <p style={{ fontSize: 14, color: 'var(--ink-mute)', maxWidth: 540, marginBottom: 24, lineHeight: 1.55 }}>
      Una sola columna fija, jerarquía visible, eyebrows en mono separan secciones.
      El item activo se destaca con paper + un acento terracota de 2px a la izquierda — sin pintar todo el botón.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'flex-start' }}>
      <div style={{ height: 720, overflow: 'hidden', borderRadius: 8, border: '1px solid var(--ink-line)' }}>
        <Sidebar active="issues"/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[
          ['Workspace switcher', 'Top de la sidebar. Una sola tarjeta — branding del workspace + plan en mono. Click expone otros workspaces.'],
          ['Búsqueda global', 'Trigger a comando ⌘K. Siempre visible. Cubre todo: issues, pages, comments, attachments.'],
          ['Nav primaria', 'Pestañas a nivel de workspace: Home, Inbox (badges en mono), Favoritos, Notas, Borradores, Actividad, Analytics.'],
          ['Companies expandibles', 'Cada company es un proyecto con sub-nav (Issues, Cycles, Modules, Intake, Archives). Estado expandido marcado con chev abajo.'],
          ['Your teams', 'Sección secundaria para equipos cross-company. Mismo patrón.'],
          ['Footer', 'Avatar + nombre + estado en línea (mono · pip moss). Click expone profile, status, log out.'],
        ].map(([t, d], i) => (
          <div key={i} style={{ display: 'flex', gap: 14 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--terra-deep)', minWidth: 24 }}>0{i+1}</span>
            <div>
              <div className="tight" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.015em' }}>{t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.5 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CommandPalette = () => (
  <div className="ab" style={{ background: 'rgba(26,26,26,0.45)', padding: '80px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
    {/* Behind: dimmed app preview */}
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-cream)', zIndex: -1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', height: '100%' }}>
        <div style={{ background: 'var(--bg-cream-2)', borderRight: '1px solid var(--ink-line)' }}/>
        <div style={{ padding: '20px 32px' }}>
          <div style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--ink-faint)' }}>Issues</div>
        </div>
      </div>
    </div>

    <div style={{ width: 640, maxWidth: '90%', background: 'var(--paper)', borderRadius: 12, boxShadow: '0 28px 80px rgba(26,26,26,0.25), 0 1px 0 rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--ink-line-soft)' }}>
        <IcSearch size={16} color="var(--ink-mute)"/>
        <input className="mono" placeholder="Escribe un comando o busca…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'Geist, sans-serif', letterSpacing: '-0.01em' }} defaultValue="cierre fis"/>
        <Kbd>esc</Kbd>
      </div>

      <div style={{ padding: 8, maxHeight: 460, overflow: 'auto' }}>
        <Eyebrow style={{ padding: '8px 12px 4px' }}>Coincidencias · 4</Eyebrow>
        {[
          [<StatePip state="in-progress" size={14}/>, 'Cierre fiscal Q3 · conciliaciones', 'ATL-247 · in progress', true],
          [<StatePip state="todo" size={14}/>, 'Cierre fiscal Q3 · declaración ISR', 'ATL-248 · todo'],
          [<IcPages size={14} color="var(--ink-mute)"/>, 'Manual de cierre fiscal · 2026', 'page · 14 secciones'],
          [<IcCycle size={14} color="var(--ink-mute)"/>, 'Q3 — Fiscal Close (cycle)', '12 sept – 30 sept · 68%'],
        ].map(([icon, label, sub, sel], i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 6,
            background: sel ? 'var(--bg-cream)' : 'transparent',
            border: sel ? '1px solid var(--ink-line)' : '1px solid transparent',
          }}>
            <span style={{ width: 18, display: 'flex', justifyContent: 'center' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em' }}>{label}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{sub}</div>
            </div>
            {sel && <span className="mono" style={{ fontSize: 10, color: 'var(--terra-deep)' }}>↵ ir</span>}
          </div>
        ))}

        <Eyebrow style={{ padding: '14px 12px 4px' }}>Acciones</Eyebrow>
        {[
          [<IcPlus size={14}/>, 'Crear nuevo issue', 'C'],
          [<IcCycle size={14}/>, 'Crear nuevo ciclo', null],
          [<IcSparkle size={14} color="var(--terra)"/>, 'Resumir este ciclo con IA', '⌘ I'],
          [<IcUser size={14}/>, 'Asignar issues a mí', null],
        ].map(([icon, label, kbd], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6 }}>
            <span style={{ width: 18, display: 'flex', justifyContent: 'center', color: 'var(--ink-mute)' }}>{icon}</span>
            <div style={{ flex: 1, fontSize: 13, letterSpacing: '-0.01em' }}>{label}</div>
            {kbd && <Kbd>{kbd}</Kbd>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', borderTop: '1px solid var(--ink-line-soft)', background: 'var(--bg-cream)' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 6 }}><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
        <span style={{ fontSize: 11, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 6 }}><Kbd>↵</Kbd> abrir</span>
        <span style={{ fontSize: 11, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 6 }}><Kbd>⌘</Kbd><Kbd>K</Kbd> cerrar</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <IcSparkle size={11} color="var(--terra)"/> IA puede ayudar — escribe "?"
        </span>
      </div>
    </div>
  </div>
);

Object.assign(window, { Sidebar, Topbar, SidebarCard, CommandPalette });
