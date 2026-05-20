// Outline icons — simple, geometric, 1.5px stroke. Filled variants where useful.
// All 16x16 default unless overridden.

const Icon = ({ size = 16, stroke = 1.5, fill = 'none', color = 'currentColor', children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {children}
  </svg>
);

const IcHome = (p) => <Icon {...p}><path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/></Icon>;
const IcInbox = (p) => <Icon {...p}><path d="M3 5h18v14H3z"/><path d="M3 12h5l2 3h4l2-3h5"/></Icon>;
const IcSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const IcCompanies = (p) => <Icon {...p}><path d="M3 21V7l6-3 6 3v14"/><path d="M15 21V11l6 2v8"/><path d="M9 12h2M9 16h2M9 8h2M19 16h0M19 18h0"/></Icon>;
const IcIssues = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></Icon>;
const IcCycle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IcModules = (p) => <Icon {...p}><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></Icon>;
const IcPages = (p) => <Icon {...p}><path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></Icon>;
const IcStar = (p) => <Icon {...p}><path d="M12 3 14.5 9l6.5.5-5 4.3 1.5 6.2L12 16.7 6.5 20l1.5-6.2-5-4.3L9.5 9z"/></Icon>;
const IcAnalytics = (p) => <Icon {...p}><path d="M4 20V8M10 20v-6M16 20V12M22 20V4"/></Icon>;
const IcActivity = (p) => <Icon {...p}><path d="M3 12h4l3-8 4 16 3-8h4"/></Icon>;
const IcSticky = (p) => <Icon {...p}><path d="M5 3h14v12l-4 6H5z"/><path d="M19 15h-4v6"/></Icon>;
const IcSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;
const IcPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IcChevDown = (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
const IcChevRight = (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>;
const IcChevLeft = (p) => <Icon {...p}><path d="m15 6-6 6 6 6"/></Icon>;
const IcCheck = (p) => <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>;
const IcFilter = (p) => <Icon {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Icon>;
const IcSort = (p) => <Icon {...p}><path d="M7 4v16M7 4 3 8M7 4l4 4M17 20V4M17 20l4-4M17 20l-4-4"/></Icon>;
const IcGrid = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
const IcList = (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>;
const IcCalendar = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>;
const IcGantt = (p) => <Icon {...p}><path d="M4 6h8M8 12h10M6 18h7"/></Icon>;
const IcBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>;
const IcUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></Icon>;
const IcMore = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></Icon>;
const IcArrow = (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>;
const IcArrowUp = (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
const IcArrowDown = (p) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>;
const IcX = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>;
const IcLink = (p) => <Icon {...p}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></Icon>;
const IcPaperclip = (p) => <Icon {...p}><path d="M21 12 12 21a6 6 0 0 1-8-8l9-9a4 4 0 0 1 6 6L10 19a2 2 0 0 1-3-3l8-8"/></Icon>;
const IcComment = (p) => <Icon {...p}><path d="M21 12a8 8 0 0 1-12 7l-5 2 2-5A8 8 0 1 1 21 12z"/></Icon>;
const IcFlag = (p) => <Icon {...p}><path d="M5 21V4h12l-2 4 2 4H5"/></Icon>;
const IcTag = (p) => <Icon {...p}><path d="M3 12V3h9l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/></Icon>;
const IcLayers = (p) => <Icon {...p}><path d="M12 3 3 8l9 5 9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></Icon>;
const IcDoc = (p) => <Icon {...p}><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></Icon>;
const IcLock = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>;
const IcMail = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
const IcKey = (p) => <Icon {...p}><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9-3 3 3 3-3 3-3-3"/></Icon>;
const IcTeam = (p) => <Icon {...p}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M15 20c0-2 2-3 4-3s2 1 2 3"/></Icon>;
const IcGit = (p) => <Icon {...p}><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 6h4a4 4 0 0 1 4 4v0M6 8v8"/></Icon>;
const IcSparkle = (p) => <Icon {...p}><path d="M12 3v18M3 12h18M5 5l14 14M19 5 5 19"/></Icon>;
const IcZap = (p) => <Icon {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></Icon>;
const IcArchive = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 13h4"/></Icon>;
const IcEye = (p) => <Icon {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Icon>;
const IcDownload = (p) => <Icon {...p}><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></Icon>;
const IcRefresh = (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>;
const IcMenu = (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>;
const IcLogo = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5"/>
    <path d="M5 12a7 7 0 0 1 14 0" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </svg>
);

// Priority dots (filled state indicators)
const PrioDot = ({ level, size = 12 }) => {
  const map = {
    urgent: '#c54a3a',
    high: '#d97757',
    medium: '#c79e3d',
    low: '#5d7256',
    none: '#a8a299',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 99, background: map[level] + '22',
      border: '1.5px solid ' + map[level], flexShrink: 0,
    }}>
      {level === 'urgent' && <span style={{ width: size*0.4, height: size*0.4, borderRadius: 99, background: map[level] }}/>}
    </span>
  );
};

// State pip (filled segmented circle)
const StatePip = ({ state, size = 12 }) => {
  // backlog, todo, in-progress, done, cancelled
  const c = {
    backlog: '#a8a299',
    todo: '#6b6660',
    'in-progress': '#d97757',
    started: '#d97757',
    done: '#5d7256',
    cancelled: '#c54a3a',
  }[state] || '#a8a299';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2.5" strokeDasharray={
        state === 'todo' ? '2 2.5' :
        state === 'backlog' ? '0.5 4' :
        state === 'in-progress' ? '47 100' :
        state === 'started' ? '32 100' :
        '100 100'
      }/>
      {state === 'done' && <path d="m7 12 3.5 3.5L17 9" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
      {state === 'done' && <circle cx="12" cy="12" r="10" fill={c}/>}
      {state === 'done' && <path d="m7 12 3.5 3.5L17 9" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
      {state === 'cancelled' && <circle cx="12" cy="12" r="10" fill={c}/>}
      {state === 'cancelled' && <path d="m8 8 8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>}
    </svg>
  );
};

Object.assign(window, {
  Icon, IcHome, IcInbox, IcSearch, IcCompanies, IcIssues, IcCycle, IcModules, IcPages, IcStar, IcAnalytics, IcActivity, IcSticky, IcSettings, IcPlus, IcChevDown, IcChevRight, IcChevLeft, IcCheck, IcFilter, IcSort, IcGrid, IcList, IcCalendar, IcGantt, IcBell, IcUser, IcMore, IcArrow, IcArrowUp, IcArrowDown, IcX, IcLink, IcPaperclip, IcComment, IcFlag, IcTag, IcLayers, IcDoc, IcLock, IcMail, IcKey, IcTeam, IcGit, IcSparkle, IcZap, IcArchive, IcEye, IcDownload, IcRefresh, IcMenu, IcLogo, PrioDot, StatePip,
});
