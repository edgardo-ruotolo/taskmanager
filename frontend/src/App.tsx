import { lazy, Suspense } from 'react';
import type React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from '@/modules/auth/presentation/components/AuthGuard';
import { WorkspaceLayout } from '@/modules/workspaces/presentation/layouts/WorkspaceLayout';
import { WorkspaceRedirect } from '@/shared/components/WorkspaceRedirect';
import { AdminGuard } from '@/modules/admin/presentation/guards/AdminGuard';
import { GodModeLayout } from '@/modules/admin/presentation/layouts/GodModeLayout';
import { PageLoader } from '@/shared/components/PageLoader';

// Auth pages
const LoginPage = lazy(() => import('@/modules/auth/presentation/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/modules/auth/presentation/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/modules/auth/presentation/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/modules/auth/presentation/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('@/modules/auth/presentation/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const OnboardingPage = lazy(() => import('@/modules/auth/presentation/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const ApiTokensPage = lazy(() => import('@/modules/auth/presentation/pages/ApiTokensPage').then(m => ({ default: m.ApiTokensPage })));

// Workspace pages
const WorkspacesPage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspacesPage').then(m => ({ default: m.WorkspacesPage })));
const WorkspaceHomePage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspaceHomePage').then(m => ({ default: m.WorkspaceHomePage })));
const WorkspaceActivityPage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspaceActivityPage').then(m => ({ default: m.WorkspaceActivityPage })));
const WorkspaceSettingsPage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspaceSettingsPage').then(m => ({ default: m.WorkspaceSettingsPage })));

// Company pages
const CompaniesPage = lazy(() => import('@/modules/companies/presentation/pages/CompaniesPage').then(m => ({ default: m.CompaniesPage })));
const CompanySettingsPage = lazy(() => import('@/modules/companies/presentation/pages/CompanySettingsPage').then(m => ({ default: m.CompanySettingsPage })));

// Issues pages
const IssuesPage = lazy(() => import('@/modules/issues/presentation/pages/IssuesPage').then(m => ({ default: m.IssuesPage })));
const IssueDetailPage = lazy(() => import('@/modules/issues/presentation/pages/IssueDetailPage').then(m => ({ default: m.IssueDetailPage })));
const IssueViewsPage = lazy(() => import('@/modules/issues/presentation/pages/IssueViewsPage').then(m => ({ default: m.IssueViewsPage })));
const IssueViewDetailPage = lazy(() => import('@/modules/issues/presentation/pages/IssueViewDetailPage').then(m => ({ default: m.IssueViewDetailPage })));
const IssueTypesPage = lazy(() => import('@/modules/issues/presentation/pages/IssueTypesPage').then(m => ({ default: m.IssueTypesPage })));

// States pages
const StatesPage = lazy(() => import('@/modules/states/presentation/pages/StatesPage').then(m => ({ default: m.StatesPage })));

// Cycles pages
const CyclesPage = lazy(() => import('@/modules/cycles/presentation/pages/CyclesPage').then(m => ({ default: m.CyclesPage })));
const CycleDetailPage = lazy(() => import('@/modules/cycles/presentation/pages/CycleDetailPage').then(m => ({ default: m.CycleDetailPage })));

// Modules pages
const ModulesPage = lazy(() => import('@/modules/project-modules/presentation/pages/ModulesPage').then(m => ({ default: m.ModulesPage })));
const ModuleDetailPage = lazy(() => import('@/modules/project-modules/presentation/pages/ModuleDetailPage').then(m => ({ default: m.ModuleDetailPage })));

// Archives pages
const ArchivesPage = lazy(() => import('@/modules/archives/presentation/pages/ArchivesPage').then(m => ({ default: m.ArchivesPage })));

// Labels pages
const LabelsPage = lazy(() => import('@/modules/labels/presentation/pages/LabelsPage').then(m => ({ default: m.LabelsPage })));

// Notifications pages
const NotificationsPage = lazy(() => import('@/modules/notifications/presentation/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// Webhooks pages
const WebhooksPage = lazy(() => import('@/modules/webhooks/presentation/pages/WebhooksPage').then(m => ({ default: m.WebhooksPage })));

// Estimates pages
const EstimatesPage = lazy(() => import('@/modules/estimates/presentation/pages/EstimatesPage').then(m => ({ default: m.EstimatesPage })));

// Analytics pages
const AnalyticsPage = lazy(() => import('@/modules/analytics/presentation/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));

// Intake pages
const InboxPage = lazy(() => import('@/modules/intake/presentation/pages/InboxPage').then(m => ({ default: m.InboxPage })));

// Stickies pages
const StickiesPage = lazy(() => import('@/modules/stickies/presentation/pages/StickiesPage').then(m => ({ default: m.StickiesPage })));

// Favorites pages
const FavoritesPage = lazy(() => import('@/modules/favorites/presentation/pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));

// Pages module
const PagesPage = lazy(() => import('@/modules/pages/presentation/pages/PagesPage').then(m => ({ default: m.PagesPage })));
const PageDetailPage = lazy(() => import('@/modules/pages/presentation/pages/PageDetailPage').then(m => ({ default: m.PageDetailPage })));

// Recurring pages
const RecurringListPage = lazy(() => import('@/modules/recurring/presentation/pages/RecurringListPage').then(m => ({ default: m.RecurringListPage })));
const RecurringDetailPage = lazy(() => import('@/modules/recurring/presentation/pages/RecurringDetailPage').then(m => ({ default: m.RecurringDetailPage })));

// Search page
const SearchPage = lazy(() => import('@/modules/search/presentation/pages/SearchPage').then(m => ({ default: m.SearchPage })));

// Drafts pages
const DraftsPage = lazy(() => import('@/modules/drafts/presentation/pages/DraftsPage').then(m => ({ default: m.DraftsPage })));

// Teams pages
const TeamsPage = lazy(() => import('@/modules/teams/presentation/pages/TeamsPage').then(m => ({ default: m.TeamsPage })));

// God Mode pages
const GodModeGeneralPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeGeneralPage').then(m => ({ default: m.GodModeGeneralPage })));
const GodModeEmailPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeEmailPage').then(m => ({ default: m.GodModeEmailPage })));
const GodModeAuthPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeAuthPage').then(m => ({ default: m.GodModeAuthPage })));
const GodModeWorkspacesPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeWorkspacesPage').then(m => ({ default: m.GodModeWorkspacesPage })));
const GodModeAiPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeAiPage').then(m => ({ default: m.GodModeAiPage })));
const GodModeStoragePage = lazy(() => import('@/modules/admin/presentation/pages/GodModeStoragePage').then(m => ({ default: m.GodModeStoragePage })));
const GodModeCompaniesPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeCompaniesPage').then(m => ({ default: m.GodModeCompaniesPage })));
const GodModeStatesPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeStatesPage').then(m => ({ default: m.GodModeStatesPage })));

export const App = (): React.ReactElement => (
    <Suspense fallback={<PageLoader />}>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<AuthGuard />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/" element={<WorkspaceRedirect />} />
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route path="/:workspaceSlug" element={<WorkspaceLayout />}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<WorkspaceHomePage />} />
                    <Route path="companies" element={<CompaniesPage />} />
                    <Route path="companies/:companyId/issues" element={<IssuesPage />} />
                    <Route path="companies/:companyId/issues/:issueId" element={<IssueDetailPage />} />
                    <Route path="companies/:companyId/cycles" element={<CyclesPage />} />
                    <Route path="companies/:companyId/cycles/:cycleId" element={<CycleDetailPage />} />
                    <Route path="companies/:companyId/modules" element={<ModulesPage />} />
                    <Route path="companies/:companyId/modules/:moduleId" element={<ModuleDetailPage />} />
                    <Route path="companies/:companyId/archives" element={<ArchivesPage />} />
                    <Route path="companies/:companyId/estimates" element={<EstimatesPage />} />
                    <Route path="companies/:companyId/inbox" element={<InboxPage />} />
                    <Route path="companies/:companyId/settings" element={<CompanySettingsPage />} />
                    <Route path="stickies" element={<StickiesPage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="activity" element={<WorkspaceActivityPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="pages" element={<PagesPage />} />
                    <Route path="pages/:pageId" element={<PageDetailPage />} />
                    <Route path="settings" element={<WorkspaceSettingsPage />} />
                    <Route path="settings/members" element={<WorkspaceSettingsPage />} />
                    <Route path="settings/states" element={<StatesPage />} />
                    <Route path="settings/labels" element={<LabelsPage />} />
                    <Route path="settings/webhooks" element={<WebhooksPage />} />
                    <Route path="settings/issue-types" element={<IssueTypesPage />} />
                    <Route path="settings/views" element={<IssueViewsPage />} />
                    <Route path="settings/views/:viewId" element={<IssueViewDetailPage />} />
                    <Route path="settings/tokens" element={<ApiTokensPage />} />
                    <Route path="settings/teams" element={<TeamsPage />} />
                    <Route path="recurring" element={<RecurringListPage />} />
                    <Route path="recurring/:recurringId" element={<RecurringDetailPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="drafts" element={<DraftsPage />} />
                </Route>
            </Route>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route
                path="/god-mode"
                element={
                    <AdminGuard>
                        <GodModeLayout />
                    </AdminGuard>
                }
            >
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<GodModeGeneralPage />} />
                <Route path="email" element={<GodModeEmailPage />} />
                <Route path="authentication" element={<GodModeAuthPage />} />
                <Route path="workspaces" element={<GodModeWorkspacesPage />} />
                <Route path="users" element={<GodModeWorkspacesPage />} />
                <Route path="companies" element={<GodModeCompaniesPage />} />
                <Route path="states" element={<GodModeStatesPage />} />
                <Route path="ai" element={<GodModeAiPage />} />
                <Route path="storage" element={<GodModeStoragePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </Suspense>
);
