# 🧪 Validação de Endpoints - Agentes IA

## ✅ Configuração Completa

A validação dos endpoints de agentes IA está configurada com **3 métodos diferentes**:

---

## 📋 Método 1: Debug Panel na Interface (RECOMENDADO)

### Como acessar:

1. **Faça login como Admin**
   ```
   Email: admin@keahub.com
   Senha: admin123
   ```

2. **Acesse a aba de Debug**
   - Sidebar → **🧪 Debug API**
   - Ou diretamente: `http://localhost:5173/admin?tab=debug`

3. **Execute os Testes**
   - Clique no botão **"Executar Testes"**
   - Aguarde a execução automática de todos os endpoints
   - Visualize os resultados em tempo real

### O que é testado:

✅ **Teste 1:** `GET /v1/lex/agentes` - Listar todos os agentes  
✅ **Teste 2:** `GET /v1/lex/agentes/publicos` - Listar agentes públicos  
✅ **Teste 3:** `POST /v1/lex/agentes` - Criar novo agente  
✅ **Teste 4:** `POST /v1/lex/agentes/get` - Buscar agente por ID  
✅ **Teste 5:** `POST /v1/lex/agentes/update` - Atualizar agente  
✅ **Teste 6:** `POST /v1/lex/agentes/delete` - Deletar agente  

### Indicadores visuais:

- 🟢 **Verde (success)** - Endpoint funcionando corretamente
- 🔴 **Vermelho (error)** - Erro no endpoint (verifique backend)
- 🔵 **Azul (pending)** - Teste em execução

### Limpeza automática:

O agente de teste criado é **deletado automaticamente** ao final dos testes.

---

## 📋 Método 2: Script Node.js

### Executar no terminal:

```bash
cd c:\Users\celso\OneDrive\Documentos\kealabs\ViewKealex
node test-agentes-endpoints.js
```

### ⚠️ Pré-requisito:

Você precisa de um **token JWT de admin**. Para obter:

1. Faça login no frontend como admin
2. Abra o console do navegador (F12)
3. Execute: `localStorage.getItem('kealex_token')`
4. Copie o token
5. Cole na variável `ADMIN_TOKEN` do arquivo `test-agentes-endpoints.js`

---

## 📋 Método 3: Console do Navegador

### Abra o console (F12) na página /admin:

```javascript
// Importar a API
const { agentesApi } = await import('/src/api/agentes.ts')

// Teste 1: Listar agentes
const agentes = await agentesApi.list()
console.log('Agentes:', agentes)

// Teste 2: Listar públicos
const publicos = await agentesApi.listPublicos()
console.log('Públicos:', publicos)

// Teste 3: Criar agente
const novo = await agentesApi.create({
  nome: 'Teste Console',
  provider: 'groq',
  api_key: 'gsk-test',
  modelo: 'llama-3.3-70b-versatile',
  max_tokens: 4096,
  ativo: true,
  publico: false
})
console.log('Criado:', novo)

// Teste 4: Buscar por ID
const agente = await agentesApi.get(novo.id)
console.log('Buscado:', agente)

// Teste 5: Atualizar
const atualizado = await agentesApi.update(novo.id, { nome: 'Teste Atualizado' })
console.log('Atualizado:', atualizado)

// Teste 6: Deletar
await agentesApi.delete(novo.id)
console.log('Deletado!')
```

---

## 🔍 Verificando Requisições no DevTools

### Network Tab (F12 → Network):

1. Abra o DevTools e vá para a aba **Network**
2. Filtre por **XHR** ou **Fetch**
3. Acesse `/admin?tab=agentes` ou execute os testes
4. Visualize as requisições:

```
GET  /api/v1/lex/agentes           → Status 200
POST /api/v1/lex/agentes           → Status 201
POST /api/v1/lex/agentes/get       → Status 200
POST /api/v1/lex/agentes/update    → Status 200
POST /api/v1/lex/agentes/delete    → Status 200
```

### Console Tab:

