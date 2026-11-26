# Relatório de validação e cenário ponta a ponta

## Método e limitações

O fluxo fictício de ação de cobrança de R$ 15.000,00 foi percorrido **por inspeção estática** em páginas, chamadas API, rotas, modelos e gateway. Nenhum dado foi criado. Não existe ambiente local isolado confirmado com banco de teste, usuário de teste e storage. As consultas a Escavador, DataJud, CND, FiscalAPI, Google Drive e Asaas não foram executadas para evitar consumo, efeitos externos ou uso de credenciais reais.

### Verificações realmente executadas

| Verificação | Resultado |
|---|---|
| Inspeção de frontend/backend, modelos, rotas e configuração de gateway | Concluída; evidências nos demais relatórios. |
| `npm.cmd exec tsc -- --noEmit -p tsconfig.app.json` | Passou (exit code 0), sem gerar arquivos. |
| `npm.cmd run lint` | Falhou: 162 erros e 7 avisos reportados pelo ESLint; erros incluem uso de `any` e regras de hooks React. A execução foi no repositório inteiro, sem baseline anterior para separar débitos preexistentes. |
| `pytest test_public_keys.py test_certificates_unit.py` | Tentativa interrompida antes dos testes: ambiente `.venv` do backend não possui `pytest`. |
| `python test_public_keys.py` | Tentativa interrompida antes dos testes: ambiente `.venv` não possui `fastapi`. |
| Testes de processos existentes | Não executados: scripts fazem HTTP contra `localhost:8000` e podem criar/alterar registros; um requer credenciais, outro usa token placeholder. |
| Build frontend | Não executado nesta auditoria para respeitar a restrição de não alterar artefatos existentes (`dist`). Build recente de outra solicitação não foi tratado como teste desta auditoria. |
| Banco/produção/fornecedores externos | Não avaliados por execução. Nenhum arquivo `.env` foi lido. |

## Cenário de cobrança — 30 passos

“Implementado” abaixo descreve evidência de fluxo no código, não sucesso de execução. “Parcial” indica que há bloco funcional, mas requisito ou integração importante falta. Resultado runtime: **não executado em todos os passos**.

