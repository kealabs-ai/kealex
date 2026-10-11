# Mapa Mental — Fluxo de Cobrança + Assinatura Kealex

---

## 1. ASSINATURA (Contratação do Plano)

```
ASSINATURA
│
├── 🚪 ENTRYPOINTS
│   ├── AssinaturaPage   → /assinar?plano=starter|professional  (novo usuário)
│   └── AssinaturaModal  → dentro do app (usuário já logado / trial)
│
├── 📋 PLANOS DISPONÍVEIS
│   ├── Starter       → R$ 197,00/mês  | até 50 processos, IA básica
│   └── Professional  → R$ 397,00/mês  | processos ilimitados, IA avançada ⭐ Popular
│
├── 🔄 STEPS — AssinaturaPage (novo usuário)
│   ├── 0 — Conta
│   │       nome, email, senha, confirmar senha
│   │       └── POST /k1/lex/auth/pre-register → { userId, tenantId, token }
│   ├── 1 — Plano
│   │       seleção de starter | professional
│   ├── 2 — Titular
│   │       nome, email, CPF/CNPJ, CEP, número, complemento, telefone, celular
│   │       └── POST /k1/lex/auth/criar-cliente-asaas → { customerId }
│   ├── 3 — Pagamento
│   │       dados do cartão de crédito
│   │       └── POST /k1/lex/auth/assinar → AssinarResult
│   └── 4 — Confirmação ✓
│           subscriptionId, nextDueDate, valor, link para login
│
├── 🔄 STEPS — AssinaturaModal (usuário logado / trial)
│   ├── plano    → seleção de starter | professional
│   ├── titular  → dados do titular (pré-preenchido com billingProfile)
│   ├── metodo   → cartão de crédito | PIX
│   │   ├── cartao → dados do cartão
│   │   │   └── POST /k1/lex/auth/assinar → AssinarResult
│   │   └── pix   → gera QR Code
│   │       ├── POST /k1/lex/auth/assinar-pix → AssinarPixResult
│   │       │   └── pixQrCode, pixKey, pixExpiresAt
│   │       └── polling a cada 5s → GET /k1/lex/auth/billing-status
│   │           └── status === "active" → avança para sucesso
│   └── sucesso ✓
│           subscriptionId, nextDueDate, valor, plano ativado
│
├── 🏷️ STATUS DE BILLING
│   ├── trial         → período de teste ativo (7 dias)
│   ├── trial_expired → trial encerrado sem assinatura
│   ├── pending       → aguardando pagamento
│   ├── active        → assinatura ativa ✓
│   ├── past_due      → pagamento em atraso
│   ├── canceled      → assinatura cancelada
│   └── inactive      → inativo
│
├── 🌐 ENDPOINTS API — Assinatura
│   ├── POST /k1/lex/auth/pre-register        → cria conta (novo usuário)
│   ├── POST /k1/lex/auth/criar-cliente-asaas → cria cliente no Asaas
│   ├── POST /k1/lex/auth/assinar             → assina com cartão
│   ├── POST /k1/lex/auth/assinar-pix         → assina com PIX
│   ├── GET  /k1/lex/auth/billing-status      → status atual da assinatura
│   └── GET  /k1/lex/auth/billing-profile     → CPF/telefone cadastrados
│
└── ⚠️ TRATAMENTOS DE ERRO
    ├── E-mail já cadastrado (409) → modal para redirecionar ao login
    ├── Cartão não aprovado        → exibe mensagem + permite nova tentativa
    └── Erro genérico              → exibe detail da API
```

---

## 2. COBRANÇA (Gestão de Honorários)

