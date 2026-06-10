# ✅ Configuração de Agentes IA - Frontend Admin

## 📋 Status: **CONFIGURADO E FUNCIONAL**

A interface de gestão de agentes IA já está **totalmente implementada** no painel Admin do Kealex.

---

## 🎯 Endpoints Configurados

### Base URL
- **Desenvolvimento**: `/api` (proxy Vite → `http://localhost:8000`)
- **Produção**: `https://srv1023256.hstgr.cloud`

### API de Agentes (`/src/api/agentes.ts`)

```typescript
// Lista todos os agentes
GET /v1/lex/agentes

// Lista agentes públicos (disponíveis para clientes)
GET /v1/lex/agentes/publicos

// Busca agente por ID
POST /v1/lex/agentes/get
Body: { id: string }

// Cria novo agente
POST /v1/lex/agentes
Body: Partial<AgenteIA>

// Atualiza agente existente
POST /v1/lex/agentes/update
Body: { id: string, ...campos }

// Deleta agente
POST /v1/lex/agentes/delete
Body: { id: string }
```

---

## 🗂️ Estrutura de Dados

### Interface `AgenteIA`

```typescript
interface AgenteIA {
  id: string
  tenantId: string
  escritorioId?: string
  nome: string
  descricao?: string
  provider: 'cerebras' | 'groq'
  api_key: string
  modelo: string
  max_tokens: number
  system_prompt?: string
  ativo: boolean
  publico: boolean  // Se pode ser usado por clientes
  createdAt: string
  updatedAt: string
}
```

### Modelos Disponíveis

**Cerebras:**
- `llama-3.3-70b`
- `llama-3.1-70b`
- `llama-3.1-8b`

**Groq:**
- `llama-3.3-70b-versatile`
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant`

---

## 🎨 Interface de Gestão

### Localização
📍 **Admin > Agentes IA** (`/admin?tab=agentes`)

### Funcionalidades Implementadas

✅ **Listagem de Agentes**
- Card visual com informações do agente
- Badges de status (Ativo/Inativo, Público/Privado)
- Exibição do provider e modelo
- Toggle para mostrar/ocultar API Key

✅ **Criar Agente**
- Formulário modal animado (Framer Motion)
- Seleção de provider (Cerebras/Groq)
- Campo de API Key (tipo password)
- Seleção de modelo dinâmica baseada no provider
- Max tokens configurável
- System prompt customizável (opcional)
- Toggle "Ativo" e "Público"

✅ **Editar Agente**
- Abre modal pré-preenchido com dados atuais
- Validação de campos obrigatórios
- Feedback visual de sucesso

✅ **Excluir Agente**
- Confirmação antes de deletar
- Atualização automática da lista

✅ **Cache e Performance**
- React Query configurado
- Invalidação automática após mutations
- Skeleton loading states

---

## 🔐 Controle de Acesso

### Restrições por Role

- **Admin**: ✅ Acesso total (CRUD de agentes)
- **Advogado**: ❌ Sem acesso
- **Cliente**: ❌ Sem acesso

### Sidebar Navigation

```typescript
// Visível apenas para role 'admin'
{
  to: '/admin?tab=agentes',
  label: 'Agentes IA',
  icon: Bot
}
```

---

## 🔄 React Query Hooks (`/src/hooks/useAgentes.ts`)

```typescript
// Listar todos os agentes
const { data, isLoading } = useAgentes()

// Listar agentes públicos
const { data } = useAgentesPublicos()

// Buscar agente por ID
const { data } = useAgente(id)

// Criar agente
const { mutateAsync } = useCreateAgente()

// Atualizar agente
const { mutateAsync } = useUpdateAgente()

// Deletar agente
const { mutateAsync } = useDeleteAgente()
```

---

## 🎭 Componentes Principais

### `AgentesTab.tsx`
Interface principal de gestão:
- Listagem com animações
- Modais de criação/edição
- Feedback visual de sucesso
- Empty states

### `AgenteModal`
Modal reutilizável para criar/editar:
- Formulário completo com validação
- Seleção dinâmica de modelos
- Toggles para "Ativo" e "Público"

---

## 🎨 Design System

### Badges de Status

```tsx
// Público
<Badge color="emerald">
  <Globe /> Público
