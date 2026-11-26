# Roteiro de implementação — Jornada Jurídica Kealex

Este roteiro converte as prioridades da auditoria em uma ordem de execução. É um plano de trabalho, não uma estimativa contratual. A duração de cada fase deve ser definida após decomposição técnica e disponibilidade da equipe. As fases têm portões de aceite: não avançar para operação com dados jurídicos reais sem cumprir os critérios anteriores.

## Objetivo do programa

Permitir que um escritório comece pelo cliente e atendimento, prepare um caso sem CNJ, gere e revise documentos jurídicos, registre o protocolo, acompanhe o processo, organize prazos e atividades, controle resultados financeiros e encerre o caso com histórico completo — mantendo status internos separados dos dados oficiais do tribunal.

## Regras de execução

1. **Reutilizar o cadastro `clientes`** como fonte cadastral; não criar um segundo CRM.
2. **Definir dono e contrato de cada rota** antes de mudar serviço/gateway. A implantação atual combina API central, microserviços e rotas de fallback.
3. **Versionar todas as migrations.** O banco é compartilhado e `create_all()` não migra tabelas existentes.
4. **Construir fatias verticais**: tela, API, banco, autorização, auditoria e testes juntos.
5. **Manter revisão profissional** para conteúdo jurídico, prazos, documentos e qualquer protocolo.
6. **Separar fato oficial de trabalho interno**: estágio do escritório não altera andamento do tribunal.
7. **Não chamar fornecedores tarifados em testes comuns.** Usar mocks; sandbox de pagamentos/consultas é uma etapa separada com autorização.
8. **Não considerar API ou tela como concluída** até o fluxo persistido, falhas e permissões passarem pelos critérios de aceite.

## Fase 0 — Preparação, arquitetura e ambientes

**Objetivo:** definir contratos e ambientes de validação antes de alterar domínios ou banco.

**Atividades**

- Nomear responsável de produto, arquiteto, segurança/privacidade e advogado de referência.
- Mapear rotas ativas por Compose/gateway: caminho, método, serviço real, autenticação, schema e consumidor frontend.
- Definir um contrato canônico para clientes, processos, documentos, prazos, cobranças e atividades; marcar rotas legadas e plano de compatibilidade.
- Preparar ambiente isolado com banco descartável, storage de teste e identidade fictícia. Criar mocks para Asaas, Escavador, DataJud, Google Drive e FiscalAPI.
- Definir catálogo de eventos de auditoria e matriz de acesso por role/tenant, incluindo a associação entre login de cliente e registro `clientes`.
- Fechar desenho inicial do domínio: cliente existente → caso interno → processo judicial/procedimentos relacionados.

**Entregáveis**: mapa de APIs/gateway; diagrama de ownership de domínio; matriz de autorização; ambiente de teste; plano de migrations/backfill; decisões de segurança registradas.

**Gate 0**: nenhum endpoint ambíguo sem dono; ambiente de teste não pode apontar para banco ou fornecedor de produção; advogado valida vocabulário e estados do domínio.

## Fase 1 — Segurança e integridade documental (P0)

**Objetivo:** eliminar falsa confirmação de operações, exposição de conteúdo e dúvidas de autorização.

### 1.1 Upload e recuperação real de documentos

- Integrar `DocumentosPage` ao storage privado existente; remover a URL fictícia.
- Persistir metadados e relacionar um mesmo arquivo a cliente, caso, processo e peça sem duplicar bytes.
- Implementar validação de tamanho/MIME/assinatura, nome seguro, ACL por tenant/caso, download autenticado, versionamento/hash e auditoria.
- Definir migração/estado para metadados legados que apontam a URLs fictícias: marcar como “arquivo não disponível”, sem simular conteúdo.

### 1.2 Proteção de logs e sessões

- Remover payload/resposta de `console.debug` em atividades e corpos no middleware de serviço; manter telemetria técnica redigida.
- Revisar CSP, tratamento de XSS, armazenamento/expiração/revogação de sessão e política de cookies.
- Garantir que PAN/CVV, JWT, API keys, texto de documentos e dados pessoais nunca apareçam em log.

### 1.3 Autorização e contratos de rota

- Definir vínculo explícito e verificável entre usuário cliente e cadastro de cliente.
- Testar acesso positivo/negativo entre usuários, clientes, advogados, escritórios e tenants.
- Ajustar Nginx/Compose/serviços e clientes frontend para que cada domínio tenha um endpoint proprietário.