```
COBRANÇA
│
├── 📋 CRIAÇÃO
│   ├── Campos obrigatórios
│   │   ├── clienteId       → vinculado ao Cliente
│   │   ├── processoId      → vinculado ao Processo (filtrado pelo cliente)
│   │   └── valorCentavos   → valor em centavos (ex: R$ 1.500,00 = 150000)
│   └── Campos opcionais
│       └── dataVencimento  → data limite de pagamento
│
├── 🔄 FASES (faseAtual: 0 → 4)
│   ├── 0 — Pendente              Aguardando processamento
│   ├── 1 — Aguardando Pagamento  Aguardando confirmação do cliente
│   ├── 2 — Vencida               Prazo de pagamento expirado
│   ├── 3 — Em Cobrança           Cobrança ativa em andamento
│   └── 4 — Pago ✓               Pagamento recebido com sucesso
│
├── 🏷️ STATUS
│   ├── pendente    → cobrança em aberto (fases 0–3)
│   ├── pago        → finalizado com sucesso
│   └── cancelado   → encerrado sem pagamento (com motivoCancelamento)
│
├── ⚡ AÇÕES DISPONÍVEIS
│   ├── Próxima Fase  → avança faseAtual +1 (bloqueado se finalizado ou fase = 4)
│   │   └── POST /k1/lex/cobrancas/proxima-fase  { id }
│   ├── Marcar Pago   → status = "pago", registra dataPagamento
│   │   └── POST /k1/lex/cobrancas/marcar-pago   { id, observacao? }
│   └── Cancelar      → status = "cancelado", registra motivoCancelamento
│       └── POST /k1/lex/cobrancas/cancelar       { id, motivo? }
│
├── 📜 TIMELINE (histórico de eventos — carregada sob demanda)
│   ├── POST /k1/lex/cobrancas/timeline  { id }
│   └── Eventos
│       ├── criada         → cobrança criada
│       ├── fase_avancada  → fase_anterior → fase_nova
│       ├── marcado_pago   → status = pago
│       └── cancelada      → status = cancelado + motivo
│
├── 🔗 VÍNCULOS
│   ├── Cliente   (clienteId → nome)
│   └── Processo  (processoId → numero + titulo)
│
├── 🌐 ENDPOINTS API — Cobrança
│   ├── GET  /k1/lex/cobrancas              → listar todas
│   ├── POST /k1/lex/cobrancas/get          → buscar por id
│   ├── POST /k1/lex/cobrancas              → criar nova
│   ├── POST /k1/lex/cobrancas/proxima-fase → avançar fase
│   ├── POST /k1/lex/cobrancas/marcar-pago  → finalizar como pago
│   ├── POST /k1/lex/cobrancas/cancelar     → cancelar
│   └── POST /k1/lex/cobrancas/timeline     → histórico
│
└── 🔁 ESTADOS FINAIS (isFinalizado — sem ações disponíveis)
    ├── status === "pago"
    └── status === "cancelado"
```

---

## 3. CICLOS DE VIDA

### Assinatura — Novo Usuário
```
Conta → Plano → Titular → Pagamento (Cartão) → Confirmação ✓
                                ↓
                           Erro de cartão → nova tentativa
                                ↓
                        E-mail duplicado → redireciona login
```

### Assinatura — Usuário Logado (Modal)
```
Plano → Titular → Método
                    ├── Cartão → Dados → Confirmar → Sucesso ✓
                    │                       ↓
                    │               Não aprovado → erro
                    └── PIX → Gerar QR Code → Aguardar pagamento
                                                  └── polling 5s → Sucesso ✓
```

### Cobrança — Ciclo de Honorários
```
[Criação] → Pendente → Aguardando Pagamento → Vencida → Em Cobrança → Pago ✓
                                  ↓                          ↓
                             Cancelado ✗               Cancelado ✗
```

---

## 4. RELAÇÃO ENTRE ASSINATURA E COBRANÇA

| Contexto | Descrição |
|---|---|
| Assinatura | Contratação do plano SaaS pelo escritório junto à Kealex (via Asaas) |
| Cobrança | Gestão de honorários do escritório com seus próprios clientes |
| Gateway | Ambos usam Asaas como processador de pagamento |
| Trial | 7 dias gratuitos antes da primeira cobrança da assinatura |
| Billing Status | Controla acesso à plataforma (`active`, `trial`, `past_due`, etc.) |

---

## 5. HOOKS REACT QUERY

| Hook | Arquivo | Função |
|---|---|---|
| `useCobrancas()` | useCobrancaFluxo.ts | Lista todas as cobranças |
| `useCobranca(id)` | useCobrancaFluxo.ts | Busca uma cobrança por id |
| `useCobrancaTimeline(id)` | useCobrancaFluxo.ts | Histórico de uma cobrança |
| `useCreateCobranca()` | useCobrancaFluxo.ts | Cria nova cobrança |
| `useProximaFase()` | useCobrancaFluxo.ts | Avança para a próxima fase |
| `useMarcarPago()` | useCobrancaFluxo.ts | Marca como pago |
| `useCancelarCobranca()` | useCobrancaFluxo.ts | Cancela a cobrança |
| `billingStatus` | AssinaturaModal.tsx | Status atual da assinatura (polling PIX) |
| `billingProfile` | AssinaturaModal.tsx | CPF/telefone pré-cadastrados do titular |

---

## 6. REGRAS DE NEGÓCIO

| Regra | Detalhe |
|---|---|
| Trial de 7 dias | Cobrança da assinatura só inicia após o período de teste |
| Fase sequencial | Cobrança não pode pular fases |
| Ações bloqueadas | Após `pago` ou `cancelado` nenhuma ação é permitida na cobrança |
| Processo filtrado | No modal de criação, só aparecem processos do cliente selecionado |
| Valor em centavos | Internamente em centavos, exibido formatado em BRL |
| Timeline sob demanda | Só carregada quando o usuário expande o histórico |
| PIX com polling | Verificação automática a cada 5s até confirmação do pagamento |
| Token temporário | No fluxo de assinatura, token é usado temporariamente para criar cliente Asaas |
| E-mail duplicado | Detectado via status 409 ou regex no detail da API |
