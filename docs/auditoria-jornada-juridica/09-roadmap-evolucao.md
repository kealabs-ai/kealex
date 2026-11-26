# Roadmap de evolução

Estimativas são relativas ao contexto atual e devem ser detalhadas com engenharia, jurídico/advogados e operações antes de planejamento de release. Reutilizar os domínios/serviços existentes; não iniciar por novos microserviços.

## P0 — Crítico

| Item | Problema / solução / valor | Complexidade | Dependências / componentes | Banco / risco | Critérios de aceite |
|---|---|---:|---|---|---|
| P0.1 Armazenamento documental real | Upload atual persiste URL fictícia. Integrar `DocumentosPage` ao storage privado existente, com metadados, ACL, versão/hash e download autenticado. Valor: preservar prova e evitar falsa confirmação. | Média | `DocumentosPage`, `svc-arquivos`/`svc-repositorios`, `svc-documentos`, gateway | Rever metadados/ACL e migration se necessário; risco de migração de URLs legadas. | Bytes recebidos e baixados com autorização; teste MIME/tamanho/IDOR; falha nunca registra sucesso. |
| P0.2 Segurança de logs e sessão | Retirar payload/resposta da telemetria de atividades e revisar sessão/token. Valor: reduzir exposição de sigilo. | Média | `src/api/activities.ts`, `svc-activities` middleware, auth/gateway | Nenhuma migration inicial; mudança de auth pode exigir compatibilidade. | Nenhum token, texto de caso, PII ou arquivo em logs; sessão e revogação testadas. |
| P0.3 Autorização cliente/tenant | Confirmar `cliente_id` versus `JWT sub`, documentar vínculo e provar autorização negativa. Valor: portal correto e confidencialidade. | Média | `svc-processos`, `svc-clientes`, `svc-auth`, `ProtectedLayout` | Pode requerer vínculo usuario-cliente e migration; evitar associação por e-mail sem verificação. | Cliente vê só processos explicitamente atribuídos; testes cruzados para quatro roles/tenants. |
| P0.4 Contratos/gateway canônicos | Inventariar qual serviço atende cada prefixo/método e alinhar Compose, Nginx e frontend. Valor: reduzir 404 e divergência. | Média | `api-gateway/nginx.conf`, Compose Hostinger, `app/main.py`, `src/api/*` | Sem schema; risco de roteamento de versões/compatibilidade. | Tabela de rotas passa em contrato tests; nenhuma rota ambígua para domínios ativos. |

## P1 — Alto valor / completar MVP jurídico

| Item | Problema / solução / valor | Complexidade | Dependências / serviços/telas | Banco / risco | Critérios de aceite |
|---|---|---:|---|---|---|
| P1.1 Caso interno sem CNJ | Processo atual exige número. Introduzir CasoInterno/ProcessoPreparatório com conversão explícita para processo protocolado. Valor: iniciar trabalho no atendimento. | Alta | Processos, clientes, gateway, novo hub do caso | Migration versionada e migração de legado; separar status interno de status oficial. | Criar caso sem CNJ, vincular cliente/partes e convertê-lo sem perder IDs/histórico. |
| P1.2 Página central do caso | Dados dispersos em telas. Hub com resumo, partes, documentos, peças, movimentos, prazos, audiência, financeiro e histórico. Valor: reduzir retrabalho. | Alta | `ProcessosPage`, `AcompanharProcessoPage`, clientes, docs, prazos, financeiro | Pode exigir relações e índices; paginação/ACL. | Um contexto de caso permite abrir e localizar cada objeto relacionado; métricas de auditoria. |
| P1.3 Atendimento + contratação | Não há primeiro atendimento, contrato/procuração/aceite. Construir fluxos ligados ao cadastro do cliente e ao caso. | Alta | Clientes, documentos, templates; sem novo cadastro duplicado | Novas entidades atendimento/contrato/versão e migration. | Converter atendimento em caso e preencher contrato/procuração com dados da fonte do cliente. |
| P1.4 Petições e revisão | Chat/documento genérico não é peça. Criar editor/modelos, rascunho, múltiplas peças/versões, anexos e aprovação. | Alta | Caso, documentos, IA, Word/PDF, usuário responsável | Novas entidades peça/versão/revisão; storage. | Várias peças por caso e versões; histórico imutável, aprovação humana e exportação verificável. |
| P1.5 Protocolo manual auditável | Não há registro de protocolo. Criar registro manual de número/órgão/data/sistema/recibo; sem alegar peticionamento integrado. | Média | Caso, documentos, acompanhamento, UI de conversão | Campos/tabela protocolo; migração. | Recibo anexado, timestamps, usuário e dados CNJ; UI distingue manual de integração eletrônica. |
| P1.6 Vincular agenda e intimações | Hoje intimações são CRUD e prazos manuais; audiências enviam processId vazio. Corrigir ligações e gerar tarefas por decisão humana. | Média/alta | `svc-processos`, `svc-prazos`, activities, audiências/intimações | Relações processuais/migration; notificação por canal opt-in. | Intimação ligada ao processo, prazo sugerido com fonte/ciência/regra e aprovação antes de salvar. |

