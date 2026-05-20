# Runbook — App caída

## Severidad

SEV-1 (P0). Página completa indisponible.

## Síntomas

- Health check `/health` devuelve 5xx o timeout.
- Alertas Sentry > 50 errores/min.
- Dashboard Grafana `taskmanager.api.requests_per_second` cae a 0.

## Diagnóstico (5 min)

1. Verificar status del proceso: `kubectl get pods -n atlas` / `systemctl status taskmanager-api`.
2. Logs últimos 5 min: `kubectl logs -n atlas deploy/api --since=5m | grep -i error`.
3. Estado DB: `psql -c "SELECT 1"` desde un nodo de la red.
4. Estado Redis: `redis-cli ping`.

## Mitigación

- **Si OOM**: aumentar memoria a 2x, restartear pods.
- **Si DB unreachable**: ver `db-down.md`.
- **Si crash loop**: hacer rollback al deploy anterior:
  ```sh
  kubectl rollout undo -n atlas deploy/api
  ```
- **Si CPU saturada**: aumentar replicas:
  ```sh
  kubectl scale -n atlas deploy/api --replicas=5
  ```

## Recuperación

- Confirmar `/health` 200.
- Confirmar curva de requests recuperándose.
- Limpiar alertas activas en PagerDuty.

## Post-mortem

Template en `docs/runbooks/postmortem-template.md`. Plazo: 48 h tras resolución.
