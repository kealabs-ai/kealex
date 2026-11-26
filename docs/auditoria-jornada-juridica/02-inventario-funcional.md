# Inventário funcional e técnico

## Frontend

SPA React/TypeScript com Vite, React Router, TanStack Query, Axios, React Hook Form e componentes reutilizados em `src/components`. A configuração da API vem de `KEALEX_API_BASE_URL` em `src/api/client.ts`; o interceptor envia Bearer JWT. Rotas públicas de site/login coexistem com módulos autenticados definidos em `src/App.tsx`.

### Rotas e menus observados

| Área | Rotas/telas | Observação funcional |
|---|---|---|
| Clientes | `/clientes` — `ClientesPage.tsx` | CRUD e pesquisa; cadastro reaproveitado em processos. |
| Processos | `/processos` — `ProcessosPage.tsx` | CRUD, fases, clientes, demais partes; número obrigatório. |
| Acompanhamento | `/acompanhar-processo` — `AcompanharProcessoPage.tsx` | Consulta CNJ, tabela, detalhe e atualização do registro acompanhado. |
| Documentos | `/documentos` — `DocumentosPage.tsx` | Metadados genéricos; upload de arquivo não envia conteúdo real. |
| Prazos/atividades | `/prazos`, `/atividades` | Prazos associados a processo; atividades têm quadro próprio sem `process_id` no modelo. |
| Audiências/intimações | `/audiencias`, `/intimacoes` | CRUD local de registros; não há coleta DJe; roteiro de audiência é hardcoded. |
| Financeiro/cobrança | `/financeiro`, `/cobranca` | Honorários e cobranças; cobertura não equivale a contabilidade completa do escritório. |
| IA e análise | `/ia`, `/analise-documentos`, `/meus-agents`, `/configuracoes/ia` | Chat, chaves/agentes/políticas e análise de arquivos; sem contexto processual integrado por padrão. |
| Ecossistema | `/integracao-orgaos`, `/kea-store`, `/kea-store/certidoes` | Acesso a consultas e emissões com modalidades diferentes (API, portal manual, indisponível). |
| Administração | `/admin`, `/gestao/*`, `/usuarios`, `/equipe`, `/perfil` | Configuração, cobrança, usuários e escritório por role. |

`ConsultaProcessualPage.tsx` e `escavadorApi` permanecem no código, mas não aparecem como rota em `App.tsx`; a jornada ativa é `AcompanharProcessoPage` + `processosAcompanhadosApi`.

### Roles e autorização da UI

Roles usados: `admin`, `advogado`, `juridico`, `cliente`, `escritorio`. `ProtectedLayout.tsx` aplica uma tabela de permissões por rota e políticas de menu/plano; `Sidebar.tsx` monta menus por role. Isso é proteção de experiência, não substitui autorização backend. Revisar também compatibilidade entre roles aceitos em cada microserviço; os conjuntos variam.

## Backend e serviços

O repositório `../hubKealex` contém uma API central em `app/main.py` e serviços FastAPI `svc-*`, além do Nginx e vários Compose. No Compose Hostinger há serviços de auth, clientes, processos, documentos, atividades, prazos, financeiro, cobrança, escritórios, usuários, integrações e configurações. Os modelos de diversos serviços representam tabelas compartilhadas no MySQL.

| Domínio | Código de referência | Persistência/integração |
|---|---|---|
| Autenticação/assinatura | `svc-auth`; `app/api/routes/auth_routes.py`, `billing_routes.py` | Usuários/tenants, JWT, trial e Asaas. |
| Clientes | `svc-clientes/app/api/routes/clientes_routes.py` | Tabela `clientes`; busca, CRUD, CEP e dados pessoais. |
| Processos | `svc-processos/app/api/routes/process_routes.py`, `process_client_routes.py`, `phase_routes.py` | `processos`, `fases`, `processo_clientes`, `processo_partes`. |
| Acompanhamento | `svc-processos/app/api/routes/tracked_process_routes.py` | `processos_acompanhados`, `historico_consultas_processuais`; provedor Escavador. |
| Documentos | `svc-documentos/app/api/routes/document_routes.py` e `document_analysis_routes.py`; central `resource_routes.py` | CRUD documental em rota central/legada; análise documental e Google Drive em serviço separado. |
| Arquivos | `svc-repositorios/app/api/routes/file_routes.py`, `svc-arquivos` | Repositórios e upload separados; não ligados pelo fluxo de upload da tela `/documentos`. |
| Prazos/atividades | `svc-prazos`, `svc-activities` e rotas centrais | Tabelas `prazos`, `activities`, `activity_columns`; tarefas e prazos não são o mesmo objeto. |
| Financeiro/cobranças | `svc-financeiro`, `svc-cobrancas`; `app/api/routes/billing_routes.py` | `honorarios`, `cobrancas`, histórico; rotas duplicadas. |
| Integrações | `svc-integracoes` | Escavador e FiscalAPI; DataJud está em `svc-usuarios`. |
| IA/agentes/créditos | `app/api/routes/ai_routes.py`, `agent_routes.py`, `kea_credits_routes.py` | `cfg_ia*`, chaves cifradas, políticas, token usage, carteira e transações. |
| Certidões | `app/api/routes/certificate_routes.py` + `application/use_cases/certificates.py` | Requisições, documentos PDF cifrados e logs; API oficial só para configuração específica, demais emissores via portal. |

