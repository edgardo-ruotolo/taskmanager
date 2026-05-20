# PostgreSQL — backup PITR (Point-In-Time Recovery)

## Objetivos

- **RTO** (Recovery Time Objective): 4 horas — tiempo máximo entre el incidente y el servicio restaurado.
- **RPO** (Recovery Point Objective): 15 minutos — pérdida máxima de datos aceptable.

## Estrategia

Combinación de:

1. **Base backup completo** diario con `pg_basebackup`.
2. **Archivado continuo de WAL** (Write-Ahead Log) cada 15 min para PITR.

## Configuración de PostgreSQL

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://<bucket>/wal/%f --sse'
archive_timeout = 900           # forzar rotación cada 15 min
max_wal_senders = 3
wal_keep_size = 1GB
```

## Cron de base backup (diario, 03:00 UTC)

```sh
0 3 * * * pg_basebackup -D /backups/$(date +\%Y\%m\%d) -X stream -F tar -z -P -U replicator
0 4 * * * aws s3 sync /backups/$(date -u +\%Y\%m\%d) s3://<bucket>/base/$(date -u +\%Y\%m\%d) --sse
```

Retención: 30 días en S3 con **Object Lock** activado.

## Restore drill (mensual, primer domingo)

Script `scripts/restore-drill.sh`:

1. Levantar instancia PostgreSQL aislada.
2. `restore_command = 'aws s3 cp s3://<bucket>/wal/%f %p'` apuntando al backup objetivo.
3. `pg_basebackup` del día anterior + WALs hasta T-15m.
4. Verificar conteo de filas en `Users`, `Issues`, `Workspaces` vs el último snapshot.
5. Reportar `RESTORE_OK` o `RESTORE_FAILED` en Slack + Pagerduty.

## Verificación on-call

- Dashboard Grafana panel `postgres.wal_archive_lag` debe estar < 60 s.
- Alerta si la última base completa tiene más de 26 h.

## Smoke test posterior al restore

```sql
SELECT COUNT(*) FROM "Users";
SELECT COUNT(*) FROM "Issues";
SELECT MAX("CreatedAt") FROM "WorkspaceActivities";
```
