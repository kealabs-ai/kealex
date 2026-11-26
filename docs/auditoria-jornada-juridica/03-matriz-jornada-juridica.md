# Matriz de cobertura da jornada jurídica

## Escala

Maturidade de 0 a 5 conforme o documento de auditoria. Os níveis abaixo são **estimativas por evidência estática**. “Implementado” significa que o fluxo de código/endpoint existe; nenhuma linha implica validação de operação em produção. Estado de teste “não executado” significa que não há evidência E2E reproduzível para aquele fluxo.

| Jornada / funcionalidade | Frontend | Backend | Banco | Integração | Testes | Maturidade | Pendências principais |
|---|---|---|---|---|---|---:|---|
| 1. Cadastro e busca de cliente | Implementado | Implementado | Implementado (`clientes`) | Parcial | Não executado | 3 | Histórico, pastas documentais e visão unificada de relacionamentos. |
| 2. Atendimento inicial | Não implementado | Não implementado | Não implementado | Sem integração | Não executado | 0 | Registro, agenda, documentos, responsável, conversão em caso. |
| 3. Contrato/procuração/aceite | Não implementado | Não implementado | Não implementado | Sem integração | Não executado | 0 | Modelos preenchidos de dados, assinatura e versionamento. |
| 4. Preparação de caso interno sem CNJ | Parcial (formulário de processo) | Não comportado pelo modelo atual | Não comportado (`numero NOT NULL`) | Sem integração | Não executado | 1 | Entidade Caso/ProcessoInterno e migração de fluxo. |
| 5. Partes/clientes do processo | Parcial | Implementado | Implementado (`processo_clientes`, `processo_partes`) | Parcial | Não executado | 2 | Validar autor/réu/polos e edição/exclusão de parte persistida. |
| 6. Dados jurídicos, fatos, teses, pedidos, valor causa | Parcial (campos básicos) | Parcial | Parcial | Sem integração | Não executado | 1 | Modelo estruturado e checklist específico por área/procedimento. |
| 7. Provas e documentos anexos | Interface existe | CRUD de metadados; storage separado | Parcial | Sem integração no upload da tela | Não executado | 1 | Upload real, autorização de download, versões, vínculo cliente/caso/peça. |
| 8. Análise assistida por IA | Implementado para chat/documentos | Implementado em módulos separados | Implementado para conversas/arquivos | Parcial (Drive; sem contexto do caso) | Não executado | 2 | Referências, validação, proteção de prompt injection e vínculo à jornada. |
| 9. Petição inicial e outras peças | Não implementado como módulo | Não implementado como entidade | Não implementado | Parcial (chat/doc genérico) | Não executado | 1 | Editor, tipos, dados jurídicos, rascunhos, revisão, múltiplas versões. |
| 10. Revisão e aprovação | Não implementado | Não implementado | Não implementado | Sem integração | Não executado | 0 | Workflow humano, checklist, trilha e versão aprovada. |
| 11. Exportação de peça | Word genérico existe | Não há workflow de peça | Sem registro de versão/artefato | Parcial | Não executado | 1 | DOCX/PDF da petição, anexos ordenados e cópia final imutável. |
| 12. Protocolo/distribuição | Não implementado | Não implementado | Não implementado | Sem integração | Não executado | 0 | Registro manual com recibos; peticionamento eletrônico é escopo distinto. |
| 13. Acompanhamento processual externo | Implementado | Implementado | Implementado (tabelas próprias) | Escavador; DataJud independente | Não executado (tarifado) | 2 | Vincular a processo interno, custos/créditos, fonte/data por movimento e alertas. |
| 14. Intimações/DJE | Implementado como caixa CRUD | CRUD central | `intimacoes` | Sem coletor DJe comprovado | Não executado | 1 | Ingestão externa, deduplicação, ciência e ligação com prazo. |
| 15. Tarefas/agenda e prazos | Implementado | Implementado | `activities`, `prazos` | Parcial | Não executado | 2 | Ligação atividade-processo/peça, notificações e motor auditável de prazo. |
| 16. Audiências e instrução | Implementado | CRUD | `audiencias` | Parcial | Não executado | 1 | UI envia `processId` vazio; testemunhas, perícias, documentos e roteiro real. |
| 17. Sentença/recursos | Não implementado | Não implementado | Não implementado como entidade | Sem integração | Não executado | 0 | Eventos/recursos multi-instância, prazos e peças relacionados. |
| 18. Cumprimento/execução | Parcial (financeiro/cobrança genéricos) | Parcial | Sem entidade judicial específica | Sem integração | Não executado | 1 | Obrigações, memória de cálculo, índice/fonte, pagamentos e saldo judicial. |
| 19. Encerramento e relatório final | Parcial (`ativo/arquivado/encerrado`) | Status simples | `processos` | Sem integração | Não executado | 1 | Resultado, trânsito, obrigações, honorários, pendências e relatório cliente. |
| 20. Financeiro do escritório | Implementado em parte | Honorários/cobranças | `honorarios`, `cobrancas` | Asaas em cobranças | Não executado | 2 | Despesas, reembolsos, conciliação, rentabilidade e separação financeira judicial. |
| 21. Segurança/isolamento | Roles e guards | JWT/tenant em vários serviços | Tenant e alguns vínculos | Parcial/heterogênea | Não executado (segurança) | 2 | Auditoria cross-role/tenant, tokens, logs, anexos, backups e políticas. |

## Conclusões por etapa

Etapas com fluxo parcialmente utilizável hoje: cliente; processo judicial já numerado; consulta externa; registro manual de prazos/atividades; honorários/cobranças; análise avulsa de documentos. Atendimento, representação, petições, revisão, protocolo, instrução, recursos e encerramento permanecem incompletos ou inexistentes.

## Indicadores

Para uma contagem reproduzível, o denominador é **21 capacidades** listadas na tabela (não número de arquivos/rotas):

- Capacidades com pelo menos um fluxo persistido: **16/21 (76,2%)**. Inclui módulos parciais e não indica jornada completa.
- Capacidades maduras/integradas no fluxo jurídico ponta a ponta: **0/21** por ausência de execução E2E e de continuidade de dados entre as etapas.
- Capacidades sem implementação de domínio: **5/21 (23,8%)** (atendimento, contratação, revisão, protocolo e eventos de sentença/recurso como domínio próprio; fases posteriores estão detalhadas nas linhas correspondentes).
- Capacidades não avaliadas em ambiente de produção/integrações reais: **21/21**. Não houve banco, token de usuário ou consultas externas.

Esses indicadores medem o mapeamento do código e a lacuna de fluxo, não disponibilidade comercial nem percentual de qualidade.
