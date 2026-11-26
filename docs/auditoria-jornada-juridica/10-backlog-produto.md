# Backlog de produto derivado da auditoria

Prioridades: P0 bloqueia confiabilidade/confidencialidade; P1 completa o núcleo da jornada; P2 agrega automação e escala; P3 integrações/estratégia. Histórias são propostas, não implementação aprovada.

## Épico E0 — Segurança e integridade operacional (P0)

### Feature F0.1 — Documento real e autorizado

**US:** Como advogado, quero enviar e recuperar um arquivo vinculado ao cliente/caso, para usar a evidência sem depender de URL fictícia.

- Given usuário autenticado e arquivo dentro do limite, When enviar o arquivo, Then bytes são gravados em storage privado, metadados/hash são persistidos e a tela confirma apenas após sucesso.
- Given usuário sem vínculo/autorização, When tentar listar/baixar o arquivo por ID, Then a API retorna negativa e não revela existência/URL.
- Dependências: storage existente, autorização por tenant/caso, varredura de arquivo, migração somente se schema necessário.

### Feature F0.2 — Logs e sessão seguros

**US:** Como responsável pelo escritório, quero logs sem conteúdo jurídico e sessão protegida, para reduzir exposição acidental.

- Given criação/alteração de atividade com texto privado, When operação gera logs, Then payload e resposta não aparecem em console/stdout.
- Given token expirado/revogado, When requisição chega à API, Then sessão é encerrada e acesso negado.
- Dependências: auth, gateway, logger, CSP e decisão de sessão/cookie.

### Feature F0.3 — Matriz de autorização

**US:** Como cliente, quero acessar somente processos atribuídos ao meu cadastro verificado, para manter sigilo de outros clientes.

- Given vínculo explícito usuário-cliente no mesmo tenant, When consultar processo atribuído, Then só dados autorizados são retornados.
- Given outro cliente/tenant ou vínculo removido, When reutilizar ID, Then receber 403/404 sem exposição de conteúdo.
- Dependências: decisão de identidade cliente e possível migration; casos de teste para admin/escritório/advogado/jurídico/cliente.

## Épico E1 — Caso e jornada inicial (P1)

### Feature F1.1 — Criar caso sem CNJ

**US:** Como advogado, quero abrir um caso interno para um cliente antes do protocolo, para iniciar análise e reunir documentos.

- Given cliente existente, When criar caso sem número, Then caso persiste como “em preparação” com tenant/responsável e ID interno.
- Given caso preparado e protocolo concluído, When registrar os dados oficiais, Then o número CNJ é associado sem apagar ID, fatos, documentos ou histórico internos.
- Dependências: domínio CasoInterno, migração, status interno separado de fase oficial, hub.

### Feature F1.2 — Registrar atendimento e converter

**US:** Como advogado, quero registrar o atendimento relacionado ao cliente, para preservar relato e próximos passos sem duplicar cadastro.

- Given cliente da fonte CRM, When salvar atendimento com data, responsável, relato, objetivo e status, Then o histórico fica acessível somente à equipe autorizada.
- Given atendimento revisado, When selecionar “Criar caso”, Then cliente, relato e documentos autorizados são reaproveitados sem novo cadastro.
- Dependências: CRM, calendário, documentos e caso.

### Feature F1.3 — Contrato e representação

**US:** Como advogado, quero gerar contrato/procuração a partir dos dados do cliente e escritório, para reduzir preenchimento repetido.

- Given template ativo e dados mínimos, When gerar documento, Then campos preenchidos são pré-visualizados, editáveis e vinculados à versão.
- Given documento pendente de aceite, When advogado não aprovou/cliente não assinou, Then status não aparece como contratado/assinado.
- Dependências: templates, versionamento, assinatura eletrônica futura.

## Épico E2 — Preparação e peças (P1)

### Feature F2.1 — Dossiê jurídico estruturado

**US:** Como advogado, quero organizar fatos, cronologia, competência, classe, fundamentos, pedidos, provas e valor da causa no caso, para revisar completude antes da peça.

- Given caso interno, When registrar cada seção, Then dados ficam estruturados e versionados com autor/data.
- Given campos obrigatórios conforme procedimento configurado ausentes, When solicitar checklist, Then o sistema aponta pendências sem afirmar aconselhamento jurídico definitivo.
- Dependências: schema de caso, templates configuráveis, revisão por advogado.

### Feature F2.2 — Petições e versões

**US:** Como advogado, quero criar várias peças por caso e manter versões, para acompanhar elaboração, revisão e aprovação.

- Given caso e modelo/tipo de peça, When criar rascunho, Then peça referencia cliente/processo, autor e versão.
- Given revisão solicitada, When aprovador comentar/aprovar, Then trilha guarda decisões e somente versão aprovada pode ser marcada pronta para protocolo.
- Given edição posterior, When salvar, Then nova versão é criada e a aprovada anterior permanece recuperável.
- Dependências: editor, storage, DOCX/PDF, ACL e auditoria.