</Badge>

// Privado
<Badge color="gray">
  <Lock /> Privado
</Badge>

// Ativo
<Badge color="emerald">
  <div className="animate-pulse" /> Ativo
</Badge>
```

### Cards de Agente

- Provider colorido (Groq = laranja, Cerebras = roxo)
- API Key com toggle show/hide
- Informações compactas (modelo, tokens, etc.)
- Ações de editar/deletar

---

## 📊 Estado Vazio

```tsx
// Quando não há agentes configurados
<EmptyState>
  <Bot size={48} />
  <p>Nenhum agente configurado</p>
</EmptyState>
```

---

## ✅ Checklist de Implementação

- [x] Endpoints de agentes configurados
- [x] Interface de listagem
- [x] Modal de criação
- [x] Modal de edição
- [x] Funcionalidade de exclusão
- [x] React Query hooks
- [x] Validação de formulários
- [x] Feedback visual (toasts, loading states)
- [x] Empty states
- [x] Sidebar navigation (role admin)
- [x] Toggle show/hide API Key
- [x] Badges de status
- [x] Animações com Framer Motion

---

## 🚀 Como Usar

### 1. Acessar como Admin
```
Email: admin@keahub.com
Senha: admin123
```

### 2. Navegar para Agentes IA
- Sidebar > **Agentes IA**
- Ou diretamente: `/admin?tab=agentes`

### 3. Criar Novo Agente
1. Clicar em **"+ Novo Agente"**
2. Preencher formulário:
   - Nome
   - Descrição (opcional)
   - Provider (Cerebras/Groq)
   - API Key
   - Modelo
   - Max Tokens
   - System Prompt (opcional)
   - Ativo/Público toggles
3. Clicar em **"Criar Agente"**

### 4. Gerenciar Agentes
- **Editar**: Ícone de lápis
- **Excluir**: Ícone de lixeira (com confirmação)
- **Ver API Key**: Toggle de olho

---

## 🔗 Integração com Backend

### Requisitos do Backend

O backend deve implementar os seguintes endpoints:

```python
# FastAPI endpoints esperados

@router.get("/v1/lex/agentes")
async def list_agentes()

@router.get("/v1/lex/agentes/publicos")
async def list_agentes_publicos()

@router.post("/v1/lex/agentes/get")
async def get_agente(id: str)

@router.post("/v1/lex/agentes")
async def create_agente(data: AgenteCreate)

@router.post("/v1/lex/agentes/update")
async def update_agente(id: str, data: AgenteUpdate)

@router.post("/v1/lex/agentes/delete")
async def delete_agente(id: str)
```

### Headers Obrigatórios

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 📝 Exemplo de Payload

### Criar Agente

```json
{
  "nome": "Assistente Trabalhista",
  "descricao": "Especializado em CLT e direito trabalhista",
  "provider": "groq",
  "api_key": "gsk-...",
  "modelo": "llama-3.3-70b-versatile",
  "max_tokens": 8192,
  "system_prompt": "Você é um assistente jurídico...",
  "ativo": true,
  "publico": true
}
```

### Atualizar Agente

```json
{
  "id": "uuid-do-agente",
  "nome": "Novo Nome",
  "ativo": false
}
```

---

## 🎯 Próximos Passos (Opcional)

1. **Multi-tenancy**: Filtrar agentes por `tenantId` / `escritorioId`
2. **Analytics**: Estatísticas de uso por agente
3. **Testes A/B**: Comparar performance entre providers
4. **Templates**: Agentes pré-configurados por área jurídica
5. **Permissões granulares**: Quais advogados podem usar quais agentes

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Verifique console do navegador (F12)
- Confira logs do backend FastAPI
- Valide JWT token no localStorage

---

**✨ Configuração concluída e pronta para uso!**