**Entregáveis**: upload/download persistente; logs limpos; sessão revisada; matriz de acesso exercitada; contratos de rota cobertos por testes.

**Gate 1**: nenhum teste permite leitura/escrita entre tenants; falha de upload nunca salva registro de sucesso; inspeção de logs confirma ausência de dados sensíveis.

## Fase 2 — Caso jurídico e página central (base P1)

**Objetivo:** criar o contêiner do trabalho jurídico antes de protocolo, sem quebrar processos existentes.

### Decisão de domínio recomendada

- Criar entidade `CasoJuridico` com ID interno, tenant, responsável, cliente principal, assunto/área, prioridade e estágio de trabalho.
- Manter a entidade `Processo` atual como registro judicial numerado durante a migração. Relacionar um caso a um ou mais processos oficiais/procedimentos, permitindo instâncias e recursos sem substituir o número CNJ.
- Ligar documentos, partes, tarefas, audiências, peças e histórico ao caso e, quando necessário, ao processo oficial específico.
- Preservar IDs e endpoints antigos com adaptação compatível até os consumidores migrarem.
- Criar migration versionada com backfill: cada processo legado vira ou recebe um caso interno relacionado; validar contagens, ownership e rollback antes do deploy.

**Atividades**

- Fazer design review com advogado e banco para cardinalidades, exclusão, múltiplos clientes e papéis.
- Construir página de detalhes do caso e visão geral com abas/seções.
- Exibir separadamente: etapa interna do escritório, situação oficial, origem dos dados e última atualização.
- Vincular o processo acompanhado externo ao processo oficial/caso sem perder o histórico atual.

**Entregáveis**: migration/backfill, APIs de casos, hub, navegação contextual e lista de processos/casos compatível.

**Gate 2**: criar caso sem CNJ; converter para processo numerado mantendo ID e histórico; usuários de outro tenant não acessam o caso; processos legados continuam abrindo.

## Fase 3 — Atendimento e contratação (P1)

**Objetivo:** registrar a entrada do cliente e reaproveitar seus dados até a abertura do caso.

**Atividades**

- Criar atendimento ligado ao cliente existente; contemplar data, responsável, área sugerida, relato, objetivo, documentos, observações internas, status, próxima ação e retorno.
- Permitir criar cliente pelo modal já existente e retornar ao atendimento sem perder o formulário.
- Criar histórico de atendimentos e ação explícita “converter em caso”, reaproveitando cliente, relato e arquivos autorizados.
- Criar templates versionados para contrato de honorários e procuração, preenchidos com dados do cliente/escritório, pré-visualização e aprovação/aceite.
- Manter status distintos para rascunho, aprovado, enviado e assinado. Não inferir assinatura por exportar arquivo.

**Entregáveis**: atendimento persistido, histórico do cliente, conversão em caso, templates contratuais e vínculo documental.

**Gate 3**: advogado localiza cliente existente, registra atendimento, anexa documento real, converte em caso; campos cadastrais não são copiados manualmente; documento não aparece como assinado sem evidência.

## Fase 4 — Preparação jurídica e checklist (P1)

**Objetivo:** estruturar os dados do caso antes de redigir a peça.

**Atividades**

- Modelar área, natureza, classe, assuntos, competência, objeto, valor da causa, fatos/cronologia, fundamentos, pedidos, provas, justiça gratuita, tutela e conciliação.
- Formalizar partes e papéis processuais; permitir edição e remoção autorizada com histórico.
- Criar checklists parametrizados por área/procedimento/órgão, com fonte e versão. Regras CPC se aplicam conforme tipo de caso, não globalmente.
- Criar validações determinísticas para campos/documentos obrigatórios; separar sugestão de IA de regra de negócio.
- Expor pendências, responsável, prazo interno e bloqueios para revisão.

**Entregáveis**: dossiê estruturado, tela de preparação, checklist versionado e validação de completude.

**Gate 4**: preparar ação fictícia sem CNJ, detectar pendências configuradas, revisar fatos/pedidos/provas e deixar o advogado decidir; nenhuma regra jurídica não revisada é tratada como definitiva.

## Fase 5 — Petições, revisão e exportação (P1)

**Objetivo:** produzir peças vinculadas ao caso com controle de alterações e revisão humana.

**Atividades**

