# Auditoria arquitetural: usuários, escopo e billing

**Escopo da evidência:** frontend deste repositório (`src/`) e backend em `C:\Users\celso\OneDrive\Documentos\kealabs\hubKealex` (serviços FastAPI, migrations e docker compose). A leitura é estática: não conectei ao banco/Asaas nem validei configuração de produção. Não li arquivos `.env`.

## Resumo executivo

- **Autônomo:** o backend filtra várias operações por `tenant_id` e força esse valor a partir do token; clientes/processos também incluem checagens por tenant. É uma base real de isolamento, com lacunas em recursos filhos e permissões entre usuários do mesmo tenant.
- **Escritório:** há `escritorios` e associação por coluna `usuarios.escritorio_id`, porém sem papel/permissões por membro. A associação é apenas um rótulo: as consultas de processos/documentos/prazos são por tenant, não por escritório ou atribuição individual. Há também rotas que permitem alterar a associação sem validar adequadamente o escritório.
- **Billing:** `svc-auth` cria assinatura `/subscriptions` com ciclo `MONTHLY`, mas ativa usuário/tenant e troca o plano imediatamente pela resposta de criação, sem aguardar cobrança confirmada. Não há persistência local de ID/status da assinatura nem webhooks ou reconciliação visíveis. A recorrência é solicitada ao gateway, mas o ciclo de vida não está integrado com segurança.
- **Risco transversal:** existe configuração de credenciais/segredo em defaults e arquivos de deploy versionados; remover segredos do repositório e rotacionar credenciais expostas é prioridade imediata. As regras de `ProtectedLayout`, `useTrial` e `localStorage` seguem sendo apenas controles de interface.

## 1. Usuários, RBAC e hierarquia

### Evidências atuais

- `src/types/index.ts` define somente `Role = 'admin' | 'advogado' | 'cliente'`; não há papel de sócio, associado, estagiário ou administrativo, nem permissões por ação.
- `AuthUser` tem `tenantId`, `modalidade` e `escritorioId` opcionais; `Usuario` expõe `tenantId`, mas não `escritorioId`, status/role de associação ou permissões.
- `src/api/escritorios.ts` expõe CRUD e `associarMembro`; `src/api/usuarios.ts` permite enviar `escritorioId` no cadastro/alteração. Isso prova a existência de contratos de API, não de tabelas ou regras no servidor.
- Clientes têm `tenantId` e `advogadoId`; processos têm `advogadoId` e `tenantId` opcional; honorários e prazos têm `advogadoId`; documentos têm `processoId` e `tenantId` opcional. Relações de documentos, prazos e honorários passam pelo processo, mas os tipos locais não garantem integridade referencial.
- `ProtectedLayout` restringe rotas por role no cliente. `/usuarios` permite somente `admin`. `UsuariosPage` ainda fixa `isAdmin = true`; a listagem não recebe filtro de escritório e o formulário não associa membro a escritório.
- APIs de domínio enviam IDs de entidade para leitura/alteração/exclusão. O frontend não comprova que o backend valida se o registro pertence ao tenant/escritório do usuário autenticado.

### Evidências do backend e lacunas confirmadas

