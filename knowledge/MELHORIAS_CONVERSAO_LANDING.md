# Landing page Kealex — implementação atual

> Atualizado em 18/10/2026. Este documento descreve o código atual da landing page. Para a ordem das seções, links e componentes, consulte também [`LANDING_PAGE_ATUAL.md`](./LANDING_PAGE_ATUAL.md).

## Composição da página

A página pública é montada em `src/pages/site/LandingPage.tsx`. A ordem atual é:

1. Hero com o banner original da Kealex, sem os botões “Conheça a Plataforma” e “Explore nossas Soluções”.
2. Sobre a Kealex.
3. Soluções para escritórios e profissionais.
4. Demonstração, com espaço reservado para vídeo.
5. Recursos da plataforma.
6. Benefícios.
7. Exemplos demonstrativos em carrossel.
8. Simulador de ROI.
9. Planos e preços.
10. Perguntas frequentes.
11. Confiança e segurança.
12. CTA de teste gratuito.
13. Contato.
14. Rodapé e widget flutuante.

“Por dentro do KeaLex” (`PlatformShowcaseSection`) foi removida da página e do projeto. As seções Demonstração, Recursos e ROI continuam disponíveis.

## Navegação

O cabeçalho fixo acompanha a ordem de leitura: Sobre Nós, Soluções, Plataforma, Benefícios, Preços, FAQ e Contato. Plataforma abre os links Demonstração, Recursos e Simule ROI. O menu móvel mantém os mesmos destinos.

Os links de seção usam `src/components/site/navigation.ts`, que alinha o título da seção abaixo do topbar com recuo de 40 px. O banner continua usando `src/assets/banner_home_kealex.png`.

## Componentes relevantes

| Área | Componente |
|---|---|
| Página e ordem das seções | `src/pages/site/LandingPage.tsx` |
| Banner | `src/components/site/HeroSection.tsx` |
| Sobre | `src/components/site/AboutSection.tsx` |
| Soluções | `src/components/site/SolutionsSection.tsx` |
| Demonstração | `src/components/site/DemoSection.tsx` |
| Recursos | `src/components/site/FeaturesSection.tsx` |
| Benefícios | `src/components/site/BeforeAfterSection.tsx` |
| Exemplos demonstrativos | `src/components/site/TestimonialsSection.tsx` |
| Simulador de ROI | `src/components/site/ROICalculatorSection.tsx` |
| Planos | `src/components/site/PricingSection.tsx` |
| FAQ | `src/components/site/FAQSection.tsx` |
| Contato | `src/components/site/ContactSection.tsx` |
| Cabeçalho e rodapé | `src/components/site/SiteHeader.tsx`, `SiteFooter.tsx` |

## Comportamento e conteúdo

- O Hero usa o banner existente e não exibe os dois CTAs removidos.
- A seção Demonstração apresenta um placeholder até que o vídeo oficial seja fornecido.
- O ROI é calculado pelos dados preenchidos pelo visitante; a interface exibe aviso de que os resultados são estimativas, sem garantia de retorno.
- Os três cartões de depoimento são exemplos ilustrativos, identificados como conteúdo demonstrativo, sem nomes ou avaliações atribuídas a clientes.
- Planos, preços, condições, FAQ e texto institucional da seção Sobre são mantidos nos componentes existentes.
- O formulário de contato envia os dados para `/api/leads`, com origem `landing_contato`, e trata a resposta HTTP para mostrar sucesso ou erro. A configuração e disponibilidade do endpoint dependem do backend.
- O contato usa `contato@kealabs.com.br` e `www.kealex.com.br`. Não há número oficial de WhatsApp nem perfis sociais oficiais configurados no código.
- O rodapé mantém quatro colunas, links legais e dados de contato existentes.

## Verificações

Na atualização da landing page, `npm.cmd run build` passou. O lint dos arquivos alterados passou; o lint integral do repositório ainda reporta erros preexistentes fora do escopo da landing page. O build pode emitir um aviso de bundle principal maior que 500 kB.

## Pendências de conteúdo e integração

- Fornecer o vídeo demonstrativo oficial.
- Configurar um número oficial de WhatsApp e as redes sociais, se esses canais forem usados.
- Confirmar em ambiente integrado o contrato e a disponibilidade do endpoint `/api/leads`.
- Configurar proteção antispam no formulário, preferencialmente no servidor.
