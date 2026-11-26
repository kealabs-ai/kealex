# Análise de inteligência artificial

## Implementação observada

- `src/pages/IAPage.tsx` fornece chat geral e prompts sugeridos; backend central tem `ai_routes.py`, configuração de provedores, modelo ativo, chaves por usuário e endpoints de chat.
- `src/pages/MeusAgentsPage.tsx`, `AdminPage.tsx`/tabs e `svc-configuracoes`/rotas centrais administram agentes, chaves, políticas e modelos.
- `src/pages/AnaliseDocumentosPage.tsx` e `svc-documentos/app/api/routes/document_analysis_routes.py` persistem conversas, mensagens, documentos e conteúdo extraído; oferecem perguntas sobre os arquivos e integração Google Drive.
- Modelo inclui `ia_uso_tokens`, políticas por plano/usuário e tabelas de chaves cifradas; `user_api_keys.api_key_encrypted` e credenciais Google cifradas aparecem no schema.
- `src/pages/AudienciasPage.tsx:54` chama roteiro “Gerado por IA”, mas monta texto literal genérico e o grava após `setTimeout`; não é uma chamada a um modelo.
- A IA do chat geral e a análise documental não recebem automaticamente `processo_id`, fatos, pedidos, prazos ou papéis do caso. Conversas de análise não possuem vínculo de banco com cliente/processo.

## Lacunas de qualidade e confiabilidade

1. **Grounding/citações:** não há mecanismo demonstrado no fluxo geral para validar legislação/jurisprudência atualizada ou marcar referência não verificada. A consulta de legislação em linguagem natural não comprova verificação de fonte.
2. **Contexto jurídico:** análise documental tem contexto dos arquivos da conversa, mas não o dossiê estruturado do caso nem ligação ao cliente/processo.
3. **Revisão humana:** não há workflow de versão, aprovação e assinatura do advogado antes de exportar ou protocolar.
4. **Injeção de prompt em arquivos:** documentos não confiáveis podem conter instruções; não foi localizada evidência suficiente de isolamento explícito entre instruções do sistema e conteúdo documental adversarial. Requer testes dedicados.
5. **Confidencialidade/transmissão:** o envio de dados jurídicos a LLM/Drive deve informar provedor, finalidade, retenção e controles contratuais; não foi feita análise de contratos de fornecedores ou de telemetria de produção.
6. **Custos:** há contagem/políticas de tokens e KeaCredits para alguns serviços, mas não há evidência de reserva, medição e estorno uniformes em toda chamada de IA e de consulta processual.
7. **Disponibilidade:** não foi possível verificar fallback operacional ou fila para indisponibilidade de provedor; o sistema jurídico deve manter CRUD e exportação sem IA.

## Oportunidades por etapa

| Etapa | Apoio útil | Guardrail determinístico/humano |
|---|---|---|
| Atendimento | Resumo, cronologia, perguntas faltantes, classificação sugestiva | Confirmar fatos pelo advogado; distinguir fala do cliente de inferências. |
| Contratação | Preencher modelos com dados cadastrais | Templates versionados e conferência/assinatura humana. |
| Preparação | Organizar fatos, temas, documentos ausentes, teses candidatas | Checklist por área/procedimento; toda citação verificável e editável. |
| Petição | Minuta por seções e revisão de coerência | Regra/validação de campos + aprovação do responsável; sem protocolo autônomo. |
| Movimentação | Resumir/classificar evento e sugerir ação | Movimento com origem/data; cálculo de prazo por motor rule-based validado. |
| Audiência | Roteiro contextual a partir dos autos | Evidenciar fontes e permitir revisão; não gerar afirmações sem suporte. |
| Sentença/recurso | Comparar pedidos e decisão; apontar temas para revisão | Advogado confirma leitura, cabimento e prazo. |
| Encerramento | Cronologia e relatório para cliente | Dados oficiais e financeiros reconciliados, revisão antes do envio. |

## Arquitetura recomendada para IA

- Tratar a IA como ferramenta contextualizada por caso com autorização própria; enviar apenas documentos necessários.
- Separar funções: extração OCR/parsing; regras de completude; busca de fontes oficiais; geração assistida; validação humana.
- Guardar prompt/modelo/provedor, hashes/IDs de fontes, data, usuário, tokens/custo e versão aprovada sem copiar dados sensíveis para logs genéricos.
- Defender contra prompt injection por separação de conteúdo, instruções de não execução, lista de ferramentas permitidas, testes adversariais e sem permissões de escrita por padrão.
- Aplicar orçamento/limites e idempotência por operação; mostrar consumo antes de consulta tarifada e registrar créditos debitados/devolvidos.
- O chat deve degradar de forma clara quando IA falhar; cadastro, busca, agenda, peças existentes e download não podem depender de LLM.

## Prioridade

P0: corrigir o roteiro de audiência para não afirmar que é IA quando é estático; revisar logs e exposição de conteúdo; esclarecer tratamento de documentos em cada provedor.  
P1: associar conversa/documentos a caso com ACL; citação/fontes e trilha de versão/aprovação.  
P2: copiloto por estágio, triagem de pendências e resumos de movimentações.  
P3: avaliação contínua por corpus jurídico autorizado, métricas e experimentos controlados.
