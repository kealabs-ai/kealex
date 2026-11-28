# Arquitetura e integraÃ§Ãµes

## Estado atual

```mermaid
flowchart LR
  Browser[React SPA\nReact Router + Query + Axios]
  Gateway[Nginx API Gateway]
  Core[FastAPI central\napp/main.py]
  Clients[svc-clientes]
  Processes[svc-processos]
  Docs[svc-documentos]
  Files[svc-arquivos / svc-repositorios]
  Activities[svc-activities]
  Deadlines[svc-prazos]
  Finance[svc-financeiro / svc-cobrancas]
  Integrations[svc-integracoes]
  Users[svc-usuarios]
  Settings[svc-configuracoes]
  DB[(MySQL compartilhado)]
  Escavador[Escavador]
  DataJud[DataJud]
  Asaas[Asaas]
  Google[Google Drive]

  Browser --> Gateway
  Gateway -->|clientes; processos; atividades; anÃ¡lise| Clients
  Gateway --> Processes
  Gateway --> Activities
  Gateway --> Docs
  Gateway -->|prefixos nÃ£o roteados| Core
  Core --> DB
  Clients --> DB
  Processes --> DB
  Docs --> DB
  Files --> DB
  Activities --> DB
  Deadlines --> DB
  Finance --> DB
  Integrations --> Escavador
  Processes --> Integrations
  Users --> DataJud
  Core --> Asaas
  Finance --> Asaas
  Docs --> Google
```

O diagrama Ã© lÃ³gico; nÃ£o indica que cada ligaÃ§Ã£o tenha sido testada em ambiente implantado. A implantaÃ§Ã£o Hostinger possui microserviÃ§os, porÃ©m o gateway tambÃ©m usa `hubkealex` como fallback. O frontend utiliza caminhos `/k1` e `/v1`; alguns domÃ­nios tÃªm caminhos equivalentes em serviÃ§os e monÃ³lito. Exemplo: `DocumentosPage` usa `/k1/lex/documentos`, enquanto `svc-documentos` documenta CRUD em `/v1/lex/documentos`; o CRUD `/k1` tambÃ©m existe no `app/api/routes/resource_routes.py` central. A seleÃ§Ã£o real do serviÃ§o depende de `api-gateway/nginx.conf` e do Compose implantado.

## Entidades e relaÃ§Ãµes relevantes

```mermaid
erDiagram
  TENANT ||--o{ USUARIO : possui
  TENANT ||--o{ CLIENTE : delimita
  TENANT ||--o{ PROCESSO : delimita
  CLIENTE ||--o{ PROCESSO_CLIENTE : participa
  PROCESSO ||--o{ PROCESSO_CLIENTE : vincula
  PROCESSO ||--o{ PROCESSO_PARTE : inclui
  PROCESSO ||--o{ FASE : acompanha
  PROCESSO ||--o{ DOCUMENTO : agrega
  PROCESSO ||--o{ PRAZO : agenda
  PROCESSO ||--o{ AUDIENCIA : agenda
  PROCESSO ||--o{ INTIMACAO : recebe
  PROCESSO_ACOMPANHADO ||--o{ HISTORICO_CONSULTA : audita
  TENANT ||--o{ PROCESSO_ACOMPANHADO : isola
  TENANT ||--o{ ATIVIDADE : isola
  USUARIO ||--o{ ATIVIDADE : atribui
  TENANT ||--o{ ANALISE_CONVERSA : isola
  ANALISE_CONVERSA ||--o{ ANALISE_DOCUMENTO : contÃ©m
  ANALISE_CONVERSA ||--o{ ANALISE_MENSAGEM : contÃ©m
  TENANT ||--o{ HONORARIO : isola
  PROCESSO ||--o{ HONORARIO : vincula
  TENANT ||--o{ COBRANCA : isola
```

Algumas linhas representam relaÃ§Ãµes lÃ³gicas, nÃ£o necessariamente FKs presentes no schema. A entidade de acompanhamento nÃ£o aponta para `PROCESSO`; conversa de anÃ¡lise nÃ£o aponta para cliente/processo; atividade nÃ£o contÃ©m `process_id`; o CRUD de audiÃªncias recebe tÃ­tulo e um `processId` vazio pela tela. IDs interdomÃ­nio e duplicaÃ§Ã£o de modelos exigem consistÃªncia por serviÃ§o e migraÃ§Ãµes coordenadas.

