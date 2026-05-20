# WAF perimetral

## Objetivo

Bloquear el OWASP CRS Top 10 antes de que el tráfico alcance el backend, más
limitar tasa de abuso a endpoints de autenticación.

## Opción A — Cloudflare Pro

1. Activar **Cloudflare Managed Rulesets**:
   - "Cloudflare Managed Ruleset" → modo `Block`.
   - "OWASP Core Ruleset" → modo `Block`, paranoia level 2.
2. **Rate limiting** complementario al de la app:
   - Path `/api/auth/*` → 5 req/min por IP.
   - Path `/api/admin/*` → 30 req/min por IP.
3. **Bot Fight Mode** activado.
4. **Page Rules** para forzar HTTPS y minTlsVersion 1.2.

## Opción B — AWS WAF

`web-acl-config.yaml`:

```yaml
Rules:
  - Name: AWS-AWSManagedRulesCommonRuleSet
    Priority: 0
    OverrideAction: { None: {} }
    Statement:
      ManagedRuleGroupStatement:
        VendorName: AWS
        Name: AWSManagedRulesCommonRuleSet
  - Name: AWS-AWSManagedRulesKnownBadInputsRuleSet
    Priority: 1
    OverrideAction: { None: {} }
    Statement:
      ManagedRuleGroupStatement:
        VendorName: AWS
        Name: AWSManagedRulesKnownBadInputsRuleSet
  - Name: RateLimit-AuthEndpoints
    Priority: 2
    Action: { Block: {} }
    Statement:
      RateBasedStatement:
        Limit: 100             # por 5 minutos
        AggregateKeyType: IP
        ScopeDownStatement:
          ByteMatchStatement:
            FieldToMatch: { UriPath: {} }
            SearchString: /api/auth/
            PositionalConstraint: STARTS_WITH
            TextTransformations:
              - { Priority: 0, Type: NONE }
```

## Verificación

Smoke tests con `nikto -h https://api.atlas.example` debe reportar 0 issues
críticas. Lighthouse Security audit debe pasar.
