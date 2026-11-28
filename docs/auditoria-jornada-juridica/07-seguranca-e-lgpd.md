# SeguranÃ§a e privacidade â€” avaliaÃ§Ã£o estÃ¡tica

> Esta anÃ¡lise identifica riscos no cÃ³digo e nÃ£o constitui pentest, parecer jurÃ­dico, DPIA ou declaraÃ§Ã£o de conformidade LGPD.

## EvidÃªncias e riscos

| Tema | EvidÃªncia observada | Risco / prioridade | RecomendaÃ§Ã£o |
|---|---|---|---|
| Token no navegador | `src/context/AuthContext.tsx` guarda token JWT e perfil em `localStorage`; `src/api/client.ts` lÃª o token em cada requisiÃ§Ã£o. | Alto: XSS pode exfiltrar token de sessÃ£o. | Avaliar cookie HttpOnly/SameSite/Secure com CSRF; reduzir XSS, CSP estrita, expiraÃ§Ã£o curta e revogaÃ§Ã£o. |
| Logs de atividades | `src/api/activities.ts` registra payload e respostas em `console.debug`; documentaÃ§Ã£o do `svc-activities` declara middleware que registra corpo de request/response no stdout. | CrÃ­tico para confidencialidade: tarefa/descriÃ§Ã£o pode conter dado protegido. | Remover logs de payload/resposta; redigir PII; acesso/retention controls e teste de logs. |
| CORS | `svc-processos` e outros serviÃ§os tÃªm configuraÃ§Ã£o permissiva `allow_origins=['*']` em parte das apps; central usa lista de ambiente. | MÃ©dio/alto, sobretudo com credenciais/header e APIs expostas. | Allowlist por ambiente e origem oficial; testar preflight e nÃ£o tratar CORS como autorizaÃ§Ã£o. |
| Upload de documentos | Tela usa URL fictÃ­cia sem armazenamento de bytes; serviÃ§o de arquivos existe separado. | CrÃ­tico: falso registro, perda de evidÃªncia, URL nÃ£o autorizada e falta de antivÃ­rus/ACL comprovada. | Upload real autenticado, limites, MIME/assinatura, antivÃ­rus, storage privado, links expirÃ¡veis, hash, auditoria e backup. |
| Escopo de cliente | `process_routes.py` filtra role cliente por `processo.cliente_id == JWT sub`; `cliente_id` refere-se a cadastro em `clientes`. NÃ£o hÃ¡ vÃ­nculo usuÃ¡rio-cliente evidente no modelo examinado. | Alto: acesso legÃ­timo bloqueado ou associaÃ§Ã£o incorreta. | Definir vÃ­nculo cliente-login explÃ­cito e testar autorizaÃ§Ã£o horizontal por casos, clientes e tenants. |
| Isolamento tenant/usuÃ¡rio | Muitos endpoints filtram `tenant_id`, mas regras variam por role e serviÃ§o. IDs interdomÃ­nio sÃ£o frequentemente UUIDs lÃ³gicos. | Alto atÃ© haver cobertura automatizada. | Matriz de autorizaÃ§Ã£o cross-tenant/cross-user, polÃ­ticas centralizadas, testes negativos em cada endpoint. |
| Dados de anÃ¡lise/IA | `AnaliseDocumento.chunks_json` e mensagens guardam texto extraÃ­do; Google tokens cifrados no modelo. | Alto: conteÃºdo jurÃ­dico persistente e enviado a terceiros. | Criptografia/gestÃ£o de chaves/rotaÃ§Ã£o, retenÃ§Ã£o, exportaÃ§Ã£o/exclusÃ£o, isolamento de conversa e contratos de subprocessadores. |
| CartÃ£o de pagamento | `CobrancaPage.tsx` coleta PAN/validade/CVV e API encaminha `creditCard` ao backend Asaas. | CrÃ­tico de escopo PCI e exposiÃ§Ã£o de dado de pagamento. | Preferir tokenizaÃ§Ã£o/SDK hospedado do adquirente; nunca persistir/logar PAN/CVV; validar fluxo com especialista PCI e sandbox. |
| Segredos e configuraÃ§Ã£o | Backend exige segredo JWT, credenciais de provedores, Drive, Asaas e integraÃ§Ãµes no ambiente; API keys de usuÃ¡rio tÃªm campo cifrado. `.env` existe no diretÃ³rio, conteÃºdo nÃ£o foi aberto. | Alto se segredo for publicado, logado ou sem rotaÃ§Ã£o; auditoria nÃ£o verifica estado operacional. | Confirmar `.gitignore`/secret scanning sem imprimir valores; gestÃ£o de segredo, rotaÃ§Ã£o e menor privilÃ©gio. |
| Auditoria do domÃ­nio | HistÃ³rico existe para consultas processuais e cobranÃ§as, mas nÃ£o hÃ¡ trilha uniforme de alteraÃ§Ãµes de caso/peÃ§a, acesso/download e aprovaÃ§Ã£o. | Alto em segredo de justiÃ§a e responsabilizaÃ§Ã£o. | Evento auditÃ¡vel com ator, tenant, operaÃ§Ã£o, recurso, timestamp e motivo; sem conteÃºdo integral sensÃ­vel em log. |
| SeguranÃ§a de arquivos | Storage separado e rotas com autenticaÃ§Ã£o existem, mas autorizaÃ§Ã£o completa por usuÃ¡rio/processo, scan, retenÃ§Ã£o e restauraÃ§Ã£o nÃ£o foram validados no ambiente. | Alto. | Revisar ACL por objeto, assinatura de URLs, malware, limites, versionamento, recuperaÃ§Ã£o e segregaÃ§Ã£o. |
| Dados temporais | VÃ¡rios schemas armazenam datas como texto (`String`) e usam UTC ingÃªnuo. | MÃ©dio/alto: cÃ¡lculo/ordenaÃ§Ã£o e prazo em fusos/feriados. | Normalizar datas com fuso, fonte, ciÃªncia e regra de contagem; nÃ£o calcular prazo com LLM. |

## Controles positivos observados

- JWT Bearer verificado e guards por tenant/role sÃ£o presentes em serviÃ§os.
- Hash de senha com bcrypt documentado em autenticaÃ§Ã£o.
- Chaves pessoais de IA e tokens Google tÃªm campos de conteÃºdo cifrado nos modelos especÃ­ficos.
- Anexos de certidÃµes tÃªm rota autenticada, PDF cifrado e trilha de download no caso de uso central.
- CobranÃ§a Asaas possui tabelas de eventos/idempotÃªncia em alguns serviÃ§os e uso de webhook.

Esses controles sÃ£o sinais de implementaÃ§Ã£o, nÃ£o evidÃªncia de configuraÃ§Ã£o operacional, cobertura total ou conformidade.

## Plano de validaÃ§Ã£o de seguranÃ§a

1. Inventariar todos os endpoints do gateway ativo, exigir auth e classificar dados.
2. Testar usuÃ¡rio A contra recurso B no mesmo tenant; escritÃ³rio contra outro escritÃ³rio; cliente contra cliente; tenant A contra tenant B.
3. Revisar cÃ³digo/logs para payloads, chaves, PAN/CVV e texto de documentos; validar retenÃ§Ã£o e acesso de operadores.
4. Testar upload/download com MIME falso, arquivo grande, link expirado, IDOR, arquivo malicioso e usuÃ¡rio sem vÃ­nculo.
5. Revisar CSP, dependÃªncias, headers, sessÃ£o e polÃ­tica de backup/restore.
6. Mapear base legal, finalidade, subprocessadores, retenÃ§Ã£o, direitos do titular, incidentes e exclusÃ£o com encarregado/jurÃ­dico.

NÃ£o foram executados ataques, varreduras externas ou testes com dados de produÃ§Ã£o.

## Atualizacao de implementacao - 26/11/2026

- `src/api/activities.ts` deixou de registrar payloads, parametros, respostas e objetos de erro no console. Os erros agora expoem apenas metodo, rota fixa e status HTTP quando disponivel.
- Validacao: busca estatica nos logs desse cliente e `npm.cmd run build` concluido com sucesso. O build ainda emite aviso de bundle JavaScript grande.
- O uso de JWT em `localStorage` permanece pendente de desenho e suporte coordenado entre frontend, autenticacao/backend e gateway; nao foi alterado nesta fatia.
- Esta atualizacao registra uma correcao de codigo e nao representa pentest, auditoria completa de logs, nem aprovacao do Gate 1.

### Revisao complementar dos logs do frontend

- A busca por chamadas de console em `src` encontrou objetos de erro registrados em telas de processos, prazos, financeiro, administracao, documentos e IA, alem de detalhes do provedor de IA.
- Os registros dessas telas agora usam mensagens fixas; o logger compartilhado descarta o objeto de erro; atividades expÃµe somente status HTTP; e o ErrorBoundary nao exibe mensagem/stack tecnico bruto ao usuario.
- A busca estatica foi repetida em `src`; `git diff --check` e `npm.cmd run build` passaram. O build ainda avisa que o bundle principal excede 500 kB.

## Atualizacao de renderizacao Markdown - 26/11/2026

- `MarkdownRenderer` inseria HTML gerado a partir de mensagens da IA sem sanitizacao. Agora a saida passa pelo DOMPurify com allowlist explicita de tags e atributos, sem SVG, forms ou atributos `data-*`; o pacote esta declarado como dependencia direta.
- Validacao: `npm.cmd ls dompurify --depth=0`, `npm.cmd run build` e `git diff --check` passaram. O build ainda avisa sobre bundle principal acima de 500 kB.
- A CSP em `index.html` ainda permite `unsafe-inline` e `unsafe-eval`; retirar esses valores requer revisar JSON-LD inline, Vite dev e headers reais do host. Isto permanece pendente; esta CSP via meta nao foi tratada como protecao completa.
- A correcao reduz o risco de XSS neste renderizador; nao e pentest nem aprovacao do Gate 1.

## Atualizacao de CSP - 26/11/2026

- Removido `unsafe-eval` da diretiva `script-src` no CSP declarado em `index.html`; busca no codigo `src` nao encontrou `eval()` ou `new Function()` da aplicacao.
- `unsafe-inline` permanece por causa do JSON-LD e a politica continua definida via meta tag; a migracao para headers do host, nonce/hash e validacao em navegador seguem pendentes.
- A alteracao sera validada com build, mas nao fecha revisao de CSP nem Gate 1.

## Remocao de scripts inline da CSP - 27/11/2026

- Revisao do HTML confirmou que o unico bloco inline e JSON-LD (`application/ld+json`), que e dado estruturado, nao JavaScript executavel. A diretiva `script-src` agora aceita apenas scripts da propria origem; `unsafe-inline` foi removido. `unsafe-eval` ja havia sido removido.
- O Vite injeta preambulo inline do React Fast Refresh no modo de desenvolvimento; uma transformacao limitada ao servidor `serve` habilita `unsafe-inline` apenas quando o modo nao e `production`. O HTML do build de producao mantem `script-src 'self'`.
- A CSP continua declarada por meta tag; headers do host, nonce/hash onde aplicavel, validaÃ§Ã£o em navegador e revisÃ£o das diretivas de estilo/conexÃ£o permanecem pendentes. Esta mudanÃ§a nÃ£o aprova Gate 1.

## Validacao de cobrancas por tenant - 26/11/2026

