import type { HelpCategory } from '../domain/types';
import {
    HelpCallout,
    HelpFieldRow,
    HelpH3,
    HelpList,
    HelpP,
    HelpScreenshot,
    HelpSteps,
} from '../presentation/components/HelpBlocks';

const SHOT = (file: string): string => `/help-screenshots/${file}.png`;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 1 · BIENVENIDA                                          */
/* ------------------------------------------------------------------ */

const welcomeSections = [
    {
        slug: 'bienvenida',
        title: 'Bienvenida',
        summary: 'Manual de usuario de TaskManager — encontrá cómo usar cada parte del sistema.',
        content: (
            <>
                <HelpP>
                    TaskManager es una plataforma de gestión de proyectos pensada para equipos que necesitan
                    coordinar tareas, ciclos de trabajo, módulos temáticos y procesos recurrentes. Esta sección
                    de Ayuda es una referencia completa de cada pantalla, botón y campo del sistema.
                </HelpP>
                <HelpH3>Cómo usar esta documentación</HelpH3>
                <HelpList>
                    <li>Usá el índice lateral para saltar a la sección que te interesa.</li>
                    <li>Cada sección incluye una descripción del propósito, la lista de acciones disponibles y los campos relevantes.</li>
                    <li>Las capturas de pantalla muestran el aspecto real de cada pantalla. Si una captura aparece en gris, todavía no fue generada para esa sección.</li>
                </HelpList>
                <HelpCallout tone="info">
                    El contenido de la Ayuda está disponible para cualquier miembro del workspace, sin importar el rol.
                </HelpCallout>
            </>
        ),
    },
    {
        slug: 'conceptos',
        title: 'Conceptos clave',
        summary: 'Glosario de términos: Workspace, Proyecto, Tarea, Ciclo, Módulo, Plantilla recurrente.',
        content: (
            <>
                <HelpP>
                    Antes de entrar en cada pantalla conviene tener claro cómo se organiza la información en
                    TaskManager. Estos son los conceptos centrales:
                </HelpP>
                <HelpH3>Workspace</HelpH3>
                <HelpP>
                    Es el contenedor de nivel superior — equivale a una organización o equipo. Cada usuario puede
                    pertenecer a varios workspaces. Toda la información (proyectos, miembros, etiquetas) vive
                    dentro de un workspace y nunca se mezcla con otro.
                </HelpP>
                <HelpH3>Proyecto</HelpH3>
                <HelpP>
                    Agrupa tareas, ciclos y módulos relacionados a un objetivo o equipo concreto. Tiene un
                    identificador corto (por ejemplo <code className="font-mono">ACME</code>) que prefija el código
                    de cada tarea (<code className="font-mono">ACME-247</code>).
                </HelpP>
                <HelpH3>Tarea (Issue)</HelpH3>
                <HelpP>
                    La unidad básica de trabajo. Tiene título, estado, prioridad, asignados, etiquetas, fechas y
                    descripción. Vive dentro de un proyecto.
                </HelpP>
                <HelpH3>Ciclo (Cycle)</HelpH3>
                <HelpP>
                    Un período de tiempo (sprint, iteración) durante el cual se trabajan ciertas tareas. Sirve
                    para acotar el alcance y medir velocidad.
                </HelpP>
                <HelpH3>Módulo (Module)</HelpH3>
                <HelpP>
                    Agrupación temática de tareas dentro de un proyecto. A diferencia del ciclo, no tiene fecha
                    de inicio/fin: agrupa por tópico (por ejemplo "Onboarding", "Pagos").
                </HelpP>
                <HelpH3>Plantilla recurrente</HelpH3>
                <HelpP>
                    Configuración que genera tareas automáticamente según una cadencia (diaria, semanal, mensual,
                    trimestral o anual). Se administra desde Configuración → Recurrentes.
                </HelpP>
            </>
        ),
    },
    {
        slug: 'navegacion',
        title: 'Navegación general',
        summary: 'Cómo moverte por la aplicación: sidebar, búsqueda global, breadcrumb.',
        content: (
            <>
                <HelpScreenshot src={SHOT('sidebar')} alt="Sidebar principal de la aplicación" />
                <HelpH3>Sidebar lateral</HelpH3>
                <HelpP>
                    El sidebar izquierdo es la barra de navegación principal. Contiene:
                </HelpP>
                <HelpList>
                    <li><strong>Inicio</strong> — pantalla de bienvenida con resumen de actividad reciente.</li>
                    <li><strong>Tu trabajo</strong> — actividad consolidada del usuario en el workspace.</li>
                    <li><strong>Análisis</strong> — métricas y dashboards.</li>
                    <li><strong>Configuración</strong> — preferencias del workspace.</li>
                    <li><strong>Ayuda</strong> — esta sección.</li>
                    <li><strong>Proyectos</strong> — listado expandible con cada proyecto del workspace y sus sub-secciones.</li>
                </HelpList>
                <HelpH3>Buscador (⌘K)</HelpH3>
                <HelpP>
                    La búsqueda global se abre con el atajo <code className="font-mono">⌘K</code> (Cmd+K en Mac,
                    Ctrl+K en Windows/Linux) o haciendo clic en la barra "Buscar…" del sidebar. Permite saltar
                    rápidamente a cualquier tarea, proyecto, ciclo o módulo del workspace.
                </HelpP>
                <HelpH3>Colapsar el sidebar</HelpH3>
                <HelpP>
                    El botón en el header del sidebar lo colapsa para dejar más espacio al contenido. Los íconos
                    siguen siendo accesibles y se ve el tooltip al pasar el cursor.
                </HelpP>
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 2 · INICIO Y ACTIVIDAD                                  */
/* ------------------------------------------------------------------ */

const homeSections = [
    {
        slug: 'inicio',
        title: 'Inicio (Home)',
        summary: 'Pantalla principal del workspace con resumen de actividad y accesos rápidos.',
        content: (
            <>
                <HelpScreenshot src={SHOT('home')} alt="Pantalla de inicio del workspace" />
                <HelpP>
                    El Inicio es el dashboard del workspace. Muestra un resumen del trabajo del usuario actual,
                    accesos rápidos a las pantallas más usadas y métricas básicas.
                </HelpP>
                <HelpH3>Qué encontrás acá</HelpH3>
                <HelpList>
                    <li>Tareas asignadas al usuario, ordenadas por prioridad y vencimiento.</li>
                    <li>Tareas creadas por el usuario.</li>
                    <li>Tareas suscritas para seguimiento.</li>
                    <li>Accesos rápidos a proyectos recientes.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'tu-trabajo',
        title: 'Tu trabajo',
        summary: 'Feed cronológico de toda la actividad del usuario en el workspace.',
        content: (
            <>
                <HelpScreenshot src={SHOT('activity')} alt="Pantalla Tu trabajo (activity)" />
                <HelpP>
                    Vista cronológica de toda la actividad relacionada con el usuario: tareas asignadas, cambios
                    de estado, comentarios recibidos, menciones y aprobaciones pendientes.
                </HelpP>
                <HelpH3>Filtros disponibles</HelpH3>
                <HelpList>
                    <li><strong>Tipo de actividad</strong> — comentarios, asignaciones, cambios de estado.</li>
                    <li><strong>Proyecto</strong> — limitar a un proyecto específico.</li>
                    <li><strong>Rango temporal</strong> — última semana, mes, todo.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'notificaciones',
        title: 'Notificaciones',
        summary: 'Bandeja de notificaciones del workspace.',
        content: (
            <>
                <HelpScreenshot src={SHOT('notifications')} alt="Bandeja de notificaciones" />
                <HelpP>
                    La bandeja de notificaciones agrupa todos los avisos del sistema. Se accede desde el ícono
                    de campana en el header o desde la URL <code className="font-mono">/{"{workspace}"}/notifications</code>.
                </HelpP>
                <HelpH3>Tipos de notificación</HelpH3>
                <HelpList>
                    <li>Te asignaron una tarea.</li>
                    <li>Comentaron en una tarea que seguís.</li>
                    <li>Te mencionaron con @ en un comentario o descripción.</li>
                    <li>Cambió el estado de una tarea de la que sos watcher.</li>
                    <li>Una tarea recurrente generó nuevas tareas.</li>
                </HelpList>
                <HelpH3>Acciones</HelpH3>
                <HelpList>
                    <li><strong>Marcar como leída</strong> — quita el indicador no leído sin abrir la tarea.</li>
                    <li><strong>Marcar todas como leídas</strong> — limpia la bandeja entera.</li>
                    <li><strong>Suscribirse / desuscribirse</strong> — controla qué tareas generan notificaciones.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'analitica',
        title: 'Análisis',
        summary: 'Dashboards y métricas del workspace.',
        content: (
            <>
                <HelpScreenshot src={SHOT('analytics')} alt="Pantalla de análisis y métricas" />
                <HelpP>
                    Visualizaciones sobre el rendimiento del workspace: tareas cerradas por período, velocidad
                    por ciclo, distribución por estado y prioridad, carga por miembro.
                </HelpP>
                <HelpH3>Filtros principales</HelpH3>
                <HelpList>
                    <li><strong>Proyecto</strong> — limita las métricas a un proyecto específico.</li>
                    <li><strong>Rango de fechas</strong> — última semana, mes, trimestre, año, o personalizado.</li>
                    <li><strong>Agrupación</strong> — por estado, prioridad, asignado, etiqueta.</li>
                </HelpList>
                <HelpCallout tone="info">
                    Los gráficos son interactivos: pasá el cursor sobre cada elemento para ver el detalle.
                </HelpCallout>
            </>
        ),
    },
    {
        slug: 'borradores',
        title: 'Borradores (Drafts)',
        summary: 'Tareas que empezaste a crear pero no enviaste.',
        content: (
            <>
                <HelpScreenshot src={SHOT('drafts')} alt="Bandeja de borradores" />
                <HelpP>
                    Cuando empezás a crear una tarea pero cerrás el diálogo sin guardar, los datos quedan como
                    borrador y aparecen acá. Útil para retomar trabajo a medio escribir sin perderlo.
                </HelpP>
                <HelpH3>Acciones</HelpH3>
                <HelpList>
                    <li><strong>Continuar editando</strong> — reabre el formulario con los datos cargados.</li>
                    <li><strong>Descartar</strong> — elimina el borrador permanentemente.</li>
                    <li><strong>Crear tarea</strong> — convierte el borrador en tarea publicada.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'buscar',
        title: 'Búsqueda global',
        summary: 'Buscador que indexa todo el contenido del workspace.',
        content: (
            <>
                <HelpScreenshot src={SHOT('search')} alt="Modal de búsqueda global" />
                <HelpP>
                    Acceso: tecla <code className="font-mono">⌘K</code> en cualquier pantalla, o desde la barra
                    "Buscar…" del sidebar.
                </HelpP>
                <HelpH3>Qué indexa</HelpH3>
                <HelpList>
                    <li>Tareas (título y descripción).</li>
                    <li>Proyectos (nombre e identificador).</li>
                    <li>Ciclos y módulos.</li>
                    <li>Etiquetas.</li>
                    <li>Plantillas recurrentes.</li>
                </HelpList>
                <HelpH3>Operadores</HelpH3>
                <HelpList>
                    <li><code className="font-mono">@usuario</code> — filtra por asignado.</li>
                    <li><code className="font-mono">#etiqueta</code> — filtra por label.</li>
                    <li><code className="font-mono">in:proyecto</code> — limita el alcance a un proyecto.</li>
                </HelpList>
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 3 · WORKSPACES                                          */
/* ------------------------------------------------------------------ */

const workspaceSections = [
    {
        slug: 'workspaces',
        title: 'Lista de Workspaces',
        summary: 'Pantalla con todos los workspaces a los que pertenecés.',
        content: (
            <>
                <HelpScreenshot src={SHOT('workspaces')} alt="Lista de workspaces del usuario" />
                <HelpP>
                    URL: <code className="font-mono">/workspaces</code>. Muestra todos los workspaces a los que
                    el usuario actual pertenece, ordenados por última actividad.
                </HelpP>
                <HelpH3>Acciones disponibles</HelpH3>
                <HelpList>
                    <li><strong>Entrar al workspace</strong> — click en la card.</li>
                    <li><strong>Crear nuevo workspace</strong> — botón "Crear workspace" arriba a la derecha.</li>
                    <li><strong>Aceptar invitación</strong> — si recibiste invitación, aparece como card pendiente.</li>
                </HelpList>
                <HelpH3>Crear un workspace nuevo</HelpH3>
                <HelpSteps
                    steps={[
                        'Hacé click en "Crear workspace".',
                        'Ingresá el nombre — generará automáticamente un slug (URL friendly).',
                        'Opcionalmente cargá un logo.',
                        'Confirmá. Quedás automáticamente como Admin del nuevo workspace.',
                    ]}
                />
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 4 · PROYECTOS                                           */
/* ------------------------------------------------------------------ */

const projectSections = [
    {
        slug: 'proyectos',
        title: 'Proyectos',
        summary: 'Listado de todos los proyectos del workspace.',
        content: (
            <>
                <HelpScreenshot src={SHOT('projects')} alt="Listado de proyectos del workspace" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects</code>. Muestra todos los proyectos
                    del workspace en formato de cards o tabla.
                </HelpP>
                <HelpH3>Filtros y vistas</HelpH3>
                <HelpList>
                    <li><strong>Vista de tarjetas / lista</strong> — toggle en el toolbar.</li>
                    <li><strong>Estado del proyecto</strong> — activo, pausado, archivado.</li>
                    <li><strong>Búsqueda</strong> — por nombre o identificador.</li>
                </HelpList>
                <HelpH3>Crear un proyecto</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nuevo proyecto" (visible solo para Admins/Leads).',
                        'Ingresá un nombre.',
                        'Definí un identificador corto en mayúsculas (ej: ACME) que prefijará los IDs de tareas.',
                        'Asigná un líder de proyecto (opcional).',
                        'Confirmá.',
                    ]}
                />
                <HelpCallout tone="warn">
                    El identificador del proyecto no se puede cambiar después de crear la primera tarea, porque
                    rompería todos los códigos existentes.
                </HelpCallout>
            </>
        ),
    },
    {
        slug: 'proyecto-config',
        title: 'Configuración del proyecto',
        summary: 'Ajustes específicos por proyecto: nombre, miembros, estado.',
        content: (
            <>
                <HelpScreenshot src={SHOT('project-settings')} alt="Configuración de un proyecto" />
                <HelpP>
                    Acceso: dentro de un proyecto, opción "Configuración" en el sidebar de proyecto. URL:
                    <code className="font-mono"> /{"{workspace}"}/projects/{"{id}"}/settings</code>.
                </HelpP>
                <HelpH3>Pestañas disponibles</HelpH3>
                <HelpList>
                    <li><strong>General</strong> — nombre, descripción, logo, estado (activo / archivado).</li>
                    <li><strong>Miembros</strong> — agregar y quitar miembros del proyecto, asignar roles.</li>
                    <li><strong>Estados</strong> — workflow específico del proyecto (opcional, hereda del workspace por defecto).</li>
                    <li><strong>Integraciones</strong> — webhooks y conexiones externas (cuando estén disponibles).</li>
                </HelpList>
                <HelpH3>Eliminar un proyecto</HelpH3>
                <HelpCallout tone="warn">
                    Eliminar un proyecto es irreversible y borra todas sus tareas, ciclos y módulos. Conviene
                    archivar en lugar de eliminar cuando ya no se usa pero querés conservar el historial.
                </HelpCallout>
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 5 · TAREAS (ISSUES)                                     */
/* ------------------------------------------------------------------ */

const issueSections = [
    {
        slug: 'tareas',
        title: 'Tareas (Issues)',
        summary: 'Listado de tareas de un proyecto con filtros, agrupado y vistas.',
        content: (
            <>
                <HelpScreenshot src={SHOT('issues')} alt="Listado de tareas dentro de un proyecto" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/issues</code>. Es la
                    pantalla principal de trabajo dentro de cada proyecto.
                </HelpP>
                <HelpH3>Modos de visualización</HelpH3>
                <HelpList>
                    <li><strong>Lista</strong> — tabla con columnas configurables.</li>
                    <li><strong>Kanban</strong> — columnas por estado, drag & drop entre ellas.</li>
                    <li><strong>Calendario</strong> — distribución por fecha de vencimiento.</li>
                    <li><strong>Gantt / Timeline</strong> — para ver dependencias y rangos.</li>
                </HelpList>
                <HelpH3>Filtros disponibles</HelpH3>
                <HelpList>
                    <li>Estado, prioridad, asignado, tipo, etiquetas.</li>
                    <li>Fechas: creada, actualizada, vence.</li>
                    <li>Ciclo, módulo.</li>
                    <li>Búsqueda por texto.</li>
                </HelpList>
                <HelpH3>Agrupar / ordenar</HelpH3>
                <HelpP>
                    El botón "Agrupar" permite agrupar la lista por estado, prioridad, asignado, etc. "Ordenar"
                    cambia el criterio interno de cada grupo.
                </HelpP>
                <HelpH3>Crear una tarea</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nueva tarea" o usá el atajo C.',
                        'Ingresá el título (obligatorio).',
                        'Opcionalmente: descripción rica con menciones, archivos y bloques.',
                        'Asigná estado, prioridad, miembros, etiquetas, ciclo, módulo, fechas.',
                        'Confirmá con Enter o el botón "Crear".',
                    ]}
                />
            </>
        ),
    },
    {
        slug: 'tarea-detalle',
        title: 'Detalle de tarea',
        summary: 'Vista completa de una tarea con descripción, comentarios, sub-tareas y propiedades.',
        content: (
            <>
                <HelpScreenshot src={SHOT('issue-detail')} alt="Detalle de una tarea individual" />
                <HelpP>
                    Se abre haciendo click en una tarea de la lista, o navegando directo a
                    <code className="font-mono"> /{"{workspace}"}/projects/{"{id}"}/issues/{"{issueId}"}</code>.
                </HelpP>
                <HelpH3>Estructura de la pantalla</HelpH3>
                <HelpList>
                    <li><strong>Centro</strong> — título editable inline, descripción rica, sub-tareas, comentarios.</li>
                    <li><strong>Panel derecho</strong> — propiedades: estado, prioridad, asignados, etiquetas, fechas, ciclo, módulo, estimación.</li>
                    <li><strong>Footer</strong> — campo de comentario nuevo con menciones.</li>
                </HelpList>
                <HelpH3>Campos del detalle</HelpH3>
                <HelpFieldRow name="Título" type="texto">
                    Editable inline haciendo click. Enter guarda; Escape cancela.
                </HelpFieldRow>
                <HelpFieldRow name="Descripción" type="rich-text">
                    Editor enriquecido con bloques: cabeceras, listas, código, imágenes, menciones @usuario.
                </HelpFieldRow>
                <HelpFieldRow name="Estado" type="select">
                    Una de las opciones del workflow del workspace (Backlog, Todo, In Progress, etc.).
                </HelpFieldRow>
                <HelpFieldRow name="Prioridad" type="select">
                    Sin prioridad, Urgente, Alta, Media, Baja.
                </HelpFieldRow>
                <HelpFieldRow name="Asignados" type="multi-select">
                    Miembros del workspace responsables. Pueden ser varios.
                </HelpFieldRow>
                <HelpFieldRow name="Etiquetas" type="multi-select">
                    Labels creadas a nivel de workspace o proyecto. Se distinguen por color.
                </HelpFieldRow>
                <HelpFieldRow name="Ciclo" type="select">
                    El sprint en el que se trabaja la tarea. Opcional.
                </HelpFieldRow>
                <HelpFieldRow name="Módulo" type="select">
                    Agrupación temática. Opcional.
                </HelpFieldRow>
                <HelpFieldRow name="Fecha de inicio / Vence" type="date">
                    Rango de trabajo de la tarea.
                </HelpFieldRow>
                <HelpFieldRow name="Estimación" type="number / select">
                    Puntos de esfuerzo o tiempo (según configuración del proyecto).
                </HelpFieldRow>
            </>
        ),
    },
    {
        slug: 'vistas',
        title: 'Vistas guardadas (Issue Views)',
        summary: 'Configuraciones predefinidas de filtros + agrupación reutilizables.',
        content: (
            <>
                <HelpScreenshot src={SHOT('views')} alt="Listado de vistas guardadas" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/views</code>. Una vista guarda
                    una combinación de filtros, agrupación y ordenamiento que se puede compartir con todo el
                    workspace y reutilizar desde cualquier proyecto.
                </HelpP>
                <HelpH3>Crear una vista</HelpH3>
                <HelpSteps
                    steps={[
                        'En cualquier listado de tareas, ajustá filtros, agrupación y ordenamiento.',
                        'Click en "Guardar como vista".',
                        'Asigná un nombre descriptivo.',
                        'Definí si es privada (solo tuya) o del workspace (visible para todos).',
                    ]}
                />
                <HelpH3>Acciones en una vista</HelpH3>
                <HelpList>
                    <li><strong>Editar</strong> — modificar filtros y guardar.</li>
                    <li><strong>Duplicar</strong> — crear una copia.</li>
                    <li><strong>Compartir</strong> — copiar el link.</li>
                    <li><strong>Eliminar</strong> — borrar la vista (no afecta tareas).</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'tipos-de-tarea',
        title: 'Tipos de tarea',
        summary: 'Categorías personalizadas de tareas (bug, feature, conciliación, etc.).',
        content: (
            <>
                <HelpScreenshot src={SHOT('issue-types')} alt="Configuración de tipos de tarea" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/issue-types</code>. Los tipos
                    permiten categorizar tareas más allá del estado: bug, feature, hotfix, conciliación, etc.
                </HelpP>
                <HelpH3>Crear un tipo</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nuevo tipo".',
                        'Asigná un nombre (ej: "Bug").',
                        'Elegí un ícono y color.',
                        'Opcionalmente, marcalo como tipo por defecto.',
                    ]}
                />
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 6 · CICLOS Y MÓDULOS                                    */
/* ------------------------------------------------------------------ */

const cycleSections = [
    {
        slug: 'ciclos',
        title: 'Ciclos (Cycles)',
        summary: 'Sprints o iteraciones con fecha de inicio y fin.',
        content: (
            <>
                <HelpScreenshot src={SHOT('cycles')} alt="Listado de ciclos del proyecto" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/cycles</code>. Los
                    ciclos son intervalos de tiempo durante los cuales el equipo se compromete a completar un
                    set de tareas.
                </HelpP>
                <HelpH3>Estados del ciclo</HelpH3>
                <HelpList>
                    <li><strong>Futuro</strong> — todavía no empezó.</li>
                    <li><strong>Actual</strong> — en curso (la fecha de hoy está dentro del rango).</li>
                    <li><strong>Finalizado</strong> — ya pasó su fecha de fin.</li>
                </HelpList>
                <HelpH3>Crear un ciclo</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nuevo ciclo".',
                        'Nombre (ej: "Sprint 24").',
                        'Fechas de inicio y fin.',
                        'Descripción opcional con objetivos del ciclo.',
                    ]}
                />
            </>
        ),
    },
    {
        slug: 'ciclo-detalle',
        title: 'Detalle de ciclo',
        summary: 'Métricas y tareas dentro de un ciclo específico.',
        content: (
            <>
                <HelpScreenshot src={SHOT('cycle-detail')} alt="Detalle de un ciclo individual" />
                <HelpP>
                    Click en un ciclo de la lista para entrar al detalle. Muestra:
                </HelpP>
                <HelpList>
                    <li><strong>Burnup / burndown chart</strong> — progreso del ciclo.</li>
                    <li><strong>Velocidad</strong> — tareas completadas vs prometidas.</li>
                    <li><strong>Distribución por estado</strong> — pie chart.</li>
                    <li><strong>Lista de tareas</strong> — todas las tareas asignadas al ciclo.</li>
                </HelpList>
                <HelpH3>Acciones sobre el ciclo</HelpH3>
                <HelpList>
                    <li><strong>Editar fechas</strong> — solo si el ciclo todavía no terminó.</li>
                    <li><strong>Mover tareas pendientes al siguiente ciclo</strong> — útil al cerrar un sprint.</li>
                    <li><strong>Cerrar ciclo</strong> — finaliza manualmente antes de la fecha.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'modulos',
        title: 'Módulos',
        summary: 'Agrupación temática de tareas (a diferencia del ciclo, no tiene fecha).',
        content: (
            <>
                <HelpScreenshot src={SHOT('modules')} alt="Listado de módulos del proyecto" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/modules</code>. Los
                    módulos agrupan tareas relacionadas a un mismo tópico (ej: "Onboarding", "Pagos",
                    "Notificaciones") sin atarlas a un rango de fechas.
                </HelpP>
                <HelpH3>Crear un módulo</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nuevo módulo".',
                        'Nombre del módulo.',
                        'Líder responsable (opcional).',
                        'Descripción y objetivos.',
                        'Color e ícono.',
                    ]}
                />
                <HelpH3>Vinculaciones</HelpH3>
                <HelpP>
                    Un módulo puede vincularse a otro mediante "Module Links" para indicar dependencias o
                    relación temática.
                </HelpP>
            </>
        ),
    },
    {
        slug: 'modulo-detalle',
        title: 'Detalle de módulo',
        summary: 'Tareas, métricas y miembros de un módulo específico.',
        content: (
            <>
                <HelpScreenshot src={SHOT('module-detail')} alt="Detalle de un módulo" />
                <HelpP>
                    Click en un módulo para acceder a su detalle: lista de tareas, métricas de progreso,
                    miembros asignados y descripción extendida.
                </HelpP>
                <HelpH3>Acciones</HelpH3>
                <HelpList>
                    <li>Agregar tareas existentes al módulo.</li>
                    <li>Asignar miembros responsables.</li>
                    <li>Crear vínculos a otros módulos.</li>
                    <li>Editar nombre, descripción y líder.</li>
                </HelpList>
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 7 · OTRAS FUNCIONALIDADES POR PROYECTO                  */
/* ------------------------------------------------------------------ */

const projectExtrasSections = [
    {
        slug: 'inbox',
        title: 'Inbox (Triage)',
        summary: 'Tareas pendientes de clasificar y aprobar.',
        content: (
            <>
                <HelpScreenshot src={SHOT('inbox')} alt="Inbox del proyecto" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/inbox</code>. Bandeja
                    de entrada de tareas que entraron al proyecto sin haber pasado por el flujo formal — por
                    ejemplo, recibidas desde un canal externo (email, formulario público).
                </HelpP>
                <HelpH3>Acciones de triage</HelpH3>
                <HelpList>
                    <li><strong>Aceptar</strong> — pasa la tarea al backlog estándar.</li>
                    <li><strong>Rechazar</strong> — descarta con motivo.</li>
                    <li><strong>Snooze</strong> — la vuelve a mostrar más tarde.</li>
                    <li><strong>Duplicar / fusionar</strong> — si ya existe una tarea similar.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'archivos',
        title: 'Archivo (Archives)',
        summary: 'Tareas archivadas del proyecto.',
        content: (
            <>
                <HelpScreenshot src={SHOT('archives')} alt="Archivo de tareas del proyecto" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/archives</code>. Lista
                    todas las tareas archivadas del proyecto. Las archivadas no aparecen en la pantalla
                    principal de issues pero se mantienen para consulta histórica.
                </HelpP>
                <HelpH3>Acciones</HelpH3>
                <HelpList>
                    <li><strong>Desarchivar</strong> — la devuelve al listado activo.</li>
                    <li><strong>Eliminar permanentemente</strong> — irreversible. Solo Admins.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'estimaciones',
        title: 'Estimaciones',
        summary: 'Configuración del sistema de estimaciones del proyecto.',
        content: (
            <>
                <HelpScreenshot src={SHOT('estimates')} alt="Configuración de estimaciones" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/estimates</code>.
                    Define cómo se estima el esfuerzo de las tareas del proyecto.
                </HelpP>
                <HelpH3>Sistemas disponibles</HelpH3>
                <HelpList>
                    <li><strong>Puntos (Fibonacci)</strong> — 1, 2, 3, 5, 8, 13, 21.</li>
                    <li><strong>T-shirt sizes</strong> — XS, S, M, L, XL, XXL.</li>
                    <li><strong>Tiempo (horas)</strong> — valor numérico libre.</li>
                    <li><strong>Personalizado</strong> — definí tu propia escala.</li>
                </HelpList>
            </>
        ),
    },
    {
        slug: 'deploy-boards',
        title: 'Deploy Boards',
        summary: 'Boards públicos compartibles del proyecto.',
        content: (
            <>
                <HelpScreenshot src={SHOT('deploy-boards')} alt="Configuración de deploy boards" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/deploy-boards</code>.
                    Permite generar URLs públicas (sin login) que muestran un subset filtrado de tareas — útil
                    para roadmaps públicos o reportes a stakeholders.
                </HelpP>
                <HelpCallout tone="warn">
                    Los deploy boards exponen información del proyecto sin autenticación. Revisá los filtros
                    antes de compartir el link.
                </HelpCallout>
            </>
        ),
    },
    {
        slug: 'importer',
        title: 'Importer',
        summary: 'Importar tareas desde fuentes externas (CSV, otras herramientas).',
        content: (
            <>
                <HelpScreenshot src={SHOT('importer')} alt="Pantalla de importación" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/projects/{"{id}"}/importer</code>.
                    Importa tareas desde un CSV o desde otra plataforma compatible.
                </HelpP>
                <HelpH3>Pasos</HelpH3>
                <HelpSteps
                    steps={[
                        'Elegí la fuente (CSV, Jira, Trello, etc.).',
                        'Subí el archivo o pegá el JSON.',
                        'Mapeá las columnas a campos de TaskManager (título, descripción, estado, asignado).',
                        'Previsualizá el resultado.',
                        'Confirmá la importación.',
                    ]}
                />
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 8 · CONFIGURACIÓN DEL WORKSPACE                         */
/* ------------------------------------------------------------------ */

const settingsSections = [
    {
        slug: 'config-general',
        title: 'Configuración › General',
        summary: 'Datos básicos del workspace: nombre, slug, logo.',
        content: (
            <>
                <HelpScreenshot src={SHOT('settings-general')} alt="Configuración general del workspace" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/general</code>. Datos generales
                    del workspace, visibles para todos los miembros y modificables por Admins.
                </HelpP>
                <HelpFieldRow name="Nombre" type="texto">Cómo se llama el workspace.</HelpFieldRow>
                <HelpFieldRow name="Slug" type="texto">
                    Identificador URL-friendly. Modificarlo rompe links existentes — usar con cuidado.
                </HelpFieldRow>
                <HelpFieldRow name="Logo" type="imagen">Imagen cuadrada (recomendado 256×256 px) que aparece en el sidebar.</HelpFieldRow>
                <HelpFieldRow name="Descripción" type="texto largo">Para referencia interna del equipo.</HelpFieldRow>
            </>
        ),
    },
    {
        slug: 'config-miembros',
        title: 'Configuración › Miembros',
        summary: 'Invitar usuarios, asignar roles, dar de baja.',
        content: (
            <>
                <HelpScreenshot src={SHOT('settings-members')} alt="Configuración de miembros" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/members</code>. Gestión de
                    miembros del workspace.
                </HelpP>
                <HelpH3>Roles disponibles</HelpH3>
                <HelpList>
                    <li><strong>Admin</strong> — control total, incluyendo configuración y facturación.</li>
                    <li><strong>Lead</strong> — puede administrar proyectos y miembros, pero no la facturación.</li>
                    <li><strong>Member</strong> — usa el workspace, no puede modificar configuración.</li>
                </HelpList>
                <HelpH3>Invitar a un usuario</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Invitar miembro".',
                        'Ingresá el email.',
                        'Elegí el rol inicial.',
                        'El usuario recibe un email con link de aceptación (válido 7 días).',
                    ]}
                />
                <HelpCallout tone="warn">
                    Quitar un miembro no elimina las tareas que creó ni las asignaciones — solo le revoca el
                    acceso al workspace.
                </HelpCallout>
            </>
        ),
    },
    {
        slug: 'config-tema',
        title: 'Configuración › Tema',
        summary: 'Personalización visual del workspace.',
        content: (
            <>
                <HelpScreenshot src={SHOT('settings-theme')} alt="Configuración de tema" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/theme</code>. Modificar la
                    apariencia del workspace.
                </HelpP>
                <HelpFieldRow name="Color de marca" type="color">Color principal usado en botones de acción primaria y elementos destacados.</HelpFieldRow>
                <HelpFieldRow name="Modo" type="select">Claro, oscuro, automático (sigue al sistema operativo).</HelpFieldRow>
                <HelpFieldRow name="Densidad" type="select">Compacta, cómoda, espaciada. Afecta el padding de listas y tablas.</HelpFieldRow>
            </>
        ),
    },
    {
        slug: 'config-equipos',
        title: 'Configuración › Equipos',
        summary: 'Agrupaciones de miembros para asignar permisos en lote.',
        content: (
            <>
                <HelpScreenshot src={SHOT('settings-teams')} alt="Configuración de equipos" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/teams</code>. Los equipos
                    permiten agrupar miembros para administrar permisos colectivos sobre proyectos.
                </HelpP>
                <HelpH3>Crear un equipo</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nuevo equipo".',
                        'Nombre del equipo (ej: "Backend", "Diseño").',
                        'Agregá miembros existentes del workspace.',
                        'Vinculá el equipo a uno o más proyectos.',
                    ]}
                />
            </>
        ),
    },
    {
        slug: 'config-proyectos',
        title: 'Configuración › Proyectos',
        summary: 'Vista administrativa de todos los proyectos del workspace.',
        content: (
            <>
                <HelpScreenshot src={SHOT('settings-projects')} alt="Configuración de proyectos a nivel workspace" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/projects</code>. Lista global
                    de proyectos con opciones administrativas (archivar, eliminar, transferir).
                </HelpP>
            </>
        ),
    },
    {
        slug: 'config-estados',
        title: 'Configuración › Estados',
        summary: 'Workflow global del workspace: estados disponibles para las tareas.',
        content: (
            <>
                <HelpScreenshot src={SHOT('settings-states')} alt="Configuración de estados globales" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/states</code>. Define los
                    estados disponibles para las tareas. Los estados están agrupados por categoría.
                </HelpP>
                <HelpH3>Categorías de estado</HelpH3>
                <HelpList>
                    <li><strong>Backlog</strong> — pendientes sin priorizar.</li>
                    <li><strong>Unstarted</strong> — listas para empezar (Todo).</li>
                    <li><strong>Started</strong> — en progreso (In Progress, In Review).</li>
                    <li><strong>Completed</strong> — finalizadas (Done).</li>
                    <li><strong>Cancelled</strong> — descartadas.</li>
                </HelpList>
                <HelpH3>Crear un estado</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nuevo estado".',
                        'Nombre del estado.',
                        'Categoría (de las 5 anteriores).',
                        'Color.',
                        'Opcionalmente, marcar como estado por defecto para tareas nuevas.',
                    ]}
                />
            </>
        ),
    },
    {
        slug: 'config-etiquetas',
        title: 'Configuración › Etiquetas',
        summary: 'Labels reutilizables para categorizar tareas transversalmente.',
        content: (
            <>
                <HelpScreenshot src={SHOT('settings-labels')} alt="Configuración de etiquetas" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/labels</code>. Las etiquetas
                    cruzan proyectos: una misma label puede usarse en tareas de cualquier proyecto del workspace.
                </HelpP>
                <HelpH3>Crear una etiqueta</HelpH3>
                <HelpSteps
                    steps={[
                        'Click en "Nueva etiqueta".',
                        'Nombre corto (ej: "Backend", "Urgent", "Q3").',
                        'Color identificativo.',
                        'Opcionalmente, descripción.',
                    ]}
                />
            </>
        ),
    },
    {
        slug: 'config-tipos',
        title: 'Configuración › Tipos de tarea',
        summary: 'Atajo a la sección de tipos de tarea (ver Tareas › Tipos).',
        content: (
            <>
                <HelpP>
                    Esta sección de configuración es la misma que se documenta en
                    <strong> Tareas › Tipos de tarea</strong>. URL:
                    <code className="font-mono"> /{"{workspace}"}/settings/issue-types</code>.
                </HelpP>
            </>
        ),
    },
    {
        slug: 'config-vistas',
        title: 'Configuración › Vistas',
        summary: 'Administración de vistas guardadas (ver Tareas › Vistas).',
        content: (
            <>
                <HelpP>
                    Esta sección replica la administración de vistas guardadas. URL:
                    <code className="font-mono"> /{"{workspace}"}/settings/views</code>. Ver documentación
                    detallada en <strong>Tareas › Vistas guardadas</strong>.
                </HelpP>
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 9 · RECURRENTES                                         */
/* ------------------------------------------------------------------ */

const recurringSections = [
    {
        slug: 'recurrentes',
        title: 'Tareas recurrentes',
        summary: 'Plantillas que generan tareas automáticamente según un calendario.',
        content: (
            <>
                <HelpScreenshot src={SHOT('recurring-list')} alt="Listado de plantillas recurrentes" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/recurring</code>. Las plantillas
                    recurrentes son configuraciones que generan tareas nuevas automáticamente según una cadencia.
                    Útil para cierres mensuales, conciliaciones, reportes regulatorios y cualquier trabajo que se
                    repite con regularidad.
                </HelpP>
                <HelpH3>Cómo funciona</HelpH3>
                <HelpSteps
                    steps={[
                        'Definís una plantilla con cadencia (diaria, semanal, mensual, trimestral, anual).',
                        'Configurás los datos de la tarea a generar: título, descripción, asignados, etiquetas, prioridad, proyectos destino.',
                        'El sistema calcula la próxima ejecución (NextRunAt).',
                        'Cuando llega esa fecha/hora, un proceso en background crea las tareas automáticamente.',
                        'El historial de ejecuciones queda registrado en la pestaña Historial del detalle.',
                    ]}
                />
                <HelpH3>Filtros del listado</HelpH3>
                <HelpList>
                    <li><strong>Todas</strong> — todas las plantillas (activas + pausadas).</li>
                    <li><strong>Activas</strong> — solo las que están generando tareas.</li>
                    <li><strong>Diarias, Semanales, Mensuales, Trimestrales, Anuales</strong> — por cadencia.</li>
                    <li><strong>Pausadas</strong> — temporalmente detenidas.</li>
                </HelpList>
                <HelpH3>Acciones por plantilla</HelpH3>
                <HelpList>
                    <li><strong>Editar</strong> — modificar cualquier campo.</li>
                    <li><strong>Duplicar</strong> — clonar la plantilla con sufijo "(copia)", arranca pausada.</li>
                    <li><strong>Pausar / Reanudar</strong> — detener o reactivar la generación.</li>
                    <li><strong>Omitir próxima</strong> — salta la siguiente ejecución (se puede cancelar).</li>
                    <li><strong>Ejecutar ahora</strong> — fuerza la generación sin esperar al schedule.</li>
                    <li><strong>Eliminar</strong> — borra la plantilla (las tareas ya generadas se conservan).</li>
                </HelpList>
                <HelpCallout tone="warn">
                    Solo los Admins y Leads del workspace pueden crear, editar o eliminar plantillas recurrentes.
                </HelpCallout>
            </>
        ),
    },
    {
        slug: 'recurrente-crear',
        title: 'Crear una plantilla recurrente',
        summary: 'Detalle de cada campo del formulario.',
        content: (
            <>
                <HelpScreenshot src={SHOT('recurring-form')} alt="Formulario de creación de plantilla recurrente" />
                <HelpH3>Sección Recurrencia</HelpH3>
                <HelpFieldRow name="Frecuencia" type="select">
                    Diario, Semanal, Mensual, Trimestral, Anual.
                </HelpFieldRow>
                <HelpFieldRow name="Intervalo" type="number">
                    Cada cuántas unidades. Ejemplo: Mensual con intervalo 2 = cada 2 meses.
                </HelpFieldRow>
                <HelpFieldRow name="Días de la semana" type="multi-select">
                    Solo si la frecuencia es Semanal. Convención: 0=Lun, 1=Mar, …, 6=Dom.
                </HelpFieldRow>
                <HelpFieldRow name="Día del mes" type="number">
                    Requerido para Mensual, Trimestral y Anual. Si el mes no tiene ese día (ej: 31 en febrero), usa el último día disponible.
                </HelpFieldRow>
                <HelpFieldRow name="Mes del año" type="number">
                    Requerido solo para Anual (1=enero, 12=diciembre).
                </HelpFieldRow>
                <HelpFieldRow name="Hora de ejecución" type="time">
                    Hora del día en que se generan las tareas.
                </HelpFieldRow>
                <HelpFieldRow name="Zona horaria" type="texto">
                    Ej: America/Argentina/Buenos_Aires. La hora se interpreta en esa zona.
                </HelpFieldRow>
                <HelpFieldRow name="Comienza el" type="date">
                    Primera fecha en que se puede ejecutar.
                </HelpFieldRow>
                <HelpFieldRow name="Termina el" type="date">
                    Opcional. Si se define, la plantilla deja de generar después de esa fecha.
                </HelpFieldRow>

                <HelpH3>Sección Plantilla de tarea</HelpH3>
                <HelpFieldRow name="Proyectos" type="multi-select">
                    Obligatorio: al menos uno. Cada ejecución crea una tarea en CADA proyecto seleccionado.
                </HelpFieldRow>
                <HelpFieldRow name="Asignados" type="multi-select">
                    Miembros que serán asignados automáticamente a cada tarea generada.
                </HelpFieldRow>
                <HelpFieldRow name="Etiquetas" type="multi-select">
                    Labels aplicadas a cada tarea generada.
                </HelpFieldRow>
                <HelpFieldRow name="Prioridad" type="select">
                    Sin prioridad, Urgente, Alta, Media, Baja.
                </HelpFieldRow>
                <HelpFieldRow name="Grupo de estado" type="select">
                    Categoría del estado inicial (Sin iniciar, Iniciado, Completado, Cancelado).
                </HelpFieldRow>
                <HelpFieldRow name="Tipo de tarea" type="select">
                    Issue type aplicado a las tareas generadas. Opcional.
                </HelpFieldRow>
                <HelpFieldRow name="Offset fecha inicio (días)" type="number">
                    Días desde la generación para fijar la fecha de inicio de la tarea.
                </HelpFieldRow>
                <HelpFieldRow name="Offset fecha objetivo (días)" type="number">
                    Días desde la generación para fijar la fecha de vencimiento.
                </HelpFieldRow>
            </>
        ),
    },
    {
        slug: 'recurrente-detalle',
        title: 'Detalle de plantilla recurrente',
        summary: 'Configuración, historial y próximas ejecuciones.',
        content: (
            <>
                <HelpScreenshot src={SHOT('recurring-detail')} alt="Detalle de una plantilla recurrente" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/settings/recurring/{"{id}"}</code>.
                    Tiene tres pestañas:
                </HelpP>
                <HelpH3>Configuración</HelpH3>
                <HelpP>
                    Muestra todos los campos actuales de la plantilla en formato lectura. Para modificar usá
                    el botón "Editar" del header.
                </HelpP>
                <HelpH3>Historial</HelpH3>
                <HelpP>
                    Cada ejecución (run) queda registrada con: fecha programada, fecha real de ejecución,
                    estado (exitoso, fallido, omitido) y cuántas tareas generó.
                </HelpP>
                <HelpH3>Próximas ejecuciones</HelpH3>
                <HelpP>
                    Calcula las próximas 5 fechas en que la plantilla generaría tareas, según la cadencia
                    configurada. La primera fecha aparece destacada en color de marca.
                </HelpP>
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  CATEGORÍA 10 · CUENTA Y PERFIL                                    */
/* ------------------------------------------------------------------ */

const accountSections = [
    {
        slug: 'perfil',
        title: 'Perfil de usuario',
        summary: 'Datos personales, foto, password y preferencias.',
        content: (
            <>
                <HelpScreenshot src={SHOT('profile')} alt="Pantalla de perfil de usuario" />
                <HelpP>
                    URL: <code className="font-mono">/{"{workspace}"}/profile</code>. Datos personales del
                    usuario autenticado, válidos para todos los workspaces.
                </HelpP>
                <HelpH3>Pestañas</HelpH3>
                <HelpFieldRow name="General" type="">
                    Nombre, apellido, display name, foto de perfil.
                </HelpFieldRow>
                <HelpFieldRow name="Seguridad" type="">
                    Cambio de contraseña, sesiones activas, autenticación de dos factores.
                </HelpFieldRow>
                <HelpFieldRow name="Notificaciones" type="">
                    Preferencias de qué notificaciones recibir y por qué canal (email, in-app).
                </HelpFieldRow>
                <HelpFieldRow name="Apariencia" type="">
                    Tema personal (claro, oscuro, sistema), idioma, densidad.
                </HelpFieldRow>
            </>
        ),
    },
] as const;

/* ------------------------------------------------------------------ */
/*  ESTRUCTURA FINAL DEL ÍNDICE                                       */
/* ------------------------------------------------------------------ */

export const HELP_CATEGORIES: HelpCategory[] = [
    { id: 'inicio', label: 'Inicio', sections: [...welcomeSections] },
    { id: 'panel', label: 'Panel y actividad', sections: [...homeSections] },
    { id: 'workspaces', label: 'Workspaces', sections: [...workspaceSections] },
    { id: 'proyectos', label: 'Proyectos', sections: [...projectSections] },
    { id: 'tareas', label: 'Tareas', sections: [...issueSections] },
    { id: 'ciclos-modulos', label: 'Ciclos y módulos', sections: [...cycleSections] },
    { id: 'extras-proyecto', label: 'Inbox · Archivo · Importer', sections: [...projectExtrasSections] },
    { id: 'configuracion', label: 'Configuración del workspace', sections: [...settingsSections] },
    { id: 'recurrentes', label: 'Tareas recurrentes', sections: [...recurringSections] },
    { id: 'cuenta', label: 'Cuenta', sections: [...accountSections] },
];

export const ALL_SECTIONS = HELP_CATEGORIES.flatMap((cat) => cat.sections);

export const findSection = (slug: string): (typeof ALL_SECTIONS)[number] | undefined =>
    ALL_SECTIONS.find((s) => s.slug === slug);
