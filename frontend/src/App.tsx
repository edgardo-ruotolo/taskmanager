import { lazy, Suspense } from 'react';
import type React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from '@/modules/auth/presentation/components/AuthGuard';
import { WorkspaceLayout } from '@/modules/workspaces/presentation/layouts/WorkspaceLayout';
import { WorkspaceRedirect } from '@/shared/components/WorkspaceRedirect';
import { ProjectFeatureGuard } from '@/shared/components/ProjectFeatureGuard';
import { AdminGuard } from '@/modules/admin/presentation/guards/AdminGuard';
import { GodModeLayout } from '@/modules/admin/presentation/layouts/GodModeLayout';
import { PageLoader } from '@/shared/components/PageLoader';
import { useAuthLogoutListener } from '@/shared/hooks/useAuthLogoutListener';

// Auth pages
const LoginPage = lazy(() => import('@/modules/auth/presentation/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/modules/auth/presentation/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/modules/auth/presentation/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/modules/auth/presentation/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('@/modules/auth/presentation/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const OnboardingPage = lazy(() => import('@/modules/auth/presentation/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const MagicLinkVerifyPage = lazy(() => import('@/modules/auth/presentation/pages/MagicLinkVerifyPage').then(m => ({ default: m.MagicLinkVerifyPage })));

// Workspace pages
const WorkspacesPage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspacesPage').then(m => ({ default: m.WorkspacesPage })));
const WorkspaceHomePage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspaceHomePage').then(m => ({ default: m.WorkspaceHomePage })));
const WorkspaceActivityPage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspaceActivityPage').then(m => ({ default: m.WorkspaceActivityPage })));
const WorkspaceSettingsPage = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspaceSettingsPage').then(m => ({ default: m.WorkspaceSettingsPage })));

// Project pages
const ProjectsPage = lazy(() => import('@/modules/projects/presentation/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const SettingsLayout = lazy(() => import('@/modules/workspaces/presentation/layouts/SettingsLayout').then(m => ({ default: m.SettingsLayout })));
const ProjectSettingsPage = lazy(() => import('@/modules/projects/presentation/pages/ProjectSettingsPage').then(m => ({ default: m.ProjectSettingsPage })));
const WorkspaceProjectsSettingsTab = lazy(() => import('@/modules/workspaces/presentation/pages/WorkspaceProjectsSettingsTab').then(m => ({ default: m.WorkspaceProjectsSettingsTab })));
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
const ModulesPage = lazy(() => import('@/modules/modules/presentation/pages/ModulesPage').then(m => ({ default: m.ModulesPage })));
const ModuleDetailPage = lazy(() => import('@/modules/modules/presentation/pages/ModuleDetailPage').then(m => ({ default: m.ModuleDetailPage })));

// Archives pages
const ArchivesPage = lazy(() => import('@/modules/archives/presentation/pages/ArchivesPage').then(m => ({ default: m.ArchivesPage })));

// Labels pages
const LabelsPage = lazy(() => import('@/modules/labels/presentation/pages/LabelsPage').then(m => ({ default: m.LabelsPage })));

// Notifications pages
const NotificationsPage = lazy(() => import('@/modules/notifications/presentation/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// Account pages
const AccountSettingsPage = lazy(() => import('@/modules/account/presentation/pages/AccountSettingsPage').then(m => ({ default: m.AccountSettingsPage })));
const UnsubscribeConfirmedPage = lazy(() => import('@/modules/account/presentation/pages/UnsubscribeConfirmedPage').then(m => ({ default: m.UnsubscribeConfirmedPage })));
const UnsubscribeFailedPage = lazy(() => import('@/modules/account/presentation/pages/UnsubscribeFailedPage').then(m => ({ default: m.UnsubscribeFailedPage })));

// Analytics pages
const AnalyticsPage = lazy(() => import('@/modules/analytics/presentation/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AnalyticsLayout = lazy(() => import('@/modules/analytics/presentation/components/AnalyticsLayout').then(m => ({ default: m.AnalyticsLayout })));
const GanttPage = lazy(() => import('@/modules/analytics/presentation/pages/GanttPage').then(m => ({ default: m.GanttPage })));
const BurndownPage = lazy(() => import('@/modules/analytics/presentation/pages/BurndownPage').then(m => ({ default: m.BurndownPage })));
const DrilldownPage = lazy(() => import('@/modules/analytics/presentation/pages/DrilldownPage').then(m => ({ default: m.DrilldownPage })));
const UsersRankingPage = lazy(() => import('@/modules/analytics/presentation/pages/UsersRankingPage').then(m => ({ default: m.UsersRankingPage })));
const ClientsComparisonPage = lazy(() => import('@/modules/analytics/presentation/pages/ClientsComparisonPage').then(m => ({ default: m.ClientsComparisonPage })));
const ReportsPage = lazy(() => import('@/modules/analytics/presentation/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

// Intake pages
const InboxPage = lazy(() => import('@/modules/intake/presentation/pages/InboxPage').then(m => ({ default: m.InboxPage })));

// Recurring pages
const RecurringListPage = lazy(() => import('@/modules/recurring/presentation/pages/RecurringListPage').then(m => ({ default: m.RecurringListPage })));
const RecurringDetailPage = lazy(() => import('@/modules/recurring/presentation/pages/RecurringDetailPage').then(m => ({ default: m.RecurringDetailPage })));

// Help pages
const HelpPage = lazy(() => import('@/modules/help/presentation/pages/HelpPage').then(m => ({ default: m.HelpPage })));

// Search page
const SearchPage = lazy(() => import('@/modules/search/presentation/pages/SearchPage').then(m => ({ default: m.SearchPage })));

// Drafts pages
const DraftsPage = lazy(() => import('@/modules/drafts/presentation/pages/DraftsPage').then(m => ({ default: m.DraftsPage })));

// Teams pages
const TeamsPage = lazy(() => import('@/modules/teams/presentation/pages/TeamsPage').then(m => ({ default: m.TeamsPage })));

// Importer pages
const ImporterPage = lazy(() => import('@/modules/importer/presentation/pages/ImporterPage').then(m => ({ default: m.ImporterPage })));

// Space / Deploy Boards pages
const PublicSpacePage = lazy(() => import('@/modules/space/presentation/pages/PublicSpacePage').then(m => ({ default: m.PublicSpacePage })));
const DeployBoardsPage = lazy(() => import('@/modules/space/presentation/pages/DeployBoardsPage').then(m => ({ default: m.DeployBoardsPage })));

// God Mode pages
const GodModeGeneralPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeGeneralPage').then(m => ({ default: m.GodModeGeneralPage })));
const GodModeEmailPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeEmailPage').then(m => ({ default: m.GodModeEmailPage })));
const GodModeAuthPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeAuthPage').then(m => ({ default: m.GodModeAuthPage })));
const GodModeWorkspacesPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeWorkspacesPage').then(m => ({ default: m.GodModeWorkspacesPage })));
const GodModeUsersPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeUsersPage').then(m => ({ default: m.GodModeUsersPage })));
const GodModeAiPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeAiPage').then(m => ({ default: m.GodModeAiPage })));
const GodModeStoragePage = lazy(() => import('@/modules/admin/presentation/pages/GodModeStoragePage').then(m => ({ default: m.GodModeStoragePage })));
const GodModeStatesPage = lazy(() => import('@/modules/admin/presentation/pages/GodModeStatesPage').then(m => ({ default: m.GodModeStatesPage })));

export const App = (): React.ReactElement => {
    useAuthLogoutListener();
    return (
    <Suspense fallback={<PageLoader />}>
        <Routes>
            <Route path="/public/:token" element={<PublicSpacePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/magic-link/:token" element={<MagicLinkVerifyPage />} />
            <Route path="/unsubscribe-confirmed" element={<UnsubscribeConfirmedPage />} />
            <Route path="/unsubscribe-failed" element={<UnsubscribeFailedPage />} />
            <Route element={<AuthGuard />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/account/settings" element={<AccountSettingsPage />} />
                <Route path="/" element={<WorkspaceRedirect />} />
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route path="/:workspaceSlug" element={<WorkspaceLayout />}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<WorkspaceHomePage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:projectId/issues" element={<IssuesPage />} />
                    <Route path="projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
                    <Route path="projects/:projectId/cycles" element={<ProjectFeatureGuard feature="cyclesEnabled"><CyclesPage /></ProjectFeatureGuard>} />
                    <Route path="projects/:projectId/cycles/:cycleId" element={<ProjectFeatureGuard feature="cyclesEnabled"><CycleDetailPage /></ProjectFeatureGuard>} />
                    <Route path="projects/:projectId/modules" element={<ProjectFeatureGuard feature="modulesEnabled"><ModulesPage /></ProjectFeatureGuard>} />
                    <Route path="projects/:projectId/modules/:moduleId" element={<ProjectFeatureGuard feature="modulesEnabled"><ModuleDetailPage /></ProjectFeatureGuard>} />
                    <Route path="projects/:projectId/archives" element={<ProjectFeatureGuard feature="archivesEnabled"><ArchivesPage /></ProjectFeatureGuard>} />
                    <Route path="projects/:projectId/inbox" element={<ProjectFeatureGuard feature="intakeEnabled"><InboxPage /></ProjectFeatureGuard>} />
                    <Route path="projects/:projectId/deploy-boards" element={<DeployBoardsPage />} />

                    <Route path="projects/:projectId/importer" element={<ImporterPage />} />
                    <Route path="projects/:projectId/settings" element={<ProjectSettingsPage />} />
                    <Route path="analytics" element={<AnalyticsLayout />}>
                        <Route index element={<AnalyticsPage />} />
                        <Route path="gantt" element={<GanttPage />} />
                        <Route path="burndown" element={<BurndownPage />} />
                        <Route path="drilldown" element={<DrilldownPage />} />
                        <Route path="users" element={<UsersRankingPage />} />
                        <Route path="clients" element={<ClientsComparisonPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                    </Route>
                    <Route path="activity" element={<WorkspaceActivityPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsLayout />}>
                        <Route index element={<Navigate to="general" replace />} />
                        <Route path="general" element={<WorkspaceSettingsPage />} />
                        <Route path="members" element={<WorkspaceSettingsPage />} />
                        <Route path="theme" element={<WorkspaceSettingsPage />} />
                        <Route path="teams" element={<TeamsPage />} />
                        <Route path="projects" element={<WorkspaceProjectsSettingsTab />} />
                        <Route path="states" element={<StatesPage />} />
                        <Route path="labels" element={<LabelsPage />} />
                        <Route path="issue-types" element={<IssueTypesPage />} />
                        <Route path="views" element={<IssueViewsPage />} />
                        <Route path="views/:viewId" element={<IssueViewDetailPage />} />
                        <Route path="recurring" element={<RecurringListPage />} />
                        <Route path="recurring/:recurringId" element={<RecurringDetailPage />} />
                    </Route>
                    <Route path="search" element={<SearchPage />} />
                    <Route path="drafts" element={<DraftsPage />} />
                    <Route path="ayuda" element={<HelpPage />} />
                    <Route path="ayuda/:helpSlug" element={<HelpPage />} />
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
                <Route path="users" element={<GodModeUsersPage />} />
                <Route path="workspaces" element={<GodModeWorkspacesPage />} />
                <Route path="states" element={<GodModeStatesPage />} />
                <Route path="ai" element={<GodModeAiPage />} />
                <Route path="storage" element={<GodModeStoragePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </Suspense>
    );
};