## P2 — Evolução operacional e automação

| Item | Problema / solução / valor | Complexidade | Dependências | Banco / riscos | Critérios de aceite |
|---|---|---:|---|---|---|
| P2.1 Kanban interno | `Processo.status` só cobre ativo/arquivado/encerrado; Activities é quadro desconectado. Criar estágios internos e aging separado da fase oficial. | Média | Hub caso, atividades, filtros | Estado interno e histórico; não sobrescrever fase oficial. | Drag/mudança grava auditoria; indicadores lead/cycle time e filtros por equipe/prazo. |
| P2.2 Integração Escavador/monitoramento | Acompanhamento não vinculado a processo e custo não uniforme. Ligar registro, versionar snapshots, mapear movimentos e crédito. | Média/alta | `svc-processos`, `svc-integracoes`, KeaCredits, notificações | Vínculo process id, cursor/histórico; risco fornecedor/custo e limite. | Aviso de preço/crédito, idempotência, retries controlados, histórico de origem e atualização manual/automática. |
| P2.3 Captura DJe e alertas | “Atualizar” não varre publicação. Integrar feed/fornecedor autorizado com deduplicação e triagem. | Alta | Integrações, Intimações, Prazos, notificação | Publicação externa e cursor; risco falsos positivos e prazos. | Publicação citada com fonte, advogado confirma ciência e aprova prazo calculado. |
| P2.4 IA contextual segura | Chat/documentos sem caso e roteiro fixo. Copiloto por caso com fontes, política/custo, logs redigidos e revisão. | Alta | AI Hub, análise docs, storage, KeaCredits | Persistir referência/modelo/aprovação; risco alucinação/injeção. | Nenhuma peça publica sem humano; citações rastreáveis e dados não vazam entre tenants. |
| P2.5 Financeiro e cumprimento | Honorário/cobrança sem despesas, conciliação ou valores judiciais. Separar livro do escritório de cálculo judicial. | Alta | Financeiro, Cobranças, caso, Asaas | Novos lançamentos/cálculos parametrizados; risco financeiro/legal. | Relatórios conciliados, critérios/indexadores datados e saldo judicial distinto de honorário. |

## P3 — Estratégico

| Item | Problema / valor | Complexidade | Dependências | Risco / critérios de aceite |
|---|---|---:|---|---|
| P3.1 Peticionamento eletrônico | Integração oficial PJe/eproc/e-SAJ/Projudi/SEI pode reduzir entrada manual. | Alta | Acordo/credenciais/certificados e API oficial por tribunal | Não automatizar sem autorização; validar homologação, recibo e protocolo oficial em sandbox por sistema. |
| P3.2 Jornadas configuráveis | Áreas/procedimentos diferem. Template de workflow interno por classe, área e órgão. | Alta | Motor de workflow, casos, prazos | Regras são configuráveis/versionadas, guardam responsável e não substituem status judicial. |
| P3.3 Analytics de carteira | Lead/cycle time, aging, capacidade, resultado e rentabilidade. | Média/alta | Eventos auditáveis, dados consistentes | Acesso por role/tenant, indicadores definidos e reconciliados com fonte operacional. |

## Sequenciamento recomendado

1. Fazer P0.1–P0.4 e obter aceite de segurança/arquitetura.
2. Definir domínio e migração de CasoInterno e relações canônicas (P1.1/P1.2).
3. Implementar atendimento/contratação e petições/revisão antes de automações de protocolo.
4. Integrar protocolo manual e agenda com confirmação humana.
5. Só então escalar monitoramento, DJe, IA contextual e integrações judiciais.