- `svc-auth/main.py` cria um tenant por cadastro e grava `tenant_id` no JWT. `svc-usuarios/main.py` filtra listagem, leitura, edição e remoção por tenant; esse isolamento é efetivamente implementado nessas rotas.
- `svc-escritorios/main.py` também filtra escritórios por tenant, mas `svc-usuarios` aceita `escritorioId` diretamente em criação/edição sem confirmar que o escritório pertence ao tenant. `/usuarios/modalidade` permite que o próprio usuário defina `escritorioId` sem checagem de tenant. Isso permite associações cruzadas/inválidas e deve ser corrigido.
- O endpoint `associar-membro` checa o escritório no tenant e atualiza o usuário com filtro por tenant, mas não retorna erro se `usuarioId` não existe (retorna `ok: true`).
- `RoleEnum` continua sendo só `admin`, `advogado`, `cliente`; endpoints de gestão de membros exigem `admin` global do tenant. Não há distinção de owner/administrador da conta vs. admin da plataforma, nem RBAC por ação.
- Serviços de domínio usam filtro `tenant_id` para listas e, em geral, para operações por ID. Isso dá isolamento entre tenants para registros diretamente carregados. Contudo, endpoints de criação de documento/prazo aceitam `processoId`/`escritorioId` do body e criam o registro sem validar que o processo e o escritório pai pertencem ao tenant. A linha filha fica no tenant atual, mas pode referenciar entidade de outro tenant. Corrigir validando pai antes de inserir e removendo IDs de tenant/escritório controlados pelo cliente.
- Os filtros são predominantemente tenant-wide. `escritorio_id` e `user_id` constam em algumas entidades, mas não limitam consultas; clientes/processos não são isolados por membro. Isso corresponde a um escritório colaborativo com dados compartilhados, não a permissões diferentes entre sócios, advogados e estagiários.
- Há dois caminhos de backend (`app/main.py` monolítico e microserviços). Confirmar qual rota recebe tráfego por serviço e consolidar guard/filtros; análise de um serviço não comprova que o endpoint legado equivalente tem a mesma regra.

### Cenários

**A — escritório:** associação multiusuário básica existe no banco, mas não atende aos perfis/permissões diferentes pedidos. Os membros de um tenant compartilham consultas por tenant, sem função por membro. O fluxo de gerenciamento é administrativo e a UI não o expõe adequadamente. A associação de escritório aceita IDs não validados em algumas rotas.

**B — autônomo:** a separação por tenant é implementada em muitas rotas principais, incluindo clientes e processos. Ainda é necessário corrigir validação das relações pai/filho e auditar o monólito/rotas não cobertas. Dentro de um tenant, a autorização é ampla: o campo `advogado_id` não implica filtro por usuário.

### Modelo-alvo recomendado

- `tenants`: unidade de isolamento e cobrança; tanto autônomo quanto escritório têm um tenant.
- `users`: identidade global (email único, credenciais, estado da conta).
- `tenant_memberships`: (`tenant_id`, `user_id`, `role`, `status`, `joined_at`, `invited_by`), com unicidade por tenant/usuário. Roles iniciais: `owner`, `partner`, `lawyer`, `intern`, `staff`; permissões avaliadas no servidor via matriz/capabilities, sem misturar `cliente` com membros internos.
- `offices`: dados jurídicos/comerciais do escritório dentro do tenant, se um tenant puder conter unidades; caso contrário, o tenant pode ser o próprio escritório e a tabela pode ser eliminada.
- Entidades de negócio com `tenant_id NOT NULL`; `created_by`/`assigned_to` para autoria e atribuição, além de `advogado_id` onde houver responsabilidade profissional. `escritorio_id` não substitui `tenant_id` como partição de segurança.
- `clientes` eventualmente relacionados a vários membros através de uma tabela de atribuição, se o compartilhamento individual for requisito; processos/documentos herdam escopo do tenant e têm autorização adicional por atribuição quando necessário.

Para o autônomo, criar um tenant próprio e membership `owner`; os mesmos predicados de isolamento do escritório passam a funcionar sem exceção especial. Para escritório, convidar membros para o tenant, associar role e validar limite do plano no servidor.

### Implementação técnica sugerida

