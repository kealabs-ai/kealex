# 🤖 Integração com API Groq - Modelos Dinâmicos

## ✨ Funcionalidades Implementadas

### 1. **Carregamento Dinâmico de Modelos**
Quando o provider **Groq** é selecionado, os modelos são carregados automaticamente da API oficial do Groq.

**Endpoint usado:**
```
GET https://api.groq.com/openai/v1/models
```

### 2. **API Key Configurada**
```
gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Esta chave é:
- ✅ Usada automaticamente quando Groq é selecionado
- ✅ Pré-preenchida se não houver configuração salva
- ✅ Usada para carregar modelos disponíveis

### 3. **Botão "Atualizar Modelos"**
- Aparece quando provider Groq está selecionado
- Recarrega a lista de modelos da API Groq
- Mostra loading durante o carregamento
- Ícone de refresh animado

### 4. **Filtros Aplicados**
Ao buscar modelos da API Groq, são filtrados apenas:
- ✅ Modelos ativos (`active: true`)
- ✅ Modelos Llama (contém "llama" no ID)
- ✅ Ordenados alfabeticamente

### 5. **Fallback Inteligente**
Se a API Groq falhar ou não responder:
- Usa modelos padrão do backend (`/v1/lex/configuracoes/ia/modelos`)
- Se backend também falhar, usa lista hardcoded:
  - llama-3.3-70b-versatile
  - llama-3.1-70b-versatile
  - llama-3.1-8b-instant

## 🎯 Como Funciona

### Fluxo de Carregamento

1. **Usuário acessa Admin → IA**
2. **Se provider for Groq:**
   - Verifica se tem API key
   - Faz requisição para `https://api.groq.com/openai/v1/models`
   - Filtra modelos ativos com "llama"
   - Popula dropdown com modelos reais

3. **Se trocar para Groq:**
   - Handler detecta mudança
   - Carrega API key (configurada ou padrão)
   - Busca modelos automaticamente

4. **Botão "Atualizar Modelos":**
   - Recarrega modelos sob demanda
   - Útil se novos modelos forem lançados

## 📝 Exemplo de Resposta da API Groq

```json
{
  "data": [
    {
      "id": "llama-3.3-70b-versatile",
      "object": "model",
      "created": 1234567890,
      "owned_by": "groq",
      "active": true,
      "context_window": 8192
    },
    ...
  ]
}
```

## 🔒 Segurança

- ✅ API key não é exposta no console (apenas logs de debug)
- ✅ CSP atualizado para permitir `https://api.groq.com`
- ✅ Requisições com Bearer token correto
- ✅ Tratamento de erro se API falhar

## 🎨 UI/UX

### Feedback Visual
- 🔄 Spinner animado durante carregamento
- ✅ Mensagem "X modelos disponíveis (carregados da API Groq)"
- 🔴 Fallback silencioso se API falhar
- 🎯 Botão de refresh com ícone animado

### Estados
- **Loading:** Mostra "Carregando..." com spinner
- **Sucesso:** Lista de modelos atualizada
- **Erro:** Usa modelos padrão sem quebrar UI

## 🚀 Como Testar

1. **Acesse:** Admin → IA
2. **Selecione:** Provider = Groq
3. **Observe:**
   - API key é preenchida automaticamente
   - Modelos começam a carregar
   - Dropdown é populado com modelos reais

4. **Teste o botão:**
   - Clique em "Atualizar modelos"
   - Veja o ícone girando
   - Lista é recarregada

5. **Verifique console:**
   ```
   [Admin IA] Carregando modelos do Groq...
   [Admin IA] Modelos Groq carregados: ['llama-3.3-70b-versatile', ...]
   ```

## 📊 Diferença vs Cerebras

| Feature | Cerebras | Groq |
|---------|----------|------|
| Modelos | Estáticos (backend) | Dinâmicos (API) |
| Atualização | Manual no código | Automática da API |
| Fallback | Backend → Hardcoded | API → Backend → Hardcoded |
| Botão Refresh | ❌ Não | ✅ Sim |

## 🔧 Código Relevante

**Função de carregamento:**
```typescript
const loadGroqModels = async (apiKey: string) => {
  const response = await axios.get('https://api.groq.com/openai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })
  
  const models = response.data.data
    .filter((m: any) => m.active && m.id.includes('llama'))
    .map((m: any) => m.id)
    .sort()
  
  setGroqModels(models)
}
```

**API Key padrão:**
```typescript
const defaultGroqKey = 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

## ✅ Checklist de Implementação

- ✅ Função loadGroqModels implementada
- ✅ Estado groqModels adicionado
- ✅ useEffect atualizado para carregar modelos
- ✅ Handler de provider atualizado
- ✅ API key padrão configurada
- ✅ Botão "Atualizar modelos" adicionado
- ✅ CSP atualizado (api.groq.com)
- ✅ Feedback visual implementado
- ✅ Tratamento de erro robusto
- ✅ Console logs para debug

**Tudo pronto! Agora o sistema carrega modelos Groq dinamicamente! 🎉**
