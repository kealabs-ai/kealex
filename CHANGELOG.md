# Notas de versão

Este arquivo registra as alterações de cada versão do Kealex Frontend. As versões seguem o padrão SemVer (`MAJOR.MINOR.PATCH`).

## V. 1.3.0 — 29/10/2026

### Inteligência artificial

- Usuários podem cadastrar, editar, ativar e remover suas próprias chaves de IA, separadas por provedor e modelo. As chaves são criptografadas no backend e exibidas mascaradas.
- O chat usa a chave pessoal ativa ou, ao conversar com um agente, a chave correspondente ao provedor e modelo escolhidos pelo agente.
- Os formulários de chaves pessoais e agentes permitem atualizar a lista de modelos com a chave informada e validam a compatibilidade entre provedor, credencial e modelo.
- O chat agora suporta OpenAI, Anthropic, Google, Groq, Cerebras e DeepSeek. Erros de bloqueio Cloudflare 1010 no Groq recebem uma mensagem de diagnóstico específica.

### Consultas DataJud e processos

- As telas de consulta dos ramos da Justiça usam o banner padrão do sistema, com título e descrição específicos de cada ramo.
- O modal **Novo Processo** identifica o tribunal pelo número CNJ completo e consulta os dados públicos no DataJud pelo backend.
- Quando o DataJud encontra o processo, classe, vara, tribunal e informações de assunto/data podem preencher os campos vazios do cadastro; os valores digitados pelo usuário são preservados.
- Falhas de consulta e processos não localizados exibem orientações, mantendo disponível o preenchimento manual.

## V. 1.2.0 — 26/10/2026

### Consultas DataJud e processos

- As telas de consulta dos ramos da Justiça usam o banner padrão do sistema, com título e descrição específicos de cada ramo.
- O modal **Novo Processo** identifica o tribunal pelo número CNJ completo e consulta os dados públicos no DataJud pelo backend.
- Quando o DataJud encontra o processo, classe, vara, tribunal e informações de assunto/data podem preencher os campos vazios do cadastro; os valores digitados pelo usuário são preservados.
- Falhas de consulta e processos não localizados exibem orientações, mantendo disponível o preenchimento manual.
## V. 1.1.0 — 22/10/2026

### Associação entre advogados e escritórios

- Advogados autônomos podem associar a conta usando o código fornecido pelo escritório; o backend valida as vagas disponíveis.
- O vínculo registra o identificador e o código do escritório no usuário. Quando não há vagas, a API orienta o contato com o escritório para regularizar a associação.
- A topbar exibe **Associado a: [nome do escritório]** e abre um modal com CNPJ, contato, endereço e código.
- Advogados associados mantêm os módulos disponíveis para advogados autônomos. A role Escritório pode acessar os módulos de trabalho e a equipe.
- A área de equipe apresenta o código de associação e instruções para compartilhá-lo.

## V. 1.0.0 — 20/10/2026

Primeira versão estável registrada do frontend Kealex.

### Incluído

- Acesso autenticado e áreas de processos, clientes, documentos, prazos e atividades.
- Gestão financeira, cobranças, usuários, audiências e intimações.
- Área administrativa, perfil do usuário e recursos de IA.
- Na tela de processos, a timeline fica visível na seção **Fase atual**, mostra o estado das fases e permite avançar a fase para usuários com permissão.
- Páginas públicas de apresentação, assinatura, termos e privacidade.

