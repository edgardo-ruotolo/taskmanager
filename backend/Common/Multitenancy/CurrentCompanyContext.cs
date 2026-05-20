namespace TaskManager.Api.Common.Multitenancy;

public class CurrentCompanyContext : ICurrentCompanyContext
{
    public Guid? CompanyId { get; private set; }

    public void SetCompanyId(Guid companyId) => CompanyId = companyId;
}
