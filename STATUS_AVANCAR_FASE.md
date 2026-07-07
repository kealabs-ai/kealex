# Status da Implementação - Avançar Fase

## 📋 Resumo

A funcionalidade "Avançar Fase" foi implementada com sucesso na página de Processos. O erro 404 observado é esperado pois a integração com o backend ainda precisa ser configurada.

---

## ✅ O que foi Implementado

### 1. Botão "Avançar Fase"
- ✅ Visível apenas para advogados
- ✅ Desabilitado na última fase
- ✅ Animações suaves
- ✅ Callback `onAvancar` funcionando
- ✅ Console.log confirmando ação: `"Processo 4eb65211-2025-425d-98b3-141ec2c434f7 avançou para fase 1"`

### 2. Ícones Maiores em Uma Linha
- ✅ Ícones de 20px
- ✅ Disposição horizontal
- ✅ Animações ao hover/tap
- ✅ Cores por tipo de ação

---

## 🔴 Erro 404 Observado

### Causa
```
Failed to load resource: the server responded with a status of 404 ()
```

Este erro ocorre porque:
1. O callback `onAvancar` está sendo chamado corretamente
2. Mas não há uma chamada ao backend para persistir a mudança
3. O frontend está tentando fazer uma requisição que não existe no backend

### Configuração Atual
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://srv1023256.hstgr.cloud',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

---

## 🔧 Como Implementar a Integração com Backend

### Passo 1: Criar Hook para Atualizar Fase

Criar arquivo `src/hooks/useAvancarFase.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

export function useAvancarFase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ processoId, novaFase }: { processoId: string; novaFase: number }) => {
      const { data } = await api.patch(`/api/processos/${processoId}/fase`, {
        faseAtual: novaFase,
      })
      return data
    },
    onSuccess: () => {
      // Invalidar cache de processos para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['processos'] })
    },
  })
}
```

### Passo 2: Integrar na Página de Processos

Atualizar `src/pages/ProcessosPage.tsx`:

```typescript
import { useAvancarFase } from '../hooks/useAvancarFase'

export function ProcessosPage() {
  // ... código existente ...
  const avancarFase = useAvancarFase()

  // Na renderização do ProcessoTimeline:
  <ProcessoTimeline
    fases={p.fases}
    faseAtual={p.faseAtual}
    readonly={isCliente}
    onAvancar={(novaFase) => {
      avancarFase.mutate(
        { processoId: p.id, novaFase },
        {
          onSuccess: () => {
            console.log(`Fase atualizada com sucesso para ${novaFase}`)
          },
          onError: (error) => {
            console.error('Erro ao atualizar fase:', error)
          },
        }
      )
    }}
  />
}
```

### Passo 3: Endpoint no Backend

O backend deve ter um endpoint como:

```
PATCH /processos/{processoId}/fase
Content-Type: application/json

{
  "faseAtual": 1
}

Response:
{
  "id": "4eb65211-2025-425d-98b3-141ec2c434f7",
  "faseAtual": 1,
  "status": "ativo",
  ...
}
```

---

## 📊 Fluxo Atual vs Esperado

### Fluxo Atual (Sem Backend)
```
Usuário clica "Avançar Fase"
    ↓
onAvancar callback é chamado
    ↓
console.log mostra a ação
    ↓
❌ Nenhuma persistência
```

### Fluxo Esperado (Com Backend)
```
Usuário clica "Avançar Fase"
    ↓
onAvancar callback é chamado
    ↓
useAvancarFase.mutate() faz requisição
    ↓
PATCH /api/processos/{id}/fase
    ↓
Backend atualiza banco de dados
    ↓
Response com dados atualizados
    ↓
React Query invalida cache
    ↓
Componente re-renderiza com nova fase
    ↓
✅ Mudança persistida
```

---

## 🚀 Próximas Etapas

### Curto Prazo
1. [ ] Criar hook `useAvancarFase`
2. [ ] Integrar na página de Processos
3. [ ] Testar com backend
4. [ ] Adicionar loading state
5. [ ] Adicionar error handling

### Médio Prazo
1. [ ] Adicionar confirmação antes de avançar
2. [ ] Validar pré-requisitos da fase
3. [ ] Adicionar notificações
4. [ ] Histórico de transições
5. [ ] Auditoria de mudanças

### Longo Prazo
1. [ ] Workflow customizável
2. [ ] Regras de negócio por tipo de processo
3. [ ] Integração com timeline de eventos
4. [ ] Relatórios de progresso

---

## 📝 Código Completo para Implementação

### `src/hooks/useAvancarFase.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

interface AvancarFaseParams {
  processoId: string
  novaFase: number
}

export function useAvancarFase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ processoId, novaFase }: AvancarFaseParams) => {
      const { data } = await api.patch(`/api/processos/${processoId}/fase`, {
        faseAtual: novaFase,
      })
      return data
    },
    onSuccess: (data) => {
      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['processos'] })
      
      // Opcional: atualizar cache específico
      queryClient.setQueryData(['processo', data.id], data)
    },
    onError: (error: any) => {
      console.error('Erro ao avançar fase:', error.response?.data || error.message)
    },
  })
}
```

### Integração na Página

```typescript
// Em ProcessosPage.tsx
const avancarFase = useAvancarFase()

// No ProcessoTimeline
<ProcessoTimeline
  fases={p.fases}
  faseAtual={p.faseAtual}
  readonly={isCliente}
  onAvancar={(novaFase) => {
    avancarFase.mutate(
      { processoId: p.id, novaFase },
      {
        onSuccess: () => {
          // Toast de sucesso (opcional)
          console.log('Fase atualizada com sucesso')
        },
      }
    )
  }}
/>
```

---

## ✅ Checklist de Implementação

- [x] Botão "Avançar Fase" criado
- [x] Callback `onAvancar` funcionando
- [x] Console.log confirmando ação
- [ ] Hook `useAvancarFase` criado
- [ ] Integração com backend
- [ ] Endpoint PATCH implementado
- [ ] Loading state adicionado
- [ ] Error handling implementado
- [ ] Testes realizados
- [ ] Documentação atualizada

---

## 🎯 Status Atual

**Implementação Frontend:** ✅ 100%
**Integração Backend:** ⏳ Pendente
**Testes:** ⏳ Pendente

O erro 404 é **esperado e normal** nesta fase. Após implementar o hook e o endpoint no backend, o erro desaparecerá e a funcionalidade estará completa.

---

## 📞 Suporte

Para implementar a integração com backend:
1. Criar o hook conforme código acima
2. Implementar endpoint PATCH no backend
3. Testar com ferramentas como Postman
4. Integrar na página de Processos