### Feature F2.3 — Checklist e exportação

**US:** Como advogado, quero conferir partes, documentos, requisitos e anexos antes do protocolo, para reduzir falhas formais.

- Given procedimento selecionado, When checklist é calculado, Then regras aplicáveis mostram fonte/versão e itens que exigem confirmação humana.
- Given peça aprovada, When exportar DOCX/PDF, Then arquivo corresponde à versão exibida e registra hash/data; exportação não afirma protocolo.

## Épico E3 — Protocolo e trabalho processual (P1/P2)

### Feature F3.1 — Registro manual de protocolo

**US:** Como advogado, quero registrar protocolo e distribuição realizados fora da Kealex, para manter recibo e identificadores na ficha do caso.

- Given peça aprovada, When registrar protocolo manual, Then capturar data/hora, sistema, tribunal, órgão, número, usuário e comprovante.
- Given registro sem comprovante, When salvar, Then fica explicitamente marcado como informado manualmente e não como integração oficial.

### Feature F3.2 — Agenda ligada a processos

**US:** Como advogado, quero vincular tarefa, prazo, audiência e intimação ao caso e à peça, para trabalhar numa linha do tempo única.

- Given item processual existente, When criar atividade/audiência/prazo, Then relação está explícita e visível no hub.
- Given publicação consultada, When usuário confirma ciência, Then sugestão de prazo usa regra/configuração verificável, calendário e fonte, com aprovação do advogado.
- Dependências: `svc-prazos`, activities, DJe autorizado e notificações.

### Feature F3.3 — Fases, recursos e execução

**US:** Como advogado, quero registrar decisões, recursos e obrigações de cumprimento em múltiplas instâncias, para preservar histórico após sentença.

- Given movimento/decisão documentada, When classificar como sentença/recurso/cumprimento, Then evento mantém origem, data, instância e responsável.
- Given recurso/cumprimento criado, When vincular prazos/peças/valores, Then não altera retroativamente andamento oficial e separa valor judicial de honorários.

## Épico E4 — Integrações e IA contextual (P2/P3)

### Feature F4.1 — Acompanhamento com custo e sincronização

**US:** Como advogado, quero associar acompanhamento externo ao meu caso e ver fonte, atualização e custo, para decidir quando consultar.

- Given consulta tarifada, When confirmar consulta, Then sistema mostra custo/créditos, registra consumo e grava snapshot/histórico da fonte.
- Given nova movimentação, When provedor retorna dados, Then sistema deduplica e sugere ação sem definir prazo automaticamente.

### Feature F4.2 — Copiloto contextual

**US:** Como advogado, quero pedir resumo/rascunho com contexto autorizado do caso, para acelerar trabalho mantendo revisão profissional.

- Given caso e documentos selecionados, When enviar prompt, Then provedor/modelo/custo/fontes ficam auditáveis e tenant isolado.
- Given conteúdo com instruções hostis, When analisar, Then conteúdo é tratado como dado não confiável e não dispara ferramentas ou ações.
- Given saída gerada, When exportar/protocolar, Then revisão e aprovação humanas permanecem obrigatórias.

## Épico E5 — Governança de carteira (P2/P3)

### Feature F5.1 — Kanban interno

**US:** Como gestor de escritório, quero visualizar casos por etapa interna e tempo parado, para organizar capacidade sem alterar fase oficial.

- Given caso muda de etapa de trabalho, When salvar, Then atualização registra ator/data e preserva o status judicial separado.
- Given filtros por advogado, cliente, área, prazo e prioridade, When aplicados, Then indicadores e paginação respeitam tenant e role.

### Feature F5.2 — Financeiro e relatório final

**US:** Como advogado, quero separar honorários/despesas do escritório e valores judiciais, para consolidar o caso corretamente.

- Given encerramento, When relatório final é solicitado, Then inclui cronologia, decisões, obrigações, pagamentos, honorários e pendências com fontes e revisão.
- Given cálculo de atualização, When apresentado, Then fórmula, índice, período, fonte e versão são reproduzíveis; LLM não decide cálculo definitivo.

## Dependências transversais e definição de pronto

- Toda história exige teste de escopo (outro usuário/tenant), autorização e persistência.
- Cada endpoint novo entra no mapa do gateway e contrato versionado; API/UI usam mesma fonte do dado.
- Mudança de banco requer migration versionada e plano para dados existentes; não usar somente `create_all()`.
- Evidenciar erros, loading, vazio, retry, idempotência e auditoria; nenhuma mensagem pode prometer protocolo, assinatura, upload ou IA se não ocorreu.
- Revisão de advogado antes de considerar checklist/prazo/conteúdo jurídico concluído.
