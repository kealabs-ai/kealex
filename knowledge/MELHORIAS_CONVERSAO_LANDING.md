# Melhorias de Conversão — Landing Page KeaLex

## Componentes criados

### `TestimonialsSection.tsx`
- Carrossel com 5 depoimentos de advogados fictícios (Trabalhista, Família, Autônomo)
- Avatares com iniciais + gradiente colorido por perfil
- Métricas de ROI em cada card ("2h/dia economizadas", "60% menos inadimplência")
- Selo "Validado por advogados autônomos e pequenos escritórios"
- Auto-play a cada 5,5s + controles manuais + mini-grid de seleção rápida
- `id="depoimentos"` para âncora no menu

### `PlatformShowcaseSection.tsx`
- Abas laterais com 3 telas simuladas da plataforma
- **Intimações IA**: alertas de prazo fatal, notificação WhatsApp simulada
- **Trabalhista & Família**: verbas rescisórias, vínculo empregatício, ritos
- **Portal do Cliente**: upload de documentos sigilosos, status por arquivo
- Browser mockup com URL dinâmica por aba
- `id="plataforma"` para âncora no menu

### `TrustSection.tsx`
- 6 cards de segurança: criptografia, LGPD, AWS, auditoria, sigilo, uptime
- Barra de selos: TLS 1.3, LGPD Compliant, AWS, AES-256, ISO 27001, OAB Compatible
- Fundo escuro (#081B33) para contraste e autoridade
- `id="seguranca"`

### `PricingSection.tsx` (reescrito)
- 2 planos principais: **Autônomo · Solo** (R$197/mês) e **Escritório · Crescimento** (R$397/mês)
- Plano Enterprise com "Sob consulta"
- ROI framing em cada plano (texto persuasivo de valor)
- Toggle mensal/anual com -15%
- CTA: "Começar Teste Grátis de 7 Dias →"
- Subtexto: "Sem cartão de crédito · Cancele quando quiser"
- Garantia de 7 dias

## Componentes atualizados

### `HeroSection.tsx`
- CTA: "Começar Teste Grátis de 7 Dias" (era "Testar Grátis por 14 Dias")
- Subtexto adicionado abaixo dos botões

### `TrialSection.tsx`
- CTA modal: "Começar Teste Grátis de 7 Dias"
- Header do modal atualizado

### `SiteHeader.tsx`
- Menu atualizado: Benefícios · Diagnóstico · Depoimentos · Plataforma · Recursos · Preços · FAQ

## Ordem das seções em `LandingPage.tsx`
```
HeroSection
DiagnosticoSection
BeforeAfterSection
TestimonialsSection      ← novo
FeaturesSection
PlatformShowcaseSection  ← novo
AISimulatorSection
ROICalculatorSection
PricingSection           ← reescrito
TrustSection             ← novo
FAQSection
TrialSection
SiteFooter
KeaLexAdvisorWidget (flutuante)
```