## Integrações, entradas e saídas

- **Escavador:** frontend envia CNJ ao endpoint de acompanhamento; serviço de processos encaminha ao serviço de integração, persiste dados e histórico. Consulta externa não foi executada por poder gerar custo.
- **DataJud:** serviço de usuários aceita tribunal/número e chave pública cadastrada; endpoint não é o mesmo que a consulta Escavador. Não há integração de movimentos automaticamente ligada às tarefas do processo na UI.
- **Google Drive:** análise documental tem OAuth/configuração e leitura de documentos; as conversas não têm `processo_id`/`cliente_id` no modelo da análise.
- **FiscalAPI/Certidões:** `svc-integracoes` expõe FiscalAPI em `/api/v1/certidoes`; o fluxo central de certidões tem catálogo de emissores e operação oficial condicionada à configuração. Não confundir catálogo/link de portal com emissão automatizada.
- **Asaas:** cobrança de assinatura/recarga e fluxos de pagamento. Confirmar eventos e configurações por ambiente; não foram chamadas APIs externas.
- **KeaCredits:** carteira e transações no backend central; evidência de reserva/devolução em alguns serviços (p.ex., certidão CND). Não foi observada dedução explícita no fluxo `tracked_process_routes._sync`.

## Modelos centrais e relacionamento

Entidades observadas incluem `Tenant`, `Usuario`, `Cliente`, `Processo`, `Fase`, `ProcessClient`, `ProcessParty`, `Documento`, `Prazo`, `Audiencia`, `Intimacao`, `Honorario`, `Cobranca`, `HistoricoCobranca`, `Activity`, `ActivityColumn`, `AgenteIA`, políticas/uso de tokens, carteira/transação KeaCredits e modelos de certidões. Também há modelos separados para análise documental, repositórios, atividades e processos acompanhados.

O relacionamento é misto: `ProcessClient`/`ProcessParty` têm FK para processo, mas vários IDs interdomínio são UUIDs sem FK; `ProcessoAcompanhado` não aponta para `Processo`. Há duplicação de `Cliente`, `Processo`, `Documento`, `Prazo` e cobrança entre o app central e os serviços. Consulte diagrama em `05-arquitetura-e-integracoes.md`.

## APIs e contratos de maior uso

- Processos: `/k1/lex/processos` GET/POST, `/get`, `/update`, `/delete`, `/avancar-fase`; vínculos `/k1/lex/processos/{id}/clients` e `/parties`.
- Clientes: `/v1/lex/clientes` CRUD legado e `/k1/lex/clientes/search` no cliente frontend; serviço mantém aliases `/v1` e `/k1`.
- Documentos: frontend usa `/k1/lex/documentos`; serviço documental também define `/v1/lex/documentos`; CRUD legado existe em `app/api/routes/resource_routes.py`.
- Acompanhamento: `/k1/lex/processos-acompanhados` listagem, `/consultar`, `/{id}/atualizar`, histórico.
- Prazos, atividades, audiências, intimações, financeiro e cobranças possuem APIs separadas, mas gateway/consumidor variam entre prefixos `/k1` e `/v1`.

## Documentação e evidência

Não há README/AGENTS na raiz do frontend; existem notas antigas em `knowledge/README*.md` e versões em `docs/`. O backend possui `app/docs/AGENTS.md` e instruções por serviço. Parte da documentação do frontend anuncia recursos e credenciais de teste antigos, enquanto documentação do backend descreve uma arquitetura monolítica anterior. Trate o código e contratos ativos como evidência principal; atualize documentação a cada mudança de domínio.
