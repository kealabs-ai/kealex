# ✅ Checklist de Testes — Kealex AI Platform

## 🎨 Design & Tema

- [ ] Dark mode ativa ao clicar no ícone ☀️/🌙
- [ ] Tema persiste após recarregar página
- [ ] Todas as cores estão corretas (indigo, emerald, rose, amber)
- [ ] Transições suaves em todos os componentes
- [ ] Hover effects funcionam em botões e cards
- [ ] Animações de loading (shimmer, ping) funcionam

---

## 📱 Responsividade

- [ ] Layout funciona em mobile (< 640px)
- [ ] Sidebar colapsável em mobile
- [ ] Editor de documentos (IAPage) hidden em mobile
- [ ] Tabelas scrolláveis em mobile
- [ ] Botões com tamanho adequado para touch

---

## 🧭 Navegação

- [ ] Menu Sidebar mostra 8 módulos para advogados
- [ ] Menu Sidebar mostra 4 módulos para clientes
- [ ] Menu Sidebar mostra configurações para admin
- [ ] Links de navegação funcionam corretamente
- [ ] Proteção de rotas por role funciona
- [ ] Redirecionamento automático para /login se não autenticado

---

## 📊 Componentes

### ProcessoTimeline
- [ ] Timeline renderiza com 8 fases padrão
- [ ] Fases concluídas mostram check verde
- [ ] Fase ativa tem efeito pulsar
- [ ] Botão "Avançar Fase" funciona
- [ ] Conectores mudam de cor (verde/cinza)

### AreaChart
- [ ] Gráfico renderiza com dados corretos
- [ ] Curva de receitas é suave
- [ ] Linha de despesas é pontilhada
- [ ] Gradiente de preenchimento funciona
- [ ] Labels de valores aparecem
- [ ] Legenda mostra receitas e despesas
- [ ] Dark mode muda cores corretamente

### Split-Screen IAPage
- [ ] Chat aparece no lado esquerdo
- [ ] Editor aparece no lado direito (desktop)
- [ ] Mensagens do usuário em gradiente indigo
- [ ] Respostas da IA com markdown
- [ ] Botão de copiar funciona
- [ ] Botão de baixar .docx funciona
- [ ] Seletor de agentes funciona

---

## 📄 Páginas

### ProcessosPage
- [ ] Stats cards mostram totais corretos
- [ ] Tabela lista processos
- [ ] Busca filtra por título/número
- [ ] Botão "Novo Processo" abre modal
- [ ] Botão "Fases" expande timeline
- [ ] Botão "Guia" abre modal de guia
- [ ] Botão "Editar" abre modal com dados
- [ ] Botão "Excluir" remove processo
- [ ] Modal de guia gera código de barras

### IntimacoesPage
- [ ] Stats cards mostram totais
- [ ] Botão "Varrer Diários" anima carregamento
- [ ] Intimações listam com status correto
- [ ] Resumo IA aparece em box indigo
- [ ] Prazo calculado mostra data
- [ ] Botão "Ver texto" expande conteúdo
- [ ] Botão "Marcar lida" muda status
- [ ] Filtro por processo/diário funciona

### AudienciasPage
- [ ] Stats cards mostram totais
- [ ] Audiências listam com data destacada
- [ ] Status badge mostra cor correta
- [ ] Botão "Gerar IA" cria roteiro
- [ ] Roteiro expande com conteúdo
- [ ] Botão "Roteiro" alterna expansão
- [ ] Modal "Nova Audiência" funciona
- [ ] Campos do formulário validam

### FinanceiroPage
- [ ] Stats cards mostram valores corretos
- [ ] AreaChart renderiza com dados
- [ ] Alerta de vencimento mostra em rose
- [ ] Tabela lista honorários
- [ ] Busca filtra por descrição
- [ ] Botão "Novo Honorário" abre modal
- [ ] Botão "Editar" carrega dados
- [ ] Botão "Excluir" remove honorário

### IAPage
- [ ] Welcome screen mostra com ícone
- [ ] Sugestões de prompts aparecem
- [ ] Ações rápidas funcionam
- [ ] Chat envia mensagens
- [ ] Respostas aparecem com avatar
- [ ] Markdown renderiza corretamente
- [ ] Botão copiar funciona
- [ ] Editor mostra preview do documento
- [ ] Botão baixar .docx funciona
- [ ] Seletor de agentes funciona

---

## 🔐 Autenticação & Autorização

- [ ] Login com email/senha funciona
- [ ] JWT armazenado em localStorage
- [ ] Logout limpa token
- [ ] Redirecionamento automático em 401
- [ ] Advogado vê menu completo
- [ ] Cliente vê menu restrito
- [ ] Admin vê configurações
- [ ] Acesso negado a rotas protegidas

---

## 🎯 Funcionalidades Específicas

### Intimações
- [ ] Varredura de DJe simula carregamento
- [ ] Resumo IA aparece automaticamente
- [ ] Prazo é calculado corretamente
- [ ] Status muda ao marcar como lida
- [ ] Conteúdo completo expande

### Audiências
- [ ] Roteiro é gerado com estrutura correta
- [ ] Roteiro inclui perguntas e teses
- [ ] Data é formatada corretamente
- [ ] Status badge mostra cor certa

### Financeiro
- [ ] Gráfico mostra tendência correta
- [ ] Alerta de vencimento aparece
- [ ] Valores formatados em BRL
- [ ] Tabela ordena por vencimento

### IA
- [ ] Chat envia e recebe mensagens
- [ ] Markdown renderiza (bold, itálico, listas)
- [ ] Copiar texto funciona
- [ ] Editor mostra preview
- [ ] Agentes podem ser selecionados

---

## ⚡ Performance

- [ ] Página carrega em < 2s
- [ ] Scroll é suave (60fps)
- [ ] Animações não travam
- [ ] Gráfico renderiza rápido
- [ ] Tabelas com 100+ linhas scrollam bem
- [ ] Sem memory leaks (DevTools)

---

## 🔍 Acessibilidade

- [ ] Botões têm labels descritivos
- [ ] Cores têm contraste suficiente
- [ ] Teclado navega todos os elementos
- [ ] Focus states visíveis
- [ ] Modais têm focus trap
- [ ] Ícones têm alt text

---

## 🐛 Bugs Conhecidos

- [ ] (Nenhum identificado no momento)

---

## 📝 Notas

- Todos os endpoints de API devem ser implementados no backend
- Varredura de DJe requer integração com API de Diários
- Geração de roteiros requer integração com IA (OpenAI/Groq/Cerebras)
- Gráficos usam dados mock — substituir por dados reais

---

## 🚀 Pronto para Produção?

- [ ] Todos os testes passaram
- [ ] Sem console errors
- [ ] Performance otimizada
- [ ] Documentação completa
- [ ] Backup de dados configurado
- [ ] SSL/HTTPS ativo
- [ ] Rate limiting configurado
- [ ] Logs de auditoria ativo

---

**Data de Teste**: _______________
**Testador**: _______________
**Status**: ⏳ Em Progresso / ✅ Aprovado / ❌ Reprovado

---

**Plataforma pronta para comercialização! 🎉**
