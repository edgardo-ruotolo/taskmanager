using TaskManager.Api.Modules.Labels.Entities;

namespace TaskManager.Api.Modules.Pages.Entities;

public class PageLabel
{
    public Guid PageId { get; set; }
    public Page Page { get; set; } = null!;
    public Guid LabelId { get; set; }
    public Label Label { get; set; } = null!;
}
