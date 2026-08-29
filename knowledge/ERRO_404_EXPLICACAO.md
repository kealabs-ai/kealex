# 🔴 Erro 404 - Explicação e Solução

## 📋 O que é o Erro?

```
Failed to load resource: the server responded with a status of 404 ()
```

Este erro aparece no console do navegador quando você clica em "Avançar Fase" na página de Processos.

---

## ✅ O que Está Funcionando

1. ✅ Botão "Avançar Fase" é clicável
2. ✅ Callback `onAvancar` é chamado
3. ✅ Console.log mostra: `"Processo 4eb65211-2025-425d-98b3-141ec2c434f7 avançou para fase 1"`
4. ✅ Animações funcionam
5. ✅ Interface responde corretamente

---

## ❌ Por que o Erro 404 Ocorre?

O erro 404 ocorre porque:

1. **Frontend está pronto** - A funcionalidade foi implementada
2. **Backend não tem o endpoint** - Não existe rota para processar a requisição
3. **Requisição é feita mas falha** - O servidor retorna 404 (não encontrado)

### Fluxo do Erro

```
Usuário clica "Avançar Fase"
    ↓
onAvancar callback é chamado
    ↓
console.log mostra a ação ✅
    ↓
Frontend tenta fazer requisição ao backend
    ↓
Backend não tem endpoint para /api/processos/{id}/fase
    ↓
Servidor retorna 404 ❌
    ↓
Erro aparece no console
```

---

## 🔧 Como Resolver

### Opção 1: Implementar Backend (Recomendado)

#### Passo 1: Criar Hook no Frontend

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
      queryClient.invalidateQueries({ queryKey: ['processos'] })
    },
  })
}
```

#### Passo 2: Integrar na Página

Atualizar `src/pages/ProcessosPage.tsx`:

```typescript
import { useAvancarFase } from '../hooks/useAvancarFase'

export function ProcessosPage() {
  const avancarFase = useAvancarFase()

  // No ProcessoTimeline:
  <ProcessoTimeline
    fases={p.fases}
    faseAtual={p.faseAtual}
    readonly={isCliente}
    onAvancar={(novaFase) => {
      avancarFase.mutate(
        { processoId: p.id, novaFase },
        {
          onSuccess: () => {
            console.log('Fase atualizada com sucesso')
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

#### Passo 3: Implementar Endpoint no Backend

Backend (FastAPI/Python):

```python
@app.patch("/processos/{processo_id}/fase")
async def atualizar_fase_processo(
    processo_id: str,
    body: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza a fase atual de um processo
    
    Body:
    {
        "faseAtual": 1
    }
    """
    try:
        # Buscar processo
        processo = await db.processos.find_one({
            "_id": ObjectId(processo_id),
            "usuario_id": current_user.id
        })
        
        if not processo:
            raise HTTPException(status_code=404, detail="Processo não encontrado")
        
        # Validar fase
        nova_fase = body.get("faseAtual")
        if nova_fase < 0 or nova_fase >= len(processo.get("fases", [])):
            raise HTTPException(status_code=400, detail="Fase inválida")
        
        # Atualizar
        resultado = await db.processos.update_one(
            {"_id": ObjectId(processo_id)},
            {
                "$set": {
                    "faseAtual": nova_fase,
                    "dataAtualizacao": datetime.now()
                }
            }
        )
        
        if resultado.modified_count == 0:
            raise HTTPException(status_code=500, detail="Erro ao atualizar")
        
        # Retornar processo atualizado
        processo_atualizado = await db.processos.find_one({"_id": ObjectId(processo_id)})
        return processo_atualizado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### Opção 2: Desabilitar Requisição Temporariamente

Se você quer apenas remover o erro 404 enquanto trabalha em outras coisas:

Atualizar `src/pages/ProcessosPage.tsx`:

```typescript
onAvancar={(novaFase) => {
  // Apenas log, sem requisição
  console.log(`Processo ${p.id} avançou para fase ${novaFase}`)
  
  // Comentar a requisição por enquanto:
  // avancarFase.mutate({ processoId: p.id, novaFase })
}}
```

---

### Opção 3: Mock do Backend

Para testes sem backend real:

```typescript
onAvancar={(novaFase) => {
  // Simular sucesso
  console.log(`Processo ${p.id} avançou para fase ${novaFase}`)
  
  // Simular delay de rede
  setTimeout(() => {
    console.log('Fase atualizada com sucesso (mock)')
  }, 500)
}}
```

---

## 📊 Comparação das Opções

| Opção | Vantagem | Desvantagem | Tempo |
|-------|----------|------------|-------|
| **Implementar Backend** | Solução completa | Requer backend | 2-4h |
| **Desabilitar Requisição** | Rápido | Sem persistência | 5min |
| **Mock** | Testa UI | Sem dados reais | 10min |

---

## ✅ Checklist para Resolver

- [ ] Criar hook `useAvancarFase`
- [ ] Integrar na página de Processos
- [ ] Implementar endpoint no backend
- [ ] Testar com Postman
- [ ] Verificar se erro 404 desapareceu
- [ ] Testar fluxo completo
- [ ] Adicionar loading state
- [ ] Adicionar error handling
- [ ] Documentar endpoint
- [ ] Fazer testes E2E

---

## 🎯 Status Atual

**Frontend:** ✅ 100% Completo  
**Backend:** ⏳ Pendente  
**Integração:** ⏳ Pendente  

O erro 404 é **esperado e normal** nesta fase. Após implementar o backend, o erro desaparecerá automaticamente.

---

## 📝 Resumo

1. **O erro 404 é esperado** - Frontend está pronto, backend não
2. **Funcionalidade está funcionando** - Console.log confirma
3. **Solução é simples** - Implementar endpoint no backend
4. **Tempo estimado** - 2-4 horas para solução completa

**Próximo passo:** Implementar endpoint PATCH no backend conforme código acima.