- A criacao de cobrancas agora rejeita papeis de cliente, exige que processo e cliente estejam no tenant do token e confirma que o cliente selecionado e o cliente principal do processo. Para advogados, processo e cliente tambem precisam estar vinculados ao usuario autenticado.
- Testes com SQLite em memoria exercitam casos positivos, cross-tenant, cross-user, associacao processo-cliente e resposta HTTP 403 com rollback. A suite de cobrancas passou com 10/10 testes.
- Essa cobertura e especifica para criacao de cobrancas; a matriz geral de autorizacao e a validacao das rotas efetivas do gateway continuam pendentes.
## Metadados de documentos owner-only - 26/11/2026

- O CRUD legado filtrava registros somente pelo tenant, embora o armazenamento de bytes permitisse somente ao uploader acessar o arquivo. Agora todos os acessos de metadados tambem filtram por `uploadado_por_id`; a criacao valida tenant/processo e ownership do advogado, e nega role cliente enquanto o vinculo cliente-login nao estiver definido.
- Testes isolados em SQLite: 9/9 passaram para listagem, leitura, alteracao, exclusao e criacao autorizada/negada. Os contratos HTTP foram preservados.
- Compartilhamento por escritorio e acesso do cliente continuam pendentes de decisao; esta correcao nao aprova o Gate 1.
## Endpoints de diagnostico de processos - 26/11/2026

- A rota de todas as fases consultava dados globais sem filtro por tenant, e as tres rotas agregadas aceitavam qualquer perfil autenticado. Agora exigem admin; consultas de fases/contagens sao vinculadas a processos do tenant do token.
- Logs de diagnostico nao incluem IDs de processos nem payloads das fases. Testes com SQLite: 3/3 passaram para role, isolamento de tenant e redacao de logs.

## Restricao de acesso a prazos - 26/11/2026

## Limpeza de cache entre sessoes - 26/11/2026

- O cache global do React Query agora e limpo ao autenticar e ao sair, evitando reutilizar respostas de outra identidade/tenant durante troca de sessao na mesma aba. A validacao atual e pelo build TypeScript; a estrategia de armazenamento/expiracao/revogacao do JWT continua pendente.

- As rotas de prazos limitam o acesso a perfis internos, restringem advogados aos proprios prazos e verificam ownership do processo na criacao. O frontend desativa as consultas de prazos, processos, clientes e documentos para o perfil cliente e orienta a contatar o escritorio.
- A suite isolada `svc-prazos/tests/unit/test_prazo_authorization.py` passou 4/4 com SQLite em memoria. O ambiente local usa Python 3.13; validacao com runtime Python 3.12 continua pendente.

## Restricao de dados financeiros de clientes - 26/11/2026

- A API financeira e os handlers centrais negam acesso ao perfil `cliente` enquanto nao existir associacao segura entre login e cadastro de cliente. As telas desativam consultas financeiras auxiliares para esse perfil e explicam como consultar o escritorio.
- Advogados ficam restritos aos proprios honorarios; a criacao valida tenant, processo, advogado e cliente principal, derivando associacoes do processo autorizado.
- A suite `svc-financeiro/tests/unit/test_financial_authorization.py` passou 8/8 com SQLite em memoria.

## Protecao dos handlers centrais e fallback do gateway - 26/11/2026

- A inspecao estatica confirmou que o Nginx direciona caminhos nao mapeados, incluindo financeiro e prazos, ao `hubkealex`. Os handlers centrais agora rejeitam o perfil cliente, limitam advogados aos processos proprios e validam tenant/processo/cliente na criacao.
- A suite isolada `test_resource_routes_authorization.py` passou 5/5 com SQLite em memoria. A configuracao efetiva do gateway ainda depende da selecao do profile e de validacao runtime; Gate 0 permanece aberto.

## Escopo adicional dos fallbacks centrais - 26/11/2026

- IntimaÃ§Ãµes e audiÃªncias no `hubkealex` agora exigem papel interno, restringem advogados aos processos atribuÃ­dos a eles e validam o processo associado em criaÃ§Ã£o/alteraÃ§Ã£o. Os testes centrais cobrem listagem por advogado e negaÃ§Ã£o para perfil cliente.
- A rota central `debug/fases/{processo_id}` tambÃ©m passou a negar clientes, restringir advogado/jurÃ­dico ao processo atribuÃ­do e retornar 404 para processo fora do escopo.
- Testes isolados em SQLite: `test_resource_routes_authorization.py` e `test_central_process_authorization.py`, 9/9 passaram; build frontend e `git diff --check` passaram. O build ainda alerta que o bundle principal excede 500 kB.
- Esta cobertura protege rotas de fallback identificadas estaticamente. NÃ£o comprova o gateway efetivo em runtime, nÃ£o substitui a matriz completa de roles/tenants e nÃ£o aprova Gate 0 ou Gate 1.

## ProteÃ§Ã£o de chaves de agentes de IA - 26/11/2026

- A busca individual de agentes pÃºblicos no backend central retornava o objeto serializado completo, incluindo a chave `api_key`, a qualquer usuÃ¡rio autenticado do tenant. As respostas individuais para nÃ£o administradores agora removem a chave e informam somente se o agente estÃ¡ configurado; agentes privados continuam negados.
- RegressÃ£o em SQLite isolado: os dois caminhos individuais nÃ£o retornam o segredo e o agente privado permanece negado. As suÃ­tes de fallback/processos e esta regressÃ£o passaram, totalizando 11 testes nesta rodada. `git diff --check` passou.
- A listagem administrativa permanece restrita pelo dependency `_require_admin`. Ainda Ã© necessÃ¡rio revisar fluxos administrativos completos, gateway efetivo e rotaÃ§Ã£o de chaves eventualmente expostas; esta correÃ§Ã£o nÃ£o aprova Gate 1.
- A listagem legada `/k1/lex/usuarios` tambÃ©m passou a exigir papel interno, evitando que uma conta de cliente enumere nomes, e-mails e papÃ©is de todos os usuÃ¡rios do tenant. A tela de equipe continua usando a mesma rota para perfis internos.
- As respostas de leitura e gravaÃ§Ã£o da configuraÃ§Ã£o legada de IA no `hubkealex` agora seguem o mesmo padrÃ£o: omitem `api_key` e retornam apenas `configured`; credenciais dos provedores nÃ£o sÃ£o devolvidas no corpo da API.
- RegressÃµes focadas para configuraÃ§Ãµes/agentes de IA e fallbacks centrais passaram 13/13 nesta rodada. `git diff --check` passou; nenhuma chamada de provedor foi realizada.
- No serviÃ§o de arquivos, a dependÃªncia JWT agora rejeita papÃ©is sem acesso interno (incluindo `cliente`). AssociaÃ§Ã£o de upload a processo exige tenant correspondente e, para advogado/jurÃ­dico, `advogado_id` igual ao usuÃ¡rio autenticado.
- `svc-arquivos` passou 11/11 testes em SQLite e diretÃ³rio temporÃ¡rio, incluindo rejeiÃ§Ã£o de cliente, processo atribuÃ­do a outro advogado, DOCX falso, pacote com traversal e aceitaÃ§Ã£o de pacote com entradas Office obrigatÃ³rias. Upload negado nÃ£o deixa bytes no storage. A execuÃ§Ã£o usa o app local do serviÃ§o, nÃ£o o app central.
- A validaÃ§Ã£o DOCX limita tamanho expandido e razÃ£o de compressÃ£o, verifica CRC, rejeita entradas duplicadas, links simbÃ³licos e caminhos absolutos/traversal, e exige `[Content_Types].xml` e `word/document.xml`. Isto nÃ£o substitui antivÃ­rus/quarentena; a decisÃ£o e scanner continuam pendentes para Gate 1.
- O download agora consulta o registro global do UUID antes de servir bytes: registro excluÃ­do ou pertencente a outro uploader/tenant Ã© negado mesmo se o arquivo fÃ­sico persistir apÃ³s falha de remoÃ§Ã£o. Arquivos legados sem qualquer registro continuam acessÃ­veis somente sob o diretÃ³rio do uploader. Se o metadado ativo existir mas os bytes estiverem ausentes, a exclusÃ£o lÃ³gica Ã© concluÃ­da com evento `delete_missing_bytes`, removendo o item da listagem.
- A matriz no mesmo tenant agora confirma que outro usuÃ¡rio nÃ£o lista, baixa nem exclui o arquivo do colega, e que o proprietÃ¡rio continua acessando-o. A suÃ­te isolada de `svc-arquivos` passou 15/15.
- O DELETE de `svc-arquivos` Ã© idempotente para metadados jÃ¡ tombstonados: repetiÃ§Ã£o limpa bytes residuais ou confirma ausÃªncia e audita `delete_cleanup`/`delete_repeat`. Isso permite retomar a remoÃ§Ã£o do metadado legado se a segunda etapa do frontend falhar apÃ³s excluir bytes. A mesma suÃ­te 15/15 cobre repetiÃ§Ã£o e tombstone com bytes residuais.

## ExpiraÃ§Ã£o e sincronizaÃ§Ã£o de sessÃ£o no frontend - 26/11/2026

- A validaÃ§Ã£o local do `exp` agora decodifica corretamente o segmento base64url do JWT e exige um valor numÃ©rico finito ainda vÃ¡lido.
- Eventos `storage` de login/logout/alteraÃ§Ã£o de token entre abas limpam o cache React Query e restauram ou encerram a sessÃ£o na aba ativa.
- `npm.cmd run build` passou. O token segue em `localStorage`; migraÃ§Ã£o para cookie HttpOnly, revogaÃ§Ã£o server-side e revisÃ£o coordenada de gateway/backend permanecem pendentes. A mudanÃ§a nÃ£o aprova Gate 1.

## Upload privado como Ãºnico caminho de criaÃ§Ã£o documental - 26/11/2026

- A tela `DocumentosPage` nÃ£o permite mais cadastrar documento novo por URL ou preencher tamanho manualmente: exige selecionar arquivo e upload ao `svc-arquivos`; referÃªncias externas legadas sÃ³ sÃ£o abertas para esquemas HTTP/HTTPS.
- O fallback central agora aceita criaÃ§Ã£o de metadado somente com referÃªncia `/v1/lex/arquivos/{UUID}` e verifica no registro de storage tenant, uploader, processo e estado nÃ£o excluÃ­do. A ausÃªncia da tabela de metadata retorna 503 sem gravar um Documento, aguardando a migration aprovada/rehearsada.
- Testes centrais SQLite passaram 11/11 para arquivo legÃ­timo, URL externa, uploader/processo/tenant divergente, arquivo excluÃ­do e tabela de storage ausente. Build frontend passou; nÃ£o houve migration nem upload em banco compartilhado. Gate 1 segue aberto atÃ© ensaio isolado MySQL e fluxo e2e.
- O owner alternativo `svc-documentos` recebeu a mesma validaÃ§Ã£o na criaÃ§Ã£o; updates nÃ£o podem trocar a referÃªncia privada por URL externa. A suÃ­te unitÃ¡ria do serviÃ§o passou 19/19, cobrindo dono, processo, tenant, tombstone e metadata ausente. Isso protege ambos os owners estÃ¡ticos sem afirmar qual profile estÃ¡ ativo.

## Compatibilidade do CRUD documental nos fallbacks - 26/11/2026

- O `hubkealex` agora atende `get`, `by-processo`, `update` e `delete` de documentos nos caminhos `/k1/lex/documentos` e `/v1/lex/documentos`, com escopo por tenant e usuÃ¡rio proprietÃ¡rio. A serializaÃ§Ã£o mantÃ©m o contrato camelCase usado pelo frontend.
- AtualizaÃ§Ã£o sÃ³ aceita nome, tipo e status com valores permitidos; bloqueia campos desconhecidos e impede trocar associaÃ§Ã£o de processo ou referÃªncia do arquivo privado. A tela desativa a seleÃ§Ã£o de processo enquanto edita.
- RegressÃ£o SQLite isolada: suites centrais de recursos e processos passaram 14/14, incluindo isolamento entre advogados, preservaÃ§Ã£o do vÃ­nculo e CRUD. Build de produÃ§Ã£o frontend passou; permanece alerta de bundle JavaScript principal acima de 500 kB. `git diff --check` passou nos dois repositÃ³rios.
- A anÃ¡lise Ã© estÃ¡tica para perfis de fallback. O owner efetivo de gateway continua por validar em runtime; Gate 0 e Gate 1 permanecem abertos. Nenhuma migration ou deploy foi executado.

