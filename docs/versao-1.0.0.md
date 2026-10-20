# Kealex Frontend — V. 1.0.0

**Data de registro:** 20 de outubro de 2026  
**Tipo:** primeira versão estável  
**Identificador do pacote:** `kealex-front`

## Sobre esta versão

A V. 1.0.0 estabelece a primeira versão estável identificada do frontend Kealex. O número da versão fica definido no `package.json` e no `package-lock.json`, mantendo o manifesto e o lockfile sincronizados.

## Escopo funcional

O frontend reúne as áreas autenticadas de processos, clientes, documentos, prazos, atividades, financeiro, cobranças, usuários, administração, inteligência artificial, intimações, audiências e perfil. Também inclui páginas públicas de apresentação, assinatura, termos de uso e privacidade.

Na página de processos, a timeline está conectada à seção **Fase atual**. Ela recebe as fases e o índice atual do processo, apresenta o estado de cada etapa e chama a ação de avanço quando o usuário autorizado solicita a próxima fase.

## Convenção para próximas versões

As próximas versões devem seguir SemVer:

- **MAJOR** (`2.0.0`): mudanças incompatíveis para quem integra ou usa o frontend.
- **MINOR** (`1.1.0`): novas funcionalidades compatíveis com a versão anterior.
- **PATCH** (`1.0.1`): correções compatíveis, sem novas funcionalidades de escopo maior.

Cada publicação deve atualizar o campo `version` nos dois arquivos de pacote e registrar as mudanças no `CHANGELOG.md`. Este documento serve como registro da linha de base da V. 1.0.0.