1. **Inventário do backend/banco:** localizar schema, migrations, handlers e testes de todas as rotas `/k1/lex/*` e `/v1/lex/*`; confirmar se `tenant_id` vem exclusivamente do token/sessão, nunca do body/query sem validação.
2. **Esquema e migração compatível:** criar `tenant_memberships` e papéis; preencher memberships a partir dos vínculos atuais `tenantId`/`escritorioId`; tornar `tenant_id` obrigatório em todas as tabelas de domínio após saneamento. Adicionar FKs, índices começando por `tenant_id` e constraints contra associação cruzada.
3. **Autorização central no backend:** middleware extrai tenant e memberships do usuário autenticado; cada listagem filtra `tenant_id`; cada `get/update/delete` busca por `id AND tenant_id`; criação deriva `tenant_id` do contexto. Validar também o acesso ao processo pai antes de criar documento/prazo/honorário. Adotar RLS no banco se suportado como defesa adicional.
4. **RBAC e convites:** definir matriz de capabilities por papel, endpoints de convite/aceite/remoção e UI de membros do tenant; proteger alterações de role e owner no servidor. Clientes permanecem identidades externas com vínculo explícito a cliente/processos, sem acesso de membro.
5. **Migração da UI:** substituir `isAdmin = true`, usar a identidade/contexto real, adicionar gestão de membros/escritório e exibir apenas ações autorizadas. Não tratar navegação protegida como enforcement.
6. **Validação:** testes de integração negativos entre dois tenants para lista e operações por ID, relações pai/filho, troca de `tenantId` no payload, usuário removido/inativo, e matriz de permissões de cada papel. Fazer migração em etapas com relatório de registros sem tenant e estratégia de rollback.

## 2. Pagamentos e assinaturas

### Evidências atuais

- `src/api/assinatura.ts` define `starter`/`professional`, preços fixos e endpoints `/pre-register`, `/criar-cliente-asaas` e `/assinar`.
- `AssinaturaPage` comunica “7 dias grátis”, seleciona plano mensal, obtém token temporário de pré-cadastro e envia titular/cartão para o backend. `AssinaturaModal` também chama o fluxo de cliente e assinatura.
- O resultado esperado contém `subscriptionId`, `status`, `nextDueDate` e `value`, mas a tela de checkout usa principalmente ID, valor e próxima data. Em um fluxo, `AssinaturaModal` atualiza `plano` apenas no estado local do usuário.
- `AuthUser` não contém status da assinatura, `currentPeriodEnd`, próxima cobrança ou estado de pagamento. `useTrial` calcula expiração no navegador com base nos dados de login; `ProtectedLayout` bloqueia a UI quando o trial acabou. O interceptor também interpreta respostas 403 relacionadas a trial.
- O código da recorrência, tratamento de eventos, armazenamento de credenciais do cartão, idempotência e conciliação não está presente. Os honorários/cobranças do produto jurídico são cobranças dos clientes do escritório, um domínio separado do billing da assinatura Kealex.

### Conclusão

`svc-auth/main.py` envia `cycle: MONTHLY` para `/subscriptions`, portanto solicita recorrência ao Asaas. Porém o retorno da criação da assinatura imediatamente muda `tenant.plano` para o plano pago e ativa tenant/usuário, sem validar que o pagamento da primeira cobrança foi liquidado. A conta pré-cadastrada pode assim receber acesso com assinatura apenas criada. O resultado de uma assinatura mensal não prova liquidação futura.

Não há tabela de assinatura/invoice/evento no modelo `Tenant`, nem handler de webhook, cancelamento, retries, alertas ou reconciliação visíveis no backend. `require_active_trial` só bloqueia quando `plano == 'trial'` expirado; planos `pendente`/qualquer outro valor passam pelo guard sem validação de `Tenant.ativo` ou status de pagamento. O endpoint `/auth/ativar` aceita qualquer JWT válido, sem exigir `pre=True`, verificar pagamento ou checar usuário/tenant pelo vínculo; ele ativa a conta e emite token normal. `assinar` também não exige token pré-registro nem valida que o `asaasCustomerId` pertença ao tenant. Chamadas repetidas podem criar mais de uma assinatura.

