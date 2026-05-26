using AutoMapper;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Projects.Dtos;
using TaskManager.Api.Modules.Projects.Entities;
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
using TaskManager.Api.Modules.Modules.Dtos;
using TaskManager.Api.Modules.Modules.Entities;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Entities;
using TaskManager.Api.Modules.Space.Dtos;
using TaskManager.Api.Modules.Space.Entities;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;
using TaskManager.Api.Modules.Importer.Dtos;
using TaskManager.Api.Modules.Importer.Entities;
using TaskManager.Api.Modules.TimeTracking.Dtos;
using TaskManager.Api.Modules.TimeTracking.Entities;

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
        CreateMap<Project, ProjectDto>()
            .ForMember(d => d.StateGroupName, o => o.MapFrom(s => s.StateGroup != null ? s.StateGroup.Name : string.Empty))
            .ForMember(d => d.TeamName, o => o.MapFrom(s => s.Team != null ? s.Team.Name : null));
        CreateMap<CreateProjectDto, Project>();
        CreateMap<ProjectMember, ProjectMemberDto>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.UserId))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email ?? ""))
            .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.User.DisplayName))
            .ForMember(d => d.AvatarUrl, o => o.MapFrom(s => s.User.AvatarUrl));
        CreateMap<ProjectInvitation, ProjectInvitationDto>();
        CreateMap<State, StateDto>();
        CreateMap<CreateStateDto, State>();
        CreateMap<StateGroup, StateGroupDto>();
        CreateMap<CreateStateGroupDto, StateGroup>();
        CreateMap<Cycle, CycleDto>()
            .ForMember(d => d.IssueCount, o => o.MapFrom(s => s.CycleIssues.Count));
        CreateMap<CreateCycleDto, Cycle>();
        CreateMap<Module, ModuleDto>()
            .ForMember(d => d.IssueCount, o => o.MapFrom(s => s.ModuleIssues.Count));
        CreateMap<CreateModuleDto, Module>();
        CreateMap<Label, LabelDto>();
        CreateMap<CreateLabelDto, Label>();
        CreateMap<IssueComment, IssueCommentDto>()
            .ForMember(d => d.AuthorName, o => o.MapFrom(s => s.Author.UserName ?? ""))
            .ForMember(d => d.Access, o => o.MapFrom(s => s.Access.ToString()));
        CreateMap<CreateCommentDto, IssueComment>();
        CreateMap<IssueReaction, IssueReactionDto>();
        CreateMap<CreateReactionDto, IssueReaction>();
        CreateMap<IssueActivity, IssueActivityDto>()
            .ForMember(d => d.ActorName, o => o.MapFrom(s => s.Actor.UserName ?? ""));
        CreateMap<IssueView, IssueViewDto>();
        CreateMap<Notification, NotificationDto>();
        CreateMap<FileAsset, FileAssetDto>()
            .ForMember(d => d.Url, opt => opt.Ignore()); // Url is set manually in the service
        CreateMap<IssueType, IssueTypeDto>();
        CreateMap<CreateIssueTypeDto, IssueType>();
        CreateMap<OAuthAccount, OAuthAccountDto>();

        CreateMap<IntakeIssue, IntakeIssueDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<RecurringIssueTemplate, RecurringTemplateDto>();
        CreateMap<CreateRecurringTemplateDto, RecurringIssueTemplate>();
        CreateMap<RecurringIssueRun, RecurringRunDto>();

        CreateMap<DeployBoard, DeployBoardDto>();

        CreateMap<ImporterHistory, ImporterHistoryDto>();
        CreateMap<IssueWorklog, WorklogDto>()
            .ForMember(d => d.UserDisplayName, o => o.MapFrom(s => s.User != null ? (s.User.DisplayName ?? s.User.UserName) : null))
            .ForMember(d => d.UserEmail, o => o.MapFrom(s => s.User != null ? s.User.Email : null));
    }
}
