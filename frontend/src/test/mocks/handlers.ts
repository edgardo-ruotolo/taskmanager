import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:5000'

const mockRecurringTemplate = {
  id: 'rec-1',
  sequenceId: 1,
  workspaceId: 'ws-1',
  name: 'Tarea semanal de revisión',
  descriptionHtml: '',
  frequency: 'Weekly',
  interval: 1,
  daysOfWeek: [0, 4],
  dayOfMonth: null,
  monthOfYear: null,
  runAtTime: '06:00:00',
  endTime: null,
  timezone: 'UTC',
  startsOn: '2025-01-01',
  endsOn: null,
  isActive: true,
  isPaused: false,
  skipNextRun: false,
  lastRunAt: null,
  nextRunAt: new Date(Date.now() + 86400000).toISOString(),
  stateGroup: 'unstarted',
  priority: 'medium',
  startDateOffsetDays: 0,
  targetDateOffsetDays: 7,
  blockPolicy: 'SkipAndNotify',
  createdById: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  companyIds: [],
  assigneeIds: [],
  labelIds: [],
}

export const handlers = [
  http.get(`${BASE_URL}/api/auth/me`, () => {
    return HttpResponse.json(null, { status: 401 })
  }),
  http.post(`${BASE_URL}/api/auth/login`, () => {
    return HttpResponse.json({ message: 'ok' }, { status: 200 })
  }),

  // Recurring handlers
  http.get(`${BASE_URL}/api/workspaces/:slug/recurring`, () => {
    return HttpResponse.json([mockRecurringTemplate])
  }),
  http.get(`${BASE_URL}/api/workspaces/:slug/recurring/:id`, ({ params }) => {
    return HttpResponse.json({ ...mockRecurringTemplate, id: String(params['id']) })
  }),
  http.post(`${BASE_URL}/api/workspaces/:slug/recurring`, () => {
    return HttpResponse.json(mockRecurringTemplate, { status: 201 })
  }),
  http.patch(`${BASE_URL}/api/workspaces/:slug/recurring/:id`, () => {
    return HttpResponse.json(mockRecurringTemplate)
  }),
  http.delete(`${BASE_URL}/api/workspaces/:slug/recurring/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.get(`${BASE_URL}/api/workspaces/:slug/recurring/:id/runs`, () => {
    return HttpResponse.json([])
  }),
  http.get(`${BASE_URL}/api/workspaces/:slug/recurring/:id/preview`, () => {
    return HttpResponse.json({ nextRuns: [] })
  }),
  http.post(`${BASE_URL}/api/workspaces/:slug/recurring/:id/pause`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${BASE_URL}/api/workspaces/:slug/recurring/:id/resume`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${BASE_URL}/api/workspaces/:slug/recurring/:id/skip-next`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${BASE_URL}/api/workspaces/:slug/recurring/:id/run-now`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${BASE_URL}/api/workspaces/:slug/recurring/from-issue/:issueId`, () => {
    return HttpResponse.json({
      name: 'Tarea desde issue',
      descriptionHtml: '',
      priority: 'none',
      stateGroup: 'unstarted',
      companyIds: [],
      assigneeIds: [],
      labelIds: [],
    })
  }),

  // Archives — issues
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/archived`, () =>
    HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/:id/archive`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/:id/unarchive`, () =>
    new HttpResponse(null, { status: 204 })),

  // Archives — cycles
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/archived`, () =>
    HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:id/archive`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:id/unarchive`, () =>
    new HttpResponse(null, { status: 204 })),

  // Archives — modules
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/modules/archived`, () =>
    HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/modules/:id/archive`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/modules/:id/unarchive`, () =>
    new HttpResponse(null, { status: 204 })),

  // Drafts
  http.get(`${BASE_URL}/api/workspaces/:slug/drafts`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/drafts`, () =>
    HttpResponse.json(
      {
        id: 'draft-1',
        title: 'Test draft',
        companyId: 'company-1',
        priority: 0,
        description: null,
        stateId: null,
        stateName: null,
        ownedById: 'user-1',
        assigneeId: null,
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 },
    )),
  http.delete(`${BASE_URL}/api/workspaces/:slug/drafts/:id`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/workspaces/:slug/drafts/:id/publish`, () =>
    HttpResponse.json({ id: 'issue-1', title: 'Published' })),

  // Files / attachments
  http.get(`${BASE_URL}/api/workspaces/:slug/files`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/files/upload`, () =>
    HttpResponse.json(
      {
        id: 'file-1',
        fileName: 'test.txt',
        contentType: 'text/plain',
        sizeBytes: 1024,
        entityType: 'issue',
        entityId: 'issue-1',
        uploadedById: 'user-1',
        workspaceId: 'ws-1',
        createdAt: new Date().toISOString(),
        url: 'http://localhost:5000/uploads/test.txt',
      },
      { status: 201 },
    )),
  http.delete(`${BASE_URL}/api/workspaces/:slug/files/:id`, () =>
    new HttpResponse(null, { status: 204 })),

  // Teams
  http.get(`${BASE_URL}/api/workspaces/:slug/teams`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/teams`, () =>
    HttpResponse.json(
      {
        id: 'team-1',
        name: 'Test Team',
        memberCount: 0,
        workspaceId: 'ws-1',
        createdById: 'user-1',
        description: null,
        identifier: null,
        logoUrl: null,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    )),
  http.get(`${BASE_URL}/api/workspaces/:slug/teams/:id`, () =>
    HttpResponse.json({
      id: 'team-1',
      name: 'Test Team',
      memberCount: 0,
      workspaceId: 'ws-1',
      createdById: 'user-1',
      description: null,
      identifier: null,
      logoUrl: null,
      createdAt: new Date().toISOString(),
    })),
  http.patch(`${BASE_URL}/api/workspaces/:slug/teams/:id`, () =>
    HttpResponse.json({
      id: 'team-1',
      name: 'Test Team',
      memberCount: 0,
      workspaceId: 'ws-1',
      createdById: 'user-1',
      description: null,
      identifier: null,
      logoUrl: null,
      createdAt: new Date().toISOString(),
    })),
  http.delete(`${BASE_URL}/api/workspaces/:slug/teams/:id`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${BASE_URL}/api/workspaces/:slug/teams/:id/members`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/teams/:id/members`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE_URL}/api/workspaces/:slug/teams/:id/members/:userId`, () => new HttpResponse(null, { status: 204 })),

  // Workspace theme
  http.get(`${BASE_URL}/api/workspaces/:slug/theme`, () =>
    HttpResponse.json({
      workspaceId: 'ws-1',
      theme: 'system',
      primaryColor: null,
      textColor: null,
      backgroundColor: null,
      sidebarColor: null,
      accentColor: null,
    })),
  http.patch(`${BASE_URL}/api/workspaces/:slug/theme`, () =>
    HttpResponse.json({
      workspaceId: 'ws-1',
      theme: 'system',
      primaryColor: null,
      textColor: null,
      backgroundColor: null,
      sidebarColor: null,
      accentColor: null,
    })),

  // Cycle analytics
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:id/progress`, () =>
    HttpResponse.json({
      totalIssues: 0,
      completedIssues: 0,
      inProgressIssues: 0,
      pendingIssues: 0,
      completionPercentage: 0,
    })),
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:id/analytics`, () =>
    HttpResponse.json({
      totalIssues: 0,
      completedIssues: 0,
      completionPercentage: 0,
      issuesByPriority: {},
      issuesByState: {},
    })),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:id/transfer-issues`, () =>
    new HttpResponse(null, { status: 204 })),

  // Bulk operations
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/bulk-archive`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/bulk-delete`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/bulk-update`, () =>
    new HttpResponse(null, { status: 204 })),
]
