using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Analytics.Services;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Exporter.Reports;

public class AnalyticsReportDocument : IDocument
{
    private readonly AnalyticsReportData _data;

    private static readonly string Brand = "#3b82f6";
    private static readonly string Neutral900 = "#0f172a";
    private static readonly string Neutral700 = "#334155";
    private static readonly string Neutral500 = "#64748b";
    private static readonly string Neutral300 = "#cbd5e1";
    private static readonly string Neutral100 = "#f1f5f9";
    private static readonly string Green = "#22c55e";
    private static readonly string Red = "#ef4444";

    public AnalyticsReportDocument(AnalyticsReportData data)
    {
        _data = data;
    }

    public DocumentMetadata GetMetadata() => new()
    {
        Title = _data.ReportName,
        Author = _data.GeneratedBy,
        Subject = $"Analytics report — {_data.WorkspaceName}",
        Producer = "TaskManager",
        Creator = "TaskManager",
    };

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(40);
            page.DefaultTextStyle(x => x.FontSize(10).FontColor(Neutral900));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().Element(ComposeFooter);
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text(_data.ReportName).FontSize(20).Bold().FontColor(Neutral900);
                    c.Item().Text($"Workspace: {_data.WorkspaceName}").FontSize(10).FontColor(Neutral500);
                });
                row.ConstantItem(160).AlignRight().Column(c =>
                {
                    c.Item().AlignRight().Text("TaskManager").FontSize(10).Bold().FontColor(Brand);
                    c.Item().AlignRight().Text(_data.GeneratedAt.ToString("dd/MM/yyyy HH:mm 'UTC'"))
                        .FontSize(8).FontColor(Neutral500);
                    c.Item().AlignRight().Text($"Generado por: {_data.GeneratedBy}")
                        .FontSize(8).FontColor(Neutral500);
                });
            });

            col.Item().PaddingTop(8).LineHorizontal(0.5f).LineColor(Neutral300);

            col.Item().PaddingTop(8).Text(_data.FiltersSummary).FontSize(8).Italic().FontColor(Neutral700);
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingTop(15).Column(col =>
        {
            col.Spacing(18);

            if (HasSection("kpis") && _data.Overview is not null)
            {
                col.Item().Element(ComposeKpis);
            }

            if (HasSection("kpis") && (_data.IssuesByState is { Count: > 0 } || _data.IssuesByPriority is { Count: > 0 }))
            {
                col.Item().Element(ComposeDistributions);
            }

            if (HasSection("gantt") && _data.Gantt is { Count: > 0 })
            {
                col.Item().Element(ComposeGantt);
            }

            if (HasSection("burndown") && _data.Burndown is { Count: > 0 })
            {
                col.Item().Element(ComposeBurndown);
            }

            if (HasSection("ranking") && _data.UserRanking is { Count: > 0 })
            {
                col.Item().Element(ComposeUserRanking);
            }

            if (HasSection("clients") && _data.ClientComparison is { Count: > 0 })
            {
                col.Item().Element(ComposeClientComparison);
            }

            if (HasSection("drilldown") && _data.Drilldown is not null && _data.Drilldown.Items.Any())
            {
                col.Item().Element(ComposeDrilldown);
            }
        });
    }

    private bool HasSection(string key) =>
        _data.Sections.Count == 0
        || _data.Sections.Any(s => string.Equals(s, key, StringComparison.OrdinalIgnoreCase));

    private void ComposeKpis(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("Resumen general").FontSize(13).Bold().FontColor(Neutral900);
            col.Item().PaddingTop(8).Row(row =>
            {
                row.Spacing(8);
                row.RelativeItem().Element(c => KpiCard(c, "TOTAL ISSUES", _data.Overview!.Total.ToString(), Neutral700));
                row.RelativeItem().Element(c => KpiCard(c, "EN CURSO", _data.Overview.InProgress.ToString(), Brand));
                row.RelativeItem().Element(c => KpiCard(c, "COMPLETADAS", _data.Overview.Completed.ToString(), Green));
                row.RelativeItem().Element(c => KpiCard(c, "VENCIDAS", _data.Overview.Overdue.ToString(),
                    _data.Overview.Overdue > 0 ? Red : Neutral500));
            });
        });
    }

    private void KpiCard(IContainer container, string label, string value, string accent)
    {
        container
            .Border(0.5f).BorderColor(Neutral300)
            .Background(Colors.White)
            .Padding(10)
            .Column(c =>
            {
                c.Item().Text(label).FontSize(7).LetterSpacing(0.6f).FontColor(Neutral500);
                c.Item().PaddingTop(4).Text(value).FontSize(22).Bold().FontColor(accent);
            });
    }

    private void ComposeDistributions(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("Distribuciones").FontSize(13).Bold().FontColor(Neutral900);
            col.Item().PaddingTop(8).Row(row =>
            {
                row.Spacing(12);

                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Por estado").FontSize(9).Bold().FontColor(Neutral700);
                    var stateBuckets = _data.IssuesByState ?? (IReadOnlyList<StateBucket>)Array.Empty<StateBucket>();
                    var totalState = stateBuckets.Sum(b => b.Count);
                    foreach (var b in stateBuckets)
                    {
                        c.Item().PaddingTop(4).Element(box => DistributionRow(box, b.StateName, b.Count, totalState));
                    }
                });

                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Por prioridad").FontSize(9).Bold().FontColor(Neutral700);
                    var prioBuckets = _data.IssuesByPriority ?? (IReadOnlyList<PriorityBucket>)Array.Empty<PriorityBucket>();
                    var totalPrio = prioBuckets.Sum(b => b.Count);
                    foreach (var b in prioBuckets)
                    {
                        c.Item().PaddingTop(4).Element(box => DistributionRow(box, b.Priority, b.Count, totalPrio));
                    }
                });
            });
        });
    }

    private void DistributionRow(IContainer container, string label, int count, int total)
    {
        var pct = total > 0 ? (double)count * 100d / total : 0d;
        container.Row(row =>
        {
            row.RelativeItem(2).Text(label).FontSize(9);
            row.RelativeItem(4).AlignMiddle().Element(barBox =>
            {
                barBox.Height(8).Background(Neutral100).Row(barRow =>
                {
                    var filled = (float)Math.Clamp(pct / 100d, 0.001, 0.999);
                    barRow.RelativeItem(filled).Background(Brand);
                    barRow.RelativeItem(1 - filled).Background(Colors.White);
                });
            });
            row.ConstantItem(50).AlignRight().Text($"{count} · {pct:0}%").FontSize(8).FontColor(Neutral700);
        });
    }

    private void ComposeGantt(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("Gantt — tareas en curso y realizadas").FontSize(13).Bold().FontColor(Neutral900);

            var rows = _data.Gantt!;
            var minDate = rows.Min(r => r.StartDate ?? r.DueDate ?? DateTime.UtcNow).Date;
            var maxDate = rows.Max(r => r.DueDate ?? r.StartDate ?? DateTime.UtcNow).Date;
            if (maxDate <= minDate) maxDate = minDate.AddDays(1);
            var totalDays = Math.Max(1, (maxDate - minDate).TotalDays);

            col.Item().PaddingTop(6).Row(headerRow =>
            {
                headerRow.RelativeItem(3).Text("ISSUE").FontSize(7).LetterSpacing(0.5f).FontColor(Neutral500);
                headerRow.RelativeItem(2).Text("ASIGNADO").FontSize(7).LetterSpacing(0.5f).FontColor(Neutral500);
                headerRow.RelativeItem(6).Text($"{minDate:dd/MM} → {maxDate:dd/MM}")
                    .FontSize(7).LetterSpacing(0.5f).FontColor(Neutral500);
            });

            foreach (var r in rows.Take(40))
            {
                col.Item().PaddingTop(4).Row(barRow =>
                {
                    barRow.RelativeItem(3).Text($"{r.ProjectIdentifier}-{r.SequenceId}  {Truncate(r.Title, 30)}")
                        .FontSize(8).FontColor(Neutral900);
                    barRow.RelativeItem(2).Text(r.AssigneeName ?? "—").FontSize(8).FontColor(Neutral700);
                    barRow.RelativeItem(6).Element(track =>
                    {
                        track.Height(10).Background(Neutral100).Row(timeline =>
                        {
                            var start = (r.StartDate ?? r.DueDate ?? minDate).Date;
                            var end = (r.DueDate ?? r.StartDate ?? minDate).Date;
                            if (end < start) end = start;

                            var leftDays = (start - minDate).TotalDays;
                            var spanDays = Math.Max(0.5, (end - start).TotalDays);
                            var leftFrac = (float)(leftDays / totalDays);
                            var spanFrac = (float)(spanDays / totalDays);
                            var rightFrac = 1f - leftFrac - spanFrac;
                            if (rightFrac < 0) rightFrac = 0;

                            var color = r.IsOverdue ? Red
                                : r.StateCategory == StateCategory.Completed ? Green
                                : r.StateCategory == StateCategory.Cancelled ? Neutral500
                                : Brand;

                            if (leftFrac > 0) timeline.RelativeItem(leftFrac);
                            timeline.RelativeItem(Math.Max(0.001f, spanFrac)).Background(color);
                            if (rightFrac > 0) timeline.RelativeItem(rightFrac);
                        });
                    });
                });
            }

            if (rows.Count > 40)
            {
                col.Item().PaddingTop(6).Text($"… {rows.Count - 40} issues adicionales no mostradas en el resumen visual.")
                    .FontSize(8).Italic().FontColor(Neutral500);
            }
        });
    }

    private void ComposeBurndown(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("Burndown").FontSize(13).Bold().FontColor(Neutral900);

            var points = _data.Burndown!;
            var maxValue = points.Max(p => Math.Max(p.Total, p.Remaining));
            if (maxValue <= 0) maxValue = 1;

            col.Item().PaddingTop(8).Height(120).Row(row =>
            {
                row.ConstantItem(30).AlignBottom().Text($"{maxValue}").FontSize(7).FontColor(Neutral500);
                row.RelativeItem().Row(chart =>
                {
                    foreach (var p in points)
                    {
                        var hReal = (float)Math.Clamp(p.Remaining / (double)maxValue, 0.001, 0.999);
                        var hIdeal = (float)(p.Ideal / maxValue);
                        chart.RelativeItem().Column(c =>
                        {
                            c.Item().Height(120).Background(Neutral100).Row(bar =>
                            {
                                bar.RelativeItem(1 - hReal);
                                bar.RelativeItem(hReal).Background(Brand);
                            });
                        });
                    }
                });
            });

            col.Item().PaddingTop(4).Row(row =>
            {
                row.RelativeItem().Text($"{points.First().Date:dd/MM/yyyy}").FontSize(7).FontColor(Neutral500);
                row.RelativeItem().AlignCenter().Text($"{points.Count} días").FontSize(7).FontColor(Neutral500);
                row.RelativeItem().AlignRight().Text($"{points.Last().Date:dd/MM/yyyy}").FontSize(7).FontColor(Neutral500);
            });

            col.Item().PaddingTop(6).Row(row =>
            {
                row.AutoItem().Width(8).Height(8).Background(Brand);
                row.AutoItem().PaddingLeft(4).Text("Restantes").FontSize(8).FontColor(Neutral700);
                row.ConstantItem(12);
                row.AutoItem().Width(8).Height(8).Background(Neutral300);
                row.AutoItem().PaddingLeft(4).Text("Ideal").FontSize(8).FontColor(Neutral700);
            });
        });
    }

    private void ComposeUserRanking(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("Ranking de usuarios").FontSize(13).Bold().FontColor(Neutral900);
            col.Item().PaddingTop(8).Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.RelativeColumn(3);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                });

                table.Header(h =>
                {
                    Th(h.Cell(), "USUARIO");
                    Th(h.Cell(), "ASIG.");
                    Th(h.Cell(), "EN CURSO");
                    Th(h.Cell(), "COMPL.");
                    Th(h.Cell(), "VENC.");
                    Th(h.Cell(), "Ø DÍAS");
                });

                foreach (var u in _data.UserRanking!)
                {
                    Td(table.Cell(), u.FullName);
                    Td(table.Cell(), u.Assigned.ToString());
                    Td(table.Cell(), u.InProgress.ToString());
                    Td(table.Cell(), u.Completed.ToString());
                    Td(table.Cell(), u.Overdue.ToString());
                    Td(table.Cell(), u.AvgResolutionDays.ToString("0.0"));
                }
            });
        });
    }

    private void ComposeClientComparison(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("Comparativa por cliente (etiqueta)").FontSize(13).Bold().FontColor(Neutral900);
            col.Item().PaddingTop(8).Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.RelativeColumn(3);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                    c.RelativeColumn(1);
                });

                table.Header(h =>
                {
                    Th(h.Cell(), "CLIENTE");
                    Th(h.Cell(), "TOTAL");
                    Th(h.Cell(), "ABIERTAS");
                    Th(h.Cell(), "COMPL.");
                    Th(h.Cell(), "VENC.");
                    Th(h.Cell(), "% COMP.");
                });

                foreach (var c in _data.ClientComparison!)
                {
                    Td(table.Cell(), c.LabelName);
                    Td(table.Cell(), c.Total.ToString());
                    Td(table.Cell(), c.Open.ToString());
                    Td(table.Cell(), c.Completed.ToString());
                    Td(table.Cell(), c.Overdue.ToString());
                    Td(table.Cell(), $"{c.PercentComplete:0}%");
                }
            });
        });
    }

    private void ComposeDrilldown(IContainer container)
    {
        container.Column(col =>
        {
            var drillItems = _data.Drilldown!.Items.ToList();
            col.Item().Text($"Detalle de tareas ({drillItems.Count} de {_data.Drilldown.TotalCount})")
                .FontSize(13).Bold().FontColor(Neutral900);

            col.Item().PaddingTop(8).Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.ConstantColumn(45);
                    c.RelativeColumn(4);
                    c.RelativeColumn(2);
                    c.RelativeColumn(2);
                    c.RelativeColumn(1.4f);
                    c.ConstantColumn(50);
                    c.ConstantColumn(55);
                });

                table.Header(h =>
                {
                    Th(h.Cell(), "ID");
                    Th(h.Cell(), "TÍTULO");
                    Th(h.Cell(), "ASIGNADO");
                    Th(h.Cell(), "ESTADO");
                    Th(h.Cell(), "PRIORIDAD");
                    Th(h.Cell(), "INICIO");
                    Th(h.Cell(), "VENCE");
                });

                foreach (var r in drillItems)
                {
                    Td(table.Cell(), $"{r.ProjectIdentifier}-{r.SequenceId}", 7);
                    Td(table.Cell(), Truncate(r.Title, 45));
                    Td(table.Cell(), r.AssigneeName ?? "—");
                    Td(table.Cell(), r.StateName);
                    Td(table.Cell(), r.Priority.ToString());
                    Td(table.Cell(), r.StartDate?.ToString("dd/MM/yy") ?? "—", 7);
                    Td(table.Cell(), r.DueDate?.ToString("dd/MM/yy") ?? "—", 7);
                }
            });
        });
    }

    private static void Th(QuestPDF.Infrastructure.IContainer header, string text)
    {
        header.PaddingVertical(4)
            .BorderBottom(0.5f).BorderColor(Neutral300)
            .Text(text).FontSize(7).LetterSpacing(0.5f).FontColor(Neutral500);
    }

    private static void Td(QuestPDF.Infrastructure.IContainer cell, string text, int size = 8)
    {
        cell.PaddingVertical(3).BorderBottom(0.25f).BorderColor(Neutral100)
            .Text(text).FontSize(size).FontColor(Neutral900);
    }

    private static string Truncate(string s, int maxLength)
    {
        if (string.IsNullOrEmpty(s)) return s;
        return s.Length <= maxLength ? s : s[..(maxLength - 1)] + "…";
    }

    private void ComposeFooter(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Text(_data.WorkspaceName).FontSize(7).FontColor(Neutral500);
            row.RelativeItem().AlignCenter().Text(t =>
            {
                t.DefaultTextStyle(s => s.FontSize(7).FontColor(Neutral500));
                t.Span("Página ");
                t.CurrentPageNumber();
                t.Span(" de ");
                t.TotalPages();
            });
            row.RelativeItem().AlignRight()
                .Text($"Generado {_data.GeneratedAt:dd/MM/yyyy HH:mm} UTC").FontSize(7).FontColor(Neutral500);
        });
    }
}