Cartão completo e CVV transitam pelo backend na requisição; o código não os persiste explicitamente, mas requer revisão do fluxo de tokenização/escopo PCI e cuidado para nunca registrá-los em logs. A configuração também usa sandbox por default quando `KEALEX_ASAAS_BASE_URL` não é definida, o que pode produzir falsa impressão de billing de produção.

### Modelo e máquina de estados recomendados

- `subscriptions`: `tenant_id`, `plan_id`, `provider`, `provider_customer_id`, `provider_subscription_id` (único), `status`, `billing_cycle`, `amount`, `currency`, `current_period_start/end`, `next_due_date`, `cancel_at_period_end`, `canceled_at`, timestamps.
- `subscription_invoices`/`payments`: subscription, ID externo da cobrança, valor, vencimento, pago em, status, URL/linha de pagamento quando aplicável.
- `provider_webhook_events`: `event_id` único, tipo, referência externa, recebido/processado em, resultado; guardar payload minimizado e protegido para auditoria/reprocessamento.
- Estados internos explícitos: `trialing`, `pending`, `active`, `past_due`, `suspended`, `canceled`, `expired`. Eventos do gateway são a fonte de transições; chamadas repetidas não podem duplicar efeito.
- Política configurável de tolerância: notificar antes do vencimento; após falha, `past_due` com período de graça e avisos; suspender ações de escrita após a tolerância e manter acesso mínimo de leitura/exportação conforme política comercial; reativar só após confirmação confiável do pagamento.

### Fluxo recorrente Asaas

1. Servidor valida preço/plano e identidade; cliente nunca define valor autorizado. Criar/recuperar customer Asaas idempotentemente e persistir referência.
2. Criar assinatura recorrente no servidor com ciclo mensal e método escolhido. Nunca persistir número completo/CVV; usar tokenização/fluxo seguro compatível com Asaas e reduzir envio de dados sensíveis pelo frontend.
3. Persistir assinatura como `pending` e ativar trial/serviço segundo a regra de negócio. Retornar estado pendente/confirmado; não declarar paga com base apenas na resposta de criação.
4. Registrar webhook Asaas com validação de autenticidade e deduplicação por evento; processar transições de cobrança paga, falha, vencimento, cancelamento/estorno e mudança da assinatura em transação. Verificar referência do tenant/subscription antes de atualizar acesso.
5. Executar reconciliação agendada entre estado local e Asaas para recuperar webhooks perdidos. A tarefa precisa ser idempotente, observável e alertar falhas persistentes.
6. Calcular entitlement no servidor a cada requisição a partir do trial/assinatura e política de tolerância. Emitir avisos por e-mail/WhatsApp com antecedência e após falha, sem depender de login na aplicação.
7. Oferecer portal/endpoints de consultar assinatura, atualizar meio de pagamento, trocar plano e cancelar; persistir histórico e informar próxima cobrança e estado real ao frontend.

### Plano de adoção

1. **Fechar bypasses de acesso:** `/auth/ativar` deve ser interno ou exigir token pré-registro com `pre=True`, tenant/user vinculados e pagamento confirmado; `assinar` deve aceitar só fluxo pré-registro permitido e bloquear duplicidade/idempotência; `require_active_trial` deve negar tenant inativo/pendente e estados sem entitlement válido.
2. Confirmar no painel Asaas: ciclo configurado, tokenização/cartão, webhooks ativos/autenticados, estados/eventos usados, política de trial, cancelamento e retries.
3. Persistir catálogo de planos no servidor, assinatura e cobranças; reconciliar clientes existentes por `subscriptionId` e tenant. Primeiro reconciliar antes de alterar acessos atuais.
4. Implementar handler idempotente de webhook, auditoria e job de reconciliação antes de confiar no bloqueio automático.
5. Migrar trial e autorização para cálculo servidor-side; expor entitlement/status confiável na API. Deixar `useTrial` apenas para apresentação.
6. Adicionar tela de billing, alertas e fluxos de recuperação/cancelamento. Monitorar divergência entre estado local e Asaas e falhas de webhook.
7. Validar em sandbox: primeira contratação, evento duplicado/fora de ordem, pagamento confirmado, falha e recuperação, vencimento, cancelamento, reembolso, webhook ausente e tenant incorreto.

