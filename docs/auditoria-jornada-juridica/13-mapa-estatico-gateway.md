# Mapa estÃ¡tico de rotas e ownership â€” cobranÃ§as

**Escopo:** comparaÃ§Ã£o dos arquivos versionados do backend em 27/11/2026. Este mapa descreve configuraÃ§Ã£o declarada, nÃ£o prova qual Compose/profile estÃ¡ ativo em qualquer ambiente.

## Rota para cadastro do pagador jurÃ­dico

| Profile/entrada declarada | Destino declarado | TransformaÃ§Ã£o de caminho | Handler esperado |
|---|---|---|---|
| `docker-compose.yml`, `/v1/lex/cobrancas/*` | serviÃ§o `svc-cobrancas` | Remove `/v1/lex`; `/pagador` vira `/cobrancas/pagador` | `svc-cobrancas`, `cobrancas_routes.criar_cliente_pagador` |
| `docker-compose.yml`, `/k1/lex/cobrancas/*` | serviÃ§o `svc-cobrancas` | Remove `/k1/lex`; `/pagador` vira `/cobrancas/pagador` | Mesmo handler do serviÃ§o |
| `docker-compose.prod.yml`, `/v1/lex/cobrancas/*` | `kealex-svc-cobrancas` at priority 300, above broad gateway priority 1 | Removes `/v1/lex` | `svc-cobrancas` direct handler |
| `docker-compose.prod.yml`, `/k1/lex/cobrancas/*` | `kealex-svc-cobrancas` at priority 300, above broad gateway priority 1 | Removes `/k1/lex` | `svc-cobrancas` direct handler |
| `docker-compose.hostinger.yml` + `api-gateway/nginx.conf`, `/v1/lex/cobrancas/*` | `svc-cobrancas` | Preserva o URI completo | `svc-cobrancas`, `cobrancas_routes.criar_cliente_pagador` |
| `docker-compose.hostinger.yml` + `api-gateway/nginx.conf`, `/k1/lex/cobrancas/*` | `svc-cobrancas` | Preserva o URI completo | Mesmo handler do serviÃ§o |

## EvidÃªncias locais

- `docker-compose.yml`: router do serviÃ§o aceita ambos prefixos e strip-prefix remove `/v1/lex,/k1/lex` (linhas 338â€“343).
- `docker-compose.prod.yml`: billing routes now match both aliases at priority 300; the broad `kealex-gw` fallback is priority 1. Both prefixes strip to the short `/cobrancas` aliases supported by the service. The Nginx gateway build context now has a Dockerfile.
- `docker-compose.hostinger.yml` and `api-gateway/nginx.conf`: explicit `/v1` and `/k1` billing locations now target `svc-cobrancas`; the gateway dependency includes that service.
- `api-gateway/nginx.conf`: `/v1/lex/cobrancas` and `/k1/lex/cobrancas` now route directly to `svc-cobrancas`; unrelated unmapped prefixes still use the central fallback.
- Os trÃªs destinos de cÃ³digo registrados localmente tÃªm a rota pagador: `svc-cobrancas/app/api/routes/cobrancas_routes.py`, `app/api/routes/billing_routes.py` e `src/api/cobrancas.ts`. A integraÃ§Ã£o de `svc-cobrancas` confirma os aliases dentro do FastAPI, nÃ£o o encaminhamento pelo gateway.

## PendÃªncias do Gate 0

1. Identificar com o responsÃ¡vel de operaÃ§Ã£o qual profile/arquivo Ã© efetivamente implantado em cada ambiente e conferir a configuraÃ§Ã£o carregada do proxy.
2. `svc-cobrancas` is the canonical billing owner per the service catalog; the central fallback remains for legacy/compatibility paths. Confirm this ownership with the deployment owner during profile selection.
3. Executar contrato de rota contra um gateway de teste isolado, confirmando mÃ©todo, prefix strip, autenticaÃ§Ã£o e resposta; nÃ£o usar ambiente compartilhado.

The billing route declarations now align all inspected profiles on `svc-cobrancas` for `/v1` and `/k1`. Static config also shows a remaining prod fallback gap: Nginx targets `hubkealex`, but `docker-compose.prod.yml` does not declare that service (an external alias is unverified). The active profile and public route remain unverified, so Gate 0 stays open.

## AtualizaÃ§Ã£o de ownership e aliases (2026-11-27)

**CorreÃ§Ã£o da tabela inicial:** as duas linhas Hostinger acima substituem a anotaÃ§Ã£o antiga de fallback central. A configuraÃ§Ã£o versionada contÃ©m `location` explÃ­cito para `/v1/lex/cobrancas` e `/k1/lex/cobrancas`, aponta ambos a `svc-cobrancas` e declara o serviÃ§o como dependÃªncia do gateway. Isso comprova somente a configuraÃ§Ã£o estÃ¡tica; nÃ£o identifica o profile implantado nem comprova resoluÃ§Ã£o DNS, autenticaÃ§Ã£o ou resposta em runtime.

Este quadro complementa e substitui as linhas antigas de fallback para CRUD documental, financeiro e prazos:

