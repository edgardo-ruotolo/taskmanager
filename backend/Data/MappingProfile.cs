using AutoMapper;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Companies.Dtos;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Intake.Dtos;
using TaskManager.Api.Modules.Intake.Entities;
using TaskManager.Api.Modules.Recurring.Dtos;
using TaskManager.Api.Modules.Recurring.Entities;
using TaskManager.Api.Modules.Cycles.Dtos;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Files.Dtos;
using TaskManager.Api.Modules.Files.Entities;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Labels.Dtos;
using TaskManager.Api.Modules.Labels.Entities;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Entities;
using TaskManager.Api.Modules.ProjectModules.Dtos;
using TaskManager.Api.Modules.ProjectModules.Entities;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Entities;
using TaskManager.Api.Modules.Estimates.Dtos;
using TaskManager.Api.Modules.Estimates.Entities;
using TaskManager.Api.Modules.Space.Dtos;
using TaskManager.Api.Modules.Space.Entities;
using TaskManager.Api.Modules.Webhooks.Dtos;
using TaskManager.Api.Modules.Webhooks.Entities;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Data;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(d => d.Username, o => o.MapFrom(s => s.UserName));
        CreateMap<Workspace, WorkspaceDto>();
        CreateMap<CreateWorkspaceDto, Workspace>();
        CreateMap<WorkspaceMember, WorkspaceMemberDto>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.UserId))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email ?? ""))
            .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.User.DisplayName))
            .ForMember(d => d.AvatarUrl, o => o.MapFrom(s => s.User.AvatarUrl));
        CreateMap<WorkspaceInvitation, WorkspaceInvitationDto>();
        CreateMap<Company, CompanyDto>();
        CreateMap<CreateCompanyDto, Company>();
        CreateMap<CompanyMember, CompanyMemberDto>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.UserId))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email ?? ""))
            .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.User.DisplayName))
            .ForMember(d => d.AvatarUrl, o => o.MapFrom(s => s.User.AvatarUrl));
        CreateMap<CompanyInvitation, CompanyInvitationDto>();
        CreateMap<State, StateDto>();
        CreateMap<CreateStateDto, State>();
        CreateMap<StateGroup, StateGroupDto>();
        CreateMap<CreateStateGroupDto, StateGroup>();
        CreateMap<Cycle, CycleDto>()
            .ForMember(d => d.IssueCount, o => o.MapFrom(s => s.CycleIssues.Count));
        CreateMap<CreateCycleDto, Cycle>();
        CreateMap<ProjectModule, ProjectModuleDto>()
            .ForMember(d => d.IssueCount, o => o.MapFrom(s => s.ModuleIssues.Count));
        CreateMap<CreateProjectModuleDto, ProjectModule>();
        CreateMap<Label, LabelDto>();
        CreateMap<CreateLabelDto, Label>();
        CreateMap<IssueComment, IssueCommentDto>()
            .ForMember(d => d.AuthorName, o => o.MapFrom(s => s.Author.UserName ?? ""));
        CreateMap<CreateCommentDto, IssueComment>();
        CreateMap<IssueReaction, IssueReactionDto>();
        CreateMap<CreateReactionDto, IssueReaction>();
        CreateMap<IssueActivity, IssueActivityDto>()
            .ForMember(d => d.ActorName, o => o.MapFrom(s => s.Actor.UserName ?? ""));
        CreateMap<IssueView, IssueViewDto>();
        CreateMap<Notification, NotificationDto>();
        CreateMap<Webhook, WebhookDto>();
        CreateMap<CreateWebhookDto, Webhook>();
        CreateMap<WebhookLog, WebhookLogDto>();
        CreateMap<FileAsset, FileAssetDto>()
            .ForMember(d => d.Url, opt => opt.Ignore()); // Url is set manually in the service
        CreateMap<IssueType, IssueTypeDto>();
        CreateMap<CreateIssueTypeDto, IssueType>();
        CreateMap<ApiToken, ApiTokenDto>();
        CreateMap<OAuthAccount, OAuthAccountDto>();
        CreateMap<Estimate, EstimateDto>()
            .ForMember(d => d.Points, o => o.MapFrom(s => s.Points.OrderBy(p => p.SortOrder)));
        CreateMap<EstimatePoint, EstimatePointDto>();
        CreateMap<CreateEstimateDto, Estimate>();

        CreateMap<IntakeIssue, IntakeIssueDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<RecurringIssueTemplate, RecurringTemplateDto>();
        CreateMap<CreateRecurringTemplateDto, RecurringIssueTemplate>();
        CreateMap<RecurringIssueRun, RecurringRunDto>();

        CreateMap<DeployBoard, DeployBoardDto>();
    }
}