| # | Ação prevista | Resultado encontrado por inspeção | Tela / rota / endpoint / entidade | Resultado |
|---:|---|---|---|---|
| 1 | Localizar cliente | Busca e listagem existem; API consulta `svc-clientes`. | `/clientes`; `/k1/lex/clientes/search`; `clientes` | Parcial (runtime não executado) |
| 2 | Registrar atendimento | Não há rota/tela/entidade de atendimento. | Ausente | Não implementado |
| 3 | Registrar relato | Sem campo/formulário de atendimento. `observacoes` de cliente não substitui relato por atendimento. | Ausente | Não implementado |
| 4 | Vincular documentos | Registro genérico existe, mas upload de arquivo em `DocumentosPage` gera URL fictícia. | `/documentos`; `Documento`; `urlArquivo` | Não seguro/funcional para prova |
| 5 | Gerar contrato de honorários | Não há fluxo/modelo de contrato. | Ausente | Não implementado |
| 6 | Gerar procuração | Qualificação de cliente é montada para uso pontual, mas procuração/exportação vinculada não existe. | `ProcessosPage.tsx`; ausente entidade | Não implementado |
| 7 | Criar processo em preparação | `numero` é obrigatório no formulário e `Processo.numero` é `NOT NULL`. | `/processos`; `Processo` | Bloqueado sem CNJ |
| 8 | Selecionar autor | Vínculo multi-cliente e cliente principal existem; papéis/polos são simplificados e devem ser validados. | Etapa Clientes; `processo_clientes` | Parcial |
| 9 | Cadastrar réu | `ProcessParty` aceita demais partes; fluxo suporta inclusão, mas edição/exclusão de persistidos não está concluída. | Etapa Demais Partes; `processo_partes` | Parcial |
| 10 | Informar dados jurídicos | Há número/título/descrição/vara/tribunal/status/fases; não há área, classe, competência, valor da causa, conciliação etc. | `ProcessosPage`; `Processo` | Parcial insuficiente |
| 11 | Registrar fatos | Não há campos estruturados de fatos/cronologia. | Ausente | Não implementado |
| 12 | Registrar fundamentação | Não há entidade/campo de fundamentos ligados ao caso. Chat IA avulso não persiste como fundamentação do caso. | `/ia`; ausente | Não implementado |
| 13 | Registrar pedidos | Não há entidade ou checklist de pedidos. | Ausente | Não implementado |
| 14 | Definir valor da causa | Processo não contém valor de causa. Acompanhamento pode mostrar valor importado externo, sem modelo preparatório. | `Processo`; `ProcessoAcompanhado` | Não implementado para preparo |
| 15 | Vincular provas | Documentos são vinculados a processo por metadados; bytes não sobem pela tela e não há tipagem de prova. | `/documentos`; `/k1/lex/documentos` | Parcial, upload bloqueador |
| 16 | Analisar pendências com IA | Análise documental e IA existem em telas separadas; não há checklist de completude do caso. | `/analise-documentos`, `/ia` | Parcial e sem contexto integrado |
| 17 | Gerar minuta inicial | Chat permite produzir texto genérico, sem builder de petição/dados do caso/versionamento. | `/ia`; sem entidade Petição | Parcial, não é módulo de peça |
| 18 | Revisar petição | Não há estados de revisão/aprovação ou comentários. | Ausente | Não implementado |
| 19 | Exportar Word | Exportador genérico DOCX existe para texto, sem versão de petição aprovada. | `documentGenerator.ts` | Parcial |
| 20 | Exportar PDF | Fluxo de petição para PDF não evidenciado. | Ausente | Não implementado |
| 21 | Registrar protocolo de teste | Não há campos/ação/recibo de protocolo manual. | Ausente | Não implementado |
| 22 | Vincular CNJ de teste | Processo já requer número e pode ser cadastrado; não existe transformação do caso em processo protocolado. | `/k1/lex/processos`; `processos` | Parcial |
| 23 | Consultar acompanhamento sem cobrança externa | Página está conectada ao Escavador via backend, mas execução proibida nesta auditoria; não há evidência de cobrança/crédito uniforme. | `/acompanhar-processo`; `processos-acompanhados` | Código existe; runtime não avaliado |
| 24 | Registrar movimentação de teste | Movimento pode vir no JSON importado; endpoint explícito de edição manual/importação de movimento não foi identificado. | `ProcessoAcompanhado.dados` | Parcial externo |
| 25 | Criar tarefas e prazos | Prazos CRUD e atividades existem; atividade não tem `process_id`; prazo é manual, sem motor de contagem. | `/prazos`, `/atividades` | Parcial/desconectado |
| 26 | Registrar contestação | Não existe fluxo de peça/manifestação. | Ausente | Não implementado |
| 27 | Registrar sentença | Não há evento/entidade de decisão/sentença. | Ausente | Não implementado |
| 28 | Registrar cumprimento | Financeiro/cobrança genéricos não controlam obrigação judicial, índice, juros ou adimplemento. | `/financeiro`, `/cobranca` | Não implementado como cumprimento |
| 29 | Gerar relatório final | Word genérico pode exportar texto, mas não há relatório consolidado por processo. | `documentGenerator.ts` | Não implementado como fluxo |
| 30 | Encerrar processo | Status `encerrado/arquivado` existe; sem trânsito, resultado, quitação, comunicação e relatório final. | `/processos`; `Processo.status` | Parcial |

### Resultado do cenário

- **30/30 passos** inspecionados estaticamente; **0/30 passos** executados como E2E.
- Há blocos reaproveitáveis no passo 1, 8–10, 15–17, 19, 22–25 e 30, mas não uma jornada completa conectada.
- Não simulamos êxito em protocolo, consulta externa, emissão, pagamento ou conclusão.

## Ambientes e evidências necessárias para próxima rodada

Preparar ambiente isolado com banco descartável, arquivos de teste fictícios, contas/roles dedicadas, mocks de fornecedores e gateway idêntico ao de produção. Criar fixture de cliente, atendimento, caso sem número, processo numerado, movimento e pagamento. Executar E2E somente com fornecedor mock; realizar sandbox separado para pagamentos/integrações após autorização e credenciais sandbox.
