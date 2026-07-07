# Adição do Item de Menu - Gestão de Cobrança

## 📋 Resumo

Foi adicionado um novo item de menu "Gestão de Cobrança" ao sidebar da aplicação, com uma página completa para acompanhamento de fluxos de cobrança.

---

## 📁 Arquivos Criados/Modificados

### Criados
- `src/pages/CobrancaPage.tsx` - Página de Gestão de Cobrança

### Modificados
- `src/components/Sidebar.tsx` - Adicionado item ao menu
- `src/App.tsx` - Adicionada rota

---

## 🎯 Funcionalidades da Página

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ Gestão de Cobrança                                      │
│ Acompanhe o fluxo de cobrança de honorários...         │
├─────────────────────────────────────────────────────────┤
│ [Total em Cobrança] [Pendentes] [Em Cobrança] [Pagos]  │
├─────────────────────────────────────────────────────────┤
│ [Buscar...] [Todos] [Pendente] [Notificação] [...]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Fluxo de Cobrança #1                                │ │
│ │ ●─────●─────●─────●─────●─────●─────●─────●       │ │
│ │ [Ações Rápidas]                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Fluxo de Cobrança #2                                │ │
│ │ ●─────●─────●─────●─────●─────●─────●─────●       │ │
│ │ [Ações Rápidas]                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Componentes

#### Stats Cards
- **Total em Cobrança**: Soma de todos os valores em fluxo
- **Pendentes**: Quantidade de fluxos pendentes
- **Em Cobrança**: Quantidade em fases de cobrança (1ª, 2ª, 3ª)
- **Pagos**: Quantidade de fluxos pagos

#### Filtros
- **Busca**: Por descrição do honorário
- **Filtro por Fase**: 9 opções (Todos, Pendente, Notificação, 1ª/2ª/3ª Cobrança, Judicial, Pago, Cancelado)

#### Lista de Fluxos
- Exibe componente `CobrancaFluxoComponent` para cada fluxo
- Animações de entrada/saída
- Integração com backend (simulada)

---

## 🔗 Integração no Menu

### Sidebar
```typescript
const advogadoLinks = [
  { to: '/processos', label: 'Processos & Fases', icon: Briefcase },
  { to: '/intimacoes', label: 'Intimações & DJE', icon: Bell, badge: 'Novo' },
  { to: '/prazos', label: 'Calendário de Prazos', icon: Calendar },
  { to: '/audiencias', label: 'Audiências', icon: Gavel, badge: 'Novo' },
  { to: '/financeiro', label: 'Gestão Financeira', icon: DollarSign },
  { to: '/cobranca', label: 'Gestão de Cobrança', icon: TrendingUp, badge: 'Novo' },  // ← NOVO
  { to: '/documentos', label: 'Modelos e Peças', icon: FileText },
  { to: '/clientes', label: 'Clientes & CRM', icon: Users },
]
```

**Posição**: Entre "Gestão Financeira" e "Modelos e Peças"  
**Ícone**: TrendingUp (📈)  
**Badge**: "Novo"  
**Visibilidade**: Apenas para advogados (não aparece para clientes)

### Rota
```typescript
<Route path="/cobranca" element={<CobrancaPage />} />
```

---

## 📊 Dados Simulados

A página utiliza dados dos honorários existentes e simula fluxos de cobrança:

```typescript
const fluxosCobranca = honorariosList.map((h) => ({
  id: h.id,
  honorarioId: h.id,
  fase: (h.status === 'pago' ? 'pago' : h.status === 'vencido' ? 'cobranca1' : 'pendente'),
  dataInicio: new Date(h.dataVencimento),
  dataUltimaAcao: new Date(h.dataVencimento),
  proximaAcao: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  descricao: h.descricao,
  valor: h.valorCentavos,
}))
```

**Mapeamento de Status:**
- `pago` → Fase "pago"
- `vencido` → Fase "cobranca1"
- Outros → Fase "pendente"

---

## 🎨 Tema e Responsividade

### Tema Claro/Escuro
- ✅ Cores adaptadas para ambos os temas
- ✅ Componentes reutilizáveis
- ✅ Contraste apropriado

### Responsividade
- ✅ Stats em 2 colunas (mobile) → 4 colunas (desktop)
- ✅ Filtros em coluna única
- ✅ Fluxos empilhados verticalmente
- ✅ Scroll horizontal em mobile se necessário

---

## 🔄 Fluxo de Dados

```
CobrancaPage
├── useHonorarios() → Busca honorários
├── Mapeia para fluxosCobranca
├── Filtra por busca e fase
├── Exibe stats
├── Exibe filtros
└── Lista CobrancaFluxoComponent
    └── onFaseChange → Atualiza fase (backend)
```

---

## 🚀 Performance

### Build
- **Tempo**: 1.34s
- **Bundle**: 1,209.51 kB (346.09 kB gzip)
- **Módulos**: 2496 transformados
- **Erros**: 0

### Otimizações
- Lazy loading de componentes
- Memoização de callbacks
- Animações com Framer Motion
- Filtros em tempo real

---

## 📝 Próximas Melhorias

### Funcionalidades
- [ ] Integração real com backend
- [ ] Histórico de transições
- [ ] Notificações automáticas
- [ ] Relatórios de cobrança
- [ ] Exportação de dados
- [ ] Integração com SMS/Email

### UI/UX
- [ ] Gráficos de evolução
- [ ] Timeline visual melhorada
- [ ] Bulk actions
- [ ] Atalhos de teclado
- [ ] Modo escuro otimizado

---

## ✅ Checklist

- [x] Página CobrancaPage criada
- [x] Item adicionado ao menu Sidebar
- [x] Rota adicionada em App.tsx
- [x] Componente CobrancaFluxo integrado
- [x] Stats cards implementados
- [x] Filtros funcionando
- [x] Tema claro/escuro suportado
- [x] Responsivo
- [x] Build sem erros
- [x] Documentação completa

---

## 🎯 Acesso

**URL**: `/cobranca`  
**Menu**: Escritório → Gestão de Cobrança  
**Ícone**: 📈 TrendingUp  
**Badge**: Novo  
**Acesso**: Apenas advogados

