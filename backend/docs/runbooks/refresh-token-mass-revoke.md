# Runbook — Revocación masiva de refresh tokens

## Cuándo aplicarlo

- Sospecha de compromiso del secret `Auth:RefreshTokenSecret`.
- Filtración de tokens en logs públicos.
- Auditoría que indica acceso no autorizado a gran escala.

## Severidad

SEV-2 (P1). Todos los usuarios deberán reautenticarse — comunicar via banner en
la app + email transaccional.

## Pasos

1. **Rotar el secret** en KMS / Vault. El nuevo valor debe entrar en
   `appsettings.Local.json: Auth:RefreshTokenSecret` y desplegarse.
2. **Borrar todos los refresh tokens existentes**:
   ```sql
   DELETE FROM "RefreshTokens";
   ```
   o, si la tabla es grande:
   ```sql
   UPDATE "RefreshTokens" SET "IsRevoked" = true, "RevokedAt" = now();
   ```
3. **Reiniciar pods** para forzar lectura del nuevo secret.
4. **Anunciar** en la app: banner `<Toast>` informando "Por seguridad pedimos
   reiniciar sesión".

## Verificación

- Confirmar que `/api/auth/refresh` con un token antiguo devuelve 401.
- Confirmar que logins recientes generan nuevos refresh tokens válidos.

## Post-mortem

Documentar el vector de compromiso, plazos de rotación, y mejoras de detección.
