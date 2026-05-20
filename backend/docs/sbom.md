# SBOM + Dependency Scanning

## Generación local

### Backend (.NET)

```sh
cd backend
~/.dotnet/dotnet list package --vulnerable --include-transitive > .sbom/vulnerable.txt
~/.dotnet/dotnet sbom-tool generate -b . -bc . -pn "TaskManager.Api" -pv 1.0.0 -nsb https://atlas.example
```

Genera SPDX SBOM en `_manifest/spdx_2.2/manifest.spdx.json`.

### Frontend (pnpm)

```sh
cd frontend
pnpm audit --prod --json > .sbom/pnpm-audit.json
pnpm dlx @cyclonedx/cdxgen -o .sbom/sbom.cyclonedx.json
```

## CI — GitHub Actions

Workflow en `.github/workflows/security.yml`. Falla la build si encuentra
vulnerabilidades **High** o **Critical** sin excepción documentada.

## Política

- Revisar el reporte semanal cada lunes.
- Critical: parchear en < 48 h.
- High: parchear en < 7 días.
- Medium/Low: backlog priorizado por sprint.
