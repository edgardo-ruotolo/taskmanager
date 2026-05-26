using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Modules.Labels.Entities;

namespace TaskManager.Api.Data.Seeders;

public static class CompanyLabelsSeeder
{
    private static readonly string[] CompanyNames =
    [
        "HALMONTE LTDA",
        "HALCON LTDA",
        "HALCO LTDA",
        "APLLETON EXPLORATION S.A.",
        "OLHSTEDT S.A.",
        "ISAAC MORENO SIERRA",
        "HABITABLE S.A.",
        "DOS CORDILLERAS SPA",
        "ALTO VALLE SPA",
        "INMOBILIARIA NOCEDAL SPA",
        "JHON JACKSON",
        "INVERSIONES GLOBAL TERRA SPA",
        "INVERSIONES ANDIRA SPA",
        "INVERSIONES DON FERMIN",
        "INMOBILIARIA MVRE CHILE",
        "D.PORTALES SPA",
        "L.THAYER SPA",
        "RBV & ASOCIADOS LTDA",
        "RBV CONSULTORES LTDA",
        "FLUENTOC SPA",
        "ROGUERS BUSTAMANTE VALNEZUELA",
        "TRANSPORTES RBV EIRL",
        "PRHAM",
        "INVERSIONES AGRUPADOS SPA",
        "INVERSIONES DOÑA NERRUCHA SPA",
        "ADELINA VALENZUELA",
        "NORKUDAU LTDA",
        "AGRICOLA GREEN POINT EIRL",
        "IBS COMPAÑÍA DE SEGURIDAD SPA",
        "COMEEP SEGURIDAD SPA",
        "REFF LOGÍSTICA SPA",
        "SOC. DE INV. E INMOBILIARIA MIRASOL SPA",
        "INVERSIONES RAYEN SPA",
        "INVERSIOPNES SIETE SPA",
        "COMERCIAL HOMU SPA",
        "IMPORTADORA EDUARDO PARDO LTDA",
        "FRAILE Y CASTRUCIO YUTE SPA",
        "YUTE NATURAL IMPRESIONES SPA",
        "PESAS POR MAYOR SPA",
        "ASESORIAS E INVERSIONES QUERCUS SPA",
        "ASESORIAS E INVERSIONES CASTRODEZA SPA",
        "SEBASTIAN ANDRES CASTRUCIO RODRIGUEZ",
        "FELIPE ALEJANDRO FRAILE CONCHA",
        "CORDILLERA METALS SPA",
        "CB LIMPIO SPA",
        "PROYECTA ESTUDIO SPA",
        "MARTA ASTORGA (clave única)"
    ];

    private static readonly string[] ColorPalette =
    [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#eab308",
        "#84cc16",
        "#22c55e",
        "#10b981",
        "#06b6d4",
        "#3b82f6",
        "#8b5cf6"
    ];

    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();

        var workspace = await db.Workspaces.IgnoreQueryFilters()
            .OrderBy(w => w.CreatedAt)
            .FirstOrDefaultAsync();

        if (workspace is null)
        {
            return;
        }

        var existingNames = await db.Labels.IgnoreQueryFilters()
            .Where(l => l.WorkspaceId == workspace.Id)
            .Select(l => l.Name)
            .ToHashSetAsync();

        var toInsert = new List<Label>();
        for (var i = 0; i < CompanyNames.Length; i++)
        {
            var name = CompanyNames[i];
            if (existingNames.Contains(name))
            {
                continue;
            }

            toInsert.Add(new Label
            {
                Name = name,
                Color = ColorPalette[i % ColorPalette.Length],
                Description = null,
                WorkspaceId = workspace.Id
            });
        }

        if (toInsert.Count > 0)
        {
            db.Labels.AddRange(toInsert);
            await db.SaveChangesAsync();
        }
    }
}
