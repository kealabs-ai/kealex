# KeaLex Advisor Widget & Diagnóstico Section

## Componentes criados

### `src/components/site/KeaLexAdvisorWidget.tsx`
Widget flutuante no canto inferior direito com chat guiado de 3 etapas:
- **Step welcome** — 4 chips clicáveis com as dores do advogado
- **Step answer** — resposta personalizada com efeito "digitando..."
- **Step form** — captura de nome + e-mail/WhatsApp
- **Step done** — mensagem de sucesso

Extras: nudge balloon após 8s sem interação, badge de notificação laranja, animação de pulso no CTA.

### `src/components/site/DiagnosticoSection.tsx`
Seção inline posicionada logo após o HeroSection com layout 2 colunas:
- Coluna esquerda: 4 cards clicáveis (opções de gargalo)
- Coluna direita: resposta dinâmica da IA com formulário de captura acoplado

## Integração em `LandingPage.tsx`
```
<HeroSection />
<DiagnosticoSection />   ← novo
<BeforeAfterSection />
...
<SiteFooter />
<KeaLexAdvisorWidget />  ← novo (flutuante)
```

## Endpoint de leads
Ambos os componentes fazem `POST /api/leads` com payload:
```json
{ "nome": "...", "contato": "...", "origem": "widget_advisor | diagnostico_section" }
```
Falha silenciosa — não bloqueia o fluxo do usuário.

## CSS adicionado em `index.css`
```css
@keyframes pulse-cta { ... }
.animate-pulse-cta { animation: pulse-cta 2s ease-in-out infinite; }
```