## Tratamento explÃ­cito de referÃªncias documentais legadas - 27/11/2026

- A listagem agora identifica como â€œArquivo nÃ£o disponÃ­velâ€ referÃªncias que nÃ£o apontam para o endpoint privado de arquivos nem para uma URL externa absoluta HTTP(S); a aÃ§Ã£o de download nÃ£o Ã© apresentada nesses casos. URLs relativas deixam de ser resolvidas contra o prÃ³prio domÃ­nio da aplicaÃ§Ã£o.
- Build de produÃ§Ã£o frontend passou apÃ³s a alteraÃ§Ã£o; a suÃ­te central de recursos/processos passou 14/14 em SQLite no Python 3.13.3. `git diff --check` passou. O executÃ¡vel `.venv312` aponta para alias indisponÃ­vel do WindowsApps, entÃ£o a evidÃªncia pinada Python 3.12 continua pendente.
- A marcaÃ§Ã£o Ã© derivada da referÃªncia atual; nÃ£o altera registros legados nem prova que um destino externo HTTP(S) ainda exista. MigraÃ§Ã£o de estado, recuperaÃ§Ã£o dos arquivos, polÃ­tica antimalware/retenÃ§Ã£o, gateway efetivo e MySQL continuam pendentes. Nenhuma migration/deploy executado.

## CorreÃ§Ã£o da evidÃªncia do runtime pinado - 27/11/2026

- CorreÃ§Ã£o da anotaÃ§Ã£o anterior: o `.venv312` funciona quando iniciado fora do sandbox; nÃ£o era uma ausÃªncia de runtime, e sim bloqueio de execuÃ§Ã£o do alias no sandbox.
- ValidaÃ§Ã£o no ambiente virtual do projeto, Python 3.12.10: `svc-arquivos` 15/15, `svc-documentos` unit 19/19 e handlers centrais/processos 14/14, total de 48 testes isolados SQLite/storage temporÃ¡rio. VersÃµes conferidas: FastAPI 0.111.0, SQLAlchemy 2.0.30, Pydantic 2.7.1 e HTTPX 0.27.0, conforme pins.
- Isso remove a pendÃªncia de runtime pinado apenas para essas suÃ­tes; nÃ£o prova todas as suites/services, Docker, MySQL, gateway efetivo ou E2E. PortÃµes R0/R1 continuam abertos, sem migration/deploy.

## ExpansÃ£o do teste pinado entre serviÃ§os - 27/11/2026

- No `.venv312`, tambÃ©m passaram: `svc-cobrancas` 10/10, `svc-processos` 10/10, `svc-clientes` 3/3, `svc-financeiro` 8/8, `svc-prazos` 4/4 e `svc-activities` 5/5. Somadas Ã s 48 aprovaÃ§Ãµes documentais/centrais acima, sÃ£o 88 testes aprovados em oito escopos isolados.
- `svc-auth` nÃ£o executou: falta `bcrypt==4.2.1` no `.venv312` e nÃ£o hÃ¡ wheel no cache local; nenhum acesso Ã  rede foi feito. O registro anterior de 5/5 em Python 3.13 permanece evidÃªncia separada, nÃ£o validaÃ§Ã£o pinada.
- A execuÃ§Ã£o isolada nÃ£o substitui integraÃ§Ã£o de todos os serviÃ§os, Compose, MySQL ou gateway efetivo; os portÃµes continuam abertos.

## CorreÃ§Ã£o do estado atual de svc-auth - 27/11/2026

- A tentativa de reproduzir a suÃ­te unitÃ¡ria de `svc-auth` no `.venv` Python 3.13.3 do prÃ³prio serviÃ§o e no `.venv312` falhou na importaÃ§Ã£o, pois ambos nÃ£o tÃªm `bcrypt`; o teste nÃ£o chegou a executar asserÃ§Ãµes. O `bcrypt==4.2.1` consta em `svc-auth/requirements.txt`, mas nÃ£o hÃ¡ wheel no cache local.
- A anotaÃ§Ã£o histÃ³rica de 5/5 nÃ£o Ã© reproduzÃ­vel no worktree/ambientes atuais e nÃ£o deve ser considerada evidÃªncia corrente. Permanecem 88 aprovaÃ§Ãµes pinadas nas demais oito suÃ­tes; `svc-auth` estÃ¡ nÃ£o validado atÃ© a dependÃªncia exigida estar disponÃ­vel.

## CorreÃ§Ã£o de svc-auth e regressÃµes centrais - 27/11/2026

- CorreÃ§Ã£o da nota anterior: a suÃ­te correta `svc-auth/.venv312` jÃ¡ continha `bcrypt==4.2.1`; as tentativas anteriores usaram o ambiente Python errado ou foram bloqueadas ao iniciar o executÃ¡vel. Com `.venv312` executado fora do sandbox, `svc-auth` passou 5/5.
- TambÃ©m passaram no `.venv312` as regressÃµes de segredo de agentes e configuraÃ§Ã£o de IA (4/4). EvidÃªncia acumulada neste ciclo: 97 testes aprovados em dez suÃ­tes/escopos isolados, incluindo os 88 casos registrados anteriormente. Nenhum serviÃ§o externo ou banco compartilhado foi chamado.
- O `.venv` Python 3.13.3 do serviÃ§o ainda nÃ£o tem bcrypt; isso nÃ£o afeta a validaÃ§Ã£o pinada atual. Restam validaÃ§Ãµes de integraÃ§Ã£o/ambiente, MySQL e gateway.

## IntegraÃ§Ãµes locais dos serviÃ§os - 27/11/2026

- As suÃ­tes `tests/integration` de `svc-auth`, `svc-cobrancas`, `svc-processos`, `svc-clientes`, `svc-financeiro`, `svc-prazos`, `svc-activities` e `svc-documentos` passaram 13/13 no Python 3.12: health/registro de rotas, fluxo de atividade com SQLite e fluxo Google Drive com operaÃ§Ãµes externas mockadas.
- Para `svc-auth`, o venv local Python 3.12 recebeu `prometheus-client==0.20.0`, versÃ£o jÃ¡ fixada em `svc-auth/requirements.txt`; depois a suÃ­te passou 2/2. Nenhuma chamada a provedor real ou conexÃ£o de aplicaÃ§Ã£o ao MySQL foi feita.
- Somando ao ciclo anterior, hÃ¡ 97 testes unitÃ¡rios e 13 testes de integraÃ§Ã£o aprovados em ambientes locais. Isso nÃ£o equivale a teste de gateway/Compose ou E2E implantado; gates permanecem abertos.

## CorreÃ§Ã£o da contagem de suÃ­tes - 27/11/2026

A anotaÃ§Ã£o â€œ97 testes em dez suÃ­tes/escoposâ€ descrevia incorretamente o nÃºmero de comandos/suÃ­tes, pois um comando agrupou dois mÃ³dulos de IA. Os totais de casos permanecem: 97 testes unitÃ¡rios aprovados em 11 grupos de execuÃ§Ã£o e 13 testes de integraÃ§Ã£o aprovados em oito serviÃ§os. O nÃºmero de testes, nÃ£o a contagem de grupos, Ã© a evidÃªncia principal.

## IdempotÃªncia no upload documental - 27/11/2026

- O upload privado aceita `Idempotency-Key` opcional, Ãºnico por tenant/uploader. Replay com mesmo conteÃºdo, nome e processo reutiliza o ID persistido e registra auditoria; reutilizaÃ§Ã£o divergente ou tombstoned retorna conflito. O cliente mantÃ©m a chave ao repetir o mesmo arquivo/processo apÃ³s resposta ambÃ­gua.
- A migration nÃ£o aplicada declara a coluna e o Ã­ndice Ãºnico; o contrato SQL/ORM e os testes SQLite cobrem replay, alteraÃ§Ã£o de conteÃºdo/processo, isolamento por uploader, limpeza em falha de commit e preservaÃ§Ã£o em colisÃ£o UUID. A suÃ­te `svc-arquivos` passou 22/22 em Python 3.12; o build frontend passou.
- Corrida concorrente no MySQL, migration/recovery, rota pÃºblica efetiva e E2E continuam pendentes. Esta evidÃªncia local nÃ£o fecha Gates 0/1.

## Isolamento do pagador de cobranÃ§a jurÃ­dica - 27/11/2026

- A tela de cobranÃ§a nÃ£o reutiliza mais a rota de cadastro do cliente de assinatura SaaS. O novo endpoint `/v1/lex/cobrancas/pagador` (com aliases compatÃ­veis) exige cobranÃ§a do tenant autenticado em estado aberto, valida CPF/CNPJ, procura o cliente no Asaas e sÃ³ o cria quando nÃ£o existe.
- O identificador retornado serve apenas para iniciar a cobranÃ§a jurÃ­dica; o endpoint nÃ£o altera `tenant.asaas_customer_id` nem os dados `billing_*` do escritÃ³rio. ImplementaÃ§Ã£o adicionada ao `svc-cobrancas` e ao fallback central enquanto o owner/gateway efetivo nÃ£o Ã© confirmado.
- Build frontend passou, `svc-cobrancas` passou 16/16 testes unitÃ¡rios, incluindo quatro regressÃµes novas do endpoint com Asaas mockado, e 1/1 teste de integraÃ§Ã£o local confirmou os aliases FastAPI (`/k1`, `/v1` e `/cobrancas`). Os mÃ³dulos Python alterados passaram `py_compile`; `git diff --check` passou. As chamadas HTTP ao Asaas nÃ£o foram executadas nos testes. Gateway/Compose e comportamento concorrente da busca/criaÃ§Ã£o ainda precisam de validaÃ§Ã£o isolada. Gates 0/1 permanecem abertos; nenhuma migration ou deploy executado.
- Regressao do fallback central: `test_central_billing_payer.py` passou 3/3 com provider mockado, cobrindo reutilizacao, criacao apos busca sem resultado e rejeicao de cobranca fora do tenant/encerrada antes da chamada externa. Nenhuma conexao MySQL foi aberta.

## Token explicito no cadastro publico de assinatura - 27/11/2026

- O fluxo publico nao substitui mais temporariamente `kealex_token` no `localStorage` para chamar cadastro de pagador e assinatura. O token emitido para o novo cadastro segue apenas no header `Authorization` dessas duas requisicoes; o interceptor preserva um header explicito e continua usando a sessao global para as demais chamadas.
- A busca de CEP aborta consultas anteriores quando o valor muda, e os erros de cadastro/assinatura usam tipos Axios em vez de `any`.
- Validacao: `npm.cmd run build` passou, com aviso existente de bundle principal acima de 500 kB; ESLint nos tres arquivos alterados (`src/api/client.ts`, `src/api/assinatura.ts`, `src/pages/site/AssinaturaPage.tsx`) passou; `git diff --check` passou. Nenhum teste de fornecedor, migration ou deploy foi executado.
- Isto reduz a troca concorrente de identidade no navegador, mas nao remove o JWT de `localStorage` nem fecha os Gates 0/1.

## Prevalidacao do upload documental no frontend - 27/11/2026

