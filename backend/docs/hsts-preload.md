# HSTS Preload Submission

## Estado

`Program.cs` configura `UseHsts()` en producción con:

```csharp
o.MaxAge = TimeSpan.FromDays(365);
o.IncludeSubDomains = true;
o.Preload = true;
```

Esto emite el header:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Pasos para entrar al preload list

1. Confirmar que **todos los subdominios** sirven HTTPS válido.
2. Verificar el header durante 24 h en producción:

   ```sh
   curl -I https://atlas.example | grep -i strict-transport
   ```

3. Submitir el dominio en https://hstspreload.org/
4. Esperar la inclusión en el bundle de Chromium/Firefox (típicamente 6-12 semanas).

## Reversibilidad

Quitar un dominio del preload list es **lento** (~12-16 semanas). Antes de
submitir confirmar que la organización está comprometida con HTTPS exclusivo
para `atlas.example` y todos los subdominios indefinidamente.
