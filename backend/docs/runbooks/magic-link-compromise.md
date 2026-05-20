# Runbook — Compromiso de Magic Link

## Cuándo aplicarlo

- Filtración del secret `Auth:MagicLinkSecret`.
- Acceso no autorizado por explotación de magic link.

## Severidad

SEV-2 (P1).

## Pasos

1. **Rotar secret** en KMS:
   ```
   Auth:MagicLinkSecret = <nuevo>
   ```
2. **Invalidar tokens pendientes**:
   ```sql
   UPDATE "MagicLinkTokens"
   SET "IsUsed" = true, "UsedAt" = now()
   WHERE "IsUsed" = false;
   ```
3. **Deshabilitar magic links temporalmente** vía feature flag:
   ```sh
   curl -X PATCH https://api.atlas.example/api/admin/feature-flags/MagicLinkLogin \
     -H 'Authorization: Bearer <admin>' \
     -d '{"enabled": false}'
   ```
4. **Comunicar a usuarios** afectados con instrucciones para password reset.

## Recuperación

- Activar el feature flag de magic links sólo tras confirmar contención.
- Smoke test: solicitar un magic link y verificar que sólo el último token es válido.

## Post-mortem

Incluye vector, alcance, comunicación y plan de mitigación a largo plazo (TOTP, passkeys).