- `DocumentosPage` agora rejeita antes do envio extensoes diferentes de PDF/DOC/DOCX e arquivos acima de 100 MiB, alinhado ao limite padrao e extensoes declaradas em `svc-arquivos`. A verificacao de extensao/tamanho no navegador e apenas orientativa; o backend permanece responsavel por assinatura MIME, conteudo e autorizacao.
- A exibicao do tamanho distingue bytes, KB e MB, inclusive arquivos menores que 1 KB.
- Validacao: `npm.cmd run build` passou (com o aviso existente de bundle principal acima de 500 kB), ESLint de `src/pages/DocumentosPage.tsx` passou e `git diff --check` passou. O lint identificou acesso a `ref` pelo callback do formulario; o identificador idempotente agora usa estado React para manter a chave entre tentativas sem ler refs durante render.

## Estado de erro e retry na listagem documental - 27/11/2026

- A falha de carregamento em `DocumentosPage` deixou de parecer uma lista vazia. A tabela agora mostra estado de erro acessivel (`role=alert`) e acao de retry, com indicador enquanto a consulta esta sendo repetida.
- Validacao de build, lint do arquivo e `git diff --check` registrada apos esta alteracao.
- Resultado da validacao: `npm.cmd run build`, ESLint de `src/pages/DocumentosPage.tsx` e `git diff --check` passaram. O bundle principal continua gerando aviso acima de 500 kB.
- Ajuste de configuracao: o limite de prevalidacao nao e mais fixo. `KEALEX_MAX_UPLOAD_BYTES` no build do frontend deve ser igual ao `MAX_UPLOAD_BYTES` do `svc-arquivos`; ambos usam 104857600 bytes (100 MiB) como padrao. A configuracao frontend rejeita valores nao inteiros ou menores/iguais a zero. O ambiente implantado continua sem verificacao e deve ser comparado antes do release.

## Controle de fechamento durante upload - 27/11/2026

- O modal de documento nao fecha enquanto o upload/cadastro de metadados esta em andamento; o botao Cancelar fica desabilitado. Isso evita que a conclusao tardia da operacao feche um modal reaberto para outro registro.
- Validacao: build frontend, ESLint de `src/pages/DocumentosPage.tsx` e `git diff --check` executados apos a alteracao.
- Resultado da validacao: `npm.cmd run build`, ESLint de `src/pages/DocumentosPage.tsx` e `git diff --check` passaram. O bundle principal ainda supera 500 kB.
- Correcao complementar: o fechamento tambem e bloqueado durante edicao/atualizacao de metadados, cobrindo qualquer mutacao persistente do modal.
- Resultado: build, ESLint focado em `DocumentosPage.tsx` e `git diff --check` passaram; o aviso de bundle principal acima de 500 kB permanece.

## Feedback de falha em edicao e exclusao documental - 27/11/2026

- `DocumentosPage` agora mostra uma mensagem de erro para falhas de atualizacao e exclusao de metadados; modais permanecem disponiveis para retry e nao anunciam sucesso.
- A suÃ­te local atual de `svc-arquivos` passou 22/22 casos, com SQLite e storage temporario. O teste de contrato compara o SQL versionado ao ORM, sem executar a migration; nenhum banco compartilhado ou servico externo foi acessado.
- Scanner antimalware/quarentena continua pendente: nenhum scanner foi encontrado no codigo/configuracao consultados e a decisao de politica consta como aberta nos documentos v2.0. Nao se afirma aceite de seguranca para uso com documentos reais.
- Validacao frontend: build, ESLint focado em `DocumentosPage.tsx` e `git diff --check` executados apos esta alteracao.
- Resultado da validacao desta correcao: build e ESLint de `src/pages/DocumentosPage.tsx` passaram; `git diff --check` passou. Bundle principal acima de 500 kB continua como aviso.

## Isolamento do token temporario de checkout - 27/11/2026

- O token de pre-cadastro usado no retorno do checkout agora e armazenado em `kealex_checkout_token`, separado da sessao autenticada (`kealex_token`/`kealex_user`). A consulta de status envia esse token explicitamente apenas para `billing-status`; os demais requests nao o recebem pelo interceptor global.
- A pagina continua sem criar uma sessao completa para usuario pre-cadastrado. Quando o webhook indicar `active`, remove o token temporario e solicita login normal; o modal de assinatura permanece exclusivo para usuario autenticado.
- Validacao local: ESLint focado em `src/api/assinatura.ts`, `src/pages/site/AssinaturaPage.tsx` e `src/pages/PagamentoPendentePage.tsx` passou; `npm.cmd run build` e `git diff --check` passaram. O build mantem aviso de bundle principal acima de 500 kB.
- Limites: retorno e polling nao foram exercitados em navegador contra gateway/webhook; expiracao do token e comportamento de falha do endpoint ainda precisam de validacao E2E isolada. Isso nao conclui a revisao de armazenamento/revogacao de sessao nem fecha Gates 0/1. Nenhum Asaas, migration ou deploy foi executado.

## Login: contato de recuperacao e confirmacao de checkout - 27/11/2026

- A auditoria havia encontrado o link "Esqueceu sua senha?" chamando `/k1/lex/auth/forgot-password`, sem rota correspondente no backend e sem politica de verificacao de identidade, token unico/expiracao, canal de entrega ou controles contra abuso. Removi o modal e o cliente API sem suporte; a tela agora direciona ao contato de suporte e nao afirma que a redefinicao automatica foi solicitada.
- O login reconhece `?pagamento=confirmado` e apresenta orientacao para entrar depois que o webhook ativar a conta.
- Validacao: busca estatico no backend nao encontrou rota `forgot-password`; ESLint focado em `src/pages/LoginPage.tsx`, build de producao e `git diff --check` passaram. Build ainda avisa que o bundle principal excede 500 kB.
- O processo real de atendimento pelo suporte e o fluxo E2E de ativacao/login nao foram verificados. A definicao e implementacao futura da redefinicao segura continua pendente; Gates 0/1 permanecem abertos. Nenhum provedor, migration ou deploy foi usado.

## Remocao de log de URL no proxy Vite - 27/11/2026

- O proxy de desenvolvimento imprimia metodo, URL/caminho recebido e destino em `console.log`. Removi o listener para que parametros e identificadores da requisicao nao sejam copiados para o console local.
- ESLint de `vite.config.ts`, varredura por `console.log`/`proxyReq`/`req.url` no arquivo, build de producao e `git diff --check` passaram. O build ainda alerta sobre o bundle principal acima de 500 kB.
- O alvo do proxy continua vindo de `KEALEX_API_BASE_URL`; este build nao iniciou a aplicacao nem fez chamadas HTTP. O valor configurado no ambiente local e o destino efetivo de testes precisam ser revisados antes de qualquer E2E; Gate 0 permanece aberto. Nenhum deploy ou migration foi executado.

## Redacao de chaves de agentes em toda resposta administrativa - 27/11/2026

- A auditoria de codigo encontrou que a listagem administrativa de `/k1/lex/agentes` e respostas de criacao/atualizacao ainda devolviam `api_key`, embora os detalhes publicos ja fossem redigidos. Todas as respostas do fallback central agora removem o segredo e retornam apenas `configured`.
- A lista frontend nao mostra mais chave nem possui controle para revela-la. O formulario de edicao aceita chave vazia para preservar a credencial configurada e exige uma nova chave quando o provider muda; o contrato TypeScript agora marca `api_key` como opcional.
- `test_agent_secret_authorization` passou 3/3 com SQLite em memoria, incluindo a listagem administrativa e os detalhes sem chave. ESLint focado, build e `git diff --check` passaram. O build continua com aviso de bundle acima de 500 kB.
- O teste cobre a rota central/fallback e nao valida o gateway ativo nem todos os microservicos em runtime. A alteracao nao rota credenciais ja expostas; avaliar rotacao conforme revisao do responsavel de seguranca. Gates 0/1 continuam abertos; nenhuma migration ou deploy foi executado.

## Isolamento do alvo de testes e APIs do frontend - 27/11/2026

- `src/api/activities.ts` e `src/api/escritorios.ts` deixaram de substituir silenciosamente o `baseURL` do cliente Axios pelo host publico; ambas agora seguem exclusivamente `KEALEX_API_BASE_URL` do cliente central.
- `test-agentes-endpoints.js` nao tem mais host/token admin embutidos nem instrucoes para copiar JWT do navegador. O utilitario aceita somente HTTP em loopback na porta local 18000, exige token de teste via `KEALEX_TEST_ADMIN_TOKEN`, rejeita redirects e redige campos de chave/token/segredo nas respostas impressas.
- Validacao sem chamadas de rede: `node --check` passou; sem token o script recusou antes da requisicao; com host publico e token dummy recusou antes da requisicao. ESLint dos dois clientes API, build e `git diff --check` passaram. Bundle principal ainda excede 500 kB.
- O script nao foi executado contra backend local porque o daemon Docker continua indisponivel; as rotas/gateway locais nao foram validadas em runtime. Nenhuma chamada externa, migration ou deploy foi feita; Gates 0/1 permanecem abertos.

## Redacao de chaves no owner svc-configuracoes - 27/11/2026

- A revisao dos owners estaticos encontrou que `svc-configuracoes` ainda devolvia `api_key` em listagem administrativa, detalhe, criacao e atualizacao de agentes, apesar de o fallback central ja ter sido corrigido. Todas essas respostas agora usam serializador que omite o segredo e retorna `configured`; rotas publicas e de agentes pessoais tambem permanecem sem valor da chave.
- `svc-configuracoes/tests/unit/test_agent_secret_responses.py` passou 1/1 com SQLite em memoria cobrindo listagem, detalhe, criacao e atualizacao. O teste central de autorizacao de agentes passou 3/3 anteriormente. Nao houve chamadas a provedores, conexao com banco compartilhado, migration ou deploy.
- A validacao cobre handlers locais dos dois owners conhecidos, nao determina o gateway ativo nem substitui teste runtime. Gate 0/1 permanecem abertos.

## Chave de IA redigida no POST de configuracao - 27/11/2026

- `svc-configuracoes` redigia a chave nos GETs e na configuracao por provider, mas `POST /k1/lex/configuracoes/ia` ainda retornava `_row(CfgIa)` com `api_key`. A resposta agora omite a chave e retorna `configured`, alinhada ao fallback central.
- Suite local combinada de redacao de agentes/configuracao e catalogo IA passou 4/4 com SQLite em memoria. Nao houve chamadas a provedores, conexao com banco compartilhado, migration ou deploy.
- A verificacao cobre a configuracao IA deste owner estatico; o gateway ativo ainda nao foi exercitado. Gate 0/1 continuam abertos.

## Credenciais de CDN e banco protegidas - 27/11/2026

- As rotas do `svc-configuracoes` para CDN e banco agora omitem chaves e strings de conexao das respostas, expondo somente indicadores `*_configured`. Valores secretos omitidos ou enviados em branco preservam o valor armazenado durante atualizacoes parciais.
- Os endpoints de ambiente do owner central e do `svc-configuracoes` deixaram de retornar usuario, senha mascarada e string completa. A tela administrativa exibe estado de configuracao e metadados do endpoint sem renderizar credenciais ou strings de conexao.
- Foram adicionados testes isolados em SQLite em memoria para verificar redacao e preservacao de credenciais. Nesta execucao, eles nao puderam ser executados porque o ambiente disponivel nao tem `pytest` e o Python virtual do repositorio aponta para uma instalacao ausente. ESLint do arquivo alterado tambem sinalizou erros preexistentes nessa tela (efeito com setState e `any` em outra secao); o build TypeScript/Vite passou. `git diff --check` passou nos dois repositorios.
- Nenhuma conexao a banco compartilhado, migration, chamada externa ou deploy foi feito. Gates 0/1 permanecem abertos.