- Criar entidades de peça, tipo, versão, status, autor, aprovador e eventos de revisão; permitir múltiplas peças por caso.
- Construir editor de rascunho e modelos com dados do cliente, escritório, partes e caso; anexar provas já armazenadas.
- Implementar estados rascunho → em revisão → ajustes solicitados → aprovada → exportada, preservando versões anteriores.
- Gerar DOCX/PDF da versão aprovada, armazenar hash/versão e oferecer preview e download.
- Integrar IA como assistência opcional, incluindo fontes verificáveis, identificação de trechos inferidos e confirmação do advogado.

**Entregáveis**: petição inicial e peças intermediárias, múltiplas versões, comentários, aprovação e exportação.

**Gate 5**: duas peças diferentes no mesmo caso; nova versão não sobrescreve a anterior; só peça aprovada pode ser marcada pronta; DOCX/PDF correspondem ao preview; arquivo não é apresentado como protocolado.

## Fase 6 — Protocolo e distribuição (P1)

**Objetivo:** registrar o que aconteceu fora da Kealex e ligar o processo oficial ao caso.

**Atividades**

- Implementar registro manual auditável: sistema, tribunal, órgão/comarca/vara, instância, número CNJ, protocolo, data/hora, advogado e recibos de protocolo/distribuição/custas.
- Converter ou relacionar a preparação a processo judicial oficial sem mudar o ID interno do caso.
- Diferenciar visualmente registro manual de protocolo eletrônico integrado.
- Deixar integração automática PJe/eproc/e-SAJ/Projudi/SEI fora do primeiro release; iniciar estudo contratual/técnico por sistema após estabilizar fluxo manual.

**Entregáveis**: registro manual, anexos de recibo, conversão e trilha de auditoria.

**Gate 6**: operador registra protocolo fictício de teste, anexa recibo e confere dados; auditoria identifica responsável/data; interface não afirma peticionamento automático.

## Fase 7 — Acompanhamento, prazos, agenda e trabalho interno (P1/P2)

**Objetivo:** integrar eventos externos e tarefas sem misturar regras judiciais com operação do escritório.

**Atividades**

- Ligar `processos-acompanhados` a processo/caso; manter snapshots, origem, horário e histórico.
- Antes de chamada tarifada, mostrar custo/créditos e exigir confirmação conforme política; implementar idempotência, débito, estorno e orçamento.
- Vincular atividades, intimações e audiências ao caso/processo. Corrigir criação de audiência para usar um processo/caso escolhido, não título livre isolado.
- Substituir “Atualizar” de intimações por rótulo coerente até existir captura; implementar DJe apenas com fornecedor/fonte autorizados.
- Implementar sugestões de prazo com regra auditável, data de ciência, calendário/feriados, fonte e aprovação humana. Não usar LLM como calculadora de prazo.
- Criar estágios Kanban internos, histórico e aging sem alterar o estado oficial do tribunal.

**Entregáveis**: timeline do caso, agenda vinculada, notificação opt-in, custo rastreado e Kanban interno.

**Gate 7**: nova movimentação mockada gera histórico e sugestão; advogado confirma antes de criar prazo; evento não duplica; mudança de Kanban não modifica movimento/status judicial.

## Fase 8 — Sentença, recursos, cumprimento e financeiro (P2)

**Objetivo:** cobrir fases posteriores e permitir encerramento verificável.

**Atividades**

- Modelar decisões/sentenças, trânsito quando aplicável, recursos por instância, contrarrazões e acórdãos como eventos/documentos relacionados.
- Criar cumprimento de obrigações de pagar/fazer, pagamentos, acordos, parcelamentos, comprovantes e saldo.
- Separar contas do escritório (honorários, despesas, reembolsos) de valores judiciais devidos pelo processo.
- Implementar cálculos com regras parametrizadas, índice, fonte, período e histórico de versão; exigir validação do advogado/financeiro.
- Construir encerramento com resultado, pendências resolvidas, honorários, tarefas, documentos, relatório final e possibilidade controlada de reabertura.

**Entregáveis**: histórico recursal, execução/cumprimento, consolidação financeira e relatório final para revisão.

**Gate 8**: processo de teste com sentença e obrigação; cálculo reproduzível; valores de honorários não se confundem com valores judiciais; relatório tem fontes e aprovação antes de compartilhar.

## Fase 9 — IA contextual e automações avançadas (P2/P3)

