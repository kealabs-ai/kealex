# Kealex Frontend — V. 1.2.0

**Data de registro:** 26 de outubro de 2026  
**Tipo:** versão incremental com novas funcionalidades  
**Identificador do pacote:** `kealex-front`

## Novidades

- As telas de consulta DataJud em `/integracao-orgaos/xxx` adotam o componente de banner padrão, com título e descrição por ramo da Justiça.
- No modal **Novo Processo**, o número CNJ completo identifica o tribunal e inicia uma consulta autenticada ao DataJud pelo backend.
- Quando houver resultado, os campos vazios de título, vara, tribunal e descrição são preenchidos com os dados públicos disponíveis. Os campos já preenchidos são preservados.
- Mensagens de consulta orientam o usuário quando o DataJud não retorna resultado ou não está disponível; o cadastro manual continua habilitado.

## Versão do pacote

O número `1.2.0` está registrado em `package.json` e `package-lock.json`, conforme SemVer.
