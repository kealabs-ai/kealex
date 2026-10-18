# Landing page Kealex: estado atual

Atualizado em 18/10/2026. Este é o documento de referência para a composição pública atual. O ponto de entrada é `src/pages/site/LandingPage.tsx`.

## Ordem das seções

1. Hero (`inicio`): banner original com mascote. Os botões “Conheça a Plataforma” e “Explore nossas Soluções” foram removidos.
2. Sobre a Kealex (`sobre-nos`).
3. Soluções (`solucoes`).
4. Demonstração (`demonstracao`): placeholder responsivo 16:9; vídeo oficial ainda não fornecido.
5. Recursos da plataforma (`recursos`).
6. Benefícios (`beneficios`).
7. Depoimentos (`depoimentos`): três exemplos demonstrativos, identificados como ilustrativos.
8. Simulador de ROI (`roi`): cálculo automático baseado nos campos preenchidos e aviso de estimativa.
9. Planos e preços (`precos`): planos e fluxos de contratação existentes.
10. FAQ (`faq`): perguntas e respostas mantidas em accordion.
11. Confiança e segurança (`seguranca`).
12. CTA de teste (`trial`).
13. Contato (`contato`).
14. Rodapé e widget Kealex Advisor.

A seção “Por dentro do KeaLex” foi removida do site e o componente `PlatformShowcaseSection.tsx` não faz mais parte do projeto. A seção Soluções continua na página.

## Navegação

O cabeçalho fixo apresenta os links na ordem: Sobre Nós, Soluções, Plataforma, Benefícios, Preços, FAQ e Contato. O submenu Plataforma leva a Demonstração, Recursos e Simule ROI. Desktop e mobile usam os mesmos destinos.

`src/components/site/navigation.ts` alinha o título da seção a 40 px abaixo do topbar ao navegar por uma âncora. O rodapé mantém quatro colunas e links para as seções, termos e privacidade.

## Componentes da landing

| Seção | Arquivo |
|---|---|
| Hero | `src/components/site/HeroSection.tsx` |
| Sobre | `src/components/site/AboutSection.tsx` |
| Soluções | `src/components/site/SolutionsSection.tsx` |
| Demonstração | `src/components/site/DemoSection.tsx` |
| Recursos | `src/components/site/FeaturesSection.tsx` |
| Benefícios | `src/components/site/BeforeAfterSection.tsx` |
| Depoimentos demonstrativos | `src/components/site/TestimonialsSection.tsx` |
| ROI | `src/components/site/ROICalculatorSection.tsx` |
| Preços | `src/components/site/PricingSection.tsx` |
| FAQ | `src/components/site/FAQSection.tsx` |
| Contato | `src/components/site/ContactSection.tsx` |
| Navegação e rodapé | `src/components/site/SiteHeader.tsx`, `SiteFooter.tsx` |

## Contatos e integrações

- E-mail comercial publicado: `contato@kealabs.com.br`.
- Site: `www.kealex.com.br`.
- WhatsApp oficial e redes sociais não estão configurados no código; não publicar dados presumidos.
- Formulário envia para `/api/leads` com origem `landing_contato`, bloqueia novo envio enquanto está enviando e exibe sucesso/erro pela resposta HTTP. A disponibilidade do endpoint deve ser confirmada no backend.
- O formulário ainda depende de proteção antispam no servidor.

## Pendências de conteúdo

- Fornecer e configurar o vídeo oficial da demonstração.
- Configurar WhatsApp e redes sociais oficiais, caso sejam canais desejados.
- Validar o endpoint de leads no ambiente integrado e completar a proteção antispam.

## Verificação de implementação

`npm.cmd run build` passou após a remoção da seção “Por dentro do KeaLex”. O build emite um aviso de que o bundle JavaScript principal supera 500 kB.