## Principais riscos arquiteturais

- **Dois caminhos de execuÃ§Ã£o:** aplicaÃ§Ã£o central e microserviÃ§os implementam tabelas/domÃ­nios parcialmente iguais; serviÃ§o de destino pode variar com gateway/deploy.
- **Contratos divergentes:** prefixos, mÃ©todos, schemas e capacidades variam; corrigir endpoint em um serviÃ§o nÃ£o corrige necessariamente fallback central/prod.
- **Banco compartilhado:** vÃ¡rios serviÃ§os usam MySQL e modelos duplicados; mudanÃ§as requerem migraÃ§Ã£o versionada e compatibilidade entre versÃµes.
- **Acoplamento Ã  camada legada:** `app/main.py` importa `legacy_context` e vÃ¡rios routers centrais; novos fluxos nÃ£o devem continuar ampliando esse contexto.
- **Confiabilidade transacional:** operaÃ§Ãµes multietapas de processo + clientes + partes podem persistir parcialmente; a UI comunica que o processo foi salvo e depois pode falhar em vÃ­nculos.
- **Auditoria incompleta do domÃ­nio:** histÃ³rico estÃ¡ presente em cobranÃ§a e acompanhamento, mas alteraÃ§Ãµes de cadastro, peÃ§a, estado interno e download de documentos nÃ£o tÃªm trilha uniforme demonstrada.

## Arquitetura recomendada (evolutiva)

```mermaid
flowchart TD
  UI[Frontend: espaÃ§o de trabalho do caso]
  API[API Gateway com contratos/versionamento explÃ­citos]
  Matter[DomÃ­nio Caso/Processo + workflow interno]
  CRM[Clientes: fonte cadastral Ãºnica]
  DMS[Documentos: storage, metadados, versÃµes e ACL]
  Calendar[Agenda, tarefas e prazos verificÃ¡veis]
  Billing[Financeiro do escritÃ³rio separado de valores judiciais]
  AI[OrquestraÃ§Ã£o IA com polÃ­tica, custo e auditoria]
  External[Adaptadores externos: Escavador, DataJud, PJe/eproc etc.]
  Audit[Trilha de auditoria e outbox/eventos]
  DB[(Banco e storage com ownership explÃ­cito)]
  UI --> API
  API --> Matter
  Matter --> CRM
  Matter --> DMS
  Matter --> Calendar
  Matter --> Billing
  Matter --> AI
  Matter --> External
  Matter --> Audit
  CRM --> DB
  DMS --> DB
  Calendar --> DB
  Billing --> DB
  Matter --> DB
  Audit --> DB
```

NÃ£o Ã© recomendada a criaÃ§Ã£o imediata de novos serviÃ§os. Primeiro, definir propriedade de entidades/rotas, contratos e gateway; modelar Caso/ProcessoInterno e vÃ­nculo com processo oficial; centralizar documentos e auditoria. Extrair serviÃ§os sÃ³ com limites e escala justificados.

## IntegraÃ§Ãµes: capacidades e dependÃªncias

| IntegraÃ§Ã£o | EvidÃªncia | DependÃªncias / limite |
|---|---|---|
| Escavador | Adapter em `svc-integracoes`; proxy de serviÃ§o de processos | Token contratado, custo/limites, idempotÃªncia/cache, consentimento/base legal e orÃ§amento; consulta nÃ£o executada. |
| DataJud | `svc-usuarios/app/api/routes/datajud_routes.py` | Chave pÃºblica e mapeamento tribunal; resposta de consulta nÃ£o equivale a peticionamento. |
| PJe/eproc/e-SAJ/Projudi/SEI | Nenhum adaptador de protocolo encontrado na jornada auditada | Acesso oficial, autenticaÃ§Ã£o, autorizaÃ§Ã£o, certificaÃ§Ã£o e termos de cada sistema; estimar separadamente. |
| Google Drive | OAuth e leitura no mÃ³dulo de anÃ¡lise | Escopos, consentimento, tokens cifrados, ACL e associaÃ§Ã£o dos itens ao caso. |
| FiscalAPI/portais | ServiÃ§o de integraÃ§Ã£o e catÃ¡logo central de certificados | Credenciais/contratos; modalidades e custos variam. A maior parte do catÃ¡logo nÃ£o Ã© emissÃ£o via API. |
| Asaas | CobranÃ§a SaaS, recargas e cobranÃ§a de honorÃ¡rios | Webhooks autenticados/idempotentes, tokenizaÃ§Ã£o de cartÃ£o, conciliaÃ§Ã£o e ambiente sandbox. |
| Provedores LLM | AI Hub, agentes, anÃ¡lise documental | Chave por usuÃ¡rio/tenant, polÃ­tica de retenÃ§Ã£o, custo, logging seguro, fontes verificÃ¡veis e revisÃ£o humana. |

