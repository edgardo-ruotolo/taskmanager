import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:5209'

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

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  username: 'tester',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  avatarUrl: null,
  roles: ['User'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockWorkspace = {
  id: 'ws-1',
  name: 'Test Workspace',
  slug: 'test-ws',
  description: null,
  logoUrl: null,
  ownerId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockCompany = {
  id: 'company-1',
  name: 'Test Company',
  identifier: 'TEST',
  description: null,
  logoUrl: null,
  workspaceId: 'ws-1',
  ownerId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockIssue = {
  id: 'issue-1',
  sequenceId: 1,
  title: 'Test issue',
  description: null,
  descriptionHtml: null,
  descriptionJson: null,
  priority: 0,
  companyId: 'company-1',
  stateId: 'state-1',
  stateName: 'Todo',
  stateColor: '#64748b',
  stateGroup: 'unstarted',
  createdById: 'user-1',
  assigneeIds: [],
  labelIds: [],
  moduleIds: [],
  sortOrder: 0,
  isDraft: false,
  isArchived: false,
  requiresAdminApproval: false,
  approvalRequiredStateIds: [],
  approvedById: null,
  approvedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockCycle = {
  id: 'cycle-1',
  name: 'Sprint 1',
  description: null,
  startDate: null,
  endDate: null,
  status: 'Draft',
  issueCount: 0,
  companyId: 'company-1',
  ownerId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const handlers = [
  http.get(`${BASE_URL}/api/auth/me`, () => HttpResponse.json(mockUser)),
  http.post(`${BASE_URL}/api/auth/login`, () => HttpResponse.json(mockUser, { status: 200 })),
  http.post(`${BASE_URL}/api/auth/logout`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/auth/refresh`, () => new HttpResponse(null, { status: 204 })),

  // Workspaces
  http.get(`${BASE_URL}/api/workspaces`, () =>
    HttpResponse.json({ items: [mockWorkspace], totalCount: 1, page: 1, pageSize: 20 }),
  ),
  http.get(`${BASE_URL}/api/workspaces/:slug`, () => HttpResponse.json(mockWorkspace)),

  // Companies
  http.get(`${BASE_URL}/api/workspaces/:slug/companies`, () =>
    HttpResponse.json({ items: [mockCompany], totalCount: 1, page: 1, pageSize: 20 }),
  ),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies`, () =>
    HttpResponse.json(mockCompany, { status: 201 }),
  ),
  http.patch(`${BASE_URL}/api/workspaces/:slug/companies/:id`, () => HttpResponse.json(mockCompany)),
  http.delete(`${BASE_URL}/api/workspaces/:slug/companies/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Issues
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues`, () =>
    HttpResponse.json({ items: [mockIssue], totalCount: 1, page: 1, pageSize: 20 }),
  ),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues`, () =>
    HttpResponse.json(mockIssue, { status: 201 }),
  ),
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/:id`, () =>
    HttpResponse.json(mockIssue),
  ),
  http.patch(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/:id`, () =>
    HttpResponse.json(mockIssue),
  ),
  http.delete(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Cycles
  http.get(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles`, () =>
    HttpResponse.json({ items: [mockCycle], totalCount: 1, page: 1, pageSize: 20 }),
  ),
  http.post(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles`, () =>
    HttpResponse.json(mockCycle, { status: 201 }),
  ),
  http.delete(`${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Notifications
  http.get(`${BASE_URL}/api/notifications`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/notifications/:id/read`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${BASE_URL}/api/notifications/mark-all-read`, () => new HttpResponse(null, { status: 204 })),

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
        url: 'http://localhost:5209/uploads/test.txt',
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

  // Analytic Views
  http.get(`${BASE_URL}/api/workspaces/:slug/analytics/views`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/analytics/views`, () =>
    HttpResponse.json(
      {
        id: 'view-1',
        name: 'Test',
        description: null,
        query: '{}',
        isGlobal: false,
        workspaceId: 'ws-1',
        ownedById: 'user-1',
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    )),
  http.patch(`${BASE_URL}/api/workspaces/:slug/analytics/views/:id`, () =>
    HttpResponse.json({
      id: 'view-1',
      name: 'Test',
      description: null,
      query: '{}',
      isGlobal: false,
      workspaceId: 'ws-1',
      ownedById: 'user-1',
      createdAt: new Date().toISOString(),
    })),
  http.delete(`${BASE_URL}/api/workspaces/:slug/analytics/views/:id`, () =>
    new HttpResponse(null, { status: 204 })),

  // Home widgets
  http.get(`${BASE_URL}/api/workspaces/:slug/home/recent-visits`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/home/track-visit`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${BASE_URL}/api/workspaces/:slug/home/quick-links`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/home/quick-links`, () =>
    HttpResponse.json(
      { id: 'ql-1', title: 'Test Link', url: 'https://example.com', description: null, icon: null, sequence: 1, createdAt: new Date().toISOString() },
      { status: 201 },
    )),
  http.delete(`${BASE_URL}/api/workspaces/:slug/home/quick-links/:id`, () => new HttpResponse(null, { status: 204 })),

  // Exports
  http.get(`${BASE_URL}/api/workspaces/:slug/exports`, () => HttpResponse.json([])),
  http.post(`${BASE_URL}/api/workspaces/:slug/exports`, () =>
    HttpResponse.json(
      {
        id: 'exp-1',
        format: 'Csv',
        status: 'Pending',
        fileName: null,
        downloadUrl: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      { status: 202 },
    )),
  http.get(`${BASE_URL}/api/workspaces/:slug/exports/:id/download`, () =>
    new HttpResponse('id,title\n1,Test', { headers: { 'Content-Type': 'text/csv' } })),
]