## Antimalware no upload de arquivos - 27/11/2026

- `svc-arquivos` transmite o arquivo temporario a um `clamd` privado via protocolo INSTREAM antes de persistir bytes ou metadados. Somente veredito `OK` libera o upload; `FOUND` e bloqueado/auditado, e scanner indisponivel ou resposta desconhecida falha fechado com HTTP 503. O temporario e removido em ambos os casos.
- O cliente de protocolo possui testes unitarios com servidor TCP mockado. Host, porta e timeout foram incluidos nos tres Compose; host vazio mantem upload bloqueado. Nenhum scanner externo foi provisionado ou contactado.
- Provisionamento privado do daemon, limite de stream e atualizacao de assinaturas, politica aprovada de quarentena/retencao e revisao do responsavel de seguranca continuam pendentes. Nenhuma migration, banco compartilhado ou deploy; Gates 0/1 permanecem abertos.

## Allowlist de CORS nos servicos - 27/11/2026

- As aplicacoes FastAPI do backend que aceitavam qualquer origem agora carregam origens explicitas de `KEALEX_CORS_ALLOWED_ORIGINS` e falham na inicializacao se a lista contiver `*`. O Compose Hostinger deixou de definir wildcard como padrao e propaga a variavel aos 12 servicos roteados; `.env.example` documenta formato e configuracao obrigatoria.
- Verificacao estatica passou para 14 entrypoints CORS e 12 blocos de servico do Compose Hostinger: nenhum middleware usa wildcard literal e a variavel esta propagada. `tests/test_cors_policy.py` passou 2/2 com Python 3.13 e biblioteca padrao, cobrindo 28 casos de politica e os 12 blocos Compose. `docker compose --env-file .env.example -f docker-compose.hostinger.yml config --quiet` passou com placeholders; houve avisos esperados de segredos em branco, Docker config inacessivel e campo Compose `version` obsoleto.
- A origem de producao ainda precisa ser definida no ambiente operacional antes de qualquer deploy. O perfil ativo nao foi identificado e nenhuma configuracao foi aplicada em ambiente compartilhado. Sem teste de navegador/runtime, migration ou deploy; Gates 0/1 permanecem abertos.


### Reteste local da su?te de arquivos - 27/11/2026

- A su?te completa `svc-arquivos/tests` passou 29/29 no Python 3.12 do `.venv312`, a partir do diret?rio do servi?o. Inclui verifica??es de isolamento e auditoria em SQLite tempor?rio, contrato do modelo e scanner ClamAV mockado, inclusive resposta amb?gua `NOTFOUND` que falha fechado.
- A primeira tentativa de executar a su?te desde a raiz do monorepo importou o m?dulo `app` central; ela foi descartada e a execu??o foi repetida no diret?rio correto do servi?o.
- Sem scanner real, banco compartilhado, migration ou deploy. Provisionamento e pol?tica de quarentena/retencao continuam pendentes; Gates 0/1 permanecem abertos.


## Redacao de erro de startup do banco em svc-auth - 27/11/2026

- `svc-auth` imprimia texto da excecao e traceback na falha de inicializacao do banco. O log agora registra apenas a classe da excecao; o startup propaga mensagem generica sem cadeia visivel.
- `test_db_init_logging_privacy.py` valida com mensagem-sentinela que texto e traceback nao chegam ao log/erro. Testes unitarios combinados de svc-auth passaram 12/12 em Python 3.12, sem conexao: a criacao do schema foi mockada e a URL usada apenas para construir engine.
- Esta correcao trata somente esse caminho. A matriz completa de autorizacao, revisao de todos os contratos de erro e validacao de gateway seguem abertas; nenhuma migration/deploy ou banco compartilhado foi utilizado.


### Escopo complementar da busca por erros sensiveis - 27/11/2026

- `ATIVIDADES_ENDPOINTS.py` e `exemplo_servico_com_modal.py` ainda contem exemplos que interpolam excecoes em respostas, mas nao sao importados pelo app central; nao foram tratados como caminho de runtime.
- Os erros Google Drive inspecionados sao mensagens controladas sem corpo bruto de provider/token, embora os contratos completos ainda precisem de revisao. A redacao geral e a matriz de autorizacao permanecem incompletas; Gates 0/1 nao mudam.


## Cobertura de autorizacao em svc-clientes - 27/11/2026

- A nova suite de autorizacao usa JWTs de teste e SQLite em memoria para cobrir lista/pesquisa por tenant e advogado, acesso entre advogados, isolamento entre tenants, limite de admin, papeis negados e protecao contra `tenantId`/`advogadoId` adulterados na criacao.
- `tests/unit` passou 8/8 e `tests/integration` passou 2/2 em Python 3.12. O resultado cobre somente os handlers do servico testados; gateway efetivo, compatibilidade central e matriz cross-service continuam pendentes. Sem MySQL compartilhado, migration ou deploy; Gate 0 segue aberto.


## Acesso a cobrancas limitado a perfis internos - 27/11/2026

- A validacao encontrou que rotas de leitura, pagamento, pagador, timeline e mutacao aceitavam qualquer JWT ativo em `svc-cobrancas`; o fallback central tinha o mesmo problema. Ambos agora exigem `admin`, `escritorio`, `advogado` ou `juridico`; o webhook Asaas continua autenticado pelo token dedicado. A regra de cliente-negado segue ate associacao login-cliente verificada e politica de portal aprovadas.
- A suite de `svc-cobrancas` passou 21/21, incluindo request HTTP com papel cliente retornando 403 antes da consulta. Os testes centrais e contratos de gateway passaram 9/9 e verificam o binding do guard em todas as rotas centrais. Provedor Asaas mockado; sem banco compartilhado, migration ou deploy. Perfil ativo e gateway runtime seguem pendentes; Gate 0 aberto.
## Acesso a atividades limitado para clientes - 27/11/2026

- Os oito endpoints de `svc-activities` e os oito handlers do fallback central agora negam `role=cliente` com HTTP 403 enquanto nao existir associacao verificada entre login e cadastro de cliente. Os demais papeis mantem o comportamento anterior; esta alteracao nao aprova compartilhamento de escritorio nem escopo amplo de advogado, juridico ou admin.
- Validacao local: unitarios do servico 7/7, integracao 4/4 (inclui 403 antes da dependencia de banco) e contratos centrais 2/2. A politica global e a rota efetiva no gateway seguem pendentes. Sem migration, banco compartilhado ou deploy; Gate 0 aberto.

## Consulta processual DataJud bloqueada para clientes - 27/11/2026

- A auditoria identificou que `POST /v1/lex/usuarios/consultas/datajud` aceitava qualquer JWT, apesar de consultar dados processuais. `svc-usuarios` agora nega `role=cliente` atÃ© haver vÃ­nculo verificado entre identidade de login e cadastro de cliente; a guarda ocorre antes da dependÃªncia de banco da rota e do acesso ao provedor.
- Testes locais do serviÃ§o passaram: unitÃ¡rios 5/5 e integraÃ§Ã£o 3/3. Os demais papÃ©is preservam o comportamento existente, sem aprovaÃ§Ã£o ampla de escopo. Sem DataJud real, banco compartilhado, migration ou deploy; Gateway/runtime e Gate 0 seguem pendentes.

## AssociaÃ§Ã£o por cÃ³digo de escritÃ³rio isolada por tenant - 27/11/2026

- `POST /v1/lex/escritorios/associar-codigo` buscava escritÃ³rio ativo pelo cÃ³digo sem comparar o tenant do token, criando possibilidade de associar advogado de um tenant a escritÃ³rio de outro. Agora a busca e a contagem de quota filtram pelo mesmo `tenant_id`; a consulta final do escritÃ³rio no fluxo advogado tambÃ©m estÃ¡ tenant-scoped.
- RegressÃµes locais passaram: 4 unitÃ¡rios e 1 integraÃ§Ã£o do `svc-escritorios`. A regra evita a associaÃ§Ã£o cross-tenant detectada, mas nÃ£o prova o comportamento em MySQL/gateway; a polÃ­tica de listagem/detalhe para todos os papÃ©is segue para aprovaÃ§Ã£o. Sem migration ou deploy; Gate 0 aberto.

## Metadados de repositÃ³rios jurÃ­dicos indisponÃ­veis a clientes - 27/11/2026

- O owner `svc-repositorios` aceitava qualquer JWT nos endpoints de CRUD, listagem de arquivos, scan e upload. Agora os oito endpoints negam `role=cliente` atÃ© que haja vÃ­nculo de identidade verificado. Outros papÃ©is mantÃªm a regra tenant-scoped atual, ainda sem aprovaÃ§Ã£o de escopo ampliado.
- Testes locais passaram: 4 unitÃ¡rios e 2 de integraÃ§Ã£o, incluindo HTTP 403 antes da dependÃªncia de banco da rota. `aiofiles` estÃ¡ declarado no serviÃ§o, mas ausente do ambiente local; stub condicional de teste cobre apenas import e nÃ£o exerce I/O. Sem banco compartilhado, migration ou deploy; Gate 0 permanece aberto.

## Upload do repositÃ³rio legado com caminho opaco e limite - 27/11/2026

- O endpoint de upload em `svc-repositorios` usava o nome vindo do cliente como caminho fÃ­sico, lia todo o arquivo em memÃ³ria sem limite e nÃ£o persistia hash. Agora usa UUID opaco sob o storage resolvido, transmite em blocos, aplica limite padrÃ£o de 100 MiB, rejeita vazio, remove bytes parciais em erro/excesso e registra tamanho e SHA-256.
- `svc-repositorios` passou 7/7 unitÃ¡rios e 2/2 de integraÃ§Ã£o com diretÃ³rio temporÃ¡rio. `aiofiles` estÃ¡ declarado mas ausente no ambiente; o teste de upload substitui seu writer e nÃ£o comprova runtime da biblioteca, gateway, antivÃ­rus ou storage operacional. Sem banco compartilhado, migration ou deploy; Gate 0 aberto.

### Verificacao adicional do upload legado - 27/11/2026

- A validacao do `svc-repositorios` passou a cobrir tambem falha no commit: os bytes temporarios sao removidos e o rollback e solicitado; uma falha posterior apenas no refresh nao remove arquivo ja confirmado.
- Contagem revisada: 8/8 testes unitarios e 2/2 de integracao. Writer de teste local; `aiofiles` real ainda nao instalado no ambiente.

### Alcance nÃ£o confirmado do upload legado de repositÃ³rios - 27/11/2026

- `svc-repositorios` tem uma rota prÃ³pria de upload alÃ©m do storage canÃ´nico `svc-arquivos`. A revisÃ£o estÃ¡tica nÃ£o encontrou consumidor frontend, fallback central, serviÃ§o nos Compose inspecionados ou upstream/location Nginx; isso nÃ£o exclui perfis externos.
- O upload legado foi endurecido para nome opaco, limite e hash, mas nÃ£o tem antivÃ­rus. Owner e reachability precisam ser confirmados no Gate 0 antes de ligar/retirar a rota ou duplicar controles de deployment. Sem roteamento, migration ou deploy.

### Antimalware fail-closed no upload legado - 27/11/2026

