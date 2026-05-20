// Main canvas — assembles ALL sections.

const App = () => (
  <DesignCanvas>
    <DCSection id="cover" title="01 · Atlas — rebranding TaskManager" subtitle="Propuesta completa de identidad y producto · v1.0 · 2026">
      <DCArtboard id="cover" label="Portada" width={1440} height={900}><BrandCover/></DCArtboard>
      <DCArtboard id="naming" label="Naming · 6 propuestas" width={1440} height={900}><NamingExploration/></DCArtboard>
      <DCArtboard id="voice" label="Voz & manifiesto" width={1440} height={900}><BrandVoice/></DCArtboard>
      <DCArtboard id="logo" label="Logo · sistema de marca" width={1440} height={720}><LogoLockup/></DCArtboard>
    </DCSection>

    <DCSection id="foundations" title="02 · Fundamentos" subtitle="Color · tipografía · espaciado · iconografía · catálogo de componentes">
      <DCArtboard id="color" label="Color" width={1280} height={900}><ColorFoundations/></DCArtboard>
      <DCArtboard id="type" label="Tipografía" width={1280} height={900}><TypeFoundations/></DCArtboard>
      <DCArtboard id="spacing" label="Espacio · radios · sombras" width={1280} height={600}><Spacing/></DCArtboard>
      <DCArtboard id="icons" label="Iconografía" width={1280} height={840}><IconFoundations/></DCArtboard>
      <DCArtboard id="components" label="Catálogo de componentes" width={1280} height={820}><ComponentCatalog/></DCArtboard>
    </DCSection>

    <DCSection id="auth" title="03 · Acceso & onboarding" subtitle="Login, registro, recuperación y configuración inicial del workspace.">
      <DCArtboard id="login" label="Login" width={1280} height={800}><AuthLogin/></DCArtboard>
      <DCArtboard id="register" label="Crear cuenta" width={1280} height={800}><AuthRegister/></DCArtboard>
      <DCArtboard id="forgot" label="Recuperar contraseña" width={1280} height={720}><ForgotPassword/></DCArtboard>
      <DCArtboard id="reset" label="Reset password" width={1280} height={720}><ResetPassword/></DCArtboard>
      <DCArtboard id="magic" label="Magic link · verificando" width={1280} height={720}><MagicLink/></DCArtboard>
      <DCArtboard id="onboarding" label="Onboarding · paso 2 de 4" width={1280} height={800}><Onboarding/></DCArtboard>
      <DCArtboard id="workspaces" label="Selección de workspace" width={1280} height={820}><WorkspacesList/></DCArtboard>
    </DCSection>

    <DCSection id="shell" title="04 · Shell · navegación global" subtitle="Sidebar anotado, comando ⌘K.">
      <DCArtboard id="sidebar" label="Sidebar anotado" width={1280} height={900}><SidebarCard/></DCArtboard>
      <DCArtboard id="cmdk" label="Comando ⌘K" width={1280} height={720}><CommandPalette/></DCArtboard>
    </DCSection>

    <DCSection id="home" title="05 · Home · dashboard del workspace" subtitle="La primera pantalla cada mañana + actividad, favoritos, borradores, búsqueda.">
      <DCArtboard id="home" label="Home" width={1440} height={1100}><Home/></DCArtboard>
      <DCArtboard id="activity" label="Actividad" width={1440} height={1100}><Activity/></DCArtboard>
      <DCArtboard id="favorites" label="Favoritos" width={1440} height={900}><Favorites/></DCArtboard>
      <DCArtboard id="drafts" label="Borradores" width={1440} height={900}><Drafts/></DCArtboard>
      <DCArtboard id="search" label="Búsqueda" width={1440} height={1000}><SearchPage/></DCArtboard>
    </DCSection>

    <DCSection id="companies" title="06 · Companies" subtitle="Listado de proyectos y ajustes por company.">
      <DCArtboard id="companies-list" label="Companies · todas" width={1440} height={1000}><CompaniesList/></DCArtboard>
      <DCArtboard id="company-settings" label="Company · settings" width={1440} height={1100}><CompanySettings/></DCArtboard>
    </DCSection>

    <DCSection id="issues" title="07 · Issues · cuatro vistas" subtitle="List, kanban, calendar, timeline/gantt — más triage y vistas guardadas.">
      <DCArtboard id="list" label="List view · agrupado por estado" width={1440} height={1000}><IssuesList/></DCArtboard>
      <DCArtboard id="kanban" label="Kanban board" width={1440} height={900}><IssuesKanban/></DCArtboard>
      <DCArtboard id="calendar" label="Calendar view" width={1440} height={900}><IssuesCalendar/></DCArtboard>
      <DCArtboard id="gantt" label="Timeline / Gantt" width={1440} height={900}><IssuesGantt/></DCArtboard>
      <DCArtboard id="intake" label="Intake / Triage" width={1440} height={1000}><IntakePage/></DCArtboard>
      <DCArtboard id="views" label="Vistas guardadas" width={1440} height={900}><ViewsList/></DCArtboard>
      <DCArtboard id="view-detail" label="Vista · Mis bloqueos" width={1440} height={900}><ViewDetail/></DCArtboard>
      <DCArtboard id="issue-types" label="Tipos de issue · settings" width={1440} height={900}><IssueTypes/></DCArtboard>
    </DCSection>

    <DCSection id="detail" title="08 · Issue detail" subtitle="Descripción, sub-issues, comentarios con IA, propiedades.">
      <DCArtboard id="detail" label="Issue · ATL-247" width={1440} height={1280}><IssueDetail/></DCArtboard>
    </DCSection>

    <DCSection id="cycles" title="09 · Cycles & Modules" subtitle="Ritmo del trimestre y agrupación por alcance, con detalle profundo.">
      <DCArtboard id="cycles" label="Cycles · overview" width={1440} height={1100}><CyclesOverview/></DCArtboard>
      <DCArtboard id="cycle-detail" label="Cycle · Q3 W3 detalle" width={1440} height={1200}><CycleDetail/></DCArtboard>
      <DCArtboard id="modules" label="Modules · grid" width={1440} height={900}><ModulesOverview/></DCArtboard>
      <DCArtboard id="module-detail" label="Module · Reportes detalle" width={1440} height={1100}><ModuleDetail/></DCArtboard>
    </DCSection>

    <DCSection id="recurring" title="10 · Recurrentes · plantillas automáticas" subtitle="Tareas que se repiten cada día/semana/mes — el sistema las genera por ti.">
      <DCArtboard id="recurring-list" label="Recurrentes · listado completo" width={1440} height={1400}><RecurringList/></DCArtboard>
      <DCArtboard id="recurring-detail" label="Recurrente · Conciliación Santander" width={1440} height={1300}><RecurringDetail/></DCArtboard>
    </DCSection>

    <DCSection id="pages" title="11 · Pages · documentación viva" subtitle="Lista de páginas y editor de documento.">
      <DCArtboard id="pages-list" label="Pages · listado" width={1440} height={900}><PagesList/></DCArtboard>
      <DCArtboard id="page-editor" label="Editor · sección 3.1" width={1440} height={1000}><PageEditor/></DCArtboard>
    </DCSection>

    <DCSection id="analytics" title="12 · Analytics" subtitle="Velocidad, composición y salud del equipo.">
      <DCArtboard id="analytics" label="Analytics · trimestre actual" width={1440} height={1280}><Analytics/></DCArtboard>
    </DCSection>

    <DCSection id="archives" title="13 · Archives & Estimates" subtitle="Lo cerrado, lo archivado, y configuración de estimaciones.">
      <DCArtboard id="archives" label="Archives · solo lectura" width={1440} height={900}><Archives/></DCArtboard>
      <DCArtboard id="estimates" label="Estimates · sistema y stats" width={1440} height={900}><Estimates/></DCArtboard>
    </DCSection>

    <DCSection id="inbox" title="14 · Inbox · notificaciones" subtitle="Mensajes, menciones, asignaciones — con respuestas sugeridas por IA.">
      <DCArtboard id="inbox" label="Inbox · seleccionado" width={1440} height={900}><Inbox/></DCArtboard>
      <DCArtboard id="stickies" label="Notas rápidas" width={1440} height={800}><Stickies/></DCArtboard>
    </DCSection>

    <DCSection id="settings" title="15 · Settings & Profile" subtitle="Workspace, etiquetas, webhooks, tokens, equipos, integraciones, importer.">
      <DCArtboard id="settings-states" label="Settings · estados" width={1440} height={1000}><Settings/></DCArtboard>
      <DCArtboard id="labels" label="Settings · etiquetas" width={1440} height={900}><Labels/></DCArtboard>
      <DCArtboard id="webhooks" label="Settings · webhooks" width={1440} height={1000}><Webhooks/></DCArtboard>
      <DCArtboard id="tokens" label="Settings · API tokens" width={1440} height={900}><ApiTokens/></DCArtboard>
      <DCArtboard id="teams" label="Settings · equipos & miembros" width={1440} height={1100}><Teams/></DCArtboard>
      <DCArtboard id="integrations" label="Settings · integraciones" width={1440} height={900}><Integrations/></DCArtboard>
      <DCArtboard id="importer" label="Importer · migración Jira" width={1440} height={1000}><Importer/></DCArtboard>
      <DCArtboard id="profile" label="Profile · Marina Ruiz" width={1440} height={1000}><Profile/></DCArtboard>
    </DCSection>

    <DCSection id="public" title="16 · Vistas públicas" subtitle="Boards compartibles con clientes y auditores externos sin cuenta Atlas.">
      <DCArtboard id="deploy-boards" label="Deploy boards · panel admin" width={1440} height={1000}><DeployBoards/></DCArtboard>
      <DCArtboard id="public-space" label="Public space · vista compartida" width={1440} height={900}><PublicSpace/></DCArtboard>
    </DCSection>

    <DCSection id="admin" title="17 · God Mode · super-admin" subtitle="Panel de control de la instancia completa. Solo super-admins.">
      <DCArtboard id="gm-general" label="God Mode · General" width={1440} height={1100}><GodModeGeneral/></DCArtboard>
      <DCArtboard id="gm-users" label="God Mode · Workspaces & usuarios" width={1440} height={900}><GodModeUsers/></DCArtboard>
      <DCArtboard id="gm-ai" label="God Mode · AI / Atlas Brain" width={1440} height={1100}><GodModeAi/></DCArtboard>
    </DCSection>

    <DCSection id="variations" title="18 · Tres direcciones de marca" subtitle="Misma pantalla, tres temperamentos. Para que decidas el camino.">
      <DCArtboard id="variations" label="Sober · Modern · Experimental" width={1440} height={1100}><VariantsCompare/></DCArtboard>
    </DCSection>

    <DCSection id="closer" title="19 · Cierre" subtitle="Próximos pasos.">
      <DCArtboard id="closer" label="Final" width={1440} height={820}><ClosingNotes/></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