## OperaÃ§Ã£o, migraÃ§Ã£o e testes

Antes de novos fluxos, elaborar inventÃ¡rio de roteamento por Compose ativo, prefixo, mÃ©todo e serviÃ§o real. Definir contrato canÃ´nico para cada domÃ­nio e automatizar contrato/gateway tests. MigraÃ§Ãµes devem ser versionadas; `Base.metadata.create_all()` cria tabelas ausentes, mas nÃ£o altera tabelas existentes. NÃ£o executar migrations nesta auditoria.

## Frontend API crosswalk refresh (2026-11-27)

- Reproducible parser: `node scripts/audit-frontend-api.mjs` from the frontend root. Current results: 173 source API call sites, 174 route variants, 169 unique method/path pairs, and zero unresolved paths.
- The `--markdown` output matches the backend crosswalk pair set and every consumer line reference (169/169, no diff). Five omitted route pairs are now documented: GET/POST base activity routes, Google Drive file listing, and certificate document/download GET variants.
- Static Hostinger mapping still sends two subscription calls to the central catch-all while handlers are declared in `svc-auth`. The active profile is unconfirmed; no gateway, migration, or runtime action was performed. This comparison does not validate authorization, payloads, DNS, or runtime.
## Atualização da contagem de chamadas API frontend - 27/11/2026

- `node scripts/audit-frontend-api.mjs` encontrou 175 call sites, 176 variantes de caminho, 170 pares método/caminho únicos e nenhuma variável de caminho não resolvida pelo parser. O inventário inclui rotas fora dos prefixos `/k1/lex` e `/v1/lex`: intimacoes no app central; certificados em `app/api/routes/certificate_routes.py`; Escavador em `svc-integracoes`; Google em `svc-documentos`.
- O caminho `GET/POST/PATCH/DELETE /intimacoes` tem alias `/k1/lex/intimacoes` no app central. O hook frontend foi migrado para o prefixo canônico `/k1/lex/intimacoes`; os caminhos sem prefixo permanecem como compatibilidade no handler central. Certificados também dependem do fallback central; os prefixes Escavador e Google têm locations Nginx explícitos para os serviços correspondentes.
- Este parse localiza consumidores e caminhos declarados, mas não compara integralmente os schemas, métodos efetivos, roteador publicado ou profile ativo. A contagem substitui a linha de inventário anterior (173/174/169); Gate 0 permanece aberto até verificar roteamento isolado e endpoint efetivo.

## Revalidacao do crosswalk de chamadas frontend (2026-11-27)
Reexecutei `node scripts/audit-frontend-api.mjs` e comparei a saida Markdown com `hubKealex/docs/kealex-2.0/evidence/R0-frontend-api-crosswalk.md`. Os dois inventarios tem 170 pares metodo/caminho, sem pares ausentes de qualquer lado; 135 linhas completas coincidem exatamente. Em 35 linhas, os caminhos continuam iguais, mas as referencias de arquivo/linha dos consumidores no crosswalk versionado do backend estao desatualizadas apos mudancas frontend posteriores. Esta nota atualiza a afirmacao anterior de correspondencia exata das 170 referencias. O parser local segue com 175 call sites, 176 variantes e zero caminhos nao resolvidos. Nao valida schema, autorizacao, roteamento em profile ativo ou runtime; Gate 0 permanece aberto, sem migration/deploy.