- O upload do `svc-repositorios` agora sÃ³ grava metadata apÃ³s veredito `OK` do ClamAV `clamd`. DetecÃ§Ã£o remove o staged e retorna 422; host vazio/timeout/resposta inconclusiva retorna 503 e remove o staged. Usa as mesmas variÃ¡veis `KEALEX_CLAMD_*` do serviÃ§o canÃ´nico.
- Testes locais passaram: 14 unitÃ¡rios e 2 integraÃ§Ã£o, incluindo protocolo TCP simulado para `OK`, `FOUND`, `NOTFOUND` e erro. O host continua vazio por padrÃ£o; nÃ£o hÃ¡ daemon provisionado nem reachability confirmada para este serviÃ§o. Sem migration ou deploy; Gate 0 aberto.

## Retorno OAuth do Google sem persistir segredo no navegador - 27/11/2026

- O fluxo de geraÃ§Ã£o de refresh token para upload ao Drive deixou de gravar `client_secret` em `sessionStorage`. A pÃ¡gina mantÃ©m as credenciais apenas em referÃªncias de memÃ³ria enquanto abre um popup para OAuth; o cÃ³digo/state retornam via `postMessage`, validando origem e janela de origem antes de chamar o contrato de conclusÃ£o jÃ¡ existente.
- O callback remove cÃ³digo e state da URL do popup antes de enviar a mensagem. Cancelamento, popup bloqueado/fechado, erro de inÃ­cio e desmontagem limpam a referÃªncia temporÃ¡ria. Um guard evita processar o callback duas vezes em React Strict Mode.
- `npm.cmd run build` passou apÃ³s a alteraÃ§Ã£o (TypeScript e Vite); bundle principal continua acima de 500 kB. E2E com Google real ou sandbox nÃ£o foi executado. A interface ainda precisa do client secret fornecido pelo operador e o mantÃ©m em memÃ³ria durante a configuraÃ§Ã£o; XSS continua podendo ler valores enquanto a pÃ¡gina estÃ¡ ativa. A revisÃ£o ampla de sessÃ£o/token segue pendente; sem credenciais reais, migration ou deploy.

## ReduÃ§Ã£o de cÃ³pias persistidas do JWT - 27/11/2026

- `kealex_user` passa a persistir apenas o perfil; o `accessToken` permanece uma Ãºnica vez na chave `kealex_token`. Na restauraÃ§Ã£o, sessÃµes antigas cujo perfil serializado ainda inclui o token sÃ£o regravadas sem essa cÃ³pia, e o contexto recupera o token da chave jÃ¡ existente para preservar o contrato da aplicaÃ§Ã£o.
- O JWT continua em `localStorage`; esta mudanÃ§a reduz duplicaÃ§Ã£o e nÃ£o impede exfiltraÃ§Ã£o por XSS. MigraÃ§Ã£o para cookie `HttpOnly`/`SameSite` requer contrato coordenado entre `svc-auth`, serviÃ§os, gateway, CORS e proteÃ§Ã£o CSRF, ainda sem desenho/validaÃ§Ã£o aprovados. Build local Ã© a validaÃ§Ã£o tÃ©cnica; nÃ£o fecha Gate 1.
- ValidaÃ§Ã£o adicional de autenticaÃ§Ã£o: `node_modules/.bin/eslint.cmd src/context/AuthContext.tsx src/context/useAuth.ts src/context/auth-context.ts` passou depois de separar o hook `useAuth` do provider. A compilaÃ§Ã£o TypeScript e o build Vite tambÃ©m passaram com os imports atualizados. O JWT continua em `localStorage`; Gate 1 permanece aberto.

## ReconciliaÃ§Ã£o e repetiÃ§Ã£o do cadastro documental â€” 27/11/2026

- `DocumentosPage` consulta os metadados do processo antes de repetir a criaÃ§Ã£o e, em falha ambÃ­gua, tenta confirmar o vÃ­nculo. Se nÃ£o consegue confirmar, preserva os bytes e a chave de idempotÃªncia do upload para retomada; nÃ£o apaga um arquivo que pode estar referenciado por metadados jÃ¡ commitados.
- `svc-documentos` retorna os metadados existentes quando recebe novamente a mesma referÃªncia privada para o mesmo tenant, usuÃ¡rio e processo. A validaÃ§Ã£o de posse do arquivo e do processo ocorre antes da reconciliaÃ§Ã£o. Teste local de repetiÃ§Ã£o e suÃ­te completa do serviÃ§o passaram: 24/24 com unittest e SQLite/mocks em memÃ³ria.
- A consulta seguida de insert ainda nÃ£o impede duplicidade em requisiÃ§Ãµes concorrentes; garantia transacional exigiria estratÃ©gia de unicidade/backfill e migration revisada. `pytest` nÃ£o estÃ¡ instalado no ambiente, por isso a validaÃ§Ã£o foi feita via `unittest`. Sem migration aplicada, banco compartilhado ou deploy; Gate 1 continua aberto para ensaio MySQL isolado, concorrÃªncia e fluxo E2E.

- ConcorrÃªncia do cadastro documental: `svc-documentos` agora tem Ã­ndice Ãºnico tenant/uploader/processo/arquivo, alimentado pelo UUID canÃ´nico do storage. O SQL correspondente Ã© versionado e tem preflight de duplicatas, mas estÃ¡ pendente de ensaio isolado MySQL; o teste SQLite confirma a constraint ORM, nÃ£o o DDL do MySQL. Gates 0/1 permanecem abertos.
- O fallback central de documentos foi alinhado ao `svc-documentos`: grava `uploadado_por_id` e UUID do arquivo, e trata conflito da mesma constraint. Testes SQLite locais passaram 12/12 no central e 24/24 no serviÃ§o. O preflight detectou divergÃªncia histÃ³rica de modelo: se `documentos.uploadado_por_id` nÃ£o existir, a variante de migration deve preceder a migration de idempotÃªncia; ambas seguem sem aplicaÃ§Ã£o. Gate 0/1 continuam abertos.

- ExclusÃ£o documental recuperÃ¡vel: o delete de bytes em `svc-arquivos` Ã© repetÃ­vel para arquivo jÃ¡ tombstonado; `documentosApi.remove` agora confirma por leitura quando a resposta da exclusÃ£o dos metadados Ã© ambÃ­gua e considera concluÃ­do se o registro jÃ¡ nÃ£o existe. `npm.cmd run build` passou (TypeScript/Vite). NÃ£o houve E2E no gateway nem chamadas a banco compartilhado; Gate 1 segue aberto.

- Privacidade de logs dos webhooks Asaas: removidos IDs de evento/assinatura, tenant, cobranÃ§a e external references das mensagens no fallback central e em `svc-cobrancas`; persistÃªncia de eventos/auditoria nÃ£o foi alterada. `svc-cobrancas` passou 23/23 testes, incluindo teste runtime de evento duplicado e inspeÃ§Ã£o estÃ¡tica dos dois owners; billing central passou 9/9. Nenhuma chamada Asaas foi feita; Gate 1 segue aberto.

- URLs legadas fictÃ­cias: o padrÃ£o confirmado pela auditoria (`https://cdn.kealex.com.br/docs/<nome>`) agora Ã© classificado como indisponÃ­vel. A listagem nÃ£o oferece download/abertura e oculta o tamanho antigo, que vinha da seleÃ§Ã£o local sem bytes persistidos. `npm.cmd run build` passou; o estado Ã© derivado da URL e nÃ£o altera metadados. Outras variantes legadas precisam ser inventariadas no ensaio de schema antes de uma migration de estado. Nenhuma migration ou deploy foi executado; Gate 1 segue aberto.

## Redacao de credencial de fonte Google Drive e consulta de configuracao DB - 27/11/2026

- `svc-configuracoes` retornava a coluna `drive_sources.service_account` nos handlers de criar, listar e atualizar fonte. As tres respostas agora omitem o JSON da service account e expoem somente `service_account_configured`; a credencial continua persistida para uso interno da sincronizacao.
- A rota administrativa `/k1/lex/configuracoes/database/env` referenciava `KEALEX_DATABASE_URL` sem importa-la, causando `NameError`; a dependencia de configuracao agora esta importada e o teste existente verifica que usuario/senha nao aparecem na resposta.
- Regressao local em Python 3.12: `svc-configuracoes` passou 8/8 testes, incluindo o novo teste de segredo Drive com SQLite em memoria e mock do cliente Google. `py_compile` tambem passou nos arquivos alterados. Nenhum servico Google foi chamado; sem migration, banco compartilhado ou deploy. Gates 0/1 permanecem abertos.

## Autorizacao de contexto e metadados Google Drive - 27/11/2026

- A listagem de arquivos indexados aceitava qualquer JWT e retornava `conteudo` integral; agora exige `admin`, permanece limitada ao tenant e remove o campo de conteudo da resposta.
- O endpoint de contexto de agente agora verifica visibilidade/posse no tenant: admin pode acessar agente privado; demais usuarios precisam ser proprietarios do agente privado ou consultar agente publico. A regra segue o acesso ja usado na consulta de agentes.
- Testes HTTP com SQLite em memoria cobrem 403 para outro advogado em agente privado, acesso do proprietario/admin, bloqueio da listagem para nao-admin e ausencia de `conteudo`. A suite completa de `svc-configuracoes` passou 10/10 em Python 3.12. Sem Google real, migration, banco compartilhado ou deploy; Gates 0/1 permanecem abertos.

## Escopo do cliente na resposta de processo - 27/11/2026

- As rotas de processo escopavam corretamente o processo, mas o enriquecimento buscava o cliente apenas por ID. Como `processos.cliente_id` nao tem integridade referencial no modelo compartilhado, um vinculo legado inconsistente podia expor nome/e-mail de outra pessoa/tenant.
- Lista, detalhe e atualizacao agora resolvem o cliente no mesmo tenant do processo e, para advogado, no mesmo `advogado_id` do solicitante. Vinculo sem correspondencia retorna o processo com campos de cliente vazios. Nenhum schema foi alterado.
- A regressao SQLite cobre IDs ligados a outro tenant e a outro advogado; o svc-processos passou 12/12 testes locais e `py_compile` passou. Nenhum banco compartilhado, migration ou deploy foi utilizado; Gate 0/1 permanecem abertos.

## Criacao transacional de processo - 27/11/2026

- A criacao usava um identificador de variavel inexistente ao persistir o vinculo cliente-processo, gerando HTTP 500 antes da resposta. Corrigido para usar o UUID criado para o processo.
- Processo, vinculos de clientes e fases padrao agora sao gravados em um unico commit; falha no commit executa rollback do conjunto. A regressao prova um unico commit no sucesso e ausencia de processo/vinculo/fases apos falha simulada no SQLite.
- `svc-processos` passou 14/14 testes locais e `py_compile` passou. Nenhum schema, migration, banco compartilhado ou deploy foi alterado; Gates 0/1 permanecem abertos.

## Isolamento do cliente no fallback central de processos - 27/11/2026

- O fallback central mantinha os dados de `Cliente` fora do tenant ao enriquecer lista, detalhe e atualizacao de processo. Agora filtra cliente pelo tenant do processo; para advogado/juridico tambem verifica o advogado responsavel. Referencias inconsistentes deixam nome/e-mail ausentes.
- Regressao central com SQLite cobre clientes vinculados a outro tenant e a outro advogado; `test_central_process_authorization.py` passou 4/4; lista, detalhe e atualizacao exercitam o serializer real com claims; `py_compile` passou nos arquivos alterados. Sem schema, migration, banco compartilhado ou deploy; Gates 0/1 permanecem abertos.

## Protecao da chave PIX e CSP de imagens - 27/11/2026

