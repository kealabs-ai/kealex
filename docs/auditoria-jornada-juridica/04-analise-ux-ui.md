# Análise de UX/UI

## Estrutura e navegação

A sidebar está organizada em “Escritório”, “Ecossistema”, “Administração/Gestão” e “Inteligência”. A navegação por role reduz itens, e há banner de página, cards, busca/filtros, skeletons, estados vazios e feedback toast. Esse design é uma base coerente, mas organiza o produto por módulos técnicos, não pela jornada do caso. Um advogado precisa alternar entre cliente, processo, prazos, documentos, análise IA, audiência e cobrança sem contexto compartilhado.

O fluxo de processos é um modal com quatro passos: dados, clientes, demais partes e fases/revisão. Ajuda no cadastro de processo existente, mas mistura “processo judicial” com “caso em preparação”: número é obrigatório e os campos centrais de preparação jurídica não existem. O modal não substitui uma página de detalhes contínua nem oferece salvamento progressivo/autosave.

## Atritos observáveis

- `/clientes` não leva a um histórico central de atendimentos, processos, documentos, contratos e financeiro.
- A lista de processos mostra dados resumidos/fases e ações pontuais. Não há página hub com timeline oficial, trabalho interno, peças, documentos, financeiro e histórico.
- A ação de cadastrar processo depende de cliente, número e dados básicos; não há estado “em preparação”, checklist ou bloqueios justificáveis.
- Em edição, os clientes e demais partes carregam por endpoints distintos; falha em chamadas pode impedir preencher a tela. Em código recente o salvamento das partes novas é sequencial, e a exclusão de parte persistida não está exposta no fluxo.
- O acesso “Acompanhar Processo” vive separado da lista `/processos`, não apresenta a ligação com processo interno e pode disparar consulta externa com custo.
- Documentos exigem processo e URL. A escolha de arquivo parece upload, mas gera URL fictícia; a UX pode comunicar sucesso de uma operação que não ocorreu.
- A página de audiência envia `processId: ''` e usa campo de título livre; isso favorece duplicidade e perde associação processual.
- A tela de intimações rotula “Atualizar” como atualização de publicações, mas o botão apenas refaz a leitura local. A interface pode sugerir monitoramento automático inexistente.
- O roteiro de audiência aparece como “Gerado por IA”, mas é texto estático genérico com `setTimeout`; gera expectativa incorreta.
- Várias telas mostram loading e estados vazios, mas a consistência de mensagens e tratamento de erros varia. Algumas apenas fazem `console.error` sem mensagem operacional visível.
- Menus de páginas orientadas a IA usam política de menus; é importante distinguir bloqueio por plano, permissão de role, falha de carregamento e indisponibilidade do provedor.

## Acessibilidade e responsividade

Há uso de `aria-label`, labels, botões semânticos, classes responsivas e componentes reutilizáveis, mas não foi executada avaliação WCAG automatizada/manual nem revisão por teclado/leitor de tela. Há tabelas largas, modais com formulários extensos e botões icon-only que exigem revisão de foco, ordem de tabulação, contraste, zoom, texto de erro ligado aos campos e comportamento mobile.

## Modelo de navegação recomendado

1. Manter o cadastro de clientes existente como fonte cadastral única.
2. Criar uma área “Casos e processos” que tenha busca/lista e estado interno separado de estado oficial do tribunal.
3. Criar página de detalhes do caso com abas/seções: resumo; partes; atendimento/contratação; preparação; peças e versões; documentos/provas; protocolo; movimentações; tarefas/prazos; audiências; financeiro; IA; histórico/auditoria.
4. Vincular ações por contexto: “novo atendimento para este cliente”, “criar caso a partir do atendimento”, “gerar procuração com dados existentes”, “criar prazo a partir de intimação”, “analisar estes documentos no contexto deste processo”.
5. Rotular fonte e horário de dados externos, distinguir “consultar”, “registrar protocolo” e “peticionar”; mostrar crédito/preço antes de chamadas tarifadas.
6. Usar status internos de trabalho em um Kanban; mostrar fases/status oficiais numa timeline imutável alimentada por fonte externa ou registro manual auditado.

## Prioridade UX

P0: corrigir a falsa confirmação de upload; explicar custo e fonte da consulta; feedback de erro consistente.  
P1: página hub do caso e navegação contextual; salvamento de rascunho; associação de audiência/intimação.  
P2: Kanban interno com aging/impedimentos e dashboards por advogado/cliente.  
P3: personalização de jornadas por área e acessibilidade auditada.