## Prioridade de execução

1. **P0 — Incidentes de segurança/configuração:** remover credenciais e segredos embutidos em arquivos versionados/deploy, rotacionar qualquer valor real exposto, falhar startup se `KEALEX_SECRET_KEY` for fraco/padrão; fechar bypass `/ativar`, validar membership/escritório e relações pai-filho.
2. **P1 — Billing consistente:** não ativar pelo mero sucesso de criação; persistir assinatura, webhooks idempotentes, reconciliação e entitlement servidor-side.
3. **P2 — Produto multiusuário:** memberships, RBAC do escritório, convites e UI de gestão; migrar dados existentes.
4. **P3 — Operação de billing:** notificações, autosserviço, conciliação e métricas de inadimplência.

## Implementações realizadas nesta etapa

- Serviços de documentos e prazos agora verificam que o processo pai pertence ao tenant autenticado e copiam o escritório/responsável do processo, em vez de confiar nesses IDs do body.
- Cadastro/edição de usuário validam que o escritório informado pertence ao tenant. Alterar modalidade deixou de ser permitido ao próprio usuário; requer admin do tenant e recebe o usuário alvo explicitamente.
- `svc-auth` persiste customer/assinatura/plano/status/renovação; recusa customer Asaas que não esteja vinculado ao tenant, bloqueia assinatura duplicada e não ativa conta apenas pela criação da recorrência. O endpoint legado `/auth/ativar` foi desativado.
- Adicionado webhook protegido pelo `asaas-access-token` configurado em `KEALEX_ASAAS_WEBHOOK_TOKEN`, com deduplicação de eventos e transições para ativo, inadimplente e cancelado. A liberação ocorre em `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED`.
- O guard compartilhado bloqueia tenant inexistente/inativo e planos pendentes/vencidos. Trial continua disponível até sua data de expiração; planos pagos exigem estado de assinatura ativo.
- O checkout não altera mais o plano no `localStorage` nem informa que a assinatura está ativa antes da confirmação do gateway.
- Criada a migration `migrations/add_subscription_lifecycle.sql`. Ela deve ser aplicada antes do deploy dos serviços alterados; configurar `KEALEX_ASAAS_WEBHOOK_TOKEN` e apontar o webhook do Asaas para `/k1/lex/auth/asaas-webhook`.

### Pendências desta etapa

- O RBAC de sócio/advogado/estagiário/administrativo ainda não foi criado. A associação a escritório continua sem papel ou matriz de capabilities; permissões por função exigem definir e aplicar essa matriz nos endpoints de cada serviço.
- Falhas de pagamento passam para `past_due` e bloqueiam o guard imediatamente; ainda faltam período de tolerância configurável, alertas, reativação validada de inadimplência, cancelamento completo, persistência por cobrança e reconciliação agendada.
- Segredos versionados não foram removidos nem rotacionados: isso depende de substituir os valores nos ambientes de deploy e invalidar credenciais antigas. Faça a rotação antes de publicar alterações.
- A migration ainda não foi executada no banco e nenhuma configuração do webhook foi alterada no painel Asaas. Não houve execução de testes nesta etapa.

## Itens necessários para fechar a auditoria

Esta auditoria estática não confirma o comportamento em produção, versão ativa das rotas, estado do banco, configuração efetiva dos webhooks ou comportamento do Asaas para a conta. O próximo passo é confirmar qual serviço está roteado, verificar configurações sem revelar valores secretos e exercitar os eventos em sandbox. Arquivos de deploy versionados contêm valores que parecem credenciais/segredos; se forem reais, devem ser rotacionados imediatamente e não copiados para tickets/relatórios.
