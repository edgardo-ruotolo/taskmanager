# Runbook — Secret filtrado

## Cuándo aplicarlo

- Detección de secret en commit público (GitHub push protection alert,
  TruffleHog, Gitleaks).
- Secret expuesto en logs accidentalmente.
- Compromiso de la máquina de un desarrollador.

## Severidad

SEV-1 si el secret tiene acceso a producción. SEV-2 si es staging.

## Inventario de secrets críticos

| Secret | Ubicación | Rotación |
|---|---|---|
| `ConnectionStrings:Postgres` | KMS / Vault | Inmediata |
| `Auth:RefreshTokenSecret` | KMS / Vault | Inmediata + ver `refresh-token-mass-revoke.md` |
| `Auth:MagicLinkSecret` | KMS / Vault | Inmediata + ver `magic-link-compromise.md` |
| `Brevo:ApiKey` | KMS / Vault | Inmediata |
| `PostHog:ApiKey` | KMS / Vault | Inmediata |
| OAuth client secrets (Google, GitHub) | KMS / Vault | Inmediata |

## Pasos genéricos

1. **Revocar el secret expuesto** en el proveedor (consola DB, panel de OAuth, etc.).
2. **Rotar** y actualizar `appsettings.Local.json` (no commitear) + variables de entorno.
3. **Redesplegar** pods para que la nueva versión cargue el nuevo secret.
4. **Auditar logs** desde la fecha probable de filtración hasta ahora:
   ```sql
   SELECT * FROM "AdminAuditLogs" WHERE "Timestamp" >= '<fecha>' ORDER BY "Timestamp";
   ```
5. **Notificar al equipo de seguridad** + (si DB) considerar restore PITR a punto pre-filtración.

## Si el secret se filtró en el repo

1. **NO** hacer `git rebase` ni `force push` para "limpiarlo" — sigue en mirrors.
2. Asumir el secret como comprometido **permanentemente**, rotarlo.
3. Usar BFG Repo-Cleaner sólo para reducir blast radius futuro, no como mitigación.

## Post-mortem

Incluye: cómo llegó al repo (commit, CI artifact, Slack), por qué no lo
detectamos pre-commit, qué guardrail añadir (pre-commit hook, GitHub push
protection, secret scanning).
