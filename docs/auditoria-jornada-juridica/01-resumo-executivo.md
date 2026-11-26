# Resumo executivo — Auditoria da jornada jurídica

**Data da auditoria:** 25/11/2026  
**Escopo:** inspeção estática do frontend `kealex` e do backend `../hubKealex`, com verificações locais não destrutivas.  
**Critério:** documento “Auditoria Técnica e Funcional — Jornada Jurídica Kealex Legal Tech”.

## Diagnóstico

A Kealex já reúne módulos úteis de clientes, processos com fases, prazos, atividades, audiências, documentos genéricos, financeiro, consulta/acompanhamento processual, análise documental, IA, certidões e cobrança. Há persistência SQL e endpoints reais em vários domínios. Isso demonstra uma base de produto utilizável para operações pontuais do escritório.

A jornada jurídica completa ainda não está implementada. O produto começa a funcionar de forma mais consistente quando já existe cliente e número de processo. Atendimento, contratação, preparação de caso sem número CNJ, produção/revisão/versionamento de petições, protocolo, instrução, recursos, cumprimento de sentença e encerramento com relatório não têm fluxos de domínio correspondentes. Os módulos existentes tampouco formam uma visão única do caso.

**Maturidade global estimada: nível 2 — parcial.** A classificação considera o fluxo efetivamente conectado no código, e não apenas telas/endpoints. Não equivale a validação em produção: não houve acesso ao banco da organização nem chamadas a fornecedores.

## Pontos fortes encontrados

- O cadastro de clientes existente é reutilizado para seleção e vinculação em processos; há suporte a cadastro de pessoa física/jurídica e dados de endereço/contato.
- Há CRUD de processos, fases configuráveis, vínculo com cliente principal, múltiplos clientes e demais partes, com escopo de tenant em serviços centrais.
- O acompanhamento via Escavador mantém consulta, dados agregados e histórico de consultas no backend; DataJud é uma integração distinta para consulta por tribunal.
- A análise documental tem conversas, mensagens e arquivos persistidos, extração/organização de conteúdo e opção de integração com Google Drive.
- O sistema inclui KeaCredits para recargas e alguns serviços, além de histórico de cobrança; a política de custo não é transversal a todas as integrações.
- Existem serviços separados para processos, clientes, arquivos/documentos, financeiro, prazos, integrações, autenticação e atividades, além da aplicação central.

## Lacunas que impedem a jornada ponta a ponta

1. **Caso interno não existe como entidade separada:** o formulário exige `numero`, e `Processo.numero` é `nullable=False`. Não é possível abrir um atendimento/caso em preparação e só depois protocolar.
2. **Atendimento e contratação não existem como jornadas:** não há telas/entidades de atendimento, contrato, procuração, aceite ou assinatura vinculados ao cliente e ao caso.
3. **Não há módulo de petições:** documento genérico não fornece tipos processuais, editor jurídico, rascunho, revisão/aprovação, versionamento, anexos por peça ou relacionamento 1:N entre processo e petições.
4. **Upload de documento do processo é simulado:** `DocumentosPage.tsx` constrói uma URL `cdn.kealex.com.br` fictícia e persiste metadados; o botão de arquivo não envia os bytes ao storage. O backend central recebe uma URL, não um arquivo.
5. **Protocolo e distribuição não são registrados:** o número do processo não representa protocolo; faltam recibo, sistema, órgão, comarca, instância e dados de distribuição.
6. **Acompanhamento é separado da gestão do processo:** `processos_acompanhados` é outra entidade, indexada por escopo/tenant e número, sem vínculo com `processos.id`. A atualização pode consultar o Escavador e gerar custo externo sem evidência de débito transversal de KeaCredits.
7. **Algumas promessas de interface são protótipos:** o roteiro de audiência é texto fixo com atraso artificial, não chamada de IA; “Atualizar” em intimações apenas refaz a consulta ao backend, e não varre DJe.
8. **A composição backend/gateway é híbrida:** existem aplicação monolítica central e microserviços com modelos/tabelas e contratos por vezes duplicados. O gateway roteia somente alguns prefixos para serviços; vários caminhos continuam no fallback central.

## Riscos prioritários

- **Crítico — integridade documental:** a UI pode registrar como enviado um arquivo que nunca foi armazenado, quebrando prova, petição ou recuperação futura.
- **Crítico — confidencialidade operacional:** o cliente HTTP persiste JWT em `localStorage`; a API de atividades imprime payloads/respostas no console; middleware do backend de atividades registra corpos de requisição e resposta (diretriz registrada no próprio serviço). Dados jurídicos podem conter sigilo e dados pessoais.
- **Alto — autorização do portal de cliente a confirmar:** a listagem de processos para role `cliente` compara `processo.cliente_id` (identificador da entidade cliente) a `payload.sub` (identificador do usuário), sem uma associação visível entre esses IDs no modelo de processos. Isso pode impedir acesso legítimo ou exigir validação da regra no ambiente real.
- **Alto — automação processual ausente:** não há motor determinístico de prazos ligado a ciência/publicação e calendário forense, nem fluxo de revisão humana antes de protocolo.
- **Alto — consumo externo sem governança uniforme:** acompanhamento e chamadas de IA podem enviar conteúdo jurídico a terceiros; o controle de créditos não está demonstrado em todos os fluxos.

## Recomendação executiva

Não posicionar o estado atual como plataforma que cobre a jornada cível completa. É possível considerar piloto limitado de cadastro e acompanhamento **após** validar isolamento, armazenamento real de documentos, escopos de usuário/cliente e falhas dos endpoints. Para um piloto de operação jurídica, priorizar: segurança/logging, upload persistente, caso interno sem CNJ e detalhes centralizados, depois atendimento/contratação e petições com revisão/versionamento. Manter consulta externa e IA opt-in, com custo, fonte, data, consentimento/contrato e trilha de auditoria explícitos.

## Verificações realizadas e limites

- Inspeção de rotas, componentes, chamadas de API, modelos, gateway e arquivos de documentação nos dois repositórios.
- `tsc --noEmit` passou; `npm.cmd run lint` falhou com 162 erros e 7 avisos no repositório frontend. Os testes do backend não iniciaram por dependências ausentes no ambiente.
- Não foram lidos arquivos `.env`, consultados dados reais do banco ou executadas consultas tarifadas ao Escavador/DataJud/Serpro/FiscalAPI. O cenário jurídico foi avaliado por código, não executado com dados fictícios em uma instância isolada.
- A inspeção não certifica segurança, disponibilidade de produção ou conformidade legal/LGPD.

## Documentos

Consulte `02` a `10` para evidências e recomendações detalhadas; `11-relatorio-final.md` responde às perguntas finais da auditoria.