| Prefixos | Proprietario declarado | Profiles e limites |
|---|---|---|
| `/v1/lex/cobrancas`, `/k1/lex/cobrancas` | `svc-cobrancas` | Base, production e Hostinger; runtime publico nao verificado |
| `/v1/lex/documentos`, `/k1/lex/documentos` | `svc-documentos` para CRUD | Base, production e Hostinger; analise documental mantem rotas proprias |
| `/v1/lex/financeiro`, `/k1/lex/financeiro` | `svc-financeiro` | Production e Hostinger; base usa fallback central pois nao declara este servico |
| `/v1/lex/prazos`, `/k1/lex/prazos` | `svc-prazos` | Production e Hostinger; base usa fallback central pois nao declara este servico |

Documentos, financeiro e prazos agora registram ambos os prefixos nos mesmos handlers e dependencias de autorizacao. Nginx Hostinger encaminha os dois prefixos; Traefik production encaminha o URI completo. Testes locais cobrem o contrato estatico e o registro FastAPI, nao o roteamento publico.

O Gate 0 permanece aberto: `docker-compose.prod.yml` tem fallback para `hubkealex`, que nao esta declarado nesse Compose (alias externo e ciclo de vida do banco nao confirmados); `docker-compose.nginx.yml` referencia `./nginx`, contexto ausente. Perfil ativo e destino publico precisam ser verificados em gateway isolado. Nenhuma migration ou implantacao foi executada.

## Auditoria de upstream Nginx/Compose Hostinger (2026-11-27)

O cruzamento estatico de `proxy_pass`, servicos Compose e `depends_on` encontrou upstreams sem servico declarado (`svc-clientes`, `svc-arquivos`) e falta de dependÃªncia do gateway para `svc-processos`. O Compose Hostinger agora declara clientes e arquivos, o volume `kealex-uploads` e as dependencias necessÃ¡rias; o upstream de usuÃ¡rios usa a chave Compose `svc-usuarios`. Teste de contrato verifica todos os destinos Nginx contra os serviÃ§os e dependencias. Os quatro arquivos Compose passaram no parser.

Pendente no profile base: `/v1/lex/processos` cai no hub sem handler V1 porque esse Compose nao declara `svc-processos`; Hostinger e production agora tem aliases V1/K1 estaticos no servico. O profile ativo, migrations e runtime isolado seguem sem validacao. Nenhum gateway, banco ou container foi iniciado.

## Listagem de usuarios
O frontend chama `GET /k1/lex/usuarios`, que antes era atendido pelo fallback central com resposta reduzida. Agora a rota e alias do handler de `svc-usuarios`, e os gateways base, production e Hostinger direcionam os dois prefixes ao serviÃ§o. Testes de registro FastAPI e contrato estatico passaram. O profile e roteamento em producao ainda precisam de verificacao isolada.


## Compatibilidade V1 de processos (2026-11-27)
O profile Hostinger encaminha `/v1/lex/processos` a `svc-processos`, e o servico registra aliases V1 para CRUD, fases, vinculos de clientes/partes e processos acompanhados. Production Traefik ja corresponde ambos os prefixes. Base Compose segue sem o servico e sem handlers centrais V1; nao trate V1 como disponivel nesse profile. Testes de registro/status passaram; runtime permanece sem validacao.

## Canonicalizacao de intimaÃ§Ãµes no frontend (2026-11-27)
O hook `src/hooks/useIntimacoes.ts` agora usa `/k1/lex/intimacoes` para GET, POST, PATCH e DELETE. O handler central declara aliases com e sem prefixo e aplica as mesmas dependencias de autenticacao/autorizacao; a alteracao remove a unica familia frontend que ainda consumia o caminho raiz legado. O inventario `node scripts/audit-frontend-api.mjs` continua sem rotas nao resolvidas (175 call sites, 176 variantes, 170 pares metodo/caminho). O teste de integracao existente `test_intimacoes.py` nao iniciou porque o ambiente `.venv` nao tem `bcrypt`; nenhum pacote foi instalado. O contrato permanece validado apenas por declaracoes estaticas; gateway/runtime e Gate 0 continuam pendentes.

## Reexecucao do inventario de consumidores frontend (2026-11-27)
Uma nova execucao de `node scripts/audit-frontend-api.mjs` confirmou 175 call sites, 176 variantes, 170 pares metodo/caminho e zero caminhos nao resolvidos. A comparacao por conteudo do crosswalk backend em `hubKealex/docs/kealex-2.0/evidence/R0-frontend-api-crosswalk.md` encontrou 23 referencias de linha de consumidor desatualizadas (46 linhas antigas/novas na comparacao); os pares metodo/caminho continuam iguais. A tabela foi regenerada; uma comparacao posterior confirmou correspondencia exata das 170 linhas e referencias atuais. Esta verificacao nao avalia dono efetivo no profile implantado nem roteamento runtime.

## Revalidacao do crosswalk de chamadas frontend (2026-11-27)
Reexecutei `node scripts/audit-frontend-api.mjs` e comparei a saida Markdown com `hubKealex/docs/kealex-2.0/evidence/R0-frontend-api-crosswalk.md`. Os dois inventarios tem 170 pares metodo/caminho, sem pares ausentes de qualquer lado; 135 linhas completas coincidem exatamente. Em 35 linhas, os caminhos continuam iguais, mas as referencias de arquivo/linha dos consumidores no crosswalk versionado do backend estao desatualizadas apos mudancas frontend posteriores. Esta nota atualiza a afirmacao anterior de correspondencia exata das 170 referencias. O parser local segue com 175 call sites, 176 variantes e zero caminhos nao resolvidos. Nao valida schema, autorizacao, roteamento em profile ativo ou runtime; Gate 0 permanece aberto, sem migration/deploy.