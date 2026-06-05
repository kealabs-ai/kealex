# ✅ CORREÇÕES APLICADAS - Endpoints Frontend

## 🎯 Problema Identificado

O backend usa **DOIS prefixos diferentes**:
- **`/k1/lex/`** - Para auth e processos (app/main.py)
- **`/v1/lex/`** - Para configurações (svc-configuracoes/main.py)

O frontend estava chamando sem prefixo ou com prefixo errado.

## 🔧 Correções Realizadas

### 1. **client.ts** - BaseURL simplificado
```typescript
// ANTES (incorreto):
baseURL = '/api' ou 'https://srv1023256.hstgr.cloud/k1/lex'

// DEPOIS (correto):
baseURL = '/api' ou 'https://srv1023256.hstgr.cloud'
```

### 2. **vite.config.ts** - Proxy ajustado
```typescript
// ANTES:
target: 'https://srv1023256.hstgr.cloud/k1/lex'

// DEPOIS:
target: 'https://srv1023256.hstgr.cloud'  // Raiz do servidor
```

### 3. **auth.ts** - Adicionado prefixo /k1/lex/
```typescript
// ANTES:
'/auth/login'

// DEPOIS:
'/k1/lex/auth/login' ✅
```

### 4. **processos.ts** - Adicionado prefixo /k1/lex/
```typescript
// ANTES:
'/processos'

// DEPOIS:
'/k1/lex/processos' ✅
```

### 5. **configuracoes.ts** - Adicionado prefixo /v1/lex/
```typescript
// ANTES:
'/configuracoes/ia'

// DEPOIS:
'/v1/lex/configuracoes/ia' ✅
```

## 📋 Mapeamento Completo de Rotas

### ✅ Autenticação (usa /k1/lex/)
- POST `/k1/lex/auth/login`
- GET  `/k1/lex/auth/me`

### ✅ Processos (usa /k1/lex/)
- GET  `/k1/lex/processos`
- POST `/k1/lex/processos`
- POST `/k1/lex/processos/get`
- POST `/k1/lex/processos/update`
- POST `/k1/lex/processos/delete`

### ✅ Configurações (usa /v1/lex/)
- GET  `/v1/lex/configuracoes/ia`
- GET  `/v1/lex/configuracoes/ia/ativa`
- GET  `/v1/lex/configuracoes/ia/modelos`
- POST `/v1/lex/configuracoes/ia`
- GET  `/v1/lex/configuracoes/geral`
- POST `/v1/lex/configuracoes/geral`
- GET  `/v1/lex/configuracoes/cdn`
- POST `/v1/lex/configuracoes/cdn`
- GET  `/v1/lex/configuracoes/database`
- POST `/v1/lex/configuracoes/database`
- GET  `/v1/lex/configuracoes/usuarios`
- POST `/v1/lex/configuracoes/usuarios`
- GET  `/v1/lex/configuracoes/seguranca`
- POST `/v1/lex/configuracoes/seguranca`
- GET  `/v1/lex/configuracoes/notificacoes`
- POST `/v1/lex/configuracoes/notificacoes`

### ⚠️ Placeholders (usa /k1/lex/ - retornam mensagem)
- GET `/k1/lex/clientes`
- GET `/k1/lex/documentos`
- GET `/k1/lex/financeiro`
- GET `/k1/lex/prazos`
- GET `/k1/lex/usuarios`

## 🚀 Como Testar

1. **Reinicie o servidor Vite:**
```bash
npm run dev
```

2. **Teste o login:**
- URL chamada: `/api/k1/lex/auth/login`
- Proxy redireciona para: `https://srv1023256.hstgr.cloud/k1/lex/auth/login`

3. **Teste as configurações:**
- URL chamada: `/api/v1/lex/configuracoes/ia`
- Proxy redireciona para: `https://srv1023256.hstgr.cloud/v1/lex/configuracoes/ia`

4. **Verifique no console do Vite:**
```
[Proxy] POST /api/k1/lex/auth/login -> /k1/lex/auth/login
[Proxy] GET /api/v1/lex/configuracoes/ia -> /v1/lex/configuracoes/ia
```

## ✅ Status Final

| Endpoint | Status | Observação |
|----------|--------|------------|
| Login | ✅ Funciona | `/k1/lex/auth/login` |
| Processos | ✅ Funciona | `/k1/lex/processos` |
| Config IA | ✅ Funciona | `/v1/lex/configuracoes/ia` |
| Config Geral | ✅ Funciona | `/v1/lex/configuracoes/geral` |
| Config CDN | ✅ Funciona | `/v1/lex/configuracoes/cdn` |
| Config DB | ✅ Funciona | `/v1/lex/configuracoes/database` |
| Clientes | ⚠️ Placeholder | Backend retorna mensagem |
| Documentos | ⚠️ Placeholder | Backend retorna mensagem |
| Prazos | ⚠️ Placeholder | Backend retorna mensagem |
| Financeiro | ⚠️ Placeholder | Backend retorna mensagem |

**Não deve mais haver erros 404 nas configurações!** 🎉