- O fallback do QR PIX enviava a chave de pagamento como parametro para um gerador externo. O QR agora e renderizado localmente com `bwip-js`, dependencia que ja existia no frontend. Se a codificacao local falhar, a tela informa que o QR esta indisponivel e conserva a chave copiavel, sem requisicao externa.
- A diretiva `img-src` da CSP foi limitada a `'self'`, `data:` e `blob:`; a imagem PIX devolvida pelo provedor continua suportada como data URL.
- Build TypeScript/Vite passou (npm.cmd run build); Vite emitiu apenas o aviso ja conhecido de chunk principal acima de 500 kB. Sem chamadas ao provedor, migration, banco compartilhado ou deploy; Gates 0/1 permanecem abertos.

## CSP: restringir base, plugins e formularios - 27/11/2026

- A politica CSP agora define `base-uri 'self'`, `object-src 'none'` e `form-action 'self'`. A busca estatica nao encontrou `<base>`, `<object>`, `<embed>` nem formulario HTML submetido para origem externa; checkout usa navegacao para URL validada pelo cliente.
- `npm.cmd run build` passou; Vite manteve o aviso do bundle principal acima de 500 kB. O comportamento efetivo continua sem verificacao no navegador e depende de header CSP no host; `style-src 'unsafe-inline'` permanece por compatibilidade. Esta defesa adicional nao aprova Gate 1.

## Evidencia de vinculo login-cliente ausente - 27/11/2026

- Inspecao local de `svc-auth`: `Usuario` nao declara `cliente_id`; o JWT em `create_access_token` contem `sub`, `role`, `tenant_id` e `escritorio_id`, sem identificador de cliente. O modelo `Cliente` declara `advogado_id`, mas nao `user_id`/`usuario_id`. Login seleciona a conta por e-mail; cadastro rejeita e-mail ja existente, o que nao cria nem verifica associacao cliente-cadastro.
- Portanto, nao existe vinculo explicito que autorize liberar processos/documentos a um usuario `cliente`. Nenhuma correlacao por e-mail ou CPF deve ser inferida. Permanecem bloqueados por decisao de produto/seguranca: modelo de associacao, fluxo verificavel de convite/aceite, tratamento de clientes com multiplos representantes e testes cross-tenant/cross-cliente. Nenhuma migration ou politica de acesso foi criada nesta verificacao; Gate 0/1 seguem abertos.

## Lacuna de recuperacao de upload apos falha ambigua - 27/11/2026

- Revisao de `DocumentosPage.onSubmit`: a chave de idempotencia e mantida em um unico estado React associado ao objeto `File` selecionado e ao processo. Se a resposta do upload for perdida apos o servidor persistir bytes/metadados, a repeticao com o mesmo objeto reutiliza a chave e pode recuperar a resposta. Se, antes da repeticao, o usuario trocar arquivo/processo, a proxima tentativa substitui essa chave; reabrir o seletor tambem cria outro objeto `File`, sem correspondencia com o estado anterior.
- `DocumentosPage` agora tenta reconciliar um arquivo sem metadado antes de novo upload: lista arquivos do processo no owner scope existente, compara nome/tamanho/SHA-256 local e reutiliza somente um arquivo ainda sem vinculo documental. A comparacao usa Web Crypto sobre `File.arrayBuffer()` apenas quando a listagem encontra candidato com mesmo nome e tamanho; se Web Crypto nao estiver disponivel, a tela mantem a repeticao com Idempotency-Key. Respostas 401/403 da listagem interrompem o fluxo; falhas restantes usam o caminho de upload existente.
- `npm.cmd run build` e ESLint dos dois arquivos alterados passaram; Vite manteve o aviso do bundle principal acima de 500 kB. A leitura SHA-256 completa pode alocar ate o limite de upload em memoria do navegador, mas so ocorre quando ha candidato com mesmo nome/tamanho. Teste de navegador, perda real da resposta apos commit e gateway ativo continuam pendentes. Como a listagem pode falhar e a reconciliacao e frontend-only, Gate 1 permanece aberto para E2E isolado e confirmacao do endpoint em runtime. Nenhuma migration, gateway, banco compartilhado ou deploy foi alterado.

## Validacao de lint da trilha frontend - 27/11/2026

- Uma execucao global (`npm.cmd run lint`) falhou antes da correcao do PixQrCode com 150 erros e 6 avisos em multiplos arquivos. Apos essa correcao, o lint direcionado a `DocumentosPage.tsx` e `api/documentos.ts` passou.
- O lint direcionado encontrou `react-hooks/set-state-in-effect` no `PixQrCode` desta trilha. O componente foi ajustado para atualizar canvas/fallback diretamente por refs no efeito; essa ocorrencia foi removida. Tambem foram corrigidos os `any`, a expressao sem uso e a dependencia ausente encontrados em `AssinaturaModal.tsx`. O lint direcionado ainda aponta dois efeitos legados que sincronizam `billingStatus`/`billingProfile` com estado do formulario; permanecem para refatoracao sem alterar o comportamento de preenchimento/selecionamento.
- `npm.cmd run build` passou apos os ajustes; lint direcionado de `DocumentosPage.tsx` e `api/documentos.ts` passou. O lint global e os dois efeitos restantes continuam pendentes; nenhum gate foi aprovado por esta validacao.

## Limpeza fail-closed da sessao restaurada - 27/11/2026

- `restoreSession` agora remove tanto `kealex_token` quanto `kealex_user` quando falta qualquer parte do par, o JWT expirou, o JSON do perfil e invalido, ou o perfil nao tem ID. Isso impede que o interceptor continue anexando um token orfao enquanto a interface considera a sessao ausente.
- Login limpa o estado anterior e grava perfil antes do token; se a persistencia falhar, remove ambos, limpa o usuario em memoria e propaga o erro. Logout tambem limpa o estado em memoria mesmo quando o storage nao esta disponivel.
- `node_modules/.bin/eslint.cmd src/context/AuthContext.tsx` e `npm.cmd run build` passaram. Sem teste de navegador/storage bloqueado, backend de revogacao ou migration; JWT permanece legivel por script em `localStorage`, portanto Gate 1 segue aberto.

- A verificacao por foco/intervalo tambem encerra a sessao em memoria quando o token some na mesma aba ou o acesso ao storage falha; antes, so o token expirado acionava logout. ESLint direcionado a `AuthContext.tsx` e build Vite passaram apos essa cobertura. A sessao ainda nao usa cookie HttpOnly e nao tem revogacao server-side.

## Acesso ao token centralizado - 27/11/2026

- O utilitario `authSessionStorage.ts` agora e a fonte comum de leitura segura, gravacao e limpeza das chaves de sessao. `AuthContext` e os interceptors Axios usam a mesma implementacao; limpeza tenta remover cada chave mesmo se a operacao anterior falhar, e leitura indisponivel retorna ausencia de token.
- ESLint direcionado a `authSessionStorage.ts`, `AuthContext.tsx` e `client.ts`, mais `npm.cmd run build`, passaram. Isso reduz divergencia local de tratamento, mas nao muda o armazenamento script-readable em `localStorage`, nao adiciona revogacao server-side e nao substitui o desenho coordenado de cookie HttpOnly/CSRF. Gates 0/1 seguem abertos.

## CSP por ambiente para API e HMR - 27/11/2026

- A CSP base deixou de conter origins loopback e a origem fixa Hostinger. O plugin do Vite injeta a origem de `KEALEX_API_BASE_URL` tanto no HTML de build quanto no HTML servido em desenvolvimento; no modo development, libera tambem `ws://localhost:5173` para HMR e o ajuste de script inline ja existente. Assim, a CSP compilada para producao nao herda permissoes de localhost.
- `npm.cmd run build` e ESLint de `vite.config.ts` passaram. Inspecao automatizada do `dist/index.html` confirmou ausencia de `localhost`/`127.0.0.1` e presenca da origem configurada. A invocacao isolada do transform de desenvolvimento confirmou API origin, HMR e script permitido. Headers do host e enforcement real em browser continuam pendentes; nao fecha Gate 1.

- `node --test scripts/auth-session-storage.test.mjs` passou 3/3 casos (leitura/gravação, leitura indisponível e limpeza parcial); ESLint do utilitário e do teste passou. A cobertura exercita o helper com storage simulado, nao o provider React nem comportamento de navegador real.

## Restauracao de sessao validada por casos isolados - 27/11/2026

- A validacao do JWT, a persistencia sem token duplicado no perfil e a restauracao/limpeza fail-closed foram centralizadas em `authSessionStorage.ts`, compartilhadas pelo provider React. Um perfil legado com token duplicado e migrado localmente para o formato sem JWT.
- `node --test scripts/auth-session-storage.test.mjs` passou 8/8 casos: leitura/gravação, indisponibilidade do storage, limpeza parcial, sessão válida e migração legada, JWT expirado, JSON corrompido, perfil sem ID e token órfão. ESLint direcionado aos arquivos alterados passou; `npm.cmd run build` passou com aviso de bundle principal acima de 500 kB.
- A cobertura simula `localStorage` e não monta o provider nem executa navegador real. O armazenamento continua em `localStorage`, sem revogação server-side; Gate 1 permanece aberto. Nenhuma migration, banco compartilhado ou deploy foi executado.

## Eventos frontend e backend sem conteúdo sensível - 27/11/2026

- O logger frontend passou a aceitar somente eventos allowlisted e a métrica numérica `messageCount`; valores arbitrários em evento, texto de documento, PII ou JWT não chegam ao console. Os chamadores foram migrados para os códigos de evento fixos.
- Testes Node do logger e da sessão passaram 10/10; ESLint direcionado do logger, chamadores sem erros preexistentes, ErrorBoundary e testes passou. Build TypeScript/Vite passou, mantendo o aviso do bundle acima de 500 kB.
- No backend, `svc-activities/tests/unit/test_logging_privacy.py` passou 2/2; `svc-arquivos/tests/test_tenant_isolation.py` passou 22/22; `svc-documentos/tests/unit/test_document_scope.py` passou 15/15 via `unittest`, usando SQLite temporário e sem Docker. A cobertura verifica que corpos request/response não são logados, isolamento por tenant/usuário, rejeição de uploads inválidos, falhas seguras do scanner, vínculo de metadados ao arquivo privado e negação de associação cliente não verificada.
- Estes testes unitários não validam Compose/gateway ativo, banco de produção, daemon ClamAV real, storage implantado, navegador ou revogação server-side. Gate 0 e Gate 1 continuam abertos; nenhuma migration ou implantação foi executada.

## Autorizacao de clientes e processos - testes isolados - 27/11/2026

- `svc-processos/tests/unit/test_process_client_authorization.py` passou 3/3 testes: login `cliente` sem política de associação não lista nem lê processo; advogado acessa apenas processos próprios; enriquecimento de dados de cliente respeita tenant e advogado.
- `svc-clientes/tests/unit/test_client_authorization.py` passou 5/5 testes: advogado restrito a clientes atribuídos, admin restrito ao tenant, criação deriva tenant/advogado do token e roles não autorizadas são negadas.
- Os testes comprovam negação/escopo, não o fluxo positivo de convite, aceite ou múltiplos representantes. Não há associação verificável cliente-login implementada; Gate 1 permanece aberto e nenhuma migration foi criada ou aplicada.

## Redacao do caminho nas rotas de atividades - 27/11/2026

- O middleware `svc-activities` agora registra apenas o prefixo canônico (`/k1/lex/activities`, `/v1/lex/activities` ou aliases), nunca o sufixo da URL que pode conter identificadores. O teste de privacidade usa um número CNJ fictício no caminho e confirma que apenas o prefixo é registrado; também mantém a verificação de query string e corpos request/response.
- `svc-activities/tests/unit/test_logging_privacy.py` passou 2/2 após a mudança. A verificação é unitária e não substitui inspeção de logs no ambiente implantado; Gate 1 permanece aberto.

