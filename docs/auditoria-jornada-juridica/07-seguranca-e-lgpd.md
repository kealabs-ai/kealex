# Segurança e privacidade — avaliação estática

> Esta análise identifica riscos no código e não constitui pentest, parecer jurídico, DPIA ou declaração de conformidade LGPD.

## Evidências e riscos

| Tema | Evidência observada | Risco / prioridade | Recomendação |
|---|---|---|---|
| Token no navegador | `src/context/AuthContext.tsx` guarda token JWT e perfil em `localStorage`; `src/api/client.ts` lê o token em cada requisição. | Alto: XSS pode exfiltrar token de sessão. | Avaliar cookie HttpOnly/SameSite/Secure com CSRF; reduzir XSS, CSP estrita, expiração curta e revogação. |
| Logs de atividades | `src/api/activities.ts` registra payload e respostas em `console.debug`; documentação do `svc-activities` declara middleware que registra corpo de request/response no stdout. | Crítico para confidencialidade: tarefa/descrição pode conter dado protegido. | Remover logs de payload/resposta; redigir PII; acesso/retention controls e teste de logs. |
| CORS | `svc-processos` e outros serviços têm configuração permissiva `allow_origins=['*']` em parte das apps; central usa lista de ambiente. | Médio/alto, sobretudo com credenciais/header e APIs expostas. | Allowlist por ambiente e origem oficial; testar preflight e não tratar CORS como autorização. |
| Upload de documentos | Tela usa URL fictícia sem armazenamento de bytes; serviço de arquivos existe separado. | Crítico: falso registro, perda de evidência, URL não autorizada e falta de antivírus/ACL comprovada. | Upload real autenticado, limites, MIME/assinatura, antivírus, storage privado, links expiráveis, hash, auditoria e backup. |
| Escopo de cliente | `process_routes.py` filtra role cliente por `processo.cliente_id == JWT sub`; `cliente_id` refere-se a cadastro em `clientes`. Não há vínculo usuário-cliente evidente no modelo examinado. | Alto: acesso legítimo bloqueado ou associação incorreta. | Definir vínculo cliente-login explícito e testar autorização horizontal por casos, clientes e tenants. |
| Isolamento tenant/usuário | Muitos endpoints filtram `tenant_id`, mas regras variam por role e serviço. IDs interdomínio são frequentemente UUIDs lógicos. | Alto até haver cobertura automatizada. | Matriz de autorização cross-tenant/cross-user, políticas centralizadas, testes negativos em cada endpoint. |
| Dados de análise/IA | `AnaliseDocumento.chunks_json` e mensagens guardam texto extraído; Google tokens cifrados no modelo. | Alto: conteúdo jurídico persistente e enviado a terceiros. | Criptografia/gestão de chaves/rotação, retenção, exportação/exclusão, isolamento de conversa e contratos de subprocessadores. |
| Cartão de pagamento | `CobrancaPage.tsx` coleta PAN/validade/CVV e API encaminha `creditCard` ao backend Asaas. | Crítico de escopo PCI e exposição de dado de pagamento. | Preferir tokenização/SDK hospedado do adquirente; nunca persistir/logar PAN/CVV; validar fluxo com especialista PCI e sandbox. |
| Segredos e configuração | Backend exige segredo JWT, credenciais de provedores, Drive, Asaas e integrações no ambiente; API keys de usuário têm campo cifrado. `.env` existe no diretório, conteúdo não foi aberto. | Alto se segredo for publicado, logado ou sem rotação; auditoria não verifica estado operacional. | Confirmar `.gitignore`/secret scanning sem imprimir valores; gestão de segredo, rotação e menor privilégio. |
| Auditoria do domínio | Histórico existe para consultas processuais e cobranças, mas não há trilha uniforme de alterações de caso/peça, acesso/download e aprovação. | Alto em segredo de justiça e responsabilização. | Evento auditável com ator, tenant, operação, recurso, timestamp e motivo; sem conteúdo integral sensível em log. |
| Segurança de arquivos | Storage separado e rotas com autenticação existem, mas autorização completa por usuário/processo, scan, retenção e restauração não foram validados no ambiente. | Alto. | Revisar ACL por objeto, assinatura de URLs, malware, limites, versionamento, recuperação e segregação. |
| Dados temporais | Vários schemas armazenam datas como texto (`String`) e usam UTC ingênuo. | Médio/alto: cálculo/ordenação e prazo em fusos/feriados. | Normalizar datas com fuso, fonte, ciência e regra de contagem; não calcular prazo com LLM. |

## Controles positivos observados

- JWT Bearer verificado e guards por tenant/role são presentes em serviços.
- Hash de senha com bcrypt documentado em autenticação.
- Chaves pessoais de IA e tokens Google têm campos de conteúdo cifrado nos modelos específicos.
- Anexos de certidões têm rota autenticada, PDF cifrado e trilha de download no caso de uso central.
- Cobrança Asaas possui tabelas de eventos/idempotência em alguns serviços e uso de webhook.

Esses controles são sinais de implementação, não evidência de configuração operacional, cobertura total ou conformidade.

## Plano de validação de segurança

1. Inventariar todos os endpoints do gateway ativo, exigir auth e classificar dados.
2. Testar usuário A contra recurso B no mesmo tenant; escritório contra outro escritório; cliente contra cliente; tenant A contra tenant B.
3. Revisar código/logs para payloads, chaves, PAN/CVV e texto de documentos; validar retenção e acesso de operadores.
4. Testar upload/download com MIME falso, arquivo grande, link expirado, IDOR, arquivo malicioso e usuário sem vínculo.
5. Revisar CSP, dependências, headers, sessão e política de backup/restore.
6. Mapear base legal, finalidade, subprocessadores, retenção, direitos do titular, incidentes e exclusão com encarregado/jurídico.

Não foram executados ataques, varreduras externas ou testes com dados de produção.
