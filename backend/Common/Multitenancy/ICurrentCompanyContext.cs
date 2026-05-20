namespace TaskManager.Api.Common.Multitenancy;

public interface ICurrentCompanyContext
{
    Guid? CompanyId { get; }
    void SetCompanyId(Guid companyId);
}
