# Runbook — Base de datos caída

## Severidad

SEV-1 (P0). Sin DB la app no puede operar.

## Síntomas

- Connection timeouts en logs (`Npgsql.NpgsqlException: Connection refused`).
- `/health` retorna 503 con `database: unhealthy`.
- Alerta CloudWatch / Datadog `rds.connections.failed > 0`.

## Diagnóstico

1. RDS / managed PostgreSQL — verificar:
   - Estado de la instancia en la consola.
   - CPU / memoria / IOPS.
   - Connection count vs `max_connections`.
2. Probar conexión manual: `psql -h <host> -U <user> -c "SELECT 1"`.
3. Si la instancia está sana pero la app no conecta: revisar Security Group / VPC peering.

## Mitigación

- **Failover automático** (RDS multi-AZ): suele ser ~60-120 s. Esperar.
- **Read-replica promotion** si la primaria está caída sin recovery automático:
  ```sh
  aws rds promote-read-replica --db-instance-identifier atlas-postgres-replica-01
  ```
  Actualizar `ConnectionStrings:Postgres` y restartear pods.
- **Restore desde PITR** si hay corrupción:
  Ver `docs/backup-pitr.md`.

## Recuperación

1. Confirmar `/health` 200.
2. Confirmar tail de logs sin errores nuevos.
3. Comparar conteo de filas críticas vs métricas pre-incidente.

## Post-mortem

Incluye: causa raíz, ventana de pérdida (RPO real vs target), pasos de mejora.