**Objetivo:** acrescentar automação após existir dossiê confiável e ACL.

**Atividades**

- Associar análise documental/Notebook a cliente e caso, respeitando autorização e seleção de arquivos.
- Corrigir o roteiro de audiência estático e rotulagem enganosa; então criar geração contextual opt-in, com fonte e revisão.
- Adicionar resumo de fatos/movimentos, identificação de lacunas e propostas de perguntas/ações.
- Implementar mitigação/testes de prompt injection, política de retenção, proveniência, métricas de qualidade e custo.
- Planejar integração oficial de peticionamento separadamente por tribunal, autorização e contrato, começando em sandbox homologado.

**Gate 9**: falha de provedor não interrompe o fluxo manual; saída de IA nunca é publicada sem aprovação; teste adversarial não executa instruções embutidas em documento; custos e fontes são auditáveis.

## Plano transversal de qualidade

Em cada fase, antes de concluir:

1. **Contrato API:** método/caminho/payload/resposta/status e roteamento no gateway.
2. **Persistência:** migration, compatibilidade com dados antigos, backfill, rollback e cópia de segurança quando necessário.
3. **Autorização:** testes positivos e negativos por role, usuário e tenant.
4. **Integração:** mocks em CI; sandbox separado para pagamentos/consulta externa.
5. **UX:** carregando, vazio, erro, retry, confirmação, foco/teclado/mobile e linguagem que não promete operação não realizada.
6. **Auditoria:** ator, tenant, horário, fonte, versão e resultado; sem conteúdo sensível em logs.
7. **Operação:** métricas, alertas, health check, backup/restore, feature flag e plano de rollback.
8. **Aceite jurídico:** revisão de advogado para modelos, checklist, prazo, cálculos e dados apresentados como oficiais.

## Sequência de releases sugerida

| Release | Inclui | Condição para iniciar piloto |
|---|---|---|
| R0 — Base segura | Fase 0 e Fase 1 | Isolamento/documentos/logs validados em ambiente teste. |
| R1 — Caso e intake | Fases 2 e 3 | Criar atendimento e caso sem CNJ, usando cadastro existente. |
| R2 — Preparação e peças | Fases 4 e 5 | Dossiê, checklist, versão e aprovação profissional funcionando. |
| R3 — Protocolo e rotina | Fases 6 e 7 | Registro manual claro, agenda vinculada e atualização rastreável. |
| R4 — Resultado e encerramento | Fase 8 | Recursos, cumprimento, contas separadas e relatório revisável. |
| R5 — Automação | Fase 9 | Só após dados/ACL/fluxos consolidados e custo aprovado. |

## Primeiro ciclo de trabalho recomendado

1. Revisar este roteiro com produto, engenharia, segurança e advogado de referência.
2. Executar Fase 0 e transformar decisões de arquitetura em ADRs e plano de migration.
3. Dividir Fase 1 em histórias pequenas com owner por frontend, backend, gateway e storage.
4. Preparar banco/storage/usuários de teste fictícios; automatizar a jornada de autorização antes do piloto.
5. Demonstrar o primeiro fluxo vertical: upload verdadeiro → salvar metadados → listar no processo → baixar autorizado → auditar.
6. Passar o Gate 1; então iniciar o domínio `CasoJuridico` e o backfill.

## Fora do primeiro piloto

- Peticionamento automático em sistemas judiciais sem API/contrato/autorização homologados.
- Cálculo definitivo de prazos por LLM.
- Assinatura eletrônica declarada sem provedor/recibo válido.
- Uso de URL pública ou link permanente para documentos sigilosos.
- Promessa de monitoramento DJe/atualização automática sem fonte e job operacionais.

## Indicadores de progresso

- Percentual de rotas de domínio com contrato e serviço proprietário documentados.
- Sucesso dos testes de isolamento por role/tenant e de upload/download autorizado.
- Casos que percorrem intake → preparação → revisão → protocolo manual sem reentrada de dados.
- Tempo para abrir caso, preparar checklist e revisar peça; retrabalho de preenchimento.
- Percentual de eventos externos com origem, hora, histórico e custo identificáveis.
- Falhas de upload, duplicidade de movimentos, prazos sem confirmação e incidentes de acesso.
- Taxa de aprovação/retrabalho das saídas de IA e gasto por fluxo, sem tratar adoção de IA como objetivo isolado.