## Links documentais legados e navegação externa - 27/11/2026

- A regra de URL externa foi isolada em `src/utils/documentUrls.ts`. Qualquer URL no host legado `cdn.kealex.com.br` agora aparece como arquivo indisponível, pois esse host foi usado pelo antigo fluxo que simulava upload; URLs com esquema diferente de HTTP(S) ou credenciais embutidas também são recusadas. Links HTTP(S) sem credenciais seguem suportados.
- `node --test scripts/document-urls.test.mjs scripts/logger-privacy.test.mjs scripts/auth-session-storage.test.mjs` passou 13/13; ESLint de `DocumentosPage`, utilitário e teste passou; `npm.cmd run build` passou com aviso do bundle acima de 500 kB.
- O middleware de atividades registra apenas prefixo de rota e seu teste passou 2/2 com CNJ fictício no sufixo, query string e corpos sensíveis. A validação ainda é unitária, sem inspeção do serviço implantado; Gate 1 permanece aberto.

## Validacao frontend de tamanho e estado de arquivo - 27/11/2026

- `validateDocumentUpload` agora rejeita extensoes nao permitidas, arquivo vazio, limite ausente/invalido e tamanho acima do limite antes de iniciar o upload. O backend continua validando limite, assinatura e estrutura do conteúdo como autoridade final.
- `node --test scripts/document-upload-validation.test.mjs scripts/document-urls.test.mjs scripts/logger-privacy.test.mjs scripts/auth-session-storage.test.mjs` passou 16/16; ESLint direcionado da pagina, utilitarios e teste passou; `npm.cmd run build` passou, com aviso do bundle acima de 500 kB.
- `docker info` confirmou que o daemon local nao esta disponivel (pipe `docker_engine` ausente), portanto o Compose de rehearsal nao foi iniciado. Nao foi conectado banco; Gate 0/1 seguem abertos e nenhuma migration/deploy ocorreu.

## Sanitizacao de links no Markdown - 27/11/2026

- O DOMPurify mantem somente tags de apresentacao do renderer e atributos `class`/`href`; `target`, `rel`, estilos, atributos de evento e data attributes nao sao aceitos. Links Markdown abrem na aba atual, impedindo que conteúdo remoto controle a relacao de opener da janela.
- `node --test scripts/markdown-sanitize-policy.test.mjs` e a bateria frontend focada passaram (18/18); ESLint do renderer/politica/teste e `npm.cmd run build` passaram, com o aviso existente de bundle >500 kB.
- Os testes verificam a allowlist configurada, nao executam o DOMPurify em browser real nem cobrem todos os vetores de XSS; a inspeção/browser E2E segue necessária para Gate 1.

## Verificacao DOMPurify em navegador headless - 27/11/2026

- Com Chrome headless local, sem servidor da aplicacao e sem acesso de rede, foi aplicada a politica compilada de `markdownSanitizePolicy.ts` a um payload com `<script>`, SVG `onload`, imagem `onerror`, `javascript:` e `target=_blank rel=opener`.
- O DOM resultante nao continha script, SVG, imagem, atributos de evento, href ativo, target ou rel; o texto visivel do link foi preservado. O comando terminou com assertions aprovadas.
- A execucao valida a politica DOMPurify no Chrome instalado, mas nao monta o React `MarkdownRenderer`, nao cobre todos os vetores HTML/XSS nem substitui E2E. Gate 1 continua aberto.

## Access logs e loggers de infraestrutura - 27/11/2026

- Os 15 Dockerfiles que executam Uvicorn agora usam `--no-access-log`, evitando registrar IP, path completo ou query string por padrão. O Nginx do gateway registra apenas método, status, bytes e duração; não inclui IP, URI, argumentos, user-agent ou headers. O `error_log` foi limitado a `crit` porque mensagens de erro de proxy podem carregar a linha de requisição; falhas HTTP continuam observáveis no status/duração do access log, com menos detalhe de diagnóstico.
- Monólito, `svc-cobrancas` e `svc-processos` configuram `sqlalchemy.engine`, `httpx`, `httpcore`, `requests` e `urllib3` em `WARNING`, evitando SQL com parâmetros e URLs de chamadas externas; logs de aplicação seguem em INFO (processos mantém DEBUG opcional para diagnósticos explícitos, com esses loggers protegidos).
- O contrato estático passou 3/3: todos os comandos Uvicorn, allowlist de campos Nginx e níveis de log. Também passaram 2/2 testes do middleware de atividades, 2/2 testes de privacidade de webhook e 5/5 testes de processo/autorização/transação; AST Python passou para os arquivos de configuração.
- Não há Docker daemon nem binário Nginx nesta sessão; imagens e sintaxe efetiva do proxy não foram validadas por build/runtime. Perfis ativos e logs implantados seguem sem verificação; Gate 0/1 permanece aberto. Nenhuma migration ou deploy foi executado.

## Reexecucao da trilha de arquivos e metadados - 27/11/2026

- No Python 3.13 disponivel, `svc-arquivos` passou 29/29 testes, cobrindo isolamento por tenant/usuario, validacao de conteudo DOCX, idempotencia, falhas de persistencia, auditoria e respostas do scanner ClamAV simulado. A suite completa de `svc-documentos` passou 28/28 testes, incluindo escopo de metadados, contrato estatico da migration e paridade de tipo/charset/collation ORM, validacao de schemas, health/registro de rotas e OAuth/Google Drive com mocks.
- As suites usam banco SQLite e armazenamento temporario nos testes de fluxo; o scanner usa servidor local simulado. O teste de integracao de documentos verifica health/rotas com inicializacao de banco mockada; nao valida migration MySQL, Nginx/gateway ativo, daemon ClamAV real, persistencia multi-host ou browser E2E.
- A verificacao melhora a evidencia local de isolamento e upload, mas nao fecha os Gates 0/1. Nenhuma migration, banco compartilhado ou deploy foi usado.

## Validacao de checkout hospedado Asaas - 27/11/2026

- Checkout recorrente e pagamento avulso agora usam o mesmo validador de destino: HTTPS, host `asaas.com` ou subdominio proprio, sem credenciais embutidas nem porta nao padrao. Hosts parecidos e esquemas inseguros sao rejeitados antes do redirect.
- A falha do pagamento avulso agora mostra mensagem fixa, sem exibir detalhe bruto da resposta do servidor/provedor.
- `node --test scripts/asaas-checkout-url.test.mjs scripts/auth-session-storage.test.mjs scripts/document-upload-validation.test.mjs scripts/document-urls.test.mjs scripts/logger-privacy.test.mjs scripts/markdown-sanitize-policy.test.mjs` passou 20/20; ESLint direcionado passou; `npm.cmd run build` passou com o aviso existente de bundle principal acima de 500 kB. Nenhuma chamada ao Asaas foi feita.
- Isto reduz risco de redirecionamento e exposicao de erro, mas nao substitui a verificacao de retorno/webhook em sandbox nem a revisao PCI. Gates 0/1 seguem abertos.

## Identificadores de consulta FiscalAPI fora dos logs - 27/11/2026

- A revisão de chamadas de logging encontrou `row.id` nos avisos de falha da FiscalAPI, tanto no handler monolítico quanto em `svc-integracoes`. O identificador continua disponível na resposta de erro ao próprio solicitante, mas foi retirado da telemetria.
- O contrato estático de privacidade passou 4/4, incluindo a ausência de `request_id`/`row.id` na linha de log de ambos os handlers. Os 2 testes de privacidade do middleware de atividades passaram novamente e AST Python dos handlers/teste passou.
- A inspeção foi estática/unitária e não confirmou configuração de log no ambiente implantado. Gate 0/1 segue aberto; nenhuma migration ou implantação foi executada.

## Referências documentais restritas ao storage privado - 27/11/2026

- A tela de documentos deixou de abrir URLs externas: somente referências no formato do endpoint autenticado `/v1/lex/arquivos/<uuid>` são tratadas como disponíveis. O helper de validação agora é compartilhado pelo frontend e pelo cliente API, evitando que a listagem considere disponível uma URL que o download não reconhece.
- `node --test scripts/document-urls.test.mjs` passou 2/2; ESLint direcionado e build de produção passaram. Registros legados externos permanecem visíveis como indisponíveis até migração/validação segura; não há tentativa de buscar seu conteúdo em host público. Gateway, storage em runtime e browser E2E continuam pendentes; Gate 1 permanece aberto. Nenhuma migration, banco compartilhado ou deploy foi executado.

## Falha do scanner comunicada corretamente no upload - 27/11/2026

- `DocumentosPage` agora traduz o HTTP 503 do scanner antimalware para uma mensagem fixa que informa indisponibilidade e orienta nova tentativa; os status 413 e 415 também têm mensagens próprias. Detalhes brutos da resposta não são exibidos.
- `node --test scripts/document-upload-validation.test.mjs` passou 4/4 e ESLint direcionado passou. No backend, `svc-arquivos` passou 28/28 testes locais de isolamento e protocolo do scanner no `.venv` do projeto. O scanner continua sem host padrão (`KEALEX_CLAMD_HOST` vazio nos Compose), portanto upload deve falhar fechado até existir daemon configurado; isso não comprova disponibilidade operacional. Gate 0/1 continuam abertos; nenhuma migration, banco compartilhado ou deploy foi executado.

## Token temporário do checkout isolado à aba - 27/11/2026

- O token de pré-cadastro do checkout Asaas deixou de ser persistido em `localStorage`; o fluxo de redirect/retorno da mesma aba usa `sessionStorage`, com leitura tolerante a storage indisponível e limpeza explícita após ativação/logout. A gravação falha antes do redirect se o navegador não puder armazenar o token necessário à consulta do retorno.
- `node --test scripts/checkout-token-storage.test.mjs` passou 2/2 e ESLint direcionado passou. O token ainda é acessível a scripts enquanto a aba existe, e o backend precisa restringir a claim `pre` exclusivamente às rotas de faturamento antes de considerar a proteção completa. Gate 1 continua aberto; nenhuma migration, banco compartilhado ou deploy foi executado.

## Escopo do token pré-cadastro - 27/11/2026

- A claim `pre=true` agora é rejeitada por todos os validadores JWT gerais do backend (API central, serviços e serviço de arquivos). No `svc-auth` e no fallback central, dependências específicas aceitam o token apenas em criar cliente Asaas, assinar checkout e consultar billing-status.
- `tests/test_preregister_token_scope_contract.py` passou 4/4; os testes de `svc-auth` para escopo do token, checkout e trial passaram 7/7. A checagem estática inclui os owners JWT; a validação não substitui runtime de cada serviço nem o gateway efetivo.
- No frontend, o token de checkout passou a usar `sessionStorage` e tem 2/2 testes. Ele ainda é legível por scripts durante a aba aberta. Nenhuma migration, acesso a banco compartilhado, chamada ao Asaas ou deploy foi executado. Gates 0/1 permanecem abertos.

## Exercício runtime dos validadores de token pré-cadastro - 27/11/2026

- Complemento da evidência de escopo: `tests/test_preregister_token_scope_contract.py` agora importa isoladamente os 15 owners JWT e chama cada validador com um token `pre=true` e sessão de banco falsa. Os 15 casos retornaram HTTP 403 antes de acesso ao banco; a suíte passou 5/5 métodos de teste, incluindo as verificações de rota/escopo.
- A prova cobre os guards do código em processo, não roteamento via gateway, container implantado ou conectividade real do banco. As três rotas de checkout permitidas permanecem verificadas por contrato e por teste direto no central/`svc-auth`. Gate 0/1 segue aberto; sem migration, banco compartilhado, chamada ao Asaas ou deploy.