Verifique logs do proxy Vite:
```
[Proxy] GET /api/v1/lex/agentes -> /v1/lex/agentes
```

---

## 🚨 Troubleshooting

### Erro 401 Unauthorized

**Causa:** Token JWT ausente ou expirado

**Solução:**
1. Faça logout e login novamente
2. Verifique se o token está no localStorage: `localStorage.getItem('kealex_token')`
3. Confirme que o usuário tem role `admin`

---

### Erro 404 Not Found

**Causa:** Endpoint não implementado no backend

**Solução:**
1. Confirme que o backend FastAPI está rodando em `https://srv1023256.hstgr.cloud`
2. Verifique se as rotas estão registradas no backend:
   ```python
   @router.get("/v1/lex/agentes")
   @router.post("/v1/lex/agentes")
   @router.post("/v1/lex/agentes/get")
   @router.post("/v1/lex/agentes/update")
   @router.post("/v1/lex/agentes/delete")
   ```

---

### Erro 500 Internal Server Error

**Causa:** Erro no backend (validação, database, etc.)

**Solução:**
1. Verifique logs do backend FastAPI
2. Confirme que o banco de dados está acessível
3. Valide o schema dos dados enviados

---

### CORS Error

**Causa:** Configuração de CORS no backend

**Solução:**
1. Em desenvolvimento, use o proxy Vite (`/api`)
2. Confirme CORS no backend:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"]
   )
   ```

---

## 📊 Logs Esperados (Sucesso)

### Console do Navegador:

```
[Proxy] GET /api/v1/lex/agentes -> /v1/lex/agentes
✅ Status: 200
📦 Resposta: [{id: "...", nome: "...", ...}]

[Proxy] POST /api/v1/lex/agentes -> /v1/lex/agentes
✅ Status: 201
📦 Resposta: {id: "...", nome: "Teste Debug ...", ...}

[Proxy] POST /api/v1/lex/agentes/delete -> /v1/lex/agentes/delete
✅ Status: 200
📦 Resposta: {message: "Agente deletado com sucesso"}
```

### DevTools Network:

```
Status   Method   URL                              Time
200      GET      /api/v1/lex/agentes             45ms
200      GET      /api/v1/lex/agentes/publicos    38ms
201      POST     /api/v1/lex/agentes             52ms
200      POST     /api/v1/lex/agentes/get         41ms
200      POST     /api/v1/lex/agentes/update      49ms
200      POST     /api/v1/lex/agentes/delete      43ms
```

---

## ✅ Checklist de Validação

- [ ] Login como admin funciona
- [ ] Página `/admin?tab=agentes` carrega
- [ ] Página `/admin?tab=debug` carrega
- [ ] Debug Panel executa sem erros
- [ ] Teste 1 (List) retorna array de agentes
- [ ] Teste 2 (List Públicos) retorna array filtrado
- [ ] Teste 3 (Create) cria agente e retorna ID
- [ ] Teste 4 (Get) busca agente por ID
- [ ] Teste 5 (Update) atualiza agente
- [ ] Teste 6 (Delete) remove agente
- [ ] Network tab mostra requisições com status 200/201
- [ ] Nenhum erro no console do navegador
- [ ] Backend responde em < 100ms

---

## 🎯 Resultado Esperado

Se todos os testes passarem, você verá:

```
✅ List Agentes - 3 agentes encontrados
✅ List Públicos - 2 agentes públicos
✅ Create Agente - ID: abc-123-def
✅ Get Agente - Nome: Teste Debug 1234567890
✅ Update Agente - Agente atualizado
✅ Delete Agente - Agente deletado
```

---

## 📞 Suporte Técnico

Se algum teste falhar:

1. **Verifique o backend**: Está rodando? Acessível?
2. **Verifique o token**: Ainda válido? Copie um novo
3. **Verifique o console**: Erros de CORS? 401? 404?
4. **Verifique os logs**: Backend e frontend
5. **Teste manualmente**: Use a interface normal de Agentes IA

---

**🚀 Validação configurada e pronta para uso!**
